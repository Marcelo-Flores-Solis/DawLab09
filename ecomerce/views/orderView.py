from collections import defaultdict

from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from ecomerce.models import Address, Order, OrderDetail, Product, Profile
from ecomerce.serializers import OrderSerializer
from ecomerce.serializers.checkoutSerializer import CheckoutSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-id')
    serializer_class = OrderSerializer

    def get_permissions(self):
        # Un cliente puede crear y ver sus pedidos, pero NO modificarlos ni
        # eliminarlos: una vez creado, el pedido es inmutable para él. Sólo
        # el staff puede editar un pedido (por si hay un inconveniente externo).
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # select_related/prefetch_related evitan el N+1 al serializar el usuario
        # y las líneas (con su producto) de cada pedido.
        qs = (
            Order.objects
            .select_related('usuario')
            .prefetch_related('detalles__producto')
            .order_by('-id')
        )
        user = self.request.user
        if user.is_staff:
            return qs
        return qs.filter(usuario=user)

    def perform_create(self, serializer):
        # Un cliente sólo puede crear pedidos a su propio nombre; el staff
        # puede crearlos para cualquier usuario (panel de administración).
        if self.request.user.is_staff:
            serializer.save()
        else:
            serializer.save(usuario=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def checkout(self, request):
        """Confirma el carrito como un único pedido, de forma atómica.

        Recibe ``{"items": [{"producto": id, "cantidad": n}, ...]}``. Todo el
        pedido se crea dentro de una transacción: si algo falla (por ejemplo,
        stock insuficiente), no queda ningún pedido a medias. Además:

        * el usuario se toma del token (un cliente sólo compra a su nombre);
        * el precio unitario se toma del producto en el servidor;
        * el stock se valida y se descuenta bloqueando las filas
          (``select_for_update``) para evitar sobreventa en compras concurrentes.
        """
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data['items']
        direccion_id = serializer.validated_data.get('direccion')
        metodo_pago = serializer.validated_data.get('metodo_pago', 'credito')

        # Por ahora sólo se puede pagar con el crédito simulado. PayPal está en
        # la interfaz como método guardado, pero todavía no procesa compras.
        if metodo_pago != 'credito':
            raise ValidationError(
                'PayPal todavía no está disponible. Completa tu compra con tu crédito.'
            )

        # La dirección de envío (si se envía) debe pertenecer al usuario: nadie
        # puede enviar un pedido a la dirección guardada de otra persona.
        direccion = None
        if direccion_id is not None:
            try:
                direccion = Address.objects.get(pk=direccion_id)
            except Address.DoesNotExist:
                raise ValidationError('La dirección indicada no existe.')
            if not request.user.is_staff and direccion.usuario_id != request.user.id:
                raise PermissionDenied('Esa dirección no te pertenece.')

        # Consolidamos cantidades por producto (si el carrito trae líneas
        # repetidas del mismo producto, se suman).
        cantidades = defaultdict(int)
        for item in items:
            cantidades[item['producto']] += item['cantidad']

        with transaction.atomic():
            productos = {
                p.id: p
                for p in Product.objects.select_for_update().filter(id__in=cantidades.keys())
            }

            faltantes = [pid for pid in cantidades if pid not in productos]
            if faltantes:
                raise ValidationError(f'Producto(s) inexistente(s): {faltantes}')

            # Aviso de precio desactualizado: si el cliente muestra un precio
            # distinto al actual, abortamos (409) para que revise y confirme el
            # precio nuevo. Nunca le cobramos de más sin avisar.
            cambios = []
            for item in items:
                esperado = item.get('precio_unitario')
                producto = productos[item['producto']]
                if esperado is not None and esperado != producto.precio:
                    cambios.append({
                        'producto': producto.id,
                        'nombre': producto.nombre,
                        'precio_anterior': str(esperado),
                        'precio_actual': str(producto.precio),
                    })
            if cambios:
                return Response(
                    {
                        'detail': 'Los precios de algunos productos cambiaron. '
                                  'Revisa tu carrito y confirma de nuevo.',
                        'precios_actualizados': cambios,
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            for pid, cantidad in cantidades.items():
                producto = productos[pid]
                if producto.stock < cantidad:
                    raise ValidationError(
                        f'Stock insuficiente para "{producto.nombre}": '
                        f'quedan {producto.stock} y pediste {cantidad}.'
                    )

            # Total previsto, para validar el crédito antes de tocar el stock.
            total = sum(
                productos[pid].precio * cantidad for pid, cantidad in cantidades.items()
            )

            # Cobro con crédito simulado: bloqueamos el perfil (evita doble gasto
            # en compras concurrentes) y comprobamos que alcance.
            profile, _ = Profile.objects.select_for_update().get_or_create(
                user=request.user
            )
            if profile.saldo < total:
                raise ValidationError(
                    f'Crédito insuficiente: tienes S/ {profile.saldo:.2f} y el '
                    f'total es S/ {total:.2f}.'
                )

            order = Order.objects.create(
                usuario=request.user,
                estado='pagado',
                direccion=direccion,
                metodo_pago=metodo_pago,
            )
            for pid, cantidad in cantidades.items():
                producto = productos[pid]
                OrderDetail.objects.create(
                    pedido=order,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario=producto.precio,
                )
                producto.stock -= cantidad
                producto.save(update_fields=['stock'])

            order.recalcular_total()

            # Descontamos el crédito una vez confirmado el total real del pedido.
            profile.saldo -= order.total
            profile.save(update_fields=['saldo'])

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
