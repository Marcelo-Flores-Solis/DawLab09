import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from ecomerce.models import Product, Order
from ecomerce.models.orderDetail import OrderDetail

# Limpia los pedidos parciales creados antes del error
OrderDetail.objects.all().delete()
Order.objects.all().delete()

# Productos releídos de la BD (precio ya es Decimal)
by_name = {p.nombre.upper(): p for p in Product.objects.all()}


def make_order(user, estado, lineas):
    o = Order.objects.create(usuario=user, estado=estado)
    for nombre_upper, cant in lineas:
        prod = by_name[nombre_upper]
        OrderDetail.objects.create(
            pedido=o, producto=prod, cantidad=cant,
            precio_unitario=prod.precio,
        )
    o.recalcular_total()
    return o


cliente = User.objects.filter(username='Cliente').first() or \
    User.objects.filter(is_staff=False).first() or User.objects.first()
otro = User.objects.exclude(pk=cliente.pk).first() or cliente

orders = [
    make_order(cliente, 'pagado', [("SAMSUNG GALAXY S24 ULTRA", 1), ("AIRPODS PRO 2", 1)]),
    make_order(cliente, 'enviado', [("MACBOOK AIR M3", 1)]),
    make_order(otro, 'pendiente', [("LG ULTRAGEAR 27", 2), ("TECLADO MECANICO REDRAGON", 1)]),
]
for o in orders:
    print(f"  Pedido #{o.id} · {o.usuario.username} · {o.estado} · total S/ {o.total}")

print("OK -> pedidos:", Order.objects.count(), "| detalles:", OrderDetail.objects.count())
