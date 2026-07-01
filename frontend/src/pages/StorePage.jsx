import { useEffect, useMemo, useState } from 'react'
import { productsApi, categoriesApi } from '../api/resources'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import ProductThumb from '../components/ProductThumb'

export default function StorePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')

  const { addItem } = useCart()
  const { notify } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [prods, cats] = await Promise.all([productsApi.list(), categoriesApi.list()])
        setProducts(prods)
        setCategories(cats)
        setError(null)
      } catch {
        setError('No se pudieron cargar los productos. Verifica tu sesión o el servidor.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categoryName = useMemo(() => {
    const map = {}
    categories.forEach((c) => {
      map[c.id] = c.nombre
    })
    return map
  }, [categories])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = activeCat === 'all' || p.categoria === Number(activeCat)
      const matchesSearch = p.nombre.toLowerCase().includes(search.trim().toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [products, activeCat, search])

  function handleAdd(product) {
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
          <h1 className="hero-title">Equípate con lo mejor,<br />al mejor precio.</h1>
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

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="muted">Cargando catálogo…</p>
        ) : filtered.length === 0 ? (
          <p className="muted">No hay productos que coincidan con tu búsqueda.</p>
        ) : (
          <div className="product-grid">
            {filtered.map((p) => {
              const outOfStock = p.stock <= 0
              return (
                <article className="product-card" key={p.id}>
                  <ProductThumb id={p.id} categoryName={categoryName[p.categoria]} imageUrl={p.imagen} />
                  <div className="product-body">
                    <span className="product-cat">{categoryName[p.categoria] ?? 'General'}</span>
                    <h3 className="product-name">{p.nombre}</h3>
                    <p className="product-desc">{p.descripcion}</p>
                    <div className="product-footer">
                      <span className="product-price">S/ {Number(p.precio).toFixed(2)}</span>
                      <span className={`stock-tag ${outOfStock ? 'stock-out' : ''}`}>
                        {outOfStock ? 'Agotado' : `${p.stock} disp.`}
                      </span>
                    </div>
                    <button
                      className="add-btn"
                      onClick={() => handleAdd(p)}
                      disabled={outOfStock}
                    >
                      {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
