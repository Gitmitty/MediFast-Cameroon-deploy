import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { User, Heart, FileText, Bell, Settings, ChevronRight, Plus, Calendar, Loader2, LogOut } from 'lucide-react';
import { getUserBookings, Booking } from '../services/bookingService';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const ProfilePage: React.FC = () => {
  const { darkMode, language, user, setUser } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'settings'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState({
    name: user?.fullName || 'Utilisateur',
    phone: user?.phone || '+237 6XX XXX XXX',
    email: user?.email || 'email@example.com',
    bloodType: 'O+',
    allergies: ['Penicillin'],
    conditions: ['Hypertension']
  });

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const userBookings = await getUserBookings(user.id);
        setBookings(userBookings);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBookings();
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.fullName || 'Utilisateur',
        email: user.email || 'email@example.com',
        phone: user.phone || '+237 6XX XXX XXX',
      }));
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' || b.status === 'pending'
  );
  
  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || b.status === 'expired' || b.status === 'cancelled'
  );

  const tabs = [
    { id: 'profile', icon: User, label: language === 'fr' ? 'Profil' : 'Profile' },
    { id: 'history', icon: FileText, label: language === 'fr' ? 'Rendez-vous' : 'Appointments' },
    { id: 'settings', icon: Settings, label: language === 'fr' ? 'Paramètres' : 'Settings' },
  ];

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

  return (
    <div className={`min-h-screen pt-20 pb-24 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} data-testid="profile-page">
      {/* Profile Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 mb-6 shadow-lg`}>
        <div className="flex items-center gap-4">
          <img 
            src={user?.photoURL || "https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1764608418372_3598bb25.webp"}
            alt="Profile" 
            className="w-20 h-20 rounded-full object-cover border-4 border-green-500" 
          />
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{profile.name}</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{profile.email}</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{profile.phone}</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} rounded-xl p-3 text-center`}>
            <p className="text-2xl font-bold text-green-600">{upcomingBookings.length}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'fr' ? 'RDV à venir' : 'Upcoming'}
            </p>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-xl p-3 text-center`}>
            <p className="text-2xl font-bold text-blue-600">{pastBookings.length}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'fr' ? 'RDV passés' : 'Past'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)}
            data-testid={`tab-${tab.id}`}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition ${
              activeTab === tab.id 
                ? 'bg-green-600 text-white' 
                : darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            } shadow-md`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'fr' ? 'Informations Médicales' : 'Medical Info'}
            </h3>
            <button 
              onClick={() => setEditMode(!editMode)} 
              data-testid="edit-profile-btn"
              className="text-green-600 text-sm hover:underline"
            >
              {editMode ? (language === 'fr' ? 'Sauvegarder' : 'Save') : (language === 'fr' ? 'Modifier' : 'Edit')}
            </button>
          </div>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {language === 'fr' ? 'Groupe Sanguin' : 'Blood Type'}
              </p>
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{profile.bloodType}</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {language === 'fr' ? 'Allergies' : 'Allergies'}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.allergies.map((a, i) => (
                  <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">{a}</span>
                ))}
                {editMode && (
                  <button className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-gray-300 transition">
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {language === 'fr' ? 'Conditions Chroniques' : 'Chronic Conditions'}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.conditions.map((c, i) => (
                  <span key={i} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History/Appointments Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin mx-auto mb-4 text-green-600" size={32} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {language === 'fr' ? 'Chargement...' : 'Loading...'}
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 text-center shadow-md`}>
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {language === 'fr' ? 'Aucun rendez-vous' : 'No appointments yet'}
              </p>
              <button 
                onClick={() => navigate('/book')}
                data-testid="book-appointment-btn"
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition"
              >
                {language === 'fr' ? 'Prendre RDV' : 'Book Now'}
              </button>
            </div>
          ) : (
            <>
              {/* Upcoming */}
              {upcomingBookings.length > 0 && (
                <>
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {language === 'fr' ? 'À venir' : 'Upcoming'}
                  </h4>
                  {upcomingBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      onClick={() => navigate('/appointments')}
                      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {booking.doctorName}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {booking.hospitalName}
                          </p>
                        </div>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {booking.date}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {booking.time} • #{booking.queueNumber}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {/* Past */}
              {pastBookings.length > 0 && (
                <>
                  <h4 className={`font-semibold mt-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {language === 'fr' ? 'Historique' : 'History'}
                  </h4>
                  {pastBookings.slice(0, 5).map((booking) => (
                    <div 
                      key={booking.id} 
                      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-md opacity-75`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {booking.doctorName}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {booking.hospitalName}
                          </p>
                        </div>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {booking.date}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
          {[
            { icon: Bell, label: language === 'fr' ? 'Notifications' : 'Notifications', action: () => {} },
            { icon: Heart, label: language === 'fr' ? 'Pharmacies favorites' : 'Favorite Pharmacies', action: () => navigate('/pharmacy') },
            { icon: Calendar, label: language === 'fr' ? 'Mes Rendez-vous' : 'My Appointments', action: () => navigate('/appointments') },
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={item.action}
              data-testid={`settings-item-${i}`}
              className={`w-full flex items-center justify-between p-4 ${i > 0 ? 'border-t' : ''} ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="text-green-600" size={20} />
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>{item.label}</span>
              </div>
              <ChevronRight className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
            </button>
          ))}
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            data-testid="logout-btn"
            className={`w-full flex items-center justify-between p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} text-red-600 hover:bg-red-50 transition`}
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} />
              <span>{language === 'fr' ? 'Déconnexion' : 'Logout'}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
