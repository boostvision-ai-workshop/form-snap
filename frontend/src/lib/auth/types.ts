/**
 * Unified auth interface types.
 *
 * Both the Firebase implementation and the mock implementation must satisfy
 * these shapes so the rest of the app can remain provider-agnostic.
 */

export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  /** Avatar / profile photo URL (matches Firebase User.photoURL). */
  photoURL?: string | null;
  /** Returns the current ID token (possibly cached). */
  getIdToken(forceRefresh?: boolean): Promise<string>;
  /** Reload the user object from the auth service. */
  reload(): Promise<void>;
}

export type AuthStateCallback = (user: AuthUser | null) => void;
export type UnsubscribeFn = () => void;

export interface AuthProvider {
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  sendEmailVerification(user: AuthUser): Promise<void>;
  onAuthStateChanged(callback: AuthStateCallback): UnsubscribeFn;
  /** Mark the current user's email as verified (mock-only; no-op in Firebase). */
  markEmailVerified?(): Promise<void>;
}
