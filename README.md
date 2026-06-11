# E-commerce API — Django REST Framework

API REST para un sistema de e-commerce desarrollada con **Django REST Framework** y **Supabase (PostgreSQL)**. Expone operaciones CRUD completas sobre productos, categorías, pedidos, detalles de pedido y direcciones, con soporte para respuestas JSON anidadas y **documentación interactiva con Swagger UI (OpenAPI 3)** mediante drf-spectacular.

> **Laboratorio 08 — Desarrollo de Aplicaciones Web**
> Escuela Profesional de Ingeniería de Sistemas · UNSA · Semestre 2026-A

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Características](#características)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Documentación interactiva (Swagger)](#documentación-interactiva-swagger)
- [Endpoints de la API](#endpoints-de-la-api)
- [Ejemplos de uso](#ejemplos-de-uso)
- [Video demostrativo](#video-demostrativo)
- [Autores](#autores)

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| Python 3 | Lenguaje base |
| Django REST Framework | Framework de la API REST |
| drf-spectacular | Documentación OpenAPI 3 / Swagger UI |
| Supabase (PostgreSQL) | Base de datos |
| Postman | Pruebas de endpoints |
| Git / GitHub | Control de versiones |

---

## Características

- **Serializadores** basados en `ModelSerializer` para cada modelo.
- **CRUD completo** (GET, POST, PUT, PATCH, DELETE) vía `ModelViewSet`.
- **JSON anidados** para consultas complejas (categorías con sus productos, pedidos con sus detalles).
- **Enrutamiento automático** con `DefaultRouter`.
- **Documentación automática OpenAPI 3** generada con drf-spectacular y expuesta vía Swagger UI.
- Acceso **anónimo** a todas las operaciones (sin JWT por ahora).

---

## Estructura del proyecto

```
Lab08-daw
├── config
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── ecomerce
│   ├── migrations
│   │   ├── 0001_initial.py
│   │   └── 0002_rename_direccion_adress.py
│   ├── models
│   │   ├── __init__.py
│   │   ├── adress.py
│   │   ├── category.py
│   │   ├── order.py
│   │   ├── orderDetail.py
│   │   └── product.py
│   ├── serializers
│   │   ├── __init__.py
│   │   ├── adressSerializer.py
│   │   ├── categorySerializer.py
│   │   ├── order_detailSerializer.py
│   │   ├── orderSerializer.py
│   │   └── productSerializer.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   └── views.py
├── mi_entorno
├── manage.py
├── requirements.txt
└── schema.yml
```

---

## Instalación

**1. Clona el repositorio**

```bash
git clone https://github.com/Jose-Kana/Lab08-daw.git
cd Lab08-daw
```

**2. Crea y activa el entorno virtual**

```bash
python -m venv mi_entorno

# Windows
mi_entorno\Scripts\activate

# Linux / macOS
source mi_entorno/bin/activate
```

**3. Instala las dependencias**

```bash
pip install -r requirements.txt
```

> Si instalas desde cero (sin `requirements.txt`), los paquetes clave son:
> ```bash
> pip install djangorestframework
> pip install drf-spectacular
> pip freeze > requirements.txt
> ```

**4. Registra las apps en `settings.py`**

Asegúrate de tener `rest_framework` y `drf_spectacular` en `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'drf_spectacular',
]
```

**5. Configura las variables de entorno**

Crea un archivo `.env` con tus credenciales de Supabase (ajusta según tu `settings.py`):

```env
DB_NAME=postgres
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=tu_host.supabase.co
DB_PORT=5432
```

**6. Aplica las migraciones y levanta el servidor**

```bash
python manage.py migrate
python manage.py runserver
```

La API queda disponible en `http://127.0.0.1:8000/api/`

---

## Documentación interactiva (Swagger)

La documentación se genera automáticamente con **drf-spectacular** bajo el estándar **OpenAPI 3**. Para habilitarla se acoplaron las vistas en `config/urls.py`:

```python
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # ...
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
```

| Recurso | URL |
|---|---|
| Esquema OpenAPI 3 (YAML) | `http://127.0.0.1:8000/api/schema/` |
| Interfaz Swagger UI | `http://127.0.0.1:8000/api/docs/` |

Desde Swagger UI puedes explorar y probar todos los endpoints (GET, POST, PUT, PATCH, DELETE) sin necesidad de Postman.

---

## Endpoints de la API

Base URL: `http://127.0.0.1:8000/api/`

| Recurso | Endpoint | Métodos |
|---|---|---|
| Productos | `/products/` | GET, POST |
| Producto (detalle) | `/products/<id>/` | GET, PUT, PATCH, DELETE |
| Categorías | `/categorys/` | GET, POST |
| Categoría (detalle) | `/categorys/<id>/` | GET, PUT, PATCH, DELETE |
| Pedidos | `/orders/` | GET, POST |
| Pedido (detalle) | `/orders/<id>/` | GET, PUT, PATCH, DELETE |
| Detalles de pedido | `/order-details/` | GET, POST |
| Direcciones | `/adresses/` | GET, POST |

### Comportamiento de cada método

- **GET** `/api/<recurso>/` — Lista todos los registros.
- **POST** `/api/<recurso>/` — Crea un nuevo registro (envía el cuerpo en JSON sin `id`).
- **GET** `/api/<recurso>/<id>/` — Obtiene el detalle de un registro.
- **PUT / PATCH** `/api/<recurso>/<id>/` — Actualiza total o parcialmente un registro.
- **DELETE** `/api/<recurso>/<id>/` — Elimina un registro.

---

## Ejemplos de uso

### Crear un producto (POST)

```http
POST /api/products/
Content-Type: application/json

{
  "nombre": "CR-T",
  "descripcion": "portátil",
  "precio": "67.00",
  "stock": 20,
  "categoria": 2
}
```

**Respuesta `201 Created`**

```json
{
  "id": 5,
  "nombre": "CR-T",
  "descripcion": "portátil",
  "precio": "67.00",
  "stock": 20,
  "creado": "2026-06-04T02:43:48Z",
  "categoria": 2
}
```

### Consulta anidada (GET categorías con sus productos)

```json
{
  "id": 2,
  "nombre": "OS",
  "descripcion": "dispositivos electrónicos",
  "productos": [
    {
      "id": 2,
      "nombre": "Usb",
      "descripcion": "esto es un usb",
      "precio": "45.00",
      "stock": 2,
      "categoria": 2
    }
  ]
}
```

> El campo `productos` se genera mediante una relación inversa en el serializador:
> ```python
> productos = ProductSerializer(many=True, read_only=True)
> ```

---

## Video demostrativo

**[Ver demostración](https://youtu.be/JrpOj8n4zG8?feature=shared)**

---

## Autores

| Nombre | Correo |
|---|---|
| Marcelo Flores Solis | mfloresso@unsa.edu.pe |
| Alejandro Mendoza Pantigoso | amendozapan@unsa.edu.pe |
| Jose Kana Huanqque | jkanahuan@unsa.edu.pe |

---

<div align="center">

**Universidad Nacional de San Agustín de Arequipa**
Facultad de Ingeniería de Producción y Servicios · Escuela Profesional de Ingeniería de Sistemas

</div>
**Universidad Nacional de San Agustín de Arequipa**
Facultad de Ingeniería de Producción y Servicios · Escuela Profesional de Ingeniería de Sistemas

</div>
