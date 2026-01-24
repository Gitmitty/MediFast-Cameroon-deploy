import React from "react";

const LogoutModal = ({ open, onConfirm, onCancel, darkMode, language }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-xl w-80 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-lg font-bold mb-3 text-center">
          {language === "fr" ? "Se déconnecter?" : "Log out?"}
        </h2>

        <p className="text-sm mb-5 text-center">
          {language === "fr"
            ? "Êtes-vous sûr de vouloir vous déconnecter?"
            : "Are you sure you want to log out?"}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-400"
          >
            {language === "fr" ? "Annuler" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white"
          >
            {language === "fr" ? "Déconnecter" : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
