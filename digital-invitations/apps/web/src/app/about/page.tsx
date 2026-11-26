import { CtaBand, PageHero, SiteShell } from '@/components/ui/Sections';

export const metadata = { title: 'About — uptemp.' };

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero kicker="About us" title="Invitations that feel personal again" />
      <section className="sx-section" style={{ paddingTop: 0 }}>
        <div className="sx-prose">
          <p>
            Indian celebrations are made of many moments — haldi, mehendi, sangeet, the wedding and the reception — and
            not every guest is invited to all of them. Yet most digital invitations send the same card to everyone.
          </p>
          <p>
            uptemp. was built around one idea: <strong>create once, personalize for every guest, share individually.</strong>{' '}
            You design a cinematic, animated invitation once. Each guest then receives their own link that greets them by
            name and shows only the events they are invited to.
          </p>
          <h2>What we care about</h2>
          <p>
            Designs that feel like a film rather than a flyer. Tools that respect your time — Excel guest imports,
            WhatsApp-ready messages and RSVPs in one place. And invitations that open instantly on any phone, with no app
            to install.
          </p>
        </div>
      </section>
      <CtaBand />
    </SiteShell>
  );
}
