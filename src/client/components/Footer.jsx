import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Facebook, Instagram, ArrowRight } from "lucide-react";
import { smoothScrollTo } from "../../shared/utils/smoothScroll";
import { LOGO } from "../constants/ui";
import { useLanguage } from "../hooks/useLanguage";

export default function Footer({ dark }) {
  const { t } = useLanguage();
  return (
    <footer className={`border-t mt-24 py-16 sm:py-20 ${
      dark
        ? "border-fastfood-orange/30"
        : "border-gray-300"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`mb-16 rounded-2xl p-8 sm:p-12 text-center border ${
            dark
              ? "bg-gradient-to-r from-fastfood-red/10 via-fastfood-orange/10 to-fastfood-yellow/10 border-fastfood-orange/30"
              : "bg-gradient-to-r from-fastfood-red/5 via-fastfood-orange/5 to-fastfood-yellow/5 border-fastfood-orange/20"
          }`}>
          <h3 className={`text-3xl sm:text-4xl font-black mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
            {t("footerCTA")}
          </h3>
          <motion.a
            href="#menu"
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo("#menu");
            }}
            whileHover={{ scale: 1.05, gap: "1rem" }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-fastfood-red/50 transition-all duration-300 cursor-pointer border-none">
            {t("orderNow")}
            <ArrowRight size={20} />
          </motion.a>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fastfood-red to-fastfood-orange flex items-center justify-center">
                <span className="text-white font-black">🔥</span>
              </div>
              <div>
                {LOGO}
                <p className={`text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>Street Food, Elevated</p>
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}>
            <h4 className={`font-black mb-4 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}>
              <Phone size={18} className="text-fastfood-red" />
              {t("phone")}
            </h4>
            <div className="space-y-3">
              <div className={`flex items-center gap-2 hover:text-fastfood-orange transition ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                <MapPin size={16} className="text-fastfood-orange" />
                <span className="text-sm">{t("footerLocation")}</span>
              </div>
              <div className={`flex items-center gap-2 hover:text-fastfood-orange transition ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                <Phone size={16} className="text-fastfood-orange" />
                <a href="tel:+40123456789" className="text-sm">+40 (123) 456-7890</a>
              </div>
              <div className={`flex items-center gap-2 hover:text-fastfood-orange transition ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                <Mail size={16} className="text-fastfood-orange" />
                <a href="mailto:hello@fancytruck.ro" className="text-sm">hello@fancytruck.ro</a>
              </div>
            </div>
          </motion.div>

          {/* Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <h4 className={`font-black mb-4 ${dark ? "text-white" : "text-gray-900"}`}>{t("hours")}</h4>
            <div className={`space-y-2 text-sm ${dark ? "text-neutral-400" : "text-gray-600"}`}>
              <p>{t("footerHoursLabel")}</p>
              <p>{t("footerHoursSat")}</p>
              <p>{t("footerHoursSun")}</p>
              <p className="text-fastfood-orange font-semibold pt-2">{t("footerDelivery")}</p>
            </div>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}>
            <h4 className={`font-black mb-4 ${dark ? "text-white" : "text-gray-900"}`}>{t("followUs")}</h4>
            <div className="flex gap-4">
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                href="https://facebook.com/fancytruck"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow FancyTruck on Facebook"
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-fastfood-red to-fastfood-orange flex items-center justify-center text-white hover:shadow-lg hover:shadow-fastfood-red/50 transition">
                <Facebook size={18} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                href="https://instagram.com/fancytruck"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow FancyTruck on Instagram"
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-fastfood-orange to-fastfood-yellow flex items-center justify-center text-white hover:shadow-lg hover:shadow-fastfood-orange/50 transition">
                <Instagram size={18} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                href="https://tiktok.com/@fancytruck"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow FancyTruck on TikTok"
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white hover:shadow-lg hover:shadow-gray-800/50 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.7a2.4 2.4 0 0 1-2.4 2.4 2.4 2.4 0 0 1-2.4-2.4 2.4 2.4 0 0 1 2.4-2.4c.34 0 .67.04.99.1V9.4a5.9 5.9 0 0 0-.99-.08 5.9 5.9 0 0 0-5.9 5.9 5.9 5.9 0 0 0 5.9 5.9 5.9 5.9 0 0 0 5.9-5.9v-2.5a7.66 7.66 0 0 0 4.77 1.6v-3.68a4.83 4.83 0 0 1-.99-.1z"/>
                </svg>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
          dark ? "border-neutral-800 text-neutral-400" : "border-gray-300 text-gray-600"
        }`}>
          <p className="text-sm">
            {t("©")} &nbsp;·&nbsp; {t("createdBy")}{" "}
            <a
              href="https://trifadrian.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fastfood-orange transition font-medium underline underline-offset-2">
              Adrian Trif
            </a>
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="/terms" className="hover:text-fastfood-orange transition">{t("footerTerms")}</a>
            <a href="/privacy" className="hover:text-fastfood-orange transition">{t("footerPrivacy")}</a>
            <a href="/cookie-policy" className="hover:text-fastfood-orange transition">{t("footerCookies")}</a>
            <a href="/delivery-policy" className="hover:text-fastfood-orange transition">{t("footerDeliveryPolicy")}</a>
            <button
              onClick={() => window.dispatchEvent(new Event("openCookieSettings"))}
              className="hover:text-fastfood-orange transition cursor-pointer bg-transparent border-none p-0 font-[inherit] text-[inherit]"
            >
              {t("footerCookieSettings")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}


