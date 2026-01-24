import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { 
  User, Heart, FileText, Bell, Settings, ChevronRight, Plus, Calendar, 
  Loader2, LogOut, Camera, X, Phone, AlertCircle, Check, Trash2 
} from 'lucide-react';
import { getUserBookings, Booking } from '../services/bookingService';
import { 
  getUserProfile, 
  saveUserProfile, 
  uploadProfilePhoto,
  UserProfile 
} from '../services/userService';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useToast } from '../hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { darkMode, language, user, setUser } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'settings'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    email: '',
    whatsapp: '',
    bloodType: '',
    allergies: [] as string[],
    chronicConditions: [] as string[],
    photoURL: ''
  });
  
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  // Load user profile and bookings
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Load profile from Firebase
        const userProfile = await getUserProfile(user.id);
        if (userProfile) {
          setProfile({
            fullName: userProfile.fullName || user.fullName || '',
            phone: userProfile.phone || user.phone || '',
            email: userProfile.email || user.email || '',
            whatsapp: userProfile.whatsapp || '',
            bloodType: userProfile.bloodType || '',
            allergies: userProfile.allergies || [],
            chronicConditions: userProfile.chronicConditions || [],
            photoURL: userProfile.photoURL || ''
          });
        } else {
          // Use context user data
          setProfile(prev => ({
            ...prev,
            fullName: user.fullName || '',
            phone: user.phone || '',
            email: user.email || ''
          }));
        }
        
        // Load bookings
        const userBookings = await getUserBookings(user.id);
        setBookings(userBookings);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    setUploading(true);
    try {
      const photoURL = await uploadProfilePhoto(user.id, file);
      setProfile(prev => ({ ...prev, photoURL }));
      toast({
        title: language === 'fr' ? 'Photo mise à jour!' : 'Photo updated!',
        description: language === 'fr' ? 'Votre photo de profil a été changée' : 'Your profile photo has been changed'
      });
    } catch (error: any) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Impossible de télécharger la photo' : 'Failed to upload photo'),
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await saveUserProfile(user.id, {
        fullName: profile.fullName,
        phone: profile.phone,
        email: profile.email,
        whatsapp: profile.whatsapp,
        bloodType: profile.bloodType,
        allergies: profile.allergies,
        chronicConditions: profile.chronicConditions
      });
      
      // Update context
      setUser({
        ...user,
        fullName: profile.fullName,
        phone: profile.phone
      });
      
      toast({
        title: language === 'fr' ? 'Profil sauvegardé!' : 'Profile saved!',
        description: language === 'fr' ? 'Vos informations ont été mises à jour' : 'Your information has been updated'
      });
      setEditMode(false);
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de sauvegarder' : 'Failed to save',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Add allergy
  const addAllergy = () => {
    if (newAllergy.trim() && !profile.allergies.includes(newAllergy.trim())) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  // Remove allergy
  const removeAllergy = (allergy: string) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  // Add condition
  const addCondition = () => {
    if (newCondition.trim() && !profile.chronicConditions.includes(newCondition.trim())) {
      setProfile(prev => ({
        ...prev,
        chronicConditions: [...prev.chronicConditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  // Remove condition
  const removeCondition = (condition: string) => {
    setProfile(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.filter(c => c !== condition)
    }));
  };

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

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 pb-24 px-4 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-green-600" size={48} />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {language === 'fr' ? 'Chargement du profil...' : 'Loading profile...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 pb-24 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} data-testid="profile-page">
      {/* Profile Header with Photo Upload */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 mb-6 shadow-lg`}>
        <div className="flex items-center gap-4">
          {/* Profile Photo with Upload */}
          <div className="relative">
            <img 
              src={profile.photoURL || "https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1764608418372_3598bb25.webp"}
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover border-4 border-green-500" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              data-testid="upload-photo-btn"
              className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition shadow-lg"
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              data-testid="photo-input"
            />
          </div>
          
          <div className="flex-1">
            {editMode ? (
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                data-testid="name-input"
                className={`text-xl font-bold w-full mb-1 p-1 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                placeholder={language === 'fr' ? 'Votre nom' : 'Your name'}
              />
            ) : (
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {profile.fullName || (language === 'fr' ? 'Utilisateur' : 'User')}
              </h2>
            )}
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{profile.email}</p>
            {editMode ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                data-testid="phone-input"
                className={`text-sm w-full p-1 rounded mt-1 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                placeholder="+237 6XX XXX XXX"
              />
            ) : (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {profile.phone || '+237 6XX XXX XXX'}
              </p>
            )}
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
            {editMode ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditMode(false)} 
                  className="text-gray-500 text-sm hover:underline"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  data-testid="save-profile-btn"
                  className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                  {language === 'fr' ? 'Sauvegarder' : 'Save'}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setEditMode(true)} 
                data-testid="edit-profile-btn"
                className="text-green-600 text-sm hover:underline"
              >
                {language === 'fr' ? 'Modifier' : 'Edit'}
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {/* WhatsApp Number */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-2`}>
                <Phone size={14} /> WhatsApp
              </p>
              {editMode ? (
                <input
                  type="tel"
                  value={profile.whatsapp}
                  onChange={(e) => setProfile(prev => ({ ...prev, whatsapp: e.target.value }))}
                  data-testid="whatsapp-input"
                  className={`w-full p-2 rounded mt-1 ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
                  placeholder="+237 6XX XXX XXX"
                />
              ) : (
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {profile.whatsapp || (language === 'fr' ? 'Non renseigné' : 'Not set')}
                </p>
              )}
            </div>

            {/* Blood Type */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {language === 'fr' ? 'Groupe Sanguin' : 'Blood Type'}
              </p>
              {editMode ? (
                <select
                  value={profile.bloodType}
                  onChange={(e) => setProfile(prev => ({ ...prev, bloodType: e.target.value }))}
                  data-testid="blood-type-select"
                  className={`w-full p-2 rounded mt-1 ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
                >
                  <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              ) : (
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {profile.bloodType || (language === 'fr' ? 'Non renseigné' : 'Not set')}
                </p>
              )}
            </div>
            
            {/* Allergies */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {language === 'fr' ? 'Allergies' : 'Allergies'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.allergies.map((allergy, i) => (
                  <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {allergy}
                    {editMode && (
                      <button onClick={() => removeAllergy(allergy)} className="hover:text-red-900">
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {profile.allergies.length === 0 && !editMode && (
                  <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {language === 'fr' ? 'Aucune allergie enregistrée' : 'No allergies recorded'}
                  </span>
                )}
              </div>
              {editMode && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                    data-testid="new-allergy-input"
                    placeholder={language === 'fr' ? 'Ajouter une allergie...' : 'Add allergy...'}
                    className={`flex-1 p-2 rounded text-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
                  />
                  <button 
                    onClick={addAllergy}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Chronic Conditions */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {language === 'fr' ? 'Conditions Chroniques' : 'Chronic Conditions'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.chronicConditions.map((condition, i) => (
                  <span key={i} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {condition}
                    {editMode && (
                      <button onClick={() => removeCondition(condition)} className="hover:text-yellow-900">
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {profile.chronicConditions.length === 0 && !editMode && (
                  <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {language === 'fr' ? 'Aucune condition enregistrée' : 'No conditions recorded'}
                  </span>
                )}
              </div>
              {editMode && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                    data-testid="new-condition-input"
                    placeholder={language === 'fr' ? 'Ajouter une condition...' : 'Add condition...'}
                    className={`flex-1 p-2 rounded text-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
                  />
                  <button 
                    onClick={addCondition}
                    className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History/Appointments Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
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
