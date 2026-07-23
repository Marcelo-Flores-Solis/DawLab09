import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProduct } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import ProductThumb from '../components/ProductThumb'

// Detalle de un artículo. Consume la ruta /producto/:id (Requisito 3) leyendo el
// parámetro con useParams y los datos con el hook useProduct (TanStack Query).
export default function ProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)

  const { data: product, isLoading, isError } = useProduct(productId)
  const { data: categories = [] } = useCategories()
  const { addItem } = useCart()
  const { notify } = useToast()

  if (isLoading) return <p className="muted page-pad">{t('product.loading')}</p>

  if (isError || !product) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-icon">🔍</span>
        <h2>{t('product.notFoundTitle')}</h2>
        <p className="muted">{t('product.notFoundText')}</p>
        <Link to="/" className="add-btn cart-empty-cta">
          {t('product.backToStore')}
        </Link>
      </div>
    )
  }

  const categoryName = categories.find((c) => c.id === product.categoria)?.nombre ?? t('product.general')
  const outOfStock = product.stock <= 0

  function handleAdd() {
    if (!product || outOfStock) return
    addItem(product, 1)
    notify(t('toast.addedToCart', { name: product.nombre }))
  }

  return (
    <div className="product-detail">
      <Link to="/" className="continue-link">
        {t('product.backToCatalog')}
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
              {outOfStock ? t('product.outOfStock') : t('product.available', { count: product.stock })}
            </span>
          </div>

          <button className="add-btn" onClick={handleAdd} disabled={outOfStock}>
            {outOfStock ? t('product.noStock') : t('product.addToCart')}
          </button>
        </div>
      </div>
    </div>
  )
}
