/**
 * Reading surface for the methodology and the legal documents.
 * 68 character measure, section numbering in the left margin.
 */
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { SealMark, Footer } from '../ui/Shell';
import { Rule } from '../ui/primitives';

export interface Section { n: string; title: string; body: ReactNode }

export function DocPage({ kicker, title, standfirst, sections, updated }: {
  kicker: string; title: string; standfirst: string; sections: Section[]; updated: string;
}) {
  return (
    <div>
      <header className="border-b border-[var(--rule-strong)]">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <SealMark size={26} />
            <span className="t-label text-[var(--ink)]">Aurum Synthesis</span>
          </Link>
          <Link to="/access" className="t-label text-[var(--ink-tertiary)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)]">
            Open terminal
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 lg:grid-cols-[14rem_minmax(0,1fr)]">
        {/* Margin contents */}
        <nav aria-label="Contents" className="lg:sticky lg:top-8 lg:self-start">
          <p className="t-label text-[var(--ink-tertiary)]">Contents</p>
          <ol className="mt-4 flex flex-col gap-2.5">
            {sections.map((s) => (
              <li key={s.n}>
                <a href={`#s${s.n}`} className="t-label flex gap-3 text-[var(--ink-tertiary)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)]">
                  <span className="text-[var(--stale)]">{s.n}</span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article>
          <p className="t-label text-[var(--brass)]">{kicker}</p>
          <h1 className="t-display-l mt-4 max-w-[20ch] text-[var(--ink)]">{title}</h1>
          <p className="t-body-l mt-6 max-w-[68ch] text-[var(--ink-secondary)]">{standfirst}</p>
          <p className="t-label-s mt-6 text-[var(--stale)]">Last revised {updated}</p>

          <Rule strong className="my-10" />

          {sections.map((s) => (
            <section key={s.n} id={`s${s.n}`} className="mb-12 scroll-mt-8">
              <div className="flex gap-5">
                <span className="t-label w-8 flex-none pt-1.5 text-[var(--stale)]">{s.n}</span>
                <div className="max-w-[68ch]">
                  <h2 className="t-display-m text-[var(--ink)]">{s.title}</h2>
                  <div className="mt-4 flex flex-col gap-4 t-body-l text-[var(--ink-secondary)]">{s.body}</div>
                </div>
              </div>
            </section>
          ))}
        </article>
      </div>

      <Footer />
    </div>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <pre className="t-data-m overflow-x-auto border border-[var(--rule-hair)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)]">
      {children}
    </pre>
  );
}
