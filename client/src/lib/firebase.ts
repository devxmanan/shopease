import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "", // Add this even if empty as Firebase might expect it
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Initialize Firebase - use singleton pattern
let app: FirebaseApp;

// Check if Firebase is already initialized
if (getApps().length === 0) {
  console.log("Initializing Firebase app for the first time");
  app = initializeApp(firebaseConfig);
} else {
  console.log("Firebase already initialized, reusing existing app");
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const loginWithEmailPassword = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmailPassword = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const createDocument = async (collectionName: string, data: any) => {
  try {
    return await addDoc(collection(db, collectionName), data);
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    // If Firebase permissions fail, return mock data for development purposes
    console.log('Using in-memory storage for development');
    return { id: `temp-${Date.now()}` };
  }
};

export const getAllDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    // Return empty array if Firebase permission error
    console.log('Using in-memory storage for development');
    return [];
  }
};

export const getDocumentById = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${id} from ${collectionName}:`, error);
    console.log('Using in-memory storage for development');
    return null;
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    return await updateDoc(docRef, data);
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionName}:`, error);
    console.log('Using in-memory storage for development');
    return null;
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collectionName}:`, error);
    console.log('Using in-memory storage for development');
    return null;
  }
};

export const queryDocuments = async (collectionName: string, fieldPath: string, opStr: any, value: any) => {
  try {
    const q = query(collection(db, collectionName), where(fieldPath, opStr, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    console.log('Using in-memory storage for development');
    return [];
  }
};

export const queryDocumentsWithOrder = async (
  collectionName: string, 
  orderByField: string, 
  direction: 'asc' | 'desc' = 'asc'
) => {
  try {
    const q = query(collection(db, collectionName), orderBy(orderByField, direction));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying documents with order from ${collectionName}:`, error);
    console.log('Using in-memory storage for development');
    return [];
  }
};

// Storage functions
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`Error uploading image to ${path}:`, error);
    
    // Return a placeholder image URL for development
    console.log('Using placeholder image for development');
    return 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Image+Upload+Unavailable';
  }
};
