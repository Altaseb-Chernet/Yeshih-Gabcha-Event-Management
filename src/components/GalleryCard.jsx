import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'

const GalleryCard = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative group overflow-hidden rounded-lg shadow-md"
    >
      <img 
        src={item.image} 
        alt={item.title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="text-white text-center p-4">
          <Eye size={32} className="mx-auto mb-2" />
          <h3 className="text-xl font-semibold">{item.title}</h3>
          <p className="text-sm">{item.description}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default GalleryCard