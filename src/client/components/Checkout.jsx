import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { debug } from "../../shared/utils/debug";
import { useLanguage } from "../hooks/useLanguage";
import { Home, MapPin, Truck, X, CreditCard, Banknote, Map, Navigation, Search } from "lucide-react";
import { useGoogleMaps } from "../hooks/useGoogleMaps";
import GoogleMapDiv from "./GoogleMapDiv";
import { apiGet } from "../api/apiClient";

export default function Checkout({
  dark,
  showCheckout,
  setShowCheckout,
  cart,
  placeOrder,
  onCheckoutData,
  currentUser,
  onCheckoutOpen,
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [deliveryOption, setDeliveryOption] = useState("home");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 45.9572, lng: 23.5684 });
  const [searchInput, setSearchInput] = useState("");
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const [addressDetails, setAddressDetails] = useState({
    street: "",
    number: "",
    apartment: "",
    city: "Sebeș",
  });
  const [otherAddressDetails, setOtherAddressDetails] = useState({
    street: "",
    number: "",
    apartment: "",
    city: "Sebeș",
  });
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const forwardGeocodeTimeoutRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);
  const isInitialMapLoadRef = useRef(true);
  const skipNextIdleRef = useRef(false);
  const userDraggingRef = useRef(false);

  // Parse address string to extract street, number, apartment, city
  const parseAddress = (addressString) => {
    if (!addressString) {
      return { street: "", number: "", apartment: "", city: "Sebeș" };
    }

    let street = "";
    let number = "";
    let apartment = "";
    let city = "Sebeș";

    // Try to parse: "Strada Principală 123, apt. 5, Sebeș"
    const parts = addressString.split(",").map(p => p.trim());
    
    if (parts.length > 0) {
      // First part contains street and number
      const firstPart = parts[0];
      const match = firstPart.match(/^(.+?)\s+(\d[\w-]*)$/);
      if (match) {
        street = match[1].trim();
        number = match[2].trim();
      } else {
        street = firstPart;
      }
    }

    if (parts.length > 1) {
      // Check for apartment
      const apartmentPart = parts.find(p => p.toLowerCase().startsWith("apt.") || p.toLowerCase().startsWith("ap."));
      if (apartmentPart) {
        apartment = apartmentPart.replace(/^apt\.\s*/i, "").replace(/^ap\.\s*/i, "").trim();
      }
      
      // Last part is typically the city
      const lastPart = parts[parts.length - 1];
      if (!lastPart.toLowerCase().startsWith("apt.") && !lastPart.toLowerCase().startsWith("ap.")) {
        city = lastPart;
      }
    }

    return { street, number, apartment, city };
  };

  useEffect(() => {
    if (currentUser && showCheckout) {
      // Clear address details when checkout opens to avoid stale data
      setAddressDetails({
        street: "",
        number: "",
        apartment: "",
        city: "Sebeș",
      });
      setOtherAddressDetails({
        street: "",
        number: "",
        apartment: "",
        city: "Sebeș",
      });

      const loadUserData = async () => {
        try {
          const data = await apiGet(`/api/users/${currentUser.id}`);

          let loadedAddress = "";
          if (data.fields) {
            loadedAddress = data.fields.address?.stringValue || currentUser.address || "";
            setFormData({
              name: data.fields.name?.stringValue || currentUser.name || "",
              email: data.fields.email?.stringValue || currentUser.email || "",
              phone: data.fields.phone?.stringValue || currentUser.phone || "",
              address: loadedAddress,
            });

            // Load address details if available (Firestore format)
            if (data.fields.addressDetails?.mapValue?.fields) {
              const addressDetailsFields = data.fields.addressDetails.mapValue.fields;
              const loadedAddressDetails = {
                street: addressDetailsFields.street?.stringValue || "",
                number: addressDetailsFields.number?.stringValue || "",
                apartment: addressDetailsFields.apartment?.stringValue || "",
                city: addressDetailsFields.city?.stringValue || "Sebeș",
              };
              setAddressDetails(loadedAddressDetails);
            } else if (loadedAddress) {
              const parsed = parseAddress(loadedAddress);
              setAddressDetails(parsed);
            }
          } else {
            loadedAddress = currentUser.address || "";
            setFormData({
              name: currentUser.name || "",
              email: currentUser.email || "",
              phone: currentUser.phone || "",
              address: loadedAddress,
            });

            if (currentUser.addressDetails) {
              setAddressDetails(currentUser.addressDetails);
            } else if (loadedAddress) {
              const parsed = parseAddress(loadedAddress);
              setAddressDetails(parsed);
            }
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
          const address = currentUser.address || "";
          setFormData({
            name: currentUser.name || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            address: address,
          });

          if (currentUser.addressDetails) {
            setAddressDetails(currentUser.addressDetails);
          } else if (address) {
            const parsed = parseAddress(address);
            setAddressDetails(parsed);
          }
        }
      };
      loadUserData();
    }
  }, [showCheckout, currentUser]);

  const { isLoaded } = useGoogleMaps(import.meta.env.VITE_GOOGLE_MAPS_API_KEY, ["places"]);

  // Handle body scroll when Checkout opens/closes
  useEffect(() => {
    if (showCheckout) {
      document.body.style.overflow = 'hidden';
      // Close cart modal when checkout opens
      if (onCheckoutOpen) {
        onCheckoutOpen();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCheckout, onCheckoutOpen]);

  // Reset map to Sebeș when map picker opens
  useEffect(() => {
    if (showMapPicker) {
      // Center on Sebeș center (average of all street coordinates)
      setMapCenter({ lat: 45.9572, lng: 23.5684 });
      
      // Set address fields - use current state first, then fallback to saved user data
      let currentAddressDetails = addressDetails;
      
      if (deliveryOption === "home") {
        const hasExistingData = addressDetails.street && addressDetails.number;
        
        if (!hasExistingData && currentUser?.addressDetails) {
          // Load from user profile if home address is empty
          currentAddressDetails = {
            street: currentUser.addressDetails.street || "",
            number: currentUser.addressDetails.number || "",
            apartment: currentUser.addressDetails.apartment || "",
            city: currentUser.addressDetails.city || "Sebeș",
          };
          setAddressDetails(currentAddressDetails);
        } else if (!hasExistingData) {
          // Use defaults if no saved data
          currentAddressDetails = {
            street: "Strada Aviator Olteanu",
            number: "8",
            apartment: "",
            city: "Sebeș",
          };
          setAddressDetails(currentAddressDetails);
        }
      } else if (deliveryOption === "other") {
        const hasExistingData = otherAddressDetails.street && otherAddressDetails.number;
        
        if (!hasExistingData && currentUser?.addressDetails) {
          // Load from user profile if other address is empty
          currentAddressDetails = {
            street: currentUser.addressDetails.street || "",
            number: currentUser.addressDetails.number || "",
            apartment: currentUser.addressDetails.apartment || "",
            city: currentUser.addressDetails.city || "Sebeș",
          };
          setOtherAddressDetails(currentAddressDetails);
        } else if (!hasExistingData) {
          // Use defaults if no saved data
          currentAddressDetails = {
            street: "Strada Aviator Olteanu",
            number: "8",
            apartment: "",
            city: "Sebeș",
          };
          setOtherAddressDetails(currentAddressDetails);
        } else {
          currentAddressDetails = otherAddressDetails;
        }
      }
      
      // Forward geocode to center map on the address
      if (currentAddressDetails && currentAddressDetails.street && currentAddressDetails.number) {
        forwardGeocode(currentAddressDetails.street, currentAddressDetails.number, currentAddressDetails.city);
      }
    }
  }, [showMapPicker, deliveryOption, currentUser]);

  const reverseGeocode = async (lat, lng) => {
    try {
      if (!isLoaded || !window.google) {
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0];
          const addressComponents = address.address_components;
          
          let street = '';
          let number = '';
          let city = 'Sebeș';
          
          addressComponents.forEach(component => {
            if (component.types.includes('route')) {
              street = component.long_name;
            }
            if (component.types.includes('street_number')) {
              number = component.long_name;
            }
          });
          
          // Always force city to Sebeș (ignore what Google returns)
          city = 'Sebeș';
          
          const currentAddressState = deliveryOption === "home" ? addressDetails : otherAddressDetails;
          const setAddressState = deliveryOption === "home" ? setAddressDetails : setOtherAddressDetails;
          
          const newAddress = {
            ...currentAddressState,
            street: street || '',
            number: number || '',
            city: city,
          };
          
          setAddressState(newAddress);
        }
      });
    } catch (error) {
      // Ignore reverse geocoding errors
    }
  };

  const getStreetSuggestions = (input, city = 'Sebeș') => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (!input || input.length < 1) {
      setStreetSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionsTimeoutRef.current = setTimeout(() => {
      try {
        if (!isLoaded || !window.google) return;

        const geocoder = new window.google.maps.Geocoder();
        const address = `${input}, Sebeș, Sibiu, Romania`;
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            // Extract unique street names from results
            const streets = [];
            const seen = new Set();
            
            results.forEach(result => {
              // Get the street name
              const route = result.address_components.find(c => c.types.includes('route'));
              if (route) {
                const streetName = route.long_name;
                if (!seen.has(streetName)) {
                  streets.push(streetName);
                  seen.add(streetName);
                }
              }
            });
            
            const suggestions = streets.slice(0, 5);
            setStreetSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
          } else {
            setStreetSuggestions([]);
            setShowSuggestions(false);
          }
        });
      } catch (error) {
        setStreetSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  const forwardGeocode = (street, number, city) => {
    // Clear previous timeout
    if (forwardGeocodeTimeoutRef.current) {
      clearTimeout(forwardGeocodeTimeoutRef.current);
    }

    // Only geocode if both street and number are present
    if (!street || !number) {
      return;
    }

    // Set new timeout to debounce geocoding (wait 1200ms after user stops typing)
    forwardGeocodeTimeoutRef.current = setTimeout(() => {
      try {
        if (!isLoaded || !window.google || !mapRef) {
          return;
        }

        const geocoder = new window.google.maps.Geocoder();
        const address = `${street} ${number}, Sebeș, Sibiu, Romania`;
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            
            // Pan to location with smooth animation
            skipNextIdleRef.current = true;
            if (mapRef.current) {
              mapRef.current.panTo({ lat, lng });
              // Also animate zoom for smooth transition
              setTimeout(() => {
                setMapCenter({ lat, lng });
              }, 300);
            }
          }
        });
      } catch (error) {
        // Ignore forward geocoding errors
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
          alert('Nu am putut accesa locația dvs.');
        }
      );
    } else {
      alert('Geolocation nu este disponibil în browserul dvs.');
    }
  };

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchInput.trim()) return;
    
    try {
      const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        query: searchInput,
        fields: ['geometry', 'formatted_address', 'address_components']
      };
      
      placesService.findPlaceFromQuery(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          setMapCenter({ lat, lng });
          reverseGeocode(lat, lng);
          setSearchInput('');
        } else {
          alert('Locație nu găsită');
        }
      });
    } catch (error) {
      alert('Eroare la căutarea locației');
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = deliveryOption === "pickup" ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + delivery + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    let finalAddress = "";
    let selectedAddressDetails = null;
    
    if (deliveryOption === "home") {
      // Build address from structured fields
      const { street, number, apartment, city } = addressDetails;
      if (!street || !number || !city) {
        alert(t("completeAddress"));
        return;
      }
      finalAddress = `${street} ${number}${apartment ? ", apt. " + apartment : ""}, ${city}`;
      selectedAddressDetails = { ...addressDetails }; // Deep copy to ensure clean data
    } else if (deliveryOption === "other") {
      // Build address from structured fields
      const { street, number, apartment, city } = otherAddressDetails;
      if (!street || !number || !city) {
        alert(t("completeAlternativeAddress"));
        return;
      }
      finalAddress = `${street} ${number}${apartment ? ", apt. " + apartment : ""}, ${city}`;
      selectedAddressDetails = { ...otherAddressDetails }; // Deep copy to ensure clean data
    } else if (deliveryOption === "pickup") {
      // For pickup, we don't have an address
      finalAddress = t("pickupLocation") || "Pickup";
      selectedAddressDetails = null;
    }

    if (!formData.name || !formData.name.trim()) {
      alert(t("completeName"));
      return;
    }
    if (!formData.email || !formData.email.trim()) {
      alert(t("completeEmail"));
      return;
    }
    if (!formData.phone || !formData.phone.trim()) {
      alert(t("completePhone"));
      return;
    }
    if (!finalAddress || !finalAddress.trim()) {
      alert(t("completeAddress"));
      return;
    }

    const checkoutPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: finalAddress.trim(),
      addressDetails: selectedAddressDetails, // Only set if home or other delivery
      deliveryOption: deliveryOption,
      paymentMethod: paymentMethod,
    };

    if (isPlacingOrder) return;
    setIsPlacingOrder(true);
    try {
      await placeOrder(checkoutPayload);
      setFormData({ name: "", email: "", phone: "", address: "" });
      setDeliveryOption("home");
      setPaymentMethod("card");
    } catch (error) {
      // Keep form data if error occurs
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <AnimatePresence>
      {showCheckout && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCheckout(false)}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm z-[9980]"
          />

          {/* Modal - Centered on viewport */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none`}>
            <div className={`w-full max-w-md max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto relative ${
              dark ? "bg-gray-900 border border-fastfood-orange/30" : "bg-white border border-gray-200"
            }`}>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCheckout(false)}
                className={`absolute top-4 right-4 p-2 rounded-full z-50 transition ${
                  dark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"
                }`}>
                <X size={20} />
              </motion.button>

              <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0 p-6 border-b" style={{borderColor: dark ? 'rgba(255, 107, 53, 0.2)' : 'rgba(0, 0, 0, 0.1)'}}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-fastfood-orange to-fastfood-yellow">
                      <span className="text-xl">💳</span>
                    </div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-fastfood-red to-fastfood-orange bg-clip-text text-transparent">
                      {t("payment")}
                    </h2>
                  </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 p-6 flex flex-col overflow-y-auto space-y-6">

            {/* 1. Order Summary */}
            <div className={`p-4 rounded-xl mb-6 border ${dark ? "bg-gray-800/50 border-fastfood-orange/20" : "bg-gray-50 border-gray-200"}`}>
              <div className="font-semibold mb-3">{t("orderSummary")}</div>
              <div className="space-y-2 mb-4">
                {cart.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm">
                      <div>{c.title} x{c.qty}</div>
                      <div className="text-fastfood-yellow font-semibold">
                        {(c.price * c.qty).toFixed(2)} RON
                      </div>
                    </div>
                    {c.customizations && Object.keys(c.customizations).length > 0 && (
                      <div className="ml-4 mt-1 text-xs space-y-0.5">
                        {Object.entries(c.customizations).map(([key, value]) => {
                          if (!value) return null;
                          const isRemove = key.startsWith("remove-");
                          const label = key.replace(/^(remove|add)-/, "");
                          return (
                            <div key={key} className={dark ? "text-neutral-400" : "text-gray-600"}>
                              {isRemove ? "-" : "+"} {label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className={`border-t ${dark ? "border-gray-700" : "border-gray-300"} pt-3`}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className={dark ? "text-neutral-400" : "text-gray-600"}>{t("subtotal")}</div>
                  <div className="font-semibold">{subtotal.toFixed(2)} RON</div>
                </div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className={dark ? "text-neutral-400" : "text-gray-600"}>{t("shipping")}</div>
                  <div className="font-semibold">
                    {delivery === 0 ? t("freeShipping") : `${delivery.toFixed(2)} RON`}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className={dark ? "text-neutral-400" : "text-gray-600"}>{t("tax")}</div>
                  <div className="font-semibold">{tax.toFixed(2)} RON</div>
                </div>
                <div className="flex items-center justify-between font-black text-lg">
                  <div>{t("total")}</div>
                  <div className="bg-gradient-to-r from-fastfood-red to-fastfood-orange bg-clip-text text-transparent">
                    {total.toFixed(2)} RON
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Contact Data */}
            <div className={`p-4 rounded-xl mb-6 border space-y-3 ${dark ? "bg-gray-800/50 border-fastfood-orange/20" : "bg-gray-50 border-gray-200"}`}>
              <div>
                <label className="text-sm font-semibold mb-1 block">{t("fullName")}</label>
                <input type="text" name="name" placeholder={t("fullNamePlaceholder")} value={formData.name} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg border ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">{t("email")}</label>
                <input type="email" name="email" placeholder="email@example.com" value={formData.email} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg border ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">{t("phone")}</label>
                <input type="tel" name="phone" placeholder={t("phonePlaceholder")} value={formData.phone} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg border ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`} />
              </div>
            </div>

            {/* 3. Address */}
            {deliveryOption === "home" && (
              <div className={`p-4 rounded-xl mb-6 border ${dark ? "bg-gray-800/50 border-fastfood-orange/20" : "bg-gray-50 border-gray-200"}`}>
                <label className="font-semibold mb-2 block">{t("deliveryAddress")}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Strada Principală 123, Sebeș"
                    value={`${addressDetails.street} ${addressDetails.number}${addressDetails.apartment ? ", apt. " + addressDetails.apartment : ""}, ${addressDetails.city}`}
                    readOnly
                    className={`flex-1 px-3 py-2 rounded-lg border opacity-75 ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  />
                  <button
                    onClick={() => setShowMapPicker(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-fastfood-blue to-fastfood-blue/70 text-white font-semibold hover:shadow-lg hover:shadow-fastfood-blue/50 transition">
                    <Map size={18} />
                  </button>
                </div>
              </div>
            )}

            {deliveryOption === "other" && (
              <div className={`p-4 rounded-xl mb-6 border ${dark ? "bg-gray-800/50 border-fastfood-blue/30" : "bg-blue-50 border-blue-200"}`}>
                <label className="font-semibold mb-2 block">{t("alternativeAddress")}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Strada Principală 123, Sebeș"
                    value={`${otherAddressDetails.street} ${otherAddressDetails.number}${otherAddressDetails.apartment ? ", apt. " + otherAddressDetails.apartment : ""}, ${otherAddressDetails.city}`}
                    readOnly
                    className={`flex-1 px-3 py-2 rounded-lg border opacity-75 ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  />
                  <button
                    onClick={() => setShowMapPicker(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-fastfood-blue to-fastfood-blue/70 text-white font-semibold hover:shadow-lg hover:shadow-fastfood-blue/50 transition">
                    <Map size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* 4. Delivery Option */}
            <div className={`p-4 rounded-xl mb-6 border ${dark ? "bg-gray-800/50 border-fastfood-orange/20" : "bg-gray-50 border-gray-200"}`}>
              <div className="font-semibold mb-3">{t("deliveryOption")}</div>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer gap-3">
                  <input type="radio" name="delivery" value="home" checked={deliveryOption === "home"} onChange={(e) => setDeliveryOption(e.target.value)} className="w-4 h-4 accent-fastfood-purple" />
                  <Home size={18} className="text-fastfood-purple" />
                  <div className="flex-1">
                    <div className="font-medium">{t("homeDelivery")}</div>
                    <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>{t("homeDeliveryDesc")}</div>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer gap-3">
                  <input type="radio" name="delivery" value="other" checked={deliveryOption === "other"} onChange={(e) => setDeliveryOption(e.target.value)} className="w-4 h-4 accent-fastfood-blue" />
                  <MapPin size={18} className="text-fastfood-blue" />
                  <div className="flex-1">
                    <div className="font-medium">{t("otherAddress")}</div>
                    <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>{t("otherAddressDesc")}</div>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer gap-3">
                  <input type="radio" name="delivery" value="pickup" checked={deliveryOption === "pickup"} onChange={(e) => setDeliveryOption(e.target.value)} className="w-4 h-4 accent-fastfood-orange" />
                  <Truck size={18} className="text-fastfood-orange" />
                  <div className="flex-1">
                    <div className="font-medium">{t("pickupOption")}</div>
                    <div className={`text-xs font-semibold ${dark ? "text-fastfood-yellow" : "text-fastfood-orange"}`}>{t("pickupFree")}</div>
                  </div>
                </label>
              </div>
            </div>

            {deliveryOption === "pickup" && (
              <div className={`p-4 rounded-xl mb-6 border-2 ${dark ? "bg-fastfood-orange/10 border-fastfood-orange/50" : "bg-fastfood-orange/5 border-fastfood-orange/30"}`}>
                <div className="font-semibold text-fastfood-orange mb-2">{t("pickupConfirm")}</div>
                <div className={`text-sm ${dark ? "text-neutral-300" : "text-gray-700"}`}>{t("pickupMessage")}</div>
              </div>
            )}

            {/* 5. Payment Method */}
            <div className={`p-4 rounded-xl mb-6 border ${dark ? "bg-gray-800/50 border-fastfood-orange/20" : "bg-gray-50 border-gray-200"}`}>
              <div className="font-semibold mb-3">{t("paymentMethod")}</div>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer gap-3">
                  <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-fastfood-red" />
                  <CreditCard size={18} className="text-fastfood-red" />
                  <div className="flex-1">
                    <div className="font-medium">{t("cardPayment")}</div>
                    <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>{t("cardPaymentDesc")}</div>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer gap-3">
                  <input type="radio" name="payment" value="cash" checked={paymentMethod === "cash"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-fastfood-green" />
                  <Banknote size={18} className="text-fastfood-green" />
                  <div className="flex-1">
                    <div className="font-medium">{t("cashPayment")}</div>
                    <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>{t("cashPaymentDesc")}</div>
                  </div>
                </label>
              </div>
            </div>
                </div>

                {/* Footer Section - Fixed at Bottom */}
                <div className="flex-shrink-0 p-6 pt-4 border-t" style={{borderColor: dark ? 'rgba(255, 107, 53, 0.2)' : 'rgba(0, 0, 0, 0.1)'}}>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCheckout(false)}
                      className={`flex-1 px-4 py-3 rounded-xl border font-semibold transition-all duration-200 ${dark ? "border-gray-600 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100"}`}>
                      {t("back")}
                    </motion.button>
                    <motion.button
                      whileHover={isPlacingOrder ? {} : { scale: 1.05 }}
                      whileTap={isPlacingOrder ? {} : { scale: 0.95 }}
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white font-bold hover:shadow-lg hover:shadow-fastfood-red/50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                      {isPlacingOrder ? t("placingOrder") : t("place")}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

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
                    <Map size={24} className="text-fastfood-blue" />
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
                    <GoogleMapDiv
                      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                      onLoad={(map) => {
                        mapRef.current = map;
                        isInitialMapLoadRef.current = true;
                        map.setCenter(mapCenter);
                        map.setZoom(16);
                        map.addListener('dragstart', () => { userDraggingRef.current = true; });
                        map.addListener('dragend', () => { userDraggingRef.current = false; });
                      }}
                      onIdle={() => {
                        if (isInitialMapLoadRef.current) { isInitialMapLoadRef.current = false; return; }
                        if (skipNextIdleRef.current) { skipNextIdleRef.current = false; return; }
                        if (userDraggingRef.current) { userDraggingRef.current = false; return; }
                        if (mapRef.current) {
                          const center = mapRef.current.getCenter();
                          if (center) reverseGeocode(center.lat(), center.lng());
                        }
                      }}
                    />

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
                        value={deliveryOption === "home" ? addressDetails.street : otherAddressDetails.street}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (deliveryOption === "home") {
                            setAddressDetails({...addressDetails, street: val});
                          } else {
                            setOtherAddressDetails({...otherAddressDetails, street: val});
                          }
                          // Show suggestions immediately while typing
                          if (val.length > 0) {
                            setShowSuggestions(true);
                            getStreetSuggestions(val, 'Sebeș');
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
                                if (deliveryOption === "home") {
                                  setAddressDetails({...addressDetails, street: suggestion});
                                  forwardGeocode(suggestion, addressDetails.number, 'Sebeș');
                                } else {
                                  setOtherAddressDetails({...otherAddressDetails, street: suggestion});
                                  forwardGeocode(suggestion, otherAddressDetails.number, 'Sebeș');
                                }
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
                      value={deliveryOption === "home" ? addressDetails.number : otherAddressDetails.number}
                      onChange={(e) => {
                        const newNumber = e.target.value;
                        const currentStreet = deliveryOption === "home" ? addressDetails.street : otherAddressDetails.street;
                        if (deliveryOption === "home") {
                          setAddressDetails({...addressDetails, number: newNumber});
                        } else {
                          setOtherAddressDetails({...otherAddressDetails, number: newNumber});
                        }
                        if (currentStreet && newNumber) {
                          forwardGeocode(currentStreet, newNumber, 'Sebeș');
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
                      value={deliveryOption === "home" ? addressDetails.apartment : otherAddressDetails.apartment}
                      onChange={(e) => deliveryOption === "home" 
                        ? setAddressDetails({...addressDetails, apartment: e.target.value})
                        : setOtherAddressDetails({...otherAddressDetails, apartment: e.target.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        dark 
                          ? "bg-gray-700 border-gray-600 text-white" 
                          : "bg-white border-gray-300"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Oraș"
                      value={deliveryOption === "home" ? addressDetails.city : otherAddressDetails.city}
                      onChange={(e) => deliveryOption === "home" 
                        ? setAddressDetails({...addressDetails, city: e.target.value})
                        : setOtherAddressDetails({...otherAddressDetails, city: e.target.value})}
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
    </AnimatePresence>
  );
}



