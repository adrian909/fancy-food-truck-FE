import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Flame } from "lucide-react";
import { useMobileOptimization } from "../hooks/useMobileOptimization";
import { useLanguage } from "../hooks/useLanguage";
import { apiGet } from "../api/apiClient";

const ProductCard = React.memo(({ item, idx, dark, onSelect, animationDisabled, t }) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: idx * 0.06 }}
    exit={{ opacity: 0, y: -20 }}>
    <motion.article
      whileHover={{ y: -4 }}
      onClick={() => onSelect(item)}
      className={`group relative rounded-2xl overflow-hidden border shadow-md transition-shadow h-full flex flex-col cursor-pointer ${
        dark
          ? "border-white/10 bg-neutral-900 hover:shadow-lg hover:shadow-black/40"
          : "border-gray-200 bg-white hover:shadow-lg hover:shadow-gray-200"
      }`}>

      <div className="relative h-48 overflow-hidden">
        <img
          src={item.img}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.tags[0] && (
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
            dark ? "bg-black/60 text-white" : "bg-white/80 text-gray-800"
          } backdrop-blur-sm`}>
            {item.tags[0]}
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <h3 className={`font-bold text-base mb-1 line-clamp-1 ${dark ? "text-white" : "text-gray-900"}`}>{item.title}</h3>
        <p className={`text-sm mb-4 line-clamp-2 flex-1 ${dark ? "text-neutral-400" : "text-gray-500"}`}>{item.desc}</p>

        <div className={`text-xl font-black ${dark ? "text-white" : "text-gray-900"}`}>
          {Number(item.price).toFixed(2)}
          <span className={`text-sm font-normal ml-1 ${dark ? "text-neutral-400" : "text-gray-500"}`}>lei</span>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onSelect(item); }}
        className="w-full py-3 bg-fastfood-red text-white font-semibold hover:bg-fastfood-red/90 transition-colors flex items-center justify-center gap-2 text-sm">
        <ShoppingBag size={16} />
        {t("addToCart")}
      </button>
    </motion.article>
  </motion.div>
), (prev, next) =>
  prev.item.id === next.item.id &&
  prev.idx === next.idx &&
  prev.dark === next.dark &&
  prev.t === next.t
);

ProductCard.displayName = "ProductCard";

const FILTERS = [
  ["all", "Toate"],
  ["burger", "Burgeri"],
  ["taco", "Tacos"],
  ["side", "Garnituri"],
  ["drink", "Băuturi"],
];

function Menu({ dark, filter, setFilter, products, setSelectedProduct, setQuantity, setCustomizations }) {
  const { animationDisabled } = useMobileOptimization();
  const { t } = useLanguage();
  const [displayLimit, setDisplayLimit] = useState(12);
  const [backendProducts, setBackendProducts] = useState([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiGet("/api/products");
        if (data.documents && Array.isArray(data.documents)) {
          const formattedProducts = data.documents.map(doc => {
            const fields = doc.fields || {};
            let customizations = [];
            if (fields.customizations?.arrayValue?.values) {
              customizations = fields.customizations.arrayValue.values.map(val => {
                const name = val.mapValue?.fields?.name?.stringValue || "";
                const priceValue = val.mapValue?.fields?.price?.doubleValue || val.mapValue?.fields?.price?.integerValue;
                const price = typeof priceValue === "string" ? parseFloat(priceValue) : (priceValue || 0);
                return { name, price };
              }).filter(c => c.name);
            }
            return {
              id: doc.name.split("/").pop(),
              title: fields.title?.stringValue || "",
              price: fields.price?.doubleValue || 0,
              img: fields.imageUrl?.stringValue || "",
              desc: fields.description?.stringValue || "",
              tags: (fields.category?.stringValue || "").split(",").map(t => t.trim()).filter(t => t),
              customizations,
            };
          });
          setBackendProducts(formattedProducts);
        }
      } catch {
        // silent fail
      } finally {
        setIsLoadingBackend(false);
      }
    };
    fetchProducts();
  }, []);

  React.useEffect(() => { setDisplayLimit(12); }, [filter]);

  const menuToUse = backendProducts.length > 0 ? backendProducts : (products || []);
  const isLoading = isLoadingBackend && menuToUse.length === 0;

  const filteredMenu = useMemo(() =>
    menuToUse.filter(m => filter === "all" || m.tags.includes(filter)),
    [menuToUse, filter]
  );

  const displayedMenu = useMemo(() => filteredMenu.slice(0, displayLimit), [filteredMenu, displayLimit]);
  const hasMore = filteredMenu.length > displayLimit;

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setCustomizations({});
  }, [setSelectedProduct, setQuantity, setCustomizations]);

  const headerAnimation = animationDisabled
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.1 } }
    : { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="menu">
      <section>
        <motion.div {...headerAnimation} viewport={{ once: true, amount: 0.1 }} className="mb-10">
          <h2 className={`text-4xl font-black mb-2 ${dark ? "text-white" : "text-gray-900"}`}>
            {t("menuTitle")}
          </h2>
          <p className={dark ? "text-neutral-400" : "text-gray-500"}>{t("menuDescription")}</p>
        </motion.div>

        {/* Filter Buttons */}
        <div className="mb-10 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  filter === id
                    ? "bg-fastfood-red text-white"
                    : dark
                    ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                <div className="w-12 h-12 border-4 border-fastfood-red/20 border-t-fastfood-red rounded-full" />
              </motion.div>
              <p className={`text-sm font-medium ${dark ? "text-neutral-400" : "text-gray-500"}`}>{t("loading")}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedMenu.map((item, idx) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  idx={idx}
                  dark={dark}
                  onSelect={handleProductClick}
                  animationDisabled={animationDisabled}
                  t={t}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setDisplayLimit(prev => prev + 12)}
                  className={`px-8 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                    dark
                      ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}>
                  {t("viewMore")}
                </button>
              </div>
            )}
          </>
        )}

        {!isLoading && filteredMenu.length === 0 && (
          <div className="text-center py-20">
            <Flame size={40} className={`mx-auto mb-3 ${dark ? "text-neutral-600" : "text-gray-300"}`} />
            <p className={dark ? "text-neutral-400" : "text-gray-500"}>{t("noResults")}</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default Menu;
