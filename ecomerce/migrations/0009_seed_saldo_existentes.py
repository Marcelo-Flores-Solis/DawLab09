from django.db import migrations
from decimal import Decimal


def seed_saldo(apps, schema_editor):
    """Da 5000 de crédito simulado a todas las cuentas ya creadas.

    Crea el perfil para quien no lo tenga y fija saldo=5000 en los existentes,
    para que todas las cuentas actuales puedan probar las compras.
    """
    User = apps.get_model('auth', 'User')
    Profile = apps.get_model('ecomerce', 'Profile')

    for user in User.objects.all():
        Profile.objects.update_or_create(
            user=user,
            defaults={'saldo': Decimal('5000')},
        )


def undo(apps, schema_editor):
    # No revertimos el saldo (es dinero de prueba); no-op.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('ecomerce', '0008_order_metodo_pago_profile_saldo'),
    ]

    operations = [
        migrations.RunPython(seed_saldo, undo),
    ]
