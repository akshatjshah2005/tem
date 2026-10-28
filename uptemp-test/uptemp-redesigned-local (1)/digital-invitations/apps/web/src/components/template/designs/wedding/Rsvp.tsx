'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { rsvpAPI } from '@/lib/api';
import type { RenderEvent } from '@/lib/template/types';
import Reveal from '../../Reveal';
import { SectionProps, str } from './shared';

export default function RsvpSection({ model, section }: SectionProps) {
  const router = useRouter();
  const { guest, rsvp, isPersonalized, template } = model;
  const design = template.design;

  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const heading = str(section.heading) || design.copy.rsvpHeading;
  const note = str(section.note) || design.copy.rsvpNote;

  if (!guest && !isPersonalized) return null;

  const handleSuccess = () => {
    setOpen(false);
    setSubmitted(true);
    router.refresh();
  };

  return (
    <section className="tpl-section tpl-rsvp" id="rsvp" data-testid="tpl-rsvp">
      <div className="tpl-wrap" style={{ maxWidth: '40rem' }}>
        <Reveal anim="up">
          {heading ? <p className="tpl-kicker">{heading}</p> : null}
          <h2 className="tpl-title">{heading}</h2>

          {!guest ? (
            <p className="tpl-lead">
              To respond, please use the personal invitation link you received from the hosts.
            </p>
          ) : (
            <div className="tpl-rsvp__panel">
              {rsvp && !submitted ? (
                <RsvpStatus
                  response={rsvp.response}
                  guestsCount={rsvp.guestsCount}
                  message={rsvp.message}
                  respondedAt={rsvp.respondedAt}
                  acceptLabel={design.copy.rsvpAcceptLabel}
                  declineLabel={design.copy.rsvpDeclineLabel}
                />
              ) : (
                <>
                  <p className="tpl-prose" style={{ fontSize: '1.05rem' }}>
                    {note || 'Will you be joining us in celebrating this special day?'}
                  </p>
                  <div className="tpl-rsvp__actions">
                    <button
                      type="button"
                      className="tpl-btn"
                      data-testid="rsvp-open"
                      onClick={() => setOpen(true)}
                    >
                      {rsvp ? 'Update response' : 'Respond'}
                    </button>
                  </div>
                </>
              )}

              {rsvp && !submitted ? (
                <div className="tpl-rsvp__actions">
                  <button
                    type="button"
                    className="tpl-btn tpl-btn--soft"
                    data-testid="rsvp-open"
                    onClick={() => setOpen(true)}
                  >
                    Update response
                  </button>
                </div>
              ) : null}

              {submitted ? (
                <p className="tpl-rsvp__meta" style={{ marginTop: '1rem' }}>
                  Thank you — your response has been recorded.
                </p>
              ) : null}
            </div>
          )}
        </Reveal>
      </div>

      {open && guest ? (
        <RsvpModal
          token={guest.personalToken}
          events={model.events}
          acceptLabel={design.copy.rsvpAcceptLabel}
          declineLabel={design.copy.rsvpDeclineLabel}
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      ) : null}
    </section>
  );
}

interface StatusProps {
  response: string;
  guestsCount: number;
  message?: string | null;
  respondedAt?: string | null;
  acceptLabel: string;
  declineLabel: string;
}

function RsvpStatus({ response, guestsCount, message, respondedAt, acceptLabel, declineLabel }: StatusProps) {
  const accepted = response === 'ACCEPT';
  const declined = response === 'DECLINE';
  const status = accepted ? 'ACCEPTED' : declined ? 'DECLINED' : 'PENDING';
  const label = accepted ? acceptLabel || 'Accepted' : declined ? declineLabel || 'Declined' : 'Awaiting reply';

  return (
    <div className="tpl-rsvp__status" data-testid="rsvp-status" data-response={status}>
      <div className="tpl-rsvp__status-head">
        <span className={`tpl-rsvp__pill tpl-rsvp__pill--${accepted ? 'accept' : declined ? 'decline' : 'pending'}`}>
          {label}
        </span>
        <span className="tpl-rsvp__meta">
          {accepted ? `${guestsCount} ${guestsCount === 1 ? 'attendee' : 'attendees'}` : 'Response saved'}
          {respondedAt ? ` · ${formatResponded(respondedAt)}` : ''}
        </span>
      </div>
      {message ? <p className="tpl-rsvp__message">&ldquo;{message}&rdquo;</p> : null}
    </div>
  );
}

function formatResponded(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface ModalProps {
  token: string;
  events: RenderEvent[];
  acceptLabel: string;
  declineLabel: string;
  onClose: () => void;
  onSuccess: () => void;
}

function RsvpModal({ token, events, acceptLabel, declineLabel, onClose, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState<'ACCEPT' | 'DECLINE'>('ACCEPT');
  const [guestsCount, setGuestsCount] = useState(1);
  const [message, setMessage] = useState('');
  const [dietary, setDietary] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(events.map((event) => event.id));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await rsvpAPI.submit(token, {
        response,
        guestsCount: response === 'ACCEPT' ? guestsCount : 1,
        message: message.trim() || undefined,
        dietary: dietary.trim() || undefined,
        eventIds: response === 'ACCEPT' && selectedEvents.length > 0 ? selectedEvents : undefined
      });
      toast.success('Your response has been recorded.');
      onSuccess();
    } catch (err) {
      const apiError = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(apiError || 'We could not save your response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tpl-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="tpl-modal" role="dialog" aria-modal="true" aria-label="RSVP">
        <div className="tpl-modal__head">
          <h3 className="tpl-modal__title">Will you join us?</h3>
          <button type="button" className="tpl-modal__close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="tpl-modal__body">
          <form className="tpl-form" onSubmit={submit}>
            <div className="tpl-field">
              <span className="tpl-label">Your response</span>
              <div className="tpl-choice">
                <label className="tpl-choice__option">
                  <input
                    type="radio"
                    name="response"
                    value="ACCEPT"
                    checked={response === 'ACCEPT'}
                    onChange={() => setResponse('ACCEPT')}
                  />
                  <span>
                    <span className="tpl-choice__title">{acceptLabel || 'Joyfully Accept'}</span>
                    <span className="tpl-choice__hint">Yes, I will be there.</span>
                  </span>
                </label>
                <label className="tpl-choice__option">
                  <input
                    type="radio"
                    name="response"
                    value="DECLINE"
                    checked={response === 'DECLINE'}
                    onChange={() => setResponse('DECLINE')}
                  />
                  <span>
                    <span className="tpl-choice__title">{declineLabel || 'Regretfully Decline'}</span>
                    <span className="tpl-choice__hint">Unable to attend.</span>
                  </span>
                </label>
              </div>
            </div>

            {response === 'ACCEPT' ? (
              <>
                <div className="tpl-field">
                  <label className="tpl-label" htmlFor="tpl-guests">
                    Number of attendees
                  </label>
                  <input
                    id="tpl-guests"
                    className="tpl-input"
                    type="number"
                    min={1}
                    max={20}
                    value={guestsCount}
                    onChange={(event) => setGuestsCount(Math.max(1, Number(event.target.value) || 1))}
                  />
                </div>

                {events.length > 1 ? (
                  <div className="tpl-field">
                    <span className="tpl-label">Events you will attend</span>
                    <div className="tpl-choice">
                      {events.map((event) => (
                        <label className="tpl-choice__option" key={event.id}>
                          <input
                            type="checkbox"
                            checked={selectedEvents.includes(event.id)}
                            onChange={() =>
                              setSelectedEvents((current) =>
                                current.includes(event.id)
                                  ? current.filter((id) => id !== event.id)
                                  : [...current, event.id]
                              )
                            }
                          />
                          <span>
                            <span className="tpl-choice__title">{event.name}</span>
                            <span className="tpl-choice__hint">{event.dateLabel}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="tpl-field">
                  <label className="tpl-label" htmlFor="tpl-dietary">
                    Dietary requirements (optional)
                  </label>
                  <input
                    id="tpl-dietary"
                    className="tpl-input"
                    type="text"
                    value={dietary}
                    onChange={(event) => setDietary(event.target.value)}
                    placeholder="Vegetarian, vegan, gluten-free..."
                  />
                </div>
              </>
            ) : null}

            <div className="tpl-field">
              <label className="tpl-label" htmlFor="tpl-message">
                Message to the hosts (optional)
              </label>
              <textarea
                id="tpl-message"
                className="tpl-textarea"
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Leave a note for the couple..."
              />
            </div>

            {error ? <p className="tpl-form__error">{error}</p> : null}

            <button type="submit" className="tpl-btn tpl-btn--wide" disabled={loading}>
              {loading ? 'Submitting...' : 'Send response'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
