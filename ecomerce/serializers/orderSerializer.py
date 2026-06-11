from rest_framework import serializers
from ecomerce.models.order import Order
from .order_detailSerializer import OrderDetailSerializer

class OrderSerializer(serializers.ModelSerializer):
   
    detalles = OrderDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'