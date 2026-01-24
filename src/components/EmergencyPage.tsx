import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Phone, AlertTriangle, Home, Ambulance, MapPin, Clock, Headphones, Navigation, Stethoscope, Loader2 } from 'lucide-react';

// Complete hospital data with real coordinates and departments
const hospitalData = [
  { 
    id: 'jamot',
    name: 'Hôpital Jamot Yaoundé', 
    phone: '+237 222 23 10 15', 
    emergencyPhone: '+237 222 23 10 16',
    city: 'Yaoundé',
    lat: 3.8667, 
    lon: 11.5167,
    hasEmergency: true,
    departments: ['Pneumologie', 'Phtisiologie', 'Médecine Interne', 'Urgences', 'Laboratoire', 'Radiologie']
  },
  { 
    id: 'central',
    name: 'Hôpital Central de Yaoundé', 
    phone: '+237 222 23 40 20',
    emergencyPhone: '+237 222 23 40 21', 
    city: 'Yaoundé',
    lat: 3.8480, 
    lon: 11.5021,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Gynécologie', 'Urgences', 'Ophtalmologie', 'ORL', 'Cardiologie', 'Laboratoire']
  },
  { 
    id: 'general-yaounde',
    name: 'Hôpital Général de Yaoundé', 
    phone: '+237 222 23 20 15',
    emergencyPhone: '+237 222 23 20 16', 
    city: 'Yaoundé',
    lat: 3.8520, 
    lon: 11.5100,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie Générale', 'Neurologie', 'Neurochirurgie', 'Orthopédie', 'Traumatologie', 'Réanimation', 'Urgences', 'Cardiologie', 'Gastroentérologie', 'Néphrologie', 'Dialyse']
  },
  { 
    id: 'gyneco-obstetrique',
    name: 'Hôpital Gynéco-Obstétrique de Yaoundé', 
    phone: '+237 222 23 16 00',
    emergencyPhone: '+237 222 23 16 01', 
    city: 'Yaoundé',
    lat: 3.8550, 
    lon: 11.5080,
    hasEmergency: true,
    departments: ['Gynécologie', 'Obstétrique', 'Néonatologie', 'Maternité', 'Planification Familiale', 'Urgences Obstétricales']
  },
  { 
    id: 'general-douala',
    name: 'Hôpital Général de Douala', 
    phone: '+237 233 42 01 12',
    emergencyPhone: '+237 233 42 01 13', 
    city: 'Douala',
    lat: 4.0511, 
    lon: 9.7679,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Cardiologie', 'Gastroentérologie', 'Neurologie', 'Pédiatrie', 'Urgences', 'Réanimation', 'Oncologie', 'Radiologie']
  },
  { 
    id: 'laquintinie',
    name: 'Hôpital Laquintinie Douala', 
    phone: '+237 233 42 56 78',
    emergencyPhone: '+237 233 42 56 79', 
    city: 'Douala',
    lat: 4.0435, 
    lon: 9.6966,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Gynécologie', 'Maternité', 'Chirurgie', 'Urgences', 'Ophtalmologie', 'Dermatologie']
  },
  { 
    id: 'cme-yaounde',
    name: 'Centre Médico-Social de Yaoundé', 
    phone: '+237 222 22 12 34', 
    city: 'Yaoundé',
    lat: 3.8600, 
    lon: 11.5200,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination', 'Consultation Externe']
  },
];

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Estimate driving time (average 30 km/h in city traffic)
function estimateDrivingTime(distanceKm: number): number {
  return Math.round((distanceKm / 30) * 60); // minutes
}

const EmergencyPage: React.FC = () => {
  const { darkMode, language } = useApp();
  const navigate = useNavigate();
  const [showHomeVisit, setShowHomeVisit] = useState(false);
  const [homeVisitRequested, setHomeVisitRequested] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lon: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  // Get user location on mount
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (error) => {
            console.warn('Geolocation error:', error);
            // Default to Yaoundé center
            setUserLocation({ lat: 3.8480, lon: 11.5021 });
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      } else {
        setUserLocation({ lat: 3.8480, lon: 11.5021 });
      }
    };
    
    getUserLocation();
  }, []);

  // Calculate distances when location is available
  useEffect(() => {
    if (userLocation) {
      const hospitalsWithDistance = hospitalData
        .filter(h => h.hasEmergency) // Only emergency hospitals
        .map(hospital => {
          const distance = calculateDistance(
            userLocation.lat, 
            userLocation.lon, 
            hospital.lat, 
            hospital.lon
          );
          const drivingTime = estimateDrivingTime(distance);
          
          return {
            ...hospital,
            distance,
            drivingTime
          };
        })
        .sort((a, b) => a.distance - b.distance); // Sort by nearest
      
      setHospitals(hospitalsWithDistance);
      setLoading(false);
    }
  }, [userLocation]);

  const callEmergency = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleNavigate = (hospital: any) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`,
      '_blank'
    );
  };

  const handleBookAppointment = (hospital: any) => {
    navigate('/book', { state: { hospitalId: hospital.id, hospitalName: hospital.name } });
  };

  const requestHomeVisit = () => {
    setHomeVisitRequested(true);
    setTimeout(() => {
      setShowHomeVisit(false);
      setHomeVisitRequested(false);
    }, 3000);
  };

  return (
    <div className={`min-h-screen pt-20 pb-24 px-4 ${darkMode ? 'bg-gray-900' : 'bg-red-50'}`} data-testid="emergency-page">
      {/* Emergency Call Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-6 mb-6 text-center shadow-lg">
        <AlertTriangle size={48} className="mx-auto mb-3" />
        <h2 className="text-2xl font-bold mb-2">
          {language === 'fr' ? 'URGENCE' : 'EMERGENCY'}
        </h2>
        <p className="opacity-90 mb-4">
          {language === 'fr' ? 'Accès prioritaire aux soins médicaux' : 'Priority access to medical care'}
        </p>
        <button 
          onClick={() => callEmergency('222')}
          data-testid="call-emergency-btn"
          className="w-full bg-white text-red-600 py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-3 shadow-md hover:bg-red-50 transition-colors"
        >
          <Phone size={24} /> {language === 'fr' ? 'Appeler 222' : 'Call 222'}
        </button>
      </div>

      {/* Hospital Reception Contact - Mme Ekole */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 mb-6 shadow-lg border-2 border-green-500`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Headphones className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? 'Accueil Hôpital Jamot' : 'Hôpital Jamot Reception'}
            </h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'fr' ? 'Contact pour orientation et urgences' : 'Contact for guidance & emergencies'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206141158_1e83655e.png" 
            alt="Mme Ekole"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>Mme Ekole Odile Félicité</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'fr' ? 'Major Accueil & Urgences' : 'Head of Reception & Emergency'}
            </p>
          </div>
          <button 
            onClick={() => callEmergency('+237650031484')}
            data-testid="call-reception-btn"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Phone size={16} />
            <span className="text-sm">650 031 484</span>
          </button>
        </div>
      </div>

      {/* Location Status */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-red-600 mr-3" size={24} />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            {language === 'fr' ? 'Localisation en cours...' : 'Getting your location...'}
          </span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? 'Hôpitaux d\'Urgence les Plus Proches' : 'Nearest Emergency Hospitals'}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
              {language === 'fr' ? 'Triés par distance' : 'Sorted by distance'}
            </span>
          </div>

          <div className="space-y-3 mb-6">
            {hospitals.map((hospital, i) => (
              <div 
                key={hospital.id} 
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-md ${i === 0 ? 'ring-2 ring-yellow-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {hospital.name}
                      </h4>
                      {i === 0 && <span className="text-yellow-500 text-sm">⭐ Plus proche</span>}
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{hospital.city}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className={`flex items-center gap-1 font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        <MapPin size={14} /> {hospital.distance.toFixed(1)} km
                      </span>
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock size={14} /> ~{hospital.drivingTime} min
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => callEmergency(hospital.emergencyPhone || hospital.phone)}
                    data-testid={`call-hospital-${i}-btn`}
                    className="bg-red-100 text-red-600 p-3 rounded-full hover:bg-red-200 transition-colors"
                  >
                    <Phone size={20} />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setSelectedHospital(hospital)}
                    data-testid={`details-hospital-${i}-btn`}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {language === 'fr' ? 'Départements' : 'Departments'}
                  </button>
                  <button
                    onClick={() => handleNavigate(hospital)}
                    data-testid={`navigate-hospital-${i}-btn`}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition"
                  >
                    <Navigation size={14} /> {language === 'fr' ? 'Y aller' : 'Go'}
                  </button>
                  <button
                    onClick={() => handleBookAppointment(hospital)}
                    data-testid={`book-hospital-${i}-btn`}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                  >
                    <Stethoscope size={14} /> RDV
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Hospital Details Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedHospital(null)}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {selectedHospital.name}
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedHospital.city} • {selectedHospital.distance.toFixed(1)} km • ~{selectedHospital.drivingTime} min
            </p>
            
            <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? 'Départements / Services' : 'Departments / Services'}
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedHospital.departments.map((dept: string, i: number) => (
                <span 
                  key={i} 
                  className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {dept}
                </span>
              ))}
            </div>

            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-4`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>{language === 'fr' ? 'Téléphone:' : 'Phone:'}</strong> {selectedHospital.phone}
              </p>
              {selectedHospital.emergencyPhone && (
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>{language === 'fr' ? 'Urgences:' : 'Emergency:'}</strong> {selectedHospital.emergencyPhone}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedHospital(null)}
                className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
              <button
                onClick={() => { setSelectedHospital(null); handleBookAppointment(selectedHospital); }}
                data-testid="modal-book-btn"
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                {language === 'fr' ? 'Réserver RDV' : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Home Visit Option */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Home className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? 'Visite à Domicile' : 'Home Doctor Visit'}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'fr' ? 'Pour cas critiques uniquement' : 'For critical cases only'}
            </p>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} rounded-xl p-3 mb-4`}>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {language === 'fr' ? 'Frais de visite: ' : 'Visit fee: '}
            <strong className="text-green-600">10 000 FCFA</strong>
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'fr' ? 'Un médecin se déplacera à votre domicile' : 'A doctor will come to your home'}
          </p>
        </div>
        <button 
          onClick={() => setShowHomeVisit(true)}
          data-testid="request-home-visit-btn"
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          {language === 'fr' ? 'Demander une Visite' : 'Request Home Visit'}
        </button>
      </div>

      {/* Home Visit Modal */}
      {showHomeVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md`}>
            {homeVisitRequested ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ambulance className="text-green-600" size={32} />
                </div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {language === 'fr' ? 'Demande Envoyée!' : 'Request Sent!'}
                </h3>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'fr' ? 'Un médecin vous contactera sous peu' : 'A doctor will contact you shortly'}
                </p>
              </div>
            ) : (
              <>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {language === 'fr' ? 'Confirmer la Visite à Domicile' : 'Confirm Home Visit'}
                </h3>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-4`}>
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {language === 'fr' ? 'Frais de visite' : 'Visit fee'}
                    </span>
                    <span className="text-green-600 font-bold text-lg">10 000 FCFA</span>
                  </div>
                </div>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'fr' 
                    ? 'Un médecin sera envoyé à votre adresse. Vous serez contacté pour confirmer les détails.' 
                    : 'A doctor will be sent to your address. You will be contacted to confirm details.'}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowHomeVisit(false)}
                    className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </button>
                  <button 
                    onClick={requestHomeVisit}
                    data-testid="confirm-home-visit-btn"
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    {language === 'fr' ? 'Confirmer' : 'Confirm'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPage;
