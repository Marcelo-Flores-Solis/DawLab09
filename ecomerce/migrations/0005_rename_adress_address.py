from django.db import migrations


class Migration(migrations.Migration):
    """Renombra el modelo Adress -> Address SÓLO en el estado de Django.

    El usuario decidió no cambiar la base de datos, así que mantenemos la tabla
    original ``ecomerce_adress`` (vía ``db_table`` en el modelo) y no ejecutamos
    ninguna operación de esquema: ``database_operations`` va vacío. Aplicar esta
    migración no modifica datos ni estructura; la app funciona igual con o sin
    ella. (El cambio orderDetail -> OrderDetail es sólo de mayúsculas y Django
    lo identifica por el nombre en minúsculas, por lo que no requiere migración.)
    """

    dependencies = [
        ('ecomerce', '0004_product_imagen'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RenameModel(old_name='Adress', new_name='Address'),
                migrations.AlterModelTable(name='address', table='ecomerce_adress'),
            ],
            database_operations=[],
        ),
    ]
