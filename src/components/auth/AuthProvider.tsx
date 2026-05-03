import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../../lib/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000); // Fail-safe 8 seconds

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (import.meta.env.VITE_ENABLE_DEMO_MODE === 'true') {
          const demoUser = localStorage.getItem('demo_user');
          if (demoUser) {
            const parsedUser = JSON.parse(demoUser);
            setUser(parsedUser);
            setIsAdmin(true);
            setLoading(false);
            return;
          }
        }

        setUser(user);
        if (user) {
          // Sync user to Firestore
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              createdAt: new Date().toISOString(),
              role: 'user'
            });
          } else {
            setIsAdmin(userDoc.data()?.role === 'admin');
          }
        }
      } catch (error) {
        console.error('Error syncing user:', error);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
