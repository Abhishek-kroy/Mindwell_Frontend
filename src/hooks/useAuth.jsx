import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../context/firebase/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    // Check Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Force refresh to get the latest custom claims
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const idToken = tokenResult.token;
          const role = tokenResult.claims.role || 'student';

          // Fetch user profile from the consolidated 'users' collection using UID
          const userSnapshot = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUser({
              uid: firebaseUser.uid,
              role: userData.role || role,
              name: userData.name || firebaseUser.displayName || firebaseUser.email,
              email: userData.email || firebaseUser.email,
              token: idToken,
              college: userData.college || null,
              picture: userData.picture || firebaseUser.photoURL || null
            });
          } else {
            // Default session if profile doc doesn't exist yet
            setUser({
              uid: firebaseUser.uid,
              role: role,
              name: firebaseUser.displayName || firebaseUser.email,
              email: firebaseUser.email,
              token: idToken,
              college: null
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("👤 User Debug Info:", {
        name: user.name,
        email: user.email,
        role: user.role,
        uid: user.uid
      });
    } else if (!loading) {
      console.log("👤 User session: Logged out");
    }
  }, [user, loading]);

  const refreshToken = async () => {
    const auth = getAuth();
    if (auth.currentUser) {
      const tokenResult = await auth.currentUser.getIdTokenResult(true);
      const role = tokenResult.claims.role || 'student';

      // Also check Firestore for consistency
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const finalRole = userDoc.exists() ? userDoc.data().role || role : role;

      setUser(prev => prev ? { ...prev, role: finalRole, token: tokenResult.token } : null);
      return tokenResult.token;
    }
    return null;
  };

  const login = (userData) => {
    setUser(userData);
    console.log('🔐 useAuth user state updated to:', userData);
  };

  const logout = async () => {
    const auth = getAuth();

    // Sign out from Firebase
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }

    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    refreshToken
  };
};
