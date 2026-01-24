import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Stethoscope, MapPin, Calendar, AlertTriangle, 
  User, Info, CreditCard, LogOut, Pill, UserCheck 
} from 'lucide-react';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose }) => {
  const { darkMode, t, isLoggedIn, setUser, language } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: language === 'fr' ? 'Accueil' : 'Home' },
    { path: '/symptoms', icon: Stethoscope, label: t('symptoms') },
    { path: '/hospitals', icon: MapPin, label: t('hospitals') },
    { path: '/doctors', icon: UserCheck, label: language === 'fr' ? 'Nos Médecins' : 'Our Doctors' },
    { path: '/appointments', icon: Calendar, label: t('appointments') },
    { path: '/pharmacy', icon: Pill, label: language === 'fr' ? 'Pharmacies' : 'Pharmacies' },
    { path: '/emergency', icon: AlertTriangle, label: t('emergency') },
    { path: '/payment', icon: CreditCard, label: t('payment') },
    { path: '/profile', icon: User, label: t('profile') },
    { path: '/about', icon: Info, label: t('about') },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 pt-16">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <nav className={`absolute right-0 top-16 w-72 h-full ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl overflow-y-auto`}>
        <div className="p-4 space-y-2">

          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          {isLoggedIn && (
            <button
              onClick={() => { 
                setUser(null); 
                navigate('/'); 
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-50"
            >
              <LogOut size={20} />
              <span className="font-medium">{t('logout')}</span>
            </button>
          )}

        </div>
      </nav>
    </div>
  );
};

export default Navigation;
