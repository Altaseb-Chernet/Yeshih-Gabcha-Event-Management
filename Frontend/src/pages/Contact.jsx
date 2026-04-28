  import { useState } from 'react'
  import { useTranslation } from 'react-i18next'
  import { motion } from 'framer-motion'
  import { 
    Mail, 
    Phone, 
    MapPin, 
    Clock, 
    Send, 
    MessageCircle,
    Calendar,
    User,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    MessageSquare
  } from 'lucide-react'

  const UltimateContactPage = () => {
    const { t, i18n } = useTranslation()
    const isAmharic = i18n.language === 'am'
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      eventType: '',
      message: '',
      preferredContact: 'email',
      eventDate: '',
      guestCount: '',
      budgetRange: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState('') // '', 'success', 'error'

    // Logo accent colors only for icons
    const logoColors = {
      email: '#FF6B35',    // Orange for email
      phone: '#00B4D8',    // Blue for phone
      location: '#06D6A0', // Green for location
      message: '#EF476F',  // Pink for message
      social: '#000000',   // Black for social
    }

    const contactMethods = [
      {
        icon: <Mail size={24} />,
        title: isAmharic ? 'ኢሜይል' : 'Email',
        value: 'info@yeshigabcha.com',
        description: isAmharic ? '24 ሰዓት ውስጥ እንመልሳለን' : 'We respond within 24 hours',
        action: 'mailto:info@yeshigabcha.com',
        iconColor: logoColors.email
      },
      {
        icon: <Phone size={24} />,
        title: isAmharic ? 'ስልክ' : 'Phone',
        value: '+251 912 345 678',
        description: isAmharic ? 'ሰኞ-አርብ: 8:00 AM - 6:00 PM' : 'Mon-Fri: 8:00 AM - 6:00 PM',
        action: 'tel:+251912345678',
        iconColor: logoColors.phone
      },
      {
        icon: <MapPin size={24} />,
        title: isAmharic ? 'አድራሻ' : 'Address',
        value: isAmharic ? 'አዲስ አበባ, ኢትዮጵያ' : 'Addis Abeba, Ethiopia',
        description: isAmharic ? 'ዋና ቢሮ' : 'Main Office',
        action: 'https://maps.google.com/?q=Addis+Abeba,Ethiopia',
        iconColor: logoColors.location
      },
      {
        icon: <MessageCircle size={24} />,
        title: isAmharic ? 'ፈጣን መልዕክት' : 'Quick Chat',
        value: isAmharic ? 'ቴሌግራም' : 'Telegram',
        description: isAmharic ? '@YeshiGabcha' : '@YeshiGabcha',
        action: 'https://t.me/YeshiGabcha',
        iconColor: logoColors.message
      }
    ]

    const eventTypes = [
      { value: 'corporate', label: isAmharic ? 'የቢዝነስ ፕሮግራም' : 'Corporate Event' },
      { value: 'conference', label: isAmharic ? 'ስብሰባ' : 'Conference' },
      { value: 'cultural', label: isAmharic ? 'ባህላዊ ፕሮግራም' : 'Cultural Celebration' },
      { value: 'private', label: isAmharic ? 'ግላዊ ፕሮግራም' : 'Private Celebration' },
      { value: 'exhibition', label: isAmharic ? 'ኤግዚቢሽን' : 'Exhibition' },
      { value: 'other', label: isAmharic ? 'ሌላ' : 'Other' }
    ]

    const budgetRanges = [
      { value: 'basic', label: isAmharic ? 'መሠረታዊ' : 'Basic' },
      { value: 'standard', label: isAmharic ? 'መደበኛ' : 'Standard' },
      { value: 'premium', label: isAmharic ? 'ፕሪሚየም' : 'Premium' },
      { value: 'luxury', label: isAmharic ? 'ሊዩክሽሪ' : 'Luxury' }
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

    const handleInputChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      })
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setIsSubmitting(true)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Random success for demo
        const isSuccess = Math.random() > 0.3
        setSubmitStatus(isSuccess ? 'success' : 'error')
        
        if (isSuccess) {
          setFormData({
            name: '',
            email: '',
            phone: '',
            eventType: '',
            message: '',
            preferredContact: 'email',
            eventDate: '',
            guestCount: '',
            budgetRange: ''
          })
        }
      } catch (error) {
        setSubmitStatus('error')
      } finally {
        setIsSubmitting(false)
        setTimeout(() => setSubmitStatus(''), 5000)
      }
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
              className="inline-flex items-center justify-center mb-6 p-3 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-lg"
            >
              <MessageSquare className="text-black mr-2" size={24} />
              <span className="text-black font-semibold uppercase tracking-wider text-sm">
                {isAmharic ? 'አግኙን' : 'Get In Touch'}
              </span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 font-display">
              {isAmharic ? 'የእርስዎን ፕሮግራም እንዴት ልንረዳዎ እንችላለን' : 'How Can We Help With Your Event?'}
            </h1>
            
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              {isAmharic 
                ? 'ለፕሮግራምዎ እቅድ ነፃ የምክር ዝግጅት ያዝጋጁ። ቡድናችን እርስዎን ለማማከር ዝግጁ ነው።' 
                : 'Schedule a free consultation for your event plans. Our team is ready to assist you.'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Contact Methods */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 font-display">
                  {isAmharic ? 'የመገናኛ መንገዶች' : 'Contact Methods'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contactMethods.map((method, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="group"
                    >
                      <a
                        href={method.action}
                        target={method.action.startsWith('http') ? '_blank' : undefined}
                        rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="block bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-600"
                      >
                        <div className="flex items-start mb-4">
                          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl mr-4">
                            <div style={{ color: method.iconColor }}>
                              {method.icon}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">
                              {method.title}
                            </h3>
                            <p className="text-primary-600 dark:text-primary-400 font-medium">
                              {method.value}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          {method.description}
                        </p>
                        <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                          <span className="text-sm font-medium">
                            {isAmharic ? 'ጫን' : 'Click to connect'}
                          </span>
                          <ArrowRight size={16} className="ml-2" />
                        </div>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <motion.div variants={itemVariants}>
                <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <Clock className="mr-3" size={24} style={{ color: logoColors.email }} />
                    <h3 className="text-black font-semibold">
                      {isAmharic ? 'የሥራ ሰዓት' : 'Business Hours'}
                    </h3>
                  </div>
                  <div className="space-y-2 text-black">
                    <div className="flex justify-between">
                      <span>{isAmharic ? 'ሰኞ - አርብ' : 'Monday - Friday'}</span>
                      <span className="font-medium">8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAmharic ? 'ቅዳሜ' : 'Saturday'}</span>
                      <span className="font-medium">9:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAmharic ? 'እሑድ' : 'Sunday'}</span>
                      <span className="font-medium">{isAmharic ? 'የተዘጋ' : 'Closed'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Social Media */}
              <motion.div variants={itemVariants}>
                <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                    {isAmharic ? 'ማህበራዊ ሚዲያ' : 'Social Media'}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                    {isAmharic 
                      ? 'በማህበራዊ ሚዲያ ላይ ይከተሉን እና የቅርብ ዝመናዎችን ያግኙ' 
                      : 'Follow us on social media for the latest updates and inspiration'}
                  </p>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-300 transition-all duration-300 hover:scale-110 ${social.color}`}
                        aria-label={social.name}
                      >
                        <div style={{ color: social.iconColor }}>
                          {social.icon}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-8 border border-neutral-200/50 dark:border-neutral-700/50 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 font-display">
                {isAmharic ? 'የፕሮግራም መረጃ ያስገቡ' : 'Submit Your Event Details'}
              </h2>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-center">
                    <CheckCircle className="text-green-600 mr-3" size={20} style={{ color: logoColors.location }} />
                    <span className="text-green-800 dark:text-green-200">
                      {isAmharic 
                        ? 'መረጃዎ ተልኳል! በቅርብ ጊዜ እናግኝዎታለን።' 
                        : 'Information sent successfully! We will contact you shortly.'}
                    </span>
                  </div>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-center">
                    <AlertCircle className="text-red-600 mr-3" size={20} style={{ color: logoColors.message }} />
                    <span className="text-red-800 dark:text-red-200">
                      {isAmharic 
                        ? 'መረጃ ላለመላክ ስህተት ተፈጥሯል። እባክዎ ደግመው ይሞክሩ።' 
                        : 'Error sending information. Please try again.'}
                    </span>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
                      {isAmharic ? 'ሙሉ ስም' : 'Full Name'} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-neutral-400" size={20} style={{ color: logoColors.social }} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
                        placeholder={isAmharic ? 'የእርስዎ ስም' : 'Your name'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-neutral-400" size={20} style={{ color: logoColors.email }} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
                      {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-neutral-400" size={20} style={{ color: logoColors.phone }} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
                        placeholder={isAmharic ? '09XXXXXXXX' : '09XXXXXXXX'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
                      {isAmharic ? 'የፕሮግራም አይነት' : 'Event Type'} *
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
                    >
                      <option value="">{isAmharic ? 'ምረጡ' : 'Select event type'}</option>
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
                      {isAmharic ? 'የፕሮግራም ቀን' : 'Event Date'}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-neutral-400" size={20} style={{ color: logoColors.email }} />
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
                      {isAmharic ? 'የእንግዶች ብዛት' : 'Guest Count'}
                    </label>
                    <input
                      type="number"
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
                      placeholder={isAmharic ? 'የተሳታፊዎች ብዛት' : 'Number of attendees'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
                    {isAmharic ? 'የበጀት ክልል' : 'Budget Range'}
                  </label>
                  <select
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
                  >
                    <option value="">{isAmharic ? 'ምረጡ' : 'Select budget range'}</option>
                    {budgetRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
                    {isAmharic ? 'የተፈለገው የመገናኛ ዘዴ' : 'Preferred Contact Method'}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['email', 'phone'].map((method) => (
                      <label key={method} className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value={method}
                          checked={formData.preferredContact === method}
                          onChange={handleInputChange}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-neutral-700 dark:text-neutral-300">
                          {isAmharic 
                            ? (method === 'email' ? 'ኢሜይል' : 'ስልክ')
                            : (method === 'email' ? 'Email' : 'Phone')
                          }
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
                    {isAmharic ? 'ተጨማሪ መረጃ' : 'Additional Information'} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
                    placeholder={isAmharic ? 'ስለ ፕሮግራምዎ ተጨማሪ መረጃ...' : 'Tell us more about your event...'}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-700 to-blue-700 hover:from-primary-700 hover:to-accent-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isAmharic ? 'በመላክ ላይ...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send size={20} className="mr-2" style={{ color: logoColors.social }} />
                      {isAmharic ? 'መረጃ ይላኩ' : 'Submit Information'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  export default UltimateContactPage