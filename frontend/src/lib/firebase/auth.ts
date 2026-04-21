import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  linkWithCredential,
  type OAuthCredential,
  type User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from './config';

export async function signInWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase auth not initialized');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase auth not initialized');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase auth not initialized');
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signInWithGitHub() {
  if (!auth) throw new Error('Firebase auth not initialized');
  const provider = new GithubAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signOutUser() {
  if (!auth) throw new Error('Firebase auth not initialized');
  return signOut(auth);
}

export function getCredentialFromError(
  error: unknown,
): { email: string; credential: OAuthCredential } | null {
  if (!(error instanceof FirebaseError)) return null;

  const email = error.customData?.email;
  const credential = OAuthProvider.credentialFromError(error);
  if (typeof email !== 'string' || !credential) return null;

  return { email, credential };
}

export async function linkAccountWithCredential(
  user: User,
  credential: OAuthCredential,
) {
  return linkWithCredential(user, credential);
}
