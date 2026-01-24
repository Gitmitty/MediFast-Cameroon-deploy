// Centralized Pricing Configuration for MediFast Cameroon
// All prices are in FCFA (Franc CFA)
// This file is the SINGLE SOURCE OF TRUTH for all pricing in the app

export const PRICING = {
  // Base consultation fees
  consultation: {
    general: 5000,        // Médecine générale
    specialist: 7000,     // Spécialiste (Cardiologue, Neurologue, etc.)
    professor: 15000,     // Consultation avec Professeur
  },

  // Home visit (Visite à domicile)
  homeVisit: 10000,       // Flat fee for home visits

  // Optional surcharges
  surcharges: {
    night: 2000,          // Night calls (after 18h / before 7h)
    holiday: 2000,        // Public holidays
    weekend: 1500,        // Saturday/Sunday (optional)
    expressCare: 5000,    // Priority queue service
  },

  // Emergency services
  emergency: {
    consultation: 10000,  // Emergency room consultation
    ambulance: 25000,     // Ambulance service (if implemented)
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
  // Note: Weekend surcharge is optional - uncomment if needed
  // if (isWeekend && !isHoliday) total += PRICING.surcharges.weekend;
  
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
  
  if (date) {
    const surchargeCalc = calculateSurcharges(date, time);
    nightSurcharge = surchargeCalc.night ? PRICING.surcharges.night : 0;
    holidaySurcharge = surchargeCalc.holiday ? PRICING.surcharges.holiday : 0;
  }
  
  // Total
  const total = basePrice + homeVisit + expressCare + nightSurcharge + holidaySurcharge;
  
  return {
    basePrice,
    baseLabel,
    homeVisit,
    expressCare,
    surcharges: {
      night: nightSurcharge,
      holiday: holidaySurcharge,
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
    total: 'Total',
    currency: 'FCFA',
  },
};

export default PRICING;
