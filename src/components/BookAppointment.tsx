import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Calendar, Clock, User, Check, Users, ChevronLeft, Building2, Zap, AlertCircle, Loader2, Home, Info } from 'lucide-react';
import { createBooking, getBookedSlots } from '../services/bookingService';
import { useToast } from '../hooks/use-toast';
import { PRICING, calculateSurcharges, formatPrice, priceLabels, getConsultationPrice } from '../config/pricing';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  consultationType: 'general' | 'specialist' | 'professor';
  consultationDays: string[];
  image: string;
}

const hospitals = [
  { id: 'jamot', name: 'Hôpital Jamot Yaoundé', city: 'Yaoundé', address: 'Yaoundé, Cameroon', phone: '+237 222 23 45 67' },
  { id: 'central', name: 'Hôpital Central de Yaoundé', city: 'Yaoundé', address: 'Avenue Kennedy, Yaoundé', phone: '+237 222 23 10 20' },
  { id: 'general-yaounde', name: 'Hôpital Général de Yaoundé', city: 'Yaoundé', address: 'Yaoundé Centre', phone: '+237 222 23 20 30' },
  { id: 'general-douala', name: 'Hôpital Général de Douala', city: 'Douala', address: 'Douala, Cameroon', phone: '+237 233 42 10 10' },
  { id: 'laquintinie', name: 'Hôpital Laquintinie Douala', city: 'Douala', address: 'Douala, Cameroon', phone: '+237 233 42 45 67' },
];

// Doctors with consultation types based on centralized pricing
const doctorsByHospital: Record<string, Doctor[]> = {
  'jamot': [
    { id: 'pefura', name: 'Prof. Pefura Yone Eric Walter', specialty: 'Pneumologie', consultationType: 'professor', consultationDays: ['Tuesday', 'Thursday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206177040_fc6db82d.png' },
    { id: 'poka', name: 'Dr. Poka Mayap Virginie', specialty: 'Pneumologie', consultationType: 'specialist', consultationDays: ['Monday', 'Tuesday', 'Thursday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206163628_c88b7726.jpg' },
    { id: 'ekoua', name: 'Dr. Daniel Ekoua', specialty: 'Cardiologie', consultationType: 'specialist', consultationDays: ['Monday', 'Thursday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206169084_63a4d34d.png' },
    { id: 'tchokonte', name: 'Dr. Tchokonté Nana', specialty: 'Neurologie', consultationType: 'specialist', consultationDays: ['Monday', 'Wednesday', 'Friday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206178236_5d3922a1.png' },
  ],
  'central': [
    { id: 'general-central', name: 'Dr. Médecin Généraliste', specialty: 'Médecine Générale', consultationType: 'general', consultationDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206177040_fc6db82d.png' },
    { id: 'specialist-central', name: 'Dr. Chirurgien', specialty: 'Chirurgie', consultationType: 'specialist', consultationDays: ['Tuesday', 'Thursday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206163628_c88b7726.jpg' },
  ],
  'general-yaounde': [
    { id: 'general-gy', name: 'Dr. Médecin Généraliste', specialty: 'Médecine Générale', consultationType: 'general', consultationDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206163628_c88b7726.jpg' },
    { id: 'neuro-gy', name: 'Dr. Neurologue', specialty: 'Neurologie', consultationType: 'specialist', consultationDays: ['Monday', 'Wednesday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206169084_63a4d34d.png' },
  ],
  'general-douala': [
    { id: 'general-gd', name: 'Dr. Médecin Généraliste', specialty: 'Médecine Générale', consultationType: 'general', consultationDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206169084_63a4d34d.png' },
    { id: 'cardio-gd', name: 'Dr. Cardiologue', specialty: 'Cardiologie', consultationType: 'specialist', consultationDays: ['Tuesday', 'Friday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206178236_5d3922a1.png' },
  ],
  'laquintinie': [
    { id: 'general-laq', name: 'Dr. Médecin Généraliste', specialty: 'Médecine Générale', consultationType: 'general', consultationDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206178236_5d3922a1.png' },
    { id: 'pediatre-laq', name: 'Dr. Pédiatre', specialty: 'Pédiatrie', consultationType: 'specialist', consultationDays: ['Monday', 'Wednesday', 'Friday'], image: 'https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1765206163628_c88b7726.jpg' },
  ],
};

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

const dayNames: Record<string, string> = {
  'Monday': 'Lundi', 'Tuesday': 'Mardi', 'Wednesday': 'Mercredi',
  'Thursday': 'Jeudi', 'Friday': 'Vendredi', 'Saturday': 'Samedi', 'Sunday': 'Dimanche',
};

// Price breakdown component
const PriceBreakdown: React.FC<{
  basePrice: number;
  baseLabel: string;
  homeVisit: boolean;
  expressCare: boolean;
  nightSurcharge: number;
  holidaySurcharge: number;
  darkMode: boolean;
  language: string;
}> = ({ basePrice, baseLabel, homeVisit, expressCare, nightSurcharge, holidaySurcharge, darkMode, language }) => {
  const labels = priceLabels[language === 'fr' ? 'fr' : 'en'];
  const homeVisitFee = homeVisit ? PRICING.homeVisit : 0;
  const expressCareFee = expressCare ? PRICING.surcharges.expressCare : 0;
  const total = basePrice + homeVisitFee + expressCareFee + nightSurcharge + holidaySurcharge;

  return (
    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 space-y-2`}>
      <div className="flex items-center gap-2 mb-2">
        <Info size={16} className="text-green-600" />
        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {language === 'fr' ? 'Détail du prix' : 'Price Breakdown'}
        </span>
      </div>
      
      {/* Base consultation */}
      <div className="flex justify-between text-sm">
        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{baseLabel}</span>
        <span className={darkMode ? 'text-white' : 'text-gray-800'}>{formatPrice(basePrice)} FCFA</span>
      </div>
      
      {/* Home visit */}
      {homeVisit && (
        <div className="flex justify-between text-sm">
          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{labels.homeVisit}</span>
          <span className={darkMode ? 'text-white' : 'text-gray-800'}>+{formatPrice(PRICING.homeVisit)} FCFA</span>
        </div>
      )}
      
      {/* ExpressCare */}
      {expressCare && (
        <div className="flex justify-between text-sm">
          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{labels.expressCare}</span>
          <span className={darkMode ? 'text-white' : 'text-gray-800'}>+{formatPrice(PRICING.surcharges.expressCare)} FCFA</span>
        </div>
      )}
      
      {/* Night surcharge */}
      {nightSurcharge > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-orange-500">{labels.nightSurcharge}</span>
          <span className="text-orange-500">+{formatPrice(nightSurcharge)} FCFA</span>
        </div>
      )}
      
      {/* Holiday surcharge */}
      {holidaySurcharge > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-orange-500">{labels.holidaySurcharge}</span>
          <span className="text-orange-500">+{formatPrice(holidaySurcharge)} FCFA</span>
        </div>
      )}
      
      {/* Divider */}
      <div className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'} pt-2 mt-2`}>
        <div className="flex justify-between font-semibold">
          <span className={darkMode ? 'text-white' : 'text-gray-800'}>{labels.total}</span>
          <span className="text-green-600 text-lg">{formatPrice(total)} FCFA</span>
        </div>
      </div>
    </div>
  );
};

const BookAppointment: React.FC = () => {
  const { darkMode, language, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [consultationType, setConsultationType] = useState<'hospital' | 'home'>('hospital');
  const [selectedHospital, setSelectedHospital] = useState<typeof hospitals[0] | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingFor, setBookingFor] = useState<'self' | 'other'>('self');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientRelation, setPatientRelation] = useState('');
  const [expressCare, setExpressCare] = useState(false);
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  // Calculate surcharges based on selected date/time
  const surcharges = useMemo(() => {
    if (selectedDate && selectedTime) {
      return calculateSurcharges(selectedDate, selectedTime);
    }
    return { night: false, holiday: false, weekend: false, total: 0 };
  }, [selectedDate, selectedTime]);

  // Calculate total price
  const priceDetails = useMemo(() => {
    if (!selectedDoctor) return null;
    
    const basePrice = PRICING.consultation[selectedDoctor.consultationType];
    const homeVisitFee = consultationType === 'home' ? PRICING.homeVisit : 0;
    const expressCareFee = expressCare ? PRICING.surcharges.expressCare : 0;
    const nightFee = surcharges.night ? PRICING.surcharges.night : 0;
    const holidayFee = surcharges.holiday ? PRICING.surcharges.holiday : 0;
    
    return {
      basePrice,
      baseLabel: selectedDoctor.consultationType === 'general' 
        ? (language === 'fr' ? 'Consultation Générale' : 'General Consultation')
        : selectedDoctor.consultationType === 'specialist'
          ? (language === 'fr' ? 'Consultation Spécialiste' : 'Specialist Consultation')
          : (language === 'fr' ? 'Consultation Professeur' : 'Professor Consultation'),
      homeVisitFee,
      expressCareFee,
      nightFee,
      holidayFee,
      total: basePrice + homeVisitFee + expressCareFee + nightFee + holidayFee
    };
  }, [selectedDoctor, consultationType, expressCare, surcharges, language]);

  const totalSteps = consultationType === 'home' || bookingFor === 'other' ? 5 : 4;

  // Load booked slots when date changes
  useEffect(() => {
    const loadBookedSlots = async () => {
      if (selectedHospital && selectedDate) {
        const slots = await getBookedSlots(
          selectedHospital.id,
          selectedDoctor?.id || null,
          selectedDate
        );
        setBookedSlots(slots);
      }
    };
    loadBookedSlots();
  }, [selectedHospital, selectedDoctor, selectedDate]);

  const handleBook = async () => {
    if (!user || !selectedHospital || !selectedDoctor || !priceDetails) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez vous connecter' : 'Please log in first',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      const bookingId = await createBooking({
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName || 'User',
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        department: selectedDoctor.specialty,
        specialty: selectedDoctor.specialty,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        queueNumber: 0,
        fee: priceDetails.total,
        expressCare,
        patientName: bookingFor === 'other' ? patientName : (user.fullName || 'Vous'),
        patientRelation: bookingFor === 'other' ? patientRelation : undefined,
        patientAge: bookingFor === 'other' ? patientAge : undefined,
      });

      const details = {
        id: bookingId,
        hospital: selectedHospital.name,
        doctor: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        consultationType: selectedDoctor.consultationType,
        date: selectedDate,
        time: selectedTime,
        patientName: bookingFor === 'other' ? patientName : (language === 'fr' ? 'Vous' : 'You'),
        patientRelation: bookingFor === 'other' ? patientRelation : null,
        isHomeVisit: consultationType === 'home',
        expressCare,
        priceBreakdown: priceDetails,
        queueNumber: Math.floor(Math.random() * 10) + 1,
      };
      
      setAppointmentDetails(details);
      setBooked(true);
      
      toast({
        title: language === 'fr' ? 'Réservation créée!' : 'Booking created!',
        description: language === 'fr' ? 'Procédez au paiement pour confirmer' : 'Proceed to payment to confirm',
      });
    } catch (error: any) {
      if (error.message === 'SLOT_NOT_AVAILABLE') {
        toast({
          title: language === 'fr' ? 'Créneau indisponible' : 'Slot unavailable',
          description: language === 'fr' ? 'Ce créneau est déjà réservé.' : 'This slot is already booked.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: language === 'fr' ? 'Impossible de créer le rendez-vous' : 'Failed to create appointment',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDays = () => {
    if (!selectedDoctor) return [];
    const days: { date: string; dayName: string; available: boolean }[] = [];
    
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
      const isAvailable = selectedDoctor.consultationDays.includes(dayOfWeek);
      
      days.push({
        date: d.toISOString().split('T')[0],
        dayName: language === 'fr' ? dayNames[dayOfWeek] : dayOfWeek,
        available: isAvailable,
      });
    }
    return days;
  };

  const getDoctorsForHospital = () => {
    if (!selectedHospital) return [];
    return doctorsByHospital[selectedHospital.id] || [];
  };

  const isTimeSlotBooked = (time: string) => bookedSlots.includes(time);

  const getDoctorPrice = (doctor: Doctor) => PRICING.consultation[doctor.consultationType];

  // Booking confirmation screen
  if (booked && appointmentDetails) {
    const pb = appointmentDetails.priceBreakdown;
    
    return (
      <div className={`min-h-screen pt-20 pb-24 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-xl max-w-md mx-auto`}>
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-yellow-600" size={32} />
            </div>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? 'Réservation en attente' : 'Booking Pending'}
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'fr' ? 'Payez pour confirmer votre rendez-vous' : 'Pay to confirm your appointment'}
            </p>
          </div>

          {/* Appointment Details */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-4 space-y-2 text-sm`}>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{language === 'fr' ? 'Hôpital' : 'Hospital'}</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{appointmentDetails.hospital}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{language === 'fr' ? 'Médecin' : 'Doctor'}</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{appointmentDetails.doctor}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Date</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{appointmentDetails.date}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{language === 'fr' ? 'Heure' : 'Time'}</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{appointmentDetails.time}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{language === 'fr' ? 'File d\'attente' : 'Queue'}</span>
              <span className="font-bold text-green-600">#{appointmentDetails.queueNumber}</span>
            </div>
          </div>

          {/* Price Breakdown - CLEAR AND TRANSPARENT */}
          <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-50'} border ${darkMode ? 'border-green-800' : 'border-green-200'} rounded-xl p-4 mb-4`}>
            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? '💰 Détail du Tarif' : '💰 Price Details'}
            </h3>
            <div className="space-y-2 text-sm">
              {/* Base consultation */}
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{pb.baseLabel}</span>
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>{formatPrice(pb.basePrice)} FCFA</span>
              </div>
              
              {/* Home visit */}
              {appointmentDetails.isHomeVisit && (
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {language === 'fr' ? '🏠 Visite à Domicile' : '🏠 Home Visit'}
                  </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>+{formatPrice(pb.homeVisitFee)} FCFA</span>
                </div>
              )}
              
              {/* ExpressCare */}
              {appointmentDetails.expressCare && (
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {language === 'fr' ? '⚡ ExpressCare (Priorité)' : '⚡ ExpressCare (Priority)'}
                  </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>+{formatPrice(pb.expressCareFee)} FCFA</span>
                </div>
              )}
              
              {/* Night surcharge */}
              {pb.nightFee > 0 && (
                <div className="flex justify-between text-orange-500">
                  <span>{language === 'fr' ? '🌙 Supplément Nuit' : '🌙 Night Surcharge'}</span>
                  <span>+{formatPrice(pb.nightFee)} FCFA</span>
                </div>
              )}
              
              {/* Holiday surcharge */}
              {pb.holidayFee > 0 && (
                <div className="flex justify-between text-orange-500">
                  <span>{language === 'fr' ? '🎉 Supplément Jour Férié' : '🎉 Holiday Surcharge'}</span>
                  <span>+{formatPrice(pb.holidayFee)} FCFA</span>
                </div>
              )}
              
              {/* Total */}
              <div className={`border-t ${darkMode ? 'border-green-800' : 'border-green-200'} pt-3 mt-3`}>
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>TOTAL</span>
                  <span className="font-bold text-2xl text-green-600">{formatPrice(pb.total)} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Buttons */}
          <button 
            onClick={() => navigate('/payment', { 
              state: { 
                amount: pb.total,
                bookingId: appointmentDetails.id,
                bookingData: appointmentDetails 
              }
            })}
            data-testid="pay-now-btn"
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition mb-3"
          >
            {language === 'fr' ? '💳 Payer Maintenant' : '💳 Pay Now'} ({formatPrice(pb.total)} FCFA)
          </button>
          
          <button 
            onClick={() => navigate('/appointments')}
            data-testid="view-appointments-btn"
            className={`w-full py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
          >
            {language === 'fr' ? 'Voir Mes Rendez-vous' : 'View My Appointments'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 pb-24 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} data-testid="book-appointment-page">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full transition-colors ${step > i ? 'bg-green-600' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        ))}
      </div>

      {/* Back Button */}
      {step > 1 && (
        <button 
          onClick={() => setStep(step - 1)} 
          data-testid="back-btn"
          className="flex items-center gap-1 text-green-600 mb-4 hover:underline"
        >
          <ChevronLeft size={20} /> {language === 'fr' ? 'Retour' : 'Back'}
        </button>
      )}

      {/* Step 1: Consultation Type */}
      {step === 1 && (
        <>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Type de consultation' : 'Consultation Type'}
          </h2>
          
          {/* Pricing Info Card */}
          <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-50'} border ${darkMode ? 'border-green-800' : 'border-green-200'} rounded-xl p-4 mb-4`}>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? '💰 Nos Tarifs' : '💰 Our Prices'}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {language === 'fr' ? 'Généraliste:' : 'General:'} <strong>{formatPrice(PRICING.consultation.general)} FCFA</strong>
              </div>
              <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {language === 'fr' ? 'Spécialiste:' : 'Specialist:'} <strong>{formatPrice(PRICING.consultation.specialist)} FCFA</strong>
              </div>
              <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {language === 'fr' ? 'Professeur:' : 'Professor:'} <strong>{formatPrice(PRICING.consultation.professor)} FCFA</strong>
              </div>
              <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {language === 'fr' ? 'Visite domicile:' : 'Home visit:'} <strong>+{formatPrice(PRICING.homeVisit)} FCFA</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => { setConsultationType('hospital'); setStep(2); }}
              data-testid="hospital-consultation-btn"
              className={`w-full p-4 rounded-xl flex items-center gap-4 ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} shadow-md transition`}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="text-green-600" size={24} />
              </div>
              <div className="text-left flex-1">
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {language === 'fr' ? 'Consultation à l\'hôpital' : 'Hospital Consultation'}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'fr' ? 'Se rendre dans un établissement' : 'Visit a health facility'}
                </p>
              </div>
              <span className="text-green-600 font-semibold text-sm">
                {language === 'fr' ? 'Dès' : 'From'} {formatPrice(PRICING.consultation.general)}
              </span>
            </button>
            
            <button 
              onClick={() => { setConsultationType('home'); setStep(2); }}
              data-testid="home-consultation-btn"
              className={`w-full p-4 rounded-xl flex items-center gap-4 ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} shadow-md transition`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Home className="text-blue-600" size={24} />
              </div>
              <div className="text-left flex-1">
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {language === 'fr' ? 'Visite à domicile' : 'Home Visit'}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'fr' ? 'Le médecin vient chez vous' : 'Doctor comes to you'}
                </p>
              </div>
              <span className="text-blue-600 font-semibold text-sm">
                +{formatPrice(PRICING.homeVisit)} FCFA
              </span>
            </button>
          </div>
        </>
      )}

      {/* Step 2: Who is this for? */}
      {step === 2 && (
        <>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Pour qui est ce rendez-vous?' : 'Who is this appointment for?'}
          </h2>
          <div className="space-y-3">
            <button 
              onClick={() => { setBookingFor('self'); setStep(3); }}
              data-testid="booking-for-self-btn"
              className={`w-full p-4 rounded-xl flex items-center gap-4 ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} shadow-md transition`}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="text-green-600" size={24} />
              </div>
              <div className="text-left">
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {language === 'fr' ? 'Pour moi-même' : 'For myself'}
                </p>
              </div>
            </button>
            <button 
              onClick={() => { setBookingFor('other'); setStep(3); }}
              data-testid="booking-for-other-btn"
              className={`w-full p-4 rounded-xl flex items-center gap-4 ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} shadow-md transition`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="text-left">
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {language === 'fr' ? 'Pour quelqu\'un d\'autre' : 'For someone else'}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'fr' ? 'Enfant, parent, proche...' : 'Child, parent, relative...'}
                </p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Step 3: Patient Info (if other) OR Select Hospital */}
      {step === 3 && bookingFor === 'other' && (
        <>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Informations du patient' : 'Patient Information'}
          </h2>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-md space-y-4`}>
            <input 
              type="text" 
              value={patientName} 
              onChange={(e) => setPatientName(e.target.value)}
              data-testid="patient-name-input"
              placeholder={language === 'fr' ? 'Nom complet' : 'Full name'}
              className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 border-gray-200'} border`} 
            />
            <input 
              type="number" 
              value={patientAge} 
              onChange={(e) => setPatientAge(e.target.value)}
              data-testid="patient-age-input"
              placeholder={language === 'fr' ? 'Âge' : 'Age'}
              className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 border-gray-200'} border`} 
            />
            <select 
              value={patientRelation} 
              onChange={(e) => setPatientRelation(e.target.value)}
              data-testid="patient-relation-select"
              className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 border-gray-200'} border`}
            >
              <option value="">{language === 'fr' ? 'Relation...' : 'Relationship...'}</option>
              <option value="child">{language === 'fr' ? 'Enfant' : 'Child'}</option>
              <option value="parent">{language === 'fr' ? 'Parent' : 'Parent'}</option>
              <option value="spouse">{language === 'fr' ? 'Conjoint' : 'Spouse'}</option>
              <option value="other">{language === 'fr' ? 'Autre' : 'Other'}</option>
            </select>
            <button 
              onClick={() => setStep(4)} 
              disabled={!patientName || !patientAge}
              data-testid="continue-patient-btn"
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {language === 'fr' ? 'Continuer' : 'Continue'}
            </button>
          </div>
        </>
      )}

      {/* Step 3/4: Select Hospital */}
      {((step === 3 && bookingFor === 'self') || (step === 4 && bookingFor === 'other')) && (
        <>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Choisir un Établissement' : 'Choose a Facility'}
          </h2>
          <div className="space-y-3">
            {hospitals.map(hospital => (
              <button
                key={hospital.id}
                onClick={() => { setSelectedHospital(hospital); setStep(step + 1); }}
                data-testid={`hospital-${hospital.id}-btn`}
                className={`w-full p-4 rounded-xl flex items-center gap-4 ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} shadow-md text-left transition`}
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Building2 className="text-green-600" size={24} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{hospital.name}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{hospital.city}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 4/5: Select Doctor */}
      {((step === 4 && bookingFor === 'self') || (step === 5 && bookingFor === 'other')) && selectedHospital && (
        <>
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Choisir un Médecin' : 'Choose a Doctor'}
          </h2>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedHospital.name}</p>
          
          <div className="space-y-3">
            {getDoctorsForHospital().map(doc => (
              <div 
                key={doc.id} 
                onClick={() => { setSelectedDoctor(doc); setStep(step + 1); }}
                data-testid={`doctor-${doc.id}-btn`}
                className={`${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-xl p-4 flex gap-4 cursor-pointer shadow-md transition`}
              >
                <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{doc.name}</h3>
                  <p className="text-green-600 text-sm">{doc.specialty}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {doc.consultationDays.map(d => language === 'fr' ? dayNames[d] : d).join(', ')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      doc.consultationType === 'general' ? 'bg-green-100 text-green-700' :
                      doc.consultationType === 'specialist' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {doc.consultationType === 'general' ? (language === 'fr' ? 'Généraliste' : 'General') :
                       doc.consultationType === 'specialist' ? (language === 'fr' ? 'Spécialiste' : 'Specialist') :
                       'Professeur'}
                    </span>
                    <span className="text-green-600 font-bold">{formatPrice(getDoctorPrice(doc))} FCFA</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Step 5/6: Select Date and Time */}
      {((step === 5 && bookingFor === 'self') || (step === 6 && bookingFor === 'other')) && selectedDoctor && (
        <>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Choisir Date et Heure' : 'Choose Date and Time'}
          </h2>

          {/* ExpressCare Option */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-4 shadow-md`}>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Zap className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>ExpressCare</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'fr' ? 'Priorité (passer devant)' : 'Priority (skip queue)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 font-semibold text-sm">+{formatPrice(PRICING.surcharges.expressCare)}</span>
                <input
                  type="checkbox"
                  checked={expressCare}
                  onChange={(e) => setExpressCare(e.target.checked)}
                  data-testid="express-care-checkbox"
                  className="w-5 h-5 text-green-600 rounded"
                />
              </div>
            </label>
          </div>

          {/* Date Selection */}
          <p className={`mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Date:' : 'Date:'}
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {getAvailableDays().filter(d => d.available).slice(0, 6).map(day => (
              <button 
                key={day.date} 
                onClick={() => { setSelectedDate(day.date); setSelectedTime(''); }}
                data-testid={`date-${day.date}-btn`}
                className={`p-3 rounded-xl text-center transition ${
                  selectedDate === day.date 
                    ? 'bg-green-600 text-white' 
                    : darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'
                } shadow-md`}
              >
                <Calendar className={`mx-auto mb-1 ${selectedDate === day.date ? 'text-white' : 'text-green-600'}`} size={18} />
                <p className="text-xs font-medium">{day.dayName}</p>
                <p className="text-xs">{new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}</p>
              </button>
            ))}
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <>
              <p className={`mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {language === 'fr' ? 'Heure:' : 'Time:'}
              </p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {timeSlots.map(time => {
                  const isBooked = isTimeSlotBooked(time);
                  return (
                    <button 
                      key={time} 
                      onClick={() => !isBooked && setSelectedTime(time)}
                      disabled={isBooked}
                      data-testid={`time-${time}-btn`}
                      className={`p-2 rounded-lg text-sm font-medium transition ${
                        isBooked 
                          ? 'bg-red-100 text-red-400 cursor-not-allowed line-through' 
                          : selectedTime === time 
                            ? 'bg-green-600 text-white' 
                            : darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'
                      } shadow-md`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Price Breakdown (before confirm) */}
          {selectedTime && priceDetails && (
            <>
              <PriceBreakdown
                basePrice={priceDetails.basePrice}
                baseLabel={priceDetails.baseLabel}
                homeVisit={consultationType === 'home'}
                expressCare={expressCare}
                nightSurcharge={priceDetails.nightFee}
                holidaySurcharge={priceDetails.holidayFee}
                darkMode={darkMode}
                language={language}
              />

              <button 
                onClick={handleBook} 
                disabled={loading}
                data-testid="confirm-booking-btn"
                className="w-full mt-4 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={20} />{language === 'fr' ? 'Réservation...' : 'Booking...'}</>
                ) : (
                  <>{language === 'fr' ? 'Confirmer' : 'Confirm'} ({formatPrice(priceDetails.total)} FCFA)</>
                )}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BookAppointment;
