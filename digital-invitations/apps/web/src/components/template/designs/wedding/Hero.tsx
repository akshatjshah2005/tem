import Reveal from '../../Reveal';
import { bool, SectionProps, splitCoupleNames, str } from './shared';

export default function Hero({ model, section }: SectionProps) {
  const { cover, primaryEvent, invitation, variables, template } = model;
  const design = template.design;

  const eyebrow = str(section.eyebrow) || design.copy.heroEyebrow;
  const line = design.copy.heroInvitationLine;
  const couple = variables.couple_names || invitation.name;
  const { first, second } = splitCoupleNames(couple);
  const showDate = bool(section.showDate, true);
  const showCue = bool(section.showScrollCue, true);
  const ctaLabel = str(section.ctaLabel);
  const ctaHref = str(section.ctaHref) || '#events';

  return (
    <section className="tpl-hero" data-testid="tpl-hero" aria-label={invitation.name}>
      <div className="tpl-hero__media">
        {cover ? <img src={cover.url} alt="" loading="eager" decoding="async" /> : null}
      </div>
      <div className="tpl-hero__overlay" />
      <div className="tpl-hero__frame" />

      <div className="tpl-hero__inner">
        <Reveal anim="fade">
          {eyebrow ? <p className="tpl-hero__eyebrow">{eyebrow}</p> : null}
          <div className="tpl-ornament" aria-hidden="true">
            <span className="tpl-ornament__mark">&#10086;</span>
          </div>
          <h1 className="tpl-hero__names" data-testid="couple-names">
            <span>{first}</span>
            {second ? <span className="tpl-hero__amp">&amp;</span> : null}
            {second ? <span>{second}</span> : null}
          </h1>
          {line ? <p className="tpl-hero__line">{line}</p> : null}
          {showDate && primaryEvent?.dateLabel ? (
            <p className="tpl-hero__date" data-testid="hero-date">
              <span>
                {primaryEvent.weekday}, {primaryEvent.monthYear}
              </span>
            </p>
          ) : null}
          {ctaLabel ? (
            <p style={{ marginTop: '2rem', marginBottom: 0 }}>
              <a className="tpl-btn tpl-btn--ghost" href={ctaHref}>
                {ctaLabel}
              </a>
            </p>
          ) : null}
        </Reveal>
      </div>

      {showCue ? <div className="tpl-hero__cue" aria-hidden="true" /> : null}
    </section>
  );
}
