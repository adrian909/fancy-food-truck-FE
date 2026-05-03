import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Truck, Timer, Flame } from "lucide-react";
import { smoothScrollTo } from "../../shared/utils/smoothScroll";
import { useMobileOptimization } from "../hooks/useMobileOptimization";
import { useLanguage } from "../hooks/useLanguage";


export default function Hero({ dark }) {
  const { isMobile, animationDisabled } = useMobileOptimization();
  const { t } = useLanguage();
  const [shouldShowVideo, setShouldShowVideo] = useState(!isMobile);

  // Disable video background on mobile for better performance
  useEffect(() => {
    setShouldShowVideo(!isMobile);
  }, [isMobile]);

  // Optimized animation configs for mobile
  const titleAnimation = animationDisabled ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.1 }
  } : {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.1 }
  };

  const imageAnimation = animationDisabled ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.1 }
  } : {
    initial: { opacity: 0, scale: 0.8, rotateZ: -10 },
    animate: { opacity: 1, scale: 1, rotateZ: 0 },
    transition: { duration: 0.8, delay: 0.3 }
  };

  const floatingAnimation = animationDisabled ? null : {
    animate: { y: [0, -10, 0] },
    transition: { duration: 4, repeat: Infinity }
  };

  return (
    <header className="relative overflow-hidden min-h-screen flex items-center">
      
      {/* Reduce blur on mobile for better performance */}
      <div className={`absolute top-20 right-10 w-96 h-96 bg-fastfood-orange rounded-full mix-blend-screen ${isMobile ? "blur-2xl" : "blur-3xl"} opacity-20 animate-float`}></div>
      <div className={`absolute bottom-20 left-10 w-96 h-96 bg-fastfood-red rounded-full mix-blend-screen ${isMobile ? "blur-2xl" : "blur-3xl"} opacity-20 animate-float`} style={{ animationDelay: "1s" }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <motion.div
              {...titleAnimation}>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="text-fastfood-red" size={24} />
                <span className="text-fastfood-orange font-bold text-sm">HOT & FRESH</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-4">
                <span className={dark ? "text-white" : "text-gray-900"}>{t("heroTitle")}</span>
                <br />
                <span className="bg-gradient-to-r from-fastfood-red via-fastfood-orange to-fastfood-yellow bg-clip-text text-transparent">
                  Elevat
                </span>
              </h1>
              
              <p className={`text-lg max-w-md mb-6 leading-relaxed ${dark ? "text-neutral-300" : "text-gray-700"}`}>
                {t("heroSubtitle")}
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-xl p-4 border ${
                    dark
                      ? "bg-gradient-to-br from-fastfood-red/20 to-fastfood-orange/10 border-fastfood-red/30"
                      : "bg-gradient-to-br from-fastfood-red/10 to-fastfood-orange/5 border-fastfood-red/20"
                  }`}>
                  <div className="text-2xl font-black text-fastfood-red">12k+</div>
                  <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>Comenzi</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-xl p-4 border ${
                    dark
                      ? "bg-gradient-to-br from-fastfood-yellow/20 to-fastfood-orange/10 border-fastfood-yellow/30"
                      : "bg-gradient-to-br from-fastfood-yellow/10 to-fastfood-orange/5 border-fastfood-yellow/20"
                  }`}>
                  <div className="text-2xl font-black text-fastfood-yellow">4.9★</div>
                  <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>Rating</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-xl p-4 border ${
                    dark
                      ? "bg-gradient-to-br from-fastfood-blue/20 to-fastfood-purple/10 border-fastfood-blue/30"
                      : "bg-gradient-to-br from-fastfood-blue/10 to-fastfood-purple/5 border-fastfood-blue/20"
                  }`}>
                  <div className="text-2xl font-black text-fastfood-blue">25min</div>
                  <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>ETA max</div>
                </motion.div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                  <motion.a
                    href="#menu"
                    onClick={(e) => {
                      e.preventDefault();
                      smoothScrollTo("#menu");
                    }}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 45, 85, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-fastfood-red/50 transition-all duration-300 cursor-pointer border-none">
                    <Truck size={20} />
                    <span>{t("orderNow")}</span>
                  </motion.a>
                  
                  <motion.a
                    href="#where"
                    onClick={(e) => {
                      e.preventDefault();
                      smoothScrollTo("#where");
                    }}
                    whileHover={{ scale: 1.05, borderColor: "#FF6B35" }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center gap-2 border-2 border-fastfood-yellow text-fastfood-yellow px-8 py-4 rounded-2xl font-bold hover:bg-fastfood-yellow/10 transition-all duration-300 cursor-pointer bg-transparent">
                    <MapPin size={20} />
                    <span>{t("location")}</span>
                  </motion.a>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            {...imageAnimation}
            className="order-1 md:order-2 relative">
            <div className="relative">
              <div className={`absolute -top-10 -right-10 w-48 h-48 bg-fastfood-red rounded-full ${isMobile ? "blur-2xl" : "blur-3xl"} opacity-30 animate-pulse`}></div>
              <div className={`absolute -bottom-10 -left-10 w-48 h-48 bg-fastfood-orange rounded-full ${isMobile ? "blur-2xl" : "blur-3xl"} opacity-30 animate-pulse`} style={{ animationDelay: "1s" }}></div>
              
              <motion.div
                {...floatingAnimation}
                className="relative bg-gradient-to-br from-fastfood-red/20 to-fastfood-orange/20 border-2 border-fastfood-orange/50 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop&q=60&auto=format"
                  alt="Fancy Food Truck" 
                  className="w-full h-96 object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  srcSet="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop&q=50&auto=format 300w, https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop&q=60&auto=format 500w, https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop&q=65&auto=format 600w"
                  sizes="(max-width: 768px) 300px, 500px"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}


