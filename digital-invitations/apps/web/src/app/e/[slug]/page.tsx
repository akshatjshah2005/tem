'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import CinematicInvite from '@/components/cinematic/CinematicInvite';
import Icon from '@/components/ui/Icon';
import { TEMPLATES, createHref, defaultContent, getFunction, getTemplate, templatesFor } from '@/lib/functions';
import './demo.css';

export default function DemoInvitationPage() {
  const params = useParams<{ slug: string }>();
  const id = String(params?.slug || '').replace(/^demo-/, '');
  const template = getTemplate(id);
  const [replay, setReplay] = useState(0);
  const content = useMemo(() => (template ? defaultContent(template.functionId, template.id) : null), [template]);

  if (!template || !content) {
    return (
      <div className="dm dm-missing">
        <h1>This demo doesn’t exist</h1>
        <p>It may have been renamed. Browse all {TEMPLATES.length} templates instead.</p>
        <Link href="/templates">See templates</Link>
      </div>
    );
  }

  const fn = getFunction(template.functionId);
  const siblings = templatesFor(template.functionId).filter((t) => t.id !== template.id);

  return (
    <div className="dm" style={{ '--dm-bg': template.palette.bg, '--dm-acc': template.palette.accent } as React.CSSProperties}>
      <header className="dm-bar">
        <Link href="/templates" className="dm-back">← Templates</Link>
        <div className="dm-title"><small>{fn.label} · demo</small><strong>{template.name}</strong></div>
        <Link href={createHref(template)} className="dm-cta">Use this design</Link>
      </header>
      <main className="dm-stage">
        <aside className="dm-side">
          <p className="dm-kicker">Live demo</p>
          <h1>{template.name}</h1>
          <p>{template.description}. Tap the invitation to open it — it plays scene by scene like a short film. Tap the left or right side to go back or forward.</p>
          <ul>
            <li>Personal greeting for each guest</li>
            <li>{content.events.length} sample {content.events.length === 1 ? 'function' : 'functions'} with directions & calendar</li>
            <li>Countdown and RSVP</li>
          </ul>
          <div className="dm-actions">
            <Link href={createHref(template)} className="dm-cta">Use this design</Link>
            <button type="button" onClick={() => setReplay((r) => r + 1)}><Icon name="replay" /> Replay</button>
          </div>
          {siblings.length > 0 && (
            <p className="dm-more">More for {fn.short}: {siblings.map((s) => <Link key={s.id} href={'/e/demo-' + s.id}>{s.name}</Link>)}</p>
          )}
        </aside>
        <div className="dm-phone">
          <CinematicInvite key={replay} content={content} template={template} guestName="Sharma Family" />
        </div>
      </main>
    </div>
  );
}
