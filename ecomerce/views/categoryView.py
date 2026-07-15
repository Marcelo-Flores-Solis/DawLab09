from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from ecomerce.models import Category
from ecomerce.serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    # prefetch_related evita el N+1 al serializar los productos anidados.
    queryset = Category.objects.prefetch_related('productos').order_by('id')
    serializer_class = CategorySerializer

    def get_permissions(self):
        # Catálogo público de sólo lectura; escritura sólo para staff.
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
