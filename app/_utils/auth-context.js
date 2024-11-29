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
import { getFirestore, doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();
const db = getFirestore();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  // From firestore, get the user type
  const fetchUserType = async (uid) => {
    if (!uid) {
      console.error("User ID is required");
      return null;
    }

    try {
      const userDoc = doc(db, "users", uid);
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        return userSnap.data().type; // Return the user type
      } else {
        console.error("User not found");
      }
      return null;
    } catch (err) {
      console.error("Error fetching user type: ", err.message);
      return null;
    }
  };

  // Google Sign In
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const loggedUser = result.user;

    // Fetch user type from firestore
    const type = await fetchUserType(loggedUser.uid);
    setUser(loggedUser);
    setUserType(type);
  };

  // Email Sign Up
  const registerWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Email Sign In
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const loggedUser = result.user;

    // Fetch user type from firestore
    const type = await fetchUserType(loggedUser.uid);
    setUser(loggedUser);
    setUserType(type);
  };

  // Sign Out
  const firebaseSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setUserType(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // if user is logged in, fetch user type
          const type = await fetchUserType(currentUser.uid);
          setUserType(type);
          setUser(currentUser);
        } catch (err) {
          console.error("Error fetching user type: ", err.message);
        }
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        googleSignIn,
        registerWithEmail,
        loginWithEmail,
        firebaseSignOut,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useUserAuth = () => {
  return useContext(AuthContext);
};
