from rest_framework.pagination import PageNumberPagination


class DefaultPagination(PageNumberPagination):
    """Paginación por defecto de la API.

    Acota el tamaño de las respuestas de listado (antes se devolvía el catálogo
    completo en una sola respuesta). El cliente puede pedir otro tamaño con
    ``?page_size=`` hasta un máximo, para no dejar que un consumidor externo
    solicite todo de golpe.
    """

    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100
