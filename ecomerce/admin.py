
from django.contrib import admin

from .models import Category
from .models import Product
from .models import Order
from .models import OrderDetail
from .models import Address
from .models import Profile


admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderDetail)
admin.site.register(Address)
admin.site.register(Profile)
