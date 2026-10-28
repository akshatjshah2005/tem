import InvitationError from '@/components/template/InvitationError';
import TemplateRenderer from '@/components/template/TemplateRenderer';
import { InvitationLoadError, renderPersonalInvitation } from '@/lib/template/server';
import type { RenderModel } from '@/lib/template/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string; token: string };
}

export default async function PersonalInvitationPage({ params }: PageProps) {
  const pathname = `/i/${params.slug}/${params.token}`;
  let model: RenderModel;

  try {
    model = await renderPersonalInvitation(params.slug, params.token, pathname);
  } catch (error) {
    if (error instanceof InvitationLoadError && error.reason === 'not_found') {
      const { notFound } = await import('next/navigation');
      notFound();
    }

    return <InvitationError reason={error instanceof InvitationLoadError ? error.reason : 'server_error'} />;
  }

  return <TemplateRenderer model={model} />;
}
