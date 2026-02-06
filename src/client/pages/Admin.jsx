import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { debug } from "../../shared/utils/debug";
import { useLanguage } from "../hooks/useLanguage";
import { ArrowLeft, Plus, Edit2, Trash2, CheckCircle, Clock, X, Shield, Settings, Upload } from "lucide-react";
import { apiCall, apiGet, apiPost, apiPut, apiDelete } from "../api/apiClient";

// All data operations handled by backend API with authentication

export default function Admin({ dark, onBack, products = [], setProducts, orders = [], setOrders, currentUser, locationToday, setLocationToday }) {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  
  // Ensure products and orders are arrays
  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  // Keep a ref to always have the latest safeOrders (for use in effects without restarting them)
  const safeOrdersRef = useRef(safeOrders);
  useEffect(() => {
    safeOrdersRef.current = safeOrders;
  }, [safeOrders]);
  
  // Check if user is admin
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`min-h-screen flex items-center justify-center ${
          dark
            ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white"
            : "bg-gradient-to-b from-white to-gray-50 text-gray-900"
        }`}>
        <div className="text-center">
          <Shield size={64} className="mx-auto mb-4 text-fastfood-red" />
          <h1 className="text-3xl font-bold mb-2">{t("accessDenied")}</h1>
          <p className={`mb-6 ${dark ? "text-gray-400" : "text-gray-600"}`}>{t("onlyAdminsAccess")}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-fastfood-red/50 transition">
            {t("backToSite")}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const [tab, setTab] = useState("products");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserData, setEditingUserData] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [etaTimers, setEtaTimers] = useState({}); // Track ETA timers per order in seconds
  const [editingOrderEta, setEditingOrderEta] = useState(null); // Track which order ETA is being edited
  const [editingOrderEtaValue, setEditingOrderEtaValue] = useState(0);
  const [deletingOrderId, setDeletingOrderId] = useState(null); // Track which order is being deleted
  const [ordersSubTab, setOrdersSubTab] = useState("inProgress"); // Track orders sub-tab: "inProgress" or "completed"
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    tags: "",
    img: "",
    desc: "",
    customizations: [],
  });
  const [customizationInput, setCustomizationInput] = useState({ name: "", price: "" });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Load products and orders from Backend on mount
  useEffect(() => {
    // Signal to App.jsx that Admin panel is open (triggers polling)
    document.body.setAttribute('data-admin-view', 'true');
    
    // Load data immediately - focus on resource loading for LCP
    const loadData = async () => {
      try {
        const data = await apiGet("/api/products");
        if (data.documents && Array.isArray(data.documents)) {
          const formattedProducts = data.documents.map(doc => {
            const fields = doc.fields || {};
            // Parse customizations from Firestore format
            let customizations = [];
            if (fields.customizations?.arrayValue?.values) {
              customizations = fields.customizations.arrayValue.values.map(val => {
                const name = val.mapValue?.fields?.name?.stringValue || "";
                const price = val.mapValue?.fields?.price?.doubleValue || 0;
                return { name, price };
              }).filter(c => c.name); // Filter out empty ones
            }
            
            return {
              id: doc.name.split('/').pop(),
              title: fields.title?.stringValue || "",
              price: fields.price?.doubleValue || 0,
              img: fields.imageUrl?.stringValue || "",
              desc: fields.description?.stringValue || "",
              tags: (fields.category?.stringValue || "")
                .split(",")
                .map(t => t.trim())
                .filter(t => t),
              customizations: customizations,
            };
          });
          setProducts(formattedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        // Don't clear products on error - keep existing data
      }

      // Finished loading
      setIsLoading(false);
    };
    
    // Fetch orders immediately when Admin mounts
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
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
        // Don't clear orders on error - keep existing data
      }
    };
    
    loadData();
    fetchOrders();

    // Orders are also fetched by App.jsx polling
    
    // Cleanup: clear admin view flag when unmounting
    return () => {
      document.body.setAttribute('data-admin-view', 'false');
    };
  }, []);

  // Load users from backend
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Load from backend API
        const response = await fetch(getApiUrl("/api/users"));
        if (response.ok) {
          const data = await response.json();
          const documents = data.documents || [];
          const parsedUsers = documents.map(doc => ({
            id: doc.name.split('/').pop(),
            name: doc.fields.name?.stringValue || "",
            email: doc.fields.email?.stringValue || "",
            phone: doc.fields.phone?.stringValue || "",
            address: doc.fields.address?.stringValue || "",
            role: doc.fields.role?.stringValue || "user"
          }));
          setUsers(parsedUsers);
          localStorage.setItem("users", JSON.stringify(parsedUsers));
        } else {
          setUsers([]);
        }
      } catch (error) {
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  // Simple countdown calculation - based on order timestamp and original ETA
  // No complex state tracking needed
  const getRemainingMinutes = (order) => {
    if (!order || !order.timestamp || !order.eta) return 0;
    
    const orderTime = new Date(order.timestamp).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - orderTime) / 1000);
    const remainingSeconds = Math.max(0, (order.eta * 60) - elapsedSeconds);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    
    return remainingMinutes;
  };

  // Force re-render every second for countdown display
  const [, setSecond] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSecond(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize ETA timers from orders (only for NEW orders, don't reset existing ones)
  // This prevents the countdown from being reset when safeOrders changes
  useEffect(() => {
    setEtaTimers((prev) => {
      const updated = { ...prev };
      safeOrders.forEach((order) => {
        if (order.firestoreId) {
          // IMPORTANT: Only initialize if timer doesn't exist yet (new order)
          // Never overwrite existing timers - let them count down!
          if (!(order.firestoreId in updated)) {
            updated[order.firestoreId] = order.eta ? order.eta * 60 : 0;
          }
        }
      });
      return updated;
    });
  }, []); // NEVER depend on safeOrders to avoid resetting!

  // On page refresh/mount, sync ALL timers from database
  // This ensures we have the latest values after a reload
  useEffect(() => {
    const syncTimersFromDB = async () => {
      try {
        const response = await fetch(getApiUrl("/api/orders"));
        if (response.ok) {
          const data = await response.json();
          if (data.documents && Array.isArray(data.documents)) {
            setEtaTimers((prev) => {
              const updated = { ...prev };
              data.documents.forEach((doc) => {
                const firestoreId = doc.name.split('/').pop();
                const eta = doc.fields?.eta?.integerValue || 0;
                // Only set if this order wasn't already being counted down
                if (!(firestoreId in updated)) {
                  updated[firestoreId] = eta ? eta * 60 : 0;
                }
              });
              return updated;
            });
          }
        }
      } catch (error) {
        // Silently fail if sync doesn't work
      }
    };
    
    // Only sync on first mount
    syncTimersFromDB();
  }, []);

  // Handle product form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reload data when tab changes
  useEffect(() => {

    
    if (tab === "products") {
      // Products are already loaded from App.jsx props
    }
    
    // Orders are now fetched by App.jsx and passed as props
    
    if (tab === "users") {
      reloadUsers();
    }
  }, [tab]);

  // Handle ETA edit - save and start timer
  const handleSaveOrderEta = async (firestoreId, newEta) => {
    try {
      // Find the order to get current status
      const order = orders.find(o => o.firestoreId === firestoreId);
      if (!order) {
        alert("Comanda nu a fost găsită");
        return;
      }

      // Send ETA and STATUS - don't wrap in { fields } as backend expects raw JSON
      const firestorePayload = {
        eta: { integerValue: parseInt(newEta) },
        status: { stringValue: order.status } // Preserve current status
      };

      const response = await fetch(getApiUrl(`/api/orders/${firestoreId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firestorePayload)
      });
      
      if (response.ok) {
        // Update orders state with new ETA
        setOrders((prev) =>
          prev.map((o) =>
            o.firestoreId === firestoreId ? { ...o, eta: parseInt(newEta) } : o
          )
        );
        
        // IMPORTANT: Also update the countdown timer to the new ETA value
        setEtaTimers((prev) => ({
          ...prev,
          [firestoreId]: parseInt(newEta) * 60 // Convert minutes to seconds
        }));
        
        setEditingOrderEta(null);
        alert(t("etaUpdated"));
      } else {
        const errorText = await response.text();
        alert(t("etaUpdateError") || "Eroare: " + errorText);
      }
    } catch (error) {
      alert(t("etaUpdateError") + ": " + error.message);
    }
  };

  // Format time for display (minutes)
  const formatEta = (minutes) => {
    if (!minutes || minutes <= 0) return "0m";
    return `${minutes}m`;
  };

  // Reset form
  const resetForm = () => {
    setFormData({ title: "", price: "", tags: "", img: "", desc: "", customizations: [] });
    setCustomizationInput({ name: "", price: "" });
    setEditingId(null);
    setShowAddForm(false);
    setSearchQuery("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle photo upload to AWS
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert(t("invalidFileType") || "Please select an image file");
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert(t("fileTooLarge") || "File size must be less than 20MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      const response = await fetch(getApiUrl("/api/products/upload"), {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        // Try different possible response property names
        const imageUrl = result.url || result.imageUrl || result.link || result.location || result.path;
        if (imageUrl) {
          setFormData((prev) => ({ ...prev, img: imageUrl }));
          alert(t("photoUploadedSuccess") || "Photo uploaded successfully!");
        } else {
          // Still consider upload successful if response was ok
          alert(t("photoUploadedSuccess") || "Photo uploaded successfully!");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || t("photoUploadError") || "Failed to upload photo. Please try again.");
      }
    } catch (error) {
      alert(t("photoUploadError") || "Error uploading photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save location to backend
  const handleSaveLocation = async () => {
    if (!locationToday.name) {
      alert(t("locationNameRequired"));
      return;
    }
    try {
      // For now, just store location in state
      // Backend settings can be updated when needed
      alert(t("settingsSaved"));
    } catch (error) {
      alert(t("settingsSaveError") + error.message);
    }
  };

  // Add/Update product using Backend
  const handleSaveProduct = async () => {
    if (!formData.title || !formData.price) {
      alert(t("titlePriceRequired"));
      return;
    }

    try {
      // Send complete product data in backend format
      const productData = {
        title: formData.title,
        description: formData.desc || "",
        price: parseFloat(formData.price),
        category: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(t => t)
          .join(", "),
        imageUrl: formData.img || "",
        customizations: (formData.customizations || []).map(c => ({
          name: c.name,
          price: parseFloat(c.price) || 0
        })),
      };

      if (editingId) {
        // Update existing product via backend
        const response = await fetch(`https://backend.trifadrian.ro/api/products/${editingId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(productData),
        });
        
        if (response.ok) {
          resetForm();
          // Refetch products to ensure consistency with backend
          try {
            const refreshResponse = await fetch(getApiUrl("/api/products"));
            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              if (data.documents && Array.isArray(data.documents)) {
                const formattedProducts = data.documents.map(doc => {
                  const fields = doc.fields || {};
                  let customizations = [];
                  if (fields.customizations?.arrayValue?.values) {
                    customizations = fields.customizations.arrayValue.values.map(val => {
                      const name = val.mapValue?.fields?.name?.stringValue || "";
                      const price = val.mapValue?.fields?.price?.doubleValue || 0;
                      return { name, price };
                    }).filter(c => c.name);
                  }
                  return {
                    id: doc.name.split('/').pop(),
                    title: fields.title?.stringValue || "",
                    price: fields.price?.doubleValue || 0,
                    img: fields.imageUrl?.stringValue || "",
                    desc: fields.description?.stringValue || "",
                    tags: (fields.category?.stringValue || "")
                      .split(",")
                      .map(t => t.trim())
                      .filter(t => t),
                    customizations: customizations,
                  };
                });
                setProducts(formattedProducts);
              }
            }
          } catch (err) {
            console.error("Error refetching products:", err);
          }
          alert(t("productSaved"));
        } else {
          const errorText = await response.text().catch(() => response.statusText);
          alert(t("productSaveError") + "\nStatus: " + response.status + "\nError: " + errorText);
        }
      } else {
        // Add new product via backend
        const response = await fetch(`https://backend.trifadrian.ro/api/products`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(productData),
        });
        
        if (response.ok) {
          resetForm();
          // Refetch products to ensure consistency with backend
          try {
            const refreshResponse = await fetch(getApiUrl("/api/products"));
            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              if (data.documents && Array.isArray(data.documents)) {
                const formattedProducts = data.documents.map(doc => {
                  const fields = doc.fields || {};
                  let customizations = [];
                  if (fields.customizations?.arrayValue?.values) {
                    customizations = fields.customizations.arrayValue.values.map(val => {
                      const name = val.mapValue?.fields?.name?.stringValue || "";
                      const price = val.mapValue?.fields?.price?.doubleValue || 0;
                      return { name, price };
                    }).filter(c => c.name);
                  }
                  return {
                    id: doc.name.split('/').pop(),
                    title: fields.title?.stringValue || "",
                    price: fields.price?.doubleValue || 0,
                    img: fields.imageUrl?.stringValue || "",
                    desc: fields.description?.stringValue || "",
                    tags: (fields.category?.stringValue || "")
                      .split(",")
                      .map(t => t.trim())
                      .filter(t => t),
                    customizations: customizations,
                  };
                });
                setProducts(formattedProducts);
              }
            }
          } catch (err) {
            // Ignore refetch errors
          }
          alert(t("productSaved"));
        } else {
          const errorText = await response.text().catch(() => response.statusText);
          alert(t("productSaveError") + "\nStatus: " + response.status + "\nError: " + errorText);
        }
      }
    } catch (error) {
      alert(t("productSaveError") + ": " + error.message);
    }
  };

  // Edit product
  const handleEditProduct = (product) => {
    setFormData({
      title: product.title || "",
      price: product.price.toString(),
      tags: product.tags ? product.tags.join(", ") : "",
      img: product.img || "",
      desc: product.desc || "",
      customizations: product.customizations || [],
    });
    setEditingId(product.id);
    setShowAddForm(true);
  };

  // Delete product via Backend
  const handleDeleteProduct = async (id) => {
    if (window.confirm(t("confirm"))) {
      try {
        const response = await fetch(`https://backend.trifadrian.ro/api/products/${id}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          setProducts((prev) => prev.filter((p) => p.id !== id));
          alert(t("productDeleted"));
        }
      } catch (error) {
        alert(t("productDeleteError"));
      }
    }
  };

  // Update order status in Firestore
  const handleUpdateOrderStatus = async (firestoreId, newStatus, orderId) => {
    try {
      // Find the order to get eta if available
      const order = orders.find(o => o.firestoreId === firestoreId);
      
      // Send data in Firestore format (as the backend expects)
      const firestorePayload = {
        status: { stringValue: newStatus },
        eta: { integerValue: order?.eta || 20 }
      };

      const response = await fetch(getApiUrl(`/api/orders/${firestoreId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firestorePayload)
      });
      
      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.firestoreId === firestoreId ? { ...o, status: newStatus } : o
          )
        );
        alert(t("orderUpdated") || "Comanda actualizată!");
      } else {
        const errorText = await response.text();
        alert(`Eroare ${response.status}: Verifica Network tab`);
      }
    } catch (error) {
      alert(t("orderUpdateError") || "Eroare la actualizare comenzii");
    }
  };

  // Delete order via Backend
  const handleDeleteOrder = async (order) => {
    if (window.confirm(t("confirm"))) {
      setDeletingOrderId(order.firestoreId);
      try {
        const response = await fetch(getApiUrl(`/api/orders/${order.firestoreId}`), {
          method: "DELETE",
        });
        
        if (response.ok) {
          setOrders((prev) => prev.filter((o) => o.firestoreId !== order.firestoreId));
          setDeletingOrderId(null);
          alert(t("orderDeleted"));
        }
      } catch (error) {
        setDeletingOrderId(null);
        alert(t("orderDeleteError"));
      }
    }
  };

  // Get all users from Firestore
  const reloadUsers = async () => {
    try {
      const response = await fetch(getApiUrl("/api/users"));
      if (response.ok) {
        const data = await response.json();
        const documents = data.documents || [];
        const parsedUsers = documents.map(doc => ({
          id: doc.name.split('/').pop(),
          name: doc.fields.name?.stringValue || "",
          email: doc.fields.email?.stringValue || "",
          phone: doc.fields.phone?.stringValue || "",
          address: doc.fields.address?.stringValue || "",
          role: doc.fields.role?.stringValue || "user"
        }));
        setUsers(parsedUsers);
        localStorage.setItem("users", JSON.stringify(parsedUsers));
      }
    } catch (error) {
      setUsers([]);
    }
  };

  // Update user role
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(getApiUrl(`/api/users/${userId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        await reloadUsers();
      } else {
        alert(t("roleUpdateError"));
      }
    } catch (error) {
      alert(t("roleUpdateError"));
    }
  };

  // Update user name and email
  const handleUpdateUser = async (userId, name, email) => {
    if (!name || !email) {
      alert(t("nameEmailAdminRequired"));
      return;
    }
    try {
      const response = await fetch(getApiUrl(`/api/users/${userId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
      });
      
      if (response.ok) {
        await reloadUsers();
        alert(t("userUpdated"));
      } else {
        alert(t("userUpdateError"));
      }
    } catch (error) {
      alert(t("userUpdateError"));
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, userEmail) => {
    if (window.confirm(t("confirm"))) {
      try {
        const response = await fetch(getApiUrl(`/api/users/${userId}`), {
          method: "DELETE"
        });
        
        if (response.ok) {
          await reloadUsers();
        } else {
          alert(t("userDeleteError"));
        }
      } catch (error) {
        alert(t("userDeleteError"));
      }
    }
  };

  // Get user's orders
  const getUserOrders = (userId) => {
    return orders.filter((order) => order.userId === userId);
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setEditingUserData({ name: user.name, email: user.email });
  };

  // Save user changes to Firestore
  const handleSaveUserChanges = async (userId) => {
    if (!editingUserData.name || !editingUserData.email) {
      alert(t("nameEmailAdminRequired"));
      return;
    }
    try {
      await updateUser(userId, {
        name: editingUserData.name,
        email: editingUserData.email
      });
      await reloadUsers();
      setEditingUserId(null);

    } catch (error) {

      alert(t("dataSaveError"));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onBack}
        className="fixed inset-0 bg-black/60 z-[9980] backdrop-blur-sm"
      />
      
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`fixed inset-0 z-[9981] overflow-y-auto ${
          dark
            ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white"
            : "bg-gradient-to-b from-white to-gray-50 text-gray-900"
        }`}>
        {/* Header */}
        <div className={`max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b ${dark ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {

                // Ensure mandatory navigation to main page
                if (typeof onBack === "function") {
                  onBack();
                } else {

                }
              }}
              className={`p-2 rounded-lg transition ${
                dark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}>
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-3xl">⚙️</span>
              <h1 className="text-3xl font-black bg-gradient-to-r from-fastfood-red to-fastfood-orange bg-clip-text text-transparent">{t("adminPanel")}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${dark ? "bg-fastfood-red/20 text-fastfood-red" : "bg-fastfood-red/10 text-fastfood-red"}`}>
              📦 {safeProducts.length} | 📋 {safeOrders.length} | 👥 {users.length}
            </span>
          </div>
        </div>

        {/* Loading Screen */}
      {isLoading && (
        <div className={`absolute inset-0 z-[9999] flex items-center justify-center ${dark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-sm`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6">
              <div className="w-16 h-16 border-4 border-fastfood-red/30 border-t-fastfood-red rounded-full mx-auto" />
            </motion.div>
            <h2 className={`text-2xl font-bold mb-2 ${dark ? "text-white" : "text-gray-900"}`}>
              {t("loadingData")}
            </h2>
            <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
              {t("waitingSync")}
            </p>
          </motion.div>
        </div>
      )}

      {/* Firebase Status Alert */}
        {!isLoading && (safeProducts.length === 0 || safeOrders.length === 0) && (
          <div className="max-w-6xl mx-auto px-6 py-4 mt-4">
            <div className={`p-4 rounded-lg border-2 ${dark ? "bg-fastfood-orange/10 border-fastfood-orange" : "bg-fastfood-orange/5 border-fastfood-orange"}`}>
            <p className="font-bold text-fastfood-orange">⚠️ Status Firebase</p>
            <p className={`text-sm mt-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
              {safeProducts.length === 0 && safeOrders.length === 0 ? (
                <>{t("firebaseConfig")} <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-fastfood-orange">{t("firebaseConsole")}</a> → {t("firebaseRules")}</>
              ) : safeProducts.length === 0 ? (
                <>{t("productsLoadError")}</>
              ) : (
                <>{t("ordersLoadError")}</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className={`flex gap-4 border-b mb-8 overflow-x-auto ${dark ? "border-gray-700" : "border-gray-200"}`}>
          {["products", "orders", "users", "settings"].map((tabName) => (
            <motion.button
              key={tabName}
              onClick={() => setTab(tabName)}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 font-bold transition border-b-2 ${
                tab === tabName
                  ? "border-fastfood-orange text-fastfood-orange"
                  : dark
                    ? "border-transparent text-gray-400 hover:text-gray-200"
                    : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {tabName === "products" ? "📦 " + t("products") : tabName === "orders" ? "📋 " + t("orders") : tabName === "users" ? "👥 " + t("users") : "⚙️ " + t("settings")}
            </motion.button>
          ))}
        </div>

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6">
              <input
                type="text"
                placeholder={t("searchProducts")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                className={`w-full px-4 py-2 rounded-lg border ${dark ? "bg-gray-800/50 border-gray-700 text-white" : "bg-white border-gray-300"}`}
              />
            </div>

            {/* Add Product Button */}
            {!showAddForm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(true)}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white rounded-lg font-bold hover:shadow-lg hover:shadow-fastfood-red/50 transition">
                <Plus size={20} /> {t("addProduct")}
              </motion.button>
            )}

            {/* Add/Edit Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-8 p-6 rounded-lg border ${
                    dark ? "bg-gray-800/50 border-fastfood-orange/30" : "bg-gray-50 border-gray-200"
                  }`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{editingId ? t("editProduct") : t("addNewProduct")}</h3>
                    <button
                      onClick={resetForm}
                      className="p-1 hover:bg-fastfood-red/20 rounded transition text-fastfood-red">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <input
                      type="text"
                      name="title"
                      placeholder={t("productTitle")}
                      value={formData.title}
                      onChange={handleFormChange}
                      className={`px-4 py-2 rounded-lg border ${
                        dark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                    
                    {/* Price */}
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        placeholder={t("priceLabel")}
                        step="0.01"
                        value={formData.price}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          dark
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300"
                        }`}
                      />
                      <span className={`absolute right-3 top-2 text-sm font-semibold ${dark ? "text-gray-400" : "text-gray-600"}`}>RON</span>
                    </div>
                    
                    {/* Tags */}
                    <input
                      type="text"
                      name="tags"
                      placeholder={t("tags")}
                      value={formData.tags}
                      onChange={handleFormChange}
                      className={`px-4 py-2 rounded-lg border ${
                        dark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                    
                    {/* Photo Upload Section */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">{t("productPhoto") || "📸 Product Photo"}</label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                        dark
                          ? "border-gray-600 hover:border-fastfood-orange bg-gray-700/30 hover:bg-gray-700/50"
                          : "border-gray-300 hover:border-fastfood-orange bg-gray-50 hover:bg-gray-100"
                      }`}
                        onClick={() => fileInputRef.current?.click()}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={isUploadingPhoto}
                          className="hidden"
                        />
                        <Upload size={24} className="mx-auto mb-2 text-fastfood-orange" />
                        <p className="font-semibold">{isUploadingPhoto ? t("uploading") || "Uploading..." : t("clickToUpload") || "Click to upload photo"}</p>
                        <p className={`text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                          {t("imageSizeLimit") || "Max 5MB • PNG, JPG, WebP"}
                        </p>
                      </div>
                      
                      {/* Photo Preview */}
                      {formData.img && (
                        <div className="mt-3 relative">
                          <img
                            src={formData.img}
                            alt="Preview"
                            className={`w-full max-h-48 object-cover rounded-lg border ${dark ? "border-gray-600" : "border-gray-300"}`}
                          />
                          <button
                            onClick={() => setFormData((prev) => ({ ...prev, img: "" }))}
                            className="absolute top-2 right-2 p-1 bg-fastfood-red hover:bg-fastfood-red/80 text-white rounded-full transition">
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Description */}
                    <textarea
                      name="desc"
                      placeholder={t("description")}
                      value={formData.desc}
                      onChange={handleFormChange}
                      rows="3"
                      className={`px-4 py-2 rounded-lg border md:col-span-2 ${
                        dark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  {/* Customizations Section */}
                  <div className={`mt-6 p-4 rounded-lg border ${dark ? "bg-gray-700/30 border-gray-600" : "bg-gray-100 border-gray-300"}`}>
                    <h4 className="font-bold mb-4">{t("customizations")}</h4>
                    <div className="space-y-3 mb-4">
                      {formData.customizations.map((custom, idx) => (
                        <div key={idx} className={`p-3 rounded-lg flex items-center justify-between ${dark ? "bg-gray-600" : "bg-white"}`}>
                          <div>
                            <h5 className="font-semibold">{custom.name}</h5>
                            <p className={`text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>{custom.price.toFixed(2)} RON</p>
                          </div>
                          <button
                            onClick={() => setFormData((prev) => ({
                              ...prev,
                              customizations: prev.customizations.filter((_, i) => i !== idx),
                            }))}
                            className="text-fastfood-red hover:scale-110 transition">
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder={t("customizationName")}
                        value={customizationInput.name}
                        onChange={(e) => setCustomizationInput((prev) => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={t("customizationPrice")}
                          step="0.01"
                          value={customizationInput.price}
                          onChange={(e) => setCustomizationInput((prev) => ({ ...prev, price: parseFloat(e.target.value) || "" }))}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                          }`}
                        />
                        <span className={`absolute right-3 top-2 text-sm font-semibold ${dark ? "text-gray-400" : "text-gray-600"}`}>RON</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (customizationInput.name.trim() && customizationInput.price !== "") {
                          setFormData((prev) => ({
                            ...prev,
                            customizations: [...prev.customizations, { name: customizationInput.name, price: parseFloat(customizationInput.price) || 0 }],
                          }));
                          setCustomizationInput({ name: "", price: "" });
                        }
                      }}
                      className="w-full mt-3 px-4 py-2 bg-fastfood-orange text-white rounded-lg font-bold hover:shadow-lg transition">
                      {t("addCustomization")}
                    </button>
                  </div>

                  <div className="flex gap-2 justify-end mt-4">
                    <button
                      onClick={resetForm}
                      className={`px-4 py-2 rounded-lg transition ${
                        dark
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}>
                      {t("cancel")}
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="px-4 py-2 bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white rounded-lg font-bold hover:shadow-lg hover:shadow-fastfood-red/50 transition">
                      {editingId ? t("update") : t("addProduct")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products List */}
            <div className="grid gap-4">
              {(!safeProducts || safeProducts.length === 0) ? (
                <div className={`text-center py-12 rounded-lg ${dark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                  <p className="text-lg font-semibold">{t("noProductsAtMoment")}</p>
                </div>
              ) : (
              <div>
              {Array.isArray(safeProducts) && safeProducts
                .filter((product) =>
                  product?.title?.toLowerCase?.()?.includes(searchQuery.toLowerCase()) ||
                  product?.desc?.toLowerCase?.()?.includes(searchQuery.toLowerCase()) ||
                  product?.tags?.some?.((tag) => tag?.toLowerCase?.()?.includes(searchQuery.toLowerCase()))
                )
                .map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    dark ? "bg-gray-800/50 border-fastfood-orange/20" : "bg-white border-gray-200"
                  }`}>
                  <div className="flex items-center gap-4 flex-1">
                    {product.img && (
                      <img
                        src={product.img}
                        alt={product.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{product?.title}</h4>
                      <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                        <span className="text-fastfood-orange font-bold">€{product?.price?.toFixed?.(2) || "0.00"}</span> • {product?.tags?.join?.(", ") || ""}
                      </p>
                      <p className={`text-sm ${dark ? "text-gray-500" : "text-gray-700"} line-clamp-1`}>
                        {product?.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditProduct(product)}
                      className="p-2 bg-fastfood-blue/20 hover:bg-fastfood-blue/40 text-fastfood-blue rounded-lg transition">
                      <Edit2 size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-fastfood-red/20 hover:bg-fastfood-red/40 text-fastfood-red rounded-lg transition">
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
              </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Sub-tabs for Orders */}
            <div className={`flex gap-4 border-b mb-8 overflow-x-auto ${dark ? "border-gray-700" : "border-gray-200"}`}>
              <motion.button
                onClick={() => setOrdersSubTab("inProgress")}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 font-bold transition border-b-2 ${
                  ordersSubTab === "inProgress"
                    ? "border-fastfood-orange text-fastfood-orange"
                    : dark
                      ? "border-transparent text-gray-400 hover:text-gray-200"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                ⏳ {t("ordersInProgress")}
              </motion.button>
              <motion.button
                onClick={() => setOrdersSubTab("completed")}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 font-bold transition border-b-2 ${
                  ordersSubTab === "completed"
                    ? "border-fastfood-orange text-fastfood-orange"
                    : dark
                      ? "border-transparent text-gray-400 hover:text-gray-200"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                ✅ {t("ordersCompleted")}
              </motion.button>
            </div>

            {/* Alert if no orders and Firebase might be the issue */}
            {orders.length === 0 && (
              <div className={`mb-6 p-4 rounded-lg border-l-4 ${dark ? "bg-fastfood-blue/10 border-fastfood-blue" : "bg-fastfood-blue/5 border-fastfood-blue"}`}>
                <p className="font-semibold text-fastfood-blue">ℹ️ {t("noOrdersFound")}</p>
                <p className={`text-sm mt-1 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  {t("shouldBeOrdersCheck")}
                </p>
                <ul className={`text-sm mt-2 ml-4 list-disc ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  <li>{t("firebaseRulesCorrect")}</li>
                  <li>{t("ordersCollection")}</li>
                  <li>{t("openConsoleErrors")}</li>
                </ul>
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder={`🔍 ${t("searchOrders")}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                className={`w-full px-4 py-2 rounded-lg border ${dark ? "bg-gray-800/50 border-gray-700 text-white" : "bg-white border-gray-300"}`}
              />
            </div>

            {!safeOrders || safeOrders.length === 0 ? (
              <div className={`text-center py-12 rounded-lg ${dark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                <p className="text-lg font-semibold">Nu sunt comenzi în momentul acesta</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {Array.isArray(safeOrders) && safeOrders
                  .filter((order) => {
                    // Filter by sub-tab first
                    if (ordersSubTab === "inProgress") {
                      return order.status !== "completed";
                    } else if (ordersSubTab === "completed") {
                      return order.status === "completed";
                    }
                    return true;
                  })
                  .filter((order) =>
                    order?.id?.toString()?.includes(searchQuery) ||
                    (order?.customer?.name?.toLowerCase?.() || "").includes(searchQuery) ||
                    (order?.customer?.email?.toLowerCase?.() || "").includes(searchQuery) ||
                    (order?.userName?.toLowerCase?.() || "").includes(searchQuery) ||
                    order?.status?.toLowerCase?.()?.includes(searchQuery)
                  )
                  .sort((a, b) => {
                    const timeA = new Date(a?.timestamp || 0).getTime();
                    const timeB = new Date(b?.timestamp || 0).getTime();
                    return timeB - timeA; // Descending: newest first
                  })
                  .map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`rounded-lg border overflow-hidden ${
                      dark ? "bg-gray-800/50 border-fastfood-orange/20" : "bg-white border-gray-200"
                    }`}>
                    
                    {/* Header - Clickable */}
                    <div
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className={`p-4 cursor-pointer hover:opacity-80 transition flex items-center justify-between ${
                        dark ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                      }`}>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">#{order.id}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm">
                          <span className={dark ? "text-gray-400" : "text-gray-600"}>
                            {new Date(order?.timestamp || Date.now()).toLocaleString("ro-RO", { 
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : order.status === "preparing"
                                ? "bg-fastfood-yellow/20 text-fastfood-yellow"
                                : "bg-fastfood-blue/20 text-fastfood-blue"
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-fastfood-orange font-bold">Lei {order?.total?.toFixed?.(2) || "0.00"}</span>
                        </div>
                      </div>
                      <div className={`transition ${expandedOrder === order.id ? "rotate-180" : ""}`}>
                        ▼
                      </div>
                    </div>

                    {/* Details - Expanded */}
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className={`border-t ${dark ? "border-gray-700" : "border-gray-200"} p-4 space-y-4`}>
                          
                          {/* Customer Info */}
                          <div className={`p-4 rounded-lg border-2 ${dark ? "bg-fastfood-blue/10 border-fastfood-blue/30" : "bg-fastfood-blue/5 border-fastfood-blue/20"}`}>
                            <p className="text-sm font-semibold text-fastfood-blue mb-3">📋 INFORMAȚII CLIENT</p>
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="font-semibold text-fastfood-orange">{t("name")}</p>
                                <p className={dark ? "text-gray-200" : "text-gray-800"}>{order.customer?.name || "N/A"}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-fastfood-orange">Email</p>
                                <p className={`break-all ${dark ? "text-gray-200" : "text-gray-800"}`}>{order.customer?.email || "N/A"}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-fastfood-orange">{t("phone")}</p>
                                <p className={dark ? "text-gray-200" : "text-gray-800"}>{order.customer?.phone || "N/A"}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="font-semibold text-fastfood-orange">{t("deliveryAddress")}</p>
                                <p className={dark ? "text-gray-200" : "text-gray-800"}>{order.customer?.address || "N/A"}</p>
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <p className="text-sm font-semibold text-fastfood-orange mb-2">{t("items")}</p>
                            <div className="space-y-2">
                              {Array.isArray(order?.items) && order.items.map((item, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${dark ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                                  <div className={`text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>
                                    • {item?.title} x{item?.qty} = <span className="text-fastfood-orange font-bold">Lei {(item?.price * item?.qty)?.toFixed?.(2) || "0.00"}</span>
                                  </div>
                                  {item?.customizations && Object.keys(item.customizations).length > 0 && (
                                    <div className="ml-4 mt-1 text-xs space-y-0.5">
                                      {Object.entries(item.customizations).map(([key, value]) => {
                                        if (!value) return null;
                                        const isRemove = key.startsWith("remove-");
                                        const label = key.replace(/^(remove|add)-/, "");
                                        return (
                                          <div key={key} className={dark ? "text-neutral-400" : "text-gray-600"}>
                                            {isRemove ? `- ${t("remove")}:` : `+ ${t("add")}:`} {label}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Totals */}
                          <div className={`border-t ${dark ? "border-gray-700" : "border-gray-200"} pt-4 grid grid-cols-4 gap-2 text-sm`}>
                            <div>
                              <p className={dark ? "text-gray-400" : "text-gray-600"}>{t("subtotal")}</p>
                              <p className="font-bold">Lei {order?.subtotal?.toFixed?.(2) || "0.00"}</p>
                            </div>
                            <div>
                              <p className={dark ? "text-gray-400" : "text-gray-600"}>{t("shipping")}</p>
                              <p className="font-bold">Lei {order?.delivery?.toFixed?.(2) || "0.00"}</p>
                            </div>
                            <div>
                              <p className={dark ? "text-gray-400" : "text-gray-600"}>{t("tax")}</p>
                              <p className="font-bold">Lei {order?.tax?.toFixed?.(2) || "0.00"}</p>
                            </div>
                            <div>
                              <p className="text-fastfood-orange font-bold">{t("total")}</p>
                              <p className="text-lg font-extrabold bg-gradient-to-r from-fastfood-red to-fastfood-orange bg-clip-text text-transparent">Lei {order?.total?.toFixed?.(2) || "0.00"}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.firestoreId, e.target.value, order.id)}
                                className={`flex-1 px-3 py-2 rounded-lg border font-semibold transition ${
                                  order.status === "completed"
                                    ? "bg-green-500/20 border-green-500 text-green-400"
                                    : order.status === "preparing"
                                      ? "bg-fastfood-yellow/20 border-fastfood-yellow text-fastfood-yellow"
                                      : "bg-fastfood-blue/20 border-fastfood-blue text-fastfood-blue"
                                }`}>
                                <option value="pending">Pending</option>
                                <option value="preparing">Preparing</option>
                                <option value="completed">Completed</option>
                              </select>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteOrder(order)}
                                disabled={deletingOrderId === order.firestoreId}
                                className={`px-4 py-2 rounded-lg transition font-semibold ${
                                  deletingOrderId === order.firestoreId
                                    ? "bg-gray-500/20 text-gray-400 cursor-not-allowed opacity-50"
                                    : "bg-fastfood-red/20 hover:bg-fastfood-red/40 text-fastfood-red"
                                }`}>
                                {deletingOrderId === order.firestoreId ? (
                                  <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                    {t("deleting")}
                                  </span>
                                ) : (
                                  t("delete")
                                )}
                              </motion.button>
                            </div>

                            {/* ETA Editor */}
                            <div className={`p-3 rounded-lg border ${dark ? "bg-fastfood-orange/10 border-fastfood-orange/30" : "bg-fastfood-orange/5 border-fastfood-orange/20"}`}>
                              <p className="text-sm font-semibold mb-2">⏱️ {t("estimatedTime")}</p>
                              {editingOrderEta === order.firestoreId ? (
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="999"
                                    value={editingOrderEtaValue}
                                    onChange={(e) => setEditingOrderEtaValue(parseInt(e.target.value) || 0)}
                                    placeholder={t("minutes")}
                                    className={`flex-1 px-3 py-2 rounded border font-semibold ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSaveOrderEta(order.firestoreId, editingOrderEtaValue)}
                                    className="px-3 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded font-semibold transition">
                                    ✓
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setEditingOrderEta(null)}
                                    className="px-3 py-2 bg-gray-500/20 hover:bg-gray-500/40 text-gray-400 rounded font-semibold transition">
                                    ✕
                                  </motion.button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-fastfood-orange">
                                    {getRemainingMinutes(order)} min
                                  </span>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setEditingOrderEta(order.firestoreId);
                                      setEditingOrderEtaValue(order.eta);
                                    }}
                                    className="px-3 py-1 bg-fastfood-orange/20 hover:bg-fastfood-orange/40 text-fastfood-orange rounded text-sm font-semibold transition">
                                    Edit
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder={`🔍 ${t("searchUsers")}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                className={`w-full px-4 py-2 rounded-lg border ${dark ? "bg-gray-800/50 border-gray-700 text-white" : "bg-white border-gray-300"}`}
              />
            </div>

            {users.length === 0 ? (
              <div className={`text-center py-12 rounded-lg ${dark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                <p className="text-lg font-semibold">{t("noUsers")}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {Array.isArray(users) && users
                  .filter((user) =>
                    user?.name?.toLowerCase?.()?.includes(searchQuery) ||
                    user?.email?.toLowerCase?.()?.includes(searchQuery) ||
                    user?.role?.toLowerCase?.()?.includes(searchQuery)
                  )
                  .sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0))
                  .map((user) => {
                  const userOrders = getUserOrders(user.id);
                  const userOrdersTotal = userOrders.reduce((sum, order) => sum + order.total, 0);

                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-lg border overflow-hidden ${
                        dark ? "bg-gray-800/50 border-fastfood-orange/20" : "bg-white border-gray-200"
                      }`}>
                      
                      {/* Header - Clickable */}
                      <div
                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                        className={`p-4 cursor-pointer hover:opacity-80 transition flex items-center justify-between ${
                          dark ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                        }`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-lg">{user.name}</h4>
                            {user.role === "admin" && <span className="text-xs bg-fastfood-red/20 px-2 py-1 rounded text-fastfood-red font-bold">👑 Admin</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className={dark ? "text-gray-400" : "text-gray-600"}>{user.email}</span>
                            <span className="text-fastfood-orange font-bold">{userOrders.length} comenzi • Lei {userOrdersTotal.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className={`transition ${expandedUser === user.id ? "rotate-180" : ""}`}>
                          ▼
                        </div>
                      </div>

                      {/* Details - Expanded */}
                      <AnimatePresence>
                        {expandedUser === user.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={`border-t ${dark ? "border-gray-700" : "border-gray-200"} p-4 space-y-4`}>
                            
                            {editingUserId === user.id ? (
                              <div className={`p-4 rounded-lg border mb-4 ${dark ? "bg-gray-700/50 border-gray-600" : "bg-gray-100 border-gray-300"}`}>
                                <div className="grid gap-3">
                                  <input
                                    type="text"
                                    value={editingUserData.name}
                                    onChange={(e) => setEditingUserData({ ...editingUserData, name: e.target.value })}
                                    placeholder={t("name")}
                                    className={`px-3 py-2 rounded-lg border ${dark ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300"}`}
                                  />
                                  <input
                                    type="email"
                                    value={editingUserData.email}
                                    onChange={(e) => setEditingUserData({ ...editingUserData, email: e.target.value })}
                                    placeholder={t("email")}
                                    className={`px-3 py-2 rounded-lg border ${dark ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300"}`}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateUser(user.id, editingUserData.name, editingUserData.email)}
                                      className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-bold hover:bg-green-500/40 transition">
                                      {t("save")}
                                    </button>
                                    <button
                                      onClick={() => setEditingUserId(null)}
                                      className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg font-bold hover:bg-gray-500/40 transition">
                                      {t("cancel")}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className={`p-4 rounded-lg border ${dark ? "bg-gray-700/20 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                                <p className="text-sm"><span className="font-semibold text-fastfood-orange">Email:</span> {user.email}</p>
                                <p className="text-sm mt-1"><span className="font-semibold text-fastfood-orange">{t("phone")}:</span> {user.phone || "N/A"}</p>
                                <p className="text-sm mt-1"><span className="font-semibold text-fastfood-orange">{t("address")}:</span> {user.address || "N/A"}</p>
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  <button
                                    onClick={() => {
                                      setEditingUserId(user.id);
                                      setEditingUserData({ name: user.name, email: user.email });
                                    }}
                                    className="flex-1 px-4 py-2 bg-fastfood-orange/20 text-fastfood-orange rounded-lg font-bold hover:bg-fastfood-orange/40 transition min-w-fit">
                                    {t("edit")}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateUserRole(user.id, user.role === "admin" ? "user" : "admin")}
                                    className={`px-4 py-2 rounded-lg font-bold transition min-w-fit ${
                                      user.role === "admin"
                                        ? "bg-fastfood-blue/20 text-fastfood-blue hover:bg-fastfood-blue/40"
                                        : "bg-fastfood-orange/20 text-fastfood-orange hover:bg-fastfood-orange/40"
                                    }`}>
                                    {user.role === "admin" ? t("makeUser") : t("makeAdmin")}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="px-4 py-2 bg-fastfood-red/20 text-fastfood-red rounded-lg font-bold hover:bg-fastfood-red/40 transition min-w-fit">
                                    {t("delete")}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* User Orders */}
                            {userOrders.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold text-fastfood-orange mb-2">{t("orders")} ({userOrders.length})</p>
                                <div className="space-y-2">
                                  {userOrders.map((order) => (
                                    <div key={order.id} className={`p-3 rounded-lg border text-sm ${dark ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                                      <div className="flex items-center justify-between">
                                        <span>{t("orderLabel")} #{order.id}</span>
                                        <span className="text-fastfood-orange font-bold">Lei {order.total.toFixed(2)}</span>
                                      </div>
                                      <p className={`text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-600"}`}>{new Date(order.timestamp).toLocaleString("ro-RO")}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`max-w-2xl p-8 rounded-2xl border ${dark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
              <h3 className="text-2xl font-bold mb-6">⚙️ {t("appSettings")}</h3>
              
              {/* Location Setting */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">📍 {t("todayLocation")}</label>
                <input
                  type="text"
                  value={locationToday.name || ""}
                  onChange={(e) => setLocationToday({ ...locationToday, name: e.target.value })}
                  placeholder={t("locationPlaceholder")}
                  className={`w-full px-4 py-3 rounded-lg border font-semibold mb-4 ${
                    dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                
                <label className="block text-sm font-semibold mb-3">🔗 {t("googleMapsEmbed")}</label>
                <input
                  type="url"
                  value={locationToday.mapLink || ""}
                  onChange={(e) => setLocationToday({ ...locationToday, mapLink: e.target.value })}
                  placeholder={t("mapsPlaceholder")}
                  className={`w-full px-4 py-3 rounded-lg border font-semibold mb-4 ${
                    dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                />

                <label className="block text-sm font-semibold mb-3">🗺️ {t("googleMapsLink")}</label>
                <input
                  type="url"
                  value={locationToday.googleMapsLink || ""}
                  onChange={(e) => setLocationToday({ ...locationToday, googleMapsLink: e.target.value })}
                  placeholder={t("mapsLinkPlaceholder")}
                  className={`w-full px-4 py-3 rounded-lg border font-semibold mb-6 ${
                    dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                />

                {/* ETA Settings */}
                <label className="block text-sm font-semibold mb-3">⏱️ {t("etaSettings")}</label>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-fastfood-orange">{t("pickupBaseTime")}</label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={locationToday.etaPickupBase || 15}
                      onChange={(e) => setLocationToday({ ...locationToday, etaPickupBase: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border font-semibold ${
                        dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-fastfood-orange">{t("deliveryBaseTime")}</label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={locationToday.etaDeliveryBase || 30}
                      onChange={(e) => setLocationToday({ ...locationToday, etaDeliveryBase: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border font-semibold ${
                        dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-fastfood-orange">{t("preparingBaseTime")}</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={locationToday.etaPerItem || 2}
                      onChange={(e) => setLocationToday({ ...locationToday, etaPerItem: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border font-semibold ${
                        dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                <p className={`text-xs mb-6 p-3 rounded-lg ${dark ? "bg-gray-700/30 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                  📊 Formula: ETA = (Pickup: {locationToday.etaPickupBase || 15} min | Delivery: {locationToday.etaDeliveryBase || 30} min) + ({locationToday.etaPerItem || 2} min × {t("numberOfItems")})
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveLocation}
                  className="w-full px-6 py-3 bg-gradient-to-r from-fastfood-orange to-fastfood-red text-white font-bold rounded-lg hover:shadow-lg hover:shadow-fastfood-orange/50 transition-all duration-200">
                  💾 {t("saveLocation")}
                </motion.button>
              </div>

              <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                ℹ️ {t("locationUpdateInfo")}
              </p>
            </div>
          </motion.div>
        )}
      </div>
      </motion.div>
    </>
  );
}




