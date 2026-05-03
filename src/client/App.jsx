import React, { useState, useEffect, Suspense, lazy, startTransition, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MapPin, Phone, Mail, X, LogOut, User, Settings } from "lucide-react";
import { debug } from "../shared/utils/debug";
import { apiPut, apiPost, apiGet } from "./api/apiClient";
import { useMobileOptimization } from "./hooks/useMobileOptimization";
import { useLanguage } from "./hooks/useLanguage";
import { LanguageProvider } from "./context/LanguageContext";
import { logout, getCurrentUser, fetchCSRFToken } from "../shared/utils/auth";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import { ShoppingBag, Plus, Minus } from "lucide-react";


const Location = lazy(() => import("./components/Location"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const About = lazy(() => import("./components/About"));
const OrderConfirmation = lazy(() => import("./components/OrderConfirmation"));
const OrderStatus = lazy(() => import("./components/OrderStatus"));
const Footer = lazy(() => import("./components/Footer"));

const Checkout = lazy(() => import("./components/Checkout"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const MyOrders = lazy(() => import("./components/MyOrders"));
const UserProfile = lazy(() => import("./components/UserProfile"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-fastfood-red mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Se încarcă...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { isMobile, animationDisabled } = useMobileOptimization();
  const { language, t, changeLanguage } = useLanguage();
  
  const [dark, setDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      try {
        return JSON.parse(savedTheme);
      } catch (error) {
        return true;
      }
    }
    return true;
  });
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState({});
  const [filter, setFilter] = useState("all");
  const [locationToday, setLocationToday] = useState({ name: "Sebes", mapLink: "", googleMapsLink: "", etaPickupBase: 15, etaDeliveryBase: 30, etaPerItem: 2 });
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [resetToken, setResetToken] = useState(() => {
    if (typeof window === 'undefined') return null;
    if (window.location.pathname !== '/reset-password') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || null;
  });

  useEffect(() => {
    if (resetToken) setShowAuth(true);
  }, [resetToken]);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [checkoutData, setCheckoutData] = useState(null);

  // Initialize CSRF token and verify current user
  useEffect(() => {
    const initializeAuth = async () => {
      // Fetch CSRF token on app start
      await fetchCSRFToken();
      
      // First, check localStorage for saved user
      const savedUser = localStorage.getItem('currentUser');
      const savedToken = localStorage.getItem('jwt_token');
      
      // Check if savedUser is actually valid (not "undefined" or "null" strings)
      if (savedUser && savedToken && savedUser !== 'undefined' && savedUser !== 'null' && savedToken !== 'undefined' && savedToken !== 'null') {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          
          // Restore UI state after setting user
          const storedUiState = localStorage.getItem("uiState");
          
          if (storedUiState && storedUiState !== 'undefined' && storedUiState !== 'null') {
            try {
              const uiState = JSON.parse(storedUiState);
              
              // Restore admin panel if user is admin
              if (user.role === "admin" && uiState.showAdmin) {
                setShowAdmin(true);
              }
              
              // Restore My Orders page if it was open
              if (uiState.showMyOrders) {
                setShowMyOrders(true);
              }
              
              // Restore User Profile page if it was open
              if (uiState.showUserProfile) {
                setShowUserProfile(true);
              }
            } catch (e) {
              console.error('Failed to parse UI state:', e);
              localStorage.removeItem('uiState');
            }
          }
          
          // Optionally verify token in background (don't block UI)
          // Don't update state based on this - just let it run
          getCurrentUser().catch(() => {
            // Silently ignore - user data is already in localStorage
          });
        } catch (e) {
          // Invalid saved data - clear it only if parsing failed
          console.error('Failed to parse saved user data:', e);
          logout();
          localStorage.removeItem('uiState');
        }
      } else {
        // Clean up any corrupted data
        if (savedUser === 'undefined' || savedUser === 'null' || savedToken === 'undefined' || savedToken === 'null') {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('uiState');
        }
      }
      
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  // Save UI state to localStorage when it changes
  // But add a small delay to avoid race conditions during page refresh
  useEffect(() => {
    if (isInitialized) {
      // Use a timeout to debounce the save operation
      const timeoutId = setTimeout(() => {
        const uiState = {
          showAdmin,
          showMyOrders,
          showUserProfile
        };
        localStorage.setItem('uiState', JSON.stringify(uiState));
      }, 100); // 100ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [showAdmin, showMyOrders, showUserProfile, isInitialized]);

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  useEffect(() => {
    if (isInitialized && showAdmin) {

      if (!currentUser?.role || currentUser.role !== "admin") {

        setShowAdmin(false);
      } else {

      }
    }
  }, [isInitialized, currentUser]);

  // Close protected pages when user logs out
  useEffect(() => {
    if (isInitialized && !currentUser) {
      // Only close if there's really no saved user in localStorage
      const savedUser = localStorage.getItem('currentUser');
      if (!savedUser) {
        setShowAdmin(false);
        setShowMyOrders(false);
        setShowUserProfile(false);
      }
    }
  }, [isInitialized, currentUser]);

  // Listen for storage changes (logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser' && !e.newValue) {
        // User was logged out from another tab
        setCurrentUser(null);
        setShowAdmin(false);
        setShowMyOrders(false);
        setShowUserProfile(false);
      } else if (e.key === 'jwt_token' && !e.newValue) {
        // Token was removed from another tab
        setCurrentUser(null);
        setShowAdmin(false);
        setShowMyOrders(false);
        setShowUserProfile(false);
      }
    };

    const handleUnauthorized = () => {
      setCurrentUser(null);
      setShowAdmin(false);
      setShowMyOrders(false);
      setShowUserProfile(false);
      setShowAuth(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const configDoc = await apiGet("/api/settings/config");
        if (configDoc) {
          startTransition(() => {
            setLocationToday({
              name: configDoc.name || "Sebes",
              mapLink: configDoc.mapLink || "",
              googleMapsLink: configDoc.googleMapsLink || "",
              etaPickupBase: configDoc.etaPickupBase || 15,
              etaDeliveryBase: configDoc.etaDeliveryBase || 30,
              etaPerItem: configDoc.etaPerItem || 2,
            });
          });
        }
      } catch (error) {
      }
    };
    
    loadSettings();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiGet("/api/products");
        if (data.documents && Array.isArray(data.documents)) {
          const formattedProducts = data.documents.map(doc => {
            const fields = doc.fields || {};
            let customizations = [];
            if (fields.customizations?.arrayValue?.values) {
              customizations = fields.customizations.arrayValue.values.map(val => {
                const name = val.mapValue?.fields?.name?.stringValue || val.stringValue || "";
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
          startTransition(() => setProducts(formattedProducts));
        }
      } catch {
        // silent fail
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!orderPlaced?.id || !orderPlaced?.firestoreId) return;

    // Poll backend for order status updates every 10 seconds
    const interval = setInterval(async () => {
      try {
        const data = await apiGet(`/api/orders/${orderPlaced.firestoreId}`);
        if (data.fields) {
          setOrderPlaced((prev) => ({
            ...prev,
            eta: data.fields.eta?.integerValue || prev.eta,
            status: data.fields.status?.stringValue || prev.status,
          }));
        }
      } catch (error) {
        // Silent fail on poll
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orderPlaced?.id, orderPlaced?.firestoreId]);

  useEffect(() => {
    const setupListeners = async () => {
      try {
        const fetchOrders = async () => {
          try {
            const data = await apiGet("/api/orders");
            if (data.documents && Array.isArray(data.documents)) {
              const extractValue = (val) => {
                if (!val) return null;
                if (val.stringValue) return val.stringValue;
                if (val.doubleValue) return val.doubleValue;
                if (val.integerValue) return parseInt(val.integerValue);
                if (val.booleanValue) return val.booleanValue;
                if (val.arrayValue) return val.arrayValue.values || [];
                if (val.mapValue && val.mapValue.fields) {
                  const obj = {};
                  for (const [k, v] of Object.entries(val.mapValue.fields)) {
                    obj[k] = extractValue(v);
                  }
                  return obj;
                }
                return null;
              };

              const formattedOrders = data.documents.map(doc => {
                const fields = doc.fields || {};
                return {
                  firestoreId: doc.name.split('/').pop(),
                  id: fields.id?.stringValue || "",
                  userId: fields.userId?.stringValue || "",
                  status: fields.status?.stringValue || "pending",
                  eta: fields.eta?.integerValue ? parseInt(fields.eta.integerValue) : 20,
                  timestamp: fields.timestamp?.stringValue || new Date().toISOString(),
                  items: (fields.items?.arrayValue?.values || []).map(extractValue),
                  total: fields.total?.doubleValue || 0,
                  subtotal: fields.subtotal?.doubleValue || 0,
                  delivery: fields.delivery?.doubleValue || 0,
                  tax: fields.tax?.doubleValue || 0,
                  deliveryOption: fields.deliveryOption?.stringValue || "home",
                  userName: fields.userName?.stringValue || "",
                  customer: extractValue(fields.customer),
                };
              });
              startTransition(() => {
                setOrders(formattedOrders);
                setIsLoadingOrders(false);
              });
            } else {
              setIsLoadingOrders(false);
            }
          } catch (error) {
            setIsLoadingOrders(false);
          }
        };

        await fetchOrders();

        let interval;
        let lastAdminState = false;
        
        const pollOrders = async () => {
          const isAdminView = document.body.getAttribute('data-admin-view') === 'true';
          
          if (isAdminView && !lastAdminState) {
            await fetchOrders();
          }
          
          if (isAdminView) {
            await fetchOrders();
          }
          
          lastAdminState = isAdminView;
        };
        
        interval = setInterval(pollOrders, 3000);
        
        Promise.resolve().then(pollOrders);

        return () => {
          if (interval) clearInterval(interval);
        };
      } catch (error) {
        return () => {};
      }
    };

    let unsubscribeFns = null;
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(async () => {
        unsubscribeFns = await setupListeners();
      }, { timeout: 4000 });
    } else {
      setTimeout(async () => {
        unsubscribeFns = await setupListeners();
      }, 2000);
    }

    return () => {
      if (unsubscribeFns && typeof unsubscribeFns === 'function') {
        unsubscribeFns();
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(dark));
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("uiState", JSON.stringify({ showAdmin, showMyOrders, showUserProfile }));
    document.body.setAttribute('data-admin-view', showAdmin ? 'true' : 'false');
  }, [showAdmin, showMyOrders, showUserProfile]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (dark) {
      root.classList.add("dark");
      body.classList.add("dark");
      
      body.style.cssText = `
        background-color: #111111;
        background-image: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
        background-attachment: fixed;
      `;
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
      
      body.style.cssText = `
        background-color: #ffffff;
        background-image: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e8eef2 100%);
        background-attachment: fixed;
      `;
    }
  }, [dark]);

  const addToCart = useCallback((item, customizations = {}) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id && JSON.stringify(c.customizations || {}) === JSON.stringify(customizations));
      if (existing) {
        return prev.map((c) => (c.id === item.id && JSON.stringify(c.customizations || {}) === JSON.stringify(customizations) ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...item, qty: 1, customizations }];
    });
    setShowCart(true);
  }, []);

  const removeFromCart = useCallback((idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateQuantity = useCallback((idx, qty) => {
    if (qty <= 0) {
      removeFromCart(idx);
    } else {
      setCart((prev) => prev.map((c, i) => (i === idx ? { ...c, qty } : c)));
    }
  }, [removeFromCart]);

  const customizationPrice = useMemo(() => {
    if (!selectedProduct || !selectedProduct.customizations) return 0;
    return selectedProduct.customizations
      .filter((c) => c.price && customizations[`add-${c.name}`])
      .reduce((sum, c) => sum + (c.price || 0), 0);
  }, [selectedProduct, customizations]);

  const totalProductPrice = (selectedProduct?.price || 0) + customizationPrice;

  const toggleCustomization = useCallback((customName) => {
    setCustomizations((prev) => ({
      ...prev,
      [customName]: !prev[customName],
    }));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (selectedProduct) {
      const selectedCustomizations = {};
      Object.keys(customizations).forEach((key) => {
        if (customizations[key]) {
          selectedCustomizations[key] = true;
        }
      });

      for (let i = 0; i < quantity; i++) {
        addToCart({
          ...selectedProduct,
          price: totalProductPrice,
        }, selectedCustomizations);
      }
      setSelectedProduct(null);
      setQuantity(1);
      setCustomizations({});
    }
  }, [selectedProduct, customizations, quantity, totalProductPrice, addToCart]);

  const handleCheckoutData = useCallback((data) => {

    setCheckoutData(data);
  }, []);

  async function placeOrder(checkoutDataParam) {
    const dataToUse = checkoutDataParam || checkoutData;

    if (!dataToUse) {
      alert("Te rog completează toate datele clientului!");
      throw new Error("Missing checkout data");
    }

    if (!dataToUse.name?.trim() || !dataToUse.email?.trim() || !dataToUse.phone?.trim() || !dataToUse.address?.trim()) {
      alert("Te rog completează toate datele clientului!");
      throw new Error("Missing required customer data");
    }

    const id = Math.random().toString(36).slice(2, 9).toUpperCase();
    
    const etaPickupBase = locationToday?.etaPickupBase || 15;
    const etaDeliveryBase = locationToday?.etaDeliveryBase || 30;
    const etaPerItem = locationToday?.etaPerItem || 2;
    
    const baseTime = dataToUse.deliveryOption === "pickup" ? etaPickupBase : etaDeliveryBase;
    const itemsTime = cart.reduce((sum, item) => sum + item.qty, 0) * etaPerItem;
    const eta = Math.max(1, baseTime + itemsTime);
    
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const delivery = dataToUse.deliveryOption === "pickup" ? 0 : 15;
    const tax = subtotal * 0.1;
    const total = subtotal + delivery + tax;

    const newOrder = {
      id,
      timestamp: new Date().toISOString(),
      items: cart,
      customer: dataToUse,
      subtotal,
      delivery,
      tax,
      total,
      status: "pending",
      eta,
      userId: currentUser?.id,
      userName: currentUser?.name,
      userRole: currentUser?.role,
      deliveryOption: dataToUse.deliveryOption,
    };

    let firestoreId;
    try {
      const result = await apiPost("/api/orders", newOrder);
      firestoreId = result.id || result.firestoreId || id;
    } catch (error) {
      console.error('Failed to place order:', error);
      alert(t("orderSaveError"));
      throw error;
    }

    if (currentUser?.id && dataToUse.address) {
      try {
        const updateResponse = await apiPut(`/api/users/${currentUser.id}`, {
          address: dataToUse.address
        });
        
        if (updateResponse) {
          const updatedUser = {
            ...currentUser,
            address: dataToUse.address,
            addressDetails: dataToUse.addressDetails,
            _lastUpdated: Date.now(),
          };
          setCurrentUser(updatedUser);
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
      } catch (error) {
      }
    }

    setOrders((prev) => [newOrder, ...prev]);
    setOrderPlaced({ id, firestoreId, eta, status: "pending", timestamp: new Date().toISOString() });
    setCart([]);
    setShowCart(false);
    setShowCheckout(false);
    setCheckoutData(null);
    setShowOrderStatus(true);
  }

  // Show loading screen until auth is initialized
  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showAuth ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <Suspense fallback={<LoadingFallback />}>
              <Auth
                dark={dark}
                resetToken={resetToken}
                onResetComplete={() => {
                  setResetToken(null);
                  if (window.location.pathname === '/reset-password') {
                    window.history.replaceState({}, '', '/');
                  }
                }}
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  setShowAuth(false);
                }}
                onBackClick={() => {
                  if (resetToken) {
                    setResetToken(null);
                    if (window.location.pathname === '/reset-password') {
                      window.history.replaceState({}, '', '/');
                    }
                  }
                  setShowAuth(false);
                }}
              />
            </Suspense>
          </motion.div>
        ) : (
          <motion.main
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`min-h-screen antialiased relative overflow-hidden pt-20 ${
              dark
                ? "dark bg-gradient-to-b from-[#0b0b0b] to-[#111827] text-slate-100"
                : "bg-gradient-to-b from-white to-slate-50 text-slate-900"
            }`}>
            {/* Decorative gradient orbs - optimized for mobile */}
            {/* Only show on desktop, or show with reduced blur on mobile */}
            <div className="absolute top-20 right-10 w-96 h-96 rounded-full filter blur-2xl animate-float pointer-events-none hidden md:block"
              style={{background: dark ? "radial-gradient(circle, #FF6B35, transparent)" : "radial-gradient(circle, #E85A1F, transparent)", mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.2 : 0.12}}></div>
            <div className="absolute bottom-32 left-10 w-96 h-96 rounded-full filter blur-2xl animate-float pointer-events-none hidden md:block" 
              style={{background: dark ? "radial-gradient(circle, #FF2D55, transparent)" : "radial-gradient(circle, #D91C46, transparent)", mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.2 : 0.12, animationDelay: "1s"}}></div>
            <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full filter blur-2xl animate-float pointer-events-none hidden md:block"
              style={{background: dark ? "radial-gradient(circle, #4A90E2, transparent)" : "radial-gradient(circle, #2563EB, transparent)", mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.15 : 0.1, animationDelay: "2s"}}></div>
            
            <Hero dark={dark} />
            <div id="menu">
              <Menu dark={dark} filter={filter} setFilter={setFilter} addToCart={addToCart} products={products} isLoadingProducts={isLoadingProducts} setSelectedProduct={setSelectedProduct} setQuantity={setQuantity} setCustomizations={setCustomizations} />
            </div>
            <div id="where">
              <Location dark={dark} locationToday={locationToday} />
            </div>
            <div id="about">
              <Testimonials dark={dark} />
            </div>
            
            <About dark={dark} />

            <OrderConfirmation dark={dark} orderPlaced={orderPlaced} />

            <Footer dark={dark} />
          </motion.main>
        )}
      </AnimatePresence>

      {/* Checkout Modal - Outside motion container for proper fixed positioning */}
      <Suspense fallback={null}>
        <Checkout
          dark={dark}
          showCheckout={showCheckout}
          setShowCheckout={setShowCheckout}
          cart={cart}
          placeOrder={placeOrder}
          onCheckoutData={handleCheckoutData}
          currentUser={currentUser}
          onCheckoutOpen={() => setShowCart(false)}
        />
      </Suspense>

      {/* Order Status Modal - Outside motion container for proper fixed positioning */}
      <Suspense fallback={null}>
        <OrderStatus
          dark={dark}
          orderPlaced={orderPlaced}
          onClose={() => {
            setShowOrderStatus(false);
            setOrderPlaced(null);
          }}
        />
      </Suspense>

      {/* UserProfile Modal - Overlay on top of main page */}
      <AnimatePresence>
        {showUserProfile && currentUser && (
          <UserProfile
            dark={dark}
            onBack={() => {
              setShowUserProfile(false);
              // Clear from localStorage immediately
              const uiState = JSON.parse(localStorage.getItem('uiState') || '{}');
              uiState.showUserProfile = false;
              localStorage.setItem('uiState', JSON.stringify(uiState));
            }}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}
      </AnimatePresence>

      {/* MyOrders Modal - Overlay on top of main page */}
      <AnimatePresence>
        {showMyOrders && currentUser && (
          <MyOrders
            dark={dark}
            onBack={() => {
              setShowMyOrders(false);
              // Clear from localStorage immediately
              const uiState = JSON.parse(localStorage.getItem('uiState') || '{}');
              uiState.showMyOrders = false;
              localStorage.setItem('uiState', JSON.stringify(uiState));
            }}
            orders={orders}
            currentUser={currentUser}
            isLoadingOrders={isLoadingOrders}
          />
        )}
      </AnimatePresence>

      {/* Admin Modal - Overlay on top of main page */}
      <AnimatePresence>
        {showAdmin && isInitialized && currentUser?.role === "admin" && (
          <Admin
            dark={dark}
            onBack={() => {

              setShowAdmin(false);
              localStorage.removeItem("uiState");
            }}
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            currentUser={currentUser}
            locationToday={locationToday}
            setLocationToday={setLocationToday}
          />
        )}
      </AnimatePresence>

      {/* Navigation - Outside of motion containers so it has proper fixed positioning */}
      {!showAdmin && !showUserProfile && !showMyOrders && !showAuth && (
        <Navigation
          dark={dark}
          setDark={setDark}
          cartCount={cart.length}
          setShowCart={setShowCart}
          onAdminClick={() => setShowAdmin(true)}
          currentUser={currentUser}
          onLogout={() => {
            logout();
            setCurrentUser(null);
            setShowAdmin(false);
            setShowMyOrders(false);
            setShowUserProfile(false);
          }}
          onAuthClick={() => setShowAuth(true)}
          onMyOrdersClick={() => setShowMyOrders(true)}
          onUserProfileClick={() => setShowUserProfile(true)}
        />
      )}

      {/* Cart - Outside of motion containers so it has proper fixed positioning */}
      {!showAdmin && !showUserProfile && !showMyOrders && (
        <Cart
          dark={dark}
          showCart={showCart}
          setShowCart={setShowCart}
          cart={cart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          setShowCheckout={setShowCheckout}
        />
      )}
      {/* Product Detail Modal - Outside of motion containers so it has proper fixed positioning */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none`}>
              <div className={`w-full max-w-sm max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto relative ${
                dark ? "bg-neutral-900 border border-neutral-800" : "bg-white border border-gray-200"
              }`}>
              
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedProduct(null)}
                className={`absolute top-4 right-4 p-2 rounded-full z-50 transition ${
                  dark ? "bg-neutral-800 hover:bg-neutral-700" : "bg-gray-200 hover:bg-gray-300"
                }`}>
                <X size={24} className={dark ? "text-white" : "text-gray-900"} />
              </motion.button>

              <div className="flex flex-col h-full overflow-hidden">
                {/* Image Section - Top */}
                <div className="w-full h-56 bg-gradient-to-b from-fastfood-red/20 to-fastfood-orange/20 flex-shrink-0 overflow-hidden flex items-center justify-center p-2">
                  {selectedProduct.img ? (
                    <img
                      src={selectedProduct.img}
                      alt={selectedProduct.title}
                      className={`h-full w-full object-cover rounded-xl border-4 ${
                        dark ? "border-neutral-600" : "border-gray-400"
                      }`}
                    />
                  ) : (
                    <div className={`h-full w-full flex items-center justify-center rounded-xl border-4 ${
                      dark ? "border-neutral-600 bg-neutral-700" : "border-gray-400 bg-gray-200"
                    }`}>
                      <span className={`text-sm font-semibold ${dark ? "text-neutral-400" : "text-gray-600"}`}>No image</span>
                    </div>
                  )}
                </div>

                {/* Details Section - Scrollable */}
                <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto">
                  {/* Title and Price */}
                  <div className="mb-4">
                    <h2 className={`text-3xl font-black mb-2 ${dark ? "text-white" : "text-gray-900"}`}>
                      {selectedProduct.title}
                    </h2>
                    <p className={`text-sm mb-3 ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                      {selectedProduct.desc}
                    </p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <div className="text-4xl font-black bg-gradient-to-r from-fastfood-yellow to-fastfood-orange bg-clip-text text-transparent">
                        {Number(totalProductPrice).toFixed(2)}
                      </div>
                      <span className={`text-lg ${dark ? "text-neutral-400" : "text-gray-600"}`}>lei</span>
                      {customizationPrice > 0 && (
                        <span className={`text-sm ml-2 ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                          (+{customizationPrice.toFixed(2)} lei adaosuri)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customizations */}
                  {selectedProduct.customizations && selectedProduct.customizations.length > 0 && (
                    <div className="mb-6 space-y-4">
                      {/* Eliminare din produs - toate customizations */}
                      <div>
                        <h3 className={`font-bold mb-3 text-sm uppercase tracking-wide ${dark ? "text-neutral-300" : "text-gray-700"}`}>
                          🗑️ Elimina din produs
                        </h3>
                        <div className="space-y-2">
                          {selectedProduct.customizations.map((custom) => (
                            <label
                              key={`remove-${custom.name}`}
                              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${
                                customizations[`remove-${custom.name}`]
                                  ? "bg-gradient-to-r from-red-600 to-red-500 text-white"
                                  : dark
                                  ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}>
                              <input
                                type="checkbox"
                                checked={customizations[`remove-${custom.name}`] || false}
                                onChange={() => toggleCustomization(`remove-${custom.name}`)}
                                className="w-5 h-5 cursor-pointer"
                              />
                              <span className="flex-1">{custom.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Adauga la produs - doar items cu price */}
                      {selectedProduct.customizations.filter((c) => c.price).length > 0 && (
                        <div>
                          <h3 className={`font-bold mb-3 text-sm uppercase tracking-wide ${dark ? "text-neutral-300" : "text-gray-700"}`}>
                            ➕ Adauga la produs
                          </h3>
                          <div className="space-y-2">
                            {selectedProduct.customizations.filter((c) => c.price).map((custom) => (
                              <label
                                key={`add-${custom.name}`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${
                                  customizations[`add-${custom.name}`]
                                    ? "bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white"
                                    : dark
                                    ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}>
                                <input
                                  type="checkbox"
                                  checked={customizations[`add-${custom.name}`] || false}
                                  onChange={() => toggleCustomization(`add-${custom.name}`)}
                                  className="w-5 h-5 cursor-pointer"
                                />
                                <span className="flex-1">{custom.name}</span>
                                <span className="text-sm font-semibold">+{custom.price.toFixed(2)} RON</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <h3 className={`font-bold mb-3 ${dark ? "text-white" : "text-gray-900"}`}>
                      Cantitate
                    </h3>
                    <div className={`flex items-center gap-4 p-3 rounded-lg ${
                      dark ? "bg-neutral-800" : "bg-gray-200"
                    }`}>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 rounded-lg bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white hover:shadow-lg transition">
                        <Minus size={20} />
                      </motion.button>
                      <span className={`text-2xl font-bold min-w-[50px] text-center ${
                        dark ? "text-white" : "text-gray-900"
                      }`}>
                        {quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 rounded-lg bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white hover:shadow-lg transition">
                        <Plus size={20} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Add to Cart Button - Sticky */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white font-bold rounded-lg hover:shadow-lg hover:shadow-fastfood-red/50 transition-all flex items-center justify-center gap-2 text-lg mt-auto">
                    <ShoppingBag size={24} />
                    Adauga la cos ({quantity}x)
                  </motion.button>
                </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </>
    );
  }
  
  export default function App() {
    return (
      <LanguageProvider>
        <Suspense fallback={<LoadingFallback />}>
          <AppContent />
        </Suspense>
      </LanguageProvider>
    );
  }


