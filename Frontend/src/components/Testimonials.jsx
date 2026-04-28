import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Calendar, MapPin } from 'lucide-react';

const UltimateTestimonialsSection = () => {
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Alem & Michael",
      date: "January 15, 2024",
      eventType: "Traditional Ethiopian Celebration",
      location: "Addis Ababa, Ethiopia",
      rating: 5,
      content: "YeshiGabcha made our event dreams come true! The traditional elements were perfectly blended with modern touches. Our families were so impressed with the authentic Ethiopian traditions incorporated into our special day.",
      amharicContent: "የሺጋብቻ የፕሮግራም ሕልሞቻችንን እውን አደረገ! ባህላዊ አካላት ከዘመናዊ ነገሮች ጋር በእጅጉ ተቀላቅለዋል። ቤተሰቦቻችን በተለየ ቀናችን ውስጥ የተካተቱት እውነተኛ የኢትዮጵያ ባህሎች በጣም አስደስተዋቸዋል።",
      image: "A&M"
    },
    {
      id: 2,
      name: "Selam & Daniel",
      date: "March 22, 2024",
      eventType: "Premium Event Package",
      location: "Dire Dawa, Ethiopia",
      rating: 5,
      content: "The attention to detail was incredible. From the authentic catering to the beautiful traditional attire, everything was perfect. Thank you for making our event truly memorable!",
      amharicContent: "ለዝርዝሩ የተሰጠው ትኩረት አስደናቂ ነበር። ከእውነተኛው ምግብ አቅራቦት እስከ ቆንጆ ባህላዊ አለባበስ ድረስ ሁሉም ነገር ፍጹም ነበር። ፕሮግራማችንን በእውነት የማይረሳ ለማድረግ እናመሰግናለን!",
      image: "S&D"
    },
    {
      id: 3,
      name: "Meron & Yonas",
      date: "May 5, 2024",
      eventType: "Royal Event Experience",
      location: "Bahir Dar, Ethiopia",
      rating: 5,
      content: "We could not have asked for a better event planning experience. The team was professional, organized, and truly understood our vision. The cultural elements were authentic and beautifully executed.",
      amharicContent: "ለዚህ የተሻለ የፕሮግራም ዕቅድ ተሞክሮ ልንጠይቅ አንችልም። ቡድኑ ባለሙያ፣ በደንብ የተደራጁ እና ራዕያችንን በእውነት የሚረዱ ነበሩ። የባህል አካላት እውነተኛ እና በውበት ተካሂደዋል።",
      image: "M&Y"
    },
    {
      id: 4,
      name: "Tigist & Haile",
      date: "February 14, 2024",
      eventType: "Traditional Ceremony",
      location: "Hawassa, Ethiopia",
      rating: 5,
      content: "The traditional coffee ceremony was the highlight of our event. Our guests are still talking about it! YeshiGabcha captured the essence of Ethiopian culture in the most beautiful way.",
      amharicContent: "ባህላዊው የቡና ሥነ ሥርዓት የፕሮግራማችን ዋና ነገር ነበር። እንግዶቻችን አሁንም በስለው ነው! የሺጋብቻ የኢትዮጵያ ባህልን ኮረጆ በጣም ቆንጆ አሰተናገደ።",
      image: "T&H"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={20}
        className={index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

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

  return (
    <section className="py-24 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-emerald-50/80 to-transparent dark:from-emerald-900/30"></div>
      <div className="absolute top-20 right-10 w-80 h-80 bg-emerald-200/40 dark:bg-emerald-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-amber-200/30 dark:bg-amber-900/20 rounded-full blur-3xl"></div>
      
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
            className="inline-flex items-center justify-center mb-6 p-3 bg-gradient-to-r from-emerald-600 to-amber-600 rounded-2xl shadow-2xl"
          >
            <Heart className="text-white mr-2" size={24} />
            <span className="text-white font-semibold uppercase tracking-wider text-sm">
              {isAmharic ? 'ደስተኛ ደንበኞች' : 'Happy Clients'}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 font-serif bg-gradient-to-r from-neutral-800 to-neutral-600 dark:from-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent"
          >
            {isAmharic ? 'ስለ እኛ የሚሉት' : 'What Clients Say'}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed"
          >
            {isAmharic 
              ? 'ከፕሮግራማቸውን በእኛ ጋር ያሳለፉ ደስተኛ ደንበኞች ያንጸባርቋል' 
              : 'Heartfelt stories from clients who celebrated their special occasions with YeshiGabcha'}
          </motion.p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 dark:bg-neutral-800/90 backdrop-blur-sm rounded-3xl p-8 border border-neutral-200/50 dark:border-neutral-700/50 shadow-2xl"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {testimonials[currentIndex].image}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <Quote className="text-emerald-400/30 mb-4" size={40} />
                    
                    <div className="flex mb-4">
                      {renderStars(testimonials[currentIndex].rating)}
                    </div>
                    
                    <p className="text-lg text-neutral-700 dark:text-neutral-200 italic mb-6 leading-relaxed">
                      "{isAmharic ? testimonials[currentIndex].amharicContent : testimonials[currentIndex].content}"
                    </p>
                    
                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                      <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2 font-serif">
                        {testimonials[currentIndex].name}
                      </h3>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-neutral-600 dark:text-neutral-300">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-emerald-500" />
                          {testimonials[currentIndex].date}
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2 text-amber-500" />
                          {testimonials[currentIndex].location}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        {testimonials[currentIndex].eventType}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white dark:bg-neutral-800 rounded-full p-3 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors duration-300"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="text-emerald-600 dark:text-emerald-400" size={24} />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white dark:bg-neutral-800 rounded-full p-3 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors duration-300"
            aria-label="Next testimonial"
          >
            <ChevronRight className="text-emerald-600 dark:text-emerald-400" size={24} />
          </button>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-emerald-600 scale-125' 
                    : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-emerald-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {[
            { number: "500+", label: isAmharic ? "ደስተኛ ደንበኞች" : "Happy Clients" },
            { number: "98%", label: isAmharic ? "ደስተኛ ደንበኞች" : "Satisfaction Rate" },
            { number: "15+", label: isAmharic ? "የሥራ ልምድ" : "Years Experience" },
            { number: "100%", label: isAmharic ? "ባህላዊነት" : "Authentic Culture" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center p-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg"
            >
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default UltimateTestimonialsSection;