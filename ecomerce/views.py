from collections import defaultdict

from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import *
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    OrderSerializer,
    OrderDetailSerializer,
    AddressSerializer,
)
from .serializers.checkoutSerializer import CheckoutSerializer
from .serializers.tokenSerializer import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    # prefetch_related evita el N+1 al serializar los productos anidados.
    queryset = Category.objects.prefetch_related('productos').order_by('id')
    serializer_class = CategorySerializer

    def get_permissions(self):
        # Catálogo público de sólo lectura; escritura sólo para staff.
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('categoria').order_by('id')
    serializer_class = ProductSerializer
    # Búsqueda por nombre/descripción y ordenamiento configurables por query param
    # (?search=..., ?ordering=precio). El filtro por categoría se resuelve abajo.
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['precio', 'nombre', 'id']
    ordering = ['id']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Product.objects.select_related('categoria').order_by('id')
        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria_id=categoria)
        return qs


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

            for pid, cantidad in cantidades.items():
                producto = productos[pid]
                if producto.stock < cantidad:
                    raise ValidationError(
                        f'Stock insuficiente para "{producto.nombre}": '
                        f'quedan {producto.stock} y pediste {cantidad}.'
                    )

            order = Order.objects.create(
                usuario=request.user, estado='pendiente', direccion=direccion,
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

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailViewSet(viewsets.ModelViewSet):
    queryset = OrderDetail.objects.all()
    serializer_class = OrderDetailSerializer

    def get_permissions(self):
        # Igual que los pedidos: el cliente sólo agrega líneas al crear su
        # pedido; editar o borrar líneas queda reservado al staff.
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = OrderDetail.objects.select_related('producto', 'pedido').order_by('id')
        user = self.request.user
        if user.is_staff:
            return qs
        return qs.filter(pedido__usuario=user)

    def perform_create(self, serializer):
        pedido = serializer.validated_data.get('pedido')
        producto = serializer.validated_data.get('producto')
        user = self.request.user
        if not user.is_staff and pedido is not None and pedido.usuario_id != user.id:
            raise PermissionDenied('No puedes agregar productos a un pedido que no es tuyo.')
        # El precio se fija en el servidor desde el producto (no del cliente).
        detalle = serializer.save(precio_unitario=producto.precio)
        detalle.pedido.recalcular_total()

    def perform_update(self, serializer):
        detalle = serializer.save()
        # Mantener el precio alineado al producto y recalcular subtotal/total.
        detalle.precio_unitario = detalle.producto.precio
        detalle.save()
        detalle.pedido.recalcular_total()

    def perform_destroy(self, instance):
        pedido = instance.pedido
        instance.delete()
        pedido.recalcular_total()


class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Address.objects.select_related('usuario').order_by('id')
        user = self.request.user
        if user.is_staff:
            return qs
        return qs.filter(usuario=user)

    def perform_create(self, serializer):
        # El cliente siempre crea a su propio nombre (usuario del token). El
        # staff puede crear para otro usuario si lo indica; si no, para sí mismo.
        if self.request.user.is_staff and serializer.validated_data.get('usuario'):
            serializer.save()
        else:
            serializer.save(usuario=self.request.user)
