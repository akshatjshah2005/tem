import Link from 'next/link';
import { CtaBand, FeaturesSection, PageHero, SiteShell, StepsSection } from '@/components/ui/Sections';
import Icon from '@/components/ui/Icon';
import { FUNCTIONS } from '@/lib/functions';

export const metadata = { title: 'How it works — uptemp.' };

const details = [
  { icon: 'eye', title: 'Edit with a live preview', text: 'Change names, wording, functions, photos and music. The invitation jumps to the scene you’re editing so you see every change instantly.' },
  { icon: 'users', title: 'Personal links for guests', text: 'Add guests or import a CSV from Excel. Choose which functions each guest sees — their link shows their name and only those functions.' },
  { icon: 'rsvp', title: 'Share & collect RSVPs', text: 'Send a ready WhatsApp message to each guest. Guests open the link, watch the invitation and RSVP — no app needed.' },
];

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <PageHero kicker="How it works" title="Create once. Personalize for every guest." text="From choosing an occasion to the last RSVP — here’s how an invitation comes together.">
        <div className="sx-chips" style={{ marginTop: '1.4rem' }}>
          {FUNCTIONS.map((f) => <Link key={f.id} className="sx-chip" href={'/templates?category=' + f.id}><Icon name={f.icon} /> {f.short}</Link>)}
        </div>
      </PageHero>
      <StepsSection />
      <section className="sx-section sx-section-tint">
        <div className="sx-shell sx-cards-3">
          {details.map((d, i) => (
            <div className="sx-info rv" key={d.title} style={{ '--rd': i * 100 + 'ms' } as React.CSSProperties}>
              <span className="sx-feature-icon"><Icon name={d.icon} /></span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </div>
          ))}
        </div>
      </section>
      <FeaturesSection />
      <CtaBand />
    </SiteShell>
  );
}
