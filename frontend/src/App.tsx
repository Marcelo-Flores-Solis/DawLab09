import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import StoreLayout from './components/StoreLayout'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import StorePage from './pages/StorePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import MyOrdersPage from './pages/MyOrdersPage'
import ProfilePage from './pages/ProfilePage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import OrdersPage from './pages/OrdersPage'
import AddressesPage from './pages/AddressesPage'

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="login" element={<LoginPage />} />

            {/* Tienda pública: cualquiera puede navegar y armar el carrito */}
            <Route element={<StoreLayout />}>
              <Route index element={<StorePage />} />
              <Route path="producto/:id" element={<ProductDetailPage />} />
              <Route path="carrito" element={<CartPage />} />
              {/* Requiere sesión */}
              <Route element={<ProtectedRoute />}>
                <Route path="mis-pedidos" element={<MyOrdersPage />} />
                <Route path="mi-perfil" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Panel de administración: sólo staff */}
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<ProductsPage />} />
                <Route path="categorias" element={<CategoriesPage />} />
                <Route path="pedidos" element={<OrdersPage />} />
                <Route path="direcciones" element={<AddressesPage />} />
              </Route>
            </Route>

            {/* Cualquier ruta desconocida redirige al catálogo (Requisito 3) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ToastProvider>
  )
}
