from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

from ecomerce.serializers.registerSerializer import RegisterSerializer


class RegisterView(CreateAPIView):
    """Registro público de clientes (/api/register/). No requiere sesión."""

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
