export type LoveOptionId = 'how' | 'valentine' | 'anniversary' | 'birthday' | 'long-distance' | 'love-letter';
export type CounterMode = 'since' | 'until' | 'none';

export type LoveChapter = { id: string; title: string; date: string; text: string; photo: string };

export type LoveStory = {
  kind: LoveOptionId;
  from: string;
  to: string;
  date: string;
  counter: CounterMode;
  counterLabel: string;
  passcode: string;
  hint: string;
  opening: string;
  letter: string;
  chapters: LoveChapter[];
  signoff: string;
  theme: 'blush' | 'midnight' | 'sky';
};

export const LOVE_OPTIONS: { id: LoveOptionId; label: string; icon: string; tagline: string }[] = [
  { id: 'how', label: 'How Love Story works', icon: 'book', tagline: 'Your story, photos and a passcode only they know' },
  { id: 'valentine', label: 'Valentine’s surprise', icon: 'rose', tagline: 'A surprise they open on the 14th' },
  { id: 'anniversary', label: 'Anniversary gift', icon: 'gift', tagline: 'Every year together, in one link' },
  { id: 'birthday', label: 'Birthday surprise', icon: 'birthday', tagline: 'A love note for their special day' },
  { id: 'long-distance', label: 'Long-distance gift', icon: 'plane', tagline: 'For someone a flight away' },
  { id: 'love-letter', label: 'Digital love letter', icon: 'letter', tagline: 'A letter that isn’t just a text message' },
];

const ch = (id: string, title: string, date: string, text: string): LoveChapter => ({ id, title, date, text, photo: '' });

const common = {
  from: 'Aarav', to: 'Meera', passcode: '1402', hint: 'The day we first met (DDMM)', theme: 'blush' as const,
  chapters: [
    ch('c1', 'Where it began', '2023-02-14', 'A rainy evening, two cups of chai and a conversation that was supposed to last twenty minutes.'),
    ch('c2', 'Our first trip', '2023-11-05', 'Watching the sunset over the lake, I knew life was brighter with you beside me.'),
    ch('c3', 'Today', '', 'Every ordinary day with you still feels like a small celebration.'),
  ],
};

export const LOVE_PRESETS: Record<LoveOptionId, LoveStory> = {
  how: { ...common, kind: 'how', date: '2023-02-14', counter: 'since', counterLabel: 'days of us', opening: 'I made something just for you…', letter: 'Some things are too big for a text message. So here is our story — the moments I keep coming back to, and the reasons I fall for you all over again.', signoff: 'Forever yours' },
  valentine: { ...common, kind: 'valentine', date: '2027-02-14', counter: 'until', counterLabel: 'days until Valentine’s Day', opening: 'Happy Valentine’s Day, my love', letter: 'Roses fade and chocolates disappear, so I wanted to give you something that lasts — a little story of us, written only for you.', signoff: 'Your Valentine, always' },
  anniversary: { ...common, kind: 'anniversary', date: '2022-12-10', counter: 'since', counterLabel: 'days together', opening: 'Happy anniversary', letter: 'Another year of laughing at the same jokes, sharing the last bite and choosing each other every single day. Here’s to all of it — and to everything still ahead.', signoff: 'With all my love' },
  birthday: { ...common, kind: 'birthday', date: '2027-03-21', counter: 'until', counterLabel: 'days until your birthday', opening: 'Happy birthday to my favourite person', letter: 'On your special day, I wanted to remind you how much brighter you make my world. Make a wish — I already got mine when I met you.', signoff: 'Love you, birthday star' },
  'long-distance': { ...common, kind: 'long-distance', date: '2027-01-15', counter: 'until', counterLabel: 'days until I see you', opening: 'No matter the distance…', letter: 'Miles between us, but never too far for my heart. Every call, every late-night message and every countdown brings me one day closer to you.', signoff: 'Counting the days' },
  'love-letter': { ...common, kind: 'love-letter', date: '', counter: 'none', counterLabel: '', opening: 'A letter for you', letter: 'My dearest,\n\nI have started this letter a hundred times. There are no perfect words, only true ones: you are my calm, my home and my favourite hello.\n\nThank you for being you.', signoff: 'Yours, always', chapters: [] },
};

export function daysBetween(fromIso: string, toMs: number) {
  if (!fromIso) return null;
  const d = new Date(fromIso + 'T00:00:00').getTime();
  if (!Number.isFinite(d)) return null;
  return Math.round((toMs - d) / 864e5);
}
