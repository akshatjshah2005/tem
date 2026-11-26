'use client';

import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { daysBetween, type LoveStory } from '@/lib/love-story';
import '@/app/love-story/love.css';

/** The recipient's experience: passcode lock, counter, letter, chapters and finale. */
export default function LovePlayer({ story, preview = true }: { story: LoveStory; preview?: boolean }) {
  const screens = useMemo(() => {
    const list: { kind: 'lock' | 'counter' | 'letter' | 'chapter' | 'end'; i?: number }[] = [{ kind: 'lock' }];
    if (story.counter !== 'none' && story.date) list.push({ kind: 'counter' });
    list.push({ kind: 'letter' });
    story.chapters.forEach((_, i) => list.push({ kind: 'chapter', i }));
    list.push({ kind: 'end' });
    return list;
  }, [story.counter, story.date, story.chapters]);
  const [idx, setIdx] = useState(0);
  const [code, setCode] = useState('');
  const [shake, setShake] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  const i = Math.min(idx, screens.length - 1);
  const s = screens[i];

  const unlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === story.passcode.trim()) { setIdx(1); setCode(''); }
    else { setShake(true); setTimeout(() => setShake(false), 500); }
  };
  const days = now !== null ? daysBetween(story.date, now) : null;
  const count = days === null ? '–' : String(Math.abs(days));

  return (
    <div className={'lp lp-' + story.theme}>
      <div className="lp-hearts" aria-hidden="true">{Array.from({ length: 10 }, (_, k) => <i key={k} style={{ '--x': (k * 37) % 100 + '%', '--d': -k * .9 + 's' } as React.CSSProperties}>♥</i>)}</div>
      <div key={i} className="lp-screen">
        {s.kind === 'lock' && (
          <form className={'lp-lock' + (shake ? ' lp-shake' : '')} onSubmit={unlock}>
            <span className="lp-lockicon"><Icon name="lock" /></span>
            <p className="lp-kicker">For {story.to || 'you'}</p>
            <h3>{story.opening}</h3>
            <p className="lp-dim">{story.hint ? 'Hint: ' + story.hint : 'Enter the passcode'}</p>
            <input aria-label="Passcode" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder="• • • •" maxLength={12} />
            <button type="submit" className="lp-btn">Unlock</button>
            {preview && <button type="button" className="lp-skip" onClick={() => setIdx(1)}>Skip lock (preview only)</button>}
          </form>
        )}
        {s.kind === 'counter' && (
          <div className="lp-center">
            <p className="lp-kicker">{story.counter === 'since' ? 'Together for' : 'Only'}</p>
            <strong className="lp-big">{count}</strong>
            <p className="lp-kicker">{story.counterLabel || 'days'}</p>
            {story.date && <p className="lp-dim">{story.counter === 'since' ? 'It began on ' : 'Until '}{new Date(story.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
          </div>
        )}
        {s.kind === 'letter' && (
          <div className="lp-letter">
            <p className="lp-kicker">A letter for {story.to}</p>
            {story.letter.split(/\n+/).map((para, k) => <p key={k} style={{ '--d': k * .5 + 's' } as React.CSSProperties}>{para}</p>)}
          </div>
        )}
        {s.kind === 'chapter' && (() => {
          const c = story.chapters[s.i ?? 0];
          return (
            <div className="lp-chapter">
              {c.photo ? <img src={c.photo} alt={c.title} /> : <div className="lp-nophoto"><Icon name="heart" /></div>}
              <p className="lp-kicker">Chapter {(s.i ?? 0) + 1}{c.date ? ' · ' + new Date(c.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}</p>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          );
        })()}
        {s.kind === 'end' && (
          <div className="lp-center">
            <span className="lp-heart"><Icon name="heart" /></span>
            <p className="lp-script">{story.signoff},</p>
            <h3>{story.from}</h3>
            <button type="button" className="lp-btn" onClick={() => setIdx(0)}><Icon name="replay" /> Read again</button>
          </div>
        )}
      </div>
      {s.kind !== 'lock' && (
        <div className="lp-nav">
          <button type="button" onClick={() => setIdx(Math.max(1, i - 1))} disabled={i <= 1}>← Back</button>
          <span>{i} / {screens.length - 1}</span>
          <button type="button" onClick={() => setIdx(Math.min(screens.length - 1, i + 1))} disabled={i >= screens.length - 1}>Next →</button>
        </div>
      )}
    </div>
  );
}
