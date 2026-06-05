from django.db import models
from django.contrib.auth.models import User


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

    def __str__(self):
        return f"Pedido #{self.id} - {self.usuario.username}"