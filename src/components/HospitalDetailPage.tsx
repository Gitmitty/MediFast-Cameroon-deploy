import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { MapPin, Clock, Phone, Building2, ChevronLeft, Navigation, Stethoscope } from 'lucide-react';

interface HospitalData {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  emergencyPhone?: string;
  workingHours: string;
  hasEmergency: boolean;
  departments: string[];
  lat?: number;
  lon?: number;
  distance?: number;
  duration?: number;
}

// Static hospital data (can be replaced with Firebase data)
const hospitalsData: Record<string, HospitalData> = {
  'jamot': {
    id: 'jamot',
    name: 'Hôpital Jamot Yaoundé',
    address: 'Quartier Jamot, Yaoundé, Cameroun',
    city: 'Yaoundé',
    phone: '+237 222 23 45 67',
    emergencyPhone: '+237 222 23 45 68',
    workingHours: '24h/24 - 7j/7',
    hasEmergency: true,
    departments: ['Pneumologie', 'Cardiologie', 'Neurologie', 'Médecine Générale', 'Urgences'],
    lat: 3.8667,
    lon: 11.5167
  },
  'central': {
    id: 'central',
    name: 'Hôpital Central de Yaoundé',
    address: 'Avenue Kennedy, Yaoundé, Cameroun',
    city: 'Yaoundé',
    phone: '+237 222 23 10 20',
    emergencyPhone: '+237 222 23 10 21',
    workingHours: '24h/24 - 7j/7',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Urgences'],
    lat: 3.8480,
    lon: 11.5021
  },
  'general-yaounde': {
    id: 'general-yaounde',
    name: 'Hôpital Général de Yaoundé',
    address: 'Centre-ville, Yaoundé, Cameroun',
    city: 'Yaoundé',
    phone: '+237 222 23 20 30',
    emergencyPhone: '+237 222 23 20 31',
    workingHours: '24h/24 - 7j/7',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Orthopédie', 'Ophtalmologie', 'ORL', 'Urgences'],
    lat: 3.8520,
    lon: 11.5100
  },
  'general-douala': {
    id: 'general-douala',
    name: 'Hôpital Général de Douala',
    address: 'Bonanjo, Douala, Cameroun',
    city: 'Douala',
    phone: '+237 233 42 10 10',
    emergencyPhone: '+237 233 42 10 11',
    workingHours: '24h/24 - 7j/7',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Cardiologie', 'Gastroentérologie', 'Urgences'],
    lat: 4.0511,
    lon: 9.7679
  },
  'laquintinie': {
    id: 'laquintinie',
    name: 'Hôpital Laquintinie Douala',
    address: 'Akwa, Douala, Cameroun',
    city: 'Douala',
    phone: '+237 233 42 45 67',
    emergencyPhone: '+237 233 42 45 68',
    workingHours: '24h/24 - 7j/7',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Gynécologie', 'Urgences'],
    lat: 4.0435,
    lon: 9.6966
  }
};

const HospitalDetailPage: React.FC = () => {
  const { darkMode, language } = useApp();
  const navigate = useNavigate();
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const [searchParams] = useSearchParams();
  
  const [hospital, setHospital] = useState<HospitalData | null>(null);

  useEffect(() => {
    // Get hospital from static data or URL params
    if (hospitalId && hospitalsData[hospitalId]) {
      const hospitalData = hospitalsData[hospitalId];
      
      // Get distance/duration from URL params if available
      const distance = searchParams.get('distance');
      const duration = searchParams.get('duration');
      const lat = searchParams.get('lat');
      const lon = searchParams.get('lon');
      
      setHospital({
        ...hospitalData,
        distance: distance ? parseFloat(distance) : undefined,
        duration: duration ? parseFloat(duration) : undefined,
        lat: lat ? parseFloat(lat) : hospitalData.lat,
        lon: lon ? parseFloat(lon) : hospitalData.lon,
      });
    }
  }, [hospitalId, searchParams]);

  const handleNavigate = () => {
    if (hospital?.lat && hospital?.lon) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`,
        '_blank'
      );
    }
  };

  const handleCall = () => {
    if (hospital?.phone) {
      window.location.href = `tel:${hospital.phone}`;
    }
  };

  const handleBookAppointment = () => {
    navigate('/book', { state: { hospitalId: hospital?.id, hospitalName: hospital?.name } });
  };

  if (!hospital) {
    return (
      <div className={`min-h-screen pt-20 pb-24 px-4 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          {language === 'fr' ? 'Hôpital non trouvé' : 'Hospital not found'}
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 pb-24 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} data-testid="hospital-detail-page">
      {/* Header Image */}
      <div className="relative h-48 bg-gradient-to-br from-green-600 to-green-800">
        <div className="absolute inset-0 bg-black/20" />
        <button 
          onClick={() => navigate(-1)}
          data-testid="back-btn"
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="text-white" size={24} />
            {hospital.hasEmergency && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {language === 'fr' ? 'Urgences 24/7' : 'Emergency 24/7'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{hospital.name}</h1>
          <p className="text-white/80 text-sm">{hospital.city}</p>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        {/* Quick Info Card */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-4 mb-4`}>
          {/* Distance if available */}
          {hospital.distance && (
            <div className={`flex items-center justify-between pb-3 mb-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2">
                <MapPin className="text-green-600" size={18} />
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>
                  {(hospital.distance / 1000).toFixed(1)} km
                </span>
              </div>
              {hospital.duration && (
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ~{Math.round(hospital.duration / 60)} min
                </span>
              )}
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-3 mb-3">
            <MapPin className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`} size={18} />
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {hospital.address}
            </p>
          </div>

          {/* Working Hours */}
          <div className="flex items-center gap-3 mb-3">
            <Clock className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {hospital.workingHours}
            </p>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
            <a 
              href={`tel:${hospital.phone}`}
              className="text-sm text-green-600 font-medium hover:underline"
            >
              {hospital.phone}
            </a>
          </div>
        </div>

        {/* Departments */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-4 mb-4`}>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <Stethoscope size={18} className="text-green-600" />
            {language === 'fr' ? 'Départements / Services' : 'Departments / Services'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {hospital.departments.map((dept, i) => (
              <span 
                key={i} 
                className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {dept}
              </span>
            ))}
          </div>
        </div>

        {/* Emergency Info */}
        {hospital.hasEmergency && hospital.emergencyPhone && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <h3 className="font-semibold text-red-700 mb-2">
              {language === 'fr' ? 'Service d\'Urgence' : 'Emergency Service'}
            </h3>
            <a 
              href={`tel:${hospital.emergencyPhone}`}
              className="flex items-center gap-2 text-red-600 font-bold text-lg"
            >
              <Phone size={20} />
              {hospital.emergencyPhone}
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary: Book Appointment */}
          <button
            onClick={handleBookAppointment}
            data-testid="book-appointment-btn"
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg"
          >
            <Stethoscope size={20} />
            {language === 'fr' ? 'Prendre un Rendez-vous' : 'Book an Appointment'}
          </button>

          {/* Secondary: Navigate */}
          <div className="flex gap-3">
            <button
              onClick={handleNavigate}
              data-testid="navigate-btn"
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                darkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Navigation size={18} />
              {language === 'fr' ? 'Naviguer' : 'Navigate'}
            </button>

            <button
              onClick={handleCall}
              data-testid="call-btn"
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                darkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Phone size={18} />
              {language === 'fr' ? 'Appeler' : 'Call'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailPage;
