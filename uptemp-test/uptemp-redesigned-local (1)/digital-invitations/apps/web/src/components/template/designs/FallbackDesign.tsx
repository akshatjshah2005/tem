'use client';

import type { RenderModel, TemplateSection } from '@/lib/template/types';
import { Fragment } from 'react';
import Countdown from '../Countdown';
import Reveal from '../Reveal';

/**
 * Generic design used whenever a template slug has no dedicated implementation.
 * It renders every known section type so an invitation never breaks.
 */
export default function FallbackDesign({ model }: { model: RenderModel }) {
  const { invitation, variables, gallery, events, guest, primaryEvent, template } = model;
  const design = template.design;
  const features = template.features;
  const couple = variables.couple_names || invitation.name;
  const sections = model.template.sections.filter((section) => section.enabled !== false);

  return (
    <div className="tpl-fallback" data-testid="template-fallback">
      {sections.map((section) => (
        <Fragment key={section.id || section.type}>{render(model, section, { couple, gallery, events, guest, primaryEvent, features })}</Fragment>
      ))}
    </div>
  );
}

function render(
  model: RenderModel,
  section: TemplateSection,
  ctx: {
    couple: string;
    gallery: RenderModel['gallery'];
    events: RenderModel['events'];
    guest: RenderModel['guest'];
    primaryEvent: RenderModel['primaryEvent'];
    features: RenderModel['template']['features'];
  }
) {
  const { invitation, variables, template } = model;
  const design = template.design;
  const text = (value: unknown) => (value === null || value === undefined ? '' : String(value));
  const enabled = (value: unknown, fallback = true) => (typeof value === 'boolean' ? value : fallback);

  switch (section.type) {
    case 'hero':
      return (
        <section className="tpl-simple__hero" data-testid="tpl-hero">
          <Reveal anim="fade">
            <p className="tpl-hero__eyebrow">{design.copy.heroEyebrow}</p>
            <h1 className="tpl-hero__names" data-testid="couple-names">
              {ctx.couple}
            </h1>
            {design.copy.heroInvitationLine ? (
              <p className="tpl-hero__line">{design.copy.heroInvitationLine}</p>
            ) : null}
            {ctx.primaryEvent?.dateLabel ? (
              <p className="tpl-hero__date">
                <span>{ctx.primaryEvent.dateLabel}</span>
              </p>
            ) : null}
          </Reveal>
        </section>
      );

    case 'guest_greeting':
      return (
        <section className="tpl-section tpl-guest" data-testid="tpl-guest">
          <div className="tpl-wrap">
            <Reveal anim="up">
              <p className="tpl-guest__dear">{ctx.guest ? 'Dear' : 'You are invited'}</p>
              {ctx.guest ? (
                <h2 className="tpl-guest__name" data-testid="guest-name">
                  {ctx.guest.name}
                </h2>
              ) : null}
              <p className="tpl-guest__lead">{text(section.lead) || design.copy.guestLead}</p>
              <p className="tpl-guest__couple">{ctx.couple}</p>
            </Reveal>
          </div>
        </section>
      );

    case 'message':
      return (
        <section className="tpl-section tpl-section--tinted" data-testid="tpl-message">
          <div className="tpl-wrap">
            <p className="tpl-kicker">{text(section.heading) || design.copy.messageHeading}</p>
            <p className="tpl-prose">{text(section.text) || design.copy.invitationMessage || design.copy.message}</p>
          </div>
        </section>
      );

    case 'countdown':
      if (!ctx.primaryEvent || ctx.primaryEvent.isPast || ctx.features.countdown === false) return null;
      return (
        <section className="tpl-section" data-testid="tpl-countdown">
          <div className="tpl-wrap" style={{ maxWidth: '38rem' }}>
            <p className="tpl-kicker">{text(section.label) || design.copy.countdownLabel}</p>
            <Countdown
              targetIso={ctx.primaryEvent.startIso}
              initialMs={ctx.primaryEvent.remainingMs}
            />
          </div>
        </section>
      );

    case 'event_list':
      return (
        <section className="tpl-section" id="events" data-testid="tpl-events">
          <div className="tpl-wrap">
            <p className="tpl-kicker">{text(section.heading) || design.copy.eventsHeading}</p>
            <h2 className="tpl-title">{text(section.heading) || design.copy.eventsHeading}</h2>
            {ctx.events.length === 0 ? (
              <p className="tpl-empty">{design.copy.noEventsText}</p>
            ) : (
              <div className="tpl-events__list">
                {ctx.events.map((event) => (
                  <article className="tpl-event__card tpl-event-list__item" key={event.id} data-testid="tpl-event">
                    <p className="tpl-event__weekday">{event.weekday}</p>
                    <h3 className="tpl-event__name">{event.name}</h3>
                    <div className="tpl-event__meta">
                      <div className="tpl-event__row">
                        <span>{event.dateLabel}</span>
                      </div>
                      {event.timeLabel ? (
                        <div className="tpl-event__row">
                          <span>{event.timeLabel}</span>
                        </div>
                      ) : null}
                      {event.venueName ? (
                        <div className="tpl-event__row">
                          <span>{event.venueName}</span>
                        </div>
                      ) : null}
                      {event.venueAddress ? (
                        <div className="tpl-event__row">
                          <span>{event.venueAddress}</span>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      );

    case 'gallery':
      if (ctx.gallery.length === 0 || ctx.features.gallery === false) return null;
      return (
        <section className="tpl-section tpl-section--tinted" data-testid="tpl-gallery">
          <div className="tpl-wrap">
            <p className="tpl-kicker">{text(section.heading) || design.copy.galleryHeading}</p>
            <div className="tpl-gallery__grid">
              {ctx.gallery.map((item) => (
                <div key={item.id}>
                  <span className="tpl-gallery__item">
                    <img src={item.thumbnailUrl || item.url} alt={item.alt} loading="lazy" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'personalization_notice':
      if (ctx.guest || !model.isPersonalized) return null;
      return (
        <aside className="tpl-notice" data-testid="tpl-notice">
          {text(section.text) || design.copy.noticeText}
        </aside>
      );

    case 'rsvp':
      if (!ctx.guest && !model.isPersonalized) return null;
      return (
        <section className="tpl-section tpl-rsvp" id="rsvp" data-testid="tpl-rsvp">
          <div className="tpl-wrap">
            <p className="tpl-kicker">{text(section.heading) || design.copy.rsvpHeading}</p>
            <h2 className="tpl-title">{text(section.heading) || design.copy.rsvpHeading}</h2>
            <p className="tpl-lead">
              {ctx.guest
                ? 'Please respond using the personalised link you received.'
                : 'To respond, please use the personal invitation link you received.'}
            </p>
          </div>
        </section>
      );

    case 'closing':
      return (
        <section className="tpl-section tpl-closing" data-testid="tpl-closing">
          <div className="tpl-wrap">
            <p className="tpl-closing__lead">{text(section.lead) || design.copy.closingLine}</p>
            <p className="tpl-closing__names">{ctx.couple}</p>
            {variables.hashtag ? <p className="tpl-closing__hashtag">{variables.hashtag}</p> : null}
          </div>
          <footer className="tpl-footer">{design.copy.footerText}</footer>
        </section>
      );

    default:
      return null;
  }
}
