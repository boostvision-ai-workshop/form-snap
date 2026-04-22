/**
 * Unified auth provider selector.
 *
 * Import `authProvider` (and the types) from this module throughout the app.
 * The concrete implementation is chosen by NEXT_PUBLIC_AUTH_PROVIDER at build time.
 */

export type { AuthUser, AuthProvider, AuthStateCallback, UnsubscribeFn } from './types';

import { firebaseAuthProvider } from './firebaseAuth';
import { mockAuthProvider } from './mockAuth';

const isMock = process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'mock';

export const authProvider = isMock ? mockAuthProvider : firebaseAuthProvider;
