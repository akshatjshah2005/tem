import Link from 'next/link';
import Icon from './Icon';
import { createHref, demoHref, getFunction, type TemplateDef } from '@/lib/functions';

const sampleNames: Record<string, [string, string]> = {
  wedding: ['Aarav', 'Meera'], engagement: ['Rohan', 'Isha'], haldi: ['Meera', 'Aarav'], sangeet: ['Aarav', 'Meera'],
  'baby-shower': ['Priya', 'Karan'], birthday: ['Aanya', 'turns 5'], 'car-delivery': ['Mehta Family', 'our new SUV'],
  housewarming: ['Patel Family', 'Shubh Niwas'], family: ['Sharma Family', '25th Anniversary'],
};

const openingLabel: Record<TemplateDef['opening'], string> = {
  doors: 'Palace doors', envelope: 'Sealed envelope', curtain: 'Stage curtain', giftbox: 'Gift box', garage: 'Showroom shutter', bloom: 'Flower bloom',
};

/** A single card that flips: the closed opening on the front, the inside on the back. */
export function TemplateThumb({ template }: { template: TemplateDef; pill?: boolean }) {
  const fn = getFunction(template.functionId);
  const [a, b] = sampleNames[template.functionId] || ['Aarav', 'Meera'];
  const paired = !!fn.defaults.joiner;
  const p = template.palette;
  const date = fn.defaults.events[0]?.date.split('-').reverse().slice(0, 2).join(' · ');
  return (
    <div className="sx-flip" style={{ '--t-bg': p.bg, '--t-bg2': p.bg2, '--t-ink': p.ink, '--t-acc': p.accent, '--t-acc2': p.accent2, '--t-head': template.headFont } as React.CSSProperties}>
      <div className="sx-flip-inner">
        <div className="sx-flip-face sx-flip-front">
          {(template.opening === 'doors' || template.opening === 'curtain' || template.opening === 'garage') && <span className="sx-tdoor" aria-hidden="true"><i /><i /></span>}
          <span className="sx-tseal">{a[0]}{paired ? '·' + b[0] : ''}</span>
          <small>{openingLabel[template.opening]}</small>
        </div>
        <div className="sx-flip-face sx-flip-back">
          <small>{fn.defaults.headline}</small>
          <strong>{a}</strong>
          {paired ? <><em>&amp;</em><strong>{b}</strong></> : <span>{b}</span>}
          <span>{date}</span>
        </div>
      </div>
      {template.isNew && <span className="sx-tag sx-tag-new sx-tnew">New</span>}
    </div>
  );
}

export default function TemplateCard({ template, index = 0 }: { template: TemplateDef; index?: number }) {
  const fn = getFunction(template.functionId);
  return (
    <article className="sx-tcard rv" style={{ '--rd': (index % 4) * 70 + 'ms' } as React.CSSProperties}>
      <div className="sx-tcard-media">
        <TemplateThumb template={template} />
        <div className="sx-tcard-hover">
          <Link className="sx-btn sx-btn-light sx-btn-sm" href={demoHref(template)}><Icon name="play" /> View demo</Link>
          <Link className="sx-btn sx-btn-primary sx-btn-sm" href={createHref(template)}>Use this</Link>
        </div>
      </div>
      <div className="sx-tcard-body">
        <div>
          <h3>{template.name}</h3>
          <span className="sx-tcard-fn"><Icon name={fn.icon} /> {fn.short} · {openingLabel[template.opening]}</span>
        </div>
        <p>{template.description}</p>
        <div className="sx-tcard-links">
          <Link href={demoHref(template)}>View demo</Link>
          <Link href={createHref(template)} className="sx-tcard-use">Use this <Icon name="arrow-right" /></Link>
        </div>
      </div>
    </article>
  );
}
