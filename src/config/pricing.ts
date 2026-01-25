// Centralized Pricing Configuration for MediFast Cameroon
// All prices are in FCFA (Franc CFA)
// MISE À JOUR: Tarifs réels Cameroun

export const PRICING = {
  // Base consultation fees - TARIFS CORRIGÉS
  consultation: {
    general: 600,         // Consultation Générale
    specialist: 3000,     // Spécialiste (Cardiologue, Neurologue, etc.)
    professor: 5000,      // Consultation avec Professeur
  },

  // Home visit (Visite à domicile)
  homeVisit: 10000,       // Flat fee for home visits

  // ExpressCare (Priorité)
  expressCare: 5000,      // Service prioritaire

  // Optional surcharges
  surcharges: {
    night: 1000,          // Night calls (after 18h / before 7h)
    holiday: 1000,        // Public holidays
    weekend: 500,         // Saturday/Sunday
    expressCare: 5000,    // Priority queue service
  },

  // Emergency services
  emergency: {
    consultation: 5000,   // Emergency room consultation
    ambulance: 25000,     // Ambulance service
  },
};

// Helper function to get consultation price by specialty
export function getConsultationPrice(specialty: string): number {
  const specialistCategories = [
    'Cardiologie', 'Cardiology',
    'Neurologie', 'Neurology',
    'Pneumologie', 'Pneumology',
    'Gynécologie', 'Gynecology',
    'Pédiatrie', 'Pediatrics',
    'Orthopédie', 'Orthopedics',
    'Ophtalmologie', 'Ophthalmology',
    'Dermatologie', 'Dermatology',
    'Gastroentérologie', 'Gastroenterology',
    'ORL', 'ENT',
    'Psychiatrie', 'Psychiatry',
    'Néphrologie', 'Nephrology',
    'Chirurgie', 'Surgery',
    'Oncologie', 'Oncology',
    'Endocrinologie', 'Endocrinology',
  ];

  const professorTitles = ['Professeur', 'Professor', 'Prof.'];

  // Check if it's a professor consultation
  if (professorTitles.some(title => specialty.toLowerCase().includes(title.toLowerCase()))) {
    return PRICING.consultation.professor;
  }

  // Check if it's a specialist
  if (specialistCategories.some(cat => specialty.toLowerCase().includes(cat.toLowerCase()))) {
    return PRICING.consultation.specialist;
  }

  // Default to general consultation
  return PRICING.consultation.general;
}

// Calculate surcharges based on date and time
export function calculateSurcharges(
  date: Date | string,
  time?: string
): { night: boolean; holiday: boolean; weekend: boolean; total: number } {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check weekend
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Check night (before 7h or after 18h)
  let isNight = false;
  if (time) {
    const hour = parseInt(time.split(':')[0], 10);
    isNight = hour < 7 || hour >= 18;
  }
  
  // Check public holidays (Cameroon)
  const cameroonHolidays = [
    '01-01', // New Year
    '02-11', // Youth Day
    '05-01', // Labour Day
    '05-20', // National Day
    '08-15', // Assumption
    '12-25', // Christmas
  ];
  
  const monthDay = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  const isHoliday = cameroonHolidays.includes(monthDay);
  
  // Calculate total surcharges
  let total = 0;
  if (isNight) total += PRICING.surcharges.night;
  if (isHoliday) total += PRICING.surcharges.holiday;
  if (isWeekend && !isHoliday) total += PRICING.surcharges.weekend;
  
  return { night: isNight, holiday: isHoliday, weekend: isWeekend, total };
}

// Calculate total booking price
export interface BookingPriceBreakdown {
  basePrice: number;
  baseLabel: string;
  homeVisit: number;
  expressCare: number;
  surcharges: {
    night: number;
    holiday: number;
    weekend: number;
  };
  total: number;
}

export function calculateBookingPrice(params: {
  consultationType: 'general' | 'specialist' | 'professor';
  isHomeVisit?: boolean;
  isExpressCare?: boolean;
  date?: Date | string;
  time?: string;
}): BookingPriceBreakdown {
  const { consultationType, isHomeVisit, isExpressCare, date, time } = params;
  
  // Base price
  const basePrice = PRICING.consultation[consultationType];
  const baseLabel = consultationType === 'general' 
    ? 'Consultation Générale' 
    : consultationType === 'specialist'
      ? 'Consultation Spécialiste'
      : 'Consultation Professeur';
  
  // Home visit
  const homeVisit = isHomeVisit ? PRICING.homeVisit : 0;
  
  // Express care
  const expressCare = isExpressCare ? PRICING.surcharges.expressCare : 0;
  
  // Surcharges based on date/time
  let nightSurcharge = 0;
  let holidaySurcharge = 0;
  let weekendSurcharge = 0;
  
  if (date) {
    const surchargeCalc = calculateSurcharges(date, time);
    nightSurcharge = surchargeCalc.night ? PRICING.surcharges.night : 0;
    holidaySurcharge = surchargeCalc.holiday ? PRICING.surcharges.holiday : 0;
    weekendSurcharge = surchargeCalc.weekend ? PRICING.surcharges.weekend : 0;
  }
  
  // Total
  const total = basePrice + homeVisit + expressCare + nightSurcharge + holidaySurcharge + weekendSurcharge;
  
  return {
    basePrice,
    baseLabel,
    homeVisit,
    expressCare,
    surcharges: {
      night: nightSurcharge,
      holiday: holidaySurcharge,
      weekend: weekendSurcharge,
    },
    total,
  };
}

// Format price for display (with thousands separator)
export function formatPrice(amount: number): string {
  return amount.toLocaleString('fr-FR');
}

// Price labels for UI (French/English)
export const priceLabels = {
  fr: {
    general: 'Consultation Générale',
    specialist: 'Consultation Spécialiste',
    professor: 'Consultation Professeur',
    homeVisit: 'Visite à Domicile',
    expressCare: 'ExpressCare (Priorité)',
    nightSurcharge: 'Supplément Nuit',
    holidaySurcharge: 'Supplément Jour Férié',
    weekendSurcharge: 'Supplément Week-end',
    total: 'Total',
    currency: 'FCFA',
  },
  en: {
    general: 'General Consultation',
    specialist: 'Specialist Consultation',
    professor: 'Professor Consultation',
    homeVisit: 'Home Visit',
    expressCare: 'ExpressCare (Priority)',
    nightSurcharge: 'Night Surcharge',
    holidaySurcharge: 'Holiday Surcharge',
    weekendSurcharge: 'Weekend Surcharge',
    total: 'Total',
    currency: 'FCFA',
  },
};

export default PRICING;
