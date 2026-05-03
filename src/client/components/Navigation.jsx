import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Moon, Sun, Settings, LogOut, User, Crown, Flame, Package } from "lucide-react";
import { smoothScrollTo } from "../../shared/utils/smoothScroll";
import { LOGO } from "../constants/ui";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../hooks/useLanguage";

export default function Navigation({ dark, setDark, cartCount, setShowCart, onAdminClick, currentUser, onLogout, onAuthClick, onMyOrdersClick, onUserProfileClick }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { t } = useLanguage();
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-[9997] border-b backdrop-blur-sm ${
        dark
          ? "bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 border-fastfood-orange/30"
          : "bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 border-gray-400"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-fastfood-red to-fastfood-orange flex items-center justify-center shadow-lg shadow-fastfood-red/50 cursor-pointer">
            <Flame size={24} className="text-white" />
          </motion.div>
          
          {LOGO}
          
          <div className="hidden md:flex gap-8 items-center ml-12">
            <motion.a 
              href="#menu"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("#menu");
              }}
              whileHover={{ color: "#FF2D55" }}
              className={`hover:text-fastfood-red cursor-pointer transition text-sm font-medium ${dark ? "text-gray-100" : "text-gray-700"}`}>
              {t("menu")}
            </motion.a>
            <motion.a 
              href="#where"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("#where");
              }}
              whileHover={{ color: "#FF2D55" }}
              className={`hover:text-fastfood-red cursor-pointer transition text-sm font-medium ${dark ? "text-gray-100" : "text-gray-700"}`}>
              {t("location")}
            </motion.a>
            <motion.a 
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("#about");
              }}
              whileHover={{ color: "#FF2D55" }}
              className={`hover:text-fastfood-red cursor-pointer transition text-sm font-medium ${dark ? "text-gray-100" : "text-gray-700"}`}>
              {t("about")}
            </motion.a>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Selector - compact on mobile */}
          <div className="hidden sm:block">
            <LanguageSelector dark={dark} compact={false} />
          </div>
          <div className="block sm:hidden">
            <LanguageSelector dark={dark} compact={true} />
          </div>
          
          {/* Dark mode toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDark((d) => !d)}
            className={`p-2 rounded-lg transition ${
              dark
                ? "bg-neutral-800/50 hover:bg-neutral-700/50"
                : "bg-gray-200/80 hover:bg-gray-300/80"
            }`}>
            {dark ? <Sun size={18} className="text-fastfood-yellow" /> : <Moon size={18} className="text-gray-700" />}
          </motion.button>

          {/* Cart button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCart((s) => !s)}
            className="relative p-2 rounded-lg bg-gradient-to-r from-fastfood-orange to-fastfood-yellow text-white hover:shadow-lg hover:shadow-fastfood-orange/50 transition">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-fastfood-red text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartCount}
              </motion.span>
            )}
          </motion.button>

        {/* User Profile / Auth - always visible */}
        {currentUser ? (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 rounded-lg bg-gradient-to-r from-fastfood-blue to-fastfood-purple text-white hover:shadow-lg hover:shadow-fastfood-blue/50 transition flex items-center gap-2">
              <User size={18} />
              <span className="hidden sm:inline text-sm font-bold">{currentUser.name.split(" ")[0]}</span>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className={`absolute right-0 mt-3 w-52 rounded-xl shadow-2xl border z-50 overflow-hidden ${dark ? "bg-gray-900 border-white/10" : "bg-white border-gray-200"}`}>
                  <div className="p-4 border-b border-white/10">
                    <p className="font-semibold flex items-center gap-2 text-white text-sm">
                      {currentUser.name}
                      {currentUser.role === "admin" && <Crown size={14} className="text-fastfood-yellow" />}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={() => { setShowUserMenu(false); onUserProfileClick(); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-2.5 ${dark ? "hover:bg-white/5 text-neutral-200" : "hover:bg-gray-100 text-gray-700"}`}>
                    <User size={15} />
                    {t("userProfile")}
                  </button>

                  <button
                    onClick={() => { setShowUserMenu(false); onMyOrdersClick(); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-2.5 ${dark ? "hover:bg-white/5 text-neutral-200" : "hover:bg-gray-100 text-gray-700"}`}>
                    <Package size={15} />
                    {t("myOrders")}
                  </button>

                  {currentUser.role === "admin" && (
                    <button
                      onClick={() => { setShowUserMenu(false); onAdminClick(); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-2.5 ${dark ? "hover:bg-white/5 text-neutral-200" : "hover:bg-gray-100 text-gray-700"}`}>
                      <Settings size={15} />
                      {t("adminPanel")}
                    </button>
                  )}

                  <button
                    onClick={() => { setShowUserMenu(false); onLogout(); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-2.5 text-fastfood-red border-t ${dark ? "border-white/10 hover:bg-fastfood-red/10" : "border-gray-200 hover:bg-fastfood-red/5"}`}>
                    <LogOut size={15} />
                    {t("logout")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAuthClick}
            className="px-3 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white font-bold hover:shadow-lg hover:shadow-fastfood-red/50 transition text-xs sm:text-sm">
            {t("login")}
          </motion.button>
        )}
        </div>
      </div>
    </motion.nav>
  );
}


