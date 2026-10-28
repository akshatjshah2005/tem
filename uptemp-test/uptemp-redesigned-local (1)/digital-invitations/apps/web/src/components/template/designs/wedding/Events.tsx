import type { RenderEvent } from '@/lib/template/types';
import Countdown from '../../Countdown';
import Reveal from '../../Reveal';
import { bool, SectionProps, str } from './shared';

export function CountdownSection({ model, section }: SectionProps) {
  const { primaryEvent, template } = model;
  const design = template.design;
  const features = template.features;

  if (!primaryEvent || primaryEvent.isPast) return null;
  if (features.countdown === false) return null;

  const label = str(section.label) || design.copy.countdownLabel;

  return (
    <section className="tpl-section" data-testid="tpl-countdown">
      <div className="tpl-wrap" style={{ maxWidth: '38rem' }}>
        <Reveal anim="up">
          {label ? <p className="tpl-kicker">{label}</p> : null}
          <h2 className="tpl-title" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.9rem)' }}>
            {primaryEvent.name}
          </h2>
          <Countdown targetIso={primaryEvent.startIso} initialMs={primaryEvent.remainingMs} />
        </Reveal>
      </div>
    </section>
  );
}

export function EventList({ model, section }: SectionProps) {
  const { events, template } = model;
  const design = template.design;

  const layout = str(section.layout) || 'timeline';
  const showMap = bool(section.showMap, true);
  const showDressCode = bool(section.showDressCode, true);
  const showDescription = bool(section.showDescription, true);
  const heading = str(section.heading) || design.copy.eventsHeading;
  const lead = str(section.lead) || design.copy.eventsLead;

  return (
    <section className="tpl-section" id="events" data-testid="tpl-events">
      <div className="tpl-wrap" style={{ maxWidth: layout === 'timeline' ? '52rem' : '46rem' }}>
        <Reveal anim="up">
          {heading ? <p className="tpl-kicker">{heading}</p> : null}
          <h2 className="tpl-title">{heading}</h2>
          {lead ? <p className="tpl-lead">{lead}</p> : null}
        </Reveal>

        {events.length === 0 ? (
          <p className="tpl-empty">{design.copy.noEventsText}</p>
        ) : layout === 'list' ? (
          <div className="tpl-events__list">
            {events.map((event, index) => (
              <Reveal
                key={event.id}
                anim="up"
                delay={Math.min(index * 90, 360)}
                className="tpl-event-list__item"
              >
                <article className="tpl-event__card" data-testid="tpl-event">
                  <EventBody
                    event={event}
                    showMap={showMap}
                    showDressCode={showDressCode}
                    showDescription={showDescription}
                  />
                </article>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="tpl-events">
            <div className="tpl-events__rail" aria-hidden="true" />
            {events.map((event, index) => (
              <Reveal
                key={event.id}
                anim="up"
                delay={Math.min(index * 90, 360)}
                className={`tpl-event tpl-event--timeline${index % 2 === 1 ? ' tpl-event--even' : ''}`}
              >
                <div className="tpl-event__badge" aria-hidden="true">
                  <span className="tpl-event__day">{event.dayNumber}</span>
                  <span className="tpl-event__month">{event.monthYear.slice(0, 3)}</span>
                </div>
                <article className="tpl-event__card" data-testid="tpl-event">
                  <EventBody
                    event={event}
                    showMap={showMap}
                    showDressCode={showDressCode}
                    showDescription={showDescription}
                  />
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface EventBodyProps {
  event: RenderEvent;
  showMap: boolean;
  showDressCode: boolean;
  showDescription: boolean;
}

function EventBody({ event, showMap, showDressCode, showDescription }: EventBodyProps) {
  return (
    <>
      <p className="tpl-event__weekday">{event.weekday}</p>
      <h3 className="tpl-event__name" data-length={event.nameClass}>
        {event.name}
      </h3>

      <div className="tpl-event__meta">
        <div className="tpl-event__row">
          <span className="tpl-event__icon" aria-hidden="true">&#128197;</span>
          <span>
            <strong>{event.dateLabel}</strong>
          </span>
        </div>

        {event.timeLabel ? (
          <div className="tpl-event__row">
            <span className="tpl-event__icon" aria-hidden="true">&#128336;</span>
            <span>{event.timeLabel}</span>
          </div>
        ) : null}

        {event.venueName || event.venueAddress ? (
          <div className="tpl-event__row">
            <span className="tpl-event__icon" aria-hidden="true">&#128205;</span>
            <span>
              {event.venueName ? <strong>{event.venueName}</strong> : null}
              {event.venueAddress ? <span className="tpl-event__address">{event.venueAddress}</span> : null}
            </span>
          </div>
        ) : null}
      </div>

      {showMap && event.mapLink ? (
        <a
          className="tpl-event__link"
          href={event.mapLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on map &#8599;
        </a>
      ) : null}

      {showDressCode && event.dressCode ? (
        <span className="tpl-event__chip">Dress code &middot; {event.dressCode}</span>
      ) : null}

      {showDescription && event.description ? (
        <p className="tpl-event__desc">{event.description}</p>
      ) : null}
    </>
  );
}
