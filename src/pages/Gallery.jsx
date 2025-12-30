import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Share2,
  Heart,
  Clock,
  MapPin,
  Calendar,
  Filter,
  Utensils,
  Grid,
  List,
  Play,
  Expand,
  Users,
  Mic,
  Music,
  Camera,
  ThumbsDown
} from 'lucide-react'

import { getGalleryItems, setGalleryReaction } from '../api/gallery.js'
import { useAuth } from '../contexts/AuthContext.jsx'

const UltimateGallery = () => {
  const { t, i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const isAmharic = i18n.language === 'am'
  const [selectedImage, setSelectedImage] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [sortBy, setSortBy] = useState('date')

  const categories = [
    { id: 'all', name: isAmharic ? 'ሁሉም' : 'All', icon: <Grid size={18} /> },
    { id: 'wedding', name: isAmharic ? 'ጋብቻ' : 'Wedding', icon: <Heart size={18} /> },
    { id: 'birthday', name: isAmharic ? 'ልደት' : 'Birthday', icon: <Calendar size={18} /> },
    { id: 'corporate', name: isAmharic ? 'የቢዝነስ' : 'Corporate', icon: <Users size={18} /> },
    { id: 'decoration', name: isAmharic ? 'ዲኮሬሽን' : 'Decoration', icon: <MapPin size={18} /> },
    { id: 'catering', name: isAmharic ? 'ምግብ' : 'Catering', icon: <Utensils size={18} /> },
    { id: 'other', name: isAmharic ? 'ሌላ' : 'Other', icon: <Filter size={18} /> }
  ]

  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getGalleryItems({ limit: 100 })
        if (!active) return
        const items = Array.isArray(data?.galleryItems) ? data.galleryItems : []
        setGalleryItems(
          items.map((it) => ({
            id: it.id,
            image: it.imageUrl || '/public/bread.png',
            title: it.title,
            description: it.description || '',
            category: it.category || 'other',
            date: it.date || it.createdAt,
            location: it.location || '',
            likeCount: Number(it.likeCount || 0),
            dislikeCount: Number(it.dislikeCount || 0),
            myReaction: it.myReaction || null,
            tags: [],
          }))
        )
      } catch (e) {
        if (!active) return
        setError(e?.message || 'Failed to load gallery')
        setGalleryItems([])
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

  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory)

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date)
    }
    return a.title.localeCompare(b.title)
  })

  const openLightbox = useCallback((image, index) => {
    setSelectedImage(image)
    setLightboxIndex(index)
    setZoomLevel(1)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = useCallback(() => {
    setSelectedImage(null)
    setZoomLevel(1)
    document.body.style.overflow = 'unset'
  }, [])

  const navigateLightbox = useCallback((direction) => {
    let newIndex
    if (direction === 'next') {
      newIndex = (lightboxIndex + 1) % filteredItems.length
    } else {
      newIndex = (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
    }
    setLightboxIndex(newIndex)
    setSelectedImage(filteredItems[newIndex])
    setZoomLevel(1)
  }, [lightboxIndex, filteredItems])

  const handleKeyDown = useCallback((e) => {
    if (selectedImage) {
      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowRight':
          navigateLightbox('next')
          break
        case 'ArrowLeft':
          navigateLightbox('prev')
          break
        case '+':
        case '=':
          setZoomLevel(prev => Math.min(prev + 0.25, 3))
          break
        case '-':
          setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
          break
        default:
          break
      }
    }
  }, [selectedImage, closeLightbox, navigateLightbox])

  const applyReactionToState = useCallback((galleryId, patch) => {
    setGalleryItems((prev) =>
      prev.map((it) => (it.id === galleryId ? { ...it, ...patch } : it))
    )
    setSelectedImage((prev) => (prev && prev.id === galleryId ? { ...prev, ...patch } : prev))
  }, [])

  const handleReaction = useCallback(
    async (galleryId, reaction) => {
      if (!isAuthenticated?.()) {
        alert(isAmharic ? 'እባክዎ መጀመሪያ ይግቡ' : 'Please login first')
        return
      }

      const currentItem = galleryItems.find((g) => g.id === galleryId)
      const next = currentItem?.myReaction === reaction ? null : reaction

      try {
        const res = await setGalleryReaction(galleryId, next)
        applyReactionToState(galleryId, {
          likeCount: Number(res?.likeCount || 0),
          dislikeCount: Number(res?.dislikeCount || 0),
          myReaction: res?.myReaction || null,
        })
      } catch (e) {
        alert(e?.message || (isAmharic ? 'አልተሳካም' : 'Failed'))
      }
    },
    [applyReactionToState, galleryItems, isAuthenticated, isAmharic]
  )

  const downloadImage = useCallback(async (imageUrl, imageName) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${imageName}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }, [])

  const shareImage = useCallback(async (imageUrl, title) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: title,
          url: imageUrl,
        })
      } catch (error) {
        console.error('Sharing failed:', error)
      }
    } else {
      navigator.clipboard.writeText(imageUrl).then(() => {
        alert('Image link copied to clipboard!')
      })
    }
  }, [])

  useState(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

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
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 font-display">
            {isAmharic ? 'የፕሮግራም ፎቶ ማከማቻ' : 'Event Gallery'}
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            {isAmharic 
              ? 'ከተለያዩ የፕሮግራም ሥነ ሥርዓቶቻችን የተወሰዱ ፎቶዎች' 
              : 'Photos from our various events and celebrations'}
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4"
        >
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-full transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-black shadow-lg'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="date">{isAmharic ? 'በቀን' : 'By Date'}</option>
              <option value="name">{isAmharic ? 'በስም' : 'By Name'}</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-600 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-600'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-600'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-neutral-600 dark:text-neutral-300">
            {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
            }
          >
            {sortedItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Image Container */}
              <div className={`relative ${viewMode === 'list' ? 'w-1/3' : 'w-full h-64'}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-zoom-in"
                  onClick={() => openLightbox(item, index)}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => openLightbox(item, index)}
                      className="bg-white/90 p-3 rounded-full hover:bg-white transition-colors"
                    >
                      <Expand size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReaction(item.id, 'like')
                      }}
                      className="bg-white/90 p-3 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart 
                        size={20} 
                        className={item.myReaction === 'like' ? 'text-red-500 fill-red-500' : ''}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReaction(item.id, 'dislike')
                      }}
                      className="bg-white/90 p-3 rounded-full hover:bg-white transition-colors"
                    >
                      <ThumbsDown
                        size={20}
                        className={item.myReaction === 'dislike' ? 'text-gray-800 fill-gray-800' : ''}
                      />
                    </button>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find(cat => cat.id === item.category)?.name}
                </div>
              </div>

              {/* Content */}
              <div className={`p-6 bg-white dark:bg-neutral-800 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                  {item.description}
                </p>
                
                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1" />
                    {item.location}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className={item.myReaction === 'like' ? 'text-red-500 fill-red-500' : ''} />
                    <span>{Number(item.likeCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown size={16} className={item.myReaction === 'dislike' ? 'text-gray-800 fill-gray-800' : ''} />
                    <span>{Number(item.dislikeCount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              <div className="relative max-w-6xl w-full max-h-full">
                {/* Navigation Buttons */}
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-primary-400 transition-colors z-10 bg-black/50 p-3 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateLightbox('prev')
                  }}
                >
                  <ChevronLeft size={32} />
                </button>

                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-primary-400 transition-colors z-10 bg-black/50 p-3 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateLightbox('next')
                  }}
                >
                  <ChevronRight size={32} />
                </button>

                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-white hover:text-primary-400 transition-colors z-10 bg-black/50 p-3 rounded-full"
                  onClick={closeLightbox}
                >
                  <X size={24} />
                </button>

                {/* Image with Zoom */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full h-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="max-w-full max-h-full object-contain"
                    style={{ scale: zoomLevel }}
                    drag
                    dragConstraints={{
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0
                    }}
                  />
                </motion.div>

                {/* Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-lg p-4 flex items-center space-x-4">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                    className="text-white hover:text-primary-400 transition-colors p-2"
                  >
                    <ZoomOut size={20} />
                  </button>
                  
                  <span className="text-white text-sm">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                    className="text-white hover:text-primary-400 transition-colors p-2"
                  >
                    <ZoomIn size={20} />
                  </button>
                  
                  <button
                    onClick={() => downloadImage(selectedImage.image, selectedImage.title)}
                    className="text-white hover:text-primary-400 transition-colors p-2"
                  >
                    <Download size={20} />
                  </button>
                  
                  <button
                    onClick={() => shareImage(selectedImage.image, selectedImage.title)}
                    className="text-white hover:text-primary-400 transition-colors p-2"
                  >
                    <Share2 size={20} />
                  </button>
                  
                  <button
                    onClick={() => handleReaction(selectedImage.id, 'like')}
                    className="text-white hover:text-primary-400 transition-colors p-2"
                  >
                    <Heart 
                      size={20} 
                      className={selectedImage.myReaction === 'like' ? 'text-red-500 fill-red-500' : ''}
                    />
                  </button>
                  <button
                    onClick={() => handleReaction(selectedImage.id, 'dislike')}
                    className="text-white hover:text-primary-400 transition-colors p-2"
                  >
                    <ThumbsDown
                      size={20}
                      className={selectedImage.myReaction === 'dislike' ? 'text-gray-200 fill-gray-200' : ''}
                    />
                  </button>
                </div>

                {/* Info Panel */}
                <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg p-4 max-w-md">
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {selectedImage.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">
                    {selectedImage.description}
                  </p>
                  <div className="text-gray-400 text-xs">
                    <div className="flex items-center mb-1">
                      <Calendar size={14} className="mr-2" />
                      {new Date(selectedImage.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-2" />
                      {selectedImage.location}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default UltimateGallery