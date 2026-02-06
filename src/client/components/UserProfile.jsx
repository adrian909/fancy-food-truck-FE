import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { debug } from "../../shared/utils/debug";
import { useLanguage } from "../hooks/useLanguage";
import { ArrowLeft, Edit2, Save, X, MapPin, Home, Truck, Navigation } from "lucide-react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { apiGet, apiPut } from "../api/apiClient";

// Static libraries array to prevent performance warnings
const GOOGLE_MAPS_LIBRARIES = ["places", "geocoding"];

export default function UserProfile({ dark, onBack, currentUser, setCurrentUser }) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    role: currentUser?.role || "user",
  });
  const [addressDetails, setAddressDetails] = useState({
    street: currentUser?.addressDetails?.street || "",
    number: currentUser?.addressDetails?.number || "",
    apartment: currentUser?.addressDetails?.apartment || "",
    city: currentUser?.addressDetails?.city || "Sebeș",
  });
  const [mapCenter, setMapCenter] = useState({ lat: 45.9460, lng: 23.9930 });
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapRef = useRef(null);
  const forwardGeocodeTimeoutRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);
  const isInitialMapLoadRef = useRef(true);
  const skipNextIdleRef = useRef(false);
  const lastUpdateTimeRef = useRef(0);
  const userDraggingRef = useRef(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Load full user data from Backend on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!currentUser?.id) {
          return;
        }
        
        // Verify token exists before making API call
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          return;
        }
        
        // Skip if we just updated the data (within last 3 seconds)
        const timeSinceUpdate = Date.now() - (currentUser._lastUpdated || 0);
        if (timeSinceUpdate < 3000) {
          return;
        }

        const data = await apiGet(`/api/users/${currentUser.id}`);
        if (data.fields) {
          // Parse Firestore REST response
          const userData = {
            name: data.fields.name?.stringValue || "",
            email: data.fields.email?.stringValue || "",
            phone: data.fields.phone?.stringValue || "",
            address: data.fields.address?.stringValue || "",
            role: data.fields.role?.stringValue || "user",
          };
          setFormData(userData);

          // Load address details if available
          if (data.fields.addressDetails?.mapValue?.fields) {
            const addressDetailsFields = data.fields.addressDetails.mapValue.fields;
            setAddressDetails({
              street: addressDetailsFields.street?.stringValue || "",
              number: addressDetailsFields.number?.stringValue || "",
              apartment: addressDetailsFields.apartment?.stringValue || "",
              city: addressDetailsFields.city?.stringValue || "Sebeș",
            });
          }
        }
      } catch (error) {
        // Silently ignore errors - user may not exist on backend yet
        // Don't logout here - let user continue with localStorage data
      }
    };
    loadUserData();
  }, [currentUser?.id]);

  // Forward geocode when map modal opens to center on saved address
  useEffect(() => {
    if (showMapPicker && addressDetails.street && addressDetails.number) {
      forwardGeocode(addressDetails.street, addressDetails.number);
    }
  }, [showMapPicker]);

  // Get user data from localStorage
  const getUserData = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    return users.find((u) => u.id === currentUser?.id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const result = results[0];
          const addressComponents = result.address_components;

          let street = "";
          let number = "";
          let city = "Sebeș";

          addressComponents.forEach((component) => {
            if (component.types.includes("route")) {
              street = component.long_name;
            }
            if (component.types.includes("street_number")) {
              number = component.long_name;
            }
            if (component.types.includes("locality")) {
              city = component.long_name;
            }
          });

          // Always set city to Sebeș if picking from map
          city = "Sebeș";

          setAddressDetails((prev) => ({
            ...prev,
            street: street || prev.street,
            number: number || prev.number,
            city: city,
          }));
        }
      });
    } catch (error) {
      // Ignore geocoding errors
    }
  };

  const getStreetSuggestions = (input) => {
    clearTimeout(suggestionsTimeoutRef.current);
    if (!input.trim()) {
      setStreetSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionsTimeoutRef.current = setTimeout(() => {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const address = `${input}, Sebeș, Sibiu, Romania`;

        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            const suggestions = results
              .map((result) => {
                const components = result.address_components;
                const route = components.find((c) =>
                  c.types.includes("route")
                );
                return route ? route.long_name : null;
              })
              .filter((street) => street !== null);

            const uniqueSuggestions = [...new Set(suggestions)].slice(0, 5);
            setStreetSuggestions(uniqueSuggestions);
            setShowSuggestions(uniqueSuggestions.length > 0);
          }
        });
      } catch (error) {
        // Ignore suggestion errors
      }
    }, 300);
  };

  const forwardGeocode = (street, number) => {
    clearTimeout(forwardGeocodeTimeoutRef.current);
    if (!street || !number) return;

    forwardGeocodeTimeoutRef.current = setTimeout(() => {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const address = `${street} ${number}, Sebeș, Sibiu, Romania`;

        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();

            skipNextIdleRef.current = true;
            if (mapRef.current) {
              mapRef.current.panTo({ lat, lng });
              setTimeout(() => {
                setMapCenter({ lat, lng });
              }, 300);
            }
          }
        });
      } catch (error) {
        // Ignore geocoding errors
      }
    }, 600);
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          alert("Nu am putut accesa locația dvs.");
        }
      );
    } else {
      alert("Geolocation nu este disponibil în browserul dvs.");
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.email) {
      alert(t("nameEmailRequired"));
      return;
    }

    // Build address from structured address details
    const finalAddress = `${addressDetails.street} ${addressDetails.number}${
      addressDetails.apartment ? ", apt. " + addressDetails.apartment : ""
    }, ${addressDetails.city}`;

    try {
      // Update via Backend
      const response = await apiPut(`/api/users/${currentUser?.id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: finalAddress.trim(),
      });

      if (response) {
        // Mark that we just updated the data
        lastUpdateTimeRef.current = Date.now();

        // Update current user in localStorage and state
        const updatedUser = {
          ...currentUser,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: finalAddress.trim(),
          role: formData.role,
          addressDetails: addressDetails,
          _lastUpdated: Date.now(),
        };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setIsEditing(false);
        alert(t("profileUpdated"));
      } else {
        throw new Error("Backend failed to update profile");
      }
    } catch (error) {
      alert(t("profileUpdateError"));
    }
  };

  const userData = getUserData();

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
            ? "dark bg-gradient-to-b from-[#0b0b0b] to-[#111827] text-slate-100"
            : "bg-gradient-to-b from-white to-slate-50 text-slate-900"
        }`}>
        
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full filter blur-2xl animate-float pointer-events-none hidden md:block"
          style={{background: dark ? "radial-gradient(circle, #FF6B35, transparent)" : "radial-gradient(circle, #E85A1F, transparent)", mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.2 : 0.12}}></div>
        <div className="absolute bottom-32 left-10 w-96 h-96 rounded-full filter blur-2xl animate-float pointer-events-none hidden md:block" 
          style={{background: dark ? "radial-gradient(circle, #FF2D55, transparent)" : "radial-gradient(circle, #D91C46, transparent)", mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.2 : 0.12, animationDelay: "1s"}}></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full filter blur-2xl animate-float pointer-events-none hidden md:block"
          style={{background: dark ? "radial-gradient(circle, #4A90E2, transparent)" : "radial-gradient(circle, #2563EB, transparent)", mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.15 : 0.1, animationDelay: "2s"}}></div>

        {/* Content */}
        <div className="relative z-10">
        {/* Header */}
        <div className={`max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b ${dark ? "border-neutral-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition ${
                dark ? "bg-neutral-900 hover:bg-neutral-800" : "bg-slate-200 hover:bg-slate-300"
              }`}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold">👤 {t("userProfile")}</h1>
              <p className={`text-sm ${dark ? "text-neutral-400" : "text-slate-600"}`}>
                {t("accountSettings")}
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-fastfood-red/50 transition">
            <Edit2 size={18} /> {t("editProfile")}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isEditing ? (
          // Edit Mode
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg border p-6 ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white border-slate-200"}`}>
            <h2 className="text-2xl font-bold mb-6">{t("editProfile")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">{t("firstName")} {t("lastName")}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition ${
                    dark
                      ? "bg-neutral-800 border-neutral-700 focus:border-fastfood-orange"
                      : "bg-white border-slate-300 focus:border-fastfood-orange"
                  } focus:outline-none`}
                  placeholder="Ion Popescu"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">{t("email")}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition ${
                    dark
                      ? "bg-neutral-800 border-neutral-700 focus:border-fastfood-orange"
                      : "bg-white border-slate-300 focus:border-fastfood-orange"
                  } focus:outline-none`}
                  placeholder="ion@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-2">{t("phoneLabel")}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition ${
                    dark
                      ? "bg-neutral-800 border-neutral-700 focus:border-fastfood-orange"
                      : "bg-white border-slate-300 focus:border-fastfood-orange"
                  } focus:outline-none`}
                  placeholder="+40 700 000 000"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">{t("defaultDeliveryAddress")}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${addressDetails.street} ${addressDetails.number}${
                      addressDetails.apartment ? ", apt. " + addressDetails.apartment : ""
                    }, ${addressDetails.city}`}
                    readOnly
                    className={`flex-1 px-4 py-3 rounded-lg border transition opacity-75 ${
                      dark
                        ? "bg-neutral-800 border-neutral-700"
                        : "bg-white border-slate-300"
                    }`}
                    placeholder="Strada Principală 123, Apartament 5"
                  />
                  <button
                    onClick={() => setShowMapPicker(true)}
                    className="px-4 py-3 bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2">
                    <MapPin size={18} />
                    {t("selectLocation") || "Hartă"}
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={async () => {
                  // Reload data from Firebase before canceling
                  try {
                    if (currentUser?.email) {
                      const fullUserData = await getUserByEmail(currentUser.email);
                      if (fullUserData) {
                        setFormData({
                          name: fullUserData.name || "",
                          email: fullUserData.email || "",
                          phone: fullUserData.phone || "",
                          address: fullUserData.address || "",
                        });
                      }
                    }
                  } catch (error) {

                  }
                  setIsEditing(false);
                }}
                className={`px-6 py-3 rounded-lg transition ${
                  dark ? "bg-neutral-800 hover:bg-neutral-700" : "bg-slate-300 hover:bg-slate-400"
                }`}>
                <X size={18} className="inline mr-2" />
                {t("cancel")}
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-3 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded-lg font-semibold transition flex items-center gap-2">
                <Save size={18} />
                {t("saveChanges")}
              </button>
            </div>
          </motion.div>
        ) : (
          // View Mode
          <div className="space-y-6">
            {/* User Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg border p-6 ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white border-slate-200"}`}>
              <h2 className="text-2xl font-bold mb-6">{t("personalInfo")}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-fastfood-orange mb-2">{t("fullName")}</p>
                  <p className="text-lg">{formData.name || t("notFilled")}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-fastfood-orange mb-2">{t("email")}</p>
                  <p className="text-lg break-all">{formData.email || t("notFilled")}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-fastfood-orange mb-2">{t("phoneLabel")}</p>
                  <p className="text-lg">{formData.phone || t("notFilled")}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-fastfood-orange mb-2">{t("role")}</p>
                  <p className="text-lg">
                    {formData.role === "admin" ? t("admin") : t("user")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Delivery Address Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-lg border p-6 ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white border-slate-200"}`}>
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={24} className="text-fastfood-orange" />
                <h2 className="text-2xl font-bold">{t("deliveryAddressDefault")}</h2>
              </div>

              <p className="text-lg mb-4">{formData.address || t("notFilled")}</p>

              <p className={`text-sm ${dark ? "text-neutral-400" : "text-slate-600"}`}>
                {t("deliveryAddressNote")}
              </p>
            </motion.div>

            {/* Delivery Options Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-lg border p-6 ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white border-slate-200"}`}>
              <h2 className="text-2xl font-bold mb-6">{t("deliveryOptions")}</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Home Delivery */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 ${
                    dark ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-200"
                  }`}>
                  <Home size={32} className="text-green-400 mb-3" />
                  <h3 className="font-bold mb-2">{t("homeDeliveryTitle")}</h3>
                  <p className={`text-sm ${dark ? "text-neutral-400" : "text-slate-600"}`}>
                    {t("homeDeliveryDesc")}
                  </p>
                </motion.div>

                {/* Alternative Address */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 ${
                    dark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"
                  }`}>
                  <MapPin size={32} className="text-blue-400 mb-3" />
                  <h3 className="font-bold mb-2">{t("otherAddressTitle")}</h3>
                  <p className={`text-sm ${dark ? "text-neutral-400" : "text-slate-600"}`}>
                    {t("otherAddressDesc")}
                  </p>
                </motion.div>

                {/* Pickup */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 ${
                    dark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"
                  }`}>
                  <Truck size={32} className="text-fastfood-orange mb-3" />
                  <h3 className="font-bold mb-2">{t("pickupTitle")}</h3>
                  <p className={`text-sm ${dark ? "text-neutral-400" : "text-slate-600"}`}>
                    {t("pickupDesc")}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
        </div>
        </div>
      </motion.div>

      {/* Map Picker Modal */}
      <AnimatePresence>
        {showMapPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMapPicker(false)}
              className="fixed inset-0 bg-black/60 z-[99999] backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
              <div className={`w-full max-w-2xl h-[80vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col ${
                dark ? "bg-gray-900 border border-fastfood-orange/30" : "bg-white border border-gray-200"
              }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${
                  dark ? "border-gray-700" : "border-gray-200"
                }`}>
                  <div className="flex items-center gap-2">
                    <MapPin size={24} className="text-fastfood-blue" />
                    <h2 className="text-xl font-bold">Selectează locația</h2>
                  </div>
                  <button
                    onClick={() => setShowMapPicker(false)}
                    className={`p-2 rounded-lg transition ${
                      dark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    }`}>
                    <X size={20} />
                  </button>
                </div>

                {/* Geolocation Button */}
                <div className={`p-3 border-b ${dark ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50"}`}>
                  <button
                    onClick={handleGeolocation}
                    className="w-full px-3 py-2 rounded-lg bg-fastfood-blue text-white hover:bg-fastfood-blue/80 transition font-medium flex items-center justify-center gap-2"
                    title="Locația mea">
                    <Navigation size={18} />
                    Locația mea
                  </button>
                </div>

                {/* Interactive Map */}
                {isLoaded ? (
                  <div className="relative w-full h-full flex-1">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                      onLoad={(map) => {
                        mapRef.current = map;
                        isInitialMapLoadRef.current = true;
                        // Set initial position only once on load
                        map.setCenter(mapCenter);
                        map.setZoom(16);
                        
                        // Add drag listener to track user interaction
                        mapRef.current.addListener('dragstart', () => {
                          userDraggingRef.current = true;
                        });
                        mapRef.current.addListener('dragend', () => {
                          userDraggingRef.current = false;
                        });
                      }}
                      onIdle={() => {
                        // Skip first idle event (initial load)
                        if (isInitialMapLoadRef.current) {
                          isInitialMapLoadRef.current = false;
                          return;
                        }
                        
                        // Skip if we just did a forward geocode (to prevent ping-pong)
                        if (skipNextIdleRef.current) {
                          skipNextIdleRef.current = false;
                          return;
                        }
                        
                        // Skip if user was just dragging
                        if (userDraggingRef.current) {
                          userDraggingRef.current = false;
                          return;
                        }
                        
                        // Only reverse geocode on user pan/zoom
                        if (mapRef.current) {
                          const center = mapRef.current.getCenter();
                          if (center) {
                            const lat = center.lat();
                            const lng = center.lng();
                            reverseGeocode(lat, lng);
                          }
                        }
                      }}
                    ></GoogleMap>

                    {/* Fixed center marker - stays in middle of screen */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="flex flex-col items-center -mt-8">
                        {/* Main marker */}
                        <div className="relative">
                          {/* Outer ring */}
                          <div className="w-10 h-10 rounded-full border-2 border-fastfood-red bg-white flex items-center justify-center shadow-md">
                            {/* Inner dot */}
                            <div className="w-4 h-4 rounded-full bg-fastfood-red"></div>
                          </div>
                        </div>
                        
                        {/* Pin needle */}
                        <div className="w-1 h-5 bg-fastfood-red rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-100">
                    <p>Se încarcă harta...</p>
                  </div>
                )}

                {/* Address Fields */}
                <div className={`p-4 border-t ${dark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
                  <div className="grid grid-cols-2 gap-2 text-sm relative">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Stradă"
                        value={addressDetails.street}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAddressDetails({...addressDetails, street: val});
                          // Show suggestions immediately while typing
                          if (val.length > 0) {
                            setShowSuggestions(true);
                            getStreetSuggestions(val);
                          } else {
                            setShowSuggestions(false);
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding suggestions to allow click to register
                          setTimeout(() => setShowSuggestions(false), 300);
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          dark 
                            ? "bg-gray-700 border-gray-600 text-white" 
                            : "bg-white border-gray-300"
                        }`}
                      />
                      {/* Suggestions dropdown */}
                      {showSuggestions && streetSuggestions && streetSuggestions.length > 0 && (
                        <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 ${
                          dark ? "bg-gray-700" : "bg-white border border-gray-300"
                        }`}>
                          {streetSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setAddressDetails({...addressDetails, street: suggestion});
                                forwardGeocode(suggestion, addressDetails.number);
                                setShowSuggestions(false);
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-fastfood-orange/20 transition-colors ${
                                idx === 0 ? "rounded-t-lg" : ""
                              } ${idx === streetSuggestions.length - 1 ? "rounded-b-lg" : ""} ${
                                dark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Nr."
                      value={addressDetails.number}
                      onChange={(e) => {
                        const newNumber = e.target.value;
                        setAddressDetails({...addressDetails, number: newNumber});
                        if (addressDetails.street && newNumber) {
                          forwardGeocode(addressDetails.street, newNumber);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border ${
                        dark 
                          ? "bg-gray-700 border-gray-600 text-white" 
                          : "bg-white border-gray-300"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Apt."
                      value={addressDetails.apartment}
                      onChange={(e) => setAddressDetails({...addressDetails, apartment: e.target.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        dark 
                          ? "bg-gray-700 border-gray-600 text-white" 
                          : "bg-white border-gray-300"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Oraș"
                      value={addressDetails.city}
                      onChange={(e) => setAddressDetails({...addressDetails, city: e.target.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        dark 
                          ? "bg-gray-700 border-gray-600 text-white" 
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className={`flex gap-3 p-4 border-t ${dark ? "border-gray-700" : "border-gray-200"}`}>
                  <button
                    onClick={() => setShowMapPicker(false)}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                      dark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                    }`}>
                    {t("cancel")}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMapPicker(false)}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-fastfood-green to-fastfood-green/70 text-white font-bold hover:shadow-lg transition ring-4 ring-gray-900 ring-offset-2">
                    {t("confirm")}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}




