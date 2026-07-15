from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from ecomerce.models import Profile
from ecomerce.serializers import ProfileSerializer


class ProfileView(RetrieveUpdateAPIView):
    """Perfil del usuario autenticado (GET / PUT / PATCH sobre /api/profile/).

    Siempre opera sobre el perfil del usuario del token; si aún no existe, se
    crea vacío al primer acceso.
    """

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile
