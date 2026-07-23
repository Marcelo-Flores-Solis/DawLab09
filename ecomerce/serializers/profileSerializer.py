from rest_framework import serializers
from ecomerce.models.profile import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['dni', 'nombres', 'apellidos', 'telefono', 'correo', 'fecha_nacimiento', 'saldo']
        # La unicidad del DNI se valida a mano (abajo) para no chocar con los
        # perfiles que todavía lo tienen vacío (null). El saldo es dinero de
        # prueba: el cliente lo ve pero no lo edita (sólo baja al comprar).
        read_only_fields = ['saldo']
        extra_kwargs = {'dni': {'validators': []}}

    def validate_dni(self, value):
        if not value:
            return None
        if not (value.isdigit() and len(value) == 8):
            raise serializers.ValidationError('El DNI debe tener exactamente 8 dígitos.')
        qs = Profile.objects.filter(dni=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Ese DNI ya está registrado por otro usuario.')
        return value

    def validate_telefono(self, value):
        if not value:
            return ''
        if not (value.isdigit() and len(value) == 9):
            raise serializers.ValidationError('El teléfono debe tener 9 dígitos.')
        return value

    def validate_nombres(self, value):
        return value.strip()

    def validate_apellidos(self, value):
        return value.strip()
