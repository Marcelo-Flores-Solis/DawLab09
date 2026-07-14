from decimal import Decimal

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase

from ecomerce.models import Category, Product, Order, OrderDetail, Address


class ModelTests(APITestCase):
    """Comportamiento de los modelos: normalización en save(), validadores y
    cálculos de subtotal/total (que nunca dependen del cliente)."""

    def setUp(self):
        self.category = Category.objects.create(nombre='Laptops', descripcion='x')
        self.product = Product.objects.create(
            nombre='macbook air m3', descripcion='x',
            precio=Decimal('4000.00'), stock=5, categoria=self.category,
        )

    def test_category_nombre_uppercase(self):
        self.assertEqual(self.category.nombre, 'LAPTOPS')

    def test_product_nombre_titlecase(self):
        self.assertEqual(self.product.nombre, 'Macbook Air M3')

    def test_address_ciudad_provincia_titlecase(self):
        user = User.objects.create_user('u', password='p')
        addr = Address.objects.create(usuario=user, calle='a', ciudad='lima', provincia='lima')
        self.assertEqual(addr.ciudad, 'Lima')
        self.assertEqual(addr.provincia, 'Lima')

    def test_address_uses_original_table(self):
        # El rename Adress->Address mantuvo la tabla física.
        self.assertEqual(Address._meta.db_table, 'ecomerce_adress')

    def test_precio_validator_rejects_zero(self):
        p = Product(nombre='x', descripcion='x', precio=Decimal('0'),
                    stock=1, categoria=self.category)
        with self.assertRaises(ValidationError):
            p.full_clean()

    def test_stock_validator_rejects_negative(self):
        p = Product(nombre='x', descripcion='x', precio=Decimal('1'),
                    stock=-1, categoria=self.category)
        with self.assertRaises(ValidationError):
            p.full_clean()

    def test_orderdetail_subtotal_autocalculado(self):
        order = Order.objects.create(usuario=User.objects.create_user('a', password='p'))
        det = OrderDetail.objects.create(
            pedido=order, producto=self.product, cantidad=3,
            precio_unitario=self.product.precio,
        )
        self.assertEqual(det.subtotal, Decimal('12000.00'))

    def test_order_recalcular_total(self):
        order = Order.objects.create(usuario=User.objects.create_user('b', password='p'))
        OrderDetail.objects.create(pedido=order, producto=self.product,
                                   cantidad=2, precio_unitario=self.product.precio)
        OrderDetail.objects.create(pedido=order, producto=self.product,
                                   cantidad=1, precio_unitario=self.product.precio)
        order.recalcular_total()
        self.assertEqual(order.total, Decimal('12000.00'))


class CheckoutTests(APITestCase):
    """Endpoint atómico POST /api/orders/checkout/."""

    URL = '/api/orders/checkout/'

    def setUp(self):
        self.user = User.objects.create_user('cliente', password='p')
        self.other = User.objects.create_user('otro', password='p')
        self.category = Category.objects.create(nombre='c', descripcion='x')
        self.product = Product.objects.create(
            nombre='p1', descripcion='x', precio=Decimal('100.00'),
            stock=10, categoria=self.category,
        )

    def test_requires_authentication(self):
        res = self.client.post(self.URL, {'items': [{'producto': self.product.id, 'cantidad': 1}]}, format='json')
        self.assertEqual(res.status_code, 401)

    def test_successful_checkout_creates_order_and_decrements_stock(self):
        self.client.force_authenticate(self.user)
        res = self.client.post(self.URL, {'items': [{'producto': self.product.id, 'cantidad': 3}]}, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Order.objects.count(), 1)

        order = Order.objects.get()
        self.assertEqual(order.usuario, self.user)          # usuario tomado del token
        self.assertEqual(order.total, Decimal('300.00'))    # total calculado en servidor
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 7)             # stock descontado (10 - 3)

        det = order.detalles.get()
        self.assertEqual(det.precio_unitario, Decimal('100.00'))  # precio del servidor
        self.assertEqual(det.subtotal, Decimal('300.00'))

    def test_price_is_taken_from_server_not_client(self):
        self.client.force_authenticate(self.user)
        # El cliente intenta falsear precio/subtotal: deben ignorarse.
        res = self.client.post(self.URL, {'items': [
            {'producto': self.product.id, 'cantidad': 1, 'precio_unitario': '1', 'subtotal': '1'},
        ]}, format='json')
        self.assertEqual(res.status_code, 201)
        det = Order.objects.get().detalles.get()
        self.assertEqual(det.precio_unitario, Decimal('100.00'))

    def test_insufficient_stock_is_rejected_atomically(self):
        self.client.force_authenticate(self.user)
        res = self.client.post(self.URL, {'items': [{'producto': self.product.id, 'cantidad': 999}]}, format='json')
        self.assertEqual(res.status_code, 400)
        # No debe quedar ningún pedido ni cambiar el stock (transacción revertida).
        self.assertEqual(Order.objects.count(), 0)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)

    def test_empty_cart_is_rejected(self):
        self.client.force_authenticate(self.user)
        res = self.client.post(self.URL, {'items': []}, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)

    def test_duplicate_lines_are_consolidated(self):
        self.client.force_authenticate(self.user)
        res = self.client.post(self.URL, {'items': [
            {'producto': self.product.id, 'cantidad': 2},
            {'producto': self.product.id, 'cantidad': 3},
        ]}, format='json')
        self.assertEqual(res.status_code, 201)
        order = Order.objects.get()
        self.assertEqual(order.detalles.count(), 1)         # una sola línea
        self.assertEqual(order.detalles.get().cantidad, 5)  # 2 + 3
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)             # 10 - 5

    def test_checkout_stores_own_address(self):
        addr = Address.objects.create(usuario=self.user, calle='c', ciudad='lima', provincia='lima')
        self.client.force_authenticate(self.user)
        res = self.client.post(self.URL, {
            'items': [{'producto': self.product.id, 'cantidad': 1}],
            'direccion': addr.id,
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Order.objects.get().direccion_id, addr.id)

    def test_checkout_without_address_is_allowed(self):
        self.client.force_authenticate(self.user)
        res = self.client.post(self.URL, {'items': [{'producto': self.product.id, 'cantidad': 1}]}, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertIsNone(Order.objects.get().direccion_id)

    def test_cannot_checkout_with_someone_elses_address(self):
        foreign = Address.objects.create(usuario=self.other, calle='c', ciudad='lima', provincia='lima')
        self.client.force_authenticate(self.user)
        res = self.client.post(self.URL, {
            'items': [{'producto': self.product.id, 'cantidad': 1}],
            'direccion': foreign.id,
        }, format='json')
        self.assertEqual(res.status_code, 403)
        self.assertEqual(Order.objects.count(), 0)      # no se creó el pedido
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)        # ni se tocó el stock


class AddressTests(APITestCase):
    """Autogestión de direcciones del cliente (sin panel admin)."""

    URL = '/api/adresses/'

    def setUp(self):
        self.user = User.objects.create_user('cliente', password='p')
        self.other = User.objects.create_user('otro', password='p')

    def test_customer_creates_address_without_sending_usuario(self):
        self.client.force_authenticate(self.user)
        res = self.client.post(self.URL, {'calle': 'Av 1', 'ciudad': 'lima', 'provincia': 'lima'}, format='json')
        self.assertEqual(res.status_code, 201)
        addr = Address.objects.get()
        self.assertEqual(addr.usuario, self.user)   # usuario tomado del token

    def test_customer_cannot_forge_owner(self):
        self.client.force_authenticate(self.user)
        # Aunque envíe el id de otro usuario, se ignora: la dirección es suya.
        res = self.client.post(self.URL, {
            'usuario': self.other.id, 'calle': 'x', 'ciudad': 'lima', 'provincia': 'lima',
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Address.objects.get().usuario, self.user)

    def test_list_is_scoped_to_owner(self):
        mine = Address.objects.create(usuario=self.user, calle='a', ciudad='lima', provincia='lima')
        Address.objects.create(usuario=self.other, calle='b', ciudad='lima', provincia='lima')
        self.client.force_authenticate(self.user)
        res = self.client.get(self.URL)
        ids = [a['id'] for a in res.data['results']]
        self.assertEqual(ids, [mine.id])

    def test_requires_authentication(self):
        res = self.client.get(self.URL)
        self.assertEqual(res.status_code, 401)


class PermissionTests(APITestCase):
    """Catálogo público de sólo lectura; escritura sólo para staff; pedidos
    acotados a su dueño."""

    def setUp(self):
        self.admin = User.objects.create_superuser('admin', password='p')
        self.user = User.objects.create_user('user', password='p')
        self.category = Category.objects.create(nombre='c', descripcion='x')
        self.product = Product.objects.create(
            nombre='p', descripcion='x', precio=Decimal('10'),
            stock=1, categoria=self.category,
        )

    def test_product_list_is_public(self):
        res = self.client.get('/api/products/')
        self.assertEqual(res.status_code, 200)

    def test_category_list_is_public(self):
        res = self.client.get('/api/categorys/')
        self.assertEqual(res.status_code, 200)

    def test_product_create_requires_admin(self):
        payload = {'nombre': 'z', 'descripcion': 'x', 'precio': '5',
                   'stock': 1, 'categoria': self.category.id, 'imagen': ''}
        # Anónimo -> 401
        self.assertEqual(self.client.post('/api/products/', payload, format='json').status_code, 401)
        # Usuario normal -> 403
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.post('/api/products/', payload, format='json').status_code, 403)
        # Admin -> 201
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post('/api/products/', payload, format='json').status_code, 201)

    def test_order_list_is_scoped_to_owner(self):
        mine = Order.objects.create(usuario=self.user)
        Order.objects.create(usuario=self.admin)  # de otro usuario
        self.client.force_authenticate(self.user)
        res = self.client.get('/api/orders/')
        ids = [o['id'] for o in res.data['results']]
        self.assertEqual(ids, [mine.id])


class PaginationTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(nombre='c', descripcion='x')
        for i in range(15):
            Product.objects.create(nombre=f'p{i}', descripcion='x',
                                   precio=Decimal('1'), stock=1, categoria=self.category)

    def test_products_list_is_paginated(self):
        res = self.client.get('/api/products/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('count', res.data)
        self.assertIn('results', res.data)
        self.assertEqual(res.data['count'], 15)
        self.assertEqual(len(res.data['results']), 12)  # PAGE_SIZE por defecto

    def test_page_size_query_param(self):
        res = self.client.get('/api/products/?page_size=5')
        self.assertEqual(len(res.data['results']), 5)
