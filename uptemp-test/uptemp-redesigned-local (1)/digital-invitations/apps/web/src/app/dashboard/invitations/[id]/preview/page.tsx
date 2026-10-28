'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { invitationAPI } from '@/lib/api';
import { buildRenderModel, type RawInvitation } from '@/lib/template/model';
import type { RenderModel, TemplateSummary } from '@/lib/template/types';
import TemplateRenderer from '@/components/template/TemplateRenderer';

export default function InvitationPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [model, setModel] = useState<RenderModel | null>(null);
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user || !params?.id) return;
    let active = true;

    async function loadPreview() {
      setLoading(true);
      setError('');
      try {
        const response = await invitationAPI.getOne(String(params.id));
        const invitation = response.data?.data;
        if (!invitation?.id) throw new Error('Invitation details were not returned by the server.');

        const renderModel = buildRenderModel({
          invitation: invitation as RawInvitation,
          template: (invitation.template || null) as TemplateSummary | null,
          pageUrl: `${window.location.origin}/i/${invitation.slug}`
        });
        if (!active) return;
        setModel(renderModel);
        setSlug(invitation.slug);
        setStatus(invitation.status);
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.error || err?.response?.data?.message || err?.message || 'We could not load this invitation preview.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPreview();
    return () => { active = false; };
  }, [authLoading, user, params?.id]);

  if (authLoading || loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" /><p className="mt-4 text-sm text-slate-500">Preparing your invitation preview…</p></div></main>;
  }

  if (!user) return null;

  if (error || !model) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5"><div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="text-4xl">💌</div><h1 className="mt-4 text-xl font-bold text-slate-900">Preview unavailable</h1><p className="mt-2 text-sm leading-6 text-slate-600">{error || 'This invitation could not be previewed.'}</p><Link href={`/dashboard/invitations/${String(params.id)}`} className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700">Return to editor</Link></div></main>;
  }

  return <main className="min-h-screen bg-slate-50">
    <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link href={`/dashboard/invitations/${String(params.id)}`} className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Editor</Link>
        <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">Invitation preview</p><p className="text-xs text-slate-500">{status === 'PUBLISHED' ? 'Published invitation' : 'Draft preview — only you can see this'}</p></div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{status || 'DRAFT'}</span>
        {status === 'PUBLISHED' && <Link href={`/i/${slug}`} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Open public link ↗</Link>}
      </div>
    </div>
    <div className="mx-auto max-w-7xl">
      <TemplateRenderer model={model} />
    </div>
  </main>;
}
