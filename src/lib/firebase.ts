import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider).catch((err: unknown) => {
    const code = (err as { code?: string }).code || 'unknown';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      throw new AuthError(code, 'The Google window closed before sign-in finished.');
    }
    if (code === 'auth/operation-not-allowed' || code === 'auth/unauthorized-domain') {
      throw new AuthError(code, 'Google sign-in is not enabled for this project or this domain. Check the Firebase console.');
    }
    throw new AuthError(code, `Google sign-in failed (${code}).`);
  });
  if (result.user) {
    try {
      await setDoc(
        doc(db, 'users', result.user.uid),
        {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Authorized Operator',
          photoURL: result.user.photoURL || '',
          authProvider: 'google',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // Non-blocking firestore write
    }
  }
  return result.user;
}

export async function signInAsGuest() {
  const result = await firebaseSignInAnonymously(auth).catch((err: unknown) => {
    const code = (err as { code?: string }).code || 'unknown';
    if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
      throw new AuthError(code, 'Guest access is switched off for this project. Enable the Anonymous provider in the Firebase console, then reload.');
    }
    throw new AuthError(code, `Guest sign-in failed (${code}).`);
  });
  if (result.user) {
    try {
      await setDoc(
        doc(db, 'users', result.user.uid),
        {
          uid: result.user.uid,
          email: 'guest@synthesis.terminal',
          displayName: `Guest Operator #${result.user.uid.slice(0, 6).toUpperCase()}`,
          photoURL: '',
          authProvider: 'anonymous',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // Non-blocking firestore write
    }
  }
  return result.user;
}

/** Writes the operator profile record. Non-blocking: a failure never blocks auth. */
async function recordProfile(user: { uid: string; email: string | null }, authProvider: string, displayName: string) {
  try {
    await setDoc(
      doc(db, 'users', user.uid),
      {
        uid: user.uid,
        email: user.email || '',
        displayName,
        photoURL: '',
        authProvider,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch {
    // Profile write is best effort.
  }
}

export class AuthError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Sign in only. Never silently creates an account: current Firebase returns
 * `invalid-credential` for a wrong password on an existing account as well as
 * for an unknown address, so falling through to creation was both confusing
 * and wrong.
 */
export async function signInWithEmail(email: string, pass: string) {
  try {
    const result = await firebaseSignInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await recordProfile(result.user, 'password', email.split('@')[0].toUpperCase());
    }
    return result.user;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code || 'unknown';
    if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials' ||
        code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      throw new AuthError(code, 'That email and passphrase do not match an account. Check both, or create an account.');
    }
    if (code === 'auth/too-many-requests') {
      throw new AuthError(code, 'Too many attempts. Wait a few minutes before trying again.');
    }
    if (code === 'auth/invalid-email') {
      throw new AuthError(code, 'That does not look like a valid email address.');
    }
    if (code === 'auth/operation-not-allowed') {
      throw new AuthError(code, 'Email sign-in is switched off for this project. Enable the Email/Password provider in the Firebase console, then reload.');
    }
    if (code === 'auth/network-request-failed') {
      throw new AuthError(code, 'No connection to the authentication service. Check your network.');
    }
    throw new AuthError(code, `Sign in failed (${code}).`);
  }
}

/** Account creation is its own deliberate action with its own errors. */
export async function createAccountWithEmail(email: string, pass: string) {
  try {
    const result = await firebaseCreateUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await recordProfile(result.user, 'password', email.split('@')[0].toUpperCase());
    }
    return result.user;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code || 'unknown';
    if (code === 'auth/email-already-in-use') {
      throw new AuthError(code, 'An account already exists for that address. Sign in instead.');
    }
    if (code === 'auth/weak-password') {
      throw new AuthError(code, 'Passphrase must be at least six characters.');
    }
    if (code === 'auth/invalid-email') {
      throw new AuthError(code, 'That does not look like a valid email address.');
    }
    if (code === 'auth/operation-not-allowed') {
      throw new AuthError(code, 'Account creation is switched off for this project. Enable the Email/Password provider in the Firebase console, then reload.');
    }
    if (code === 'auth/network-request-failed') {
      throw new AuthError(code, 'No connection to the authentication service. Check your network.');
    }
    throw new AuthError(code, `The account could not be created (${code}).`);
  }
}

export async function sendReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code || 'unknown';
    if (code === 'auth/invalid-email') {
      throw new AuthError(code, 'That does not look like a valid email address.');
    }
    throw new AuthError(code, 'The reset message could not be sent. Try again.');
  }
}

export async function signOutOperator() {
  await signOut(auth);
}
