import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth } from '../lib/firebase/auth';
import { db } from '../lib/firebase/firestore';
import { AuthContext } from './auth-context';

const getSessionStartKey = (uid) => `gradiate_session_started_at_${uid}`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userDocUnsubscribeRef = useRef(null);

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (userDocUnsubscribeRef.current) {
        userDocUnsubscribeRef.current();
        userDocUnsubscribeRef.current = null;
      }

      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(false);

      const sessionStartKey = getSessionStartKey(currentUser.uid);
      try {
        sessionStorage.setItem(sessionStartKey, Date.now().toString());
      } catch (storageError) {
        console.warn('Failed to write session start marker', storageError);
      }

      userDocUnsubscribeRef.current = onSnapshot(doc(db, 'users', currentUser.uid), (snapshot) => {
        const data = snapshot.data() || {};
        const rawGlobalSignOutAt = data.globalSignOutAt;
        const globalSignOutAtMs =
          typeof rawGlobalSignOutAt?.toMillis === 'function'
            ? rawGlobalSignOutAt.toMillis()
            : typeof rawGlobalSignOutAt === 'number'
              ? rawGlobalSignOutAt
              : null;

        if (!globalSignOutAtMs) {
          return;
        }

        let sessionStartedAtMs = 0;
        try {
          sessionStartedAtMs = Number(sessionStorage.getItem(sessionStartKey)) || 0;
        } catch (storageError) {
          console.warn('Failed to read session start marker', storageError);
        }

        if (sessionStartedAtMs && globalSignOutAtMs >= sessionStartedAtMs) {
          signOut(auth).catch((error) => {
            console.error('Failed to sign out after global sign-out event', error);
          });
        }
      });
    });

    return () => {
      if (userDocUnsubscribeRef.current) {
        userDocUnsubscribeRef.current();
      }
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
