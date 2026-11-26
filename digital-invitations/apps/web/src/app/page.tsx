'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import TemplateCard from '@/components/ui/TemplateCard';
import Icon, { type IconName } from '@/components/ui/Icon';
import { SiteShell, StepsSection } from '@/components/ui/Sections';
import CinematicInvite from '@/components/cinematic/CinematicInvite';
import DeviceFrame, { DeviceToggle, type DeviceView } from '@/components/cinematic/DeviceFrame';
import { FUNCTIONS, TEMPLATES, createHref, defaultContent, demoHref, getTemplate, templatesFor, WEDDING_GROUP, type FunctionId } from '@/lib/functions';

const inside: { icon: IconName; label: string }[] = [
  { icon: 'user-check', label: 'Guest name on the opening' },
  { icon: 'pin', label: 'Every function with venue & map' },
  { icon: 'timer', label: 'Live countdown' },
  { icon: 'image', label: 'Photo gallery & music' },
  { icon: 'rsvp', label: 'RSVP inside the invitation' },
  { icon: 'chat', label: 'Share on WhatsApp' },
];

const guests = [
  { initials: 'RM', name: 'Rahul & Family', events: ['Haldi', 'Mehendi', 'Wedding', 'Reception'], note: 'Close family — every function' },
  { initials: 'SF', name: 'Sharma Family', events: ['Wedding', 'Reception'], note: 'Neighbours — main day only' },
  { initials: 'TK', name: 'Tanvi', events: ['Sangeet', 'Reception'], note: 'College friends — the fun nights' },
];

/** Occasions shown in the hero list (car delivery is left out here). */
const SHOWCASE_FUNCTIONS = FUNCTIONS.filter((f) => f.id !== 'car-delivery');
/** "All": one design per occasion, so visitors can flip through the range. */
const ALL_DESIGNS = SHOWCASE_FUNCTIONS.map((f) => templatesFor(f.id)[0]);
/** "Wedding functions": both designs for sagai, haldi, sangeet and the wedding. */
const WEDDING_DESIGNS = WEDDING_GROUP.functionIds.flatMap((id) => templatesFor(id));
type Pick = FunctionId | 'all' | 'wedding-functions';

/* ---------- hero showcase: occasion rail · live device · what's inside ---------- */
function Showcase() {
  const [fnId, setFnId] = useState<Pick>('all');
  const [templateId, setTemplateId] = useState('royal-sandalwood');
  const [view, setView] = useState<DeviceView>('phone');
  const [replay, setReplay] = useState(0);
  const template = getTemplate(templateId) || TEMPLATES[0];
  const content = useMemo(() => defaultContent(template.functionId, template.id), [template]);
  const options = fnId === 'all' ? ALL_DESIGNS : fnId === 'wedding-functions' ? WEDDING_DESIGNS : templatesFor(fnId);

  const pickFunction = (id: Pick) => {
    setFnId(id);
    setTemplateId(id === 'all' ? ALL_DESIGNS[0].id : id === 'wedding-functions' ? WEDDING_DESIGNS[0].id : templatesFor(id)[0].id);
    setReplay((r) => r + 1);
  };

  return (
    <div className="hx-showcase">
      <div className="hx-rail" role="group" aria-label="Pick an occasion">
        <p className="hx-rail-title">Occasion</p>
        <button type="button" aria-pressed={fnId === 'all'} onClick={() => pickFunction('all')}>
          <span className="hx-rail-icon"><Icon name="sparkles" /></span>All
        </button>
        <button type="button" aria-pressed={fnId === 'wedding-functions'} onClick={() => pickFunction('wedding-functions')}>
          <span className="hx-rail-icon"><Icon name="crown" /></span>{WEDDING_GROUP.label}
        </button>
        {SHOWCASE_FUNCTIONS.map((f) => (
          <button key={f.id} type="button" aria-pressed={fnId === f.id} onClick={() => pickFunction(f.id)}>
            <span className="hx-rail-icon"><Icon name={f.icon} /></span>{f.label}
          </button>
        ))}
      </div>

      <div className="hx-stage">
        <div className="hx-stage-device">
          <DeviceFrame view={view}>
            <CinematicInvite key={templateId + replay} content={content} template={template} guestName="Sharma Family" />
          </DeviceFrame>
        </div>
        <div className="hx-stage-controls">
          <div className="hx-designs" role="group" aria-label="Design">
            {options.map((t) => (
              <button key={t.id} type="button" aria-pressed={t.id === templateId} onClick={() => { setTemplateId(t.id); setReplay((r) => r + 1); }}>
                <i style={{ background: 'linear-gradient(135deg,' + t.palette.bg + ' 50%,' + t.palette.accent + ' 50%)' }} />{t.name}
              </button>
            ))}
          </div>
          <button type="button" className="hx-round" aria-label="Replay from the opening" title="Replay" onClick={() => setReplay((r) => r + 1)}><Icon name="replay" /></button>
        </div>
      </div>

      <div className="hx-inside">
        <p className="hx-rail-title">Inside this invitation</p>
        <ul>
          {inside.map((x) => <li key={x.label}><Icon name={x.icon} />{x.label}</li>)}
        </ul>
        <div className="hx-inside-view">
          <span>Preview on</span>
          <DeviceToggle view={view} onChange={setView} />
        </div>
        <div className="hx-inside-actions">
          <Link className="sx-btn sx-btn-primary" href={createHref(template)}>Use {template.name}</Link>
          <Link className="sx-textlink" href={demoHref(template)}>Open full invitation <Icon name="arrow-up-right" /></Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- personalization demo ---------- */
function GuestSwitcher() {
  const [active, setActive] = useState(0);
  const g = guests[active];
  return (
    <div className="hx-guestdemo">
      <div className="hx-guestlist" role="tablist" aria-label="Guests">
        {guests.map((x, i) => (
          <button key={x.initials} type="button" role="tab" aria-selected={active === i} onClick={() => setActive(i)}>
            <span className="hx-avatar">{x.initials}</span>
            <span><strong>{x.name}</strong><small>{x.note}</small></span>
            <Icon name="arrow-right" className="hx-guestlist-arrow" />
          </button>
        ))}
      </div>
      <div className="hx-guestcard" key={active} role="tabpanel" aria-live="polite">
        <span className="hx-guestcard-orn" aria-hidden="true" />
        <small>You are invited</small>
        <h3>Dear {g.name}</h3>
        <p>Aarav &amp; Meera request your presence at</p>
        <ul>
          {g.events.map((e, i) => <li key={e} style={{ '--i': i } as React.CSSProperties}><Icon name="calendar" />{e}</li>)}
        </ul>
        <span className="hx-guestcard-link"><Icon name="lock" /> uptemp.in/i/aarav-meera/•••••</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const featured = FUNCTIONS.map((f) => TEMPLATES.find((t) => t.functionId === f.id)!);
  const strip = useRef<HTMLDivElement>(null);
  const scrollStrip = (dir: 1 | -1) => strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <SiteShell>
      {/* hero */}
      <section className="hx-hero">
        <div className="hx-hero-bg" aria-hidden="true"><i /><i /><i /></div>
        <div className="sx-shell hx-hero-head">
          <p className="sx-pill rv"><Icon name="sparkles" /> Cinematic invitations for Indian celebrations</p>
          <h1 className="rv" style={{ '--rd': '80ms' } as React.CSSProperties}>Invitations that <em>open like a film</em></h1>
          <p className="hx-lead rv" style={{ '--rd': '160ms' } as React.CSSProperties}>Wedding, sagai, haldi, birthday, car delivery or griha pravesh — your names, every function, photos and RSVP in one link. Personal for every guest.</p>
          <div className="sx-actions sx-center rv" style={{ '--rd': '240ms' } as React.CSSProperties}>
            <Link className="sx-btn sx-btn-primary" href="/templates">Create your invitation <Icon name="arrow-right" /></Link>
            <a className="sx-btn sx-btn-ghost" href="#showcase"><Icon name="play" /> Watch one play</a>
          </div>
        </div>
        <div className="sx-shell rv" id="showcase" style={{ '--rd': '300ms' } as React.CSSProperties}>
          <Showcase />
        </div>
      </section>

      {/* template filmstrip */}
      <section className="sx-section" id="templates">
        <div className="sx-shell">
          <div className="sx-head rv">
            <div>
              <p className="sx-eyebrow">Templates</p>
              <h2>One mood for <em>every occasion</em></h2>
              <p className="sx-muted">Hover a card to peek inside. Each design has its own opening — doors, envelope, curtain, gift box, shutter or bloom.</p>
            </div>
            <div className="hx-arrows">
              <button type="button" aria-label="Previous designs" onClick={() => scrollStrip(-1)}><Icon name="arrow-left" /></button>
              <button type="button" aria-label="Next designs" onClick={() => scrollStrip(1)}><Icon name="arrow-right" /></button>
            </div>
          </div>
        </div>
        <div className="hx-strip" ref={strip}>
          {featured.map((t, i) => <div className="hx-strip-item" key={t.id}><TemplateCard template={t} index={i} /></div>)}
          <Link href="/templates" className="hx-strip-more rv">
            <span className="hx-strip-more-icon"><Icon name="templates" /></span>
            <strong>{TEMPLATES.length}</strong>
            <span>designs across {FUNCTIONS.length} occasions</span>
            <em>Browse all <Icon name="arrow-right" /></em>
          </Link>
        </div>
      </section>

      {/* personalization */}
      <section className="sx-section hx-soft">
        <div className="sx-shell hx-person">
          <div className="rv">
            <p className="sx-eyebrow">Create once · personal for everyone</p>
            <h2>Each guest opens <em>their own</em> invitation</h2>
            <p>Choose who is invited to which function. Every guest gets a private link that greets them by name and shows only their functions. Tap a guest to see it change.</p>
            <ul className="hx-person-points">
              <li><span><Icon name="users" /></span><div><strong>Add or import guests</strong><small>Type them in or upload a CSV list</small></div></li>
              <li><span><Icon name="ticket" /></span><div><strong>Assign functions</strong><small>Haldi for family, reception for all</small></div></li>
              <li><span><Icon name="chat" /></span><div><strong>Send on WhatsApp</strong><small>A ready message with each link</small></div></li>
            </ul>
          </div>
          <div className="rv" style={{ '--rd': '150ms' } as React.CSSProperties}>
            <GuestSwitcher />
          </div>
        </div>
      </section>

      <StepsSection />
    </SiteShell>
  );
}
