import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user profile in Firestore if it doesn't exist
  const initializeUserProfile = async (user, customName = null) => {
    if (useMock || !user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists() || customName) {
        await setDoc(userRef, {
          email: user.email,
          displayName: customName || user.displayName || 'Usuario',
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.error("Error initializing user profile:", err);
    }
  };

  useEffect(() => {
    if (useMock) {
      setUser({
        uid: 'mock-user-123',
        email: 'mock@example.com',
        displayName: 'Usuario Mock'
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Opcional: si queremos bloquear a los que no han verificado su correo:
      // if (currentUser && !currentUser.emailVerified && currentUser.providerData[0].providerId === 'password') {
      //   setUser(null);
      // } else {
      setUser(currentUser);
      if (currentUser) {
        await initializeUserProfile(currentUser);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = () => {
    if (useMock) return Promise.resolve({ user: { uid: 'mock-user-123' } });
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const loginWithEmail = (email, password) => {
    if (useMock) return Promise.resolve({ user: { uid: 'mock-user-123' } });
    return signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email, password, displayName) => {
    if (useMock) return Promise.resolve({ user: { uid: 'mock-user-123' } });
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the profile in Firebase Auth
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
      // Force update the DB with the new name
      await initializeUserProfile(userCredential.user, displayName);
    }

    // Enviar el correo de verificación de Firebase automáticamente
    await sendEmailVerification(userCredential.user);
    return userCredential;
  };

  const logout = () => {
    if (useMock) {
      setUser(null);
      return Promise.resolve();
    }
    return signOut(auth);
  };

  const value = {
    user,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div style={{color: 'white', padding: '2rem', textAlign: 'center', fontFamily: 'monospace'}}>Cargando conexión con Firebase...</div> : children}
    </AuthContext.Provider>
  );
}
