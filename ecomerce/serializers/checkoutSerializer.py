from rest_framework import serializers


class CheckoutItemSerializer(serializers.Serializer):
    """Una línea del carrito tal como la envía el frontend: sólo el id del
    producto y la cantidad. El precio NO se acepta del cliente (se toma del
    producto en el servidor)."""

    producto = serializers.IntegerField(min_value=1)
    cantidad = serializers.IntegerField(min_value=1)


class CheckoutSerializer(serializers.Serializer):
    """Cuerpo del endpoint de checkout: las líneas del carrito y, opcionalmente,
    la dirección de envío elegida.

    `allow_empty=False` evita crear pedidos vacíos. La dirección se valida en la
    vista (debe pertenecer al usuario).
    """

    items = CheckoutItemSerializer(many=True, allow_empty=False)
    direccion = serializers.IntegerField(required=False, allow_null=True)
