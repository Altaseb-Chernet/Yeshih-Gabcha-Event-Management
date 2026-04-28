import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Utensils, 
  Camera, 
  MapPin, 
  Music, 
  Flower,
  Sparkles,
  Heart,
  Crown,
  Star,
  Gem,
  Palette,
  Lightbulb
} from 'lucide-react'
import { getServices } from '../api/services.js'

const ServicesShowcase = () => {
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const categoryMeta = useMemo(() => ({
    catering: { icon: <Utensils className="text-black" size={28} /> },
    decoration: { icon: <Flower className="text-black" size={28} /> },
    entertainment: { icon: <Music className="text-black" size={28} /> },
    photography: { icon: <Camera className="text-black" size={28} /> },
    venue: { icon: <MapPin className="text-black" size={28} /> },
    other: { icon: <Calendar className="text-black" size={28} /> },
  }), [])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getServices({ status: 'active', limit: 100 })
        if (!active) return
        setServices(Array.isArray(data?.services) ? data.services : [])
      } catch (e) {
        if (!active) return
        setError(e?.message || 'Failed to load services')
        setServices([])
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    run()
    return () => {
      active = false
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 0.8
      }
    }
  }

  return (
    <section className="py-24 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 relative overflow-hidden">
      {/* Premium decorative elements */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-primary-50/80 to-transparent dark:from-primary-900/30"></div>
      <div className="absolute top-20 right-10 w-80 h-80 bg-primary-200/40 dark:bg-primary-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-200/30 dark:bg-accent-900/20 rounded-full blur-3xl"></div>
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-primary-400 rounded-full opacity-20 animate-float"></div>
      <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-accent-400 rounded-full opacity-30 animate-float animation-delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-primary-300 rounded-full opacity-25 animate-float animation-delay-2000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center mb-6 p-3 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-2xl"
          >
            <Sparkles className="text-black mr-2" size={24} />
            <span className="text-black font-semibold uppercase tracking-wider text-sm">
              {isAmharic ? 'ባለሙያ አገልግሎቶች' : 'Professional Excellence'}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 font-display bg-gradient-to-r from-neutral-800 to-neutral-600 dark:from-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent"
          >
            {isAmharic ? 'ልዩ የጋብቻ አገልግሎቶች' : 'Exceptional Wedding Services'}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed"
          >
            {isAmharic 
              ? 'ልዩ የተለያዩ አገልግሎቶችን በሙያዊ እና በግለት የተለየ ሁኔታ እናቀርባለን' 
              : 'We deliver unparalleled wedding experiences through our comprehensive suite of premium services'}
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-neutral-600 dark:text-neutral-300 mb-20">
            {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
          </div>
        ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-accent-50/50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-3xl transform group-hover:scale-105 transition-transform duration-500 ease-out"></div>
              
              <div className="relative bg-white/80 dark:bg-neutral-800/90 backdrop-blur-sm rounded-3xl p-8 h-full border border-neutral-200/50 dark:border-neutral-700/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500 ease-out">
                {/* Service Image */}
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img 
                    src={service.images?.[0] || '/public/bread.png'} 
                    alt={service.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = "/public/bread.png";
                    }}
                  />
                </div>

                {/* Icon with animated background */}
                <motion.div 
                  variants={iconVariants}
                  className="mb-6"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300">
                    {categoryMeta[service.category]?.icon || categoryMeta.other.icon}
                  </div>
                </motion.div>

                {/* Title and description */}
                <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2 font-display group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  {service.name}
                </h3>
                
                <p className="text-neutral-600 dark:text-neutral-300 mb-4 leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors duration-300">
                  {service.description || ''}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {service.price.toLocaleString()} Birr
                  </span>
                </div>

                {/* Elegant separator */}
                <div className="absolute bottom-16 left-8 right-8 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-600"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* Premium Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-600/10 to-accent-600/10 dark:from-primary-900/20 dark:to-accent-900/20 rounded-3xl p-12 backdrop-blur-sm border border-primary-500/20 dark:border-primary-400/20">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center mb-6 p-4 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-2xl"
              >
                <Crown className="text-black mr-3" size={28} />
                <span className="text-black font-bold text-lg">
                  {isAmharic ? 'ብጁ አገልግሎት' : 'Custom Service Packages'}
                </span>
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 font-display">
                {isAmharic ? 'የእርስዎን ሕልም የሚገልጽ አገልግሎት' : 'Tailored to Your Vision'}
              </h2>
              
              <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-3xl mx-auto">
                {isAmharic 
                  ? 'ለተለያዩ ፍላጎቶችዎ የተመጣጠነ የጋብቻ አገልግሎት ጥቅሎች' 
                  : 'Our expert team creates bespoke service combinations to perfectly match your unique wedding vision'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  )
}

export default ServicesShowcase