from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import *
from .serializers import (
    CategorySerializer, 
    ProductSerializer, 
    OrderSerializer, 
    OrderDetailSerializer, 
    AdressSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class OrderDetailViewSet(viewsets.ModelViewSet):
    queryset = orderDetail.objects.all()
    serializer_class = OrderDetailSerializer

class AdressViewSet(viewsets.ModelViewSet):
    queryset = Adress.objects.all()
    serializer_class = AdressSerializer