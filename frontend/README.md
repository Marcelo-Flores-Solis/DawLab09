# AurumStore · Frontend

E-commerce frontend del proyecto integrador (Laboratorio 10).

## Stack

- **React 19 + Vite + TypeScript** (tipado estricto, sin `any`).
- **React Router** para el enrutamiento SPA.
- **TanStack Query** para todas las peticiones al backend (caché, estados de
  carga/error, invalidación tras mutaciones).
- **`fetch` nativo** encapsulado en la capa `api/` (sin Axios).

## Estructura

```
src/
├── api/         Servicios HTTP con fetch (client, auth, resources, checkout)
├── components/  UI reutilizable (Navbar, ProductCard, ProductList, ...)
├── context/     Estado global de cliente (carrito, toasts)
├── hooks/       Custom hooks con useQuery / useMutation (TanStack Query)
├── pages/       Vistas enrutadas (catálogo, detalle, carrito, panel admin)
└── types/       Interfaces del dominio (Product, Category, Order, ...)
```

## Rutas principales

| Ruta               | Vista                         |
| ------------------ | ----------------------------- |
| `/`                | Catálogo (`StorePage`)        |
| `/producto/:id`    | Detalle (`ProductDetailPage`) |
| `/carrito`         | Carrito                       |
| `/mis-pedidos`     | Pedidos del usuario (privada) |
| `/admin/*`         | Panel de administración (staff)|
| `*` (desconocida)  | Redirige a `/`                |

## Scripts

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo
npm run typecheck # comprobación de tipos (tsc --noEmit)
npm run build     # build de producción (tsc -b && vite build)
npm run preview   # previsualizar el build
```

## Configuración

Copia `.env.example` a `.env` y define la URL del backend:

```
VITE_API_URL=http://127.0.0.1:8000/api
```

## Despliegue (Vercel)

El archivo `vercel.json` reescribe todas las rutas a `index.html` para que el
enrutado del lado del cliente funcione al recargar (SPA fallback).
