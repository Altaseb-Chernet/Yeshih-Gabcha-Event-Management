import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  Eye, 
  Heart, 
  Calendar,
  MapPin,
  Star,
  ArrowRight,
  Play,
  Grid,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const UltimateGalleryPreview = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAmharic = i18n.language === 'am'
  const [activeCategory, setActiveCategory] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)

  const categories = [
    { id: 'all', name: isAmharic ? 'ሁሉም' : 'All' },
    { id: 'traditional', name: isAmharic ? 'ባህላዊ' : 'Traditional' },
    { id: 'corporate', name: isAmharic ? 'የቢዝነስ' : 'Corporate' },
    { id: 'decor', name: isAmharic ? 'ዲኮሬሽን' : 'Decoration' },
    { id: 'cultural', name: isAmharic ? 'ባህል' : 'Cultural' }
  ]

  const galleryItems = [
    {
      id: 1,
      image: "/chbcheba.png",
      title: "Traditional Ethiopian Event",
      description: "Beautiful traditional ceremony with cultural attire and customs",
      category: "traditional",
      date: "2024-03-15",
      location: "Addis Ababa",
      amharicTitle: "ባህላዊ የኢትዮጵያ ፕሮግራም",
      amharicDescription: "ውብ ባህላዊ ሥነ ሥርዓት ከባህላዊ ልብስ እና ልምድ",
      featured: true,
      video: false
    },
    {
      id: 2,
      image: "/bread.png",
      title: "Corporate Event",
      description: "Professional corporate gathering with contemporary design elements",
      category: "corporate",
      date: "2024-02-20",
      location: "Addis Ababa",
      amharicTitle: "የቢዝነስ ፕሮግራም",
      amharicDescription: "ባለሙያ የቢዝነስ ስብሰባ ከዘመናዊ ዲዛይን አካላት",
      featured: true,
      video: false
    },
    {
      id: 3,
      image: "/chbcheba.png",
      title: "Cultural Decor",
      description: "Authentic Ethiopian cultural decorations and arrangements",
      category: "decor",
      date: "2024-01-10",
      location: "Addis Ababa",
      amharicTitle: "ባህላዊ ዲኮሬሽን",
      amharicDescription: "እውነተኛ የኢትዮጵያ ባህላዊ ዲኮሬሽን እና አቀማመጥ",
      featured: false,
      video: false
    },
    {
      id: 4,
      image: "/seesee.png",
      title: "Cultural Performances",
      description: "Traditional music and dance performances",
      category: "cultural",
      date: "2024-03-28",
      location: "Addis Ababa",
      amharicTitle: "ባህላዊ ሥራዎች",
      amharicDescription: "ባህላዊ ሙዚቃ እና ዳንስ ሥራዎች",
      featured: false,
      video: true
    },
    {
      id: 5,
      image: "/gursha.png",
      title: "Traditional Attire",
      description: "Gorgeous traditional Ethiopian event attire",
      category: "traditional",
      date: "2024-02-14",
      location: "Addis Ababa",
      amharicTitle: "ባህላዊ ልብስ",
      amharicDescription: "ዓምደኛ ባህላዊ የኢትዮጵያ የፕሮግራም ልብስ",
      featured: true,
      video: false
    },
    {
      id: 6,
      image: "/food.png",
      title: "Contemporary Design",
      description: "Modern event design with elegant touches",
      category: "corporate",
      date: "2024-01-30",
      location: "Debre Birhan",
      amharicTitle: "ዘመናዊ ዲዛይን",
      amharicDescription: "ዘመናዊ የፕሮግራም ዲዛይን ከዓምደኛ ነጸብራቅ",
      featured: false,
      video: false
    }
  ]

  // Filter items based on active category
  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory)

  const featuredItems = galleryItems.filter(item => item.featured)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === featuredItems.length - 1 ? 0 : prevIndex + 1
    )
  }, [featuredItems.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? featuredItems.length - 1 : prevIndex - 1
    )
  }, [featuredItems.length])

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  // Function to navigate to full gallery
  const handleViewFullGallery = () => {
    navigate('/gallery')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const slideVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-50 to-transparent dark:from-primary-900/20"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-900/30 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute top-1/4 left-0 w-32 h-32 bg-accent-100 dark:bg-accent-900/30 rounded-full blur-3xl opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
              <Grid className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
            <h2 className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              {isAmharic ? 'ፎቶ ማከማቻ' : 'Our Gallery'}
            </h2>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 font-display">
            {isAmharic ? 'የተለዩ ጊዜዎች' : 'Captured Moments'}
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            {isAmharic 
              ? 'ከተለያዩ የፕሮግራም ሥነ ሥርዓቶቻችን የተወሰዱ ፎቶዎች እና ቪዲዮዎች' 
              : 'Photos and videos from our various events and celebrations'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16 relative"
        >
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 font-display text-center">
            {isAmharic ? 'የተለዩ ሥራዎች' : 'Featured Work'}
          </h2>
          
          <div className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl dark:shadow-neutral-900/50">
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors dark:bg-white/20 dark:hover:bg-white/30"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors dark:bg-white/20 dark:hover:bg-white/30"
            >
              <ChevronRight size={24} />
            </button>

            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="relative w-full h-full">
                <img
                  src={featuredItems[currentIndex].image}
                  alt={isAmharic ? featuredItems[currentIndex].amharicTitle : featuredItems[currentIndex].title}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
                  <div className="p-8 text-white">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary-600 text-white dark:bg-primary-500 px-3 py-1 rounded-full text-sm font-medium mr-3">
                        {categories.find(cat => cat.id === featuredItems[currentIndex].category)?.name}
                      </div>
                      {featuredItems[currentIndex].video && (
                        <div className="flex items-center bg-red-600 text-white dark:bg-red-500 px-3 py-1 rounded-full text-sm font-medium">
                          <Play size={14} className="mr-1" />
                          Video
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 font-display">
                      {isAmharic ? featuredItems[currentIndex].amharicTitle : featuredItems[currentIndex].title}
                    </h3>
                    
                    <p className="text-gray-200 mb-4">
                      {isAmharic ? featuredItems[currentIndex].amharicDescription : featuredItems[currentIndex].description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar size={16} className="mr-2" />
                      {new Date(featuredItems[currentIndex].date).toLocaleDateString()}
                      <MapPin size={16} className="ml-4 mr-2" />
                      {featuredItems[currentIndex].location}
                    </div>
                  </div>
                </div>

                {featuredItems[currentIndex].video && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <button className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors dark:bg-white/10 dark:hover:bg-white/20">
                      <Play size={32} className="text-white" fill="white" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {featuredItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full transition-all duration-300 font-medium ${
                activeCategory === category.id
                  ? 'bg-primary-600 text-black dark:text-white shadow-lg cursor-pointer'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        <motion.div
          key={activeCategory}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-neutral-900/50 dark:hover:shadow-neutral-900 transition-all duration-300 bg-white dark:bg-neutral-800 dark:border dark:border-neutral-700"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={isAmharic ? item.amharicTitle : item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-4">
                    <button className="bg-white/90 dark:bg-white/80 p-3 rounded-full hover:bg-white dark:hover:bg-white transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye size={20} className="text-neutral-800 dark:text-neutral-900" />
                    </button>
                    <button className="bg-white/90 dark:bg-white/80 p-3 rounded-full hover:bg-white dark:hover:bg-white transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      <Heart size={20} className="text-neutral-800 dark:text-neutral-900" />
                    </button>
                    {item.video && (
                      <button className="bg-white/90 dark:bg-white/80 p-3 rounded-full hover:bg-white dark:hover:bg-white transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                        <Play size={20} fill="currentColor" className="text-neutral-800 dark:text-neutral-900" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="absolute top-4 left-4 bg-primary-600 dark:bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find(cat => cat.id === item.category)?.name}
                </div>

                {item.featured && (
                  <div className="absolute top-4 right-4 bg-amber-500 dark:bg-amber-400 text-white dark:text-neutral-900 p-2 rounded-full">
                    <Star size={16} fill="currentColor" />
                  </div>
                )}

                {item.video && (
                  <div className="absolute top-14 right-4 bg-red-600 dark:bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    <Play size={12} className="inline mr-1" />
                    Video
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                  {isAmharic ? item.amharicTitle : item.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                  {isAmharic ? item.amharicDescription : item.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1" />
                    {item.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-12 text-white shadow-2xl dark:from-primary-700 dark:to-accent-700">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-display">
              {isAmharic ? 'የእርስዎን ፕሮግራም ያህል ያድርጉት' : 'Make Your Event Equally Memorable'}
            </h2>
            <p className="text-primary-100 dark:text-primary-200 mb-8 max-w-2xl mx-auto">
              {isAmharic 
                ? 'እኛን ያግኙ እና የእርስዎን ልዩ ቀን እንዲሁ አስደናቂ እናድርገው' 
                : 'Contact us to make your special occasion equally breathtaking and memorable'}
            </p>
            <button 
              onClick={handleViewFullGallery}
              className="bg-white dark:bg-neutral-100 text-black hover:bg-gray-100 dark:hover:bg-white hover:text-primary-600 dark:hover:text-primary-700 px-8 py-4 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center mx-auto"
            >
              {isAmharic ? 'ሙሉ ፎቶ ማከማቻ ይመልከቱ' : 'View Full Gallery'}
              <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default UltimateGalleryPreview