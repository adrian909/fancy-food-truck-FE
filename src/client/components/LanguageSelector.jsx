import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

export default function LanguageSelector({ dark, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: "ro", name: "Română", flag: "🇷🇴" },
    { code: "en", name: "English", flag: "🇬🇧" }
  ];

  const currentLanguage = languages.find(l => l.code === language);

  // Compact version for mobile
  if (compact) {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`Selectează limba — ${currentLanguage?.name ?? language}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`p-2 rounded-lg transition ${
            dark
              ? "bg-neutral-800/50 border border-fastfood-orange/30 text-gray-100"
              : "bg-gray-200/80 border border-gray-400 text-gray-700"
          }`}>
          <Globe size={18} className="text-fastfood-orange" />
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute right-0 mt-2 w-40 rounded-xl shadow-2xl border z-50 overflow-hidden backdrop-blur ${
                dark
                  ? "bg-gray-900/95 border-fastfood-orange/30"
                  : "bg-white/95 border-gray-300"
              }`}>
              <div className="p-2">
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm ${
                      language === lang.code
                        ? dark
                          ? "bg-gradient-to-r from-fastfood-orange to-fastfood-yellow text-gray-900 font-bold shadow-lg shadow-fastfood-orange/30"
                          : "bg-gradient-to-r from-fastfood-orange to-fastfood-yellow text-white font-bold shadow-lg shadow-fastfood-orange/30"
                        : dark
                        ? "text-gray-300 hover:bg-neutral-800/50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}>
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {language === lang.code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto">✓</motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close dropdown on outside click */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Full version for desktop
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
          dark
            ? "bg-neutral-800/50 border border-fastfood-orange/30 hover:border-fastfood-orange/60 text-gray-100"
            : "bg-gray-200/80 border border-gray-400 hover:border-fastfood-orange/60 text-gray-700"
        }`}>
        <Globe size={18} className="text-fastfood-orange" />
        <span className="text-sm font-semibold">{currentLanguage?.flag} {currentLanguage?.name}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border z-50 overflow-hidden backdrop-blur ${
              dark
                ? "bg-gray-900/95 border-fastfood-orange/30"
                : "bg-white/95 border-gray-300"
            }`}>
            <div className="p-2">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                    language === lang.code
                      ? dark
                        ? "bg-gradient-to-r from-fastfood-orange to-fastfood-yellow text-gray-900 font-bold shadow-lg shadow-fastfood-orange/30"
                        : "bg-gradient-to-r from-fastfood-orange to-fastfood-yellow text-white font-bold shadow-lg shadow-fastfood-orange/30"
                      : dark
                      ? "text-gray-300 hover:bg-neutral-800/50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}>
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{lang.name}</div>
                    <div className={`text-xs ${
                      language === lang.code
                        ? "text-gray-700"
                        : dark
                        ? "text-neutral-500"
                        : "text-gray-500"
                    }`}>
                      {lang.code === 'ro' ? 'Română' : 'English'}
                    </div>
                  </div>
                  {language === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-lg">✓</motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close dropdown on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
