'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import TemplateCard from '@/components/ui/TemplateCard';
import Icon from '@/components/ui/Icon';
import { SiteShell } from '@/components/ui/Sections';
import { FUNCTIONS, TEMPLATES, getFunction, resolveFunctionId, type FunctionId } from '@/lib/functions';

const sorts = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest first' },
  { id: 'name', label: 'Name A–Z' },
] as const;

function Library() {
  const params = useSearchParams();
  const [fn, setFn] = useState<FunctionId | 'all'>(resolveFunctionId(params?.get('category')) || 'all');
  const [sort, setSort] = useState<(typeof sorts)[number]['id']>('featured');
  const [query, setQuery] = useState('');

  const pick = (id: FunctionId | 'all') => {
    setFn(id);
    const url = id === 'all' ? '/templates' : '/templates?category=' + id;
    window.history.replaceState(null, '', url);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES
      .filter((t) => (fn === 'all' || t.functionId === fn) && (!q || [t.name, t.description, getFunction(t.functionId).label].join(' ').toLowerCase().includes(q)))
      .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'newest' ? Number(!!b.isNew) - Number(!!a.isNew) || a.order - b.order : a.order - b.order);
  }, [fn, sort, query]);

  const current = fn === 'all' ? null : getFunction(fn);
  const countFor = (id: FunctionId) => TEMPLATES.filter((t) => t.functionId === id).length;

  return (
    <section className="tl">
      <div className="sx-shell tl-layout">
        <aside className="tl-side" aria-label="Filter templates">
          <label className="tl-search">
            <Icon name="search" />
            <input type="search" placeholder="Search designs" aria-label="Search templates" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <p className="tl-side-title">Occasion</p>
          <div className="tl-occ" role="group" aria-label="Occasion">
            <button type="button" aria-pressed={fn === 'all'} onClick={() => pick('all')}>
              <Icon name="sparkles" />All occasions<em>{TEMPLATES.length}</em>
            </button>
            {FUNCTIONS.map((f) => (
              <button key={f.id} type="button" aria-pressed={fn === f.id} onClick={() => pick(f.id)}>
                <Icon name={f.icon} />{f.label}<em>{countFor(f.id)}</em>
              </button>
            ))}
          </div>
          <div className="tl-custom">
            <span className="tl-custom-icon"><Icon name="palette" /></span>
            <strong>Need something unique?</strong>
            <p>Tell us your theme, colours or family style and we’ll design a custom template.</p>
            <Link className="sx-btn sx-btn-primary sx-btn-sm" href="/contact">Request a custom design</Link>
          </div>
        </aside>

        <div className="tl-main">
          <div className="tl-banner" key={fn}>
            <span className="tl-banner-icon"><Icon name={current ? current.icon : 'templates'} /></span>
            <div>
              <h1>{current ? current.label : 'All templates'}</h1>
              <p>{current ? current.tagline : 'Every design opens like a short film on your guests’ phones. Watch a demo, then choose Use this.'}</p>
            </div>
          </div>

          <div className="tl-bar">
            <p aria-live="polite"><strong>{results.length}</strong> {results.length === 1 ? 'design' : 'designs'}{query ? ' for “' + query + '”' : ''}</p>
            <label className="tl-sort">
              <span>Sort</span>
              <select aria-label="Sort templates" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                {sorts.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {results.length ? (
            <div className="tl-grid">
              {results.map((t, i) => <TemplateCard key={t.id} template={t} index={i} />)}
            </div>
          ) : (
            <div className="sx-empty">
              <span className="sx-empty-icon"><Icon name="search" /></span>
              <h3>No designs match your search</h3>
              <p className="sx-muted">Try another occasion or clear the search.</p>
              <button type="button" className="sx-btn sx-btn-primary" onClick={() => { pick('all'); setQuery(''); }}>Show all designs</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function TemplatesPage() {
  return (
    <SiteShell>
      <Suspense fallback={<p className="sx-shell sx-muted" style={{ padding: '3rem 0' }}>Loading templates…</p>}>
        <Library />
      </Suspense>
    </SiteShell>
  );
}
