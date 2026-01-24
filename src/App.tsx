import MainLayout from "./layouts/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import LoginPage from "./pages/LoginPage";
import WelcomePage from "./pages/WelcomePage";
import RegisterPage from "./pages/RegisterPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AppProvider } from "./contexts/AppContext";
import DoctorsPage from "./pages/DoctorsPage";
import BookPage from "./components/BookAppointment";
import HospitalsPage from "./components/HospitalLocator";
import PaymentPage from "./components/PaymentPage";
import AppointmentsList from "./components/AppointmentsList";
import EmergencyPage from "./components/EmergencyPage";
import ProfilePage from "./components/ProfilePage";
import AboutPage from "./components/AboutPage";
import PharmacyPage from "./components/PharmacyPage";
import SymptomChecker from "./components/SymptomChecker";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireLoginPage from "./pages/RequireLoginPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>  
          <Toaster />
          <Sonner />
            <BrowserRouter>
              <Routes>
            
                {/* Public pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/RequireLogin" element={<RequireLoginPage />} />
            
                {/* Layout-wrapped pages */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<WelcomePage />} />
                  <Route path="/doctors" element={<DoctorsPage />} />
                  <Route path="/book" element={<ProtectedRoute> <BookPage /></ProtectedRoute>} />
                  <Route path="/appointments" element={<ProtectedRoute><AppointmentsList /></ProtectedRoute>} />
                  <Route path="/emergency" element={<EmergencyPage />} />
                  <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/pharmacy" element={<PharmacyPage />} />
                  <Route path="/hospitals" element={<HospitalsPage />} />
                  <Route path="/symptoms" element={<SymptomChecker />} />
                </Route>
            
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
            
              </Routes>
            </BrowserRouter>
          <Analytics />
        </AppProvider>   
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
