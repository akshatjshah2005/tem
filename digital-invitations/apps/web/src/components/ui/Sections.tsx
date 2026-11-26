import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import Icon from './Icon';
import Reveal from './Reveal';
import { faqs, features, steps } from '@/lib/site-content';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sx">
      <Reveal />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

/** Left-aligned page header on a soft blue grid. */
export function PageHero({ kicker, title, text, children }: { kicker: string; title: React.ReactNode; text?: string; children?: React.ReactNode }) {
  return (
    <section className="sx-page-hero">
      <div className="sx-shell sx-page-hero-inner">
        <p className="sx-eyebrow rv">{kicker}</p>
        <h1 className="rv" style={{ '--rd': '80ms' } as React.CSSProperties}>{title}</h1>
        {text && <p className="sx-page-hero-text rv" style={{ '--rd': '160ms' } as React.CSSProperties}>{text}</p>}
        {children && <div className="rv" style={{ '--rd': '220ms' } as React.CSSProperties}>{children}</div>}
      </div>
    </section>
  );
}

const stepIcons = ['templates', 'pen', 'send'] as const;

/** Sticky heading on the left, a connected vertical timeline on the right. */
export function StepsSection({ tint = false }: { tint?: boolean }) {
  return (
    <section className={'sx-section' + (tint ? ' sx-section-tint' : '')}>
      <div className="sx-shell sx-timeline-wrap">
        <div className="sx-timeline-head rv">
          <p className="sx-eyebrow">How it works</p>
          <h2>Three steps.<br /><em>Five minutes.</em></h2>
          <p className="sx-muted">No design skills, and no app for your guests.</p>
          <Link className="sx-btn sx-btn-primary" href="/templates">Start your invitation <Icon name="arrow-right" /></Link>
        </div>
        <ol className="sx-timeline">
          {steps.map((s, i) => (
            <li key={s.title} className="rv" style={{ '--rd': i * 120 + 'ms' } as React.CSSProperties}>
              <span className="sx-timeline-dot"><Icon name={stepIcons[i]} /></span>
              <div>
                <small>Step {String(i + 1).padStart(2, '0')}</small>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Feature mosaic: the first tile is large. */
export function FeaturesSection() {
  return (
    <section className="sx-section">
      <div className="sx-shell">
        <div className="sx-head rv">
          <div>
            <p className="sx-eyebrow">Inside every invitation</p>
            <h2>Everything your guests need, in one link</h2>
          </div>
        </div>
        <div className="sx-bento">
          {features.map((f, i) => (
            <div className="sx-bento-tile rv" key={f.title} style={{ '--rd': i * 60 + 'ms' } as React.CSSProperties}>
              <span className="sx-bento-icon"><Icon name={f.icon} /></span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Two columns: heading and help card on the left, questions on the right. */
export function FaqSection({ limit }: { limit?: number }) {
  const list = limit ? faqs.slice(0, limit) : faqs;
  return (
    <section className="sx-section">
      <div className="sx-shell sx-faq-wrap">
        <div className="sx-faq-side rv">
          <p className="sx-eyebrow">Questions</p>
          <h2>Good to know</h2>
          <div className="sx-helpcard">
            <span className="sx-helpcard-icon"><Icon name="chat" /></span>
            <strong>Still have a question?</strong>
            <p>Tell us what you need — we usually reply within a day.</p>
            <Link className="sx-textlink" href="/contact">Contact us <Icon name="arrow-right" /></Link>
          </div>
          {limit && <Link className="sx-textlink" href="/faq">See all questions <Icon name="arrow-right" /></Link>}
        </div>
        <div className="sx-faq rv" style={{ '--rd': '120ms' } as React.CSSProperties}>
          {list.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary><span className="sx-faq-num">{String(i + 1).padStart(2, '0')}</span>{f.q}<Icon name="plus" className="sx-faq-plus" /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Compact call-to-action card. */
export function CtaBand() {
  return (
    <section className="sx-section sx-section-tight">
      <div className="sx-shell">
        <div className="sx-cta rv">
          <span className="sx-cta-icon"><Icon name="sparkles" /></span>
          <div>
            <h2>Ready when you are</h2>
            <p>Pick a design, add your details and send every guest an invitation with their own name in it.</p>
          </div>
          <div className="sx-actions">
            <Link className="sx-btn sx-btn-primary" href="/templates">Start your invitation</Link>
            <Link className="sx-btn sx-btn-ghost" href="/how-it-works">How it works</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
