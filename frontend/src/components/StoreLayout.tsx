import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './Navbar'

export default function StoreLayout() {
  const { t } = useTranslation()
  return (
    <div className="store">
      <Navbar />

      <main className="store-main">
        <Outlet />
      </main>

      <footer className="store-footer">
        <div className="footer-brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">
            Aurum<span className="brand-accent">Store</span>
          </span>
        </div>
        <p className="footer-tagline">{t('footer.tagline')}</p>
        <p className="footer-rights">{t('footer.rights', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  )
}
