'use client';

import { useEffect, useRef } from 'react';
import Reveal from '../../Reveal';
import { bool, SectionProps, splitCoupleNames, str } from './shared';

export default function Hero({ model, section }: SectionProps) {
  const { cover, primaryEvent, invitation, variables, template } = model;
  const design = template.design;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
      if (motionPreference.matches) {
        video.pause();
      } else {
        void video.play().catch(() => {
          // The invitation remains complete even if the browser blocks background video.
        });
      }
    };

    syncPlayback();
    motionPreference.addEventListener?.('change', syncPlayback);
    return () => motionPreference.removeEventListener?.('change', syncPlayback);
  }, [cover?.url]);

  const eyebrow = str(section.eyebrow) || design.copy.heroEyebrow;
  const line = design.copy.heroInvitationLine;
  const couple = variables.couple_names || invitation.name;
  const { first, second } = splitCoupleNames(couple);
  const showDate = bool(section.showDate, true);
  const showCue = bool(section.showScrollCue, true);
  const ctaLabel = str(section.ctaLabel) || 'Explore the celebration';
  const ctaHref = str(section.ctaHref) || '#events';

  return (
    <section className="tpl-hero" data-testid="tpl-hero" aria-label={invitation.name}>
      <div className={`tpl-hero__media${cover ? '' : ' tpl-hero__media--generated'}`}>
        {cover?.isImage ? (
          <img src={cover.url} alt="" loading="eager" decoding="async" />
        ) : cover ? (
          <video
            ref={videoRef}
            className="tpl-hero__background-video"
            src={cover.url}
            poster={cover.thumbnailUrl || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : null}
      </div>
      <div className="tpl-hero__overlay" />
      <div className="tpl-hero__cinema-glow" aria-hidden="true" />
      <div className="tpl-hero__mandala" aria-hidden="true">
        <svg viewBox="0 0 400 400" focusable="false">
          <circle className="tpl-hero__mandala-ring" cx="200" cy="200" r="174" />
          <circle className="tpl-hero__mandala-ring" cx="200" cy="200" r="148" />
          <circle className="tpl-hero__mandala-ring" cx="200" cy="200" r="108" />
          <g className="tpl-hero__mandala-petals">
            <path d="M200 43 C170 82 177 125 200 157 C223 125 230 82 200 43Z" />
            <path d="M200 67 C189 92 190 117 200 137 C210 117 211 92 200 67Z" />
            {Array.from({ length: 11 }, (_, index) => (
              <g key={index} transform={`rotate(${(index + 1) * 30} 200 200)`}>
                <path d="M200 43 C170 82 177 125 200 157 C223 125 230 82 200 43Z" />
                <path d="M200 67 C189 92 190 117 200 137 C210 117 211 92 200 67Z" />
              </g>
            ))}
          </g>
          <circle className="tpl-hero__mandala-core" cx="200" cy="200" r="24" />
          <circle className="tpl-hero__mandala-core" cx="200" cy="200" r="9" />
        </svg>
      </div>
      <div className="tpl-hero__frame" />

      <div className="tpl-hero__inner">
        <Reveal anim="fade" className="tpl-hero__reveal">
          {eyebrow ? <p className="tpl-hero__eyebrow">{eyebrow}</p> : null}
          <div className="tpl-ornament tpl-hero__ornament" aria-hidden="true">
            <span className="tpl-ornament__mark">&#10086;</span>
          </div>
          <h1 className="tpl-hero__names" data-testid="couple-names">
            <span className="tpl-hero__name-first">{first}</span>
            {second ? <span className="tpl-hero__amp">&amp;</span> : null}
            {second ? <span className="tpl-hero__name-second">{second}</span> : null}
          </h1>
          {line ? <p className="tpl-hero__line">{line}</p> : null}
          {showDate && primaryEvent?.dateLabel ? (
            <p className="tpl-hero__date" data-testid="hero-date">
              <span>{primaryEvent.weekday}, {primaryEvent.monthYear}</span>
            </p>
          ) : null}
          <a className="tpl-hero__cta" href={ctaHref}>
            <span>{ctaLabel}</span>
            <span className="tpl-hero__cta-arrow" aria-hidden="true">↓</span>
          </a>
        </Reveal>
      </div>

      <div className="tpl-hero__diyas" aria-hidden="true">
        <span className="tpl-hero__diya tpl-hero__diya--left"><i /></span>
        <span className="tpl-hero__diya tpl-hero__diya--right"><i /></span>
      </div>
      {showCue ? <div className="tpl-hero__cue" aria-hidden="true" /> : null}
      <span className="tpl-hero__bottom-label" aria-hidden="true">A celebration of love · a lifetime of memories</span>
    </section>
  );
}
