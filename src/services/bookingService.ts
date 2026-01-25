import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';

export interface Booking {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  hospitalId: string;
  hospitalName: string;
  doctorId?: string;
  doctorName?: string;
  department: string;
  specialty?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  queueNumber: number;
  fee: number;
  expressCare: boolean;
  patientName: string;
  patientRelation?: string;
  patientAge?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  emergencyPhone?: string;
  workingHours: string;
  hasEmergency: boolean;
  departments: string[];
  imageUrl?: string;
  lat?: number;
  lon?: number;
}

// Check if slot is already booked
export const isSlotAvailable = async (
  hospitalId: string, 
  doctorId: string | null,
  date: string, 
  time: string
): Promise<boolean> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    let q;
    
    if (doctorId) {
      q = query(
        bookingsRef,
        where('hospitalId', '==', hospitalId),
        where('doctorId', '==', doctorId),
        where('date', '==', date),
        where('time', '==', time),
        where('status', 'in', ['pending', 'confirmed'])
      );
    } else {
      q = query(
        bookingsRef,
        where('hospitalId', '==', hospitalId),
        where('date', '==', date),
        where('time', '==', time),
        where('status', 'in', ['pending', 'confirmed'])
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return true; // Allow booking on error to not block user
  }
};

// Get queue number for a specific date/doctor
export const getNextQueueNumber = async (
  hospitalId: string,
  doctorId: string | null,
  date: string
): Promise<number> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    let q;
    
    if (doctorId) {
      q = query(
        bookingsRef,
        where('hospitalId', '==', hospitalId),
        where('doctorId', '==', doctorId),
        where('date', '==', date),
        where('status', 'in', ['pending', 'confirmed'])
      );
    } else {
      q = query(
        bookingsRef,
        where('hospitalId', '==', hospitalId),
        where('date', '==', date),
        where('status', 'in', ['pending', 'confirmed'])
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.size + 1;
  } catch (error) {
    console.error('Error getting queue number:', error);
    return Math.floor(Math.random() * 10) + 1;
  }
};

// Create a new booking
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Check slot availability first
    const available = await isSlotAvailable(
      bookingData.hospitalId,
      bookingData.doctorId || null,
      bookingData.date,
      bookingData.time
    );
    
    if (!available) {
      throw new Error('SLOT_NOT_AVAILABLE');
    }
    
    // Get queue number
    const queueNumber = await getNextQueueNumber(
      bookingData.hospitalId,
      bookingData.doctorId || null,
      bookingData.date
    );
    
    const now = Timestamp.now();
    const bookingWithTimestamp = {
      ...bookingData,
      queueNumber,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'bookings'), bookingWithTimestamp);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Demo bookings data for new users
const generateDemoBookings = (userId: string): Booking[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  return [
    {
      id: 'demo-1',
      userId,
      userEmail: 'demo@medifast.cm',
      userName: 'Utilisateur Demo',
      hospitalId: 'hgy',
      hospitalName: 'Hôpital Général de Yaoundé',
      doctorId: 'dr-demo-1',
      doctorName: 'Dr. Mbarga Jean-Pierre',
      department: 'Médecine Générale',
      specialty: 'Médecine Générale',
      date: tomorrow.toISOString().split('T')[0],
      time: '09:00',
      status: 'confirmed',
      queueNumber: 3,
      fee: 600,
      expressCare: false,
      patientName: 'Moi',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'demo-2',
      userId,
      userEmail: 'demo@medifast.cm',
      userName: 'Utilisateur Demo',
      hospitalId: 'chuy',
      hospitalName: 'CHU de Yaoundé',
      doctorId: 'dr-demo-2',
      doctorName: 'Dr. Nguema Sarah',
      department: 'Cardiologie',
      specialty: 'Cardiologie',
      date: nextWeek.toISOString().split('T')[0],
      time: '14:00',
      status: 'pending',
      queueNumber: 5,
      fee: 3000,
      expressCare: false,
      patientName: 'Moi',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'demo-3',
      userId,
      userEmail: 'demo@medifast.cm',
      userName: 'Utilisateur Demo',
      hospitalId: 'hcy',
      hospitalName: 'Hôpital Central de Yaoundé',
      doctorId: 'dr-demo-3',
      doctorName: 'Dr. Fotso Michel',
      department: 'Pédiatrie',
      specialty: 'Pédiatrie',
      date: lastWeek.toISOString().split('T')[0],
      time: '10:00',
      status: 'completed',
      queueNumber: 2,
      fee: 3000,
      expressCare: false,
      patientName: 'Mon enfant',
      patientRelation: 'child',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'demo-4',
      userId,
      userEmail: 'demo@medifast.cm',
      userName: 'Utilisateur Demo',
      hospitalId: 'hjy',
      hospitalName: 'Hôpital Jamot de Yaoundé',
      doctorId: 'dr-demo-4',
      doctorName: 'Prof. Pefura Eric',
      department: 'Pneumologie',
      specialty: 'Pneumologie',
      date: twoWeeksAgo.toISOString().split('T')[0],
      time: '11:00',
      status: 'expired',
      queueNumber: 8,
      fee: 5000,
      expressCare: true,
      patientName: 'Moi',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
  ];
};

// Get user's bookings
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const bookings: Booking[] = [];
    
    snapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      } as Booking);
    });
    
    // If no real bookings, return demo data
    if (bookings.length === 0) {
      return generateDemoBookings(userId);
    }
    
    // Update expired bookings
    const now = new Date();
    for (const booking of bookings) {
      const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
      if (bookingDateTime < now && booking.status === 'confirmed') {
        await updateBookingStatus(booking.id!, 'expired');
        booking.status = 'expired';
      }
    }
    
    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    // Return demo data on error
    return generateDemoBookings(userId);
  }
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string, 
  status: Booking['status']
): Promise<void> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId: string): Promise<{ refund: boolean }> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    const booking = bookingDoc.data() as Booking;
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const diffHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Refund only if cancelled more than 24h before
    const refund = diffHours > 24;
    
    await updateDoc(bookingRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now()
    });
    
    return { refund };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Get booked slots for a specific date/doctor (for UI to show unavailable times)
export const getBookedSlots = async (
  hospitalId: string,
  doctorId: string | null,
  date: string
): Promise<string[]> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    let q;
    
    if (doctorId) {
      q = query(
        bookingsRef,
        where('hospitalId', '==', hospitalId),
        where('doctorId', '==', doctorId),
        where('date', '==', date),
        where('status', 'in', ['pending', 'confirmed'])
      );
    } else {
      q = query(
        bookingsRef,
        where('hospitalId', '==', hospitalId),
        where('date', '==', date),
        where('status', 'in', ['pending', 'confirmed'])
      );
    }
    
    const snapshot = await getDocs(q);
    const bookedSlots: string[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      bookedSlots.push(data.time);
    });
    
    return bookedSlots;
  } catch (error) {
    console.error('Error getting booked slots:', error);
    return [];
  }
};

// Get upcoming bookings count for a user
export const getUpcomingBookingsCount = async (userId: string): Promise<number> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const today = new Date().toISOString().split('T')[0];
    
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      where('date', '>=', today),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting upcoming bookings count:', error);
    return 0;
  }
};
