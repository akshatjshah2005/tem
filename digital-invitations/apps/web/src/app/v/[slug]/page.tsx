'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import CinematicInvite from '@/components/cinematic/CinematicInvite';
import LovePlayer from '@/components/love/LovePlayer';
import { getTemplate, templatesFor } from '@/lib/functions';
import { addRsvp, getItem, type StoredItem } from '@/lib/store';
import '../../e/[slug]/demo.css';

function Viewer() {
  const { slug } = useParams<{ slug: string }>();
  const params = useSearchParams();
  const guestId = params?.get('g') || undefined;
  const [item, setItem] = useState<StoredItem | null | undefined>(undefined);

  useEffect(() => { setItem(getItem(slug) || null); }, [slug]);

  if (item === undefined) return <div className="dm dm-missing"><p>Opening invitation…</p></div>;

  if (!item) {
    return (
      <div className="dm dm-missing">
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>Invitation not found</h1>
        <p style={{ maxWidth: '30rem', color: '#5d6c84' }}>
          This link may be mistyped or the invitation was removed. Invitations are currently stored in the browser where they were published.
        </p>
        <Link href="/">Go to the home page</Link>
      </div>
    );
  }

  if (item.kind === 'love') {
    return (
      <div className="dm" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="dm-phone"><LovePlayer story={item.story} preview={false} /></div>
      </div>
    );
  }

  const guest = guestId ? item.guests.find((g) => g.id === guestId) : undefined;
  const template = getTemplate(item.content.templateId) || templatesFor(item.content.functionId)[0];
  const visible = item.personalize && guest ? guest.eventIds : undefined;
  const eventNames = item.content.events.filter((e) => !visible || visible.includes(e.id)).map((e) => e.name);

  return (
    <div className="dm" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="dm-phone">
        <CinematicInvite
          content={item.content}
          template={template}
          guestName={guest?.name}
          visibleEventIds={visible}
          onRsvp={(r) => {
            try {
              addRsvp({ inviteId: item.id, guestId: guest?.id, phone: guest?.phone, name: r.name, attending: r.attending, count: r.count, diet: r.diet, message: r.message, eventNames });
            } catch { /* storage full — the thank-you still shows */ }
            return r.attending ? 'Thank you, ' + r.name + '! Your RSVP for ' + r.count + (r.count === 1 ? ' guest' : ' guests') + ' is confirmed.' : 'Thank you for letting us know, ' + r.name + '. You’ll be missed!';
          }}
        />
      </div>
    </div>
  );
}

export default function PublicInvitationPage() {
  return (
    <Suspense fallback={<div className="dm dm-missing"><p>Opening invitation…</p></div>}>
      <Viewer />
    </Suspense>
  );
}
