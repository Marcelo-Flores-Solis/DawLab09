from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import *
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    OrderSerializer,
    OrderDetailSerializer,
    AdressSerializer,
)
from .serializers.tokenSerializer import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategorySerializer

    def get_permissions(self):
        # Catálogo público de sólo lectura; escritura sólo para staff.
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


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
        qs = Order.objects.all().order_by('-id')
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


class OrderDetailViewSet(viewsets.ModelViewSet):
    queryset = orderDetail.objects.all()
    serializer_class = OrderDetailSerializer

    def get_permissions(self):
        # Igual que los pedidos: el cliente sólo agrega líneas al crear su
        # pedido; editar o borrar líneas queda reservado al staff.
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = orderDetail.objects.all()
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


class AdressViewSet(viewsets.ModelViewSet):
    queryset = Adress.objects.all()
    serializer_class = AdressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Adress.objects.all()
        user = self.request.user
        if user.is_staff:
            return qs
        return qs.filter(usuario=user)

    def perform_create(self, serializer):
        if self.request.user.is_staff:
            serializer.save()
        else:
            serializer.save(usuario=self.request.user)
