import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Search, AlertCircle, CheckCircle, AlertTriangle, MapPin, Clock, Stethoscope, Navigation, Loader2 } from 'lucide-react';

// Expanded symptom database with French translations
const symptomDatabase = [
  // French symptoms
  { symptom: 'douleur poitrine', department: 'Cardiologie', severity: 'urgent' },
  { symptom: 'coeur', department: 'Cardiologie', severity: 'urgent' },
  { symptom: 'palpitation', department: 'Cardiologie', severity: 'moderate' },
  { symptom: 'mal de tête', department: 'Neurologie', severity: 'mild' },
  { symptom: 'migraine', department: 'Neurologie', severity: 'moderate' },
  { symptom: 'vertige', department: 'Neurologie', severity: 'moderate' },
  { symptom: 'convulsion', department: 'Neurologie', severity: 'urgent' },
  { symptom: 'fièvre', department: 'Médecine Générale', severity: 'mild' },
  { symptom: 'toux', department: 'Pneumologie', severity: 'mild' },
  { symptom: 'grippe', department: 'Médecine Générale', severity: 'mild' },
  { symptom: 'rhume', department: 'Médecine Générale', severity: 'mild' },
  { symptom: 'cassé', department: 'Orthopédie', severity: 'urgent' },
  { symptom: 'fracture', department: 'Orthopédie', severity: 'urgent' },
  { symptom: 'os', department: 'Orthopédie', severity: 'moderate' },
  { symptom: 'enfant', department: 'Pédiatrie', severity: 'moderate' },
  { symptom: 'bébé', department: 'Pédiatrie', severity: 'moderate' },
  { symptom: 'nourrisson', department: 'Pédiatrie', severity: 'moderate' },
  { symptom: 'enceinte', department: 'Gynécologie', severity: 'moderate' },
  { symptom: 'grossesse', department: 'Gynécologie', severity: 'moderate' },
  { symptom: 'accouchement', department: 'Maternité', severity: 'urgent' },
  { symptom: 'règles', department: 'Gynécologie', severity: 'mild' },
  { symptom: 'peau', department: 'Dermatologie', severity: 'mild' },
  { symptom: 'bouton', department: 'Dermatologie', severity: 'mild' },
  { symptom: 'éruption', department: 'Dermatologie', severity: 'moderate' },
  { symptom: 'oeil', department: 'Ophtalmologie', severity: 'moderate' },
  { symptom: 'yeux', department: 'Ophtalmologie', severity: 'moderate' },
  { symptom: 'vision', department: 'Ophtalmologie', severity: 'moderate' },
  { symptom: 'estomac', department: 'Gastroentérologie', severity: 'moderate' },
  { symptom: 'ventre', department: 'Gastroentérologie', severity: 'moderate' },
  { symptom: 'digestion', department: 'Gastroentérologie', severity: 'mild' },
  { symptom: 'respiration', department: 'Urgences', severity: 'urgent' },
  { symptom: 'souffle', department: 'Pneumologie', severity: 'moderate' },
  { symptom: 'accident', department: 'Urgences', severity: 'urgent' },
  { symptom: 'blessure', department: 'Urgences', severity: 'urgent' },
  { symptom: 'sang', department: 'Urgences', severity: 'urgent' },
  { symptom: 'dent', department: 'Dentaire', severity: 'moderate' },
  { symptom: 'oreille', department: 'ORL', severity: 'moderate' },
  { symptom: 'gorge', department: 'ORL', severity: 'mild' },
  { symptom: 'nez', department: 'ORL', severity: 'mild' },
  { symptom: 'urine', department: 'Néphrologie', severity: 'moderate' },
  { symptom: 'rein', department: 'Néphrologie', severity: 'moderate' },
  { symptom: 'diabète', department: 'Endocrinologie', severity: 'moderate' },
  { symptom: 'sucre', department: 'Endocrinologie', severity: 'moderate' },
  { symptom: 'fatigue', department: 'Médecine Générale', severity: 'mild' },
  { symptom: 'insomnie', department: 'Neurologie', severity: 'mild' },
  { symptom: 'stress', department: 'Médecine Générale', severity: 'mild' },
  { symptom: 'anxiété', department: 'Psychiatrie', severity: 'moderate' },
  { symptom: 'dépression', department: 'Psychiatrie', severity: 'moderate' },
  
  // English symptoms
  { symptom: 'chest pain', department: 'Cardiologie', severity: 'urgent' },
  { symptom: 'heart', department: 'Cardiologie', severity: 'urgent' },
  { symptom: 'headache', department: 'Neurologie', severity: 'mild' },
  { symptom: 'fever', department: 'Médecine Générale', severity: 'mild' },
  { symptom: 'cough', department: 'Pneumologie', severity: 'mild' },
  { symptom: 'broken', department: 'Orthopédie', severity: 'urgent' },
  { symptom: 'child', department: 'Pédiatrie', severity: 'moderate' },
  { symptom: 'pregnant', department: 'Gynécologie', severity: 'moderate' },
  { symptom: 'skin', department: 'Dermatologie', severity: 'mild' },
  { symptom: 'eye', department: 'Ophtalmologie', severity: 'moderate' },
  { symptom: 'stomach', department: 'Gastroentérologie', severity: 'moderate' },
  { symptom: 'breathing', department: 'Urgences', severity: 'urgent' },
  { symptom: 'accident', department: 'Urgences', severity: 'urgent' },
];

// Hospital data with departments
const hospitalsData = [
  { 
    id: 'jamot', name: 'Hôpital Jamot Yaoundé', city: 'Yaoundé',
    lat: 3.8667, lon: 11.5167,
    departments: ['Pneumologie', 'Médecine Générale', 'Cardiologie', 'Neurologie', 'Urgences']
  },
  { 
    id: 'central', name: 'Hôpital Central de Yaoundé', city: 'Yaoundé',
    lat: 3.8480, lon: 11.5021,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Gynécologie', 'Urgences', 'Ophtalmologie', 'ORL', 'Cardiologie']
  },
  { 
    id: 'general-yaounde', name: 'Hôpital Général de Yaoundé', city: 'Yaoundé',
    lat: 3.8520, lon: 11.5100,
    departments: ['Médecine Générale', 'Orthopédie', 'Neurologie', 'Réanimation', 'Urgences', 'Cardiologie', 'Gastroentérologie', 'Néphrologie']
  },
  { 
    id: 'gyneco', name: 'Hôpital Gynéco-Obstétrique Yaoundé', city: 'Yaoundé',
    lat: 3.8550, lon: 11.5080,
    departments: ['Gynécologie', 'Maternité', 'Pédiatrie', 'Urgences']
  },
  { 
    id: 'general-douala', name: 'Hôpital Général de Douala', city: 'Douala',
    lat: 4.0511, lon: 9.7679,
    departments: ['Médecine Générale', 'Chirurgie', 'Cardiologie', 'Gastroentérologie', 'Neurologie', 'Pédiatrie', 'Urgences', 'Oncologie']
  },
  { 
    id: 'laquintinie', name: 'Hôpital Laquintinie Douala', city: 'Douala',
    lat: 4.0435, lon: 9.6966,
    departments: ['Médecine Générale', 'Pédiatrie', 'Gynécologie', 'Maternité', 'Chirurgie', 'Urgences', 'Ophtalmologie', 'Dermatologie']
  },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const SymptomChecker: React.FC = () => {
  const { darkMode, language } = useApp();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState<typeof symptomDatabase>([]);
  const [checked, setChecked] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lon: number} | null>(null);
  const [recommendedHospitals, setRecommendedHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUserLocation({ lat: 3.8480, lon: 11.5021 }) // Yaoundé fallback
      );
    }
  }, []);

  const checkSymptoms = () => {
    setLoading(true);
    const input = symptoms.toLowerCase();
    const matches = symptomDatabase.filter(s => input.includes(s.symptom));
    const unique = matches.filter((v, i, a) => a.findIndex(t => t.department === v.department) === i);
    const finalResults = unique.length ? unique : [{ symptom: '', department: 'Médecine Générale', severity: 'mild' }];
    setResults(finalResults);
    
    // Find hospitals with matching departments
    if (userLocation) {
      const departments = finalResults.map(r => r.department);
      const matchingHospitals = hospitalsData
        .filter(h => h.departments.some(d => departments.includes(d)))
        .map(h => ({
          ...h,
          distance: calculateDistance(userLocation.lat, userLocation.lon, h.lat, h.lon),
          drivingTime: Math.round((calculateDistance(userLocation.lat, userLocation.lon, h.lat, h.lon) / 30) * 60),
          matchingDepts: h.departments.filter(d => departments.includes(d))
        }))
        .sort((a, b) => a.distance - b.distance);
      
      setRecommendedHospitals(matchingHospitals);
    }
    
    setChecked(true);
    setLoading(false);
  };

  const getSeverityColor = (sev: string) => {
    if (sev === 'urgent') return 'bg-red-100 text-red-700 border-red-300';
    if (sev === 'moderate') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getSeverityIcon = (sev: string) => {
    if (sev === 'urgent') return <AlertCircle className="text-red-500" size={20} />;
    if (sev === 'moderate') return <AlertTriangle className="text-yellow-500" size={20} />;
    return <CheckCircle className="text-green-500" size={20} />;
  };

  const getSeverityLabel = (sev: string) => {
    const labels: Record<string, { fr: string; en: string }> = {
      urgent: { fr: 'Urgent', en: 'Urgent' },
      moderate: { fr: 'Modéré', en: 'Moderate' },
      mild: { fr: 'Léger', en: 'Mild' }
    };
    return labels[sev]?.[language === 'fr' ? 'fr' : 'en'] || sev;
  };

  const handleNavigate = (h: any) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`, '_blank');
  };

  const handleBookAppointment = (h: any) => {
    navigate('/book', { state: { hospitalId: h.id, hospitalName: h.name } });
  };

  return (
    <div className={`min-h-screen pt-20 pb-24 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} data-testid="symptom-checker">
      {/* Symptom Input */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-6`}>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {language === 'fr' ? 'Vérificateur de Symptômes' : 'Symptom Checker'}
        </h2>
        <p className={`mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {language === 'fr' 
            ? 'Décrivez vos symptômes pour trouver le département médical approprié et les hôpitaux les plus proches.' 
            : 'Describe your symptoms to find the appropriate medical department and nearest hospitals.'}
        </p>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          data-testid="symptoms-input"
          placeholder={language === 'fr' 
            ? 'Ex: J\'ai mal à la tête et de la fièvre depuis 2 jours...' 
            : 'Ex: I have headache and fever for 2 days...'}
          className={`w-full p-4 border rounded-xl h-32 resize-none ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'
          }`}
        />
        <button
          onClick={checkSymptoms}
          disabled={!symptoms.trim() || loading}
          data-testid="analyze-symptoms-btn"
          className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Search size={20} />
          )}
          {language === 'fr' ? 'Analyser mes Symptômes' : 'Analyze my Symptoms'}
        </button>
      </div>

      {checked && (
        <>
          {/* Department Results */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? 'Départements Recommandés' : 'Recommended Departments'}
            </h3>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className={`p-4 rounded-xl border ${getSeverityColor(r.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(r.severity)}
                      <div>
                        <p className="font-semibold">{r.department}</p>
                        <p className="text-sm">{getSeverityLabel(r.severity)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {results.some(r => r.severity === 'urgent') && (
              <button
                onClick={() => navigate('/emergency')}
                data-testid="emergency-access-btn"
                className="w-full mt-4 bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition"
              >
                <AlertCircle size={20} />
                {language === 'fr' ? 'Accès Urgence Immédiat' : 'Immediate Emergency Access'}
              </button>
            )}
          </div>

          {/* Recommended Hospitals */}
          {recommendedHospitals.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {language === 'fr' ? 'Hôpitaux Recommandés à Proximité' : 'Recommended Nearby Hospitals'}
              </h3>
              <div className="space-y-3">
                {recommendedHospitals.slice(0, 5).map((h, i) => (
                  <div 
                    key={h.id} 
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-md ${i === 0 ? 'ring-2 ring-green-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {h.name}
                          </h4>
                          {i === 0 && <span className="text-green-500 text-xs">✓ Plus proche</span>}
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{h.city}</p>
                      </div>
                    </div>

                    {/* Matching Departments */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {h.matchingDepts.map((dept: string, j: number) => (
                        <span key={j} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {dept}
                        </span>
                      ))}
                    </div>

                    {/* Distance Info */}
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        <MapPin size={14} /> {h.distance.toFixed(1)} km
                      </span>
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock size={14} /> ~{h.drivingTime} min
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBookAppointment(h)}
                        data-testid={`book-hospital-${i}-btn`}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:bg-green-700 transition"
                      >
                        <Stethoscope size={14} /> {language === 'fr' ? 'Réserver RDV' : 'Book Appointment'}
                      </button>
                      <button
                        onClick={() => handleNavigate(h)}
                        data-testid={`navigate-hospital-${i}-btn`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition ${
                          darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <Navigation size={14} /> {language === 'fr' ? 'Y aller' : 'Navigate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
              <strong>⚠️ {language === 'fr' ? 'Avertissement' : 'Disclaimer'}:</strong> {language === 'fr' 
                ? 'Cette analyse est informative et ne remplace pas un diagnostic médical professionnel. Consultez toujours un médecin pour un avis médical qualifié.' 
                : 'This analysis is informational and does not replace professional medical diagnosis. Always consult a doctor for qualified medical advice.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SymptomChecker;
