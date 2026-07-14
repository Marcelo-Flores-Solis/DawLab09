from rest_framework import serializers
from ecomerce.models.category import Category
from ecomerce.models.product import Product


class CategoryProductSerializer(serializers.ModelSerializer):
    """Versión ligera del producto para anidar dentro de la categoría.

    El listado de categorías sólo necesita mostrar id/nombre/precio/stock de
    cada producto; serializar el objeto completo (descripción, imagen de hasta
    500 caracteres, fechas, etc.) por cada producto y categoría inflaba mucho
    la respuesta.
    """

    class Meta:
        model = Product
        fields = ['id', 'nombre', 'precio', 'stock']


class CategorySerializer(serializers.ModelSerializer):

    productos = CategoryProductSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = '__all__'
