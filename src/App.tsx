import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useMarketData } from './hooks/useMarketData';

import { Masthead, Footer, SkipLink } from './ui/Shell';
import { LoadRule } from './ui/primitives';

import { Command } from './views/Command';
import { CrossRV } from './views/CrossRV';
import { TermStructure } from './views/TermStructure';
import { Lifecycle } from './views/Lifecycle';
import { Backtest } from './views/Backtest';
import { Bhavcopy } from './views/Bhavcopy';
import { Scenario } from './views/Scenario';
import { Blotter } from './views/Blotter';

import { Landing } from './pages/Landing';
import { Methodology } from './pages/Methodology';
import { RiskDisclosure, Terms, Privacy } from './pages/Legal';
import { Access } from './pages/Access';
import { Settings, Account } from './pages/SettingsAccount';
import { NotFound, ErrorBoundary } from './pages/NotFound';

/**
 * Local development bypass.
 *
 * Double gated: `import.meta.env.DEV` is compiled to `false` by `vite build`,
 * so this can never be true in a production bundle no matter what the env
 * file says. It exists only so the terminal can be opened on localhost while
 * the Firebase project has every sign-in provider switched off.
 *
 * Remove VITE_DEV_BYPASS_AUTH from .env.local to restore the real gate.
 */
const DEV_BYPASS = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === '1';

/** Auth state, resolved once and shared by the guarded routes. */
function useOperator() {
  const [user, setUser] = useState<User | null>(null);
  const [resolved, setResolved] = useState(false);
  useEffect(() =>
    onAuthStateChanged(auth, (u) => { setUser(u); setResolved(true); }), []);
  return { user, resolved };
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** App chrome around every terminal view. */
function Terminal({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Masthead />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Guarded({ resolved, user, children }:
  { resolved: boolean; user: User | null; children: React.ReactNode }) {
  if (DEV_BYPASS) return <Terminal>{children}</Terminal>;
  if (!resolved) return <LoadRule />;
  if (!user) return <Navigate to="/access" replace />;
  return <Terminal>{children}</Terminal>;
}

export default function App() {
  const m = useMarketData();
  const { user, resolved } = useOperator();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/risk" element={<RiskDisclosure />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Access */}
          <Route path="/access" element={user ? <Navigate to="/command" replace /> : <Access mode="signin" />} />
          <Route path="/access/create" element={<Access mode="create" />} />
          <Route path="/access/reset" element={<Access mode="reset" />} />

          {/* Terminal */}
          <Route path="/command" element={<Guarded resolved={resolved} user={user}><Command m={m} /></Guarded>} />
          <Route path="/cross-rv" element={<Guarded resolved={resolved} user={user}><CrossRV m={m} /></Guarded>} />
          <Route path="/term-structure" element={<Guarded resolved={resolved} user={user}><TermStructure /></Guarded>} />
          <Route path="/lifecycle" element={<Guarded resolved={resolved} user={user}><Lifecycle /></Guarded>} />
          <Route path="/backtest" element={<Guarded resolved={resolved} user={user}><Backtest /></Guarded>} />
          <Route path="/bhavcopy" element={<Guarded resolved={resolved} user={user}><Bhavcopy /></Guarded>} />
          <Route path="/scenario" element={<Guarded resolved={resolved} user={user}><Scenario m={m} /></Guarded>} />
          <Route path="/blotter" element={<Guarded resolved={resolved} user={user}><Blotter m={m} /></Guarded>} />
          <Route path="/settings" element={<Guarded resolved={resolved} user={user}><Settings m={m} /></Guarded>} />
          <Route path="/account" element={<Guarded resolved={resolved} user={user}><Account /></Guarded>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
