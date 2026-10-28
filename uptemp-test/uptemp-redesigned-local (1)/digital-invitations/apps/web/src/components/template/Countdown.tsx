'use client';

import { useEffect, useState } from 'react';

interface CountdownLabels {
  days?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
}

interface CountdownProps {
  /** ISO target time computed by the template model. */
  targetIso: string;
  /**
   * Remaining milliseconds calculated on the server so the first client render
   * matches the HTML the server sent (prevents hydration mismatches).
   */
  initialMs: number;
  labels?: CountdownLabels;
}

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return {
    days: String(days),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
}

export default function Countdown({ targetIso, initialMs, labels }: CountdownProps) {
  const [remaining, setRemaining] = useState(initialMs);

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    if (Number.isNaN(target)) return;

    const tick = () => setRemaining(target - Date.now());
    tick();

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [targetIso]);

  if (remaining <= 0) return null;

  const parts = split(remaining);
  const units: { key: string; value: string; label: string }[] = [
    { key: 'days', value: parts.days, label: labels?.days || 'Days' },
    { key: 'hours', value: parts.hours, label: labels?.hours || 'Hours' },
    { key: 'minutes', value: parts.minutes, label: labels?.minutes || 'Minutes' },
    { key: 'seconds', value: parts.seconds, label: labels?.seconds || 'Seconds' }
  ];

  return (
    <div className="tpl-countdown" role="timer" aria-live="off">
      {units.map((unit) => (
        <div className="tpl-countdown__unit" key={unit.key}>
          <span className="tpl-countdown__value" data-unit={unit.key}>
            {unit.value}
          </span>
          <span className="tpl-countdown__label">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
