import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center text-gray-700  hover:text-primary p-2 rounded-md"
      aria-label="Switch language"
    >
      <Globe size={20} className="mr-1" />
      <span className="text-sm font-medium">
        {i18n.language === 'en' ? 'EN' : 'AM'}
      </span>
    </button>
  )
}

export default LanguageSwitcher