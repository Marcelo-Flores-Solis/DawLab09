from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from ecomerce.models import Address
from ecomerce.serializers import AddressSerializer


class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Address.objects.select_related('usuario').order_by('id')
        user = self.request.user
        if user.is_staff:
            return qs
        return qs.filter(usuario=user)

    def perform_create(self, serializer):
        # El cliente siempre crea a su propio nombre (usuario del token). El
        # staff puede crear para otro usuario si lo indica; si no, para sí mismo.
        if self.request.user.is_staff and serializer.validated_data.get('usuario'):
            serializer.save()
        else:
            serializer.save(usuario=self.request.user)
