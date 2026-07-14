from django.db import models
from django.db.models import Sum
from django.contrib.auth.models import User

from .adress import Address


class Order(models.Model):

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('enviado', 'Enviado'),
    ]

    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    # Dirección de envío elegida en el checkout. Nullable para no romper pedidos
    # antiguos; SET_NULL para conservar el historial del pedido aunque el
    # cliente borre luego la dirección.
    direccion = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pedidos',
    )

    fecha = models.DateTimeField(auto_now_add=True)

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='pendiente'
    )

    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    def recalcular_total(self):
        """Recalcula el total sumando los subtotales de los detalles.

        El total nunca se confía al cliente: se calcula en el servidor a
        partir de las líneas del pedido, evitando que se pueda falsear.
        """
        self.total = self.detalles.aggregate(s=Sum('subtotal'))['s'] or 0
        self.save(update_fields=['total'])

    def __str__(self):
        return f"Pedido #{self.id} - {self.usuario.username}"