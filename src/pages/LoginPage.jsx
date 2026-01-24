import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";
import { auth } from "../lib/firebase"; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const LoginPage = () => {
  const { darkMode, t, setCurrentPage, language, setUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

const handleLogin = async () => {
  setError("");
  setLoading(true);

  if (!email || !password) {
    setError("Please enter email and password");
    setLoading(false);
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch Firestore profile
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      setUser({
        id: user.uid,
        email: user.email,
        fullName: data.fullName,
        phone: data.phone,
        photoURL: data.photoURL || null,
      });
    } else {
      setUser({
        id: user.uid,
        email: user.email,
      });
    }

    navigate("/");
  } catch (err) {
    setError("Invalid email or password");
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = async () => {
  setError("");

  if (!email) {
    setError("Please enter your email first");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    setError("Password reset email sent");
  } catch (err) {
    setError("Unable to send reset email");
  }
};
  
  return (
    <div
      className={`min-h-screen flex flex-col justify-center px-6 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
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
          {t("login")}
        </h1>

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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={language === "fr" ? "Mot de passe" : "Password"}
            className={`w-full p-3 pr-10 border rounded-lg ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          onClick={handleForgotPassword}
          className="text-green-600 text-sm mb-3"
        >
          {language === "fr" ? "Mot de passe oublié?" : "Forgot password?"}
        </button>

        {error && (
            <p className="text-red-500 text-sm mb-3 text-center">
              {error}
            </p>
          )}

        {/* Login Button */}
         <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"
          }`}
        >
          <LogIn size={20} />
          {loading ? "Logging in..." : t("login")}
        </button>

        {/* Register Link */}
        <p
          className={`text-center mt-4 text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {language === "fr"
            ? "Pas de compte?"
            : "Don't have an account?"}{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-green-600 font-semibold"
          >
            {t("register")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
