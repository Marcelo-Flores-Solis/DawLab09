from rest_framework import serializers
from ecomerce.models.adress import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        # El cliente no envía su `usuario`: se toma del token en la vista. Así el
        # formulario de la tienda sólo pide calle/ciudad/provincia.
        extra_kwargs = {'usuario': {'required': False}}
