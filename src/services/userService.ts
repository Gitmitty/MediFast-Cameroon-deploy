import { db, storage } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  photoURL?: string;
  whatsapp?: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create or update user profile
export const saveUserProfile = async (
  userId: string, 
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    const now = Timestamp.now();
    
    if (userDoc.exists()) {
      // Update existing profile
      await updateDoc(userRef, {
        ...data,
        updatedAt: now
      });
    } else {
      // Create new profile
      await setDoc(userRef, {
        ...data,
        id: userId,
        createdAt: now,
        updatedAt: now
      });
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (
  userId: string, 
  file: File
): Promise<string> => {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }
    
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('L\'image ne doit pas dépasser 5MB');
    }
    
    // Create unique filename
    const extension = file.name.split('.').pop();
    const filename = `profile_${userId}_${Date.now()}.${extension}`;
    const storageRef = ref(storage, `profiles/${userId}/${filename}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user profile with new photo URL
    await saveUserProfile(userId, { photoURL: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};

// Delete old profile photo
export const deleteProfilePhoto = async (
  userId: string, 
  photoURL: string
): Promise<void> => {
  try {
    // Extract path from URL and delete
    const photoRef = ref(storage, photoURL);
    await deleteObject(photoRef);
  } catch (error) {
    // Ignore errors if file doesn't exist
    console.log('Could not delete old photo:', error);
  }
};

// Update medical info
export const updateMedicalInfo = async (
  userId: string,
  data: {
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
  }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating medical info:', error);
    throw error;
  }
};

// Update emergency contact
export const updateEmergencyContact = async (
  userId: string,
  contact: {
    name: string;
    phone: string;
    relation: string;
  }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      emergencyContact: contact,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    throw error;
  }
};
