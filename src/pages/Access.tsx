/**
 * Three real routes, not one modal with swapped state.
 * The copy claims only what the system actually does.
 */
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithGoogle, signInAsGuest, signInWithEmail,
  createAccountWithEmail, sendReset, AuthError,
} from '../lib/firebase';
import { Button, Field, Input, Rule, InlineError } from '../ui/primitives';
import { SealMark } from '../ui/Shell';
import { Icon } from '../ui/Icon';

type Mode = 'signin' | 'create' | 'reset';

const COPY: Record<Mode, { title: string; standfirst: string; submit: string }> = {
  signin: {
    title: 'Sign in',
    standfirst: 'The terminal runs on generated data. An account only keeps your preferences.',
    submit: 'Sign in',
  },
  create: {
    title: 'Create an account',
    standfirst: 'Registration is open. An account stores your email, display name and last sign-in.',
    submit: 'Create account',
  },
  reset: {
    title: 'Reset passphrase',
    standfirst: 'We will send a reset link to the address on your account.',
    submit: 'Send reset link',
  },
};

export function Access({ mode }: { mode: Mode }) {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const copy = COPY[mode];

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') { await signInWithEmail(email, pass); nav('/command'); }
      else if (mode === 'create') { await createAccountWithEmail(email, pass); nav('/command'); }
      else { await sendReset(email); setSent(true); }
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function run(fn: () => Promise<unknown>) {
    setError(null); setBusy(true);
    try { await fn(); nav('/command'); }
    catch (err) { setError(err instanceof AuthError ? err.message : 'That sign-in did not complete.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--rule-hair)] px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <SealMark size={26} />
          <span className="t-label text-[var(--ink)]">Aurum Synthesis</span>
        </Link>
      </header>

      <main id="main" className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-[420px] border border-[var(--rule-strong)] bg-[var(--surface)]">
          <div className="flex flex-col items-center border-b border-[var(--rule-hair)] px-6 py-8">
            <SealMark size={48} />
            <h1 className="t-display-m mt-5 text-[var(--ink)]">{copy.title}</h1>
            <p className="t-body-m mt-3 text-center text-[var(--ink-secondary)]">{copy.standfirst}</p>
          </div>

          <div className="px-6 py-6">
            {mode === 'signin' ? (
              <>
                <Button variant="ruled" className="w-full" onClick={() => run(signInWithGoogle)} disabled={busy}>
                  Continue with Google
                </Button>
                <div className="my-6 flex items-center gap-3">
                  <Rule />
                  <span className="t-label-s whitespace-nowrap text-[var(--ink-tertiary)]">or</span>
                  <Rule />
                </div>
              </>
            ) : null}

            {sent ? (
              <div className="flex flex-col gap-4">
                <p className="t-body-m text-[var(--ink-secondary)]">
                  If an account exists for {email}, a reset link is on its way.
                </p>
                <Link to="/access"><Button variant="ruled" className="w-full">Back to sign in</Button></Link>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-5">
                <Field label="Email" htmlFor="email">
                  <Input
                    id="email" type="email" value={email} autoComplete="email" required
                    onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  />
                </Field>

                {mode !== 'reset' ? (
                  <Field
                    label="Passphrase"
                    htmlFor="pass"
                    hint={mode === 'create' ? 'At least six characters.' : undefined}
                  >
                    <Input
                      id="pass" type="password" value={pass} required minLength={6}
                      autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                      onChange={(e) => setPass(e.target.value)}
                    />
                  </Field>
                ) : null}

                {error ? <InlineError>{error}</InlineError> : null}

                <Button type="submit" variant="brass" className="w-full" disabled={busy}>
                  {busy ? 'Working' : copy.submit}
                </Button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--rule-hair)] px-6 py-5">
            {mode === 'signin' ? (
              <>
                <Link to="/access/create" className="t-label text-[var(--ink-secondary)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)]">
                  Create an account
                </Link>
                <Link to="/access/reset" className="t-label text-[var(--ink-tertiary)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)]">
                  Forgotten passphrase
                </Link>
                <button
                  onClick={() => run(signInAsGuest)}
                  disabled={busy}
                  className="t-label inline-flex items-center gap-2 self-start text-[var(--ink-tertiary)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)] disabled:opacity-40"
                >
                  Continue as guest
                  <Icon name="caret-right" size={13} />
                </button>
              </>
            ) : (
              <Link to="/access" className="t-label text-[var(--ink-secondary)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)]">
                Back to sign in
              </Link>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--rule-hair)] px-4 py-5">
        <p className="t-label-s mx-auto max-w-[60ch] text-center text-[var(--stale)]">
          All market data in this application is generated. Read the{' '}
          <Link to="/risk" className="underline">risk disclosure</Link>,{' '}
          <Link to="/terms" className="underline">terms</Link> and{' '}
          <Link to="/privacy" className="underline">privacy policy</Link>.
        </p>
      </footer>
    </div>
  );
}
