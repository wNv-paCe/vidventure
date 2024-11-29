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
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// 创建 AuthContext 和 Firestore 实例
const AuthContext = createContext();
const db = getFirestore();

// 辅助函数：获取用户类型
const getUserType = async (uid) => {
  const userDocRef = doc(db, "users", uid);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    return userSnap.data().type; // return user type if user exists
  }

  return null; // if user does not exist
};

// 辅助函数：创建新用户到 Firestore
const createUserInFirestore = async (uid, email, username, userType) => {
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, {
    email,
    username,
    type: userType,
    createdAt: new Date().toISOString(),
  });
};

// 辅助函数：统一错误处理
const handleError = (error) => {
  console.error("Error:", error.message);

  // 用户友好的错误提示
  const errorMap = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
  };

  return {
    success: false,
    error:
      errorMap[error.code] || error.message || "An unknown error occurred.",
  };
};

// AuthContextProvider
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  // 注册用户（邮箱）
  const registerWithEmail = async (email, password, username, userType) => {
    try {
      // 创建 Firebase 用户
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 存储用户信息到 Firestore
      await createUserInFirestore(result.user.uid, email, username, userType);

      // 设置用户状态
      setUser(result.user);
      setUserType(userType);

      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  };

  // 登录用户（邮箱）
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // 从 Firestore 获取用户类型
      const type = await getUserType(result.user.uid);

      if (!type) {
        throw new Error("User type not found. Please register first.");
      }

      // 设置用户状态
      setUser(result.user);
      setUserType(type);

      return { success: true, type };
    } catch (error) {
      return handleError(error);
    }
  };

  // 登录用户（Google）
  const googleSignIn = async (userType) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const { uid, email } = result.user;

      // Check if user exists and has the correct type
      const existingType = await getUserType(uid);

      if (existingType && existingType !== userType) {
        // if user exists but with different type
        throw new Error(
          `Google account is already registered as a ${existingType}. Please log in with the correct account type.`
        );
      }

      if (!existingType) {
        // if user does not exist, create user in Firestore
        await createUserInFirestore(uid, email, null, userType);
      }

      // set user and user type
      setUser(result.user);
      setUserType(userType || existingType);

      return { success: true };
    } catch (error) {
      console.error("Error during Google Sign-In:", error.message);
      return handleError(error);
    }
  };

  // 登出用户
  const firebaseSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  // 监听用户状态变化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 获取用户类型并设置状态
        const type = await getUserType(currentUser.uid);
        setUser(currentUser);
        setUserType(type);
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
        registerWithEmail,
        loginWithEmail,
        googleSignIn,
        firebaseSignOut,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 自定义 Hook
export const useUserAuth = () => {
  return useContext(AuthContext);
};
