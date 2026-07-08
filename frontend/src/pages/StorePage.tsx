import { useMemo, useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import ProductList from '../components/ProductList'
import type { Product } from '../types'

export default function StorePage() {
  const { data: products = [], isLoading, isError } = useProducts()
  const { data: categories = [] } = useCategories()

  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')

  const { addItem } = useCart()
  const { notify } = useToast()

  const categoryName = useMemo(() => {
    const map = new Map<number, string>()
    categories.forEach((c) => map.set(c.id, c.nombre))
    return (id: number) => map.get(id)
  }, [categories])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = activeCat === 'all' || p.categoria === Number(activeCat)
      const matchesSearch = p.nombre.toLowerCase().includes(search.trim().toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [products, activeCat, search])

  function handleAdd(product: Product) {
    if (product.stock <= 0) {
      notify('Producto sin stock', 'error')
      return
    }
    addItem(product, 1)
    notify(`${product.nombre} añadido al carrito`)
  }

  return (
    <div className="store-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Tecnología seleccionada</span>
          <h1 className="hero-title">
            Equípate con lo mejor,
            <br />
            al mejor precio.
          </h1>
          <p className="hero-subtitle">
            Explora nuestro catálogo, arma tu carrito y realiza tu pedido en segundos.
          </p>
        </div>
        <div className="hero-glow" aria-hidden="true" />
      </section>

      <section className="catalog">
        <div className="catalog-toolbar">
          <input
            className="search-input"
            type="search"
            placeholder="Buscar productos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="chips">
            <button
              className={`chip ${activeCat === 'all' ? 'chip-active' : ''}`}
              onClick={() => setActiveCat('all')}
            >
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`chip ${activeCat === String(c.id) ? 'chip-active' : ''}`}
                onClick={() => setActiveCat(String(c.id))}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </div>

        {isError && (
          <p className="error">
            No se pudieron cargar los productos. Verifica tu sesión o el servidor.
          </p>
        )}

        {isLoading ? (
          <p className="muted">Cargando catálogo…</p>
        ) : (
          <ProductList products={filtered} categoryName={categoryName} onAdd={handleAdd} />
        )}
      </section>
    </div>
  )
}
