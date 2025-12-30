import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200 border border-gray-200 dark:border-neutral-700"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-gray-600" />
      )}
    </button>
  )
}
export default ThemeToggle
