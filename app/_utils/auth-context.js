"use client";

import { useContext, createContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Google Sign In
  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Email Sign Up
  const registerWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Email Sign In
  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign Out
  const firebaseSignOut = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        googleSignIn,
        registerWithEmail,
        loginWithEmail,
        firebaseSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useUserAuth = () => {
  return useContext(AuthContext);
};
