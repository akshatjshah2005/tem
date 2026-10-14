'use client';

import { useState } from 'react';
import Reveal from '../../Reveal';
import { SectionProps, str } from './shared';

export default function Closing({ model, section }: SectionProps) {
  const { invitation, variables, template } = model;
  const design = template.design;
  const [copied, setCopied] = useState(false);

  const lead = str(section.lead) || design.copy.closingLine;
  const couple = variables.couple_names || invitation.name;
  const hashtag = str(variables.hashtag);
  const hosts = str(variables.family_name) || invitation.hostName;
  const url = invitation.url;
  const shareText = `${couple} are getting married — you are warmly invited.`;
  const whatsappHref = url
    ? `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`
    : '';

  const copyLink = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="tpl-section tpl-closing" data-testid="tpl-closing">
      <div className="tpl-wrap" style={{ maxWidth: '42rem' }}>
        <Reveal anim="up">
          {lead ? <p className="tpl-closing__lead">{lead}</p> : null}
          <div className="tpl-ornament" aria-hidden="true">
            <span className="tpl-ornament__mark">&#10086;</span>
          </div>
          <p className="tpl-closing__names">{couple}</p>
          {hashtag ? <p className="tpl-closing__hashtag">{hashtag}</p> : null}
          {hosts ? <p className="tpl-closing__hosts">{hosts}</p> : null}

          {url ? (
            <div className="tpl-share">
              <p className="tpl-share__title">{design.copy.shareHeading}</p>
              <div className="tpl-share__row">
                <a
                  className="tpl-btn tpl-btn--soft"
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="share-whatsapp"
                >
                  Share on WhatsApp
                </a>
                <button type="button" className="tpl-btn tpl-btn--soft" onClick={copyLink} data-testid="share-copy">
                  {copied ? 'Link copied' : 'Copy link'}
                </button>
              </div>
            </div>
          ) : null}
        </Reveal>
      </div>

      <footer className="tpl-footer">{design.copy.footerText}</footer>
    </section>
  );
}
