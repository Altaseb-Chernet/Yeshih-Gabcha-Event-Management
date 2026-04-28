import { useTranslation } from 'react-i18next'
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  Calendar,
  Camera,
  Utensils,
  Music,
  Flower,
  Twitter,
  Youtube,
  Users,
  Mic,
  Video
} from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'

const Footer = () => {
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const currentYear = new Date().getFullYear()

  const services = [
    { name: isAmharic ? 'የቦታ አዘጋጅ' : 'Venue Setup', icon: <MapPin size={16} /> },
    { name: isAmharic ? 'ምግብ አቅራቢ' : 'Catering', icon: <Utensils size={16} /> },
    { name: isAmharic ? 'ዲኮሬሽን' : 'Decoration', icon: <Flower size={16} /> },
    { name: isAmharic ? 'ዝናብ' : 'Entertainment', icon: <Music size={16} /> },
    { name: isAmharic ? 'ፎቶ/ቪዲዮ' : 'Photo/Video', icon: <Camera size={16} /> },
    { name: isAmharic ? 'አዘጋጅ' : 'Planning', icon: <Calendar size={16} /> },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-accent-600"></div>
      <div className="absolute top-20 right-10 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-white mr-3">
                <Heart size={24} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">YeshiGabcha</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {isAmharic 
                ? 'በአዲስ አበባ እና በዙሪያው የማይረሳ የፕሮግራም ተሞክሮዎችን እየፈጠርን ነው።' 
                : 'Creating unforgettable event experiences in Addis Abeba and beyond.'
              }
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-blue-400 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          {/* Services Section */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-700 inline-block text-white">
              {isAmharic ? 'አገልግሎቶች' : 'Our Services'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {services.map((service, index) => (
                <div key={index} className="flex items-center text-gray-300 hover:text-white transition-colors duration-200 py-1">
                  <span className="text-primary-400 mr-2">{service.icon}</span>
                  <span className="text-sm">{service.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-700 inline-block text-white">
              {isAmharic ? 'አግኙን' : 'Contact Info'}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                  <Phone size={14} className="text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-white">+251 912 345 678</p>
                  <p className="text-sm text-gray-300">+251 911 987 654</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                  <Mail size={14} className="text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-white">info@yeshigabcha.com</p>
                  <p className="text-sm text-gray-300">bookings@yeshigabcha.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                  <MapPin size={14} className="text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Addis Abeba, Ethiopia</p>
                  <p className="text-sm text-gray-300">{isAmharic ? 'አዲስ አበባ አካባቢ' : 'Addis Ababa Area'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links & Language */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-700 inline-block text-white">
              {isAmharic ? 'ፈጣን አገናኞች' : 'Quick Links'}
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">{isAmharic ? 'መነሻ' : 'Home'}</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">{isAmharic ? 'ስለኛ' : 'About'}</a></li>
                <li><a href="/services" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">{isAmharic ? 'አገልግሎቶች' : 'Services'}</a></li>
              </ul>
              <ul className="space-y-2">
                <li><a href="/gallery" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">{isAmharic ? 'ፎቶ' : 'Gallery'}</a></li>
                <li><a href="/booking" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">{isAmharic ? 'ቦታ ማስያዝ' : 'Booking'}</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">{isAmharic ? 'አግኙን' : 'Contact'}</a></li>
              </ul>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-xl">
              <h5 className="text-sm font-semibold mb-2 text-primary-400">{isAmharic ? 'ቋንቋ' : 'Language'}</h5>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} YeshiGabcha Events. {isAmharic ? 'ሁሉም መብቶች የተጠበቁ ናቸው' : 'All rights reserved.'}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors duration-200">
                {isAmharic ? 'የግል መረጃ' : 'Privacy Policy'}
              </a>
              <a href="/terms" className="hover:text-white transition-colors duration-200">
                {isAmharic ? 'የአገልግሎት ውል' : 'Terms of Service'}
              </a>
              <span className="flex items-center">
                <Heart size={12} className="text-red-400 mr-1" />
                {isAmharic ? 'በኢትዮጵያ የተሰራ' : 'Made in Ethiopia'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer