from rest_framework import serializers
from ecomerce.models.orderDetail import orderDetail

class OrderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = orderDetail
        fields = '__all__'