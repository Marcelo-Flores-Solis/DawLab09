from rest_framework import serializers


class CheckoutItemSerializer(serializers.Serializer):
    """Una línea del carrito tal como la envía el frontend: el id del producto,
    la cantidad y, opcionalmente, el precio que el cliente tiene a la vista.

    El precio real SIEMPRE se toma del producto en el servidor; `precio_unitario`
    sólo se usa para detectar carritos desactualizados y avisar antes de cobrar
    (nunca para fijar el importe)."""

    producto = serializers.IntegerField(min_value=1)
    cantidad = serializers.IntegerField(min_value=1)
    precio_unitario = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False,
    )


class CheckoutSerializer(serializers.Serializer):
    """Cuerpo del endpoint de checkout: las líneas del carrito y, opcionalmente,
    la dirección de envío elegida.

    `allow_empty=False` evita crear pedidos vacíos. La dirección se valida en la
    vista (debe pertenecer al usuario).
    """

    items = CheckoutItemSerializer(many=True, allow_empty=False)
    direccion = serializers.IntegerField(required=False, allow_null=True)
