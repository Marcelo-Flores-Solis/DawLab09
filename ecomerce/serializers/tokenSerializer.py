from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Agrega el rol (is_staff) y el username a los claims del token, para que
    el frontend pueda decidir el acceso al panel de administración sin
    exponer un endpoint extra."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        token['username'] = user.username
        return token
