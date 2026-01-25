// Comprehensive health facilities database for Cameroon
// Priority cities: Yaoundé, Douala, Bafoussam

export interface HealthFacility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'dispensary' | 'health_center' | 'pharmacy';
  city: string;
  district?: string;
  address?: string;
  lat: number;
  lon: number;
  phone?: string;
  emergencyPhone?: string;
  hasEmergency: boolean;
  departments: string[];
  openingHours?: string;
  isPublic: boolean;
}

// ============================================
// YAOUNDÉ - Health Facilities
// ============================================

export const yaounde: HealthFacility[] = [
  {
    id: 'hgy',
    name: 'Hôpital Général de Yaoundé',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Ngousso',
    address: 'BP 5408, Yaoundé',
    lat: 3.8889,
    lon: 11.5167,
    phone: '+237 222 21 20 20',
    emergencyPhone: '+237 222 21 20 18',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Cardiologie', 'Neurologie', 'Orthopédie', 'Pédiatrie', 'Gynécologie', 'Maternité', 'Réanimation', 'Urgences', 'Radiologie', 'Laboratoire'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'chuy',
    name: 'Centre Hospitalier Universitaire de Yaoundé',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Mélen',
    address: 'Rue de Mélen, BP 1364',
    lat: 3.8628,
    lon: 11.4961,
    phone: '+237 222 23 04 09',
    emergencyPhone: '+237 222 23 04 10',
    hasEmergency: true,
    departments: ['Médecine Interne', 'Chirurgie', 'Pédiatrie', 'Gynécologie-Obstétrique', 'Anesthésie-Réanimation', 'Ophtalmologie', 'ORL', 'Dermatologie', 'Psychiatrie', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hcy',
    name: 'Hôpital Central de Yaoundé',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Centre-ville',
    address: 'Avenue Kennedy, Yaoundé',
    lat: 3.8680,
    lon: 11.5210,
    phone: '+237 222 23 40 20',
    emergencyPhone: '+237 222 23 40 21',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Gynécologie', 'Urgences', 'Ophtalmologie', 'ORL', 'Cardiologie', 'Laboratoire'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hjy',
    name: 'Hôpital Jamot de Yaoundé',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Jamot',
    address: 'Quartier Jamot',
    lat: 3.8667,
    lon: 11.5167,
    phone: '+237 222 23 10 15',
    emergencyPhone: '+237 222 23 10 16',
    hasEmergency: true,
    departments: ['Pneumologie', 'Phtisiologie', 'Médecine Interne', 'Urgences', 'Laboratoire', 'Radiologie'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hgyo',
    name: 'Hôpital Gynéco-Obstétrique et Pédiatrique de Yaoundé',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Ngousso',
    lat: 3.8750,
    lon: 11.5230,
    phone: '+237 222 23 16 00',
    emergencyPhone: '+237 222 23 16 01',
    hasEmergency: true,
    departments: ['Gynécologie', 'Obstétrique', 'Maternité', 'Pédiatrie', 'Néonatologie', 'Urgences Obstétricales'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hd-nkolndongo',
    name: 'Hôpital de District de Nkolndongo',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Nkolndongo',
    lat: 3.8610,
    lon: 11.5320,
    phone: '+237 222 31 XX XX',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hd-biyem',
    name: 'Hôpital de District de Biyem-Assi',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Biyem-Assi',
    lat: 3.8340,
    lon: 11.4890,
    phone: '+237 222 31 XX XX',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hd-efoulan',
    name: 'Hôpital de District d\'Efoulan',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Efoulan',
    lat: 3.8420,
    lon: 11.5080,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hd-cite-verte',
    name: 'Hôpital de District de la Cité Verte',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Cité Verte',
    lat: 3.8890,
    lon: 11.4920,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'bethesda',
    name: 'Hôpital Bethesda',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Omnisport',
    lat: 3.8840,
    lon: 11.5080,
    phone: '+237 222 XX XX XX',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Gynécologie', 'Urgences'],
    openingHours: '24h/24',
    isPublic: false
  },
  {
    id: 'etoug-ebe',
    name: 'Etoug-Ebe Baptist Hospital',
    type: 'hospital',
    city: 'Yaoundé',
    district: 'Etoug-Ebe',
    lat: 3.8560,
    lon: 11.4780,
    phone: '+237 222 XX XX XX',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: false
  },
  {
    id: 'clinique-fouda',
    name: 'Clinique de la Cathédrale (Fouda)',
    type: 'clinic',
    city: 'Yaoundé',
    district: 'Fouda',
    lat: 3.8650,
    lon: 11.5190,
    phone: '+237 222 XX XX XX',
    hasEmergency: false,
    departments: ['Médecine Générale', 'Gynécologie', 'Pédiatrie'],
    openingHours: '7h-18h',
    isPublic: false
  },
  {
    id: 'polyclinique-bastos',
    name: 'Polyclinique de Bastos',
    type: 'clinic',
    city: 'Yaoundé',
    district: 'Bastos',
    lat: 3.8820,
    lon: 11.5050,
    phone: '+237 222 21 XX XX',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Cardiologie', 'Urgences'],
    openingHours: '24h/24',
    isPublic: false
  },
  {
    id: 'csm-melen',
    name: 'Centre de Santé de Mélen',
    type: 'health_center',
    city: 'Yaoundé',
    district: 'Mélen',
    lat: 3.8590,
    lon: 11.4930,
    phone: '+237 222 31 64 05',
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination', 'Consultation Prénatale'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-mvog-ada',
    name: 'Centre de Santé de Mvog-Ada',
    type: 'health_center',
    city: 'Yaoundé',
    district: 'Mvog-Ada',
    lat: 3.8510,
    lon: 11.5140,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination', 'Consultation Prénatale'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-essos',
    name: 'Centre de Santé d\'Essos',
    type: 'health_center',
    city: 'Yaoundé',
    district: 'Essos',
    lat: 3.8730,
    lon: 11.5350,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination', 'Consultation Prénatale'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-nkoldongo',
    name: 'Centre de Santé Intégré de Nkoldongo',
    type: 'health_center',
    city: 'Yaoundé',
    district: 'Nkoldongo',
    lat: 3.8580,
    lon: 11.5280,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination', 'Planification Familiale'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-etoa-meki',
    name: 'Centre de Santé d\'Etoa-Meki',
    type: 'health_center',
    city: 'Yaoundé',
    district: 'Etoa-Meki',
    lat: 3.8770,
    lon: 11.5120,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-mokolo',
    name: 'Centre de Santé de Mokolo',
    type: 'health_center',
    city: 'Yaoundé',
    district: 'Mokolo',
    lat: 3.8690,
    lon: 11.5040,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-nlongkak',
    name: 'Centre de Santé de Nlongkak',
    type: 'health_center',
    city: 'Yaoundé',
    district: 'Nlongkak',
    lat: 3.8810,
    lon: 11.5160,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'disp-emana',
    name: 'Dispensaire d\'Emana',
    type: 'dispensary',
    city: 'Yaoundé',
    district: 'Emana',
    lat: 3.9010,
    lon: 11.5080,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Soins Infirmiers'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'disp-soa',
    name: 'Dispensaire de Soa',
    type: 'dispensary',
    city: 'Yaoundé',
    district: 'Soa',
    lat: 3.9150,
    lon: 11.5850,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Soins Infirmiers'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'disp-nkol-bisson',
    name: 'Dispensaire de Nkol-Bisson',
    type: 'dispensary',
    city: 'Yaoundé',
    district: 'Nkol-Bisson',
    lat: 3.8390,
    lon: 11.4750,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Soins Infirmiers'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
];

// ============================================
// DOUALA - Health Facilities
// ============================================

export const douala: HealthFacility[] = [
  {
    id: 'hgd',
    name: 'Hôpital Général de Douala',
    type: 'hospital',
    city: 'Douala',
    district: 'Bonanjo',
    address: 'BP 4856, Douala',
    lat: 4.0511,
    lon: 9.7679,
    phone: '+237 233 42 01 12',
    emergencyPhone: '+237 233 42 01 13',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Cardiologie', 'Gastroentérologie', 'Neurologie', 'Pédiatrie', 'Gynécologie', 'Urgences', 'Réanimation', 'Oncologie', 'Radiologie'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hlq',
    name: 'Hôpital Laquintinie de Douala',
    type: 'hospital',
    city: 'Douala',
    district: 'Akwa',
    lat: 4.0435,
    lon: 9.6966,
    phone: '+237 233 42 56 78',
    emergencyPhone: '+237 233 42 56 79',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Gynécologie', 'Maternité', 'Chirurgie', 'Urgences', 'Ophtalmologie', 'Dermatologie'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hd-deido',
    name: 'Hôpital de District de Deido',
    type: 'hospital',
    city: 'Douala',
    district: 'Deido',
    lat: 4.0520,
    lon: 9.7150,
    phone: '+237 233 XX XX XX',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hd-nylon',
    name: 'Hôpital de District de Nylon',
    type: 'hospital',
    city: 'Douala',
    district: 'Nylon',
    lat: 4.0180,
    lon: 9.7350,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hd-bonassama',
    name: 'Hôpital de District de Bonassama',
    type: 'hospital',
    city: 'Douala',
    district: 'Bonassama',
    lat: 4.0750,
    lon: 9.6850,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hd-cite-sic',
    name: 'Hôpital de District de Cité SIC',
    type: 'hospital',
    city: 'Douala',
    district: 'Cité SIC',
    lat: 4.0620,
    lon: 9.7480,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'clinique-cites',
    name: 'Clinique des Cités',
    type: 'clinic',
    city: 'Douala',
    district: 'Makepe',
    address: 'Face CINPHARM',
    lat: 4.0852,
    lon: 9.7561,
    phone: '+237 233 42 89 87',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Gynécologie', 'Urgences'],
    openingHours: '24h/24',
    isPublic: false
  },
  {
    id: 'clinique-akwa',
    name: 'Clinique d\'Akwa',
    type: 'clinic',
    city: 'Douala',
    district: 'Akwa',
    lat: 4.0477,
    lon: 9.6958,
    phone: '+237 233 42 XX XX',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Urgences'],
    openingHours: '24h/24',
    isPublic: false
  },
  {
    id: 'hospital-pater-pio',
    name: 'Hôpital Pater Pio',
    type: 'hospital',
    city: 'Douala',
    district: 'Douala',
    lat: 4.0758,
    lon: 9.7175,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: false
  },
  {
    id: 'centre-louvanium',
    name: 'Centre Médical Louvanium (ESSEC)',
    type: 'clinic',
    city: 'Douala',
    district: 'ESSEC',
    lat: 4.0551,
    lon: 9.7331,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Consultation Externe'],
    openingHours: '7h30-17h',
    isPublic: false
  },
  {
    id: 'centre-pediatrie-saker',
    name: 'Centre de Pédiatrie Emilie Saker',
    type: 'clinic',
    city: 'Douala',
    district: 'Akwa',
    lat: 4.0490,
    lon: 9.7020,
    hasEmergency: false,
    departments: ['Pédiatrie', 'Vaccination', 'Néonatologie'],
    openingHours: '7h-18h',
    isPublic: false
  },
  {
    id: 'csm-bonamoussadi',
    name: 'Centre de Santé de Bonamoussadi',
    type: 'health_center',
    city: 'Douala',
    district: 'Bonamoussadi',
    lat: 4.0850,
    lon: 9.7388,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination', 'Consultation Prénatale'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-bepanda',
    name: 'Centre de Santé de Bepanda',
    type: 'health_center',
    city: 'Douala',
    district: 'Bepanda',
    lat: 4.0650,
    lon: 9.7280,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination', 'Planification Familiale'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-koumassi',
    name: 'Centre de Santé de Koumassi',
    type: 'health_center',
    city: 'Douala',
    district: 'Koumassi',
    lat: 4.0354,
    lon: 9.6967,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-new-bell',
    name: 'Centre de Santé de New-Bell',
    type: 'health_center',
    city: 'Douala',
    district: 'New-Bell',
    lat: 4.0280,
    lon: 9.7120,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-logbessou',
    name: 'Centre de Santé de Logbessou',
    type: 'health_center',
    city: 'Douala',
    district: 'Logbessou',
    lat: 4.0920,
    lon: 9.7550,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'disp-bonapriso',
    name: 'Dispensaire de Bonapriso',
    type: 'dispensary',
    city: 'Douala',
    district: 'Bonapriso',
    lat: 4.0380,
    lon: 9.7050,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Soins Infirmiers'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'disp-pk14',
    name: 'Dispensaire PK14',
    type: 'dispensary',
    city: 'Douala',
    district: 'PK14',
    lat: 4.1050,
    lon: 9.7380,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Soins Infirmiers'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
];

// ============================================
// BAFOUSSAM - Health Facilities
// ============================================

export const bafoussam: HealthFacility[] = [
  {
    id: 'hrb',
    name: 'Hôpital Régional de Bafoussam',
    type: 'hospital',
    city: 'Bafoussam',
    district: 'Centre',
    lat: 5.4737,
    lon: 10.4179,
    phone: '+237 233 44 XX XX',
    emergencyPhone: '+237 233 44 XX XX',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Gynécologie', 'Urgences', 'Laboratoire'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hd-bafoussam',
    name: 'Hôpital de District de Bafoussam',
    type: 'hospital',
    city: 'Bafoussam',
    district: 'Bafoussam',
    lat: 5.4780,
    lon: 10.4220,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'ad-lucem-bafoussam',
    name: 'Hôpital Ad Lucem Bafoussam',
    type: 'hospital',
    city: 'Bafoussam',
    district: 'Bafoussam',
    lat: 5.4690,
    lon: 10.4150,
    phone: '+237 233 44 XX XX',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: false
  },
  {
    id: 'csm-bafoussam-centre',
    name: 'Centre de Santé de Bafoussam Centre',
    type: 'health_center',
    city: 'Bafoussam',
    district: 'Centre',
    lat: 5.4750,
    lon: 10.4200,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'csm-kamkop',
    name: 'Centre de Santé de Kamkop',
    type: 'health_center',
    city: 'Bafoussam',
    district: 'Kamkop',
    lat: 5.4820,
    lon: 10.4080,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Vaccination'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
  {
    id: 'disp-famla',
    name: 'Dispensaire de Famla',
    type: 'dispensary',
    city: 'Bafoussam',
    district: 'Famla',
    lat: 5.4650,
    lon: 10.4100,
    hasEmergency: false,
    departments: ['Médecine Générale', 'Soins Infirmiers'],
    openingHours: '7h30-15h30',
    isPublic: true
  },
];

// ============================================
// Other Major Cities
// ============================================

export const otherCities: HealthFacility[] = [
  {
    id: 'hrb-bamenda',
    name: 'Hôpital Régional de Bamenda',
    type: 'hospital',
    city: 'Bamenda',
    lat: 5.9527,
    lon: 10.1461,
    phone: '+237 233 36 XX XX',
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hrg-garoua',
    name: 'Hôpital Régional de Garoua',
    type: 'hospital',
    city: 'Garoua',
    lat: 9.3000,
    lon: 13.4000,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hrm-maroua',
    name: 'Hôpital Régional de Maroua',
    type: 'hospital',
    city: 'Maroua',
    lat: 10.5910,
    lon: 14.3158,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hrb-buea',
    name: 'Hôpital Régional de Buea',
    type: 'hospital',
    city: 'Buea',
    lat: 4.1527,
    lon: 9.2429,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
  {
    id: 'hd-kribi',
    name: 'Hôpital de District de Kribi',
    type: 'hospital',
    city: 'Kribi',
    lat: 2.9378,
    lon: 9.9075,
    hasEmergency: true,
    departments: ['Médecine Générale', 'Pédiatrie', 'Maternité', 'Urgences'],
    openingHours: '24h/24',
    isPublic: true
  },
];

// ============================================
// CRITICAL EXPORTS FOR VERCEL BUILD
// ============================================

// 1. All facilities list
export const allHealthFacilities: HealthFacility[] = [
  ...yaounde,
  ...douala,
  ...bafoussam,
  ...otherCities
];

// 2. Alias used by SymptomChecker.tsx
export const healthFacilities = allHealthFacilities;

// 3. Labels used by various components
export const facilityTypeLabels: Record<HealthFacility['type'], string> = {
  hospital: 'Hôpital',
  clinic: 'Clinique',
  dispensary: 'Dispensaire',
  health_center: 'Centre de Santé',
  pharmacy: 'Pharmacie'
};

// 4. Calculation function used by EmergencyPage.tsx
export const getFacilitiesByDistance = (lat: number, lon: number, facilities: HealthFacility[]) => {
  return [...facilities]
    .map(f => {
      // Simplified Haversine formula for performance
      const d = Math.sqrt(Math.pow(f.lat - lat, 2) + Math.pow(f.lon - lon, 2)) * 111;
      return { ...f, distance: d };
    })
    .sort((a, b) => a.distance - b.distance);
};
