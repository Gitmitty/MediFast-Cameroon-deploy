import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Calendar, Clock, User, Edit, X, AlertTriangle, Users, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { getUserBookings, cancelBooking, Booking } from '../services/bookingService';
import { useToast } from '../hooks/use-toast';

const AppointmentsList: React.FC = () => {
  const { darkMode, language, user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<Booking | null>(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'expired'>('all');

  // Load bookings from Firebase
  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const bookings = await getUserBookings(user.id);
        setAppointments(bookings);
      } catch (error) {
        console.error('Error loading bookings:', error);
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: language === 'fr' ? 'Impossible de charger les rendez-vous' : 'Failed to load appointments',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadBookings();
  }, [user]);

  const canCancel = (date: string) => {
    const apptDate = new Date(date);
    const today = new Date();
    const diffTime = apptDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 1;
  };

  const handleCancelClick = () => {
    if (selectedAppt && canCancel(selectedAppt.date)) {
      setShowCancelWarning(true);
    }
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppt?.id) return;
    
    setCancelling(true);
    try {
      const result = await cancelBooking(selectedAppt.id);
      
      // Update local state
      setAppointments(prev => prev.map(a => 
        a.id === selectedAppt.id ? { ...a, status: 'cancelled' } : a
      ));
      
      toast({
        title: language === 'fr' ? 'Rendez-vous annulé' : 'Appointment cancelled',
        description: result.refund 
          ? (language === 'fr' ? 'Vous serez remboursé' : 'You will be refunded')
          : (language === 'fr' ? 'Pas de remboursement (annulation tardive)' : 'No refund (late cancellation)'),
      });
      
      setSelectedAppt(null);
      setShowCancelWarning(false);
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'annuler le rendez-vous' : 'Failed to cancel appointment',
        variant: 'destructive'
      });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; fr: string }> = {
      confirmed: { en: 'Confirmed', fr: 'Confirmé' },
      pending: { en: 'Pending', fr: 'En attente' },
      expired: { en: 'Expired', fr: 'Expiré' },
      cancelled: { en: 'Cancelled', fr: 'Annulé' },
      completed: { en: 'Completed', fr: 'Terminé' },
    };
    return labels[status]?.[language === 'fr' ? 'fr' : 'en'] || status;
  };

  const getRelationLabel = (relation: string | undefined) => {
    if (!relation) return null;
    const labels: Record<string, { fr: string; en: string }> = {
      child: { fr: 'Enfant', en: 'Child' },
      parent: { fr: 'Parent', en: 'Parent' },
      spouse: { fr: 'Conjoint', en: 'Spouse' },
      sibling: { fr: 'Frère/Sœur', en: 'Sibling' },
      other: { fr: 'Autre', en: 'Other' },
    };
    return labels[relation]?.[language === 'fr' ? 'fr' : 'en'] || relation;
  };

  const filteredAppointments = appointments.filter(appt => {
    if (filter === 'upcoming') return appt.status !== 'expired' && appt.status !== 'cancelled' && appt.status !== 'completed';
    if (filter === 'expired') return appt.status === 'expired' || appt.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 pb-24 px-4 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-green-600" size={48} />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {language === 'fr' ? 'Chargement des rendez-vous...' : 'Loading appointments...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 pb-24 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} data-testid="appointments-list">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {language === 'fr' ? 'Mes Rendez-vous' : 'My Appointments'}
        </h2>
        <button 
          onClick={() => navigate('/book')} 
          data-testid="new-appointment-btn"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          + {language === 'fr' ? 'Nouveau' : 'New'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'upcoming', 'expired'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`filter-${f}-btn`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === f 
                ? 'bg-green-600 text-white' 
                : darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            } shadow-md`}
          >
            {f === 'all' ? (language === 'fr' ? 'Tous' : 'All') :
             f === 'upcoming' ? (language === 'fr' ? 'À venir' : 'Upcoming') :
             (language === 'fr' ? 'Passés' : 'Past')}
          </button>
        ))}
      </div>

      {filteredAppointments.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-lg`}>
          <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {language === 'fr' ? 'Aucun rendez-vous' : 'No appointments yet'}
          </p>
          <button 
            onClick={() => navigate('/book')} 
            data-testid="book-now-btn"
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition"
          >
            {language === 'fr' ? 'Prendre Rendez-vous' : 'Book Now'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(appt => (
            <div 
              key={appt.id} 
              onClick={() => setSelectedAppt(appt)}
              data-testid={`appointment-${appt.id}`}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition ${
                appt.status === 'expired' || appt.status === 'cancelled' ? 'opacity-75' : ''
              }`}
            >
              
              {/* Expired Banner */}
              {appt.status === 'expired' && (
                <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg mb-3 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">
                    {language === 'fr' 
                      ? 'Votre rendez-vous a expiré. Veuillez reprogrammer.' 
                      : 'Your appointment has expired. Please reschedule.'}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {appt.doctorName || 'Médecin'}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{appt.hospitalName}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{appt.specialty || appt.department}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.status)}`}>
                  {getStatusLabel(appt.status)}
                </span>
              </div>

              {appt.patientRelation && (
                <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <Users size={14} className="text-blue-600" />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'fr' ? 'Pour' : 'For'}: <strong>{appt.patientName}</strong> ({getRelationLabel(appt.patientRelation)})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar size={14} /> 
                  {new Date(appt.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { 
                    weekday: 'short', day: 'numeric', month: 'short' 
                  })}
                </span>
                <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Clock size={14} /> {appt.time}
                </span>
              </div>

              {(appt.status === 'confirmed' || appt.status === 'pending') && (
                <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'fr' ? 'File' : 'Queue'}: <strong className="text-green-600">#{appt.queueNumber}</strong> • 
                    <strong className="text-green-600 ml-1">{appt.fee?.toLocaleString()} FCFA</strong>
                  </p>
                </div>
              )}

              {appt.status === 'expired' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/book'); }}
                  data-testid="reschedule-btn"
                  className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition"
                >
                  <RefreshCw size={16} />
                  {language === 'fr' ? 'Reprogrammer' : 'Reschedule'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Options Modal */}
      {selectedAppt && !showCancelWarning && selectedAppt.status !== 'expired' && selectedAppt.status !== 'cancelled' && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setSelectedAppt(null)}>
          <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6`} onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? 'Options' : 'Options'}
            </h3>
            
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-4`}>
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedAppt.doctorName}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedAppt.hospitalName}</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedAppt.date} • {selectedAppt.time}
              </p>
              <p className="text-green-600 font-semibold mt-2">{selectedAppt.fee?.toLocaleString()} FCFA</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => { setSelectedAppt(null); navigate('/book'); }}
                data-testid="reschedule-modal-btn"
                className={`w-full flex items-center gap-3 p-4 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition`}
              >
                <Edit className="text-green-600" size={20} /> 
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>
                  {language === 'fr' ? 'Modifier le rendez-vous' : 'Reschedule appointment'}
                </span>
              </button>
              
              {canCancel(selectedAppt.date) ? (
                <button 
                  onClick={handleCancelClick} 
                  data-testid="cancel-appointment-btn"
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <X size={20} /> {language === 'fr' ? 'Annuler le rendez-vous' : 'Cancel appointment'}
                </button>
              ) : (
                <div className={`w-full p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 text-yellow-600 mb-2">
                    <AlertTriangle size={16} />
                    <span className="font-medium">{language === 'fr' ? 'Annulation impossible' : 'Cannot cancel'}</span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'fr' 
                      ? 'Les annulations ne sont possibles que 24h avant le rendez-vous.' 
                      : 'Cancellations are only possible 24h before the appointment.'}
                  </p>
                </div>
              )}
              
              <button 
                onClick={() => setSelectedAppt(null)} 
                data-testid="close-modal-btn"
                className={`w-full p-4 rounded-xl ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && selectedAppt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
            <AlertTriangle className="text-yellow-500 mx-auto mb-4" size={48} />
            <h3 className={`text-xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? 'Confirmer l\'annulation?' : 'Confirm cancellation?'}
            </h3>
            <p className={`text-center text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'fr' 
                ? 'Vous serez remboursé car l\'annulation est faite plus de 24h avant le rendez-vous.' 
                : 'You will be refunded as cancellation is more than 24h before the appointment.'}
            </p>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-3 mb-4 text-sm`}>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {language === 'fr' ? 'Montant remboursé: ' : 'Refund amount: '}
                <strong className="text-green-600">{selectedAppt.fee?.toLocaleString()} FCFA</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelWarning(false)} 
                disabled={cancelling}
                data-testid="cancel-no-btn"
                className={`flex-1 p-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition disabled:opacity-50`}
              >
                {language === 'fr' ? 'Non' : 'No'}
              </button>
              <button 
                onClick={handleCancelConfirm} 
                disabled={cancelling}
                data-testid="cancel-yes-btn"
                className="flex-1 p-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling && <Loader2 className="animate-spin" size={16} />}
                {language === 'fr' ? 'Oui, annuler' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
