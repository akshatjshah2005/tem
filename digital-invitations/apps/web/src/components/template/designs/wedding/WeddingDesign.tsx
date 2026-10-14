import type { RenderModel, TemplateSection } from '@/lib/template/types';
import { Fragment } from 'react';
import Closing from './Closing';
import { CountdownSection, EventList } from './Events';
import Gallery from './Gallery';
import Hero from './Hero';
import RsvpSection from './Rsvp';
import { GuestGreeting, Message, Notice } from './Story';

export const WeddingDesign = ({ model }: { model: RenderModel }) => {
  const sections = model.template.sections.filter((section) => section.enabled !== false);

  return (
    <div className="tpl-wedding" data-testid="template-wedding">
      {sections.map((section) => (
        <Fragment key={section.id || section.type}>{renderSection(model, section)}</Fragment>
      ))}
    </div>
  );
};

function renderSection(model: RenderModel, section: TemplateSection) {
  const props = { model, section };

  switch (section.type) {
    case 'hero':
      return <Hero {...props} />;
    case 'guest_greeting':
      return <GuestGreeting {...props} />;
    case 'message':
      return <Message {...props} />;
    case 'countdown':
      return <CountdownSection {...props} />;
    case 'event_list':
      return <EventList {...props} />;
    case 'gallery':
      return <Gallery {...props} />;
    case 'personalization_notice':
      return <Notice {...props} />;
    case 'rsvp':
      return <RsvpSection {...props} />;
    case 'closing':
      return <Closing {...props} />;
    default:
      return null;
  }
}

export default WeddingDesign;
