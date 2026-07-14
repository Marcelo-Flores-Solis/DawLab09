from rest_framework import serializers
from ecomerce.models.orderDetail import OrderDetail

class OrderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderDetail
        fields = '__all__'
        # El precio se toma del producto en el servidor y el subtotal se
        # calcula solo; el cliente nunca los envía (no se pueden falsear).
        read_only_fields = ['precio_unitario', 'subtotal']
