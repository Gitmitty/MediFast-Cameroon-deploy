// Payment Service for MediFast Cameroon
// Mobile Money Integration (MTN MoMo & Orange Money)

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  provider: 'mtn' | 'orange';
  bookingId: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
}

// VALIDATEUR DE NUMÉRO CAMEROUNAIS CORRIGÉ
// Préfixes valides:
// MTN: 67, 68, 650-654, 680-689
// Orange: 69, 655-659, 690-699

export function isValidCameroonPhone(phone: string): boolean {
  // Remove spaces, dashes and +237 prefix
  const cleaned = phone.replace(/[\s\-+]/g, '').replace(/^237/, '');
  
  // Must be 9 digits
  if (cleaned.length !== 9) return false;
  
  // Must start with 6
  if (!cleaned.startsWith('6')) return false;
  
  // Get first 2-3 digits for prefix check
  const prefix2 = cleaned.substring(0, 2);
  const prefix3 = cleaned.substring(0, 3);
  
  // Valid MTN prefixes
  const mtnPrefixes2 = ['67', '68'];
  const mtnPrefixes3 = ['650', '651', '652', '653', '654', '680', '681', '682', '683', '684', '685', '686', '687', '688', '689'];
  
  // Valid Orange prefixes
  const orangePrefixes2 = ['69'];
  const orangePrefixes3 = ['655', '656', '657', '658', '659', '690', '691', '692', '693', '694', '695', '696', '697', '698', '699'];
  
  // Check if valid
  const isValidMTN = mtnPrefixes2.includes(prefix2) || mtnPrefixes3.includes(prefix3);
  const isValidOrange = orangePrefixes2.includes(prefix2) || orangePrefixes3.includes(prefix3);
  
  return isValidMTN || isValidOrange;
}

// Detect provider from phone number
export function detectProvider(phone: string): 'mtn' | 'orange' | null {
  const cleaned = phone.replace(/[\s\-+]/g, '').replace(/^237/, '');
  
  if (cleaned.length < 2) return null;
  
  const prefix2 = cleaned.substring(0, 2);
  const prefix3 = cleaned.length >= 3 ? cleaned.substring(0, 3) : '';
  
  // MTN prefixes
  const mtnPrefixes2 = ['67', '68'];
  const mtnPrefixes3 = ['650', '651', '652', '653', '654', '680', '681', '682', '683', '684', '685', '686', '687', '688', '689'];
  
  if (mtnPrefixes2.includes(prefix2) || mtnPrefixes3.includes(prefix3)) {
    return 'mtn';
  }
  
  // Orange prefixes
  const orangePrefixes2 = ['69'];
  const orangePrefixes3 = ['655', '656', '657', '658', '659', '690', '691', '692', '693', '694', '695', '696', '697', '698', '699'];
  
  if (orangePrefixes2.includes(prefix2) || orangePrefixes3.includes(prefix3)) {
    return 'orange';
  }
  
  return null;
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-+]/g, '').replace(/^237/, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

// Initiate payment (Simulated - Replace with real API)
export async function initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
  // Validate phone number
  if (!isValidCameroonPhone(request.phoneNumber)) {
    return {
      success: false,
      status: 'failed',
      message: 'Numéro de téléphone invalide'
    };
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate transaction ID
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Simulate 90% success rate
  const isSuccess = Math.random() > 0.1;
  
  if (isSuccess) {
    return {
      success: true,
      transactionId,
      status: 'pending',
      message: 'Demande de paiement envoyée. Confirmez sur votre téléphone.'
    };
  } else {
    return {
      success: false,
      status: 'failed',
      message: 'Échec de la connexion au service de paiement. Veuillez réessayer.'
    };
  }
}

// Check payment status (Simulated)
export async function checkPaymentStatus(transactionId: string): Promise<PaymentResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate status progression
  const statuses: PaymentResult['status'][] = ['pending', 'pending', 'success'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    success: randomStatus === 'success',
    transactionId,
    status: randomStatus,
    message: randomStatus === 'success' 
      ? 'Paiement confirmé avec succès!' 
      : 'En attente de confirmation...'
  };
}

// Cancel payment
export async function cancelPayment(transactionId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
}
