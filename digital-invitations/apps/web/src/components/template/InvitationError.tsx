import type { InvitationLoadReason } from '@/lib/template/server';

const TITLES: Record<InvitationLoadReason, string> = {
  not_found: 'This invitation could not be found',
  not_published: 'This invitation is not published yet',
  invalid_link: 'This invitation link has expired or is invalid',
  server_error: 'We could not load this invitation'
};

export default function InvitationError({ reason }: { reason: InvitationLoadReason }) {
  return (
    <main className="tpl-root tpl-error" data-testid="invitation-error" data-reason={reason}>
      <div className="tpl-error__inner">
        <p className="tpl-error__mark">&#10086;</p>
        <h1 className="tpl-error__title">{TITLES[reason]}</h1>
        <p className="tpl-error__text">Please check the link or contact the invitation sender.</p>
        <a className="tpl-error__link" href="/">
          Back to home
        </a>
      </div>
    </main>
  );
}
