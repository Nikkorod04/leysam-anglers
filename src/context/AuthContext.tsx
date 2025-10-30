import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: userData.displayName || firebaseUser.displayName || '',
              photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
              role: userData.role || 'user',
              isVerified: userData.isVerified || false,
              isBanned: userData.isBanned || false,
              createdAt: userData.createdAt?.toDate() || new Date(),
            });
          } else {
            // Create user document if it doesn't exist
            const newUser: any = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || '',
              role: 'user',
              isVerified: false,
              isBanned: false,
              createdAt: new Date(),
            };
            
            // Only add photoURL if it exists (Firestore doesn't accept undefined)
            if (firebaseUser.photoURL) {
              newUser.photoURL = firebaseUser.photoURL;
            }
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || undefined,
              role: 'user',
              isVerified: false,
              isBanned: false,
              createdAt: new Date(),
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore (no undefined values)
      const newUser: any = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName,
        role: 'user',
        isVerified: false,
        isBanned: false,
        createdAt: new Date(),
      };
      
      // Only add photoURL if it exists
      if (userCredential.user.photoURL) {
        newUser.photoURL = userCredential.user.photoURL;
      }
      
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      } catch (firestoreError) {
        console.warn('Failed to create user document in Firestore:', firestoreError);
        // Continue anyway - the user is created in Auth, Firestore doc can be created later
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
