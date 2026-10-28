export function toDateTimeLocal(dateIso?: string | null, timeIso?: string | null): string {
  if (!dateIso) return '';
  const datePart = String(dateIso).slice(0, 10);
  if (!timeIso) return `${datePart}T00:00`;
  const t = new Date(timeIso);
  if (isNaN(t.getTime())) return `${datePart}T00:00`;
  const hh = String(t.getUTCHours()).padStart(2, '0');
  const mm = String(t.getUTCMinutes()).padStart(2, '0');
  return `${datePart}T${hh}:${mm}`;
}

export function splitDateTimeInput(value: string): { datePart: string; timePart?: string } {
  if (!value) return { datePart: '' };
  const [datePart, timePart] = value.split('T');
  if (!timePart) return { datePart };
  const normalized = timePart.length === 5 ? `${timePart}:00` : timePart;
  return { datePart, timePart: normalized };
}

export function formatDateOnly(dateIso?: string | null): string {
  if (!dateIso) return '';
  return new Date(dateIso).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimeUtc(timeIso?: string | null): string {
  if (!timeIso) return '';
  const t = new Date(timeIso);
  if (isNaN(t.getTime())) return '';
  const hh = String(t.getUTCHours()).padStart(2, '0');
  const mm = String(t.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatTimeRange(
  start?: string | null,
  end?: string | null
): string {
  const s = formatTimeUtc(start);
  const e = formatTimeUtc(end);
  if (s && e) return `${s} - ${e}`;
  return s || e || '';
}

export function mediaDisplayUrl(m: { optimizedUrl?: string | null; originalUrl: string }): string {
  return m.optimizedUrl || m.originalUrl;
}

export function mediaIsImage(m: { mimeType?: string | null }): boolean {
  return (m.mimeType || '').startsWith('image/');
}

export function eventStartIso(event: { date: string; startTime?: string | null }): string {
  const datePart = String(event.date).slice(0, 10);
  if (!event.startTime) return `${datePart}T00:00:00`;
  const t = new Date(event.startTime);
  if (isNaN(t.getTime())) return datePart;
  const hh = String(t.getUTCHours()).padStart(2, '0');
  const mm = String(t.getUTCMinutes()).padStart(2, '0');
  const ss = String(t.getUTCSeconds()).padStart(2, '0');
  return `${datePart}T${hh}:${mm}:${ss}`;
}

export function eventEndIso(event: { date: string; endTime?: string | null }): string | null {
  if (!event.endTime) return null;
  const datePart = String(event.date).slice(0, 10);
  const t = new Date(event.endTime);
  if (isNaN(t.getTime())) return null;
  const hh = String(t.getUTCHours()).padStart(2, '0');
  const mm = String(t.getUTCMinutes()).padStart(2, '0');
  const ss = String(t.getUTCSeconds()).padStart(2, '0');
  return `${datePart}T${hh}:${mm}:${ss}`;
}

export function normalizeMobile(value: string): string {
  return value.replace(/\D/g, '');
}
