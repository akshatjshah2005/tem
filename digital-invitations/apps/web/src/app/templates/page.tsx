'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { templateAPI } from '@/lib/api';

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  _count?: { templates?: number };
};

type Template = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  isPremium?: boolean;
  features?: Record<string, boolean>;
  category?: { id?: string; name: string; slug: string } | null;
};

const featureLabels: [string, string][] = [
  ['multipleEvents', 'Multiple events'],
  ['gallery', 'Photo gallery'],
  ['guestPersonalization', 'Guest links'],
  ['map', 'Directions'],
  ['countdown', 'Countdown'],
  ['rsvp', 'RSVP'],
];

function ThemeArtwork({ template, index, large = false }: { template: Template; index: number; large?: boolean }) {
  const isRoyal = /gold|classic|royal|traditional|mandala|temple/i.test(template.name);
  const isFloral = /floral|romance|garden|rose/i.test(template.name);
  const isMinimal = /minimal|modern|editorial/i.test(template.name);
  const theme = isRoyal
    ? { background: 'from-[#0b2545] via-[#174b75] to-[#071b35]', ink: 'text-sky-50', accent: 'text-sky-200', border: 'border-sky-100/35', label: 'ROYAL · CINEMATIC' }
    : isFloral
      ? { background: 'from-[#edf9ff] via-white to-[#d9ecff]', ink: 'text-slate-800', accent: 'text-sky-700', border: 'border-sky-300/60', label: 'SOFT · ROMANTIC' }
      : isMinimal
        ? { background: 'from-[#f5f8fc] via-white to-[#e8eff8]', ink: 'text-slate-900', accent: 'text-slate-500', border: 'border-slate-400/50', label: 'MODERN · EDITORIAL' }
        : index % 2 === 0
          ? { background: 'from-[#0f365f] via-[#1d6793] to-[#08213e]', ink: 'text-white', accent: 'text-sky-200', border: 'border-sky-100/35', label: 'THE CELEBRATION' }
          : { background: 'from-[#effaff] via-white to-[#dbeafe]', ink: 'text-slate-800', accent: 'text-sky-700', border: 'border-sky-300/60', label: 'MADE FOR YOUR MOMENT' };

  return (
    <div className={`relative flex ${large ? 'min-h-[400px]' : 'h-[290px]'} w-full items-center justify-center overflow-hidden bg-gradient-to-br ${theme.background} p-6 text-center`}>
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className={`absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border ${theme.border}`} />
        <div className={`absolute left-1/2 top-1/2 aspect-square w-[61%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed ${theme.border}`} />
        <div className={`absolute left-1/2 top-1/2 aspect-square w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border ${theme.border}`} />
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>
      {template.thumbnailUrl ? (
        <img src={template.thumbnailUrl} alt={template.name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className={`relative z-10 flex w-full max-w-[270px] flex-col items-center justify-center border px-5 py-8 ${theme.border} ${theme.ink}`}>
          <span className={`text-[9px] font-bold uppercase tracking-[0.28em] ${theme.accent}`}>{template.category?.name || 'Celebration'}</span>
          <div className="my-5 flex items-center gap-2">
            <span className="font-serif text-2xl italic">A</span>
            <span className={`font-serif text-xl ${theme.accent}`}>&amp;</span>
            <span className="font-serif text-2xl italic">P</span>
          </div>
          <div className={`h-px w-12 ${isMinimal ? 'bg-slate-400' : 'bg-sky-200/80'}`} />
          <p className="mt-5 font-serif text-xl leading-tight">{template.name}</p>
          <p className={`mt-2 font-serif text-sm italic opacity-80 ${theme.accent}`}>A beautiful beginning</p>
          <span className={`mt-7 text-[8px] font-semibold uppercase tracking-[0.22em] opacity-60`}>{theme.label}</span>
        </div>
      )}
      <span className={`absolute left-4 top-4 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur ${theme.border} ${theme.ink} bg-white/10`}>Motion-ready theme</span>
      <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/75 px-3.5 py-2 text-[11px] font-semibold text-white backdrop-blur">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">▶</span> Preview
      </span>
    </div>
  );
}

export default function TemplatesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Template | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [categoryResponse, templateResponse] = await Promise.all([
          templateAPI.getCategories(),
          templateAPI.getAll({ limit: 100 }),
        ]);
        if (cancelled) return;
        setCategories(categoryResponse.data.data || []);
        setTemplates(templateResponse.data.data || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.error || 'We could not load themes. Check that your API is running and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const visibleTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return templates.filter((template) => {
      const categoryMatches = activeCategory === 'all' || template.category?.slug === activeCategory;
      const queryMatches = !term || [template.name, template.description, template.category?.name]
        .some((value) => String(value || '').toLowerCase().includes(term));
      return categoryMatches && queryMatches;
    });
  }, [templates, activeCategory, search]);

  const createHref = (template: Template) =>
    `/dashboard/create?category=${encodeURIComponent(template.category?.slug || '')}&template=${encodeURIComponent(template.id)}`;

  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-gradient-to-br from-sky-400 to-blue-600 text-lg text-white">i</span>
            <span className="text-xl">uptemp<span className="text-sky-600">.</span></span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:inline-flex">Home</Link>
            <Link href="/dashboard" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:inline-flex">My invitations</Link>
            <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:px-4">Log in</Link>
            <Link href="/register?next=%2Fdashboard%2Fcreate" className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-200/70 transition hover:bg-sky-700 sm:px-5">Create invitation ↗</Link>
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-sky-100 bg-[#f0f8ff]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_10%,rgba(125,211,252,0.30),transparent_30%),radial-gradient(ellipse_at_90%_30%,rgba(199,210,254,0.45),transparent_32%)]" />
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_350px] lg:items-end lg:px-10 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-800"><span>✦</span> The theme studio</div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">Find the feeling. <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-500 bg-clip-text text-transparent">We'll add the motion.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Explore original invitation styles inspired by the traditions you love and the stories you want to tell. Then customize the details for your own celebration.</p>
          </div>
          <div className="rounded-[1.65rem] border border-white bg-white/85 p-5 shadow-xl shadow-sky-100/80 backdrop-blur">
            <label htmlFor="template-search" className="block text-sm font-bold text-slate-800">Search by theme or occasion</label>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
              <span className="text-lg text-sky-600">⌕</span>
              <input id="template-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Wedding, floral, modern..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
              {search && <button aria-label="Clear search" onClick={() => setSearch('')} className="text-xs font-semibold text-slate-500 hover:text-slate-900">Clear</button>}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{loading ? 'Preparing your collection…' : `${visibleTemplates.length} theme${visibleTemplates.length === 1 ? '' : 's'} available`}</span><span className="font-semibold text-sky-700">Mobile-first previews</span></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Choose your visual style</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Themes for your kind of celebration</h2></div>
          <p className="max-w-md text-sm leading-6 text-slate-500">Each theme is a starting point. Add your own wording, event details and media as you customize it.</p>
        </div>
        <div className="my-7 flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setActiveCategory('all')} className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition ${activeCategory === 'all' ? 'bg-slate-900 text-white shadow-md shadow-slate-200' : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50'}`}>All occasions <span className="ml-1 opacity-70">{templates.length}</span></button>
          {categories.filter((item) => (item._count?.templates || 0) > 0).map((item) => (
            <button key={item.id} onClick={() => setActiveCategory(item.slug)} className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition ${activeCategory === item.slug ? 'bg-slate-900 text-white shadow-md shadow-slate-200' : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50'}`}>
              {item.icon ? <span className="mr-1.5">{item.icon}</span> : null}{item.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white"><div className="h-[290px] animate-pulse bg-gradient-to-br from-sky-100 via-white to-indigo-100" /><div className="space-y-3 p-5"><div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" /><div className="h-3 animate-pulse rounded bg-slate-100" /><div className="h-10 animate-pulse rounded-xl bg-slate-100" /></div></div>)}</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center"><h3 className="font-bold text-rose-900">We couldn't open the theme studio</h3><p className="mt-2 text-sm text-rose-700">{error}</p><button onClick={() => window.location.reload()} className="mt-5 rounded-full bg-rose-700 px-5 py-2.5 text-sm font-bold text-white">Try again</button></div>
        ) : visibleTemplates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><span className="text-3xl text-sky-600">✦</span><h3 className="mt-4 text-xl font-bold">No themes found</h3><p className="mt-2 text-sm text-slate-500">Try a different search or occasion.</p><button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="mt-5 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold hover:bg-sky-50">Clear filters</button></div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTemplates.map((template, index) => {
              const features = featureLabels.filter(([key]) => Boolean(template.features?.[key])).map(([, label]) => label);
              return (
                <article key={template.id} className="group overflow-hidden rounded-[1.65rem] border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/80">
                  <button type="button" onClick={() => setPreview(template)} aria-label={`Preview ${template.name}`} className="block w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-400"><ThemeArtwork template={template} index={index} /></button>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[0.17em] text-sky-700">{template.category?.name || 'Celebration'}</div><h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">{template.name}</h3></div>{template.isPremium && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">Premium</span>}</div>
                    <p className="mt-2 min-h-[44px] text-sm leading-6 text-slate-500">{template.description || 'A distinctive invitation style ready for your details.'}</p>
                    <div className="mt-4 flex min-h-6 flex-wrap gap-1.5">{features.slice(0, 4).map((label) => <span key={label} className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-800">{label}</span>)}</div>
                    <div className="mt-5 grid grid-cols-[1fr_1.25fr] gap-2.5">
                      <button type="button" onClick={() => setPreview(template)} className="rounded-full border border-slate-200 px-3 py-3 text-xs font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50">Preview theme</button>
                      <Link href={createHref(template)} className="rounded-full bg-sky-600 px-3 py-3 text-center text-xs font-bold text-white shadow-sm transition hover:bg-sky-700">Customize this ↗</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-indigo-50 p-7 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Have a vision in mind?</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Your details. Your traditions. Your style.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Start with a theme, then make the wording, events and media feel like your own celebration.</p></div>
          <Link href="/register?next=%2Fdashboard%2Fcreate" className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-sky-800">Start creating <span className="ml-2">↗</span></Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Link href="/" className="font-bold text-slate-900">invitations<span className="text-sky-600">.</span></Link>
          <div className="flex flex-wrap gap-5"><Link href="/" className="hover:text-sky-700">Home</Link><Link href="/#features" className="hover:text-sky-700">Features</Link><Link href="/#how-it-works" className="hover:text-sky-700">How it works</Link><Link href="/dashboard" className="hover:text-sky-700">My invitations</Link></div>
          <span>Designed for meaningful moments.</span>
        </div>
      </footer>

      {preview && (
        <div role="dialog" aria-modal="true" aria-label={`${preview.name} theme preview`} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreview(null); }}>
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[1.7rem] bg-white shadow-2xl">
            <div className="relative"><ThemeArtwork template={preview} index={visibleTemplates.findIndex((item) => item.id === preview.id)} large /><button type="button" onClick={() => setPreview(null)} aria-label="Close theme preview" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-slate-950/75 text-lg text-white backdrop-blur hover:bg-slate-900">×</button></div>
            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{preview.category?.name || 'Celebration theme'}</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{preview.name}</h2><p className="mt-3 leading-7 text-slate-600">{preview.description || 'A distinctive design to make your invitation feel personal.'}</p>
              <div className="mt-5 flex flex-wrap gap-2">{featureLabels.filter(([key]) => Boolean(preview.features?.[key])).map(([, label]) => <span key={label} className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800">{label}</span>)}</div>
              <p className="mt-5 text-xs leading-5 text-slate-500">This card previews the theme style. The personalized invitation preview becomes available as you customize your own event details.</p>
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setPreview(null)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Close preview</button><Link onClick={() => setPreview(null)} href={createHref(preview)} className="rounded-full bg-sky-600 px-6 py-3 text-center text-sm font-bold text-white hover:bg-sky-700">Customize this theme →</Link></div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
