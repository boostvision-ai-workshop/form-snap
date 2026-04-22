'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { OAuthCredential } from 'firebase/auth';
import { authProvider } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

export interface AccountLinkingInfo {
  email: string;
  pendingCredential: OAuthCredential;
  suggestedProvider: 'google' | 'github';
}

interface AuthContextType {
  user: AuthUser | null;
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

/** Lazy-loaded Firebase social sign-in helpers — only imported when needed. */
async function _firebaseSignInWithGoogle() {
  const { signInWithGoogle } = await import('@/lib/firebase/auth');
  return signInWithGoogle();
}

async function _firebaseSignInWithGitHub() {
  const { signInWithGitHub } = await import('@/lib/firebase/auth');
  return signInWithGitHub();
}

async function _firebaseLinkWithCredential(
  credential: OAuthCredential,
  provider: 'google' | 'github',
) {
  const { linkAccountWithCredential, signInWithGoogle, signInWithGitHub } = await import(
    '@/lib/firebase/auth'
  );
  const result =
    provider === 'google' ? await signInWithGoogle() : await signInWithGitHub();
  await linkAccountWithCredential(result.user, credential);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountLinking, setAccountLinking] = useState<AccountLinkingInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authProvider.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await authProvider.signIn(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await authProvider.signUp(email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'mock') {
      throw Object.assign(new Error('Google sign-in not available in mock mode'), {
        code: 'auth/operation-not-supported-in-this-environment',
      });
    }
    await _firebaseSignInWithGoogle();
  }, []);

  const signInWithGitHub = useCallback(async () => {
    if (process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'mock') {
      throw Object.assign(new Error('GitHub sign-in not available in mock mode'), {
        code: 'auth/operation-not-supported-in-this-environment',
      });
    }
    await _firebaseSignInWithGitHub();
  }, []);

  const logout = useCallback(async () => {
    await authProvider.signOut();
    router.push('/');
  }, [router]);

  const getToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken(false);
  }, [user]);

  const linkAccount = useCallback(async () => {
    if (!accountLinking) return;
    const { suggestedProvider, pendingCredential } = accountLinking;
    await _firebaseLinkWithCredential(pendingCredential, suggestedProvider);
    setAccountLinking(null);
  }, [accountLinking]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGitHub,
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
