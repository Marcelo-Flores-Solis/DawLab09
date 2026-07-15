from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import AllowAny, IsAdminUser

from ecomerce.models import Product
from ecomerce.serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('categoria').order_by('id')
    serializer_class = ProductSerializer
    # Búsqueda por nombre/descripción y ordenamiento configurables por query param
    # (?search=..., ?ordering=precio). El filtro por categoría se resuelve abajo.
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['precio', 'nombre', 'id']
    ordering = ['id']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Product.objects.select_related('categoria').order_by('id')
        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria_id=categoria)
        return qs
