import type { Product } from '../types'
import ProductCard from './ProductCard'

interface ProductListProps {
  products: Product[]
  categoryName: (categoryId: number) => string | undefined
  onAdd: (product: Product) => void
}

// Rejilla de productos. Solo orquesta el mapeo a <ProductCard/> (Requisito 6).
export default function ProductList({ products, categoryName, onAdd }: ProductListProps) {
  if (products.length === 0) {
    return <p className="muted">No hay productos que coincidan con tu búsqueda.</p>
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoryName(product.categoria)}
          onAdd={onAdd}
        />
      ))}
    </div>
  )
}
