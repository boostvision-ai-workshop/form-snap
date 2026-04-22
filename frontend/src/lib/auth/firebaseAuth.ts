/**
 * Firebase implementation of the unified AuthProvider interface.
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification as firebaseSendEmailVerification,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

import { auth as firebaseAuth } from '@/lib/firebase/config';
import type { AuthProvider, AuthUser, AuthStateCallback, UnsubscribeFn } from './types';

function wrapFirebaseUser(fbUser: FirebaseUser): AuthUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    emailVerified: fbUser.emailVerified,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
    getIdToken: (forceRefresh) => fbUser.getIdToken(forceRefresh),
    reload: () => fbUser.reload(),
  };
}

export const firebaseAuthProvider: AuthProvider = {
  async signIn(email, password) {
    if (!firebaseAuth) throw new Error('Firebase auth not initialized');
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return wrapFirebaseUser(cred.user);
  },

  async signUp(email, password) {
    if (!firebaseAuth) throw new Error('Firebase auth not initialized');
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return wrapFirebaseUser(cred.user);
  },

  async signOut() {
    if (!firebaseAuth) throw new Error('Firebase auth not initialized');
    await signOut(firebaseAuth);
  },

  async sendEmailVerification(_user) {
    // The Firebase SDK needs the raw Firebase User object; we call through the
    // native API here because the wrapped AuthUser already delegates getIdToken.
    if (!firebaseAuth) throw new Error('Firebase auth not initialized');
    const fbUser = firebaseAuth.currentUser;
    if (!fbUser) throw new Error('No authenticated user');
    await firebaseSendEmailVerification(fbUser);
  },

  onAuthStateChanged(callback: AuthStateCallback): UnsubscribeFn {
    if (!firebaseAuth) return () => {};
    return firebaseOnAuthStateChanged(firebaseAuth, (fbUser) => {
      callback(fbUser ? wrapFirebaseUser(fbUser) : null);
    });
  },
};
