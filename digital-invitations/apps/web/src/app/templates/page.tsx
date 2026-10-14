'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { templateAPI } from '@/lib/api';

type Category = { id: string; name: string; slug: string; icon?: string; _count?: { templates?: number } };
type Template = { id: string; name: string; slug: string; description?: string; thumbnailUrl?: string; isPremium?: boolean; features?: Record<string, boolean>; category?: { name: string; slug: string } };

export default function TemplatesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([templateAPI.getCategories(), templateAPI.getAll({ limit: 100 })])
      .then(([c, t]) => {
        if (!active) return;
        setCategories(c.data.data || []);
        setTemplates(t.data.data || []);
      })
      .catch((e: any) => active && setError(e?.response?.data?.error || 'Could not load templates. Please try again.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const visible = templates.filter((t) =>
    (category === 'all' || t.category?.slug === category) &&
    [t.name, t.description, t.category?.name].some((value) =>
      String(value || '').toLowerCase().includes(search.toLowerCase().trim())
    )
  );

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-xl font-bold text-sky-700">Invitations.</Link>
        <div className="flex gap-3"><Link href="/dashboard" className="rounded-xl px-4 py-2 text-sm hover:bg-slate-100">Dashboard</Link><Link href="/register" className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white">Get started</Link></div>
      </div>
    </header>
    <section className="border-b bg-gradient-to-br from-amber-100 via-white to-sky-100">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-amber-800">The invitation collection</p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">A beautiful beginning to every celebration.</h1>
        <p className="mt-5 max-w-2xl leading-7 text-slate-600">Explore designs, personalize your event details, and create an invitation made for your people.</p>
        <input aria-label="Search templates" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search wedding, floral, minimal…" className="mt-7 w-full max-w-xl rounded-2xl border border-white bg-white px-5 py-4 shadow-sm outline-none focus:ring-4 focus:ring-sky-100" />
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-12">
      <h2 className="text-2xl font-bold sm:text-3xl">Find your style</h2>
      <div className="my-6 flex flex-wrap gap-2">
        <button onClick={() => setCategory('all')} className={`rounded-full px-4 py-2 text-sm font-semibold ${category === 'all' ? 'bg-slate-900 text-white' : 'border bg-white hover:border-slate-400'}`}>All occasions</button>
        {categories.filter(c => (c._count?.templates || 0) > 0).map(c => <button key={c.id} onClick={() => setCategory(c.slug)} className={`rounded-full px-4 py-2 text-sm font-semibold ${category === c.slug ? 'bg-slate-900 text-white' : 'border bg-white hover:border-slate-400'}`}>{c.icon || ''} {c.name}</button>)}
      </div>
      {loading ? <p className="py-16 text-center text-slate-500">Loading invitation designs…</p> : error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">{error} <button onClick={() => location.reload()} className="ml-2 underline">Retry</button></div> : visible.length === 0 ? <div className="rounded-2xl border border-dashed bg-white p-12 text-center"><h3 className="font-semibold">No designs found</h3><p className="mt-2 text-sm text-slate-500">Try another category or search.</p></div> :
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visible.map((t, i) => <article key={t.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <div className={`flex h-64 items-center justify-center bg-gradient-to-br ${i % 2 ? 'from-sky-100 via-white to-violet-100' : 'from-amber-100 via-rose-50 to-orange-100'}`}>{t.thumbnailUrl ? <img src={t.thumbnailUrl} alt={t.name} className="h-full w-full object-cover" /> : <div className="px-7 text-center"><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-800">{t.category?.name || 'Celebration'}</p><p className="my-4 font-serif text-3xl">{t.name}</p><div className="mx-auto h-px w-14 bg-amber-500" /><p className="mt-4 font-serif text-lg text-slate-600">A day to remember</p></div>}</div>
        <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{t.name}</h3><p className="mt-1 text-sm text-slate-500">{t.description || 'A thoughtful design for your special occasion.'}</p></div>{t.isPremium && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">Premium</span>}</div>
        <div className="mt-4 flex flex-wrap gap-2">{[['multipleEvents','Events'],['gallery','Gallery'],['guestPersonalization','Personalization'],['countdown','Countdown'],['rsvp','RSVP']].filter(([k]) => t.features?.[k as string]).slice(0,3).map(([,label]) => <span key={label as string} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{label}</span>)}</div>
        <Link href={`/dashboard/create?category=${encodeURIComponent(t.category?.slug || '')}&template=${encodeURIComponent(t.id)}`} className="mt-5 block rounded-xl bg-sky-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-sky-700">Use this template →</Link>
        </div>
      </article>)}</div>}
    </section>
    <footer className="border-t bg-white py-8 text-center text-sm text-slate-500">Make the moment yours · <Link href="/dashboard" className="font-semibold text-sky-700">My invitations</Link></footer>
  </main>;
}
