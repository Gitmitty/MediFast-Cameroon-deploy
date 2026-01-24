import "leaflet/dist/leaflet.css";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from "./contexts/AuthContext";

// Remove dark mode class addition
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
