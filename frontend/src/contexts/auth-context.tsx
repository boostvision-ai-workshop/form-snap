'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, type OAuthCredential } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithGitHub as firebaseSignInWithGitHub,
  signOutUser,
  linkAccountWithCredential,
} from '@/lib/firebase/auth';

export interface AccountLinkingInfo {
  email: string;
  pendingCredential: OAuthCredential;
  suggestedProvider: 'google' | 'github';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  accountLinking: AccountLinkingInfo | null;
  setAccountLinking: (info: AccountLinkingInfo | null) => void;
  linkAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountLinking, setAccountLinking] = useState<AccountLinkingInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await signUpWithEmail(email, password);
  }, []);

  const signInWithGoogleHandler = useCallback(async () => {
    await firebaseSignInWithGoogle();
  }, []);

  const signInWithGitHubHandler = useCallback(async () => {
    await firebaseSignInWithGitHub();
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    router.push('/');
  }, [router]);

  const getToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken(false);
  }, [user]);

  const linkAccount = useCallback(async () => {
    if (!accountLinking) return;
    const { suggestedProvider, pendingCredential } = accountLinking;
    const userCredential = suggestedProvider === 'google'
      ? await firebaseSignInWithGoogle()
      : await firebaseSignInWithGitHub();
    await linkAccountWithCredential(userCredential.user, pendingCredential);
    setAccountLinking(null);
  }, [accountLinking]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle: signInWithGoogleHandler,
        signInWithGitHub: signInWithGitHubHandler,
        logout,
        getToken,
        accountLinking,
        setAccountLinking,
        linkAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
