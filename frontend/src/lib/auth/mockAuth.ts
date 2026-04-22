/**
 * Mock authentication provider for local development.
 *
 * - Stores a single active user in localStorage under "formsnap:mock-user".
 * - signUp(email, password) creates an unverified user and immediately signs in.
 * - signIn(email, password) matches any stored user by email (password ignored).
 * - getIdToken() returns "mock:<uid>:<email>:<verified>" — matches the backend format.
 * - sendEmailVerification() is a no-op; call markEmailVerified() to flip the flag.
 * - onAuthStateChanged fires synchronously on subscribe and on each state change.
 */

import type { AuthProvider, AuthUser, AuthStateCallback, UnsubscribeFn } from './types';

const STORAGE_KEY = 'formsnap:mock-user';

interface StoredUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
}

// In-memory list of subscribers (SSR-safe: only populated client-side)
const _listeners: Set<AuthStateCallback> = new Set();
let _currentUser: StoredUser | null = null;

function _loadFromStorage(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

function _saveToStorage(user: StoredUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function _notify(user: StoredUser | null): void {
  const wrapped = user ? _wrapStored(user) : null;
  _listeners.forEach((cb) => cb(wrapped));
}

function _setUser(user: StoredUser | null): void {
  _currentUser = user;
  _saveToStorage(user);
  _notify(user);
}

function _wrapStored(stored: StoredUser): AuthUser {
  // Capture a reference so closures below stay consistent
  let _stored = stored;

  return {
    get uid() { return _stored.uid; },
    get email() { return _stored.email; },
    get emailVerified() { return _stored.emailVerified; },
    get displayName() { return _stored.displayName; },

    getIdToken(_forceRefresh = false) {
      const verified = _stored.emailVerified ? 'true' : 'false';
      return Promise.resolve(`mock:${_stored.uid}:${_stored.email}:${verified}`);
    },

    reload() {
      // Re-read from localStorage in case markEmailVerified was called in another tab
      const fresh = _loadFromStorage();
      if (fresh && fresh.uid === _stored.uid) {
        _stored = fresh;
        _currentUser = fresh;
      }
      return Promise.resolve();
    },
  };
}

// Initialise from storage when the module is first loaded (client-side only)
if (typeof window !== 'undefined') {
  _currentUser = _loadFromStorage();
}

function _uidFor(email: string): string {
  // Deterministic uid so seeded backend rows line up with mock frontend users.
  return `mock-${email.toLowerCase().replace(/[^a-z0-9]/gi, '-')}`;
}

export const mockAuthProvider: AuthProvider = {
  async signUp(email, _password) {
    const user: StoredUser = {
      uid: _uidFor(email),
      email,
      emailVerified: false,
      displayName: null,
    };
    _setUser(user);
    return _wrapStored(user);
  },

  async signIn(email, _password) {
    // Accept any password for local dev convenience. If no matching stored
    // account exists (e.g. first-run after seeding), auto-create one so the
    // seeded backend data is immediately reachable.
    const stored = _loadFromStorage();
    const user: StoredUser =
      stored && stored.email === email
        ? stored
        : { uid: _uidFor(email), email, emailVerified: true, displayName: null };
    _setUser(user);
    return _wrapStored(user);
  },

  async signOut() {
    _setUser(null);
  },

  async sendEmailVerification(_user) {
    // No-op in mock mode; use markEmailVerified() or the "Mark verified" button.
  },

  onAuthStateChanged(callback: AuthStateCallback): UnsubscribeFn {
    _listeners.add(callback);
    // Fire immediately with current state
    const current = _currentUser ?? _loadFromStorage();
    callback(current ? _wrapStored(current) : null);
    return () => _listeners.delete(callback);
  },

  async markEmailVerified() {
    const stored = _currentUser ?? _loadFromStorage();
    if (!stored) return;
    const updated: StoredUser = { ...stored, emailVerified: true };
    _setUser(updated);
  },
};
