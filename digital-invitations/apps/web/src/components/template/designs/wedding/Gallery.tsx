'use client';

import { useCallback, useEffect, useState } from 'react';
import Reveal from '../../Reveal';
import { num, SectionProps, str } from './shared';

export default function Gallery({ model, section }: SectionProps) {
  const { gallery, template } = model;
  const design = template.design;
  const features = template.features;
  const [index, setIndex] = useState<number | null>(null);

  const heading = str(section.heading) || design.copy.galleryHeading;
  const lead = str(section.lead) || design.copy.galleryLead;
  const columns = Math.min(4, Math.max(1, num(section.columns, 2)));

  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(() => setIndex((current) => (current === null ? null : (current + 1) % gallery.length)), [gallery.length]);
  const previous = useCallback(() => setIndex((current) => (current === null ? null : (current - 1 + gallery.length) % gallery.length)), [gallery.length]);

  useEffect(() => {
    if (index === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') previous();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, close, next, previous]);

  if (features.gallery === false || gallery.length === 0) return null;

  const active = index === null ? null : gallery[index];

  return (
    <section className="tpl-section tpl-section--tinted" data-testid="tpl-gallery">
      <div className="tpl-wrap">
        <Reveal anim="up">
          {heading ? <p className="tpl-kicker">{heading}</p> : null}
          <h2 className="tpl-title">{heading}</h2>
          {lead ? <p className="tpl-lead">{lead}</p> : null}
        </Reveal>

        <div className="tpl-gallery__grid" style={{ ['--tpl-cols' as string]: String(columns) }}>
          {gallery.map((item, itemIndex) => (
            <Reveal key={item.id} anim="zoom" delay={Math.min(itemIndex * 60, 300)}>
              <button
                type="button"
                className="tpl-gallery__item"
                onClick={() => setIndex(itemIndex)}
                aria-label={`Open image ${itemIndex + 1} of ${gallery.length}`}
              >
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={640}
                />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {active ? (
        <div className="tpl-lightbox" role="dialog" aria-modal="true" aria-label="Image preview">
          <button type="button" className="tpl-lightbox__close" onClick={close} aria-label="Close preview">
            &times;
          </button>
          {gallery.length > 1 ? (
            <button
              type="button"
              className="tpl-lightbox__nav tpl-lightbox__prev"
              onClick={previous}
              aria-label="Previous image"
            >
              &#8249;
            </button>
          ) : null}
          {active.isImage ? (
            <img className="tpl-lightbox__media" src={active.url} alt={active.alt} />
          ) : (
            <video className="tpl-lightbox__media" src={active.url} controls autoPlay muted playsInline />
          )}
          {gallery.length > 1 ? (
            <button
              type="button"
              className="tpl-lightbox__nav tpl-lightbox__next"
              onClick={next}
              aria-label="Next image"
            >
              &#8250;
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
