import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const TestimonialCard = ({ testimonial, index }) => {
  const { i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={20} className="text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
        "{isAmharic ? testimonial.amharicComment : testimonial.comment}"
      </p>
      <div className="flex items-center">
        <img 
          src={testimonial.image} 
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
        </div>
      </div>
    </motion.div>
  )
}

export default TestimonialCard