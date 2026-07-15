from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from ecomerce.models import OrderDetail
from ecomerce.serializers import OrderDetailSerializer


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
