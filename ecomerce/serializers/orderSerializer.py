from rest_framework import serializers
from ecomerce.models.order import Order
from .order_detailSerializer import OrderDetailSerializer
from .adressSerializer import AddressSerializer

class OrderSerializer(serializers.ModelSerializer):

    detalles = OrderDetailSerializer(many=True, read_only=True)

    # Campos de sólo lectura que exponen datos legibles para el panel admin y la
    # vista del cliente: el nombre de usuario del comprador y la dirección de
    # envío completa. `usuario` y `direccion` siguen siendo IDs escribibles, de
    # modo que el staff puede reasignar el comprador o la dirección de un pedido.
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    direccion_detalle = AddressSerializer(source='direccion', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        # El total lo calcula el servidor a partir de los detalles.
        read_only_fields = ['total', 'fecha']