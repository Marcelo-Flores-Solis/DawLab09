from rest_framework import serializers
from ecomerce.models.adress import Adress

class AdressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adress
        fields = '__all__'