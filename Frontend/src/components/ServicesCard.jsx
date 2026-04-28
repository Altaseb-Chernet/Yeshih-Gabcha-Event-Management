import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const ServicesCard = ({ service, index }) => {
  const { i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
    >
      <div className="text-4xl mb-4">{service.icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {isAmharic ? service.amharicTitle : service.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {isAmharic ? service.amharicDescription : service.description}
      </p>
    </motion.div>
  )
}

export default ServicesCard