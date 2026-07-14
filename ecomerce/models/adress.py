from django.db import models
from django.contrib.auth.models import User


class Address(models.Model):

    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    calle = models.CharField(max_length=200)
    ciudad = models.CharField(max_length=100)
    provincia = models.CharField(max_length=100)

    class Meta:
        # Mantenemos el nombre de tabla original para no requerir una migración
        # de datos: sólo se renombró la clase de Python (Adress -> Address).
        db_table = 'ecomerce_adress'

    # No normalizamos ciudad/provincia: ahora llegan como valores canónicos de
    # un desplegable validado (departamentos y provincias reales del Perú).

    def __str__(self):
        return f"{self.usuario.username} - {self.ciudad}"
