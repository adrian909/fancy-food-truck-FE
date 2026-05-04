import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './client/styles/index.css'
import App from './client/App.jsx'
import CookieBanner from './client/components/CookieBanner.jsx'
import { LanguageProvider } from './client/context/LanguageContext.jsx'

const PrivacyPolicy = lazy(() => import('./client/pages/PrivacyPolicy.jsx'));
const CookiePolicy = lazy(() => import('./client/pages/CookiePolicy.jsx'));
const TermsAndConditions = lazy(() => import('./client/pages/TermsAndConditions.jsx'));
const DeliveryPolicy = lazy(() => import('./client/pages/DeliveryPolicy.jsx'));

const LEGAL_ROUTES = {
  '/privacy': PrivacyPolicy,
  '/cookie-policy': CookiePolicy,
  '/terms': TermsAndConditions,
  '/delivery-policy': DeliveryPolicy,
};

function LegalNav({ dark }) {
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-4 h-12 flex items-center border-b ${
      dark ? "bg-gray-950/95 border-gray-800 backdrop-blur-sm" : "bg-white/95 border-gray-200 backdrop-blur-sm"
    }`}>
      <a href="/" className="text-sm font-bold text-fastfood-orange hover:text-orange-500 transition">
        ← FancyTruck
      </a>
    </div>
  );
}

function Root() {
  const path = window.location.pathname;
  const dark = (() => {
    try { return JSON.parse(localStorage.getItem("theme")) ?? true; } catch { return true; }
  })();

  const LegalPage = LEGAL_ROUTES[path];

  return (
    <LanguageProvider>
      {LegalPage ? (
        <>
          <LegalNav dark={dark} />
          <div className="pt-12">
            <LegalPage dark={dark} />
          </div>
        </>
      ) : (
        <App />
      )}
      <CookieBanner />
    </LanguageProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <Root />
    </Suspense>
  </StrictMode>,
)
