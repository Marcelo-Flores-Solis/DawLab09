<div align="center">

# 🛒 E-commerce API — Django REST Framework + JWT

API REST **full-stack** para un sistema de e-commerce, construida con **Django REST Framework** y **Supabase (PostgreSQL)**, con **autenticación JWT**, documentación interactiva **Swagger (OpenAPI 3)** y un **cliente web en React + Vite** que consume la API protegida.

**Laboratorio 09 — Desarrollo de Aplicaciones Web**
Escuela Profesional de Ingeniería de Sistemas · UNSA · Semestre 2026-A

</div>

---

## 📑 Tabla de contenidos

- [Descripción general](#-descripción-general)
- [Stack tecnológico](#-stack-tecnológico)
- [Características](#-características)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación del backend](#-instalación-del-backend)
- [Autenticación (JWT)](#-autenticación-jwt)
- [Roles y permisos](#-roles-y-permisos)
- [Ciclo de vida del pedido](#-ciclo-de-vida-del-pedido)
- [Documentación interactiva (Swagger)](#-documentación-interactiva-swagger)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Ejemplos de uso](#-ejemplos-de-uso)
- [Frontend (React + Vite)](#-frontend-react--vite)
- [Video demostrativo](#-video-demostrativo)
- [Autores](#-autores)

---

## 🧭 Descripción general

El proyecto expone operaciones **CRUD completas** sobre productos, categorías, pedidos, detalles de pedido y direcciones. La API entrega respuestas **JSON anidadas** para consultas complejas (por ejemplo, una categoría con todos sus productos, o un pedido con todos sus detalles) y usa **JSON Web Tokens (JWT)** con **permisos por rol**: el catálogo es de lectura pública, mientras que crear/editar recursos exige autenticación y, según el caso, ser **staff**.

Sobre esa API corre un **frontend en React** con dos experiencias:

- **Tienda** pública, donde cualquiera navega el catálogo y arma un carrito; al confirmar la compra se pide iniciar sesión y el pedido queda registrado a nombre del usuario.
- **Panel de administración** (solo staff), para gestionar productos, categorías, pedidos y direcciones.

Los **pedidos siguen un ciclo de vida controlado**: el cliente los crea y luego son **inmutables** para él; el total y los precios se calculan **en el servidor**, no se confían al cliente.

---

## 🧰 Stack tecnológico

### Backend

| Tecnología | Uso |
|---|---|
| Python 3 | Lenguaje base |
| Django REST Framework | Framework de la API REST |
| djangorestframework-simplejwt | Autenticación con JSON Web Tokens |
| drf-spectacular | Documentación OpenAPI 3 / Swagger UI |
| django-cors-headers | Permite el consumo desde el frontend |
| python-decouple | Variables de entorno (`.env`) |
| Supabase (PostgreSQL) | Base de datos |

### Frontend

| Tecnología | Uso |
|---|---|
| React 19 | Librería de interfaz |
| Vite | Empaquetador y servidor de desarrollo |
| Axios | Cliente HTTP hacia la API |
| React Router DOM | Enrutamiento y rutas protegidas |

### Herramientas

| Herramienta | Uso |
|---|---|
| Postman / Swagger UI | Pruebas de endpoints |
| Git / GitHub | Control de versiones |

---

## ✨ Características

- **Serializadores** basados en `ModelSerializer` para cada modelo.
- **CRUD completo** (GET, POST, PUT, PATCH, DELETE) mediante `ModelViewSet`.
- **JSON anidados** para consultas complejas (categorías con sus productos, pedidos con sus detalles).
- **Enrutamiento automático** con `DefaultRouter`.
- **Autenticación JWT** con **claims personalizados** (`is_staff`, `username`): el frontend conoce el rol sin llamadas extra.
- **Permisos por rol**: catálogo de **lectura pública**; escritura solo para **staff**; pedidos **acotados al dueño** e **inmutables** para el cliente tras crearlos.
- **Lógica de negocio en el servidor**: el **precio** de cada línea se toma del producto y el **total** del pedido se recalcula sumando sus detalles (el cliente no puede falsear importes).
- **Documentación automática OpenAPI 3** generada con drf-spectacular y expuesta vía Swagger UI.
- **Variables de entorno**: credenciales y `SECRET_KEY` fuera del código, gestionadas con `python-decouple`.
- **Frontend React** con tienda pública, carrito de compras, checkout con login, historial de pedidos y panel de administración por rol.

---

## 📂 Estructura del proyecto

```
DawLab09
├── config/                       # Configuración del proyecto Django
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── ecomerce/                     # App principal (API REST)
│   ├── migrations/
│   ├── models/                   # Un archivo por modelo
│   │   ├── category.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── orderDetail.py
│   │   └── adress.py
│   ├── serializers/              # Un serializador por modelo
│   │   ├── categorySerializer.py
│   │   ├── productSerializer.py
│   │   ├── orderSerializer.py
│   │   ├── order_detailSerializer.py
│   │   └── adressSerializer.py
│   ├── admin.py
│   ├── apps.py
│   └── views.py                  # ViewSets (CRUD)
├── frontend/                     # Cliente web (React + Vite)
│   ├── src/
│   │   ├── api/                  # Cliente axios, autenticación JWT y checkout
│   │   │   ├── client.js         #   axios + interceptores (token / refresh)
│   │   │   ├── auth.js           #   login, roles (is_staff) y sesión
│   │   │   ├── resources.js      #   CRUD genérico de la API
│   │   │   └── checkout.js       #   crear pedido desde el carrito
│   │   ├── context/              # CartContext (carrito) y ToastContext (avisos)
│   │   ├── components/           # StoreLayout, AdminLayout, ProtectedRoute, AdminRoute
│   │   ├── pages/                # Tienda, Carrito, Mis pedidos, Login + CRUD admin
│   │   ├── App.jsx               # Rutas: tienda pública / rutas protegidas / admin
│   │   ├── main.jsx
│   │   ├── index.css             # Estilos de la tienda
│   │   └── admin.css             # Estilos del panel admin
│   ├── .env                      # VITE_API_URL
│   ├── package.json
│   └── vite.config.js
├── .env                          # Variables de entorno (NO se sube a git)
├── .env.example                  # Plantilla de variables de entorno
├── .gitignore
├── manage.py
├── requirements.txt
└── README.md
```

---

## ⚙️ Instalación del backend

### 1. Clona el repositorio

```bash
git clone https://github.com/Marcelo-Flores-Solis/DawLab09.git
cd DawLab09
```

### 2. Crea y activa el entorno virtual

```bash
python -m venv mi_entorno

# Windows
mi_entorno\Scripts\activate

# Linux / macOS
source mi_entorno/bin/activate
```

### 3. Instala las dependencias

```bash
pip install -r requirements.txt
```

> Si instalas desde cero (sin `requirements.txt`), los paquetes clave son:
> ```bash
> pip install djangorestframework djangorestframework-simplejwt
> pip install drf-spectacular django-cors-headers python-decouple
> pip freeze > requirements.txt
> ```

### 4. Configura las variables de entorno

Copia la plantilla `.env.example` a `.env` y completa tus credenciales de Supabase. **El archivo `.env` nunca se sube a git** (ya está en `.gitignore`).

```bash
cp .env.example .env
```

```env
SECRET_KEY=tu_secret_key
DEBUG=True

DB_NAME=postgres
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=tu_host.pooler.supabase.com
DB_PORT=5432
```

### 5. Aplica las migraciones y crea un superusuario

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 6. Levanta el servidor

```bash
python manage.py runserver
```

La API queda disponible en `http://127.0.0.1:8000/api/`

---

## 🔐 Autenticación (JWT)

La API usa **tokens JWT** con `djangorestframework-simplejwt`, configurado como autenticación y permiso por defecto (`IsAuthenticated`) en `config/settings.py`. Cada `ViewSet` afina luego el acceso por rol (ver [Roles y permisos](#-roles-y-permisos)):

```python
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}
```

### Obtener un token

```http
POST /api/token/
Content-Type: application/json

{
  "username": "tu_usuario",
  "password": "tu_password"
}
```

**Respuesta `200 OK`**

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Renovar el access token

```http
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Usar el token en las peticiones

Incluye el `access` token en el header `Authorization` de cada petición a `/api/`:

```http
GET /api/products/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Sin este header solo puedes **leer el catálogo** (productos y categorías); el resto de endpoints responde **`401 Unauthorized`**. Ver [Roles y permisos](#-roles-y-permisos).

> Necesitas un usuario de Django existente (créalo con `python manage.py createsuperuser` o desde `/admin/`) para poder obtener un token.

### Claims personalizados en el token

El `access` token incluye el rol del usuario, para que el frontend decida qué mostrar sin pedir datos adicionales. Se logra con un serializador propio (`CustomTokenObtainPairSerializer`):

```python
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff   # rol
        token['username'] = user.username
        return token
```

---

## 👤 Roles y permisos

El permiso por defecto es `IsAuthenticated`, pero cada `ViewSet` ajusta el acceso según la acción y el rol (`is_staff`):

| Recurso | Leer (GET) | Crear (POST) | Editar / Eliminar |
|---|---|---|---|
| Productos y categorías | **Público** (sin token) | Solo **staff** | Solo **staff** |
| Pedidos y detalles | Solo **los propios** | Autenticado (a su nombre) | Solo **staff** |
| Direcciones | Solo **las propias** | Autenticado (a su nombre) | Autenticado (propias) |

Puntos clave de la implementación (`ecomerce/views.py`):

- El **catálogo** es de lectura pública y de escritura solo para staff:
  ```python
  def get_permissions(self):
      if self.action in ['list', 'retrieve']:
          return [AllowAny()]
      return [IsAdminUser()]
  ```
- Un cliente solo ve **sus** pedidos (`get_queryset` filtra por `usuario`) y estos son **inmutables** para él: editar y eliminar quedan reservados al staff.
  ```python
  def get_permissions(self):
      if self.action in ['update', 'partial_update', 'destroy']:
          return [IsAdminUser()]
      return [IsAuthenticated()]
  ```
- El dueño de un pedido se fija desde el **token**, no desde el cuerpo de la petición, de modo que nadie puede crear pedidos a nombre de otro.

---

## 🔄 Ciclo de vida del pedido

Un pedido pasa por estados (`pendiente` → `pagado` → `enviado`) y su contenido se controla en el servidor:

1. **Creación (cliente).** Desde el carrito, el cliente crea el pedido y sus líneas. **No envía precios ni total**: el servidor toma el `precio_unitario` del producto y calcula el `subtotal` y el `total`.
   ```python
   # Order.recalcular_total()
   self.total = self.detalles.aggregate(s=Sum('subtotal'))['s'] or 0
   ```
   Los campos `total`, `precio_unitario` y `subtotal` son **read-only** en los serializers.
2. **Inmutabilidad (cliente).** Una vez creado, el cliente **no puede modificar ni eliminar** el pedido; solo consultarlo (guarda su **código `#id`** para futuras referencias).
3. **Gestión (staff).** Desde el panel admin, el staff puede **crear un pedido con sus productos en un solo formulario**, cambiar el estado, y **añadir o quitar líneas** ante cualquier incidencia; el total se recalcula automáticamente.

---

## 📖 Documentación interactiva (Swagger)

La documentación se genera automáticamente con **drf-spectacular** bajo el estándar **OpenAPI 3**. Las vistas se acoplan en `config/urls.py`:

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

## 🌐 Endpoints de la API

Base URL: `http://127.0.0.1:8000/api/`

El acceso depende del **rol** (ver [Roles y permisos](#-roles-y-permisos)). El catálogo se lee sin token; el resto requiere el header `Authorization: Bearer <access_token>`.

| Recurso | Endpoint | Métodos | Acceso |
|---|---|---|:---:|
| Token (login) | `/token/` | POST | Público |
| Refrescar token | `/token/refresh/` | POST | Público |
| Productos | `/products/` | GET, POST | GET público · POST staff |
| Producto (detalle) | `/products/<id>/` | GET, PUT, PATCH, DELETE | GET público · escritura staff |
| Categorías | `/categorys/` | GET, POST | GET público · POST staff |
| Categoría (detalle) | `/categorys/<id>/` | GET, PUT, PATCH, DELETE | GET público · escritura staff |
| Pedidos | `/orders/` | GET, POST | Dueño · editar/borrar staff |
| Pedido (detalle) | `/orders/<id>/` | GET, PUT, PATCH, DELETE | Dueño (GET) · editar/borrar staff |
| Detalles de pedido | `/order-details/` | GET, POST | Dueño · editar/borrar staff |
| Direcciones | `/adresses/` | GET, POST | Dueño |

### Comportamiento de cada método

- **GET** `/api/<recurso>/` — Lista todos los registros.
- **POST** `/api/<recurso>/` — Crea un nuevo registro (envía el cuerpo en JSON sin `id`).
- **GET** `/api/<recurso>/<id>/` — Obtiene el detalle de un registro.
- **PUT / PATCH** `/api/<recurso>/<id>/` — Actualiza total o parcialmente un registro.
- **DELETE** `/api/<recurso>/<id>/` — Elimina un registro.

---

## 🧪 Ejemplos de uso

### Crear un producto (POST)

```http
POST /api/products/
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

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

## 💻 Frontend (React + Vite)

El cliente web vive en la carpeta `frontend/` y consume la API con JWT. Ofrece dos experiencias según el rol:

- **Tienda (pública).** Cualquiera navega el catálogo, busca, filtra por categoría y agrega productos a un **carrito** (persistido en `localStorage`). Al confirmar la compra, si no hay sesión se pide iniciar sesión y luego se completa el pedido; el carrito no se pierde. Los usuarios autenticados ven además **Mis pedidos**, donde consultan su historial (solo lectura).
- **Panel de administración (solo staff).** Gestión de productos, categorías, pedidos y direcciones. El acceso se decide por el claim `is_staff` del token: un cliente que intente entrar a `/admin` es redirigido a la tienda.

El enrutamiento usa `ProtectedRoute` (exige sesión) y `AdminRoute` (exige `is_staff`).

### Requisitos previos

- El **backend debe estar corriendo** en `http://127.0.0.1:8000`.
- En `config/settings.py`, `django-cors-headers` ya permite el origen del frontend:
  ```python
  CORS_ALLOWED_ORIGINS = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
  ]
  ```

### Instalación y ejecución

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`

### Variables de entorno del frontend

El archivo `frontend/.env` define la URL base de la API:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### Cómo funciona la autenticación en el cliente

1. El usuario inicia sesión en `/login`; el frontend pide el token a `POST /api/token/`.
2. Los tokens `access` y `refresh` se guardan en `localStorage`.
3. Un **interceptor de Axios** añade automáticamente el header `Authorization: Bearer <token>` a cada petición.
4. Si la API responde `401`, el interceptor intenta renovar el token con `POST /api/token/refresh/` y reintenta la petición; si la renovación falla, cierra la sesión y redirige a `/login`.
5. Las rutas internas están envueltas en `ProtectedRoute` (redirige a `/login` sin sesión) y `AdminRoute` (redirige a la tienda si el usuario no es `is_staff`).
6. El rol se lee del claim `is_staff` del propio token (decodificado en el cliente), así que la interfaz muestra u oculta el panel admin sin llamadas extra a la API.

---

## 🎬 Video demostrativo

- **Demostración:** _(pendiente de subir)_
- **Complemento:** _(pendiente de subir)_

---

## 👥 Autores

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
