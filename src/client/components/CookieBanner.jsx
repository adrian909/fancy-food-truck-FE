import { useState, useEffect } from "react";
import { Cookie, Shield, Settings, BarChart2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

const STORAGE_KEY = "cookieConsent";

export default function CookieBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState({ essential: true, functional: true, analytics: true, marketing: false });

  const categories = [
    { id: "essential",  icon: Shield,    label: t("cookieCatEssentialLabel"),  desc: t("cookieCatEssentialDesc"),  required: true  },
    { id: "functional", icon: Settings,  label: t("cookieCatFunctionalLabel"), desc: t("cookieCatFunctionalDesc"), required: false },
    { id: "analytics",  icon: BarChart2, label: t("cookieCatAnalyticsLabel"),  desc: t("cookieCatAnalyticsDesc"),  required: false },
    { id: "marketing",  icon: XCircle,   label: t("cookieCatMarketingLabel"),  desc: t("cookieCatMarketingDesc"),  required: false },
  ];

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
    const handler = () => setVisible(true);
    window.addEventListener("openCookieSettings", handler);
    return () => window.removeEventListener("openCookieSettings", handler);
  }, []);

  const save = (newPrefs) => {
    const finalPrefs = { ...newPrefs, essential: true };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPrefs)); } catch {}
    window.dispatchEvent(new CustomEvent("cookieConsentSaved", { detail: finalPrefs }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99999] p-3 sm:p-4 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 shrink-0">
              <Cookie size={20} className="text-fastfood-orange" />
            </div>
            <div>
              <p className="font-black text-gray-900 dark:text-white text-sm mb-1">
                {t("cookieBannerTitle")}
              </p>
              <p className="text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">
                {t("cookieBannerDesc")}{" "}
                <a href="/cookie-policy" className="text-fastfood-orange underline">
                  {t("cookieBannerPolicyLink")}
                </a>.
              </p>
            </div>
          </div>

          {showSettings && (
            <div className="mb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
              {categories.map(({ id, icon: Icon, label, desc, required }) => (
                <div key={id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <Icon size={16} className="text-fastfood-orange shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={required ? true : prefs[id]}
                    aria-label={label}
                    disabled={required}
                    onClick={() => !required && setPrefs((p) => ({ ...p, [id]: !p[id] }))}
                    className={`shrink-0 mt-0.5 relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-fastfood-orange focus:ring-offset-2 ${
                      required || prefs[id] ? "bg-fastfood-orange" : "bg-gray-300 dark:bg-gray-600"
                    } ${required ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                        required || prefs[id] ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setShowSettings((s) => !s)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-neutral-300 border border-gray-300 dark:border-gray-600 rounded-full hover:border-fastfood-orange hover:text-fastfood-orange transition"
            >
              <Settings size={13} />
              {t("cookieBannerBtnSettings")}
              {showSettings ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <button
              onClick={() => save({ essential: true, functional: false, analytics: false, marketing: false })}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-neutral-300 border border-gray-300 dark:border-gray-600 rounded-full hover:border-fastfood-orange hover:text-fastfood-orange transition"
            >
              {t("cookieBannerBtnEssential")}
            </button>
            <div className="ml-auto">
              {showSettings ? (
                <button
                  onClick={() => save(prefs)}
                  className="px-4 py-1.5 text-xs font-bold text-gray-900 bg-fastfood-orange rounded-full hover:bg-orange-500 transition"
                >
                  {t("cookieBannerBtnSave")}
                </button>
              ) : (
                <button
                  onClick={() => save({ essential: true, functional: true, analytics: true, marketing: false })}
                  className="px-4 py-1.5 text-xs font-bold text-gray-900 bg-fastfood-orange rounded-full hover:bg-orange-500 transition"
                >
                  {t("cookieBannerBtnAcceptAll")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
