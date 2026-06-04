# E-commerce API — Django REST Framework

API REST para un sistema de e-commerce desarrollada con **Django REST Framework** y **Supabase (PostgreSQL)**. Expone operaciones CRUD completas sobre productos, categorías, pedidos, detalles de pedido y direcciones, con soporte para respuestas JSON anidadas.

> **Laboratorio 07 — Desarrollo de Aplicaciones Web**
> Escuela Profesional de Ingeniería de Sistemas · UNSA · Semestre 2026-A

---

##  Tabla de contenidos

- [Stack tecnológico](#-stack-tecnológico)
- [Características](#-características)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Ejemplos de uso](#-ejemplos-de-uso)
- [Video demostrativo](#-video-demostrativo)
- [Autores](#-autores)

---

##  Stack tecnológico

| Tecnología | Uso |
|---|---|
| Python 3 | Lenguaje base |
| Django REST Framework | Framework de la API REST |
| Supabase (PostgreSQL) | Base de datos |
| Postman | Pruebas de endpoints |
| Git / GitHub | Control de versiones |

---

##  Características

- ✅ **Serializadores** basados en `ModelSerializer` para cada modelo.
- ✅ **CRUD completo** (GET, POST, PUT, PATCH, DELETE) vía `ModelViewSet`.
- ✅ **JSON anidados** para consultas complejas (categorías con sus productos, pedidos con sus detalles).
- ✅ **Enrutamiento automático** con `DefaultRouter`.
- ✅ Acceso **anónimo** a todas las operaciones (sin JWT por ahora).

---

## 📁 Estructura del proyecto

```
LAB08-DAW
├── config
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── ecomerce
│   ├── migrations
│   │   └── 0001_initial.py
│   ├── models
│   │   ├── __init__.py
│   │   ├── categoria.py
│   │   ├── detalle_pedido.py
│   │   ├── direccion.py
│   │   ├── pedido.py
│   │   └── producto.py
│   ├── admin.py
│   ├── apps.py
│   ├── serializers.py
│   ├── tests.py
│   └── views.py
├── mi_entorno
├── manage.py
└── requirements.txt
```

---

##  Instalación

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

**4. Configura las variables de entorno**

Crea un archivo `.env` con tus credenciales de Supabase (ajusta según tu `settings.py`):

```env
DB_NAME=postgres
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=tu_host.supabase.co
DB_PORT=5432
```

**5. Aplica las migraciones y levanta el servidor**

```bash
python manage.py migrate
python manage.py runserver
```

La API queda disponible en `http://127.0.0.1:8000/api/`

---

## 🔌Endpoints de la API

Base URL: `http://127.0.0.1:8000/api/`

| Recurso | Endpoint | Métodos |
|---|---|---|
| Productos | `/productos/` | GET, POST |
| Producto (detalle) | `/productos/<id>/` | GET, PUT, PATCH, DELETE |
| Categorías | `/categorias/` | GET, POST |
| Categoría (detalle) | `/categorias/<id>/` | GET, PUT, PATCH, DELETE |
| Pedidos | `/pedidos/` | GET, POST |
| Detalles de pedido | `/detalles-pedido/` | GET, POST |
| Direcciones | `/direcciones/` | GET, POST |

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
POST /api/productos/
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
> productos = ProductoSerializer(many=True, read_only=True, source='producto_set')
> ```

---

##  Video demostrativo

**[Ver demostración](https://youtu.be/JrpOj8n4zG8?feature=shared)**

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
