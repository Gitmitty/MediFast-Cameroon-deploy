import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Check, Loader2, AlertCircle, ChevronLeft, Zap, Home, Stethoscope, Phone } from 'lucide-react';
import { initiatePayment, checkPaymentStatus, detectProvider, isValidCameroonPhone, formatPhoneNumber, providerInfo, paymentPrices } from '../services/paymentService';
import { updateBookingStatus } from '../services/bookingService';

interface PaymentOption {
  id: string;
  name: { en: string; fr: string };
  price: number;
  description: { en: string; fr: string };
  icon: React.ReactNode;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'general',
    name: { en: 'General Consultation', fr: 'Consultation Générale' },
    price: paymentPrices.consultationGeneral,
    description: { en: 'Standard doctor visit', fr: 'Visite médicale standard' },
    icon: <Stethoscope size={20} />
  },
  {
    id: 'specialist',
    name: { en: 'Specialist Consultation', fr: 'Consultation Spécialiste' },
    price: paymentPrices.consultationSpecialist,
    description: { en: 'Cardiologist, Neurologist, Pneumologist', fr: 'Cardiologue, Neurologue, Pneumologue' },
    icon: <Stethoscope size={20} />
  },
  {
    id: 'professor',
    name: { en: 'Professor Consultation', fr: 'Consultation Professeur' },
    price: paymentPrices.consultationProfessor,
    description: { en: 'Senior specialist professor', fr: 'Professeur spécialiste senior' },
    icon: <Stethoscope size={20} />
  },
  {
    id: 'expresscare',
    name: { en: 'ExpressCare Priority', fr: 'ExpressCare Priorité' },
    price: paymentPrices.expressCare,
    description: { en: 'Skip the queue, priority service', fr: 'Passez devant, service prioritaire' },
    icon: <Zap size={20} />
  },
  {
    id: 'homevisit',
    name: { en: 'Home Doctor Visit', fr: 'Visite à Domicile' },
    price: paymentPrices.homeVisit,
    description: { en: 'Doctor comes to your home', fr: 'Le médecin vient chez vous' },
    icon: <Home size={20} />
  },
];

const PaymentPage: React.FC = () => {
  const { darkMode, language, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get booking data from navigation state
  const bookingData = location.state?.bookingData;
  const preSelectedAmount = location.state?.amount;
  const bookingId = location.state?.bookingId;
  
  const [provider, setProvider] = useState<'mtn' | 'orange' | null>(null);
  const [phone, setPhone] = useState(user?.phone?.replace('+237', '') || '');
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(
    preSelectedAmount ? paymentOptions.find(o => o.price === preSelectedAmount) || null : null
  );
  const [step, setStep] = useState<'options' | 'select' | 'input' | 'processing' | 'success' | 'error'>(
    preSelectedAmount ? 'select' : 'options'
  );
  const [transactionId, setTransactionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedProvider, setDetectedProvider] = useState<'mtn' | 'orange' | null>(null);

  // Auto-detect provider from phone number
  useEffect(() => {
    if (phone.length >= 3) {
      const detected = detectProvider(phone);
      setDetectedProvider(detected);
      if (detected && !provider) {
        setProvider(detected);
      }
    } else {
      setDetectedProvider(null);
    }
  }, [phone]);

  const processPayment = async () => {
    if (!phone || phone.length < 9 || !selectedOption) return;
    
    // Validate phone
    if (!isValidCameroonPhone(phone)) {
      setErrorMessage('Numéro invalide. Utilisez un numéro MTN (67/68/65X) ou Orange (69/65X/69X).');
      setStep('error');
      return;
    }

    setStep('processing');

    try {
      const result = await initiatePayment({
        amount: selectedOption.price,
        currency: 'XAF',
        phoneNumber: phone,
        provider: provider || detectedProvider || 'mtn',
        bookingId: bookingId || `BOOK-${Date.now()}`,
        description: selectedOption.name.fr
      });

      if (result.success) {
        setTransactionId(result.transactionId || '');
        
        // Poll for payment status
        let attempts = 0;
        const maxAttempts = 12; // 60 seconds max
        
        const pollStatus = setInterval(async () => {
          attempts++;
          const status = await checkPaymentStatus(result.transactionId!);
          
          if (status?.status === 'SUCCESS') {
            clearInterval(pollStatus);
            // Update booking status if we have a bookingId
            if (bookingId) {
              await updateBookingStatus(bookingId, 'confirmed');
            }
            setStep('success');
          } else if (status?.status === 'FAILED' || status?.status === 'CANCELLED') {
            clearInterval(pollStatus);
            setErrorMessage('Le paiement a échoué ou a été annulé.');
            setStep('error');
          } else if (attempts >= maxAttempts) {
            clearInterval(pollStatus);
            // For demo, auto-approve
            setStep('success');
          }
        }, 5000);

        // For demo purposes, auto-success after 3 seconds
        setTimeout(() => {
          clearInterval(pollStatus);
          setStep('success');
        }, 3000);
      } else {
        setErrorMessage(result.message);
        setStep('error');
      }
    } catch (err) {
      setErrorMessage('Erreur de connexion. Veuillez réessayer.');
      setStep('error');
    }
  };

  const getProviderStyle = (p: 'mtn' | 'orange') => {
    if (p === 'mtn') {
      return { bg: 'bg-yellow-400', text: 'text-black', border: 'border-yellow-500' };
    }
    return { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500' };
  };

  return (
    <div className={`min-h-screen pt-20 pb-24 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} data-testid="payment-page">
      {/* Header */}
      {step !== 'options' && step !== 'success' && (
        <button 
          onClick={() => setStep(step === 'input' ? 'select' : step === 'select' ? 'options' : 'options')}
          data-testid="back-btn"
          className="flex items-center gap-1 text-green-600 mb-4 hover:underline"
        >
          <ChevronLeft size={20} /> {language === 'fr' ? 'Retour' : 'Back'}
        </button>
      )}

      <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        {language === 'fr' ? 'Paiement Mobile Money' : 'Mobile Money Payment'}
      </h2>
      <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        MTN MoMo & Orange Money Cameroun 🇨🇲
      </p>

      {/* Step 1: Select Service */}
      {step === 'options' && (
        <div className="space-y-3">
          <p className={`mb-4 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Sélectionnez un service à payer' : 'Select a service to pay'}
          </p>
          {paymentOptions.map(option => (
            <button
              key={option.id}
              onClick={() => { setSelectedOption(option); setStep('select'); }}
              data-testid={`option-${option.id}`}
              className={`w-full ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-xl p-4 shadow-md flex items-center gap-4 text-left transition`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                option.id === 'expresscare' ? 'bg-yellow-100 text-yellow-600' :
                option.id === 'homevisit' ? 'bg-blue-100 text-blue-600' :
                option.id === 'professor' ? 'bg-purple-100 text-purple-600' :
                'bg-green-100 text-green-600'
              }`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {option.name[language === 'fr' ? 'fr' : 'en']}
                </h3>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {option.description[language === 'fr' ? 'fr' : 'en']}
                </p>
              </div>
              <span className="text-green-600 font-bold">{option.price.toLocaleString()} FCFA</span>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Select Payment Method */}
      {step === 'select' && selectedOption && (
        <div className="space-y-4">
          {/* Selected Service Summary */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-green-50'} rounded-xl p-4 mb-4`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'fr' ? 'Service sélectionné' : 'Selected service'}
            </p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {selectedOption.name[language === 'fr' ? 'fr' : 'en']}
            </p>
            <p className="text-green-600 font-bold text-2xl mt-1">{selectedOption.price.toLocaleString()} FCFA</p>
          </div>

          <p className={`mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Choisissez votre opérateur' : 'Choose your mobile operator'}
          </p>

          {/* MTN Option */}
          <button 
            onClick={() => { setProvider('mtn'); setStep('input'); }}
            data-testid="mtn-btn"
            className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 shadow-lg flex items-center gap-4 border-2 border-transparent hover:border-yellow-500 transition`}
          >
            <div className="w-14 h-14 bg-yellow-400 rounded-xl flex items-center justify-center">
              <span className="text-black font-bold text-lg">MTN</span>
            </div>
            <div className="text-left flex-1">
              <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>MTN Mobile Money</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>67, 68, 650-654, 680-689</p>
            </div>
            <span className="text-yellow-500">*126#</span>
          </button>

          {/* Orange Option */}
          <button 
            onClick={() => { setProvider('orange'); setStep('input'); }}
            data-testid="orange-btn"
            className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 shadow-lg flex items-center gap-4 border-2 border-transparent hover:border-orange-500 transition`}
          >
            <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">OM</span>
            </div>
            <div className="text-left flex-1">
              <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>Orange Money</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>69, 655-659, 690-699</p>
            </div>
            <span className="text-orange-500">#150#</span>
          </button>
        </div>
      )}

      {/* Step 3: Enter Phone Number */}
      {step === 'input' && selectedOption && provider && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
          {/* Provider Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 ${getProviderStyle(provider).bg} rounded-xl flex items-center justify-center`}>
              <span className={`font-bold ${getProviderStyle(provider).text}`}>
                {provider === 'orange' ? 'OM' : 'MTN'}
              </span>
            </div>
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {provider === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}
              </h3>
              <button 
                onClick={() => { setProvider(null); setStep('select'); }} 
                className="text-green-600 text-sm hover:underline"
              >
                {language === 'fr' ? 'Changer' : 'Change'}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedOption.name[language === 'fr' ? 'fr' : 'en']}
            </p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {selectedOption.price.toLocaleString()} FCFA
            </p>
          </div>

          {/* Phone Input */}
          <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            <Phone className="inline mr-2" size={16} />
            {language === 'fr' ? 'Numéro de téléphone' : 'Phone Number'}
          </label>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}>🇨🇲 +237</span>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="6XX XXX XXX"
              data-testid="phone-input"
              maxLength={9}
              className={`flex-1 p-3 rounded-lg border text-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} 
            />
          </div>

          {/* Auto-detected Provider */}
          {detectedProvider && detectedProvider !== provider && (
            <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} border border-yellow-400`}>
              <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                ⚠️ Ce numéro semble être {detectedProvider === 'mtn' ? 'MTN' : 'Orange'}. 
                <button 
                  onClick={() => setProvider(detectedProvider)} 
                  className="underline ml-1"
                >
                  Changer
                </button>
              </p>
            </div>
          )}

          <p className={`text-xs mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {language === 'fr' 
              ? '📱 Vous recevrez une demande de confirmation sur votre téléphone' 
              : '📱 You will receive a confirmation request on your phone'}
          </p>

          <button 
            onClick={processPayment} 
            disabled={phone.length < 9}
            data-testid="pay-btn"
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
              phone.length >= 9 
                ? `${getProviderStyle(provider).bg} ${getProviderStyle(provider).text} hover:opacity-90` 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {language === 'fr' ? 'Payer' : 'Pay'} {selectedOption.price.toLocaleString()} FCFA
          </button>
        </div>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg text-center`}>
          <Loader2 className="animate-spin mx-auto mb-4 text-green-600" size={48} />
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Traitement en cours...' : 'Processing...'}
          </h3>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'fr' ? '📱 Confirmez le paiement sur votre téléphone' : '📱 Confirm payment on your phone'}
          </p>
          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {provider === 'orange' ? 'Orange Money' : 'MTN MoMo'} - {formatPhoneNumber(phone)}
            </p>
          </div>
          <p className={`mt-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {language === 'fr' 
              ? 'Tapez votre code PIN quand demandé' 
              : 'Enter your PIN when prompted'}
          </p>
        </div>
      )}

      {/* Success */}
      {step === 'success' && selectedOption && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg text-center`}>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600" size={40} />
          </div>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Paiement Réussi!' : 'Payment Successful!'}
          </h3>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedOption.name[language === 'fr' ? 'fr' : 'en']}
          </p>
          <p className="text-green-600 font-bold text-2xl mt-2">{selectedOption.price.toLocaleString()} FCFA</p>
          
          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Transaction ID: {transactionId || `TXN-${Date.now()}`}
            </p>
          </div>

          <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'fr' 
              ? '✅ Vous recevrez un SMS de confirmation' 
              : '✅ You will receive an SMS confirmation'}
          </p>

          <button 
            onClick={() => navigate('/appointments')}
            data-testid="view-appointments-btn"
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            {language === 'fr' ? 'Voir Mes Rendez-vous' : 'View My Appointments'}
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className={`mt-3 w-full py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
          >
            {language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
          </button>
        </div>
      )}

      {/* Error */}
      {step === 'error' && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg text-center`}>
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'fr' ? 'Échec du Paiement' : 'Payment Failed'}
          </h3>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {errorMessage || (language === 'fr' ? 'Veuillez vérifier votre solde et réessayer' : 'Please check your balance and try again')}
          </p>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setStep('input')} 
              data-testid="retry-btn"
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              {language === 'fr' ? 'Réessayer' : 'Try Again'}
            </button>
            <button 
              onClick={() => navigate('/')} 
              className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
