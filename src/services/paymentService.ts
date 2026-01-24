// Mobile Money Payment Service for Cameroon (MTN MoMo & Orange Money)
// This is a frontend-ready service that structures payments for backend integration

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  provider: 'mtn' | 'orange';
  bookingId: string;
  description: string;
  callbackUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  message: string;
  referenceId?: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  amount: number;
  phoneNumber: string;
  timestamp: Date;
}

// Phone number validation for Cameroon
export function isValidCameroonPhone(phone: string): boolean {
  // Remove spaces, dashes, and +237 prefix
  const cleaned = phone.replace(/[\s\-\+]/g, '').replace(/^237/, '');
  
  // MTN: 67, 68, 650-654, 680-689
  // Orange: 69, 655-659, 690-699
  const mtnRegex = /^(67|68|650|651|652|653|654|680|681|682|683|684|685|686|687|688|689)\d{6}$/;
  const orangeRegex = /^(69|655|656|657|658|659|690|691|692|693|694|695|696|697|698|699)\d{6}$/;
  
  return mtnRegex.test(cleaned) || orangeRegex.test(cleaned);
}

// Detect provider from phone number
export function detectProvider(phone: string): 'mtn' | 'orange' | null {
  const cleaned = phone.replace(/[\s\-\+]/g, '').replace(/^237/, '');
  
  // MTN prefixes
  if (/^(67|68|650|651|652|653|654|680|681|682|683|684|685|686|687|688|689)/.test(cleaned)) {
    return 'mtn';
  }
  
  // Orange prefixes
  if (/^(69|655|656|657|658|659|690|691|692|693|694|695|696|697|698|699)/.test(cleaned)) {
    return 'orange';
  }
  
  return null;
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\+]/g, '').replace(/^237/, '');
  if (cleaned.length === 9) {
    return `+237 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

// Generate unique reference ID
function generateReferenceId(): string {
  return `MF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Simulate payment initiation (replace with real API call)
export async function initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
  // Validate phone number
  if (!isValidCameroonPhone(request.phoneNumber)) {
    return {
      success: false,
      status: 'failed',
      message: 'Numéro de téléphone invalide. Utilisez un numéro MTN ou Orange valide.'
    };
  }

  // Detect provider if not specified
  const provider = request.provider || detectProvider(request.phoneNumber);
  if (!provider) {
    return {
      success: false,
      status: 'failed',
      message: 'Impossible de détecter l\'opérateur. Veuillez vérifier le numéro.'
    };
  }

  const referenceId = generateReferenceId();

  // In production, this would call the actual MTN/Orange API
  // For now, we simulate a successful initiation
  
  try {
    // Store payment intent in localStorage for demo (use Firebase in production)
    const paymentIntent = {
      referenceId,
      bookingId: request.bookingId,
      amount: request.amount,
      currency: request.currency || 'XAF',
      phoneNumber: request.phoneNumber,
      provider,
      status: 'pending',
      createdAt: new Date().toISOString(),
      description: request.description
    };
    
    // Store in localStorage (demo) - use Firebase/backend in production
    const payments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
    payments.push(paymentIntent);
    localStorage.setItem('pendingPayments', JSON.stringify(payments));

    return {
      success: true,
      status: 'pending',
      transactionId: referenceId,
      referenceId,
      message: provider === 'mtn' 
        ? 'Vérifiez votre téléphone pour confirmer le paiement MTN Mobile Money'
        : 'Vérifiez votre téléphone pour confirmer le paiement Orange Money'
    };
  } catch (error) {
    return {
      success: false,
      status: 'failed',
      message: 'Erreur lors de l\'initiation du paiement. Veuillez réessayer.'
    };
  }
}

// Check payment status (simulated)
export async function checkPaymentStatus(transactionId: string): Promise<PaymentStatus | null> {
  try {
    const payments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
    const payment = payments.find((p: any) => p.referenceId === transactionId);
    
    if (!payment) {
      return null;
    }

    // Simulate status check (in production, call actual API)
    // For demo, we'll auto-approve after 5 seconds
    const createdAt = new Date(payment.createdAt);
    const now = new Date();
    const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

    let status: PaymentStatus['status'] = 'PENDING';
    if (diffSeconds > 5) {
      status = 'SUCCESS';
      // Update stored payment
      payment.status = 'success';
      localStorage.setItem('pendingPayments', JSON.stringify(payments));
    }

    return {
      transactionId,
      status,
      amount: payment.amount,
      phoneNumber: payment.phoneNumber,
      timestamp: createdAt
    };
  } catch (error) {
    return null;
  }
}

// Mark payment as completed
export async function confirmPayment(transactionId: string, bookingId: string): Promise<boolean> {
  try {
    const payments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
    const paymentIndex = payments.findIndex((p: any) => p.referenceId === transactionId);
    
    if (paymentIndex === -1) {
      return false;
    }

    payments[paymentIndex].status = 'success';
    payments[paymentIndex].completedAt = new Date().toISOString();
    localStorage.setItem('pendingPayments', JSON.stringify(payments));

    // Also store in completed payments history
    const completedPayments = JSON.parse(localStorage.getItem('completedPayments') || '[]');
    completedPayments.push(payments[paymentIndex]);
    localStorage.setItem('completedPayments', JSON.stringify(completedPayments));

    return true;
  } catch (error) {
    return false;
  }
}

// Get user's payment history
export function getPaymentHistory(): any[] {
  try {
    return JSON.parse(localStorage.getItem('completedPayments') || '[]');
  } catch {
    return [];
  }
}

// Provider info for UI
export const providerInfo = {
  mtn: {
    name: 'MTN Mobile Money',
    shortName: 'MTN MoMo',
    color: '#FFCB05',
    textColor: '#000000',
    logo: '📱', // Replace with actual logo URL
    ussdCode: '*126#',
    prefixes: ['67', '68', '650-654', '680-689']
  },
  orange: {
    name: 'Orange Money',
    shortName: 'Orange Money',
    color: '#FF6600',
    textColor: '#FFFFFF',
    logo: '📱', // Replace with actual logo URL
    ussdCode: '#150#',
    prefixes: ['69', '655-659', '690-699']
  }
};

// Payment amounts for different services
export const paymentPrices = {
  consultationGeneral: 5000,
  consultationSpecialist: 7000,
  consultationProfessor: 15000,
  homeVisit: 10000,
  emergencyNight: 15000,
  expressCare: 5000, // Additional fee
};

export default {
  initiatePayment,
  checkPaymentStatus,
  confirmPayment,
  isValidCameroonPhone,
  detectProvider,
  formatPhoneNumber,
  getPaymentHistory,
  providerInfo,
  paymentPrices
};
