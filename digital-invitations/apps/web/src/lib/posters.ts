export type CountMode = 'until' | 'since' | 'age' | 'none';
export type PosterStyleId = 'royal' | 'floral' | 'modern' | 'festive';
export type PosterSize = 'story' | 'portrait' | 'square';
export type Lang = 'en' | 'hi';

export type PosterOccasion = {
  id: string;
  label: string;
  icon: string;
  group: 'Celebrations' | 'Festivals';
  count: CountMode;
  unit: string;
  name1: string;
  name2: string;
  name1Label: string;
  name2Label?: string;
  date: string;
  dateLabel: string;
  style: PosterStyleId;
  kicker: { en: string; hi: string };
  lines: { en: string[]; hi: string[] };
  caption: string;
};

export const POSTER_SIZES: { id: PosterSize; label: string; sub: string; w: number; h: number }[] = [
  { id: 'story', label: '9:16', sub: 'WhatsApp status · Reel · Story', w: 1080, h: 1920 },
  { id: 'portrait', label: '4:5', sub: 'Instagram post', w: 1080, h: 1350 },
  { id: 'square', label: '1:1', sub: 'Square · Facebook', w: 1080, h: 1080 },
];

export const POSTER_STYLES: { id: PosterStyleId; label: string; bg: [string, string]; ink: string; accent: string; head: string }[] = [
  { id: 'royal', label: 'Royal gold', bg: ['#4a0f1b', '#1f0509'], ink: '#fff3d6', accent: '#e8b45a', head: 'Cinzel' },
  { id: 'floral', label: 'Soft floral', bg: ['#fff8f2', '#f6dcd3'], ink: '#4a2a33', accent: '#c25b78', head: 'Playfair Display' },
  { id: 'modern', label: 'Modern blue', bg: ['#2563eb', '#0b1f4d'], ink: '#ffffff', accent: '#7dd3fc', head: 'Plus Jakarta Sans' },
  { id: 'festive', label: 'Festive lights', bg: ['#2a1060', '#0d0526'], ink: '#fff7e0', accent: '#ffcf3f', head: 'Playfair Display' },
];

export const POSTER_OCCASIONS: PosterOccasion[] = [
  { id: 'wedding', label: 'Wedding countdown', icon: 'wedding', group: 'Celebrations', count: 'until', unit: 'DAYS TO GO', name1: 'Aarav', name2: 'Meera', name1Label: 'Groom', name2Label: 'Bride', date: '2027-02-14', dateLabel: 'Wedding date', style: 'royal',
    kicker: { en: 'Save the date', hi: 'शुभ विवाह' }, lines: { en: ['Counting down to forever', 'The big day is almost here!', 'Two hearts, one journey'], hi: ['शुभ विवाह की उलटी गिनती', 'बस कुछ ही दिन और…', 'दो दिल, एक सफ़र'] },
    caption: 'Only {count} days to go until {names} say “I do”! #WeddingCountdown' },
  { id: 'engagement', label: 'Engagement (Sagai)', icon: 'engagement', group: 'Celebrations', count: 'until', unit: 'DAYS TO OUR SAGAI', name1: 'Rohan', name2: 'Isha', name1Label: 'Groom', name2Label: 'Bride', date: '2027-01-10', dateLabel: 'Sagai date', style: 'floral',
    kicker: { en: 'We’re getting engaged', hi: 'सगाई' }, lines: { en: ['A ring, a promise, a new beginning', 'She said yes!'], hi: ['एक अंगूठी, एक वादा', 'नई शुरुआत की ओर'] },
    caption: '{count} days until our sagai! {names} #Engagement' },
  { id: 'haldi', label: 'Haldi', icon: 'haldi', group: 'Celebrations', count: 'until', unit: 'DAYS TO HALDI', name1: 'Meera', name2: '', name1Label: 'Bride / groom', date: '2027-02-13', dateLabel: 'Haldi date', style: 'festive',
    kicker: { en: 'Haldi ceremony', hi: 'हल्दी रस्म' }, lines: { en: ['Get ready to turn golden!', 'Wear yellow, bring smiles'], hi: ['हल्दी का रंग, अपनों का संग', 'पीले रंग में रंग जाइए'] },
    caption: 'Haldi vibes loading… {count} days to go! #Haldi' },
  { id: 'sangeet', label: 'Sangeet', icon: 'sangeet', group: 'Celebrations', count: 'until', unit: 'DAYS TO SANGEET', name1: 'Aarav', name2: 'Meera', name1Label: 'Groom', name2Label: 'Bride', date: '2027-02-13', dateLabel: 'Sangeet date', style: 'festive',
    kicker: { en: 'Sangeet night', hi: 'संगीत संध्या' }, lines: { en: ['Put on your dancing shoes!', 'Music, dance & celebration'], hi: ['नाच-गाने की रात', 'ढोल बजेगा, सब नाचेंगे'] },
    caption: '{count} days to the Sangeet! Who’s ready to dance? #Sangeet' },
  { id: 'baby-shower', label: 'Baby shower', icon: 'baby', group: 'Celebrations', count: 'until', unit: 'DAYS TO GODH BHARAI', name1: 'Priya', name2: 'Karan', name1Label: 'Mom-to-be', name2Label: 'Dad-to-be', date: '2027-03-07', dateLabel: 'Baby shower date', style: 'floral',
    kicker: { en: 'Baby shower', hi: 'गोद भराई' }, lines: { en: ['A little miracle is on the way', 'Oh baby!'], hi: ['नन्हा मेहमान आने वाला है', 'खुशियों की गोद भराई'] },
    caption: 'Our little one is on the way! {count} days to the baby shower. #GodhBharai' },
  { id: 'birthday', label: 'Birthday', icon: 'birthday', group: 'Celebrations', count: 'age', unit: 'TODAY', name1: 'Aanya', name2: '', name1Label: 'Birthday star', date: '2022-04-18', dateLabel: 'Date of birth (year is never printed)', style: 'modern',
    kicker: { en: 'Happy birthday', hi: 'जन्मदिन मुबारक' }, lines: { en: ['Make a wish!', 'Let’s celebrate!'], hi: ['ढेरों खुशियाँ और प्यार', 'केक कटेगा, जश्न होगा'] },
    caption: 'Happy birthday {names}! Turning {count}! #Birthday' },
  { id: 'car-delivery', label: 'New car delivery', icon: 'car', group: 'Celebrations', count: 'none', unit: '', name1: 'The Mehta Family', name2: 'our new SUV', name1Label: 'Family / owner', name2Label: 'Car', date: '2027-01-26', dateLabel: 'Delivery date', style: 'modern',
    kicker: { en: 'New ride unlocked', hi: 'नई गाड़ी, नई खुशियाँ' }, lines: { en: ['Our dream car is home!', 'Shubh yatra!'], hi: ['शुभ यात्रा', 'सपनों की गाड़ी घर आई'] },
    caption: 'Welcome home, {names2}! Shubh yatra to us. #NewCar' },
  { id: 'housewarming', label: 'Griha Pravesh', icon: 'home', group: 'Celebrations', count: 'until', unit: 'DAYS TO GRIHA PRAVESH', name1: 'The Patel Family', name2: 'Shubh Niwas', name1Label: 'Family', name2Label: 'Home name', date: '2027-03-21', dateLabel: 'Griha pravesh date', style: 'royal',
    kicker: { en: 'Griha Pravesh', hi: 'गृह प्रवेश' }, lines: { en: ['New home, new beginnings', 'With the blessings of our elders'], hi: ['नया घर, नई शुरुआत', 'बड़ों के आशीर्वाद से'] },
    caption: '{count} days until we step into our new home! #GrihaPravesh' },
  { id: 'anniversary', label: 'Anniversary', icon: 'anniversary', group: 'Celebrations', count: 'since', unit: 'YEARS TOGETHER', name1: 'Sunil', name2: 'Anita', name1Label: 'Partner', name2Label: 'Partner', date: '2001-12-10', dateLabel: 'Wedding date', style: 'floral',
    kicker: { en: 'Happy anniversary', hi: 'सालगिरह मुबारक' }, lines: { en: ['Still choosing each other', 'Forever and always'], hi: ['साथ का हर पल अनमोल', 'हमेशा साथ'] },
    caption: '{count} years of love! Happy anniversary {names}. #Anniversary' },
  { id: 'diwali', label: 'Diwali', icon: 'diwali', group: 'Festivals', count: 'none', unit: '', name1: 'The Sharma Family', name2: '', name1Label: 'From', date: '', dateLabel: 'Date (optional)', style: 'festive',
    kicker: { en: 'Happy Diwali', hi: 'शुभ दीपावली' }, lines: { en: ['May the festival of lights brighten your life', 'Wishing you joy and prosperity'], hi: ['दीपों का यह पर्व आपके जीवन को रोशन करे', 'सुख, समृद्धि और खुशियाँ'] },
    caption: 'Happy Diwali! Warm wishes from {names}. #Diwali' },
  { id: 'holi', label: 'Holi', icon: 'holi', group: 'Festivals', count: 'none', unit: '', name1: 'The Sharma Family', name2: '', name1Label: 'From', date: '', dateLabel: 'Date (optional)', style: 'modern',
    kicker: { en: 'Happy Holi', hi: 'होली की शुभकामनाएँ' }, lines: { en: ['Let the colours of joy fill your life', 'Bura na mano, Holi hai!'], hi: ['रंगों की तरह खिलता रहे जीवन', 'बुरा न मानो, होली है!'] },
    caption: 'Happy Holi! Colourful wishes from {names}. #Holi' },
  { id: 'navratri', label: 'Navratri', icon: 'navratri', group: 'Festivals', count: 'none', unit: '', name1: 'The Sharma Family', name2: '', name1Label: 'From', date: '', dateLabel: 'Date (optional)', style: 'festive',
    kicker: { en: 'Happy Navratri', hi: 'शुभ नवरात्रि' }, lines: { en: ['Nine nights of devotion and garba', 'May Maa Durga bless you'], hi: ['माँ दुर्गा का आशीर्वाद बना रहे', 'गरबा की रातें'] },
    caption: 'Happy Navratri! Garba nights are here. #Navratri' },
  { id: 'rakhi', label: 'Raksha Bandhan', icon: 'rakhi', group: 'Festivals', count: 'none', unit: '', name1: 'Riya', name2: 'Kabir', name1Label: 'Sister', name2Label: 'Brother', date: '', dateLabel: 'Date (optional)', style: 'floral',
    kicker: { en: 'Happy Raksha Bandhan', hi: 'रक्षा बंधन' }, lines: { en: ['A thread of love and protection', 'Siblings forever'], hi: ['प्यार और विश्वास का धागा', 'भाई-बहन का अटूट रिश्ता'] },
    caption: 'Happy Raksha Bandhan! {names} #Rakhi' },
  { id: 'ganesh', label: 'Ganesh Chaturthi', icon: 'ganesh', group: 'Festivals', count: 'none', unit: '', name1: 'The Sharma Family', name2: '', name1Label: 'From', date: '', dateLabel: 'Date (optional)', style: 'royal',
    kicker: { en: 'Ganpati Bappa Morya', hi: 'गणपति बप्पा मोरया' }, lines: { en: ['May Bappa remove every obstacle', 'Happy Ganesh Chaturthi'], hi: ['विघ्नहर्ता सबके दुःख हरें', 'गणेश चतुर्थी की शुभकामनाएँ'] },
    caption: 'Ganpati Bappa Morya! #GaneshChaturthi' },
  { id: 'new-year', label: 'New Year', icon: 'new-year', group: 'Festivals', count: 'until', unit: 'DAYS TO 2027', name1: 'The Sharma Family', name2: '', name1Label: 'From', date: '2027-01-01', dateLabel: 'Countdown to', style: 'modern',
    kicker: { en: 'Happy New Year', hi: 'नव वर्ष की शुभकामनाएँ' }, lines: { en: ['New year, new beginnings', 'Cheers to 2027!'], hi: ['नया साल, नई उम्मीदें', 'खुशियों भरा साल'] },
    caption: 'Happy New Year from {names}! #NewYear' },
];

export function computeCount(occ: PosterOccasion, iso: string, now = Date.now()): { value: string; unit: string } | null {
  if (occ.count === 'none' || !iso) return null;
  const d = new Date(iso + 'T00:00:00');
  if (!Number.isFinite(d.getTime())) return null;
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  if (occ.count === 'until') {
    const days = Math.round((d.getTime() - today.getTime()) / 864e5);
    if (days > 0) return { value: String(days), unit: days === 1 ? occ.unit.replace('DAYS', 'DAY') : occ.unit };
    if (days === 0) return { value: 'Today', unit: 'IT’S THE DAY!' };
    return { value: String(-days), unit: 'DAYS AGO' };
  }
  if (occ.count === 'since') {
    let years = today.getFullYear() - d.getFullYear();
    if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) years--;
    if (years >= 1) return { value: String(years), unit: years === 1 ? 'YEAR TOGETHER' : 'YEARS TOGETHER' };
    const days = Math.max(0, Math.round((today.getTime() - d.getTime()) / 864e5));
    return { value: String(days), unit: 'DAYS TOGETHER' };
  }
  // age at the next (or current) birthday — the birth year is never shown
  const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next.setFullYear(next.getFullYear() + 1);
  const age = next.getFullYear() - d.getFullYear();
  return { value: String(Math.max(1, age)), unit: next.getTime() === today.getTime() ? 'TODAY' : 'TURNING' };
}
