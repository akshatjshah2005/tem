import Reveal from '../../Reveal';
import { SectionProps, str } from './shared';

export function GuestGreeting({ model, section }: SectionProps) {
  const { guest, variables, template } = model;
  const design = template.design;
  const lead = str(section.lead) || design.copy.guestLead;
  const couple = variables.couple_names || model.invitation.name;

  return (
    <section className="tpl-section tpl-guest" data-testid="tpl-guest">
      <div className="tpl-wrap">
        <Reveal anim="up">
          {guest ? (
            <>
              <p className="tpl-guest__dear">Dear</p>
              <h2 className="tpl-guest__name" data-length={guest.nameClass} data-testid="guest-name">
                {guest.name}
              </h2>
              {lead ? <p className="tpl-guest__lead">{lead}</p> : null}
            </>
          ) : (
            <>
              <p className="tpl-guest__dear">{design.copy.heroEyebrow || 'You are cordially invited'}</p>
              {lead ? <p className="tpl-guest__lead">{lead}</p> : null}
            </>
          )}
          <p className="tpl-guest__couple">{couple}</p>
        </Reveal>
      </div>
    </section>
  );
}

export function Message({ model, section }: SectionProps) {
  const design = model.template.design;
  const heading = str(section.heading) || design.copy.messageHeading;
  const body = str(section.text) || design.copy.invitationMessage || design.copy.message;

  if (!body) return null;

  return (
    <section className="tpl-section tpl-section--tinted" data-testid="tpl-message">
      <div className="tpl-wrap">
        <Reveal anim="up">
          {heading ? <p className="tpl-kicker">{heading}</p> : null}
          <div className="tpl-ornament" aria-hidden="true">
            <span className="tpl-ornament__mark">&#10086;</span>
          </div>
          <p className="tpl-prose" data-testid="message-text">
            {body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function Notice({ model, section }: SectionProps) {
  const { guest, isPersonalized, template } = model;
  const design = template.design;

  if (guest || !isPersonalized) return null;

  const text = str(section.text) || design.copy.noticeText;
  if (!text) return null;

  return (
    <aside className="tpl-notice" data-testid="tpl-notice">
      {text}
    </aside>
  );
}
