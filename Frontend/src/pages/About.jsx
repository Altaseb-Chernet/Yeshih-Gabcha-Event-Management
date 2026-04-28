import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  Users, 
  Heart, 
  Award, 
  Calendar, 
  Sparkles, 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MessageSquare,
  CheckCircle,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  ArrowRight
} from 'lucide-react'

const About = () => {
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  // Logo accent colors only for icons
  const logoColors = {
    email: '#FF6B35',    // Orange for email
    phone: '#00B4D8',    // Blue for phone
    location: '#06D6A0', // Green for location
    message: '#EF476F',  // Pink for message
    social: '#000000',   // Black for social
    primary: '#22c55e',  // Green from your contact page
    accent: '#3b82f6'    // Blue from your contact page
  }

  const stats = [
    {
      icon: <Users size={40} />,
      number: '250+',
      label: isAmharic ? 'ደስተኛ ጥራዞች' : 'Happy Couples',
      description: isAmharic ? 'ከ2008 ጀምሮ ያገለገልናቸው' : 'Served since 2008',
      iconColor: logoColors.primary
    },
    {
      icon: <Heart size={40} />,
      number: '500+',
      label: isAmharic ? 'የተካሄዱ ጋብቻዎች' : 'Weddings Organized',
      description: isAmharic ? 'በሙሉ ኢትዮጵያ ውስጥ' : 'Across Ethiopia',
      iconColor: logoColors.message
    },
    {
      icon: <Award size={40} />,
      number: '15+',
      label: isAmharic ? 'የሥራ ልምዶች' : 'Years of Experience',
      description: isAmharic ? 'በጋብቻ አዘጋጅነት' : 'In wedding planning',
      iconColor: logoColors.email
    },
    {
      icon: <Calendar size={40} />,
      number: '12',
      label: isAmharic ? 'የበዓላት አይነቶች' : 'Event Types',
      description: isAmharic ? 'ከመላ አይነት አካላት' : 'Comprehensive services',
      iconColor: logoColors.location
    }
  ]

  const testimonials = [
    {
      quote: isAmharic 
        ? 'የሺ ጋብቻ የኛን ሕልም እውን አድርገውታል! ያለ ምንም ችግር እና ከፍተኛ ሙያዊነት ሁሉንም አዘጋጅተውልናል።'
        : 'Yeshi Gabcha made our dream wedding come true! Everything was perfectly organized with professionalism.',
      name: 'Solomon & Marta',
      date: isAmharic ? 'መስከረም 2023' : 'September 2023',
      rating: 5
    },
    {
      quote: isAmharic 
        ? 'ባህላዊ እና ዘመናዊ የጋብቻ ሥነ ሥርዓትን በጥሩ ሁኔታ ያቀላቀሉ ብቸኛው ኩባንያ።'
        : 'The only company that perfectly blends traditional and modern wedding ceremonies.',
      name: 'Michael & Sara',
      date: isAmharic ? 'ጥር 2024' : 'January 2024',
      rating: 5
    },
    {
      quote: isAmharic 
        ? 'ከጀመርንበት አንስቶ እስከ መጨረሻው ድረስ ታማኝነት እና ሙያዊነት። የተሻለ ምርጫ ማድረግ አይቻልም።'
        : 'Professionalism and dedication from start to finish. Could not have made a better choice.',
      name: 'Daniel & Ruth',
      date: isAmharic ? 'ሚያዚያ 2023' : 'April 2023',
      rating: 5
    }
  ]

  const teamMembers = [
    {
      name: 'YONAS GETAW',
      role: isAmharic ? 'ላክትቶ እና ዋና አዘጋጅ' : 'Founder & Lead Planner',
      image: '/yonas.png',
      expertise: isAmharic ? ['ጋብቻ አዘጋጅ', 'ባህላዊ ሥነ ሥርዓት'] : ['Wedding Planning', 'Traditional Ceremonies'],
      experience: '3+ years',
      iconColor: logoColors.primary
    },
    {
      name: 'Muluken kasahun',
      role: isAmharic ? 'የባህል አዘጋጅ' : 'Cultural Coordinator',
      image: '/muluken.png',
      expertise: isAmharic ? ['የባህል ሥርዓቶች', 'የንግግር አዘጋጅ'] : ['Cultural Rituals', 'Speech Coordination'],
      experience: '3+ years',
      iconColor: logoColors.accent
    },
    {
      name: 'Yohannes Birhane',
      role: isAmharic ? 'የውጭ አዘጋጅ' : 'Event Designer',
      image: '/yohannes.png',
      expertise: isAmharic ? ['ዲዛይን', 'የውጭ መስህብ'] : ['Decoration Design', 'Venue Styling'],
      experience: '3+ years',
      iconColor: logoColors.email
    },
    {
      name: 'Altaseb Chernet',
      role: isAmharic ? 'የፎቶ እና ቪዲዮ አዘጋጅ' : 'Photo & Video Director',
      image: '/altaseb.png',
      expertise: isAmharic ? ['ፎቶግራፊ', 'ቪዲዮ ምርት'] : ['Photography', 'Video Production'],
      experience: '3+ years',
      iconColor: logoColors.location
    }
  ]

  const socialLinks = [
    {
      icon: <Facebook size={20} />,
      name: 'Facebook',
      url: 'https://facebook.com/YeshiGabcha',
      color: 'hover:text-blue-600',
      iconColor: logoColors.social
    },
    {
      icon: <Instagram size={20} />,
      name: 'Instagram',
      url: 'https://instagram.com/YeshiGabcha',
      color: 'hover:text-pink-600',
      iconColor: logoColors.social
    },
    {
      icon: <Twitter size={20} />,
      name: 'Twitter',
      url: 'https://twitter.com/YeshiGabcha',
      color: 'hover:text-blue-400',
      iconColor: logoColors.social
    },
    {
      icon: <Linkedin size={20} />,
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/YeshiGabcha',
      color: 'hover:text-blue-700',
      iconColor: logoColors.social
    }
  ]

  // Auto-play testimonials
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-primary-900/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center mb-6 p-3 bg-gradient-to-r from-green-700 to-blue-700 rounded-2xl shadow-lg"
          >
            <MessageSquare className="text-black mr-2" size={24} />
            <span className="text-black font-semibold uppercase tracking-wider text-sm">
              {isAmharic ? 'ስለ እኛ' : 'About Us'}
            </span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 font-display">
            {isAmharic ? 'የሺ ጋብቻ ጋብቻ አዘጋጅ' : 'Yeshi Gabcha Wedding Planning'}
          </h1>
          
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            {isAmharic 
              ? 'በደብረ ብርሃን እና በዙርያዋ ከ15 አመት በላይ ልምድ ያለው የጋብቻ አዘጋጅ ኩባንያ' 
              : 'Premier wedding planning company in Debre Birhan with over 15 years of experience'}
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg"
            >
              <div className="mb-4 flex justify-center">
                <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
                  <div style={{ color: stat.iconColor }}>
                    {stat.icon}
                  </div>
                </div>
              </div>
              <div className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Story Section with improved image sizing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-green-700 to-blue-700 rounded-2xl opacity-20 blur-lg"></div>
            {/* Optimized story image with better sizing */}
            <div className="relative rounded-2xl shadow-2xl overflow-hidden aspect-[4/3] lg:aspect-[5/4]">
              <img 
                src="/story.png" 
                alt="Yeshi Gabcha" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" style={{ color: logoColors.email }} />
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {isAmharic ? '3+ አመት ልምድ' : '3+ Years Experience'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 font-display flex items-center">
              <Sparkles className="w-8 h-8 mr-3" style={{ color: logoColors.primary }} />
              {isAmharic ? 'የእኛ ታሪክ' : 'Our Story'}
            </h2>
            <div className="space-y-4">
              <p className="text-lg text-neutral-600 dark:text-neutral-300">
                {isAmharic 
                  ? 'የሺ ጋብቻ በ2008 ዓ.ም በደብረ ብርሃን ከተማ የተመሠረተ ሲሆን ዋነኛ አላማው ባህላዊ እና ዘመናዊ ኤቨንት ሥነ ሥርዓት ለማቅረብ ነው።' 
                  : 'Yeshi Gabcha was established in 2008 in Debre Birhan with the mission to provide both traditional and modern event ceremonies.'}
              </p>
              <p className="text-lg text-neutral-600 dark:text-neutral-300">
                {isAmharic 
                  ? 'በዓመታት የሸማቾች ዕድል እና የሙዚቃ ልምድ በማግኘት ከፍተኛ ተሞክሮ አግኝተናል። እያንዳንዱ ኤቨንት ልዩ እና ማይረሳ እንዲሆን እንጋራለን።' 
                  : 'Over the years, we have gained extensive experience in customer service and music, ensuring each event is unique and memorable.'}
              </p>
              <p className="text-lg text-neutral-600 dark:text-neutral-300">
                {isAmharic 
                  ? 'አራት ሙያዊ ቡድናችን አብረው ሁሉንም ዝርዝር ከመጀመሪያ እስከ መጨረሻ ድረስ በጥንቃቄ ያዘጋጃሉ።' 
                  : 'Our four professional team members work together to carefully arrange every detail from start to finish.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Team Section with improved image sizing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 font-display">
              {isAmharic ? 'የእኛ ቡድን' : 'Our Team'}
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              {isAmharic 
                ? 'ልዩ ልዩ ችሎታ ያላቸው የባህል ባለሙያዎችን ያቀፈ ቡድን' 
                : 'A team of cultural experts with diverse talents and expertise'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 P-3">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center space-x-2 text-white">
                      <Clock size={16} />
                      <span className="text-sm font-medium">{member.experience}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold mb-4">
                    {member.role}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-20"
        >

       
          {/* Social Media */}
          </motion.div>
      </div>
    </div>
  )
}

export default About