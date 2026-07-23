from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    """Datos personales del usuario (además de su cuenta de acceso).

    Se crea vacío la primera vez que se consulta y el cliente lo va
    completando. El DNI es único (permitiendo nulos mientras no se llene).
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    dni = models.CharField(max_length=8, unique=True, null=True, blank=True)
    nombres = models.CharField(max_length=100, blank=True, default='')
    apellidos = models.CharField(max_length=100, blank=True, default='')
    telefono = models.CharField(max_length=9, blank=True, default='')
    correo = models.EmailField(blank=True, default='')
    fecha_nacimiento = models.DateField(null=True, blank=True)

    # Crédito simulado (billetera de pruebas). Cada cuenta arranca con 5000 para
    # poder probar las compras; el checkout descuenta de aquí.
    saldo = models.DecimalField(max_digits=10, decimal_places=2, default=5000)

    def __str__(self):
        return f"Perfil de {self.user.username}"
