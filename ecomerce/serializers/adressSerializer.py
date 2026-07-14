from rest_framework import serializers
from ecomerce.models.adress import Address
from ecomerce.peru_geo import DEPARTAMENTOS

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        # El cliente no envía su `usuario`: se toma del token en la vista. Así el
        # formulario de la tienda sólo pide calle/departamento/provincia.
        extra_kwargs = {'usuario': {'required': False}}

    def validate(self, attrs):
        # Sólo se aceptan ubicaciones reales del Perú. La columna `provincia`
        # guarda el departamento y `ciudad` guarda la provincia (ver peru_geo).
        departamento = attrs.get('provincia')
        provincia = attrs.get('ciudad')
        if departamento is not None or provincia is not None:
            if departamento not in DEPARTAMENTOS:
                raise serializers.ValidationError(
                    {'provincia': 'Selecciona un departamento válido del Perú.'}
                )
            if provincia not in DEPARTAMENTOS[departamento]:
                raise serializers.ValidationError(
                    {'ciudad': 'Selecciona una provincia válida para ese departamento.'}
                )
        return attrs
