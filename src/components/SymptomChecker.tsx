import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Search, AlertCircle, CheckCircle, AlertTriangle, MapPin, Clock, Stethoscope, Navigation, Loader2, ChevronRight, Building2, Phone, Calendar } from 'lucide-react';
import { healthFacilities, HealthFacility } from '../data/healthFacilities';
import { PRICING, formatPrice } from '../config/pricing';

// Base de données symptômes avec recommandations
const symptomDatabase = [
  // Français
  { symptom: 'douleur poitrine', department: 'Cardiologie', severity: 'urgent', advice: 'Consultez immédiatement les urgences' },
  { symptom: 'coeur', department: 'Cardiologie', severity: 'urgent', advice: 'Consultez immédiatement les urgences' },
  { symptom: 'palpitation', department: 'Cardiologie', severity: 'moderate', advice: 'Prenez rendez-vous rapidement' },
  { symptom: 'mal de tête', department: 'Neurologie', severity: 'mild', advice: 'Repos et hydratation recommandés' },
  { symptom: 'migraine', department: 'Neurologie', severity: 'moderate', advice: 'Consultez si persistant' },
  { symptom: 'vertige', department: 'Neurologie', severity: 'moderate', advice: 'Évitez de conduire' },
  { symptom: 'convulsion', department: 'Neurologie', severity: 'urgent', advice: 'Urgence médicale' },
  { symptom: 'fièvre', department: 'Médecine Générale', severity: 'mild', advice: 'Hydratation et repos' },
  { symptom: 'toux', department: 'Pneumologie', severity: 'mild', advice: 'Consultez si persistant >7 jours' },
  { symptom: 'grippe', department: 'Médecine Générale', severity: 'mild', advice: 'Repos à domicile' },
  { symptom: 'rhume', department: 'Médecine Générale', severity: 'mild', advice: 'Repos et hydratation' },
  { symptom: 'cassé', department: 'Orthopédie', severity: 'urgent', advice: 'Immobilisez et consultez' },
  { symptom: 'fracture', department: 'Orthopédie', severity: 'urgent', advice: 'Ne bougez pas le membre' },
  { symptom: 'os', department: 'Orthopédie', severity: 'moderate', advice: 'Radiographie recommandée' },
  { symptom: 'enfant', department: 'Pédiatrie', severity: 'moderate', advice: 'Consultez un pédiatre' },
  { symptom: 'bébé', department: 'Pédiatrie', severity: 'moderate', advice: 'Consultez un pédiatre' },
  { symptom: 'nourrisson', department: 'Pédiatrie', severity: 'moderate', advice: 'Consultez rapidement' },
  { symptom: 'enceinte', department: 'Gynécologie', severity: 'moderate', advice: 'Suivi prénatal important' },
  { symptom: 'grossesse', department: 'Gynécologie', severity: 'moderate', advice: 'Consultez votre gynécologue' },
  { symptom: 'accouchement', department: 'Maternité', severity: 'urgent', advice: 'Allez à la maternité' },
  { symptom: 'règles', department: 'Gynécologie', severity: 'mild', advice: 'Consultez si anormal' },
  { symptom: 'peau', department: 'Dermatologie', severity: 'mild', advice: 'Évitez de gratter' },
  { symptom: 'bouton', department: 'Dermatologie', severity: 'mild', advice: 'Ne pas percer' },
  { symptom: 'éruption', department: 'Dermatologie', severity: 'moderate', advice: 'Consultez rapidement' },
  { symptom: 'oeil', department: 'Ophtalmologie', severity: 'moderate', advice: 'Évitez les écrans' },
  { symptom: 'yeux', department: 'Ophtalmologie', severity: 'moderate', advice: 'Consultez un ophtalmologue' },
  { symptom: 'vision', department: 'Ophtalmologie', severity: 'moderate', advice: 'Examen de la vue recommandé' },
  { symptom: 'estomac', department: 'Gastroentérologie', severity: 'moderate', advice: 'Régime alimentaire léger' },
  { symptom: 'ventre', department: 'Gastroentérologie', severity: 'moderate', advice: 'Évitez les aliments gras' },
  { symptom: 'digestion', department: 'Gastroentérologie', severity: 'mild', advice: 'Mangez léger' },
  { symptom: 'diarrhée', department: 'Gastroentérologie', severity: 'moderate', advice: 'Hydratez-vous beaucoup' },
  { symptom: 'vomissement', department: 'Gastroentérologie', severity: 'moderate', advice: 'Réhydratation orale' },
  { symptom: 'respiration', department: 'Urgences', severity: 'urgent', advice: 'Appelez le 222 immédiatement' },
  { symptom: 'souffle', department: 'Pneumologie', severity: 'moderate', advice: 'Consultez rapidement' },
  { symptom: 'asthme', department: 'Pneumologie', severity: 'moderate', advice: 'Utilisez votre inhalateur' },
  { symptom: 'accident', department: 'Urgences', severity: 'urgent', advice: 'Appelez le 222' },
  { symptom: 'blessure', department: 'Urgences', severity: 'urgent', advice: 'Nettoyez et compressez' },
  { symptom: 'sang', department: 'Urgences', severity: 'urgent', advice: 'Compressez la plaie' },
  { symptom: 'dent', department: 'Dentaire', severity: 'moderate', advice: 'Évitez le chaud/froid' },
  { symptom: 'oreille', department: 'ORL', severity: 'moderate', advice: 'Ne mettez rien dedans' },
  { symptom: 'gorge', department: 'ORL', severity: 'mild', advice: 'Gargarisme eau salée' },
  { symptom: 'nez', department: 'ORL', severity: 'mild', advice: 'Lavage nasal recommandé' },
  { symptom: 'urine', department: 'Néphrologie', severity: 'moderate', advice: 'Buvez beaucoup d\'eau' },
  { symptom: 'rein', department: 'Néphrologie', severity: 'moderate', advice: 'Consultez rapidement' },
  { symptom: 'diabète', department: 'Endocrinologie', severity: 'moderate', advice: 'Contrôlez votre glycémie' },
  { symptom: 'sucre', department: 'Endocrinologie', severity: 'moderate', advice: 'Régime sans sucre' },
  { symptom: 'fatigue', department: 'Médecine Générale', severity: 'mild', advice: 'Repos et vitamines' },
  { symptom: 'insomnie', department: 'Neurologie', severity: 'mild', advice: 'Évitez les écrans le soir' },
  { symptom: 'stress', department: 'Médecine Générale', severity: 'mild', advice: 'Relaxation recommandée' },
  { symptom: 'anxiété', department: 'Psychiatrie', severity: 'moderate', advice: 'Parlez à un professionnel' },
  { symptom: 'dépression', department: 'Psychiatrie', severity: 'moderate', advice: 'Consultez un spécialiste' },
  // English
  { symptom: 'chest pain', department: 'Cardiologie', severity: 'urgent', advice: 'Seek emergency care' },
  { symptom: 'heart', department: 'Cardiologie', severity: 'urgent', advice: 'Emergency' },
  { symptom: 'headache', department: 'Neurologie', severity: 'mild', advice: 'Rest and hydrate' },
  { symptom: 'fever', department: 'Médecine Générale', severity: 'mild', advice: 'Rest and fluids' },
  { symptom: 'cough', department: 'Pneumologie', severity: 'mild', advice: 'See doctor if >7 days' },
  { symptom: 'broken', department: 'Orthopédie', severity: 'urgent', advice: 'Immobilize and consult' },
  { symptom: 'child', department: 'Pédiatrie', severity: 'moderate', advice: 'See a pediatrician' },
  { symptom: 'pregnant', department: 'Gynécologie', severity: 'moderate', advice: 'Prenatal care important' },
  { symptom: 'skin', department: 'Dermatologie', severity: 'mild', advice: 'Avoid scratching' },
  { symptom: 'eye', department: 'Ophtalmologie', severity: 'moderate', advice: 'Rest your eyes' },
  { symptom: 'stomach', department: 'Gastroentérologie', severity: 'moderate', advice: 'Light diet' },
  { symptom: 'breathing', department: 'Urgences', severity: 'urgent', advice: 'Call 222 immediately' },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

interface DiagnosisResult {
  department: string;
  severity: 'urgent' | 'moderate' | 'mild';
  advice: string;
  matchedSymptoms: string[];
}

const SymptomChecker: React.FC = () => {
  const { darkMode, language } = useApp();
  const navigate = useNavigate();
  
  // States
  const [symptoms, setSymptoms] = useState('');
  const [step, setStep] = useState<'input' | 'diagnosis' | 'hospitals' | 'booking'>('input');
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [filteredHospitals, setFilteredHospitals] = useState<(HealthFacility & { distance: number; drivingTime: number })[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HealthFacility | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lon: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocationLoading(false);
        },
        () => {
          // Yaoundé fallback
          setUserLocation({ lat: 3.8480, lon: 11.5021 });
          setLocationLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setUserLocation({ lat: 3.8480, lon: 11.5021 });
      setLocationLoading(false);
    }
  }, []);

  // ÉTAPE 1: Analyser les symptômes et générer le diagnostic
  const analyzeSymptoms = () => {
    if (!symptoms.trim()) return;
    
    setLoading(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const input = symptoms.toLowerCase();
      const matches = symptomDatabase.filter(s => input.includes(s.symptom));
      
      // Group by department and get highest severity
      const departmentMap = new Map<string, DiagnosisResult>();
      
      matches.forEach(match => {
        const existing = departmentMap.get(match.department);
        if (!existing) {
          departmentMap.set(match.department, {
            department: match.department,
            severity: match.severity as 'urgent' | 'moderate' | 'mild',
            advice: match.advice,
            matchedSymptoms: [match.symptom]
          });
        } else {
          // Keep highest severity
          const severityOrder = { urgent: 3, moderate: 2, mild: 1 };
          if (severityOrder[match.severity as keyof typeof severityOrder] > severityOrder[existing.severity]) {
            existing.severity = match.severity as 'urgent' | 'moderate' | 'mild';
            existing.advice = match.advice;
          }
          existing.matchedSymptoms.push(match.symptom);
        }
      });
      
      // If no matches, default to general medicine
      if (departmentMap.size === 0) {
        departmentMap.set('Médecine Générale', {
          department: 'Médecine Générale',
          severity: 'mild',
          advice: language === 'fr' ? 'Consultez un médecin généraliste' : 'See a general practitioner',
          matchedSymptoms: []
        });
      }
      
      // Sort by severity (urgent first)
      const results = Array.from(departmentMap.values()).sort((a, b) => {
        const order = { urgent: 0, moderate: 1, mild: 2 };
        return order[a.severity] - order[b.severity];
      });
      
      setDiagnosis(results);
      setStep('diagnosis');
      setLoading(false);
    }, 1500);
  };

  // ÉTAPE 2: Sélectionner un département et filtrer les hôpitaux
  const selectDepartment = (dept: string) => {
    setSelectedDepartment(dept);
    
    if (!userLocation) return;
    
    // Filter hospitals that have this department
    const hospitalsWithDept = healthFacilities
      .filter(h => h.departments.includes(dept) || h.departments.includes('Médecine Générale'))
      .map(h => ({
        ...h,
        distance: calculateDistance(userLocation.lat, userLocation.lon, h.lat, h.lon),
        drivingTime: Math.round((calculateDistance(userLocation.lat, userLocation.lon, h.lat, h.lon) / 30) * 60)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Top 10 nearest
    
    setFilteredHospitals(hospitalsWithDept);
    setStep('hospitals');
  };

  // ÉTAPE 3: Sélectionner un hôpital et réserver automatiquement
  const selectHospitalAndBook = (hospital: HealthFacility & { distance: number }) => {
    setSelectedHospital(hospital);
    
    // Navigate to booking with pre-selected data
    // Le médecin sera attribué automatiquement par le système
    navigate('/book', { 
      state: { 
        hospitalId: hospital.id, 
        hospitalName: hospital.name,
        department: selectedDepartment,
        autoAssignDoctor: true, // Flag pour attribution automatique
        fromSymptomChecker: true
      } 
    });
  };

  const getSeverityColor = (sev: string) => {
    if (sev === 'urgent') return 'bg-red-100 text-red-700 border-red-300';
    if (sev === 'moderate') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getSeverityBg = (sev: string) => {
    if (sev === 'urgent') return darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200';
    if (sev === 'moderate') return darkMode ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200';
    return darkMode ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200';
  };

  const getSeverityIcon = (sev: string) => {
    if (sev === 'urgent') return <AlertCircle className="text-red-500" size={24} />;
    if (sev === 'moderate') return <AlertTriangle className="text-yellow-500" size={24} />;
    return <CheckCircle className="text-green-500" size={24} />;
  };

  const handleNavigate = (h: any) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // Reset to start
  const resetChecker = () => {
    setSymptoms('');
    setDiagnosis([]);
    setSelectedDepartment(null);
    setFilteredHospitals([]);
    setSelectedHospital(null);
    setStep('input');
  };

  return (
    <div className={`min-h-screen pt-20 pb-24 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} data-testid="symptom-checker">
      
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex-1 h-2 rounded-full ${step === 'input' || step === 'diagnosis' || step === 'hospitals' ? 'bg-green-600' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className={`flex-1 h-2 rounded-full ${step === 'diagnosis' || step === 'hospitals' ? 'bg-green-600' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className={`flex-1 h-2 rounded-full ${step === 'hospitals' ? 'bg-green-600' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
      </div>

      {/* ÉTAPE 1: Saisie des symptômes */}
      {step === 'input' && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Stethoscope className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {language === 'fr' ? 'Décrivez vos Symptômes' : 'Describe your Symptoms'}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'fr' ? 'Notre IA analysera et vous orientera' : 'Our AI will analyze and guide you'}
              </p>
            </div>
          </div>

          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            data-testid="symptoms-input"
            placeholder={language === 'fr' 
              ? 'Ex: J\'ai mal à la tête et de la fièvre depuis 2 jours, avec des nausées...' 
              : 'Ex: I have headache and fever for 2 days, with nausea...'}
            className={`w-full p-4 border rounded-xl h-36 resize-none ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'
            }`}
          />
          
          {/* Quick symptom suggestions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {['fièvre', 'toux', 'mal de tête', 'fatigue', 'douleur ventre'].map(s => (
              <button
                key={s}
                onClick={() => setSymptoms(prev => prev ? `${prev}, ${s}` : s)}
                className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                + {s}
              </button>
            ))}
          </div>

          <button
            onClick={analyzeSymptoms}
            disabled={!symptoms.trim() || loading || locationLoading}
            data-testid="analyze-symptoms-btn"
            className="w-full mt-6 bg-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {language === 'fr' ? 'Analyse en cours...' : 'Analyzing...'}
              </>
            ) : locationLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {language === 'fr' ? 'Localisation...' : 'Getting location...'}
              </>
            ) : (
              <>
                <Search size={20} />
                {language === 'fr' ? 'Analyser mes Symptômes' : 'Analyze my Symptoms'}
              </>
            )}
          </button>
        </div>
      )}

      {/* ÉTAPE 2: Résultat du diagnostic - Départements cliquables */}
      {step === 'diagnosis' && (
        <div className="space-y-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? '🔍 Diagnostic IA' : '🔍 AI Diagnosis'}
            </h2>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'fr' 
                ? 'Cliquez sur un département pour voir les hôpitaux disponibles' 
                : 'Click on a department to see available hospitals'}
            </p>
          </div>

          {diagnosis.map((result, i) => (
            <button
              key={i}
              onClick={() => selectDepartment(result.department)}
              data-testid={`department-${result.department}`}
              className={`w-full ${getSeverityBg(result.severity)} border rounded-2xl p-5 text-left transition hover:shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getSeverityIcon(result.severity)}
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {result.department}
                    </h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getSeverityColor(result.severity)}`}>
                      {result.severity === 'urgent' ? (language === 'fr' ? 'URGENT' : 'URGENT') :
                       result.severity === 'moderate' ? (language === 'fr' ? 'Modéré' : 'Moderate') :
                       (language === 'fr' ? 'Léger' : 'Mild')}
                    </span>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      💡 {result.advice}
                    </p>
                  </div>
                </div>
                <ChevronRight className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={24} />
              </div>
            </button>
          ))}

          {/* Emergency warning if urgent */}
          {diagnosis.some(d => d.severity === 'urgent') && (
            <div className="bg-red-600 text-white rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle size={24} />
              <div>
                <p className="font-bold">{language === 'fr' ? 'Urgence détectée!' : 'Emergency detected!'}</p>
                <p className="text-sm">{language === 'fr' ? 'Appelez le 222 ou rendez-vous aux urgences' : 'Call 222 or go to emergency'}</p>
              </div>
              <button
                onClick={() => window.location.href = 'tel:222'}
                className="ml-auto bg-white text-red-600 px-4 py-2 rounded-lg font-bold"
              >
                222
              </button>
            </div>
          )}

          <button
            onClick={resetChecker}
            className={`w-full py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
          >
            {language === 'fr' ? '← Modifier mes symptômes' : '← Edit my symptoms'}
          </button>
        </div>
      )}

      {/* ÉTAPE 3: Hôpitaux filtrés par département */}
      {step === 'hospitals' && selectedDepartment && (
        <div className="space-y-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'fr' ? 'Département sélectionné' : 'Selected department'}
                </p>
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  🏥 {selectedDepartment}
                </h2>
              </div>
              <button
                onClick={() => setStep('diagnosis')}
                className="text-green-600 text-sm font-medium"
              >
                {language === 'fr' ? 'Changer' : 'Change'}
              </button>
            </div>
          </div>

          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' 
              ? `${filteredHospitals.length} établissements trouvés` 
              : `${filteredHospitals.length} facilities found`}
          </h3>

          {filteredHospitals.map((hospital) => (
            <div
              key={hospital.id}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-4`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  hospital.type === 'hospital' ? 'bg-green-100' : 
                  hospital.type === 'clinic' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  <Building2 className={
                    hospital.type === 'hospital' ? 'text-green-600' : 
                    hospital.type === 'clinic' ? 'text-blue-600' : 'text-yellow-600'
                  } size={24} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {hospital.name}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {hospital.district || hospital.city}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <MapPin size={14} /> {hospital.distance.toFixed(1)} km
                    </span>
                    <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock size={14} /> ~{hospital.drivingTime} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarifs */}
              <div className={`mt-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {language === 'fr' ? 'Tarif consultation' : 'Consultation fee'}
                </p>
                <p className="text-green-600 font-bold">
                  {formatPrice(PRICING.consultation.general)} - {formatPrice(PRICING.consultation.specialist)} FCFA
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                {hospital.phone && (
                  <button
                    onClick={() => handleCall(hospital.phone!)}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <Phone size={16} /> Appeler
                  </button>
                )}
                <button
                  onClick={() => handleNavigate(hospital)}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Navigation size={16} /> Y aller
                </button>
                <button
                  onClick={() => selectHospitalAndBook(hospital)}
                  data-testid={`book-${hospital.id}`}
                  className="flex-1 py-2 rounded-lg bg-green-600 text-white flex items-center justify-center gap-1 text-sm font-bold hover:bg-green-700 transition"
                >
                  <Calendar size={16} /> RDV
                </button>
              </div>
            </div>
          ))}

          {filteredHospitals.length === 0 && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 text-center`}>
              <Building2 className="mx-auto mb-4 text-gray-400" size={48} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {language === 'fr' 
                  ? 'Aucun établissement trouvé pour ce département' 
                  : 'No facility found for this department'}
              </p>
            </div>
          )}

          <button
            onClick={resetChecker}
            className={`w-full py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
          >
            {language === 'fr' ? '← Nouvelle recherche' : '← New search'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
