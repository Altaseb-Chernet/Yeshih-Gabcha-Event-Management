import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import LanguageSwitcher from './LanguageSwitcher'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const { i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const navigate = useNavigate()

  return (
    <section
      className="relative h-screen flex items-center justify-center bg-cover bg-center bg-fixed pt-16"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 text-center text-white px-4 max-w-4xl">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          {isAmharic
            ? 'የማይረሱ የኢትዮጵያ ዝግጅቶችን እንፈጥራለን'
            : 'Crafting Unforgettable Ethiopian Events'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-8"
        >
          {isAmharic
            ? 'ባህላዊና ዘመናዊ የዝግጅት አዘጋጅነት በአዲስ አበባ'
            : 'Traditional & Modern Event Planning in Addis Ababa'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/booking')}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors"
          >
            {isAmharic ? 'ዝግጅትዎን ያቅዱ' : 'Plan Your Event'}
          </button>

          <button
            onClick={() => navigate('/services')}
            className="border-2 border-white hover:bg-white/10 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors"
          >
            {isAmharic ? 'አገልግሎቶቻችንን ይመልከቱ' : 'View Our Services'}
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
