from django.db import models
from django.core.exceptions import ValidationError
from .category import Category


def validar_precio(valor):
    if valor <= 0:
        raise ValidationError("El precio debe ser mayor a 0")


def validar_stock(valor):
    if valor < 0:
        raise ValidationError("El stock no puede ser negativo")


class Product(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[validar_precio]
    )
    stock = models.IntegerField(validators=[validar_stock])
    categoria = models.ForeignKey(
        Category,
        on_delete=models.CASCADE
    )
    creado = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.nombre = self.nombre.title()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} - S/. {self.precio}"