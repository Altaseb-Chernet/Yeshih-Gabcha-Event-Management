import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
  Lightbulb,
  Users,
  Shield,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UltimateServicesSection = () => {
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      title: "Complete Event Planning",
      description: "End-to-end event coordination with meticulous attention to detail and flawless execution. Our expert planners handle every aspect of your special occasion.",
      icon: <Calendar className="text-white" size={28} />,
      amharicTitle: "ሙሉ የፕሮግራም እቅድ",
      amharicDescription: "ከመጀመርያ እስከ መጨረሻ የሚያቀናብር የፕሮግራም እቅድ እና አቀናባሪ አገልግሎት በዝርዝር ትኩረት እና ፍጹም አፈፃፀም።",
      features: ["Timeline Management", "Vendor Coordination", "Day-of Execution", "Budget Planning", "Guest Management"],
      amharicFeatures: ["የጊዜ እቅድ", "የአገልግሎት አቅራቢ አስተባባሪ", "የቀን አፈፃፀም", "የበጀት እቅድ", "የእንግዶች አስተዳደር"],
      iconBg: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "Gourmet Catering Services",
      description: "Exquisite culinary experiences featuring traditional Ethiopian and international cuisine prepared by master chefs with premium ingredients.",
      icon: <Utensils className="text-white" size={28} />,
      amharicTitle: "ልዩ ምግብ አቅራቢ",
      amharicDescription: "የተለየ የምግብ ተሞክሮ ባህላዊ የኢትዮጵያ እና አለምአቀፍ ምግቦች በሙያ ሾፎች እና በጥራት ያለው ንጥረ ነገር።",
      features: ["Traditional Ethiopian Cuisine", "International Menu Options", "Dietary Accommodations", "Presentation Excellence", "Premium Ingredients"],
      amharicFeatures: ["ባህላዊ የኢትዮጵያ ምግብ", "ዓለም አቀፍ ምናሌ", "የምግብ ልምድ አስገባት", "በሚገባ አቀራረብ", "ጥራት ያለው ንጥረ ነገር"],
      iconBg: "from-emerald-500 to-emerald-600"
    },
    {
      id: 3,
      title: "Professional Photography",
      description: "Capturing your special moments with artistic vision and technical excellence. Premium equipment and creative storytelling.",
      icon: <Camera className="text-white" size={28} />,
      amharicTitle: "ፕሮፌሽናል ፎቶግራፍ",
      amharicDescription: "የተለዩ ጊዜዎችዎን በአርትኦት ራእይ እና ቴክኒካዊ ፍጹምነት ማንጠልጠል። ጥራት ያለው መሣሪያ እና ፈጠራአማ ታሪክ መስራት።",
      features: ["Creative Storytelling", "4K Resolution", "Digital Archives", "Custom Albums", "Drone Photography"],
      amharicFeatures: ["ፈጠራአማ ታሪክ መስራት", "4K ጥራት", "ዲጂታሪ ማህደር", "ብጁ አልበም", "ድሮን ፎቶግራፍ"],
      iconBg: "from-purple-500 to-purple-600"
    },
    {
      id: 4,
      title: "Exclusive Venue Selection",
      description: "Curated locations that provide the perfect backdrop for your celebration. From traditional settings to modern luxury spaces.",
      icon: <MapPin className="text-white" size={28} />,
      amharicTitle: "ልዩ የቦታ ምርጫ",
      amharicDescription: "ርካቢ የሆኑ ቦታዎች ፍጹም ዳራ ለበዓልዎ። ከባህላዊ አካባቢዎች እስከ ዘመናዊ የሊዩክሽር ቦታዎች።",
      features: ["Indoor & Outdoor Options", "Capacity Planning", "Location Scouting", "Layout Design", "Venue Decoration"],
      amharicFeatures: ["በባዶ እና ውጪ ምርጫ", "የሚገቡ ሰዎች እቅድ", "የቦታ መምረጻ", "የቦታ አቀማመጥ", "የቦታ ዲኮሬሽን"],
      iconBg: "from-amber-500 to-amber-600"
    },
    {
      id: 5,
      title: "Entertainment Production",
      description: "Creating unforgettable experiences through music, dance, and cultural performances. Professional sound and lighting production.",
      icon: <Music className="text-white" size={28} />,
      amharicTitle: "የዝናብ ምርት",
      amharicDescription: "የማይረሳ ተሞክሮ በሙዚቃ፣ በዳንስ እና በባህላዊ ሥራዎች። ፕሮፌሽናል ድምፅ እና የብርሃን ምርት።",
      features: ["Live Musical Performances", "Traditional Dancers", "Sound Engineering", "Lighting Design", "Cultural Shows"],
      amharicFeatures: ["በቀጥታ ሙዚቃ", "ባህላዊ ዳንሰኞች", "የድምፅ ምህንድስና", "የብርሃን ዲዛይን", "ባህላዊ ሥራዎች"],
      iconBg: "from-rose-500 to-rose-600"
    },
    {
      id: 6,
      title: "Luxury Decor & Design",
      description: "Transforming spaces into breathtaking environments that reflect your unique style. Custom installations and floral masterpieces.",
      icon: <Flower className="text-white" size={28} />,
      amharicTitle: "የሊዩክሽር ዲኮሬሽን",
      amharicDescription: "ቦታዎችን ወደ አስደናቂ አካባቢዎች ቀይረን ልዩ የእርስዎን ዘይቤ የሚያንፀባርቅ። ብጁ መገጣጠሚያዎች እና የፍሬ ሥራዎች።",
      features: ["Floral Masterpieces", "Lighting Design", "Custom Installations", "Theme Development", "Setup & Teardown"],
      amharicFeatures: ["የፍሬ ሥራዎች", "የብርሃን ዲዛይን", "ብጁ መገጣጠሚያዎች", "የጭብጥ እድገት", "ማዋቀር እና ማፍረስ"],
      iconBg: "from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    { number: "500+", label: isAmharic ? "ደስተኛ ደንበኞች" : "Happy Clients", icon: <Heart className="text-blue-500" size={20} /> },
    { number: "15+", label: isAmharic ? "የሥራ ልምድ" : "Years Experience", icon: <Award className="text-emerald-500" size={20} /> },
    { number: "98%", label: isAmharic ? "ደስተኛ ደንበኞች" : "Satisfaction Rate", icon: <Star className="text-amber-500" size={20} /> },
    { number: "24/7", label: isAmharic ? "ድጋፍ" : "Support", icon: <Shield className="text-purple-500" size={20} /> }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

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
  };

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
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const handleViewAllServices = () => {
    navigate('/services');
  };

  const handleFreeConsultation = () => {
    navigate('/contact');
  };

  return (
    <section className="py-24 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-primary-50/80 to-transparent dark:from-primary-900/30"></div>
      <div className="absolute top-20 right-10 w-80 h-80 bg-primary-200/40 dark:bg-primary-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-200/30 dark:bg-accent-900/20 rounded-full blur-3xl"></div>

      <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-primary-400 rounded-full opacity-20 animate-float"></div>
      <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-emerald-400 rounded-full opacity-30 animate-float animation-delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-purple-300 rounded-full opacity-25 animate-float animation-delay-2000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {isAmharic ? 'ልዩ የፕሮግራም አገልግሎቶች' : 'Exceptional Event Services'}
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
              : 'We deliver unparalleled event experiences through our comprehensive suite of premium services'}
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={statVariants}
              className="text-center p-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg"
            >
              <div className="flex justify-center mb-3">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

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
                <motion.div
                  variants={iconVariants}
                  className="mb-8"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${service.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300`}>
                    {service.icon}
                  </div>
                </motion.div>

                <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 font-display group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  {isAmharic ? service.amharicTitle : service.title}
                </h3>

                <p className="text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors duration-300">
                  {isAmharic ? service.amharicDescription : service.description}
                </p>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4 uppercase tracking-wider flex items-center">
                    <Lightbulb size={16} className="mr-2 text-primary-500" />
                    {isAmharic ? 'የተካተቱ አገልግሎቶች' : 'Service Highlights'}
                  </h4>
                  <ul className="space-y-3">
                    {(isAmharic ? service.amharicFeatures : service.features).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-300">
                        <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <CheckCircle size={12} className="text-primary-600" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
                {isAmharic ? 'የእርስዎን ፕሮግራም የሚገልጽ አገልግሎት' : 'Tailored to Your Vision'}
              </h2>

              <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-3xl mx-auto">
                {isAmharic
                  ? 'ለተለያዩ ፍላጎቶችዎ የተመጣጠነ የፕሮግራም አገልግሎት ጥቅሎች'
                  : 'Our expert team creates bespoke service combinations to perfectly match your unique event vision'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="bg-gradient-to-r from-green-900 to-black hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={handleFreeConsultation}
                >
                  {isAmharic ? 'ነፃ የምክር ዝግጅት' : 'Free Consultation'}
                </button>
                <button
                  className="border-2 border-primary-600 text-green-600 hover:bg-black hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                  onClick={handleViewAllServices}
                >
                  {isAmharic ? 'አገልግሎቶችን ይመልከቱ' : 'View All Services'}
                </button>
              </div>
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
  );
};

export default UltimateServicesSection;