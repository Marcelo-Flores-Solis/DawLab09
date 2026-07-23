from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    """Alta de una cuenta de cliente. Sólo pide usuario, contraseña y (opcional)
    correo; la contraseña se guarda cifrada y nunca se devuelve."""

    password = serializers.CharField(
        write_only=True,
        min_length=6,
        validators=[validate_password],
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'email': {'required': False, 'allow_blank': True}}

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Ese usuario ya está registrado.')
        return value

    def create(self, validated_data):
        # create_user cifra la contraseña; nunca la guardamos en texto plano.
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
