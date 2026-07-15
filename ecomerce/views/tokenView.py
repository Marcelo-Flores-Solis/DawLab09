from rest_framework_simplejwt.views import TokenObtainPairView

from ecomerce.serializers.tokenSerializer import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login JWT (/api/token/) con los claims extra del serializer."""

    serializer_class = CustomTokenObtainPairSerializer
