import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

export default function Cart({
  dark,
  showCart,
  setShowCart,
  cart,
  removeFromCart,
  updateQuantity,
  setShowCheckout,
}) {
  const { t } = useLanguage();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = 15;
  const tax = subtotal * 0.1;
  const total = subtotal + delivery + tax;

  return (
    <AnimatePresence>
      {showCart && (
        <motion.aside
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed right-6 bottom-6 w-96 rounded-2xl border p-6 shadow-2xl z-[9999] ${
            dark ? "bg-gray-900/95 border-fastfood-orange/30" : "bg-white/95 border-gray-200"
          } backdrop-blur`}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-fastfood-orange to-fastfood-yellow">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <h3 className="font-black text-lg">{t("cartTitle")}</h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCart(false)}
              className={`p-1 rounded-lg transition ${dark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}>
              <X size={20} />
            </motion.button>
          </div>

          {/* Cart Items */}
          <div className="mt-4">
            {cart.length === 0 ? (
              <div className={`text-center py-8 ${dark ? "text-neutral-500" : "text-gray-500"}`}>
                <ShoppingCart size={40} className="mx-auto mb-3 opacity-50" />
                <p>{t("cartEmpty")}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-auto pr-2">
                {cart.map((c, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 rounded-lg border ${dark ? "bg-gray-800/50 border-fastfood-orange/20 hover:border-fastfood-orange/50" : "bg-gray-50 border-gray-200 hover:border-fastfood-orange/50"} transition`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{c.title}</div>
                        {c.customizations && Object.keys(c.customizations).length > 0 && (
                          <div className="text-xs mt-1 space-y-0.5">
                            {Object.entries(c.customizations).map(([key, value]) => {
                              if (!value) return null;
                              const isRemove = key.startsWith("remove-");
                              const label = key.replace(/^(remove|add)-/, "");
                              return (
                                <div key={key} className={`${dark ? "text-neutral-400" : "text-gray-600"}`}>
                                  {isRemove ? "-" : "+"} {label}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1 rounded text-fastfood-red hover:bg-fastfood-red/10"
                        onClick={() => removeFromCart(i)}>
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateQuantity(i, c.qty - 1)}
                          className="p-1 rounded bg-fastfood-red/20 hover:bg-fastfood-red/30">
                          <Minus size={14} className="text-fastfood-red" />
                        </motion.button>
                        <span className="w-6 text-center font-bold">{c.qty}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateQuantity(i, c.qty + 1)}
                          className="p-1 rounded bg-fastfood-orange/20 hover:bg-fastfood-orange/30">
                          <Plus size={14} className="text-fastfood-orange" />
                        </motion.button>
                      </div>
                      <div className="text-fastfood-yellow font-bold text-sm">{(c.price * c.qty).toFixed(2)} RON</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Totals & CTA */}
          {cart.length > 0 && (
            <div className="mt-4">
              <div className={`space-y-2 p-4 rounded-lg border ${dark ? "bg-gray-800/30 border-fastfood-orange/20" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between text-sm">
                  <div className={dark ? "text-neutral-400" : "text-gray-600"}>{t("subtotal")}</div>
                  <div className="font-semibold">{subtotal.toFixed(2)} RON</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className={dark ? "text-neutral-400" : "text-gray-600"}>{t("shipping")}</div>
                  <div className="font-semibold">{delivery.toFixed(2)} RON</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className={dark ? "text-neutral-400" : "text-gray-600"}>{t("tax")}</div>
                  <div className="font-semibold">{tax.toFixed(2)} RON</div>
                </div>
                <div className={`flex items-center justify-between font-black text-lg pt-2 border-t ${dark ? "border-gray-700" : "border-gray-300"}`}>
                  <div>{t("total")}</div>
                  <div>{total.toFixed(2)} RON</div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCheckout(true)}
                className="w-full mt-4 px-4 py-3 rounded-xl bg-fastfood-red text-white font-semibold hover:bg-fastfood-red/90 transition-colors">
                {t("checkout")}
              </motion.button>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}


