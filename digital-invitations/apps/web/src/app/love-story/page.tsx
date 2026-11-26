'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { SiteShell } from '@/components/ui/Sections';
import DeviceFrame from '@/components/cinematic/DeviceFrame';
import Icon, { type IconName } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import LovePlayer from '@/components/love/LovePlayer';
import { getItem, saveStory } from '@/lib/store';
import { LOVE_OPTIONS, LOVE_PRESETS, type LoveChapter, type LoveOptionId, type LoveStory } from '@/lib/love-story';
import './love.css';

const KEY = 'uptemp-love-v1';
const THEMES: { id: LoveStory['theme']; label: string; colors: [string, string] }[] = [
  { id: 'blush', label: 'Blush', colors: ['#fff1f4', '#e11d48'] },
  { id: 'sky', label: 'Sky', colors: ['#eff6ff', '#2563eb'] },
  { id: 'midnight', label: 'Midnight', colors: ['#0f172a', '#f9a8d4'] },
];

function resize(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', .82));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/* ---------- builder ---------- */
function Builder() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const initialKind = (LOVE_OPTIONS.find((o) => o.id === params?.get('for'))?.id || 'how') as LoveOptionId;
  const [story, setStory] = useState<LoveStory>(LOVE_PRESETS[initialKind]);
  const [hydrated, setHydrated] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    const forParam = params?.get('for');
    try {
      const editing = params?.get('edit') ? getItem(params.get('edit')!) : undefined;
      const raw = localStorage.getItem(KEY);
      if (editing?.kind === 'love') setStory(editing.story);
      else if (raw && !forParam) setStory(JSON.parse(raw) as LoveStory);
    } catch { /* ignore */ }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const forParam = params?.get('for') as LoveOptionId | null;
    if (forParam && LOVE_PRESETS[forParam] && hydrated) setStory((s) => ({ ...LOVE_PRESETS[forParam], from: s.from, to: s.to }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.get('for')]);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(story)); } catch { toast.error('Couldn’t save — try fewer or smaller photos.', { id: 'love-save' }); } }, 700);
    return () => clearTimeout(t);
  }, [story, hydrated]);

  const set = <K extends keyof LoveStory>(k: K, v: LoveStory[K]) => setStory((s) => ({ ...s, [k]: v }));
  const choose = (id: LoveOptionId) => { setStory((s) => ({ ...LOVE_PRESETS[id], from: s.from, to: s.to })); setPreviewKey((k) => k + 1); };
  const setChapter = (id: string, patch: Partial<LoveChapter>) => setStory((s) => ({ ...s, chapters: s.chapters.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const addChapter = () => {
    if (story.chapters.length >= 14) { toast.error('A story can have up to 14 chapters.'); return; }
    setStory((s) => ({ ...s, chapters: [...s.chapters, { id: 'c' + Date.now(), title: 'A moment I love', date: '', text: '', photo: '' }] }));
  };
  const moveChapter = (id: string, dir: -1 | 1) => setStory((s) => {
    const i = s.chapters.findIndex((c) => c.id === id), j = i + dir;
    if (j < 0 || j >= s.chapters.length) return s;
    const list = [...s.chapters]; [list[i], list[j]] = [list[j], list[i]];
    return { ...s, chapters: list };
  });
  const onPhoto = async (id: string, file?: File) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast.error('Choose a JPG, PNG or WebP photo.'); return; }
    try { setChapter(id, { photo: await resize(file) }); } catch { toast.error('This photo could not be opened.'); }
  };

  const passOk = story.passcode.trim().length >= 4;
  const publish = () => {
    if (!passOk) { toast.error('Set a passcode of at least 4 characters first.'); return; }
    if (!user) { toast('Sign in to publish — your story is saved in this browser.', { icon: null }); router.push('/login?next=/love-story'); return; }
    try {
      const saved = saveStory({ id: params?.get('edit') || undefined, title: 'Love Story · ' + (story.to || 'for you'), ownerId: user.id, status: 'PUBLISHED', story });
      toast.success('Published! Your private link is ready on the dashboard.');
      router.push('/dashboard?published=' + saved.id);
    } catch {
      toast.error('Couldn’t save — try fewer or smaller photos.');
    }
  };

  const [open, setOpen] = useState<string>('people');
  const option = LOVE_OPTIONS.find((o) => o.id === story.kind);
  const sections: { id: string; title: string; done: boolean; summary: string }[] = [
    { id: 'people', title: 'Who is it from and for?', done: !!story.from.trim() && !!story.to.trim(), summary: story.from && story.to ? story.from + ' → ' + story.to : 'Add both names' },
    { id: 'date', title: 'The special date', done: story.counter === 'none' || !!story.date, summary: story.counter === 'none' ? 'No counter' : story.date ? (story.counter === 'since' ? 'Days since ' : 'Days until ') + story.date : 'Pick a date' },
    { id: 'lock', title: 'Passcode', done: passOk, summary: passOk ? 'Locked · hint ' + (story.hint ? 'added' : 'not added') : 'At least 4 characters' },
    { id: 'words', title: 'Your letter', done: story.letter.trim().length > 0, summary: story.letter.trim() ? story.letter.trim().slice(0, 42) + '…' : 'Write a few lines' },
    { id: 'chapters', title: 'Chapters', done: story.chapters.length > 0, summary: story.chapters.length + ' of 14 chapters' },
    { id: 'finish', title: 'Finishing touches', done: !!story.signoff.trim(), summary: story.signoff + ' · ' + (THEMES.find((t) => t.id === story.theme)?.label || '') + ' theme' },
  ];
  const doneCount = sections.filter((s) => s.done).length;

  const body = (id: string) => {
    switch (id) {
      case 'people': return (
        <div className="ls-row">
          <label className="ls-field"><span>From (your name)</span><input value={story.from} maxLength={30} onChange={(e) => set('from', e.target.value)} /></label>
          <label className="ls-field"><span>To (their name)</span><input value={story.to} maxLength={30} onChange={(e) => set('to', e.target.value)} /></label>
        </div>
      );
      case 'date': return (
        <>
          <div className="ls-seg" role="group" aria-label="Counter">
            {(['since', 'until', 'none'] as const).map((m) => <button key={m} type="button" aria-pressed={story.counter === m} onClick={() => set('counter', m)}>{m === 'since' ? 'Days since' : m === 'until' ? 'Days until' : 'No counter'}</button>)}
          </div>
          {story.counter !== 'none' && (
            <div className="ls-row">
              <label className="ls-field"><span>Date</span><input type="date" value={story.date} onChange={(e) => set('date', e.target.value)} /></label>
              <label className="ls-field"><span>Counter label</span><input value={story.counterLabel} maxLength={40} onChange={(e) => set('counterLabel', e.target.value)} /></label>
            </div>
          )}
        </>
      );
      case 'lock': return (
        <>
          <div className="ls-row">
            <label className="ls-field"><span>Passcode (4–12 characters)</span><input value={story.passcode} maxLength={12} onChange={(e) => set('passcode', e.target.value)} aria-invalid={!passOk} /></label>
            <label className="ls-field"><span>Hint for them</span><input value={story.hint} maxLength={60} onChange={(e) => set('hint', e.target.value)} /></label>
          </div>
          {!passOk && <p className="ls-warn">Use at least 4 characters — something only they would know.</p>}
        </>
      );
      case 'words': return (
        <>
          <label className="ls-field"><span>Opening line</span><input value={story.opening} maxLength={70} onChange={(e) => set('opening', e.target.value)} /></label>
          <label className="ls-field"><span>Letter <em>{story.letter.length}/1200</em></span><textarea rows={6} value={story.letter} maxLength={1200} onChange={(e) => set('letter', e.target.value)} /></label>
        </>
      );
      case 'chapters': return (
        <>
          <ol className="ls-chapters">
            {story.chapters.map((c, i) => (
              <li key={c.id} className="ls-chapter">
                <div className="ls-chapter-head">
                  <span className="ls-num">{i + 1}</span>
                  <input aria-label={'Chapter ' + (i + 1) + ' title'} value={c.title} maxLength={50} onChange={(e) => setChapter(c.id, { title: e.target.value })} />
                  <button type="button" onClick={() => moveChapter(c.id, -1)} disabled={i === 0} aria-label="Move up"><Icon name="up" /></button>
                  <button type="button" onClick={() => moveChapter(c.id, 1)} disabled={i === story.chapters.length - 1} aria-label="Move down"><Icon name="down" /></button>
                  <button type="button" className="ls-del" onClick={() => set('chapters', story.chapters.filter((x) => x.id !== c.id))} aria-label={'Remove ' + c.title}><Icon name="close" /></button>
                </div>
                <div className="ls-chapter-body">
                  {c.photo
                    ? <span className="ls-thumb"><img src={c.photo} alt="" /><button type="button" onClick={() => setChapter(c.id, { photo: '' })}>Remove</button></span>
                    : <label className="ls-upload" aria-label={'Add photo to chapter ' + (i + 1)}><Icon name="camera" /><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { void onPhoto(c.id, e.target.files?.[0]); e.target.value = ''; }} /></label>}
                  <div>
                    <label className="ls-field"><span>Date (optional)</span><input type="date" value={c.date} onChange={(e) => setChapter(c.id, { date: e.target.value })} /></label>
                    <label className="ls-field"><span>What happened</span><textarea rows={3} value={c.text} maxLength={400} onChange={(e) => setChapter(c.id, { text: e.target.value })} /></label>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className="ls-add" onClick={addChapter} disabled={story.chapters.length >= 14}><Icon name="plus" /> Add a chapter</button>
        </>
      );
      default: return (
        <>
          <label className="ls-field"><span>Sign-off</span><input value={story.signoff} maxLength={40} onChange={(e) => set('signoff', e.target.value)} /></label>
          <p className="ls-mini">Colour theme</p>
          <div className="ls-themes" role="group" aria-label="Colour theme">
            {THEMES.map((t) => <button key={t.id} type="button" aria-pressed={story.theme === t.id} onClick={() => set('theme', t.id)}><i style={{ background: 'linear-gradient(135deg,' + t.colors[0] + ' 50%,' + t.colors[1] + ' 50%)' }} />{t.label}</button>)}
          </div>
        </>
      );
    }
  };

  return (
    <section className="ls-studio" id="builder">
      <div className="sx-shell">
        <div className="ls-moments" role="group" aria-label="What is it for?">
          <span className="ls-moments-label">It’s for</span>
          {LOVE_OPTIONS.map((o) => (
            <button key={o.id} type="button" aria-pressed={story.kind === o.id} onClick={() => choose(o.id)} title={o.tagline}>
              <Icon name={o.icon} />{o.label}
            </button>
          ))}
        </div>

        <div className="ls-builder">
          <div className="ls-preview">
            <div className="ls-preview-card">
              <div className="ls-preview-head">
                <span><Icon name="eye" /> Live preview</span>
                <button type="button" onClick={() => setPreviewKey((k) => k + 1)} aria-label="Restart preview"><Icon name="replay" /> Restart</button>
              </div>
              <div style={{ '--cdev-h': 'min(600px, 74vh)' } as React.CSSProperties}>
                <DeviceFrame view="phone"><LovePlayer key={previewKey + story.kind} story={story} /></DeviceFrame>
              </div>
              <p className="ls-preview-note">This is exactly what {story.to || 'they'} will see.</p>
            </div>
          </div>

          <div className="ls-form">
            <div className="ls-form-head">
              <div>
                <p className="sx-eyebrow">{option?.label}</p>
                <h2>Write your story</h2>
                <p className="sx-muted">Saved in this browser as you type.</p>
              </div>
              <div className="ls-progress" style={{ '--p': doneCount / sections.length } as React.CSSProperties} aria-label={doneCount + ' of ' + sections.length + ' sections done'}>
                <strong>{doneCount}/{sections.length}</strong>
              </div>
            </div>

            <div className="ls-acc">
              {sections.map((s, i) => {
                const isOpen = open === s.id;
                return (
                  <div key={s.id} className="ls-acc-item" data-open={isOpen} data-done={s.done}>
                    <button type="button" className="ls-acc-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? '' : s.id)}>
                      <span className="ls-acc-num">{s.done ? <Icon name="check" /> : i + 1}</span>
                      <span><strong>{s.title}</strong><small>{s.summary}</small></span>
                    </button>
                    {isOpen && (
                      <div className="ls-acc-body">
                        {body(s.id)}
                        {i < sections.length - 1 && <button type="button" className="ls-next" onClick={() => setOpen(sections[i + 1].id)}>Next: {sections[i + 1].title} →</button>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="ls-final">
              <button type="button" className="sx-btn sx-btn-primary" onClick={publish}>Publish & get my link</button>
              <button type="button" className="sx-btn sx-btn-ghost" onClick={() => { choose(story.kind); toast('Reset to the sample story'); }}>Start over</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoveStoryPage() {
  return (
    <SiteShell>
      <section className="ls-hero">
        <div className="sx-shell ls-hero-grid">
          <div className="sx-rise">
            <p className="sx-eyebrow">Love Story</p>
            <h1>Some stories deserve <span className="sx-hl">a lock and key.</span></h1>
            <p>Your letter, your chapters and your photos — behind a passcode only they know. For Valentine’s, anniversaries, birthdays, long distance, or just because.</p>
            <div className="sx-actions">
              <a href="#builder" className="sx-btn sx-btn-primary">Start writing</a>
            </div>
            <ul className="sx-ticks"><li>Private passcode</li><li>Up to 14 chapters</li><li>No app needed</li></ul>
          </div>
          <div className="ls-envelope" aria-hidden="true">
            <div className="ls-env-back" />
            <div className="ls-env-letter"><small>For you</small><b><Icon name="heart" /></b><i>• • • •</i></div>
            <div className="ls-env-front" />
            <div className="ls-env-flap" />
            <span className="ls-env-seal"><Icon name="lock" /></span>
            <div className="ls-env-hearts">{Array.from({ length: 6 }, (_, k) => <em key={k} style={{ '--k': k } as React.CSSProperties}><Icon name="heart" /></em>)}</div>
          </div>
        </div>
      </section>

      <Suspense fallback={<p className="sx-shell sx-muted">Loading…</p>}><Builder /></Suspense>

      <section className="sx-section">
        <div className="sx-shell ls-how">
          {[
            { icon: 'pen' as IconName, t: 'Write', d: 'Add your letter, the special date and chapters with photos. Watch the preview as you type.' },
            { icon: 'lock' as IconName, t: 'Lock', d: 'Choose a passcode only they would know — like the date you met — and add a hint.' },
            { icon: 'send' as IconName, t: 'Send', d: 'Share one link. They enter the passcode and read your story, chapter by chapter.' },
          ].map((s, i) => (
            <div key={s.t} className="ls-how-item" style={{ '--i': i } as React.CSSProperties}>
              <span><Icon name={s.icon} /></span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}