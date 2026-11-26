import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { FaqSection, PageHero, SiteShell } from '@/components/ui/Sections';

export const metadata = { title: 'Contact — uptemp.' };

const options = [
  { icon: 'palette', title: 'Custom template', text: 'Have a theme, colour palette or family motif in mind? Tell us and we’ll design a template made just for your celebration.', cta: 'Browse templates first', href: '/templates' },
  { icon: 'share', title: 'Help with sharing', text: 'Questions about guest lists, personal links or sending invitations on WhatsApp? Start from your dashboard.', cta: 'My invitations', href: '/dashboard' },
  { icon: 'book', title: 'How it works', text: 'See every step — from choosing a design to tracking RSVPs — explained simply.', cta: 'How it works', href: '/how-it-works' },
];

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero kicker="Contact" title="We’re here to help" text="A custom design, help with your guest list, or a question about your invitation — start here." />
      <section className="sx-section" style={{ paddingTop: 0 }}>
        <div className="sx-shell sx-cards-3">
          {options.map((o) => (
            <div className="sx-info" key={o.title}>
              <span className="sx-feature-icon" aria-hidden="true"><Icon name={o.icon} /></span>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
              <Link className="sx-btn sx-btn-ghost sx-btn-sm" href={o.href} style={{ justifySelf: 'start', marginTop: '.4rem' }}>{o.cta}</Link>
            </div>
          ))}
        </div>
      </section>
      <FaqSection limit={4} />
    </SiteShell>
  );
}
