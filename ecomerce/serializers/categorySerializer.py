from rest_framework import serializers
from ecomerce.models.category import Category
from .productSerializer import ProductSerializer

class CategorySerializer(serializers.ModelSerializer):
  
    productos = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = '__all__'