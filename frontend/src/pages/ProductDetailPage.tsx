import { useParams, Link } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import ProductThumb from '../components/ProductThumb'

// Detalle de un artículo. Consume la ruta /producto/:id (Requisito 3) leyendo el
// parámetro con useParams y los datos con el hook useProduct (TanStack Query).
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)

  const { data: product, isLoading, isError } = useProduct(productId)
  const { data: categories = [] } = useCategories()
  const { addItem } = useCart()
  const { notify } = useToast()

  if (isLoading) return <p className="muted page-pad">Cargando producto…</p>

  if (isError || !product) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-icon">🔍</span>
        <h2>Producto no encontrado</h2>
        <p className="muted">El artículo que buscas no existe o fue retirado.</p>
        <Link to="/" className="add-btn cart-empty-cta">
          Volver a la tienda
        </Link>
      </div>
    )
  }

  const categoryName = categories.find((c) => c.id === product.categoria)?.nombre ?? 'General'
  const outOfStock = product.stock <= 0

  function handleAdd() {
    if (!product || outOfStock) return
    addItem(product, 1)
    notify(`${product.nombre} añadido al carrito`)
  }

  return (
    <div className="product-detail">
      <Link to="/" className="continue-link">
        ← Volver al catálogo
      </Link>

      <div className="product-detail-layout">
        <ProductThumb
          id={product.id}
          categoryName={categoryName}
          imageUrl={product.imagen}
          size="detail"
        />

        <div className="product-detail-info">
          <span className="product-cat">{categoryName}</span>
          <h1 className="page-title">{product.nombre}</h1>
          <p className="product-desc">{product.descripcion}</p>

          <div className="product-footer">
            <span className="product-price">S/ {Number(product.precio).toFixed(2)}</span>
            <span className={`stock-tag ${outOfStock ? 'stock-out' : ''}`}>
              {outOfStock ? 'Agotado' : `${product.stock} disponibles`}
            </span>
          </div>

          <button className="add-btn" onClick={handleAdd} disabled={outOfStock}>
            {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  )
}
