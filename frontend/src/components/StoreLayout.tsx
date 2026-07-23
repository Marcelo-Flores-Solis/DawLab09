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
        <p>{t('footer.text')}</p>
      </footer>
    </div>
  )
}
