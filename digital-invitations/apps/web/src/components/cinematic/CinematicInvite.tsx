'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  displayNames, downloadIcs, eventStart, formatDate, formatTime, getFunction, mapsUrl,
  type InviteContent, type InviteEvent, type TemplateDef,
} from '@/lib/functions';
import './cinematic.css';
import Icon from '@/components/ui/Icon';

export type RsvpInput = { attending: boolean; count: number; name: string; diet: string; message: string };
const DIETS = ['Vegetarian', 'Jain', 'Non-vegetarian', 'Vegan', 'No preference'];

export type SceneKind = 'title' | 'message' | 'photo' | 'event' | 'countdown' | 'gallery' | 'rsvp' | 'closing';
type Scene = { kind: SceneKind; index?: number; duration: number };
export type SceneFocus = { kind: SceneKind; index?: number; nonce: number };

type Props = {
  content: InviteContent;
  template: TemplateDef;
  guestName?: string;
  /** Events the guest can see; defaults to all events. */
  visibleEventIds?: string[];
  /** Skip the closed envelope/doors and start playing straight away. */
  startOpen?: boolean;
  /** Jump to and pause on a scene (used by the editor while editing a section). */
  focus?: SceneFocus | null;
  /** Called when an RSVP is submitted; return a message to show. */
  onRsvp?: (r: RsvpInput) => string | void;
  previewLabel?: boolean;
};

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 37) % 100, y: (i * 53) % 100, d: (i * 0.73) % 6, t: 7 + ((i * 1.9) % 6), s: 0.6 + ((i * 7) % 10) / 12, h: (i * 47) % 360,
}));

function useAmbientMusic(track: string, on: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!on || track === 'none') return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.08;
    master.connect(ctx.destination);
    const scales: Record<string, number[]> = {
      shehnai: [293.66, 329.63, 369.99, 440, 493.88, 440, 369.99, 329.63],
      flute: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33],
      dhol: [196, 246.94, 293.66, 246.94],
      lullaby: [392, 329.63, 349.23, 293.66, 329.63, 261.63],
      party: [261.63, 329.63, 392, 523.25, 392, 329.63],
    };
    const notes = scales[track] || scales.shehnai;
    const beat = track === 'dhol' || track === 'party' ? 0.28 : 0.55;
    let i = 0;
    const play = () => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = track === 'dhol' ? 'triangle' : 'sine';
      osc.frequency.value = notes[i++ % notes.length];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.8);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + beat * 2);
    };
    const timer = setInterval(play, beat * 1000);
    play();
    return () => { clearInterval(timer); void ctx.close(); ctxRef.current = null; };
  }, [track, on]);
}

export default function CinematicInvite({ content, template, guestName, visibleEventIds, startOpen = false, focus, onRsvp, previewLabel }: Props) {
  const fn = getFunction(content.functionId);
  const [phase, setPhase] = useState<'closed' | 'opening' | 'playing'>(startOpen ? 'playing' : 'closed');
  const [sceneIdx, setSceneIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [rsvp, setRsvp] = useState({ attending: true, count: 2, done: '', name: '', diet: 'Vegetarian', message: '' });

  const events: InviteEvent[] = useMemo(
    () => (visibleEventIds ? content.events.filter((e) => visibleEventIds.includes(e.id)) : content.events),
    [content.events, visibleEventIds],
  );

  const scenes: Scene[] = useMemo(() => {
    const list: Scene[] = [{ kind: 'title', duration: 5200 }, { kind: 'message', duration: 6000 }];
    if (content.coverPhoto) list.push({ kind: 'photo', duration: 4800 });
    events.forEach((_, index) => list.push({ kind: 'event', index, duration: 6200 }));
    if (content.showCountdown && events.length) list.push({ kind: 'countdown', duration: 5200 });
    if (content.showGallery && content.photos.length > 0) list.push({ kind: 'gallery', duration: 6500 });
    if (content.showRsvp) list.push({ kind: 'rsvp', duration: 0 });
    list.push({ kind: 'closing', duration: 0 });
    return list;
  }, [content.coverPhoto, content.showCountdown, content.showGallery, content.photos.length, content.showRsvp, events]);

  const idx = Math.min(sceneIdx, scenes.length - 1);
  const scene = scenes[idx];

  useAmbientMusic(content.music, musicOn && phase !== 'closed');

  useEffect(() => {
    if (phase !== 'opening') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setPhase('playing'), reduce ? 50 : 1900);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    setNow(Date.now());
    if (scene?.kind !== 'countdown') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [scene?.kind]);

  // A focus that existed before this player mounted (e.g. after Replay) must not skip the opening.
  const mountNonce = useRef(focus?.nonce);
  useEffect(() => {
    if (!focus || focus.nonce === mountNonce.current) return;
    const target = scenes.findIndex((s) => s.kind === focus.kind && (focus.index === undefined || s.index === focus.index));
    if (target < 0) return;
    setPhase('playing');
    setSceneIdx(target);
    setPaused(true);
    setCycle((c) => c + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.nonce]);

  const go = useCallback((delta: number) => {
    setSceneIdx((i) => Math.max(0, Math.min(scenes.length - 1, Math.min(i, scenes.length - 1) + delta)));
    setCycle((c) => c + 1);
  }, [scenes.length]);

  const open = () => { if (phase === 'closed') setPhase('opening'); };
  const replay = () => { setSceneIdx(0); setPaused(false); setCycle((c) => c + 1); setRsvp((r) => ({ ...r, done: '' })); setPhase(startOpen ? 'playing' : 'closed'); };

  const onStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea, label')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    go(e.clientX - rect.left < rect.width / 3 ? -1 : 1);
  };

  const first = events[0];
  const firstStart = first ? eventStart(first) : null;
  const names = displayNames(content);
  const style = {
    '--ci-bg': template.palette.bg, '--ci-bg2': template.palette.bg2, '--ci-ink': template.palette.ink,
    '--ci-accent': template.palette.accent, '--ci-accent2': template.palette.accent2, '--ci-surface': template.palette.surface,
    '--ci-head': template.headFont,
  } as React.CSSProperties;

  const shareText = names + ' — ' + content.headline + (first ? ' · ' + formatDate(first.date) : '');

  function renderScene(s: Scene) {
    switch (s.kind) {
      case 'title':
        return (
          <div className="ci-center">
            {guestName && <p className="ci-a ci-chip" style={{ '--d': '0s' } as React.CSSProperties}>Dear {guestName}</p>}
            <p className="ci-a ci-blessing" style={{ '--d': '.15s' } as React.CSSProperties}>{content.blessing}</p>
            <p className="ci-a ci-kicker" style={{ '--d': '.5s' } as React.CSSProperties}>{content.headline}</p>
            <h2 className="ci-names">
              <span className="ci-a ci-reveal" style={{ '--d': '.9s' } as React.CSSProperties}>{content.name1}</span>
              {content.name2 && (content.joiner
                ? <><span className="ci-a ci-joiner" style={{ '--d': '1.4s' } as React.CSSProperties}>{content.joiner}</span>
                    <span className="ci-a ci-reveal" style={{ '--d': '1.7s' } as React.CSSProperties}>{content.name2}</span></>
                : <span className="ci-a ci-sub" style={{ '--d': '1.4s' } as React.CSSProperties}>{content.name2}</span>)}
            </h2>
            {first && <p className="ci-a ci-date" style={{ '--d': '2.2s' } as React.CSSProperties}>{formatDate(first.date)}{first.venue ? ' · ' + first.address.split(',').pop()?.trim() : ''}</p>}
          </div>
        );
      case 'message':
        return (
          <div className="ci-center">
            <span className="ci-a ci-ornament" style={{ '--d': '0s' } as React.CSSProperties}>❖</span>
            <p className="ci-a ci-message" style={{ '--d': '.3s' } as React.CSSProperties}>{content.message}</p>
            {content.family && <p className="ci-a ci-family" style={{ '--d': '1.1s' } as React.CSSProperties}>{content.family}</p>}
          </div>
        );
      case 'photo':
        return (
          <div className="ci-photo">
            <img src={content.coverPhoto} alt={'Photo of ' + names} />
            <div className="ci-photo-cap"><p className="ci-a ci-kicker" style={{ '--d': '.4s' } as React.CSSProperties}>{fn.short}</p><h2 className="ci-a" style={{ '--d': '.7s' } as React.CSSProperties}>{names}</h2></div>
          </div>
        );
      case 'event': {
        const e = events[s.index ?? 0];
        if (!e) return null;
        return (
          <div className="ci-center">
            <p className="ci-a ci-kicker" style={{ '--d': '0s' } as React.CSSProperties}>{events.length > 1 ? 'Celebration ' + ((s.index ?? 0) + 1) + ' of ' + events.length : 'Save the date'}</p>
            <h2 className="ci-a ci-event-name" style={{ '--d': '.25s' } as React.CSSProperties}>{e.name}</h2>
            <div className="ci-a ci-card" style={{ '--d': '.6s' } as React.CSSProperties}>
              <div className="ci-datebox"><strong>{formatDate(e.date, { day: 'numeric' })}</strong><span>{formatDate(e.date, { month: 'short' })}</span></div>
              <div>
                <p className="ci-strong">{formatDate(e.date, { weekday: 'long' })} · {formatTime(e.time)}</p>
                <p>{e.venue}</p>
                {e.address && <p className="ci-dim">{e.address}</p>}
              </div>
            </div>
            {e.dressCode && <p className="ci-a ci-dress" style={{ '--d': '.9s' } as React.CSSProperties}>Dress code · {e.dressCode}</p>}
            <div className="ci-a ci-btns" style={{ '--d': '1.1s' } as React.CSSProperties}>
              <a href={mapsUrl(e)} target="_blank" rel="noreferrer" className="ci-btn"><Icon name="pin" /> Directions</a>
              <button type="button" className="ci-btn" onClick={() => downloadIcs(e, names)}><Icon name="calendar" /> Calendar</button>
            </div>
          </div>
        );
      }
      case 'countdown': {
        const ms = firstStart && now ? Math.max(0, firstStart.getTime() - now) : 0;
        const parts = [['Days', Math.floor(ms / 864e5)], ['Hours', Math.floor(ms / 36e5) % 24], ['Mins', Math.floor(ms / 6e4) % 60], ['Secs', Math.floor(ms / 1e3) % 60]] as const;
        return (
          <div className="ci-center">
            <p className="ci-a ci-kicker" style={{ '--d': '0s' } as React.CSSProperties}>Counting down to</p>
            <h2 className="ci-a ci-event-name" style={{ '--d': '.2s' } as React.CSSProperties}>{first?.name}</h2>
            <div className="ci-count">
              {parts.map(([label, value], i) => (
                <div key={label} className="ci-a" style={{ '--d': 0.4 + i * 0.12 + 's' } as React.CSSProperties}><strong>{now ? value : '–'}</strong><span>{label}</span></div>
              ))}
            </div>
          </div>
        );
      }
      case 'gallery':
        return (
          <div className="ci-center">
            <p className="ci-a ci-kicker" style={{ '--d': '0s' } as React.CSSProperties}>Moments</p>
            <div className="ci-gallery">
              {content.photos.slice(0, 4).map((p, i) => <img key={i} src={p} alt={'Moment ' + (i + 1)} className="ci-a" style={{ '--d': 0.2 + i * 0.25 + 's' } as React.CSSProperties} />)}
            </div>
          </div>
        );
      case 'rsvp':
        return (
          <div className="ci-center">
            <p className="ci-a ci-kicker" style={{ '--d': '0s' } as React.CSSProperties}>Kindly respond</p>
            <h2 className="ci-a ci-event-name" style={{ '--d': '.2s' } as React.CSSProperties}>Will you join us?</h2>
            {rsvp.done ? (
              <p className="ci-a ci-card ci-thanks" style={{ '--d': '0s' } as React.CSSProperties}>{rsvp.done}</p>
            ) : (
              <form className="ci-a ci-rsvp" style={{ '--d': '.45s' } as React.CSSProperties} onSubmit={(e) => {
                e.preventDefault();
                const name = (guestName || rsvp.name).trim();
                if (!name) { (e.currentTarget.elements.namedItem('ci-name') as HTMLInputElement | null)?.focus(); return; }
                const msg = onRsvp?.({ attending: rsvp.attending, count: rsvp.attending ? rsvp.count : 0, name, diet: rsvp.attending ? rsvp.diet : '', message: rsvp.message.trim() });
                setRsvp((r) => ({ ...r, done: msg || (r.attending ? 'Thank you! We can’t wait to see you.' : 'Thank you for letting us know. You’ll be missed!') }));
              }}>
                {!guestName && <input className="ci-field" name="ci-name" aria-label="Your name" placeholder="Your name or family name" maxLength={60} required value={rsvp.name} onChange={(e) => setRsvp((r) => ({ ...r, name: e.target.value }))} />}
                <div className="ci-toggle">
                  <button type="button" aria-pressed={rsvp.attending} onClick={() => setRsvp((r) => ({ ...r, attending: true }))}>Joyfully accept</button>
                  <button type="button" aria-pressed={!rsvp.attending} onClick={() => setRsvp((r) => ({ ...r, attending: false }))}>Regretfully decline</button>
                </div>
                {rsvp.attending && (
                  <div className="ci-stepper">
                    <span>Guests</span>
                    <button type="button" aria-label="Fewer guests" onClick={() => setRsvp((r) => ({ ...r, count: Math.max(1, r.count - 1) }))}>−</button>
                    <strong>{rsvp.count}</strong>
                    <button type="button" aria-label="More guests" onClick={() => setRsvp((r) => ({ ...r, count: Math.min(20, r.count + 1) }))}>+</button>
                  </div>
                )}
                {rsvp.attending && (
                  <select className="ci-field" aria-label="Meal preference" value={rsvp.diet} onChange={(e) => setRsvp((r) => ({ ...r, diet: e.target.value }))}>
                    {DIETS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}
                <input className="ci-field" aria-label="Blessing note (optional)" placeholder="Add a blessing (optional)" maxLength={200} value={rsvp.message} onChange={(e) => setRsvp((r) => ({ ...r, message: e.target.value }))} />
                <button type="submit" className="ci-btn ci-btn-solid">Send RSVP</button>
              </form>
            )}
          </div>
        );
      case 'closing':
        return (
          <div className="ci-center">
            <span className="ci-a ci-ornament" style={{ '--d': '0s' } as React.CSSProperties}>❖</span>
            <p className="ci-a ci-message" style={{ '--d': '.25s' } as React.CSSProperties}>{content.closing}</p>
            <h2 className="ci-a ci-names ci-names-sm" style={{ '--d': '.6s' } as React.CSSProperties}>{names}</h2>
            <div className="ci-a ci-btns" style={{ '--d': '1s' } as React.CSSProperties}>
              <a className="ci-btn" target="_blank" rel="noreferrer" href={'https://wa.me/?text=' + encodeURIComponent(shareText + (typeof window !== 'undefined' ? '\n' + window.location.href : ''))}>Share on WhatsApp</a>
              <button type="button" className="ci-btn" onClick={replay}><Icon name="replay" /> Watch again</button>
            </div>
          </div>
        );
    }
  }

  return (
    <div className={'ci ci-op-' + template.opening} data-phase={phase} style={style}>
      <div className={'ci-motif ci-motif-' + template.motif} aria-hidden="true">
        {template.motif === 'mandala' && <svg className="ci-mandala" viewBox="0 0 200 200">{Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="100" cy="55" rx="14" ry="45" transform={'rotate(' + i * 30 + ' 100 100)'} />)}<circle cx="100" cy="100" r="22" /><circle cx="100" cy="100" r="92" /></svg>}
        {template.motif === 'toran' && <div className="ci-toran">{Array.from({ length: 11 }, (_, i) => <i key={i} />)}</div>}
        {PARTICLES.map((p, i) => (
          <span key={i} style={{ '--x': p.x + '%', '--y': p.y + '%', '--delay': -p.d + 's', '--dur': p.t + 's', '--s': p.s, '--h': p.h } as React.CSSProperties} />
        ))}
      </div>

      {phase !== 'playing' && (
        <button type="button" className="ci-cover" onClick={open} aria-label="Open invitation">
          <span className="ci-panel ci-panel-a" />
          <span className="ci-panel ci-panel-b" />
          {template.opening === 'envelope' && <span className="ci-flap" />}
          {template.opening === 'giftbox' && <span className="ci-ribbon" />}
          {template.opening === 'bloom' && <span className="ci-petals">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--r': i * 45 + 'deg' } as React.CSSProperties} />)}</span>}
          <span className="ci-seal">{(content.name1[0] || '✦').toUpperCase()}{content.joiner && content.name2 ? ' · ' + content.name2[0].toUpperCase() : ''}</span>
          <span className="ci-cover-text">
            <small>{guestName ? 'Specially for' : fn.short + ' invitation'}</small>
            <strong>{guestName || names}</strong>
            <em>{phase === 'closed' ? 'Tap to open' : 'Opening…'}</em>
          </span>
        </button>
      )}

      {phase === 'playing' && (
        <div className="ci-stage" onClick={onStageClick}>
          <div className="ci-progress" aria-hidden="true">
            {scenes.map((s, i) => (
              <span key={i} className="ci-bar">
                <i
                  key={i === idx ? 'a' + cycle : 'b'}
                  className={i < idx ? 'ci-full' : i === idx ? (s.duration ? 'ci-run' : 'ci-full') : ''}
                  style={i === idx && s.duration ? { animationDuration: s.duration + 'ms', animationPlayState: paused ? 'paused' : 'running' } : undefined}
                  onAnimationEnd={i === idx ? () => go(1) : undefined}
                />
              </span>
            ))}
          </div>
          <div key={idx + '-' + cycle} className={'ci-scene ci-scene-' + scene.kind}>{renderScene(scene)}</div>
          <div className="ci-controls">
            <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play' : 'Pause'}>{paused ? <Icon name="play" /> : <Icon name="pause" />}</button>
            {content.music !== 'none' && <button type="button" onClick={() => setMusicOn((m) => !m)} aria-label={musicOn ? 'Mute music' : 'Play music'}>{musicOn ? <Icon name="volume" /> : <Icon name="mute" />}</button>}
            <button type="button" onClick={replay} aria-label="Replay"><Icon name="replay" /></button>
          </div>
          {previewLabel && <span className="ci-preview-tag">Preview</span>}
        </div>
      )}
    </div>
  );
}
