import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
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
  const result = await signInWithPopup(auth, googleProvider);
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
  const result = await firebaseSignInAnonymously(auth);
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

export async function signInWithEmail(email: string, pass: string) {
  let user;
  try {
    const result = await firebaseSignInWithEmailAndPassword(auth, email, pass);
    user = result.user;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/invalid-login-credentials'
    ) {
      // Attempt seamless account initialization if not yet registered
      try {
        const createResult = await firebaseCreateUserWithEmailAndPassword(auth, email, pass);
        user = createResult.user;
      } catch {
        throw err;
      }
    } else {
      throw err;
    }
  }

  if (user) {
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email || email,
          displayName: email.split('@')[0].toUpperCase(),
          photoURL: '',
          authProvider: 'password',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // Non-blocking firestore write
    }
  }

  return user;
}

export async function signOutOperator() {
  await signOut(auth);
}
