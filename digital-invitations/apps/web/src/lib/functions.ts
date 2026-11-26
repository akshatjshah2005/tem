/* Functions (occasions), templates and invitation content model.
   One data contract shared by the cinematic player, the editor, demos and the gallery. */

export type FunctionId =
  | 'wedding' | 'engagement' | 'haldi' | 'sangeet' | 'baby-shower'
  | 'birthday' | 'car-delivery' | 'housewarming' | 'family';

export type InviteEvent = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  venue: string;
  address: string;
  dressCode: string;
  note: string;
};

export type InviteContent = {
  functionId: FunctionId;
  templateId: string;
  blessing: string;
  headline: string;
  name1: string;
  name2: string;
  joiner: string;
  family: string;
  message: string;
  closing: string;
  coverPhoto: string;
  photos: string[];
  events: InviteEvent[];
  showCountdown: boolean;
  showRsvp: boolean;
  showGallery: boolean;
  music: string;
};

export type OpeningStyle = 'doors' | 'envelope' | 'curtain' | 'giftbox' | 'garage' | 'bloom';
export type MotifStyle = 'mandala' | 'floral' | 'petals' | 'rings' | 'stars' | 'balloons' | 'confetti' | 'lights' | 'toran' | 'clouds';

export type TemplateDef = {
  id: string;
  name: string;
  functionId: FunctionId;
  description: string;
  opening: OpeningStyle;
  motif: MotifStyle;
  palette: { bg: string; bg2: string; ink: string; accent: string; accent2: string; surface: string };
  headFont: string;
  isNew?: boolean;
  order: number;
};

export type FunctionDef = {
  id: FunctionId;
  label: string;
  short: string;
  icon: string;
  tagline: string;
  name1Label: string;
  name2Label: string;
  name2Hint?: string;
  eventPresets: string[];
  defaults: Omit<InviteContent, 'functionId' | 'templateId' | 'coverPhoto' | 'photos' | 'events'> & { events: Omit<InviteEvent, 'id'>[] };
};

const ev = (name: string, date: string, time: string, venue: string, address: string, dressCode = '', note = ''): Omit<InviteEvent, 'id'> =>
  ({ name, date, time, venue, address, dressCode, note });

const base = { closing: 'Your presence will make our celebration complete.', showCountdown: true, showRsvp: true, showGallery: true, music: 'shehnai' };

export const FUNCTIONS: FunctionDef[] = [
  {
    id: 'wedding', label: 'Wedding Ceremony', short: 'Wedding', icon: 'wedding', tagline: 'Pheras, reception and every ritual in between',
    name1Label: 'Groom’s name', name2Label: 'Bride’s name',
    eventPresets: ['Ganesh Sthapna', 'Mehendi', 'Haldi', 'Sangeet', 'Mameru', 'Garba', 'Wedding Ceremony', 'Reception'],
    defaults: {
      ...base, blessing: '॥ श्री गणेशाय नमः ॥', headline: 'The Wedding of', name1: 'Aarav', name2: 'Meera', joiner: '&',
      family: 'With the blessings of Mrs. Sunita & Mr. Rajesh Sharma and Mrs. Rekha & Mr. Anil Verma',
      message: 'Together with our families, we joyfully invite you to celebrate our wedding and bless us as we begin our new journey.',
      closing: 'Your blessings are the greatest gift we could ask for.',
      events: [
        ev('Mehendi', '2027-02-12', '16:00', 'Shubh Lawns', 'SG Highway, Ahmedabad', 'Green & pastels'),
        ev('Wedding Ceremony', '2027-02-14', '19:30', 'The Grand Palace', 'Bodakdev, Ahmedabad', 'Traditional attire'),
        ev('Reception', '2027-02-15', '20:00', 'Taj Banquet Hall', 'Ashram Road, Ahmedabad', 'Indo-western'),
      ],
    },
  },
  {
    id: 'engagement', label: 'Engagement (Sagai)', short: 'Engagement', icon: 'engagement', tagline: 'Rings, roka and the first family celebration',
    name1Label: 'Groom’s name', name2Label: 'Bride’s name',
    eventPresets: ['Roka', 'Ring Ceremony', 'Sagai', 'Chunni Ceremony', 'Dinner'],
    defaults: {
      ...base, blessing: '॥ श्री गणेशाय नमः ॥', headline: 'The Engagement of', name1: 'Rohan', name2: 'Isha', joiner: '&',
      family: 'With love from the Mehta and Desai families',
      message: 'Two hearts, two families, one beautiful beginning. Join us as we exchange rings and celebrate our sagai.',
      music: 'flute',
      events: [
        ev('Ring Ceremony', '2027-01-10', '18:30', 'Lotus Banquet', 'Vastrapur, Ahmedabad', 'Pastel festive'),
        ev('Dinner', '2027-01-10', '20:30', 'Lotus Banquet', 'Vastrapur, Ahmedabad'),
      ],
    },
  },
  {
    id: 'haldi', label: 'Haldi Ceremony', short: 'Haldi', icon: 'haldi', tagline: 'Turmeric, marigolds and lots of laughter',
    name1Label: 'Bride / groom name', name2Label: 'Partner’s name (optional)',
    eventPresets: ['Haldi', 'Pithi', 'Mehendi', 'Lunch'],
    defaults: {
      ...base, blessing: '॥ श्री गणेशाय नमः ॥', headline: 'Haldi Ceremony', name1: 'Meera', name2: 'Aarav', joiner: '&',
      family: 'Hosted by the Verma family',
      message: 'Come dressed in yellow and bring your brightest smile — it’s time to turn the bride-to-be golden!',
      music: 'dhol',
      events: [ev('Haldi', '2027-02-13', '10:00', 'Verma Residence', 'Satellite, Ahmedabad', 'Yellow & white')],
    },
  },
  {
    id: 'sangeet', label: 'Sangeet Night', short: 'Sangeet', icon: 'sangeet', tagline: 'Dance, dhol and a night to remember',
    name1Label: 'Groom’s name', name2Label: 'Bride’s name',
    eventPresets: ['Sangeet', 'Garba', 'Cocktail Night', 'Dinner'],
    defaults: {
      ...base, blessing: 'Let the music begin', headline: 'Sangeet Night', name1: 'Aarav', name2: 'Meera', joiner: '&',
      family: 'With love from both families',
      message: 'Put on your dancing shoes! Join us for an evening of music, dance and celebration before the big day.',
      music: 'dhol',
      events: [ev('Sangeet & Dinner', '2027-02-13', '19:00', 'Riverside Club', 'Riverfront, Ahmedabad', 'Glam & sparkle')],
    },
  },
  {
    id: 'baby-shower', label: 'Baby Shower', short: 'Baby Shower', icon: 'baby', tagline: 'Godh bharai, seemantham and sweet blessings',
    name1Label: 'Mom-to-be', name2Label: 'Dad-to-be (optional)',
    eventPresets: ['Godh Bharai', 'Seemantham', 'Valaikappu', 'Lunch'],
    defaults: {
      ...base, blessing: '॥ श्री गणेशाय नमः ॥', headline: 'Godh Bharai · Baby Shower', name1: 'Priya', name2: 'Karan', joiner: '&',
      family: 'Hosted with love by the Shah family',
      message: 'A little miracle is on the way! Join us to shower love and blessings on the mom-to-be.',
      closing: 'Thank you for blessing our little one.', music: 'lullaby',
      events: [ev('Godh Bharai Ceremony', '2027-03-07', '11:00', 'Shah Residence', 'Navrangpura, Ahmedabad', 'Pastels')],
    },
  },
  {
    id: 'birthday', label: 'Birthday Celebrations', short: 'Birthday', icon: 'birthday', tagline: 'First birthdays to milestone parties',
    name1Label: 'Birthday star’s name', name2Label: 'Age or milestone', name2Hint: 'e.g. turns 5 · 50th birthday',
    eventPresets: ['Cake Cutting', 'Birthday Party', 'Dinner', 'Pooja'],
    defaults: {
      ...base, blessing: 'Let’s celebrate!', headline: 'Birthday Celebration', name1: 'Aanya', name2: 'turns 5', joiner: '',
      family: 'With love, Mummy & Papa',
      message: 'Balloons, cake and lots of fun — come celebrate this special day with us!',
      closing: 'Can’t wait to celebrate with you!', music: 'party',
      events: [ev('Birthday Party', '2027-04-18', '17:00', 'Funzone Party Hall', 'Prahladnagar, Ahmedabad', 'Colourful & comfy')],
    },
  },
  {
    id: 'car-delivery', label: 'Car Delivery Celebration', short: 'Car Delivery', icon: 'car', tagline: 'Pooja, sweets and a brand-new ride',
    name1Label: 'Family / owner name', name2Label: 'Car', name2Hint: 'e.g. our new SUV',
    eventPresets: ['Car Delivery', 'Vahan Pooja', 'Sweets & Snacks', 'First Drive'],
    defaults: {
      ...base, blessing: '॥ शुभ लाभ ॥', headline: 'Celebrating our new ride', name1: 'The Mehta Family', name2: 'our new SUV', joiner: '',
      family: 'With joy, Rakesh & Neha Mehta',
      message: 'Our dream car is finally coming home! Join us for the delivery, a small vahan pooja and sweets.',
      closing: 'Come share the joy of our first drive!', music: 'party',
      events: [ev('Car Delivery & Vahan Pooja', '2027-01-26', '11:00', 'Mehta Residence', 'Bopal, Ahmedabad')],
    },
  },
  {
    id: 'housewarming', label: 'Housewarming', short: 'Housewarming', icon: 'home', tagline: 'Griha pravesh, vastu pooja and lunch',
    name1Label: 'Family name', name2Label: 'Home name (optional)', name2Hint: 'e.g. Shubh Niwas',
    eventPresets: ['Griha Pravesh', 'Vastu Pooja', 'Satyanarayan Katha', 'Lunch'],
    defaults: {
      ...base, blessing: '॥ श्री गणेशाय नमः ॥', headline: 'Griha Pravesh', name1: 'The Patel Family', name2: 'Shubh Niwas', joiner: '',
      family: 'With the blessings of our elders',
      message: 'With the grace of God, we are stepping into our new home. Please join us for the pooja and lunch.',
      closing: 'Your blessings will make our house a home.',
      events: [
        ev('Vastu Pooja', '2027-03-21', '09:00', 'Shubh Niwas', 'A-12, Green Avenue, Gota, Ahmedabad'),
        ev('Lunch', '2027-03-21', '12:30', 'Shubh Niwas', 'A-12, Green Avenue, Gota, Ahmedabad'),
      ],
    },
  },
  {
    id: 'family', label: 'Family Celebrations & Special Events', short: 'Family & Special', icon: 'family', tagline: 'Anniversaries, poojas, reunions and more',
    name1Label: 'Hosted by', name2Label: 'Occasion', name2Hint: 'e.g. 25th Anniversary · Satyanarayan Pooja',
    eventPresets: ['Anniversary Dinner', 'Pooja', 'Get-together', 'Retirement Party', 'Custom Event'],
    defaults: {
      ...base, blessing: 'With love', headline: 'You’re invited', name1: 'The Sharma Family', name2: '25th Anniversary Celebration', joiner: '',
      family: 'Sunil & Anita Sharma',
      message: 'Twenty-five years of love and laughter — and we would love to celebrate it with you.',
      music: 'flute',
      events: [ev('Celebration Dinner', '2027-05-02', '19:30', 'The Orchid Hotel', 'CG Road, Ahmedabad', 'Festive')],
    },
  },
];

export const TEMPLATES: TemplateDef[] = [
  { id: 'royal-sandalwood', name: 'Royal Mandap', functionId: 'wedding', description: 'Carved palace doors, gold mandala and diya glow', opening: 'doors', motif: 'mandala', headFont: "'Cinzel', serif", order: 1,
    palette: { bg: '#3b0d16', bg2: '#7a1f2b', ink: '#fff4dc', accent: '#e8b45a', accent2: '#5a1420', surface: 'rgba(255,240,210,.08)' } },
  { id: 'sanskara-ivory', name: 'Ivory Blossom', functionId: 'wedding', description: 'Wax-seal envelope and blooming florals', opening: 'envelope', motif: 'floral', headFont: "'Playfair Display', serif", order: 2,
    palette: { bg: '#fbf5ee', bg2: '#f3e3dc', ink: '#4a2a33', accent: '#b5566f', accent2: '#e9cdbf', surface: 'rgba(181,86,111,.07)' } },
  { id: 'engagement-rings', name: 'Ring Ceremony', functionId: 'engagement', description: 'A gift reveal with floating golden rings', opening: 'giftbox', motif: 'rings', headFont: "'Playfair Display', serif", isNew: true, order: 3,
    palette: { bg: '#fff6f3', bg2: '#f6dcd6', ink: '#5b2c35', accent: '#c78a5b', accent2: '#e7b6a8', surface: 'rgba(199,138,91,.08)' } },
  { id: 'engagement-moonlight', name: 'Sagai Moonlight', functionId: 'engagement', description: 'Velvet curtains under a starry night', opening: 'curtain', motif: 'stars', headFont: "'Marcellus', serif", order: 4,
    palette: { bg: '#0d1b3d', bg2: '#1f3a6e', ink: '#eef3ff', accent: '#c9d6ff', accent2: '#2a2f6b', surface: 'rgba(201,214,255,.08)' } },
  { id: 'haldi-marigold-urli', name: 'Marigold Morning', functionId: 'haldi', description: 'A marigold bloom opens into a shower of petals', opening: 'bloom', motif: 'petals', headFont: "'Playfair Display', serif", order: 5,
    palette: { bg: '#fff5cf', bg2: '#ffd86b', ink: '#5a3a00', accent: '#e07b00', accent2: '#ffc93c', surface: 'rgba(224,123,0,.08)' } },
  { id: 'haldi-sunshine', name: 'Haldi Sunshine', functionId: 'haldi', description: 'Mango-leaf toran and sunny envelope', opening: 'envelope', motif: 'toran', headFont: "'Marcellus', serif", isNew: true, order: 6,
    palette: { bg: '#fffbe8', bg2: '#fde9a2', ink: '#3f4a12', accent: '#d99a00', accent2: '#7fa33a', surface: 'rgba(127,163,58,.09)' } },
  { id: 'sangeet-peacock-glam', name: 'Peacock Nights', functionId: 'sangeet', description: 'Stage curtains rise on teal and twinkling lights', opening: 'curtain', motif: 'lights', headFont: "'Cinzel', serif", order: 7,
    palette: { bg: '#062a2e', bg2: '#0d4f55', ink: '#e9fffb', accent: '#3fd1c0', accent2: '#103c63', surface: 'rgba(63,209,192,.08)' } },
  { id: 'sangeet-dhol', name: 'Dhol & Disco', functionId: 'sangeet', description: 'Confetti, colour and party energy', opening: 'giftbox', motif: 'confetti', headFont: "'Plus Jakarta Sans', sans-serif", isNew: true, order: 8,
    palette: { bg: '#24104a', bg2: '#4b1d8a', ink: '#fff', accent: '#ffcf3f', accent2: '#ff4fa3', surface: 'rgba(255,255,255,.08)' } },
  { id: 'baby-cradle', name: 'Little Blessings', functionId: 'baby-shower', description: 'Soft clouds and a gentle envelope reveal', opening: 'envelope', motif: 'clouds', headFont: "'Playfair Display', serif", isNew: true, order: 9,
    palette: { bg: '#eef6ff', bg2: '#d6e9ff', ink: '#24456e', accent: '#5b9ce6', accent2: '#ffd6e3', surface: 'rgba(91,156,230,.08)' } },
  { id: 'baby-bloom', name: 'Godh Bharai Bloom', functionId: 'baby-shower', description: 'Peach florals blooming open', opening: 'bloom', motif: 'floral', headFont: "'Marcellus', serif", order: 10,
    palette: { bg: '#fff4ee', bg2: '#ffe0d2', ink: '#6b3a2e', accent: '#e58a6b', accent2: '#ffd0bd', surface: 'rgba(229,138,107,.08)' } },
  { id: 'birthday-balloons', name: 'Balloon Party', functionId: 'birthday', description: 'Gift box pops open into floating balloons', opening: 'giftbox', motif: 'balloons', headFont: "'Plus Jakarta Sans', sans-serif", isNew: true, order: 11,
    palette: { bg: '#e8f4ff', bg2: '#bfe0ff', ink: '#163a63', accent: '#ff6b8b', accent2: '#ffd23f', surface: 'rgba(255,255,255,.55)' } },
  { id: 'birthday-candle', name: 'Golden Milestone', functionId: 'birthday', description: 'Black and gold with sparkling stars', opening: 'curtain', motif: 'stars', headFont: "'Cinzel', serif", order: 12,
    palette: { bg: '#121212', bg2: '#2a2416', ink: '#fff7e0', accent: '#e4be62', accent2: '#3a3122', surface: 'rgba(228,190,98,.08)' } },
  { id: 'car-keys', name: 'Keys to Joy', functionId: 'car-delivery', description: 'Showroom shutter rolls up on a new ride', opening: 'garage', motif: 'confetti', headFont: "'Plus Jakarta Sans', sans-serif", isNew: true, order: 13,
    palette: { bg: '#0b1f3a', bg2: '#16457a', ink: '#f2f7ff', accent: '#4fb3ff', accent2: '#c7d2e0', surface: 'rgba(79,179,255,.1)' } },
  { id: 'car-road', name: 'Road Ahead', functionId: 'car-delivery', description: 'Night drive glow with headlight streaks', opening: 'garage', motif: 'lights', headFont: "'Marcellus', serif", order: 14,
    palette: { bg: '#0e0f14', bg2: '#22283a', ink: '#ffffff', accent: '#ffb547', accent2: '#3a4560', surface: 'rgba(255,181,71,.08)' } },
  { id: 'home-kalash', name: 'Griha Pravesh Kalash', functionId: 'housewarming', description: 'Toran-decked doors open to your new home', opening: 'doors', motif: 'toran', headFont: "'Cinzel', serif", order: 15,
    palette: { bg: '#fff6e6', bg2: '#ffdca8', ink: '#5a2d0c', accent: '#d9651b', accent2: '#8a3b12', surface: 'rgba(217,101,27,.08)' } },
  { id: 'home-nest', name: 'New Nest', functionId: 'housewarming', description: 'Calm sage tones and a soft envelope', opening: 'envelope', motif: 'floral', headFont: "'Playfair Display', serif", isNew: true, order: 16,
    palette: { bg: '#f2f7f1', bg2: '#d9e8d5', ink: '#2f4a33', accent: '#5e8f5a', accent2: '#c9dcc4', surface: 'rgba(94,143,90,.08)' } },
  { id: 'family-confetti', name: 'Celebration Confetti', functionId: 'family', description: 'Bright blue confetti and a gift reveal', opening: 'giftbox', motif: 'confetti', headFont: "'Plus Jakarta Sans', sans-serif", order: 17,
    palette: { bg: '#eff6ff', bg2: '#cfe3ff', ink: '#12325c', accent: '#2563eb', accent2: '#93c5fd', surface: 'rgba(37,99,235,.07)' } },
  { id: 'family-heritage', name: 'Heritage Frame', functionId: 'family', description: 'Classic doors and an elegant mandala', opening: 'doors', motif: 'mandala', headFont: "'Marcellus', serif", order: 18,
    palette: { bg: '#f7f3ea', bg2: '#e8dcc2', ink: '#3d3220', accent: '#9c7a3c', accent2: '#5c4a2a', surface: 'rgba(156,122,60,.08)' } },
];

export const MUSIC = [
  { id: 'none', label: 'No music' },
  { id: 'shehnai', label: 'Shehnai (mangal dhun)' },
  { id: 'flute', label: 'Soft flute' },
  { id: 'dhol', label: 'Dhol beats' },
  { id: 'lullaby', label: 'Gentle lullaby' },
  { id: 'party', label: 'Party pop' },
];

export const getFunction = (id?: string | null) => FUNCTIONS.find((f) => f.id === id) || FUNCTIONS[0];
export const getTemplate = (id?: string | null) => TEMPLATES.find((t) => t.id === id);
export const templatesFor = (fn: FunctionId) => TEMPLATES.filter((t) => t.functionId === fn);
export const firstTemplateFor = (fn: FunctionId) => templatesFor(fn)[0];

/** Legacy category values used in older links. */
const CATEGORY_ALIASES: Record<string, FunctionId> = { 'common-any': 'family', 'any-occasion': 'family', 'save-the-date': 'wedding', kankotri: 'wedding', festivals: 'family', baby: 'baby-shower', car: 'car-delivery', 'griha-pravesh': 'housewarming' };
export const resolveFunctionId = (value?: string | null): FunctionId | undefined => {
  if (!value) return undefined;
  if (FUNCTIONS.some((f) => f.id === value)) return value as FunctionId;
  return CATEGORY_ALIASES[value];
};

let seq = 0;
export const newId = (prefix = 'ev') => prefix + '-' + Date.now().toString(36) + '-' + (seq++).toString(36);

export function defaultContent(functionId: FunctionId, templateId?: string): InviteContent {
  const fn = getFunction(functionId);
  const { events, ...rest } = fn.defaults;
  return {
    ...rest,
    functionId,
    templateId: templateId && getTemplate(templateId)?.functionId === functionId ? templateId : firstTemplateFor(functionId).id,
    coverPhoto: '',
    photos: [],
    events: events.map((e, i) => ({ ...e, id: 'ev-' + functionId + '-' + i })),
  };
}

export const createHref = (t: TemplateDef) => '/create?' + new URLSearchParams({ template: t.id, category: t.functionId }).toString();
export const demoHref = (t: TemplateDef) => '/e/demo-' + t.id;

/* ---------- formatting helpers ---------- */
export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString('en-IN', opts) : iso;
}
export function formatTime(hhmm: string) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  if (!Number.isFinite(h)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  return ((h % 12) || 12) + ':' + String(m || 0).padStart(2, '0') + ' ' + suffix;
}
export function eventStart(e: Pick<InviteEvent, 'date' | 'time'>) {
  const d = new Date(e.date + 'T' + (e.time || '00:00') + ':00');
  return Number.isFinite(d.getTime()) ? d : null;
}
export function displayNames(c: Pick<InviteContent, 'name1' | 'name2' | 'joiner'>) {
  return c.joiner && c.name2 ? c.name1 + ' ' + c.joiner + ' ' + c.name2 : c.name1;
}
export function mapsUrl(e: Pick<InviteEvent, 'venue' | 'address'>) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([e.venue, e.address].filter(Boolean).join(', '));
}
export function downloadIcs(e: InviteEvent, title: string) {
  const start = eventStart(e);
  if (!start) return false;
  const end = new Date(start.getTime() + 3 * 3600 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = (v: string) => v.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[,;]/g, '\\$&');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//uptemp//Invitation//EN', 'BEGIN:VEVENT',
    'UID:' + e.id + '-' + start.getTime() + '@uptemp', 'DTSTAMP:' + fmt(new Date()), 'DTSTART:' + fmt(start), 'DTEND:' + fmt(end),
    'SUMMARY:' + esc(e.name + ' · ' + title), 'LOCATION:' + esc([e.venue, e.address].filter(Boolean).join(', ')),
    'DESCRIPTION:' + esc(e.dressCode ? 'Dress code: ' + e.dressCode : title), 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = (e.name || 'event').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
