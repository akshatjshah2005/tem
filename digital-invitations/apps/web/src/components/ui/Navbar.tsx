'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FUNCTIONS } from '@/lib/functions';
import { LOVE_OPTIONS } from '@/lib/love-story';
import Icon from './Icon';

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={'sx-brand' + (light ? ' sx-brand-light' : '')} aria-label="uptemp home">
      <span className="sx-brand-mark" aria-hidden="true"><i /><i /></span>
      <span>up<b>temp</b></span>
    </Link>
  );
}

type Sheet = 'occasions' | 'love' | null;

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMenu(false); setSheet(null); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSheet(null); setMenu(false); } };
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll); };
  }, []);

  const mine = user ? '/dashboard' : '/login';
  const active = (href: string) => (pathname === href ? 'page' : undefined);
  const toggle = (s: Sheet) => setSheet((cur) => (cur === s ? null : s));

  return (
    <header className="sx-header" data-scrolled={scrolled} onMouseLeave={() => setSheet(null)}>
      <div className="sx-island">
        <Brand />
        <nav className="sx-links" aria-label="Main navigation">
          <button type="button" aria-expanded={sheet === 'occasions'} onClick={() => toggle('occasions')} onMouseEnter={() => setSheet('occasions')}>Occasions</button>
          <Link href="/templates" aria-current={active('/templates')}>Templates</Link>
          <Link href="/poster-maker" aria-current={active('/poster-maker')}>Posters <span className="sx-badge">Free</span></Link>
          <button type="button" aria-expanded={sheet === 'love'} onClick={() => toggle('love')} onMouseEnter={() => setSheet('love')}>Love Story</button>
          <Link href="/how-it-works" aria-current={active('/how-it-works')}>How it works</Link>
        </nav>
        <div className="sx-nav-cta">
          <Link className="sx-signin" href={mine}>{user ? 'My invitations' : 'Sign in'}</Link>
          <Link className="sx-btn sx-btn-primary sx-btn-sm" href="/templates">Start free</Link>
          <button type="button" className="sx-menu-btn" aria-expanded={menu} aria-controls="sx-drawer" aria-label={menu ? 'Close menu' : 'Open menu'} onClick={() => setMenu((o) => !o)}>
            <span data-open={menu} aria-hidden="true"><i /><i /><i /></span>
          </button>
        </div>
      </div>

      {sheet && (
        <div className="sx-sheet" role="region" aria-label={sheet === 'occasions' ? 'Occasions' : 'Love Story'}>
          <div className="sx-sheet-inner">
            <div className="sx-sheet-grid">
              {sheet === 'occasions'
                ? FUNCTIONS.map((f, i) => (
                    <Link key={f.id} href={'/templates?category=' + f.id} style={{ '--i': i } as React.CSSProperties}>
                      <span><Icon name={f.icon} /></span>
                      <strong>{f.label}</strong>
                    </Link>
                  ))
                : LOVE_OPTIONS.map((o, i) => (
                    <Link key={o.id} href={'/love-story?for=' + o.id + '#builder'} style={{ '--i': i } as React.CSSProperties}>
                      <span><Icon name={o.icon} /></span>
                      <strong>{o.label}</strong>
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      )}

      <div id="sx-drawer" className="sx-drawer" data-open={menu} aria-hidden={!menu}>
        <div className="sx-drawer-panel">
          <p>Occasions</p>
          <div className="sx-drawer-grid">
            {FUNCTIONS.map((f) => <Link key={f.id} tabIndex={menu ? 0 : -1} href={'/templates?category=' + f.id}><span><Icon name={f.icon} /></span>{f.short}</Link>)}
          </div>
          <p>Explore</p>
          <Link tabIndex={menu ? 0 : -1} href="/templates">All templates</Link>
          <Link tabIndex={menu ? 0 : -1} href="/poster-maker">Poster maker</Link>
          <Link tabIndex={menu ? 0 : -1} href="/love-story">Love Story</Link>
          <Link tabIndex={menu ? 0 : -1} href="/how-it-works">How it works</Link>
          <Link tabIndex={menu ? 0 : -1} href="/faq">FAQ</Link>
          <Link tabIndex={menu ? 0 : -1} className="sx-btn sx-btn-primary" href={mine}>{user ? 'My invitations' : 'Sign in'}</Link>
        </div>
      </div>
    </header>
  );
}
