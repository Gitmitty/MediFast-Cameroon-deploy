import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase"; 
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; 

const RegisterPage = () => {
  const { darkMode, t, language, setUser } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleRegister = async () => {

    setError("");
    
    if (!fullName || !email || !password || !confirmPassword) {
  setError("Please fill in all fields");
  return;
}
    if (!/^\+?\d{7,15}$/.test(phone)) {
  setError("Please enter a valid phone number");
  return;
}

    setLoading(true);
    
  try {
          if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      
      if (passwordStrength === "weak" || passwordStrength === "medium") {
        setError("Password must include letters and numbers");
        return;
      }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    setUser({
      id: user.uid,
      fullName,
      email: user.email,
      phone,
    });
  await setDoc(doc(db, "users", user.uid), {
    fullName,
    email: user.email,
    phone,
    createdAt: new Date(),
  });


    navigate("/");
  } catch (error) {
    setError(error.message);
  }
    finally { setLoading(false); }
};


  const checkPasswordStrength = (value) => {
  if (value.length < 8) return "weak";
  if (!/\d/.test(value)) return "medium";
  if (!/[!@#$%^&*]/.test(value)) return "strong";
  return "very-strong";
};

  const PasswordTooltip = ({ darkMode }) => (
  <div
    className={`absolute top-full left-0 mt-1 w-64 p-3 text-xs rounded-lg shadow-lg z-20 ${
      darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
    }`}
  >
    <p className="mb-1">Password must include:</p>
    <ul className="list-disc ml-4 space-y-1">
      <li>At least 8 characters</li>
      <li>At least one number</li>
      <li>At least one special character (!@#$%^&*)</li>
    </ul>
  </div>
);

  return (
    <div
      className={`min-h-screen flex flex-col justify-center px-6 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-4 left-4 flex items-center gap-1 text-green-600"
      >
        <ArrowLeft size={20} />
        <span>{language === "fr" ? "Retour" : "Back"}</span>
      </button>

      {/* Card */}
      <div
        className={`max-w-md w-full mx-auto p-6 rounded-2xl shadow-xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h1
          className={`text-2xl font-bold mb-6 text-center ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {t("register")}
        </h1>

        {/* Full Name */}
        <input
          type="text"
          placeholder={language === "fr" ? "Nom complet" : "Full Name"}
          className={`w-full p-3 mb-3 border rounded-lg ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300"
          }`}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        {/* Phone */}
        <input
          type="tel"
          placeholder={language === "fr" ? "Numéro de téléphone" : "Phone Number"}
          className={`w-full p-3 mb-3 border rounded-lg ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300"
          }`}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className={`w-full p-3 mb-3 border rounded-lg ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300"
          }`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

     {/* Password */}
<div className="mb-4 relative">
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder={language === "fr" ? "Mot de passe" : "Password"}
      className={`w-full p-3 pr-20 rounded-lg border focus:ring-2 transition ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-white focus:ring-green-600"
          : "border-gray-300 focus:ring-green-500"
      }`}
      value={password}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onChange={(e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordStrength(checkPasswordStrength(value));
      }}
    />

    {/* Show/Hide */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>

  {/* Tooltip */}
  {showTooltip && <PasswordTooltip darkMode={darkMode} />}

  {/* Strength Bar */}
  {password && (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-300 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            passwordStrength === "weak"
              ? "bg-red-500 w-1/4"
              : passwordStrength === "medium"
              ? "bg-yellow-500 w-2/4"
              : passwordStrength === "strong"
              ? "bg-green-500 w-3/4"
              : "bg-green-700 w-full"
          }`}
        ></div>
      </div>

      <p
        className={`text-xs mt-1 ${
          passwordStrength === "weak"
            ? "text-red-500"
            : passwordStrength === "medium"
            ? "text-yellow-500"
            : "text-green-500"
        }`}
      >
        {passwordStrength === "weak" && "Weak password"}
        {passwordStrength === "medium" && "Medium strength"}
        {passwordStrength === "strong" && "Strong password"}
        {passwordStrength === "very-strong" && "Very strong password"}
      </p>
    </div>
  )}
</div>


        {/* Confirm Password */}
<div className="mb-4 relative">
  <div className="relative">
    <input
      type={showConfirmPassword ? "text" : "password"}
      placeholder={language === "fr" ? "Confirmer le mot de passe" : "Confirm Password"}
      className={`w-full p-3 pr-20 rounded-lg border focus:ring-2 transition ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-white focus:ring-green-600"
          : "border-gray-300 focus:ring-green-500"
      }`}
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />

    {/* Show/Hide */}
    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
    >
      {showConfirmPassword ? "Hide" : "Show"}
    </button>

    {/* Green checkmark */}
    {confirmPassword && confirmPassword === password && (
      <span className="absolute right-16 top-1/2 -translate-y-1/2 text-green-500 text-lg">
        ✓
      </span>
    )}
  </div>
</div>

                {/*Show error*/}
                {error && (
                  <p className="text-red-500 text-sm mb-3 text-center">
                    {error}
                  </p>
                )}
        
        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"
          }`}
        >
          <UserPlus size={20} />
        
          {loading ? "Registering..." : t("register")}
        </button>

        {/* Already have account */}
        <p
          className={`text-center mt-4 text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {language === "fr"
            ? "Déjà un compte?"
            : "Already have an account?"}{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-600 font-semibold"
          >
            {t("login")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
