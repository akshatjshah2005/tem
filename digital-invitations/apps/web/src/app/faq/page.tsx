import { CtaBand, FaqSection, PageHero, SiteShell } from '@/components/ui/Sections';

export const metadata = { title: 'FAQ — uptemp.' };

export default function FaqPage() {
  return (
    <SiteShell>
      <PageHero kicker="Help" title="Frequently asked questions" text="Everything you need to know about creating and sharing your invitation." />
      <FaqSection />
      <CtaBand />
    </SiteShell>
  );
}
