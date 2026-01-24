import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

const RequireLoginPage = () => {
  const navigate = useNavigate();
  const { darkMode, language } = useApp();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-md w-full p-6 rounded-2xl shadow-xl text-center ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <h1 className="text-2xl font-bold mb-4">
          {language === "fr" ? "Connexion requise" : "Login Required"}
        </h1>

        <p className="text-sm mb-6">
          {language === "fr"
            ? "Vous devez vous connecter pour accéder à cette page."
            : "You need to log in to access this page."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            {language === "fr" ? "Se connecter" : "Login"}
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full border border-green-600 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
          >
            {language === "fr" ? "Créer un compte" : "Register"}
          </button>

          <button
            onClick={() => navigate("/")}
            className={`text-sm mt-2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {language === "fr" ? "Retour à l'accueil" : "Back to Home"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequireLoginPage;
