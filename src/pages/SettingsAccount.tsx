import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signOutOperator } from '../lib/firebase';
import { MarketData } from '../hooks/useMarketData';
import { Panel, PanelHead, Button, Radio, Checkbox, Rule, Badge } from '../ui/primitives';
import { useTheme, ThemeMode } from '../ui/useTheme';
import { sound } from '../utils/audioEngine';
import { count } from '../utils/format';

export function Settings({ m }: { m: MarketData }) {
  const { mode, setMode } = useTheme();
  const [soundOn, setSoundOn] = useState(sound.enabled);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <div className="wipe-in mx-auto max-w-3xl">
      <Panel className="border-0">
        <PanelHead label="Appearance">Theme follows your system unless you pin it.</PanelHead>
        <fieldset className="flex flex-col gap-3.5 px-4 py-4">
          <legend className="sr-only">Theme</legend>
          {(['system', 'light', 'dark'] as ThemeMode[]).map((t) => (
            <Radio
              key={t} id={`theme-${t}`} name="theme" label={t[0].toUpperCase() + t.slice(1)}
              checked={mode === t} onChange={() => setMode(t)}
            />
          ))}
        </fieldset>
      </Panel>

      <Panel className="mt-px border-0">
        <PanelHead label="Terminal">Tick cadence drives the generated feed, not a live one.</PanelHead>
        <div className="flex flex-col gap-4 px-4 py-4">
          <Checkbox
            id="live" label="Feed running" checked={m.isLive}
            onChange={(e) => m.setIsLive(e.target.checked)}
          />
          <Checkbox
            id="sound" label="Acoustic feedback" checked={soundOn}
            onChange={(e) => { setSoundOn(e.target.checked); sound.enabled = e.target.checked; }}
          />
          <div>
            <p className="t-label text-[var(--ink-tertiary)]">Cadence</p>
            <div className="mt-2 flex gap-px bg-[var(--rule-hair)]">
              {[200, 400, 800, 1600].map((ms) => (
                <button
                  key={ms}
                  onClick={() => m.setTickSpeedMs(ms)}
                  className={`t-label-s flex-1 py-2 transition-colors duration-[var(--dur-hover)] ${
                    m.tickSpeedMs === ms
                      ? 'bg-[var(--brass-wash)] text-[var(--brass)]'
                      : 'bg-[var(--surface)] text-[var(--ink-tertiary)] hover:text-[var(--ink)]'
                  }`}
                >
                  {ms}ms
                </button>
              ))}
            </div>
          </div>
          <Rule />
          <dl className="flex flex-wrap gap-x-10 gap-y-2">
            <div>
              <dt className="t-label-s text-[var(--ink-tertiary)]">Ticks this session</dt>
              <dd className="t-data-m mt-1 text-[var(--ink)]">{count(m.tickCount)}</dd>
            </div>
            <div>
              <dt className="t-label-s text-[var(--ink-tertiary)]">Motion</dt>
              <dd className="t-data-m mt-1 text-[var(--ink)]">{reduced ? 'Reduced, by system setting' : 'Full'}</dd>
            </div>
          </dl>
        </div>
      </Panel>

      <Panel className="mt-px border-0">
        <PanelHead label="Documents" />
        <ul className="flex flex-col divide-y divide-[var(--rule-hair)]">
          {[
            { to: '/methodology', label: 'Methodology' },
            { to: '/risk', label: 'Risk disclosure' },
            { to: '/terms', label: 'Terms of service' },
            { to: '/privacy', label: 'Privacy policy' },
          ].map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="t-ui block px-4 py-3 text-[var(--ink-secondary)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink)]">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

export function Account() {
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <div className="wipe-in mx-auto max-w-3xl">
      <Panel className="border-0">
        <PanelHead label="Operator" right={user?.isAnonymous ? <Badge tone="stale">Guest</Badge> : null} />
        {user ? (
          <dl className="grid grid-cols-1 gap-px bg-[var(--rule-hair)] sm:grid-cols-2">
            <Row k="Display name" v={user.displayName || 'Not set'} />
            <Row k="Email" v={user.email || 'Guest session'} />
            <Row k="Provider" v={user.providerData[0]?.providerId || 'anonymous'} />
            <Row k="Account identifier" v={user.uid} mono />
          </dl>
        ) : (
          <p className="t-body-m px-4 py-6 text-[var(--ink-secondary)]">No active session.</p>
        )}

        <Rule />
        <div className="flex flex-wrap gap-3 px-4 py-4">
          <Button variant="ruled" icon="signout" onClick={async () => { await signOutOperator(); nav('/access'); }}>
            Sign out
          </Button>
        </div>
      </Panel>

      <Panel className="mt-px border-0">
        <PanelHead label="Your data">
          The profile record holds your identifier, email, display name, provider and last sign-in. Nothing else.
        </PanelHead>
        <div className="px-4 py-4">
          <p className="t-body-m text-[var(--ink-secondary)]">
            Deleting the account removes that record and ends the session. It cannot be undone. The{' '}
            <Link to="/privacy" className="underline">privacy policy</Link> sets out what is held and by whom.
          </p>
          <div className="mt-4">
            <Button
              variant="ruled"
              onClick={async () => {
                if (!window.confirm('Delete this account and its profile record? This cannot be undone.')) return;
                try { await auth.currentUser?.delete(); nav('/access'); }
                catch { window.alert('Deletion needs a recent sign-in. Sign out, sign back in, then try again.'); }
              }}
            >
              Delete account and profile
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Row({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="bg-[var(--surface)] px-4 py-3.5">
      <dt className="t-label-s text-[var(--ink-tertiary)]">{k}</dt>
      <dd className={`${mono ? 't-data-s' : 't-ui'} mt-1.5 break-all text-[var(--ink)]`}>{v}</dd>
    </div>
  );
}
