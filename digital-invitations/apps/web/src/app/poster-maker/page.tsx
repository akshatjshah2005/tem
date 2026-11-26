'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { SiteShell } from '@/components/ui/Sections';
import Icon, { type IconName } from '@/components/ui/Icon';
import {
  POSTER_OCCASIONS, POSTER_SIZES, POSTER_STYLES, computeCount,
  type Lang, type PosterOccasion, type PosterSize, type PosterStyleId,
} from '@/lib/posters';
import './poster.css';

type Opts = {
  occ: PosterOccasion; styleId: PosterStyleId; size: PosterSize; lang: Lang;
  name1: string; name2: string; date: string; line: string; photo: HTMLImageElement | null;
};

const FAQ = [
  { q: 'Is my photo uploaded anywhere?', a: 'No. The poster is drawn in your browser. Your photo never leaves your device.' },
  { q: 'Which sizes can I download?', a: '9:16 for WhatsApp status, Reels and Stories; 4:5 for Instagram posts; and 1:1 square. Every poster is 1080 pixels wide.' },
  { q: 'Is the birth year shown on birthday posters?', a: 'No. We use the date of birth only to work out the age — the year is never printed.' },
  { q: 'Can I write in Hindi?', a: 'Yes. Switch the wording to Hindi, and type names in any script.' },
];

/* ---------- canvas drawing ---------- */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, family: string, weight: string, start: number, maxW: number) {
  let size = start;
  do { ctx.font = weight + ' ' + size + 'px "' + family + '", serif'; size -= 4; } while (ctx.measureText(text).width > maxW && size > 24);
  return size + 4;
}

function drawPoster(canvas: HTMLCanvasElement, o: Opts) {
  const size = POSTER_SIZES.find((s) => s.id === o.size)!;
  const st = POSTER_STYLES.find((s) => s.id === o.styleId)!;
  const W = size.w, H = size.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const tall = H / W;

  // background
  const g = ctx.createLinearGradient(0, 0, W * .3, H);
  g.addColorStop(0, st.bg[0]); g.addColorStop(1, st.bg[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // decoration
  ctx.save();
  if (o.styleId === 'royal') {
    ctx.strokeStyle = st.accent; ctx.globalAlpha = .18; ctx.lineWidth = 2;
    for (let r = 120; r < W; r += 70) { ctx.beginPath(); ctx.arc(W / 2, H * .36, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = .12;
    for (let i = 0; i < 24; i++) { ctx.save(); ctx.translate(W / 2, H * .36); ctx.rotate((i / 24) * Math.PI * 2); ctx.beginPath(); ctx.ellipse(0, -W * .32, 26, 90, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  } else if (o.styleId === 'floral') {
    const flower = (x: number, y: number, r: number, c: string) => {
      ctx.fillStyle = c;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(x + Math.cos(i * Math.PI / 3) * r * .6, y + Math.sin(i * Math.PI / 3) * r * .6, r * .5, r * .32, i * Math.PI / 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#f6c56b'; ctx.beginPath(); ctx.arc(x, y, r * .22, 0, Math.PI * 2); ctx.fill();
    };
    ctx.globalAlpha = .55;
    [[60, 80, 90], [190, 30, 60], [W - 70, 90, 100], [W - 200, 40, 55], [70, H - 90, 95], [W - 80, H - 110, 110], [210, H - 40, 60]].forEach(([x, y, r], i) => flower(x, y, r, i % 2 ? '#f2b8c6' : '#e88aa3'));
  } else if (o.styleId === 'modern') {
    ctx.globalAlpha = .14; ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(W * .95, H * .08, W * .42, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-W * .05, H * .95, W * .5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .25; ctx.strokeStyle = st.accent; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(W * .1, H * .14, 70, 0, Math.PI * 2); ctx.stroke();
  } else {
    for (let i = 0; i < 90; i++) {
      const x = (i * 197) % W, y = (i * 331) % H, r = 2 + (i % 5);
      ctx.globalAlpha = .25 + (i % 4) * .15; ctx.fillStyle = i % 3 ? st.accent : '#ff7ab6';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = .9; ctx.strokeStyle = st.accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 60); for (let x = 0; x <= W; x += 60) ctx.quadraticCurveTo(x + 30, 110, x + 60, 60); ctx.stroke();
    for (let x = 30; x < W; x += 60) { ctx.fillStyle = (x / 60) % 2 > 1 ? '#ff7ab6' : st.accent; ctx.beginPath(); ctx.arc(x, 92, 9, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();

  // frame
  ctx.strokeStyle = st.accent; ctx.lineWidth = 3; ctx.globalAlpha = .7;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.globalAlpha = 1;

  const y = (f: number) => H * f;
  const yy = (story: number, portrait: number, square: number) => (tall > 1.6 ? y(story) : tall > 1.15 ? y(portrait) : y(square));
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  // kicker
  ctx.fillStyle = st.accent;
  ctx.font = '700 ' + (tall > 1.15 ? 40 : 34) + 'px "Plus Jakarta Sans", sans-serif';
  const kicker = o.occ.kicker[o.lang];
  ctx.fillText(o.lang === 'en' ? kicker.toUpperCase().split('').join(String.fromCharCode(8202)) : kicker, W / 2, yy(.085, .1, .1));

  // photo or icon
  const cy = yy(.27, .3, .29);
  const r = tall > 1.6 ? W * .25 : tall > 1.15 ? W * .19 : W * .15;
  ctx.save();
  ctx.beginPath(); ctx.arc(W / 2, cy, r + 14, 0, Math.PI * 2); ctx.fillStyle = st.accent; ctx.globalAlpha = .9; ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(W / 2, cy, r, 0, Math.PI * 2); ctx.clip();
  if (o.photo) {
    const s = Math.max((r * 2) / o.photo.width, (r * 2) / o.photo.height);
    ctx.drawImage(o.photo, W / 2 - (o.photo.width * s) / 2, cy - (o.photo.height * s) / 2, o.photo.width * s, o.photo.height * s);
  } else {
    ctx.fillStyle = st.bg[1]; ctx.fillRect(W / 2 - r, cy - r, r * 2, r * 2);
    ctx.font = Math.round(r * 1.05) + 'px serif'; ctx.fillText(o.occ.icon, W / 2, cy + r * .06);
  }
  ctx.restore();

  // names
  ctx.fillStyle = st.ink;
  const paired = o.name2 && o.occ.name2Label && !['Car', 'Home name'].includes(o.occ.name2Label);
  const namesY = yy(.475, .53, .52);
  if (paired) {
    const nm = o.name1 + '  &  ' + o.name2;
    fitFont(ctx, nm, st.head, '700', tall > 1.15 ? 104 : 88, W - 160);
    ctx.fillText(nm, W / 2, namesY);
  } else {
    fitFont(ctx, o.name1, st.head, '700', tall > 1.15 ? 100 : 84, W - 160);
    ctx.fillText(o.name1, W / 2, namesY);
    if (o.name2) { ctx.fillStyle = st.accent; ctx.font = '600 44px "Plus Jakarta Sans", sans-serif'; ctx.fillText(o.name2, W / 2, namesY + (tall > 1.15 ? 82 : 66)); ctx.fillStyle = st.ink; }
  }

  // count
  const count = computeCount(o.occ, o.date);
  let cursor = yy(.6, .69, .7) + (paired || !o.name2 ? 0 : 30);
  if (count) {
    const age = o.occ.count === 'age' && count.unit !== 'TODAY';
    if (age) { ctx.fillStyle = st.accent; ctx.font = '700 36px "Plus Jakarta Sans", sans-serif'; ctx.fillText('TURNING', W / 2, cursor - (tall > 1.15 ? 40 : 30)); cursor += tall > 1.15 ? 60 : 45; }
    ctx.fillStyle = st.ink;
    ctx.font = '800 ' + (tall > 1.6 ? 230 : tall > 1.15 ? 180 : 150) + 'px "' + st.head + '", serif';
    ctx.fillText(count.value, W / 2, cursor);
    cursor += tall > 1.6 ? 150 : tall > 1.15 ? 120 : 100;
    if (!age) { ctx.fillStyle = st.accent; ctx.font = '700 40px "Plus Jakarta Sans", sans-serif'; ctx.fillText(count.unit, W / 2, cursor); cursor += 70; }
  }

  // date line
  if (o.date) {
    const d = new Date(o.date + 'T00:00:00');
    if (Number.isFinite(d.getTime())) {
      const txt = o.occ.count === 'age' ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      ctx.fillStyle = st.ink; ctx.globalAlpha = .85; ctx.font = '600 38px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(txt, W / 2, cursor + 10); ctx.globalAlpha = 1;
      cursor += 80;
    }
  }

  // custom line
  if (o.line) {
    ctx.fillStyle = st.ink;
    ctx.font = 'italic 500 50px "Playfair Display", serif';
    const lines = wrap(ctx, o.line, W - 220).slice(0, 3);
    const startY = Math.max(cursor + 30, yy(.82, .86, .86) - (lines.length - 1) * 32);
    lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * 64));
  }

  // watermark
  ctx.fillStyle = st.ink; ctx.globalAlpha = .55;
  ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Made with uptemp', W / 2, H - 70);
  ctx.globalAlpha = 1;
}

/* ---------- page: occasion rail · canvas stage · tabbed controls ---------- */
type Tab = 'details' | 'words' | 'look';
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'details', label: 'Details', icon: 'pen' },
  { id: 'words', label: 'Wording', icon: 'quote' },
  { id: 'look', label: 'Style', icon: 'palette' },
];
const countLabel = (o: PosterOccasion) => (o.count === 'until' ? 'Days to go' : o.count === 'since' ? 'Years together' : o.count === 'age' ? 'Age, no birth year' : 'Wishes poster');

export default function PosterMakerPage() {
  const [occId, setOccId] = useState(POSTER_OCCASIONS[0].id);
  const occ = POSTER_OCCASIONS.find((o) => o.id === occId)!;
  const [styleId, setStyleId] = useState<PosterStyleId>(occ.style);
  const [size, setSize] = useState<PosterSize>('story');
  const [lang, setLang] = useState<Lang>('en');
  const [name1, setName1] = useState(occ.name1);
  const [name2, setName2] = useState(occ.name2);
  const [date, setDate] = useState(occ.date);
  const [line, setLine] = useState(occ.lines.en[0]);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [tab, setTab] = useState<Tab>('details');
  const [drawn, setDrawn] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pickOccasion = (o: PosterOccasion) => {
    setOccId(o.id); setStyleId(o.style); setName1(o.name1); setName2(o.name2); setDate(o.date); setLine(o.lines[lang][0]);
    setTab('details');
    if (window.innerWidth < 1000) document.getElementById('pm-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const fams = ['700 40px "Cinzel"', '700 40px "Playfair Display"', 'italic 500 40px "Playfair Display"', '700 40px "Plus Jakarta Sans"', '800 40px "Plus Jakarta Sans"'];
    Promise.all(fams.map((f) => document.fonts.load(f))).finally(() => setFontsReady(true));
  }, []);

  const opts: Opts = useMemo(() => ({ occ, styleId, size, lang, name1, name2, date, line, photo }), [occ, styleId, size, lang, name1, name2, date, line, photo]);

  useEffect(() => {
    if (canvasRef.current) drawPoster(canvasRef.current, opts);
  }, [opts, fontsReady, drawn]);

  // Re-trigger the "pop" animation only when the poster's look changes, not on every keystroke.
  useEffect(() => { setDrawn((d) => d + 1); }, [occId, styleId, size]);

  const onPhoto = (file?: File) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast.error('Choose a JPG, PNG or WebP photo.'); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setPhoto(img);
    img.onerror = () => toast.error('This photo could not be opened.');
    img.src = url;
  };

  const fileName = () => occ.id + '-poster-' + size + '.png';
  const toBlob = useCallback(() => new Promise<Blob | null>((res) => canvasRef.current?.toBlob(res, 'image/png') ?? res(null)), []);

  const download = async () => {
    const blob = await toBlob();
    if (!blob) { toast.error('Couldn’t create the image. Try again.'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName(); a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast.success('Poster downloaded');
  };

  const count = computeCount(occ, date);
  const caption = occ.caption
    .replaceAll('{names}', name2 && occ.name2Label && !['Car', 'Home name'].includes(occ.name2Label) ? name1 + ' & ' + name2 : name1)
    .replaceAll('{names2}', name2 || name1)
    .replaceAll('{count}', count?.value || '');

  const share = async () => {
    const blob = await toBlob();
    const file = blob ? new File([blob], fileName(), { type: 'image/png' }) : null;
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (file && nav.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], text: caption }); } catch { /* cancelled */ }
    } else {
      toast('Sharing isn’t supported in this browser — download the poster instead.', { icon: null });
    }
  };

  const copyCaption = async () => {
    try { await navigator.clipboard.writeText(caption); toast.success('Caption copied'); } catch { toast.error('Couldn’t copy — select the text instead.'); }
  };

  const groups = ['Celebrations', 'Festivals'] as const;

  return (
    <SiteShell>
      <section className="pm-top">
        <div className="sx-shell pm-top-inner sx-rise">
          <div>
            <p className="sx-eyebrow">Free poster maker</p>
            <h1>Make a celebration poster <span className="sx-hl">in a minute</span></h1>
          </div>
          <ul className="pm-facts">
            <li><strong>{POSTER_OCCASIONS.length}</strong>occasions</li>
            <li><strong>3</strong>sizes</li>
            <li><strong>0</strong>sign-ups</li>
          </ul>
        </div>
      </section>

      <section className="pm-studio-wrap">
        <div className="sx-shell pm-studio">
          {/* 1 · occasion rail */}
          <aside className="pm-rail" aria-label="Choose your occasion">
            <p className="pm-step"><span>1</span>Occasion</p>
            {groups.map((g) => (
              <div key={g} className="pm-rail-group">
                <small>{g}</small>
                {POSTER_OCCASIONS.filter((o) => o.group === g).map((o) => (
                  <button key={o.id} type="button" aria-pressed={occId === o.id} onClick={() => pickOccasion(o)}>
                    <span><Icon name={o.icon} /></span>
                    <b>{o.label}<em>{countLabel(o)}</em></b>
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* 2 · canvas */}
          <div className="pm-stage" id="pm-stage">
            <div className="pm-stage-top">
              <p className="pm-step"><span>2</span>Preview</p>
              <div className="pm-sizes" role="group" aria-label="Size">
                {POSTER_SIZES.map((s) => (
                  <button key={s.id} type="button" aria-pressed={size === s.id} onClick={() => setSize(s.id)} title={s.sub}>
                    <i style={{ aspectRatio: s.w + ' / ' + s.h }} />{s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="pm-canvas" data-size={size}>
              <canvas key={drawn} ref={canvasRef} aria-label={'Poster preview: ' + occ.label} />
            </div>
            <div className="pm-actions">
              <button type="button" className="sx-btn sx-btn-primary" onClick={download}><Icon name="download" /> Download PNG</button>
              <button type="button" className="sx-btn sx-btn-ghost" onClick={share}><Icon name="share" /> Share</button>
            </div>
            <div className="pm-caption">
              <div>
                <small>Suggested caption</small>
                <p>{caption}</p>
              </div>
              <button type="button" onClick={copyCaption}><Icon name="copy" /> Copy</button>
            </div>
          </div>

          {/* 3 · controls */}
          <div className="pm-panel">
            <p className="pm-step"><span>3</span>Customize · {occ.label}</p>
            <div className="pm-tabs" role="tablist" aria-label="Customize">
              {TABS.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}><Icon name={t.icon} />{t.label}</button>
              ))}
            </div>

            <div className="pm-tabpanel" role="tabpanel" key={tab}>
              {tab === 'details' && (
                <>
                  <div className="pm-photo">
                    {photo
                      ? <><span className="pm-photo-ok"><Icon name="check" /> Photo added</span><button type="button" className="pm-link" onClick={() => setPhoto(null)}>Remove</button></>
                      : <label className="pm-drop"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} /><span className="pm-drop-icon"><Icon name="camera" /></span><b>Add a photo</b><small>Optional · stays on your device</small></label>}
                  </div>
                  <label className="pm-field"><span>{occ.name1Label}</span><input value={name1} maxLength={40} onChange={(e) => setName1(e.target.value)} /></label>
                  {occ.name2Label && <label className="pm-field"><span>{occ.name2Label}</span><input value={name2} maxLength={40} onChange={(e) => setName2(e.target.value)} /></label>}
                  <label className="pm-field"><span>{occ.dateLabel}</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
                  {count && <div className="pm-count"><strong>{count.value}</strong><span>{count.unit.toLowerCase()}</span></div>}
                </>
              )}

              {tab === 'words' && (
                <>
                  <div className="pm-seg" role="group" aria-label="Language">
                    <button type="button" aria-pressed={lang === 'en'} onClick={() => { setLang('en'); setLine(occ.lines.en[0]); }}>English</button>
                    <button type="button" aria-pressed={lang === 'hi'} onClick={() => { setLang('hi'); setLine(occ.lines.hi[0]); }}>हिन्दी</button>
                  </div>
                  <p className="pm-label">Pick a line</p>
                  <div className="pm-lines">
                    {occ.lines[lang].map((l) => <button key={l} type="button" aria-pressed={line === l} onClick={() => setLine(l)}>{l}</button>)}
                  </div>
                  <label className="pm-field"><span>Or write your own</span><input value={line} maxLength={70} onChange={(e) => setLine(e.target.value)} /></label>
                </>
              )}

              {tab === 'look' && (
                <>
                  <p className="pm-label">Style</p>
                  <div className="pm-styles">
                    {POSTER_STYLES.map((s) => (
                      <button key={s.id} type="button" aria-pressed={styleId === s.id} onClick={() => setStyleId(s.id)}>
                        <i style={{ background: 'linear-gradient(135deg,' + s.bg[0] + ',' + s.bg[1] + ')', borderColor: s.accent }}><b style={{ color: s.accent, fontFamily: s.head }}>Aa</b></i>{s.label}
                      </button>
                    ))}
                  </div>
                  <p className="pm-label">Size</p>
                  <div className="pm-sizes pm-sizes-list">
                    {POSTER_SIZES.map((s) => (
                      <button key={s.id} type="button" aria-pressed={size === s.id} onClick={() => setSize(s.id)}>
                        <i style={{ aspectRatio: s.w + ' / ' + s.h }} /><span><strong>{s.label}</strong><small>{s.sub}</small></span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="sx-section">
        <div className="sx-shell pm-how">
          {[
            { icon: 'family' as IconName, t: 'Pick an occasion', d: 'Wedding countdown, sagai, birthday, car delivery, griha pravesh or a festival.' },
            { icon: 'pen' as IconName, t: 'Add photo, names & date', d: 'The count fills in automatically — days to go, years together or age.' },
            { icon: 'download' as IconName, t: 'Download & share', d: 'Save the PNG and post it on WhatsApp status or Instagram with the ready caption.' },
          ].map((s, i) => (
            <div key={s.t} className="pm-how-item">
              <span><Icon name={s.icon} /></span>
              <small>0{i + 1}</small>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sx-section sx-section-tint">
        <div className="sx-shell sx-faq-wrap">
          <div className="sx-faq-side">
            <p className="sx-eyebrow">Questions</p>
            <h2>Poster maker FAQ</h2>
            <p className="sx-muted">Everything about sizes, privacy and languages.</p>
          </div>
          <div className="sx-faq">
            {FAQ.map((f, i) => <details key={f.q} open={i === 0}><summary><span className="sx-faq-num">{String(i + 1).padStart(2, '0')}</span>{f.q}</summary><p>{f.a}</p></details>)}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
