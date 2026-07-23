import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import ProductList from '../components/ProductList'
import type { Product } from '../types'

export default function StorePage() {
  const { t } = useTranslation()
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
      notify(t('toast.outOfStock'), 'error')
      return
    }
    addItem(product, 1)
    notify(t('toast.addedToCart', { name: product.nombre }))
  }

  return (
    <div className="store-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">{t('store.eyebrow')}</span>
          <h1 className="hero-title">
            {t('store.heroTitle1')}
            <br />
            {t('store.heroTitle2')}
          </h1>
          <p className="hero-subtitle">{t('store.heroSubtitle')}</p>
        </div>
        <div className="hero-glow" aria-hidden="true" />
      </section>

      <section className="catalog">
        <div className="catalog-toolbar">
          <input
            className="search-input"
            type="search"
            placeholder={t('store.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="chips">
            <button
              className={`chip ${activeCat === 'all' ? 'chip-active' : ''}`}
              onClick={() => setActiveCat('all')}
            >
              {t('store.all')}
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

        {isError && <p className="error">{t('store.loadError')}</p>}

        {isLoading ? (
          <p className="muted">{t('store.loadingCatalog')}</p>
        ) : (
          <ProductList products={filtered} categoryName={categoryName} onAdd={handleAdd} />
        )}
      </section>
    </div>
  )
}
