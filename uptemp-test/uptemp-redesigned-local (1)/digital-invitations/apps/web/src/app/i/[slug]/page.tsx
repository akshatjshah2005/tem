import InvitationError from '@/components/template/InvitationError';
import TemplateRenderer from '@/components/template/TemplateRenderer';
import { InvitationLoadError, renderPublicInvitation } from '@/lib/template/server';
import type { RenderModel } from '@/lib/template/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export default async function PublicInvitationPage({ params }: PageProps) {
  const pathname = `/i/${params.slug}`;
  let model: RenderModel;

  try {
    model = await renderPublicInvitation(params.slug, pathname);
  } catch (error) {
    if (error instanceof InvitationLoadError && error.reason === 'not_found') {
      const { notFound } = await import('next/navigation');
      notFound();
    }

    return <InvitationError reason={error instanceof InvitationLoadError ? error.reason : 'server_error'} />;
  }

  return <TemplateRenderer model={model} />;
}
