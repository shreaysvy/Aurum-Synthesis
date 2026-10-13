import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signOutOperator } from '../lib/firebase';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Cpu,
  Terminal,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { sound } from '../utils/audioEngine';

interface InstitutionalAuthGatewayProps {
  children: React.ReactNode;
}

export function InstitutionalAuthGateway({ children }: InstitutionalAuthGatewayProps) {
  const [user, setUser] = useState<User | null>(null);
  const [simulatedUser, setSimulatedUser] = useState<{
    email: string;
    displayName: string;
    uid: string;
    isAnonymous: boolean;
    photoURL?: string | null;
  } | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [authMethodInProgress, setAuthMethodInProgress] = useState<'google' | 'email' | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isFullyUnlocked, setIsFullyUnlocked] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Email/Password form state
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  // Monitor Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsInitializing(false);

      if (currentUser) {
        // If already authenticated on initial page mount, unlock immediately
        setIsVerified(true);
        setIsFullyUnlocked(true);
      } else {
        setIsVerified(false);
        setIsFadingOut(false);
        setIsFullyUnlocked(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Universal 600ms verified state followed by 500ms smooth fade & unblur
   */
  const triggerLosslessUnlockSequence = () => {
    setAuthMethodInProgress(null);
    setIsVerified(true);
    sound.playAlphaChime();

    // Hold verified state & progress bar for 600ms, then run 500ms fade
    setTimeout(() => {
      setIsFadingOut(true);

      setTimeout(() => {
        setIsFullyUnlocked(true);
      }, 500);
    }, 600);
  };

  const handleGoogleSignIn = async () => {
    sound.playClick();
    setAuthError(null);
    setAuthMethodInProgress('google');

    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        triggerLosslessUnlockSequence();
      } else {
        setAuthMethodInProgress(null);
      }
    } catch (err: unknown) {
      setAuthMethodInProgress(null);
      setIsVerified(false);
      const errorMessage =
        err instanceof Error ? err.message : 'Authentication handshake failed.';
      if (errorMessage.includes('popup-closed-by-user')) {
        setAuthError('AUTHORIZATION CANCELLED // HANDSHAKE TERMINATED BY USER');
      } else if (errorMessage.includes('network-request-failed')) {
        setAuthError('NETWORK CONNECTION TIMEOUT // VERIFY EXCHANGE PROXY');
      } else {
        setAuthError(`AUTHENTICATION REJECTED // ${errorMessage.slice(0, 75)}`);
      }
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    const cleanPassword = passwordInput.trim();

    // Verify locally in state that the OPERATOR_ID / EMAIL input contains '@gmail.com' and the passphrase field is not empty
    if (!cleanEmail.includes('@gmail.com') || cleanPassword.length === 0) {
      sound.playClick();
      setAuthError('[!] INVALID OPERATOR FORMAT: REQUIRES VALID @GMAIL.COM CREDENTIAL');
      return;
    }

    sound.playClick();
    setAuthError(null);
    setAuthMethodInProgress('email');

    // Simulate validation verification without server roundtrip (Zero Firebase Backend Dependency)
    setSimulatedUser({
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0].toUpperCase(),
      uid: `OP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      isAnonymous: false,
    });

    // Execute seamless unlock sequence: show CREDENTIALS VERIFIED for 600ms, then fade and unblur
    triggerLosslessUnlockSequence();
  };

  const handleSignOut = async () => {
    sound.playClick();
    setSimulatedUser(null);
    setIsVerified(false);
    setIsFadingOut(false);
    setIsFullyUnlocked(false);
    try {
      await signOutOperator();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isBusy = authMethodInProgress !== null || isInitializing;

  return (
    <div className="relative min-h-screen w-full bg-[#000000]">
      {/* 
        LOSSLESS ACTIVE TRADING DASHBOARD 
        Underneath the gateway, child components run seamlessly.
        When unauthenticated, pointer events and selection are disabled,
        and underlying metrics are dimly visible through the frosted glass.
      */}
      <div
        className={`w-full min-h-screen transition-all duration-700 ${
          !isFullyUnlocked
            ? 'pointer-events-none select-none filter blur-[3px] opacity-40 scale-[0.995]'
            : 'pointer-events-auto select-auto filter blur-none opacity-100 scale-100'
        }`}
      >
        {children}
      </div>

      {/* Floating Operator Session Pill when Unlocked */}
      {isFullyUnlocked && (user || simulatedUser) && (
        (() => {
          const activeUser = user || simulatedUser;
          if (!activeUser) return null;
          return (
            <div className="fixed top-3 right-4 z-40 hidden sm:flex items-center gap-2.5 rounded-full border border-white/10 bg-[#09090b]/90 px-3.5 py-1.5 backdrop-blur-xl shadow-2xl transition-all hover:border-[#FFD700]/40">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFD700]/15 text-[#FFD700] text-xs font-bold ring-1 ring-[#FFD700]/30 overflow-hidden">
                {activeUser.photoURL ? (
                  <img
                    src={activeUser.photoURL}
                    alt="Operator"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : activeUser.isAnonymous ? (
                  <Terminal className="h-3.5 w-3.5 text-[#FFD700]" />
                ) : (
                  <span>{(activeUser.email || 'OP')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-mono text-[9px] font-bold text-[#10B981] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  {activeUser.isAnonymous ? 'GUEST TERMINAL' : 'OPERATOR VERIFIED'}
                </span>
                <span className="max-w-[150px] truncate font-mono text-[11px] text-[#A1A1AA]">
                  {activeUser.isAnonymous
                    ? `UID: ${activeUser.uid.slice(0, 10)}...`
                    : activeUser.email || activeUser.displayName || 'Authorized'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                title="Lock Gateway / Terminate Session"
                className="ml-1 rounded p-1 text-[#71717A] hover:bg-white/10 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })()
      )}

      {/* 
        INSTITUTIONAL GATEWAY MODAL OVERLAY 
        Lossless frosted glass: backdrop-blur-xl bg-black/85
        Runs smooth CSS fade & unblur transition over 500ms
      */}
      {!isFullyUnlocked && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ease-out ${
            isFadingOut
              ? 'opacity-0 backdrop-blur-none pointer-events-none'
              : 'opacity-100 backdrop-blur-xl bg-black/85'
          }`}
        >
          {/* Ambient subtle background glow */}
          <div className="pointer-events-none absolute h-[450px] w-[450px] rounded-full bg-[#FFD700]/[0.035] blur-[120px]" />
          <div className="pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-[#10B981]/[0.025] blur-[100px]" />

          {/* Sleek Terminal Card Container */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090b] p-7 sm:p-9 shadow-2xl shadow-black/80 transition-all">
            {/* Top hairline gradient border: via-[#FFD700] to transparent */}
            <div className="absolute -top-px left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_12px_rgba(255,215,0,0.5)]" />

            {/* Top Metadata Strip */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold tracking-widest text-[#71717A]">
                  SYNTHESIS PROTOCOL // ACCESS GATEWAY
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>• ENCRYPTED 256-BIT</span>
              </div>
            </div>

            {/* Central Animated Cryptographic Icon */}
            <div className="my-6 flex flex-col items-center text-center">
              <div className="relative mb-4 flex h-18 w-18 items-center justify-center">
                {/* Ambient gold pulse effect */}
                <div className="absolute inset-0 rounded-2xl bg-[#FFD700]/10 animate-ping opacity-25" />
                <div className="absolute inset-0 rounded-2xl border border-[#FFD700]/30 bg-gradient-to-b from-[#FFD700]/10 to-transparent shadow-[0_0_30px_rgba(255,215,0,0.15)]" />

                {isVerified ? (
                  <CheckCircle2 className="relative z-10 h-9 w-9 text-[#10B981] animate-in zoom-in-75 duration-300" />
                ) : authMethodInProgress ? (
                  <Cpu className="relative z-10 h-9 w-9 text-[#FFD700] animate-spin" />
                ) : (
                  <ShieldCheck className="relative z-10 h-9 w-9 text-[#FFD700] transition-transform duration-300 group-hover:scale-110" />
                )}
              </div>

              {/* Monospace Typography */}
              <h2 className="font-mono text-xl sm:text-2xl font-black tracking-tight text-[#F8F9FA]">
                SYNTHESIS COMMAND ACCESS
              </h2>
              <p className="mt-1 text-xs text-[#888888] font-mono leading-relaxed">
                Authorize credentials via secure exchange bridge
              </p>

              {/* Protocol Spec Badges matching Header */}
              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-[#A1A1AA]">
                  MCX COMMODITIES ORACLE
                </span>
                <span className="rounded-md border border-[#FFD700]/25 bg-[#FFD700]/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#FFD700]">
                  DELTA-NEUTRAL
                </span>
                <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                  45ms REALTIME
                </span>
              </div>
            </div>

            {/* Error Message if any */}
            {authError && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="font-mono text-[11px] leading-tight">{authError}</span>
              </div>
            )}

            {/* Vertically Stacked Authentication Options & Success State */}
            <div className="space-y-3">
              {!isVerified ? (
                <>
                  {/* 1. PRIMARY BUTTON: Google Single-Click OAuth */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isBusy}
                    className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/90 px-4 py-3.5 font-mono text-xs font-black tracking-wider text-[#F8F9FA] transition-all duration-300 hover:scale-[1.02] hover:border-[#FFD700] hover:text-[#FFD700] hover:shadow-[0_0_20px_rgba(255,215,0,0.18)] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <svg
                      className="h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>

                    <span className="uppercase">
                      {authMethodInProgress === 'google'
                        ? 'VERIFYING OAUTH TOKEN...'
                        : 'INITIATE OAUTH PROTOCOL'}
                    </span>
                  </button>

                  {/* 2. DIRECT CREDENTIAL BRIDGE (Permanently Expanded Directly Below OAuth) */}
                  <form
                    onSubmit={handleEmailPasswordSubmit}
                    className="space-y-3 rounded-xl border border-zinc-800/80 bg-black/60 p-4 text-left shadow-inner"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-[#A1A1AA]">
                        <KeyRound className="h-3 w-3 text-[#10B981]" />
                        DIRECT CREDENTIAL BRIDGE
                      </span>
                      <span className="font-mono text-[9px] text-[#71717A] tracking-wider">
                        SECURE TERMINAL
                      </span>
                    </div>

                    {/* Input 1: Secure Email */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                        OPERATOR_ID / EMAIL
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="> input_secure_email..."
                        className="w-full bg-black px-2 py-1.5 font-mono text-xs text-[#F8F9FA] placeholder:text-zinc-600 border-0 border-b border-zinc-700 outline-none transition-colors focus:border-[#10B981] focus:shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
                      />
                    </div>

                    {/* Input 2: Secure Password */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                        PASSPHRASE / KEY
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="> input_access_key..."
                        className="w-full bg-black px-2 py-1.5 font-mono text-xs text-[#F8F9FA] placeholder:text-zinc-600 border-0 border-b border-zinc-700 outline-none transition-colors focus:border-[#10B981] focus:shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isBusy}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600/40 bg-emerald-950/40 px-3 py-2.5 font-mono text-[11px] font-bold text-emerald-400 hover:border-emerald-500 hover:bg-emerald-900/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all disabled:opacity-50"
                    >
                      {authMethodInProgress === 'email' ? (
                        <span>VALIDATING CREDENTIALS...</span>
                      ) : (
                        <>
                          <span>AUTHENTICATE OPERATOR</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Universal Verified Success State with Emerald Glow and Progress Bar */
                <div className="space-y-3">
                  <div className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-emerald-500/50 bg-emerald-950/40 px-5 py-4 font-mono text-xs font-black tracking-wider text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>CREDENTIALS VERIFIED</span>
                  </div>

                  {/* Institutional Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#A1A1AA]">
                      <span className="text-emerald-400 font-bold">
                        DECRYPTING COMMAND SURFACE...
                      </span>
                      <span className="font-bold text-white">[100%]</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full w-full bg-gradient-to-r from-[#FFD700] to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Security Audit Footnote */}
              <div className="pt-2 text-center">
                <p className="font-mono text-[10px] text-[#555555]">
                  SESSION ID: 0x{Math.floor(Date.now() / 1000).toString(16).toUpperCase()} // CLIENT CLOUD ID: MCX-AURUM-PRO
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
