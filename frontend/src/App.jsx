import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import OrdersPage from './pages/OrdersPage'
import AddressesPage from './pages/AddressesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<ProductsPage />} />
            <Route path="categorias" element={<CategoriesPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="direcciones" element={<AddressesPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
