import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Product } from '../types'
import ProductThumb from './ProductThumb'

interface ProductCardProps {
  product: Product
  categoryName?: string
  onAdd: (product: Product) => void
}

// Tarjeta de producto reutilizable (Requisito 6). Es "tonta": recibe el producto
// y notifica al padre cuando se pulsa "Agregar", sin conocer el carrito.
export default function ProductCard({ product, categoryName, onAdd }: ProductCardProps) {
  const { t } = useTranslation()
  const outOfStock = product.stock <= 0

  return (
    <article className="product-card">
      <Link to={`/producto/${product.id}`} className="product-thumb-link">
        <ProductThumb id={product.id} categoryName={categoryName} imageUrl={product.imagen} />
      </Link>
      <div className="product-body">
        <span className="product-cat">{categoryName ?? t('product.general')}</span>
        <h3 className="product-name">
          <Link to={`/producto/${product.id}`}>{product.nombre}</Link>
        </h3>
        <p className="product-desc">{product.descripcion}</p>
        <div className="product-footer">
          <span className="product-price">S/ {Number(product.precio).toFixed(2)}</span>
          <span className={`stock-tag ${outOfStock ? 'stock-out' : ''}`}>
            {outOfStock ? t('product.outOfStock') : t('product.availableShort', { count: product.stock })}
          </span>
        </div>
        <button className="add-btn" onClick={() => onAdd(product)} disabled={outOfStock}>
          {outOfStock ? t('product.noStock') : t('product.addToCart')}
        </button>
      </div>
    </article>
  )
}
