import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../hooks/useLanguage";
import { LogIn, UserPlus, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { login, register } from "../../shared/utils/auth";
import { validatePassword, validateEmail, validateName, getPasswordStrength } from "../../shared/utils/validation";

export default function Auth({ dark, onLoginSuccess, onBackClick }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('weak');

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    
    // Update password strength indicator
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const validateLoginForm = () => {
    const newErrors = {};
    
    if (!loginData.email) {
      newErrors.email = "Email-ul este obligatoriu";
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = "Format email invalid";
    }
    
    if (!loginData.password) {
      newErrors.password = "Parola este obligatorie";
    }
    
    return newErrors;
  };

  const validateSignupForm = () => {
    const newErrors = {};
    
    if (!signupData.name.trim()) {
      newErrors.name = "Numele este obligatoriu";
    } else if (!validateName(signupData.name)) {
      newErrors.name = "Nume invalid. Doar litere și spații";
    }
    
    if (!signupData.email) {
      newErrors.email = "Email-ul este obligatoriu";
    } else if (!validateEmail(signupData.email)) {
      newErrors.email = "Format email invalid";
    }
    
    const passwordValidation = validatePassword(signupData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0]; // Show first error
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Parolele nu coincid";
    }
    
    return newErrors;
  };

  const handleLogin = async () => {
    const newErrors = validateLoginForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const data = await login(loginData.email, loginData.password);
      onLoginSuccess(data.user);
      setLoginData({ email: "", password: "" });
    } catch (error) {
      setErrors({ auth: error.message || "Autentificare eșuată. Verifică email-ul și parola." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const newErrors = validateSignupForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const data = await register({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password
      });
      
      onLoginSuccess(data.user);
      setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (error) {
      setErrors({ auth: error.message || "Înregistrare eșuată. Email-ul este deja folosit sau datele sunt invalide." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen pt-20 antialiased relative overflow-hidden flex items-center justify-center px-4 ${
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

      {/* Form Container */}
      <div className="relative z-10">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${dark ? "bg-neutral-900" : "bg-white"}`}>
        {/* Header */}
        <div className={`p-6 text-center border-b ${dark ? "border-neutral-800 bg-neutral-800/50" : "border-slate-200 bg-slate-50"}`}>
          <h1 className="text-3xl font-extrabold mb-2">
            FANCY<span className="text-fastfood-orange">TRUCK</span>
          </h1>
          <p className={`text-sm ${dark ? "text-neutral-400" : "text-slate-600"}`}>{t("authTitle")}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-700">
          <button
            onClick={() => {
              setTab("login");
              setErrors({});
            }}
            className={`flex-1 py-4 font-semibold transition flex items-center justify-center gap-2 ${
              tab === "login"
                ? "border-b-2 border-fastfood-red text-fastfood-red"
                : `${dark ? "text-neutral-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`
            }`}>
            <LogIn size={18} /> {t("loginTab")}
          </button>
          <button
            onClick={() => {
              setTab("signup");
              setErrors({});
            }}
            className={`flex-1 py-4 font-semibold transition flex items-center justify-center gap-2 ${
              tab === "signup"
                ? "border-b-2 border-fastfood-red text-fastfood-red"
                : `${dark ? "text-neutral-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`
            }`}>
            <UserPlus size={18} /> {t("signupTab")}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* LOGIN TAB */}
            {tab === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4">
                {/* Auth Error */}
                {errors.auth && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-400 text-sm">
                    {errors.auth}
                  </motion.div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Mail size={16} /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className={`w-full px-4 py-3 rounded-lg border transition ${
                      errors.email
                        ? "border-red-500 bg-red-500/10"
                        : dark
                          ? "border-neutral-700 bg-neutral-800 focus:border-amber-400"
                          : "border-slate-300 bg-white focus:border-amber-400"
                    } focus:outline-none`}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lock size={16} /> {t("password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className={`w-full px-4 py-3 rounded-lg border transition ${
                        errors.password
                          ? "border-red-500 bg-red-500/10"
                          : dark
                            ? "border-neutral-700 bg-neutral-800 focus:border-amber-400"
                            : "border-slate-300 bg-white focus:border-amber-400"
                      } focus:outline-none pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-3 ${dark ? "text-neutral-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Login Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white font-semibold hover:shadow-lg hover:shadow-fastfood-red/50 transition disabled:opacity-50 mt-6">
                  {loading ? t("loginLoading") : t("loginButton")}
                </motion.button>

                {/* Demo Credentials */}
                <div className={`p-3 rounded-lg text-xs ${dark ? "bg-neutral-800 text-neutral-400" : "bg-slate-100 text-slate-600"}`}>
                  <p className="font-semibold mb-1">{t("demoCredentials")}</p>
                  <p>{t("demoEmail")}</p>
                  <p>{t("demoPassword")}</p>
                </div>
              </motion.div>
            )}

            {/* SIGNUP TAB */}
            {tab === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <User size={16} /> {t("fullName")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={signupData.name}
                    onChange={handleSignupChange}
                    className={`w-full px-4 py-3 rounded-lg border transition ${
                      errors.name
                        ? "border-red-500 bg-red-500/10"
                        : dark
                          ? "border-neutral-700 bg-neutral-800 focus:border-amber-400"
                          : "border-slate-300 bg-white focus:border-amber-400"
                    } focus:outline-none`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Mail size={16} /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    className={`w-full px-4 py-3 rounded-lg border transition ${
                      errors.email
                        ? "border-red-500 bg-red-500/10"
                        : dark
                          ? "border-neutral-700 bg-neutral-800 focus:border-amber-400"
                          : "border-slate-300 bg-white focus:border-amber-400"
                    } focus:outline-none`}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lock size={16} /> Parolă
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      className={`w-full px-4 py-3 rounded-lg border transition ${
                        errors.password
                          ? "border-red-500 bg-red-500/10"
                          : dark
                            ? "border-neutral-700 bg-neutral-800 focus:border-amber-400"
                            : "border-slate-300 bg-white focus:border-amber-400"
                      } focus:outline-none pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-3 ${dark ? "text-neutral-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {signupData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        <div className={`h-1 flex-1 rounded ${
                          passwordStrength === 'weak' ? 'bg-red-500' :
                          passwordStrength === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <div className={`h-1 flex-1 rounded ${
                          passwordStrength === 'medium' || passwordStrength === 'strong' ? 
                          (passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') :
                          dark ? 'bg-neutral-700' : 'bg-slate-200'
                        }`} />
                        <div className={`h-1 flex-1 rounded ${
                          passwordStrength === 'strong' ? 'bg-green-500' : 
                          dark ? 'bg-neutral-700' : 'bg-slate-200'
                        }`} />
                      </div>
                      <p className={`text-xs ${
                        passwordStrength === 'weak' ? 'text-red-400' :
                        passwordStrength === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        Forță parolă: {
                          passwordStrength === 'weak' ? 'Slabă' :
                          passwordStrength === 'medium' ? 'Medie' :
                          'Puternică'
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* Password Requirements */}
                  <div className={`mt-2 p-2 rounded text-xs space-y-1 ${dark ? "bg-neutral-800" : "bg-slate-100"}`}>
                    <p className={`font-semibold ${dark ? "text-neutral-300" : "text-slate-700"}`}>Cerințe parolă:</p>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        {signupData.password.length >= 8 ? 
                          <CheckCircle size={12} className="text-green-500" /> : 
                          <AlertCircle size={12} className="text-slate-400" />
                        }
                        <span className={signupData.password.length >= 8 ? "text-green-400" : dark ? "text-neutral-400" : "text-slate-500"}>
                          Minim 8 caractere
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/[A-Z]/.test(signupData.password) ? 
                          <CheckCircle size={12} className="text-green-500" /> : 
                          <AlertCircle size={12} className="text-slate-400" />
                        }
                        <span className={/[A-Z]/.test(signupData.password) ? "text-green-400" : dark ? "text-neutral-400" : "text-slate-500"}>
                          O literă mare
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/[a-z]/.test(signupData.password) ? 
                          <CheckCircle size={12} className="text-green-500" /> : 
                          <AlertCircle size={12} className="text-slate-400" />
                        }
                        <span className={/[a-z]/.test(signupData.password) ? "text-green-400" : dark ? "text-neutral-400" : "text-slate-500"}>
                          O literă mică
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/\d/.test(signupData.password) ? 
                          <CheckCircle size={12} className="text-green-500" /> : 
                          <AlertCircle size={12} className="text-slate-400" />
                        }
                        <span className={/\d/.test(signupData.password) ? "text-green-400" : dark ? "text-neutral-400" : "text-slate-500"}>
                          O cifră
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/[!@#$%^&*(),.?":{}|<>]/.test(signupData.password) ? 
                          <CheckCircle size={12} className="text-green-500" /> : 
                          <AlertCircle size={12} className="text-slate-400" />
                        }
                        <span className={/[!@#$%^&*(),.?":{}|<>]/.test(signupData.password) ? "text-green-400" : dark ? "text-neutral-400" : "text-slate-500"}>
                          Un caracter special (!@#$%...)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lock size={16} /> Confirmă parola
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      className={`w-full px-4 py-3 rounded-lg border transition ${
                        errors.confirmPassword
                          ? "border-red-500 bg-red-500/10"
                          : dark
                            ? "border-neutral-700 bg-neutral-800 focus:border-amber-400"
                            : "border-slate-300 bg-white focus:border-amber-400"
                      } focus:outline-none pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-3 ${dark ? "text-neutral-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Auth Error */}
                {errors.auth && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-400 text-sm">
                    {errors.auth}
                  </motion.div>
                )}

                {/* Signup Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-fastfood-red to-fastfood-orange text-white font-semibold hover:shadow-lg hover:shadow-fastfood-red/50 transition disabled:opacity-50 mt-6">
                  {loading ? t("signupLoading") : t("signupButton")}
                </motion.button>

                <p className={`text-xs text-center ${dark ? "text-neutral-400" : "text-slate-600"}`}>
                  {t("createAccountMessage")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back Button */}
        <div className={`p-4 border-t ${dark ? "border-neutral-800 bg-neutral-800/30" : "border-slate-200 bg-slate-50"}`}>
          <button
            onClick={onBackClick}
            className={`w-full py-2 rounded-lg transition ${
              dark ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-slate-200 text-slate-600"
            }`}>
            ← {t("backToSite")}
          </button>
        </div>
      </motion.div>
      </div>
    </motion.div>
  );
}




