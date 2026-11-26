'use client';

import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { studioDesigns } from '@/lib/studio-designs';
import '@/app/invitation-studio.css';

export interface CeremonyEvent {
  id: string;
  name: string;
  categoryTag?: string;
  date: string;
  time: string;
  venue: string;
  dressCode: string;
  visibleToAll: boolean;
  expanded?: boolean;
}

export interface GuestItem {
  id: string;
  name: string;
  category: string;
  passes: number;
  phone: string;
  salutation: string;
  customWhatsAppText?: string;
  assignedEventIds: string[];
  slug: string;
}

export interface ThemeStyle {
  id: string;
  name: string;
  badge: string;
  fontFamily: string;
  colors: string[];
  outerBg: string;
  phoneBg: string;
  cardBg: string;
  cardBorder: string;
  headerAccent: string;
  titleColor: string;
  subtextColor: string;
  badgeBg: string;
  bannerGradient: string;
  primaryButton: string;
  mandalaColor: string;
  isDark: boolean;
}

export interface PresetMoment {
  id: string;
  title: string;
  tag: string;
  url: string;
}

export interface WeddingSongItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  emoji: string;
  bpm: number;
}

const PRESET_MOMENTS: PresetMoment[] = [
  {
    id: 'm-1',
    title: 'Royal Mandap & Palace Arches',
    tag: 'Heritage Vivah',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'm-2',
    title: 'Sangeet Night & Fairy Lights',
    tag: 'Celebration Glam',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'm-3',
    title: 'Golden Sunset & Beach Vows',
    tag: 'Romantic Pastel',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'm-4',
    title: 'Haldi & Marigold Phoolon Ki Holi',
    tag: 'Vibrant Traditional',
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'm-5',
    title: 'The Ring Ceremony & Diyas',
    tag: 'Sacred Muhurtham',
    url: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'm-6',
    title: 'Udaipur Lake Palace Romance',
    tag: 'Royal Lake View',
    url: 'https://images.unsplash.com/photo-1519225424909-66170d473489?auto=format&fit=crop&w=800&q=80',
  },
];

const WISHLYS_WEDDING_SONGS: WeddingSongItem[] = [
  {
    id: 'song-1',
    title: 'Shenhai Instrumental (Mangal Vadya)',
    subtitle: 'Classic Auspicious Shehnai & Sitar Harmony',
    tag: 'Most Popular ⭐',
    emoji: '🎺',
    bpm: 75,
  },
  {
    id: 'song-2',
    title: 'Kudmayi / Din Shagna Da',
    subtitle: 'Emotional Acoustic Flute & Bridal Walk Melody',
    tag: 'Bridal Entry',
    emoji: '🪈',
    bpm: 82,
  },
  {
    id: 'song-3',
    title: 'Kesariya & Raataan Lambiyan',
    subtitle: 'Romantic Violin Strings & Piano Romance',
    tag: 'Couple Theme',
    emoji: '🎻',
    bpm: 90,
  },
  {
    id: 'song-4',
    title: 'Madhanya (Traditional Babul)',
    subtitle: 'Soulful Sitar, Tanpura & Shehnai Vidai Raga',
    tag: 'Emotional Heritage',
    emoji: '🪕',
    bpm: 68,
  },
  {
    id: 'song-5',
    title: 'Ganesh Vandana & Vedic Mantras',
    subtitle: 'Sacred Sanskrit Chants for Auspicious Beginning',
    tag: 'Divine Blessings',
    emoji: '🪔',
    bpm: 60,
  },
  {
    id: 'song-6',
    title: 'Dholak Sangeet & Ghungroo Beats',
    subtitle: 'Festive Punjabi & Rajasthani Folk Beats',
    tag: 'Sangeet Party',
    emoji: '🥁',
    bpm: 115,
  },
  {
    id: 'song-7',
    title: 'Jashn-E-Bahara (Palace Symphony)',
    subtitle: 'Grand Mughal Court Sitar & Flute Orchestration',
    tag: 'Regal Luxury',
    emoji: '🎼',
    bpm: 80,
  },
];

const THEMES: ThemeStyle[] = [
  {
    id: 'royal-sandalwood',
    name: 'Royal Sandalwood (Vivaah Mandap)',
    badge: 'Wishlys Signature ⭐',
    fontFamily: "'Playfair Display', serif",
    colors: ['#0d233a', '#fdf8ee', '#d4a259'],
    outerBg: 'from-[#fbf7ee] via-[#fffbf2] to-[#f4ebe0]',
    phoneBg: 'bg-gradient-to-b from-[#fdf9f2] via-[#fffdf9] to-[#fbf5ea]',
    cardBg: 'bg-gradient-to-br from-[#ffffff] via-[#fffcf7] to-[#fcf5e8]',
    cardBorder: 'border-amber-200/80',
    headerAccent: 'text-[#8a4d19]',
    titleColor: 'text-[#1a2d42]',
    subtextColor: 'text-slate-600',
    badgeBg: 'bg-amber-100/80 text-amber-900 border-amber-200',
    bannerGradient: 'from-[#d9a862] via-[#b9843e] to-[#8c5922]',
    primaryButton: 'bg-[#123b5d] hover:bg-sky-800 text-white',
    mandalaColor: 'border-amber-400/40',
    isDark: false,
  },
  {
    id: 'cinematic-couple',
    name: 'Cinematic Couple (Film Editorial)',
    badge: 'Modern Video Suite',
    fontFamily: "'Playfair Display', serif",
    colors: ['#0f172a', '#f8fafc', '#38bdf8'],
    outerBg: 'from-[#0b1329] via-[#0f172a] to-[#020617]',
    phoneBg: 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#020617]',
    cardBg: 'bg-slate-900/90 backdrop-blur-md',
    cardBorder: 'border-slate-700/60',
    headerAccent: 'text-sky-400',
    titleColor: 'text-white',
    subtextColor: 'text-slate-300',
    badgeBg: 'bg-sky-950 text-sky-200 border-sky-500/40',
    bannerGradient: 'from-[#0369a1] via-[#0f172a] to-[#020617]',
    primaryButton: 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold',
    mandalaColor: 'border-sky-400/30',
    isDark: true,
  },
  {
    id: 'sanskara-ivory',
    name: 'Sanskara Ivory (Pastel Floral)',
    badge: 'Soft Rose & Gold Foil',
    fontFamily: "'Great Vibes', cursive",
    colors: ['#3b1828', '#fff7f9', '#d4889c'],
    outerBg: 'from-[#fff1f5] via-[#fff8fa] to-[#fee8ef]',
    phoneBg: 'bg-gradient-to-b from-[#fff7f9] via-[#ffffff] to-[#fdeef3]',
    cardBg: 'bg-white',
    cardBorder: 'border-rose-200',
    headerAccent: 'text-rose-700',
    titleColor: 'text-[#421b2b]',
    subtextColor: 'text-slate-600',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-200',
    bannerGradient: 'from-[#e28ea4] via-[#cc6d88] to-[#993b58]',
    primaryButton: 'bg-rose-600 hover:bg-rose-700 text-white',
    mandalaColor: 'border-rose-300/40',
    isDark: false,
  },
  {
    id: 'haldi-marigold-urli',
    name: 'Haldi Marigold & Brass Urli',
    badge: 'Vibrant Traditional',
    fontFamily: "'Playfair Display', serif",
    colors: ['#4d3200', '#fffbeb', '#f59e0b'],
    outerBg: 'from-[#fff7cc] via-[#fffbeb] to-[#fef3c7]',
    phoneBg: 'bg-gradient-to-b from-[#fffbeb] via-[#fffdf0] to-[#fef9c3]',
    cardBg: 'bg-white/95',
    cardBorder: 'border-amber-300',
    headerAccent: 'text-amber-800',
    titleColor: 'text-[#4d3200]',
    subtextColor: 'text-amber-950/80',
    badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
    bannerGradient: 'from-[#f59e0b] via-[#d97706] to-[#b45309]',
    primaryButton: 'bg-amber-600 hover:bg-amber-700 text-white',
    mandalaColor: 'border-amber-400/50',
    isDark: false,
  },
  {
    id: 'sangeet-peacock-glam',
    name: 'Sangeet Peacock & Dholak Beats',
    badge: 'Bollywood Musical Night',
    fontFamily: "'Marcellus', serif",
    colors: ['#042f2e', '#f0fdfa', '#0d9488'],
    outerBg: 'from-[#042f2e] via-[#0f2c4c] to-[#081426]',
    phoneBg: 'bg-gradient-to-b from-[#0c233c] via-[#0f2d4e] to-[#071628]',
    cardBg: 'bg-slate-900/90',
    cardBorder: 'border-teal-400/40',
    headerAccent: 'text-teal-300',
    titleColor: 'text-white',
    subtextColor: 'text-teal-100/70',
    badgeBg: 'bg-teal-950 text-teal-200 border-teal-500/40',
    bannerGradient: 'from-[#0284c7] via-[#0d9488] to-[#0f766e]',
    primaryButton: 'bg-teal-600 hover:bg-teal-500 text-white',
    mandalaColor: 'border-teal-300/40',
    isDark: true,
  },
  {
    id: 'crimson-gold',
    name: 'Crimson & Gold (Shubh Vivah)',
    badge: 'Vedic Hindu Classic',
    fontFamily: "'Cinzel', serif",
    colors: ['#540914', '#fff5f5', '#e6a64c'],
    outerBg: 'from-[#540914] via-[#7d1424] to-[#3a060d]',
    phoneBg: 'bg-gradient-to-b from-[#fff6f6] via-[#fffbfc] to-[#fdefef]',
    cardBg: 'bg-gradient-to-br from-[#ffffff] via-[#fff8f8] to-[#fdebeb]',
    cardBorder: 'border-rose-300',
    headerAccent: 'text-[#9c1428]',
    titleColor: 'text-[#5e0c19]',
    subtextColor: 'text-slate-700',
    badgeBg: 'bg-rose-100 text-rose-950 border-rose-200',
    bannerGradient: 'from-[#9e162b] via-[#b8233b] to-[#690918]',
    primaryButton: 'bg-[#9e162b] hover:bg-[#7a0f20] text-white',
    mandalaColor: 'border-rose-400/50',
    isDark: false,
  },
  {
    id: 'minimal-zen',
    name: 'Minimal Zen (Editorial White)',
    badge: 'Clean Modern Luxury',
    fontFamily: "'Marcellus', serif",
    colors: ['#12233b', '#f4f8fc', '#2b78c9'],
    outerBg: 'from-[#eef5fc] via-[#f7fafe] to-[#e6f0fa]',
    phoneBg: 'bg-gradient-to-b from-[#f8fbfe] via-[#ffffff] to-[#eff5fb]',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200',
    headerAccent: 'text-sky-700',
    titleColor: 'text-slate-900',
    subtextColor: 'text-slate-600',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    bannerGradient: 'from-[#1e4878] via-[#2f67a5] to-[#143254]',
    primaryButton: 'bg-slate-900 hover:bg-slate-800 text-white',
    mandalaColor: 'border-slate-300',
    isDark: false,
  },
  {
    id: 'south-indian-traditional',
    name: 'South Indian Traditional',
    badge: 'Temple Gold & Kolam',
    fontFamily: "'Playfair Display', serif",
    colors: ['#591624', '#fdf7eb', '#c98a28'],
    outerBg: 'from-[#fefaf0] via-[#fffdf9] to-[#f8edd6]',
    phoneBg: 'bg-gradient-to-b from-[#fcf7ee] via-[#ffffff] to-[#faedd4]',
    cardBg: 'bg-[#fffdf8]',
    cardBorder: 'border-amber-300',
    headerAccent: 'text-[#942738]',
    titleColor: 'text-[#4a121d]',
    subtextColor: 'text-slate-700',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    bannerGradient: 'from-[#bf7c1d] via-[#a8650f] to-[#784303]',
    primaryButton: 'bg-[#82182a] hover:bg-[#660f1e] text-white',
    mandalaColor: 'border-amber-500/40',
    isDark: false,
  },
];

const DEFAULT_EVENTS: CeremonyEvent[] = [
  {
    id: 'ev-1',
    name: 'The Holy Muhurtham',
    categoryTag: 'PRIMARY WEDDING CEREMONY',
    date: 'Feb 14, 2027',
    time: '09:30 AM',
    venue: 'The Grand Palace, Ahmedabad',
    dressCode: 'Traditional Silk / Festive Pastels',
    visibleToAll: true,
    expanded: true,
  },
  {
    id: 'ev-2',
    name: 'Sangeet & Musical Night',
    categoryTag: 'EVENING CELEBRATION',
    date: 'Feb 13, 2027',
    time: '07:00 PM',
    venue: 'Royal Courtyard & Lawn, Ahmedabad',
    dressCode: 'Sparkling Indo-Western / Glamour',
    visibleToAll: true,
    expanded: false,
  },
  {
    id: 'ev-3',
    name: 'Grand Royal Reception',
    categoryTag: 'CELEBRATION DINNER',
    date: 'Feb 15, 2027',
    time: '08:00 PM',
    venue: 'Crystal Grand Ballroom, Ahmedabad',
    dressCode: 'Black Tie / Royal Traditional',
    visibleToAll: true,
    expanded: false,
  },
];

const DEFAULT_GUESTS: GuestItem[] = [
  {
    id: 'g-1',
    name: 'Uncle Ravi & Family (VIP Family)',
    category: 'VIP Family',
    passes: 4,
    phone: '',
    salutation: 'Dear Ravi Uncle & Family, you hold a cherished place in our hearts. We seek your warmest blessings at our wedding ceremony.',
    customWhatsAppText: '',
    assignedEventIds: ['ev-1', 'ev-2', 'ev-3'],
    slug: 'ravi-vip',
  },
  {
    id: 'g-2',
    name: 'Priya Sharma (Bride’s Sister)',
    category: 'Immediate Family',
    passes: 2,
    phone: '',
    salutation: 'Dearest Priya, our celebration wouldn’t be complete without your dance, laughter and love!',
    customWhatsAppText: '',
    assignedEventIds: ['ev-1', 'ev-2', 'ev-3'],
    slug: 'priya-sister',
  },
  {
    id: 'g-3',
    name: 'Rahul Mehta & Friends',
    category: 'Friends',
    passes: 2,
    phone: '',
    salutation: 'Hey Rahul! Gear up for the most happening Sangeet and after-party celebrations!',
    customWhatsAppText: '',
    assignedEventIds: ['ev-2', 'ev-3'],
    slug: 'rahul-m',
  },
  {
    id: 'g-4',
    name: 'The Singhania Family (Relatives)',
    category: 'Relatives',
    passes: 3,
    phone: '',
    salutation: 'Respected Singhania Family, with divine grace we solicit your presence and heartfelt blessings.',
    customWhatsAppText: '',
    assignedEventIds: ['ev-1', 'ev-3'],
    slug: 'singhania-relatives',
  },
];

function downloadCalendarEvent(event: CeremonyEvent, hosts: string) {
  const start = new Date([event.date, event.time].filter(Boolean).join(" "));
  if (!Number.isFinite(start.getTime())) {
    toast.error("Enter a valid ceremony date and time first.");
    return;
  }

  const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/[,;]/g, "\\$&");
  const calendar = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Uptemp//Invitation Studio//EN", "BEGIN:VEVENT",
    "UID:" + crypto.randomUUID() + "@uptemp", "DTSTAMP:" + formatDate(new Date()),
    "DTSTART:" + formatDate(start), "SUMMARY:" + escapeText(event.name + " - " + hosts),
    "LOCATION:" + escapeText(event.venue), "DESCRIPTION:" + escapeText("Dress code: " + event.dressCode),
    "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "ceremony.ics";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function StudioEditor() {
  return <Suspense fallback={<p className="p-6">Loading invitation studio...</p>}><StudioRoute /></Suspense>;
}

function StudioRoute() {
  const params = useSearchParams();
  return <StudioWorkspace key={params?.toString()} />;
}

function StudioWorkspace() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category');
  const isTrial = searchParams?.get('mode') === 'trial';
  const [editing, setEditing] = useState(!isTrial);
  const [mobilePanel, setMobilePanel] = useState<'edit' | 'preview'>('edit');

  const templateParam = searchParams?.get('template') || studioDesigns.find((design) => design.category === categoryParam)?.id || 'royal-sandalwood';
  const selectedDesign = studioDesigns.find((design) => design.id === templateParam);
  const category = categoryParam || selectedDesign?.category || 'wedding';
  const draftKey = 'uptemp-studio-v1:' + templateParam + ':' + category;

  const initialTheme = THEMES.find((theme) => theme.id === templateParam) || THEMES[0];

  const occasion = studioDesigns.find((design) => design.category === category)?.label || 'Wedding';
  const isWedding = occasion === 'Wedding';
  const occasionTitle = occasion === 'Any occasion' ? 'Celebration' : occasion;
  const sampleEvents = isWedding ? DEFAULT_EVENTS : [{ ...DEFAULT_EVENTS[0], name: occasionTitle, categoryTag: 'CELEBRATION', dressCode: occasion === 'Haldi' ? 'Marigold Yellow' : 'Festive Attire' }];

  // Primary State
  const [currentTheme, setCurrentTheme] = useState<ThemeStyle>(initialTheme);


  const [inviteTitle, setInviteTitle] = useState('Akshat & Priya ' + occasionTitle + ' Invite');
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [step, setStep] = useState(0);
  const [previewKey, setPreviewKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'events' | 'story' | 'themes' | 'guests' | 'gallery' | 'settings'>('story');
  const [previewMode, setPreviewMode] = useState<'live' | 'rsvp'>('live');

  // Full Screen Preview Modal

  // Audio State & Web Audio Synthesizer (Wishlys Wedding Suite)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [audioTrack, setAudioTrack] = useState('Shenhai Instrumental (Mangal Vadya)');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorNodesRef = useRef<any[]>([]);

  // Couple Story Details
  const [godBlessing, setGodBlessing] = useState('॥ श्री गणेशाय नमः ॥');
  const [groomName, setGroomName] = useState('Akshat');
  const [brideName, setBrideName] = useState('Priya');
  const [groomParents, setGroomParents] = useState('Mrs. Sunita & Mr. Rajesh Sharma');
  const [brideParents, setBrideParents] = useState('Mrs. Rekha & Dr. Anand Verma');
  const [hostBlessing, setHostBlessing] = useState(
    'With divine grace and heavenly blessings of our elders, we solicit your presence and blessings.'
  );

  useEffect(() => () => {
    void audioCtxRef.current?.close();
  }, []);

  // Photo Gallery State
  const [coverPhoto, setCoverPhoto] = useState(selectedDesign ? 'https://images.unsplash.com/photo-' + selectedDesign.photo + '?auto=format&fit=crop&w=900&q=80' : '');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Events & Guest state
  const [events, setEvents] = useState<CeremonyEvent[]>(sampleEvents);
  const [guests, setGuests] = useState<GuestItem[]>(DEFAULT_GUESTS);
  const [selectedGuestId, setSelectedGuestId] = useState<string>(DEFAULT_GUESTS[0].id);
  const [familyDetailsOpen, setFamilyDetailsOpen] = useState(true);

  // Share Modal & Add Guest Modal
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestData, setNewGuestData] = useState({ name: '', passes: 2, phone: '', category: 'VIP Family' });

  // Settings State
  const [musicAutoplay, setMusicAutoplay] = useState(false);
  const [rsvpCutoffDate, setRsvpCutoffDate] = useState('2027-02-05');
  const [showWaxSealReveal, setShowWaxSealReveal] = useState(isTrial);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(!isTrial);

  // RSVP Form Interactive State
  const [rsvpAttending, setRsvpAttending] = useState<boolean | null>(true);
  const [rsvpGuestsCount, setRsvpGuestsCount] = useState(2);
  const [rsvpDiet, setRsvpDiet] = useState('Vegetarian');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Real Ticking Countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const rsvpRef = useRef<HTMLDivElement>(null);
  const firstEvent = events[0];
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Live Stream & Blessing Wall
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [blessingWishes, setBlessingWishes] = useState<string[]>([
    'Heartiest congratulations Akshat & Priya! Wishing you a lifetime of joy and togetherness. - The Singhania Family',
    'So thrilled to celebrate your special day! Dancing all night at the Sangeet! - Rahul & Friends',
    'May Mahadev & Parvati shower abundant blessings on you both! - Uncle & Aunty',
  ]);
  const [newBlessingWish, setNewBlessingWish] = useState('');

  useEffect(() => {
    const eventTime = new Date([firstEvent?.date, firstEvent?.time].filter(Boolean).join(" ")).getTime();
    const tick = () => {
      const seconds = Number.isFinite(eventTime) ? Math.max(0, Math.ceil((eventTime - Date.now()) / 1000)) : 0;
      setTimeLeft({ days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, mins: Math.floor(seconds / 60) % 60, secs: seconds % 60 });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [firstEvent?.date, firstEvent?.time]);

  useEffect(() => {
    if (previewMode === "rsvp") rsvpRef.current?.scrollIntoView({ block: "nearest" });
  }, [previewMode, viewMode, isEnvelopeOpen, mobilePanel]);
  // Currently Selected Guest (Mutable on right panel!)

  const draft = { themeId: currentTheme.id, inviteTitle, groomName, brideName, godBlessing, groomParents, brideParents, hostBlessing, coverPhoto, galleryImages, events, guests, selectedGuestId, audioTrack, audioVolume, musicAutoplay, rsvpCutoffDate, showWaxSealReveal, liveStreamUrl, showLiveStream };

  function loadDraft() {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<typeof draft>;
      const theme = THEMES.find((item) => item.id === saved.themeId);
      if (theme) setCurrentTheme(theme);
      if (saved.inviteTitle !== undefined) setInviteTitle(saved.inviteTitle);
      if (saved.groomName !== undefined) setGroomName(saved.groomName);
      if (saved.brideName !== undefined) setBrideName(saved.brideName);
      if (saved.godBlessing !== undefined) setGodBlessing(saved.godBlessing);
      if (saved.groomParents !== undefined) setGroomParents(saved.groomParents);
      if (saved.brideParents !== undefined) setBrideParents(saved.brideParents);
      if (saved.hostBlessing !== undefined) setHostBlessing(saved.hostBlessing);
      if (saved.coverPhoto !== undefined) setCoverPhoto(saved.coverPhoto);
      if (saved.galleryImages !== undefined) setGalleryImages(saved.galleryImages);
      if (saved.events !== undefined) setEvents(saved.events);
      if (saved.guests !== undefined) setGuests(saved.guests);
      if (saved.selectedGuestId !== undefined) setSelectedGuestId(saved.selectedGuestId);
      if (saved.audioTrack !== undefined) setAudioTrack(saved.audioTrack);
      if (saved.audioVolume !== undefined) setAudioVolume(saved.audioVolume);
      if (saved.musicAutoplay !== undefined) setMusicAutoplay(saved.musicAutoplay);
      if (saved.rsvpCutoffDate !== undefined) setRsvpCutoffDate(saved.rsvpCutoffDate);
      if (saved.showWaxSealReveal !== undefined) setShowWaxSealReveal(saved.showWaxSealReveal);
      if (saved.liveStreamUrl !== undefined) setLiveStreamUrl(saved.liveStreamUrl);
      if (saved.showLiveStream !== undefined) setShowLiveStream(saved.showLiveStream);
      if (saved.showWaxSealReveal !== undefined) setIsEnvelopeOpen(!saved.showWaxSealReveal);
    } catch {
      toast.error('This browser could not open the saved draft.');
    }
  }

  useEffect(() => {
    if (!isTrial) loadDraft();
    // Load once for the selected design. Live edits are captured when saving.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, isTrial]);

  function saveDraft() {
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      toast.success('Draft saved in this browser');
    } catch {
      toast.error('This draft could not be saved. Try removing large photos.');
    }
  }

  const currentGuest = useMemo(() => {
    return guests.find((g) => g.id === selectedGuestId) || guests[0];
  }, [guests, selectedGuestId]);

  // Update current guest fields immediately
  const updateCurrentGuest = (field: keyof GuestItem, value: any) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === selectedGuestId ? { ...g, [field]: value } : g))
    );
  };

  // Toggle assigned event for current guest - REACTIVE FIX!
  const toggleGuestEvent = (eventId: string) => {
    const assigned = currentGuest.assignedEventIds || [];
    const updated = assigned.includes(eventId)
      ? assigned.filter((id) => id !== eventId)
      : [...assigned, eventId];
    updateCurrentGuest('assignedEventIds', updated);
  };

  // Visible events for this simulated guest (controlled by assignedEventIds)
  const guestVisibleEvents = useMemo(() => {
    if (!currentGuest.assignedEventIds || currentGuest.assignedEventIds.length === 0) {
      return [];
    }
    return events.filter((ev) => currentGuest.assignedEventIds.includes(ev.id));
  }, [events, currentGuest]);

  // Dynamic, REAL working URL on current host
  const computedWhatsAppText = useMemo(() => {
    if (currentGuest.customWhatsAppText && currentGuest.customWhatsAppText.trim()) {
      return currentGuest.customWhatsAppText;
    }
    const guestFirstName = currentGuest.name.split(' ')[0];
    return ['Namaste ' + guestFirstName + '! ' + groomName + ' & ' + brideName + ' invite you to celebrate.', ...guestVisibleEvents.map((event) => [event.name, event.date, event.time, event.venue].filter(Boolean).join(' / '))].join('\n');
  }, [currentGuest, groomName, brideName, guestVisibleEvents]);

  // Web Audio Festive Raga Synthesizer
  const toggleMusic = () => {
    if (isPlayingMusic) {
      stopSynthesizer();
      setIsPlayingMusic(false);
      toast('Music paused', { icon: '⏸️' });
    } else {
      startSynthesizer();
      setIsPlayingMusic(true);
      toast.success(`♫ Playing: ${audioTrack}`);
    }
  };

  const startSynthesizer = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(audioVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Distinct raga harmonies based on selected track
      let freqs = [220, 277.18, 329.63, 440]; // Shehnai Bhairavi / Mangal Vadya
      if (audioTrack.includes('Flute') || audioTrack.includes('Kudmayi')) {
        freqs = [261.63, 329.63, 392.0, 523.25]; // Soft Yaman / Romantic
      } else if (audioTrack.includes('Kesariya') || audioTrack.includes('Violin')) {
        freqs = [293.66, 369.99, 440.0, 587.33]; // Romance D Major
      } else if (audioTrack.includes('Dholak') || audioTrack.includes('Sangeet')) {
        freqs = [146.83, 220.0, 293.66, 440.0]; // Energetic Dholak
      }

      const oscs = freqs.map((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(4.5 + i * 0.4, ctx.currentTime);
        lfoGain.gain.setValueAtTime(2.5, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        g.gain.setValueAtTime(0.06, ctx.currentTime);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        return osc;
      });

      oscillatorNodesRef.current = oscs;
    } catch {
      // Audio fallback
    }
  };

  const stopSynthesizer = () => {
    try {
      oscillatorNodesRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch { }
      });
      oscillatorNodesRef.current = [];
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch { }
  };

  const updateEvent = (id: string, field: keyof CeremonyEvent, value: any) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const toggleEventExpand = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e))
    );
  };

  const addEvent = () => {
    const newId = `ev-${Date.now()}`;
    const newEv: CeremonyEvent = {
      id: newId,
      name: 'Haldi & Phoolon Ki Holi',
      categoryTag: 'PRE-WEDDING RITUAL',
      date: firstEvent?.date || '',
      time: '11:00 AM',
      venue: 'Palace Courtyard & Poolside',
      dressCode: 'Haldi Yellow / Mustard Silk',
      visibleToAll: true,
      expanded: true,
    };
    setEvents((prev) => [...prev, newEv]);
    // Also auto-assign to current guest
    updateCurrentGuest('assignedEventIds', [...(currentGuest.assignedEventIds || []), newId]);
    toast.success('Ceremony added! Assigned to guest schedule.');
  };

  const removeEvent = (id: string) => {
    if (events.length <= 1) {
      toast.error('Invitation should have at least one event.');
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast.success('Ceremony removed');
  };

  const copyWhatsApp = () => {
    try {
      navigator.clipboard.writeText(computedWhatsAppText);
      toast.success('WhatsApp text copied to clipboard! 📋');
    } catch {
      const el = document.createElement('textarea');
      el.value = computedWhatsAppText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      toast.success('WhatsApp text copied to clipboard! 📋');
    }
  };

  const sendWhatsApp = () => {
    const cleanPhone = currentGuest.phone ? currentGuest.phone.replace(/[^0-9]/g, '') : '';
    const encoded = encodeURIComponent(computedWhatsAppText);
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
    toast.success(`Opening WhatsApp for ${currentGuest.name}...`);
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestData.name.trim()) return;
    const slug = newGuestData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newG: GuestItem = {
      id: `g-${Date.now()}`,
      name: newGuestData.name,
      category: newGuestData.category,
      passes: newGuestData.passes,
      phone: newGuestData.phone,
      salutation: `Dear ${newGuestData.name}, we would be honoured by your presence and blessings at our wedding celebrations.`,
      assignedEventIds: events.map((ev) => ev.id),
      slug,
    };
    setGuests((prev) => [newG, ...prev]);
    setSelectedGuestId(newG.id);
    setShowAddGuestModal(false);
    setNewGuestData({ name: '', passes: 2, phone: '', category: 'VIP Family' });
    toast.success(`Guest "${newG.name}" added with all ceremonies assigned!`);
  };

  const deleteCurrentGuest = () => {
    if (guests.length <= 1) {
      toast.error('You need at least one guest in the simulator.');
      return;
    }
    const filtered = guests.filter((g) => g.id !== selectedGuestId);
    setGuests(filtered);
    setSelectedGuestId(filtered[0].id);
    toast.success('Guest removed from simulator.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    e.target.value = "";
    if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type) || file.size > 1_000_000) {
      toast.error("Choose a JPEG, PNG, WebP, GIF, or AVIF under 1 MB.");
      return;
    }
    if (galleryImages.length >= 3) {
      toast.error("Remove a photo before adding another. This draft supports three uploads.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        const url = ev.target.result as string;
        setCoverPhoto(url);
        setGalleryImages((prev) => [url, ...prev]);
        toast.success('Photo uploaded and set as invitation cover! 📸');
      }
    };
    reader.onerror = () => toast.error("This photo could not be opened.");
    reader.readAsDataURL(file);
  };

  const replayPreview = () => {
    setPreviewMode('live');
    setRsvpSubmitted(false);
    if (showWaxSealReveal) setIsEnvelopeOpen(false);
    setPreviewKey((k) => k + 1);
  };

  const wizardSteps = ['Design', 'Names', 'Events', 'Finish'];
  const goToStep = (next: number) => {
    setStep(Math.max(0, Math.min(wizardSteps.length - 1, next)));
    setMobilePanel('edit');
    document.querySelector('.upt-wizard-scroll')?.scrollTo({ top: 0 });
  };
  const openFullStudio = () => {
    setEditing(true);
    setActiveTab('guests');
    setIsEnvelopeOpen(true);
    toast.success('Your details are kept. Add guests and share on WhatsApp.');
  };
  const designFor = (themeId: string) => studioDesigns.find((d) => d.id === themeId);
  const eventRange = events.length > 1 ? events[0].date + ' – ' + events[events.length - 1].date : events[0]?.date || '';

  const wizardPanel = (
    <aside className="upt-wizard" aria-label="Create your invitation">
      <div className="upt-wizard-scroll">
        <p className="upt-wz-step">Step {step + 1} of {wizardSteps.length}</p>

        {step === 0 && (
          <>
            <h2>Choose your design</h2>
            <p className="upt-wz-lead">Pick a look — watch the preview change as you go.</p>
            <div className="upt-wz-designs">
              {THEMES.map((theme) => {
                const d = designFor(theme.id);
                return (
                  <button
                    key={theme.id}
                    type="button"
                    aria-pressed={currentTheme.id === theme.id}
                    onClick={() => { setCurrentTheme(theme); if (d) setCoverPhoto('https://images.unsplash.com/photo-' + d.photo + '?auto=format&fit=crop&w=900&q=80'); }}
                    className="upt-wz-design"
                  >
                    <span className="upt-wz-thumb" style={{ backgroundColor: d?.color || theme.colors[0], backgroundImage: d ? 'url(https://images.unsplash.com/photo-' + d.photo + '?auto=format&fit=crop&w=300&q=60)' : undefined }}>
                      {d?.isNew && <em>New</em>}
                      <span className="upt-wz-swatches">{theme.colors.map((c) => <i key={c} style={{ background: c }} />)}</span>
                    </span>
                    <strong>{d?.name || theme.name.split(' (')[0]}</strong>
                    <small>{d?.description || theme.badge}</small>
                  </button>
                );
              })}
            </div>

            <h3>Opening</h3>
            <p className="upt-wz-hint">What guests tap to open the invitation.</p>
            <div className="upt-wz-options">
              <button type="button" aria-pressed={showWaxSealReveal} onClick={() => { setShowWaxSealReveal(true); setIsEnvelopeOpen(false); setPreviewKey((k) => k + 1); }}>
                <span className="upt-wz-icon">✉</span><strong>Wax seal envelope</strong><small>Guest name on the envelope, tap the seal</small>
              </button>
              <button type="button" aria-pressed={!showWaxSealReveal} onClick={() => { setShowWaxSealReveal(false); setIsEnvelopeOpen(true); }}>
                <span className="upt-wz-icon">❖</span><strong>Open directly</strong><small>The invitation shows straight away</small>
              </button>
            </div>

            <h3>Header blessing</h3>
            <div className="upt-wz-chips">
              {['॥ श्री गणेशाय नमः ॥', '॥ ॐ श्री महावीराय नमः ॥', 'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ', 'Bismillah-ir-Rahman-ir-Rahim', 'Together With Our Families'].map((inv) => (
                <button key={inv} type="button" aria-pressed={godBlessing === inv} onClick={() => setGodBlessing(inv)}>{inv}</button>
              ))}
            </div>
            <label className="upt-wz-field">
              <span>Or write your own</span>
              <input value={godBlessing} onChange={(e) => setGodBlessing(e.target.value)} />
            </label>

            <h3>Music</h3>
            <div className="upt-wz-music">
              <select aria-label="Music track" value={audioTrack} onChange={(e) => { setAudioTrack(e.target.value); if (isPlayingMusic) { stopSynthesizer(); setIsPlayingMusic(false); } }}>
                {WISHLYS_WEDDING_SONGS.map((s) => <option key={s.id} value={s.title}>{s.emoji} {s.title}</option>)}
              </select>
              <button type="button" onClick={toggleMusic}>{isPlayingMusic ? '⏸ Pause' : '▶ Play'}</button>
            </div>
            <label className="upt-wz-toggle">
              <input type="checkbox" checked={musicAutoplay} onChange={(e) => setMusicAutoplay(e.target.checked)} />
              <span>Play music when the guest opens the invitation</span>
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <h2>{isWedding ? 'The couple' : 'Who is celebrating?'}</h2>
            <p className="upt-wz-lead">These names appear on the cover and in every guest’s message.</p>
            <div className="upt-wz-row">
              <label className="upt-wz-field"><span>{isWedding ? 'Groom name' : 'First name'}</span><input value={groomName} onChange={(e) => setGroomName(e.target.value)} /></label>
              <label className="upt-wz-field"><span>{isWedding ? 'Bride name' : 'Second name'}</span><input value={brideName} onChange={(e) => setBrideName(e.target.value)} /></label>
            </div>
            <label className="upt-wz-field"><span>Invitation title (for you)</span><input maxLength={100} value={inviteTitle} onChange={(e) => setInviteTitle(e.target.value)} /></label>

            <h3>Families</h3>
            <label className="upt-wz-field"><span>{isWedding ? 'Groom’s parents' : 'Hosted by'}</span><input value={groomParents} onChange={(e) => setGroomParents(e.target.value)} /></label>
            <label className="upt-wz-field"><span>{isWedding ? 'Bride’s parents' : 'And family'}</span><input value={brideParents} onChange={(e) => setBrideParents(e.target.value)} /></label>
            <label className="upt-wz-field"><span>Blessing message</span><textarea rows={3} value={hostBlessing} onChange={(e) => setHostBlessing(e.target.value)} /></label>

            <h3>Cover photo</h3>
            <p className="upt-wz-hint">Upload your own (under 1 MB) or pick one below.</p>
            <label className="upt-wz-upload">
              <span>📷 Upload a photo</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
            <div className="upt-wz-photos">
              {[...galleryImages, ...PRESET_MOMENTS.map((m) => m.url)].slice(0, 9).map((url, i) => (
                <button key={url + i} type="button" aria-pressed={coverPhoto === url} onClick={() => setCoverPhoto(url)} style={{ backgroundImage: 'url(' + url + ')' }} aria-label={'Use photo ' + (i + 1) + ' as cover'} />
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Events</h2>
            <p className="upt-wz-lead">{events.length} {events.length === 1 ? 'event' : 'events'}{eventRange ? ' · ' + eventRange : ''}</p>
            <div className="upt-wz-events">
              {events.map((ev, idx) => (
                <div key={ev.id} className="upt-wz-event">
                  <button type="button" className="upt-wz-event-head" onClick={() => toggleEventExpand(ev.id)} aria-expanded={!!ev.expanded}>
                    <span className="upt-wz-num">{idx + 1}</span>
                    <span><strong>{ev.name || 'Untitled event'}</strong><small>{ev.date} · {ev.time}</small></span>
                    <span aria-hidden="true">{ev.expanded ? '▴' : '▾'}</span>
                  </button>
                  {ev.expanded && (
                    <div className="upt-wz-event-body">
                      <label className="upt-wz-field"><span>Event name</span><input value={ev.name} onChange={(e) => updateEvent(ev.id, 'name', e.target.value)} /></label>
                      <div className="upt-wz-row">
                        <label className="upt-wz-field"><span>Date</span><input value={ev.date} onChange={(e) => updateEvent(ev.id, 'date', e.target.value)} /></label>
                        <label className="upt-wz-field"><span>Time</span><input value={ev.time} onChange={(e) => updateEvent(ev.id, 'time', e.target.value)} /></label>
                      </div>
                      <label className="upt-wz-field"><span>Venue</span><input value={ev.venue} onChange={(e) => updateEvent(ev.id, 'venue', e.target.value)} /></label>
                      <label className="upt-wz-field"><span>Dress code</span><input value={ev.dressCode} onChange={(e) => updateEvent(ev.id, 'dressCode', e.target.value)} /></label>
                      <button type="button" className="upt-wz-remove" onClick={() => removeEvent(ev.id)}>Remove event</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="upt-wz-add" onClick={addEvent}>+ Add another event</button>

            <h3>RSVP</h3>
            <label className="upt-wz-field"><span>Reply by</span><input type="date" value={rsvpCutoffDate} onChange={(e) => setRsvpCutoffDate(e.target.value)} /></label>
            <label className="upt-wz-toggle">
              <input type="checkbox" checked={showLiveStream} onChange={(e) => setShowLiveStream(e.target.checked)} />
              <span>Add a live stream link for guests who can’t attend</span>
            </label>
            {showLiveStream && (
              <label className="upt-wz-field"><span>Live stream URL</span><input type="url" placeholder="https://youtube.com/live/…" value={liveStreamUrl} onChange={(e) => setLiveStreamUrl(e.target.value)} /></label>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2>Finish & share</h2>
            <p className="upt-wz-lead">Check your invitation, see it as a guest, then add your guest list.</p>
            <ul className="upt-wz-summary">
              <li><span>Design</span><strong>{designFor(currentTheme.id)?.name || currentTheme.name}</strong><button type="button" onClick={() => goToStep(0)}>Edit</button></li>
              <li><span>Names</span><strong>{groomName} & {brideName}</strong><button type="button" onClick={() => goToStep(1)}>Edit</button></li>
              <li><span>Events</span><strong>{events.length} · {eventRange}</strong><button type="button" onClick={() => goToStep(2)}>Edit</button></li>
              <li><span>Opening</span><strong>{showWaxSealReveal ? 'Wax seal envelope' : 'Open directly'}</strong><button type="button" onClick={() => goToStep(0)}>Edit</button></li>
            </ul>

            <h3>Preview as a guest</h3>
            <p className="upt-wz-hint">Each guest gets their own link with their name and only their events.</p>
            <select className="upt-wz-select" aria-label="Preview as guest" value={selectedGuestId} onChange={(e) => { setSelectedGuestId(e.target.value); replayPreview(); }}>
              {guests.map((g) => <option key={g.id} value={g.id}>{g.name} — {g.assignedEventIds.length} events</option>)}
            </select>
            <div className="upt-wz-message">
              <p>{computedWhatsAppText}</p>
              <button type="button" onClick={copyWhatsApp}>Copy WhatsApp message</button>
            </div>

            <div className="upt-wz-plan">
              <div><span className="upt-wz-pill">Free</span><strong>Build & preview</strong></div>
              <p>Everything you’ve made so far is free. Premium designs and bulk WhatsApp sending are available later.</p>
            </div>
            <div className="upt-wz-final">
              <button type="button" className="upt-wz-primary" onClick={openFullStudio}>Add guests & share →</button>
              <button type="button" className="upt-wz-secondary" onClick={saveDraft}>Save draft</button>
            </div>
          </>
        )}
      </div>

      <div className="upt-wizard-bar">
        <button type="button" className="upt-wz-secondary" onClick={() => goToStep(step - 1)} disabled={step === 0}>Back</button>
        <button type="button" className="upt-wz-secondary upt-wz-preview-btn" onClick={() => setMobilePanel(mobilePanel === 'edit' ? 'preview' : 'edit')}>
          {mobilePanel === 'edit' ? 'Preview' : 'Edit'}
        </button>
        {step < wizardSteps.length - 1 ? (
          <button type="button" className="upt-wz-primary" onClick={() => goToStep(step + 1)}>Next: {wizardSteps[step + 1]}</button>
        ) : (
          <button type="button" className="upt-wz-primary" onClick={openFullStudio}>Add guests</button>
        )}
      </div>
    </aside>
  );

  return (
    <div className={'upt-studio flex flex-col text-slate-800' + (editing ? '' : ' upt-studio-wizard')}>
      {!editing ? (
        <header className="upt-studio-header upt-wz-header">
          <div className="upt-studio-heading">
            <Link href="/" className="upt-wz-logo"><span aria-hidden="true">✦</span> uptemp.</Link>
            <span className="upt-wz-free">Free to build</span>
          </div>
          <ol className="upt-wz-stepper">
            {wizardSteps.map((label, i) => (
              <li key={label}>
                <button type="button" onClick={() => goToStep(i)} aria-current={i === step ? 'step' : undefined} data-done={i < step || undefined}>
                  <span>{i < step ? '✓' : i + 1}</span>{label}
                </button>
              </li>
            ))}
          </ol>
          <Link href="/templates" className="upt-wz-exit">All templates</Link>
        </header>
      ) : (
        <header className="upt-studio-header">
          <div className="upt-studio-heading">
            <Link href="/" className="upt-studio-brand" aria-label="uptemp home"><span aria-hidden="true">✦</span></Link>
            <Link href="/templates" className="upt-studio-back">← All templates</Link>
            <div>
              <p className="upt-studio-kicker">{editing ? 'Invitation studio' : 'Interactive template trial'}</p>
              {editing ? <input aria-label="Invitation title" maxLength={100} value={inviteTitle} onChange={(e) => setInviteTitle(e.target.value)} /> : <h1>{currentTheme.name.split(' (')[0]}</h1>}
            </div>
          </div>
          <div className="upt-studio-actions">
            {editing ? (
              <>
                <button type="button" onClick={() => setMobilePanel(mobilePanel === 'edit' ? 'preview' : 'edit')} className="upt-mobile-switch">
                  {mobilePanel === 'edit' ? 'Show preview' : 'Show editor'}
                </button>
                <button type="button" onClick={saveDraft} className="upt-studio-primary">Save draft</button>
              </>
            ) : (
              <button type="button" className="upt-studio-primary" onClick={() => { loadDraft(); setEditing(true); }}>
                Use this design
              </button>
            )}
          </div>
        </header>
      )}
      <div className={'upt-studio-body ' + (editing ? 'upt-editing' : 'upt-trial') + ' upt-mobile-' + mobilePanel}>
        {!editing && wizardPanel}
        {/* LEFT NAV ICONS COLUMN */}
        <nav className="upt-studio-tools flex w-16 shrink-0 flex-col items-center justify-between border-r border-slate-200/90 bg-white py-4 z-20">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setActiveTab('events')} aria-pressed={activeTab === "events"}
              title="Ceremonies & Events"
              className={`relative flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${activeTab === 'events'
                ? 'bg-sky-100 text-sky-900 font-bold shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <span className="text-lg">📅</span>
              <span className="text-[9px] font-bold">Events</span>
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('story')} aria-pressed={activeTab === "story"}
              title="Couple Story & Blessings"
              className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${activeTab === 'story'
                ? 'bg-sky-100 text-sky-900 font-bold shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <span className="text-lg">📖</span>
              <span className="text-[9px] font-bold">Story</span>
            </button>

            <button
              onClick={() => setActiveTab('themes')} aria-pressed={activeTab === "themes"}
              title="Themes, Cards & Music"
              className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${activeTab === 'themes'
                ? 'bg-sky-100 text-sky-900 font-bold shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <span className="text-lg">🎨</span>
              <span className="text-[9px] font-bold">Themes</span>
            </button>

            <button
              onClick={() => setActiveTab('guests')} aria-pressed={activeTab === "guests"}
              title="Guest Personalization"
              className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${activeTab === 'guests'
                ? 'bg-sky-100 text-sky-900 font-bold shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <span className="text-lg">👥</span>
              <span className="text-[9px] font-bold">Guests</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')} aria-pressed={activeTab === "gallery"}
              title="Photo Gallery & Moments"
              className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${activeTab === 'gallery'
                ? 'bg-sky-100 text-sky-900 font-bold shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <span className="text-lg">🖼️</span>
              <span className="text-[9px] font-bold">Gallery</span>
            </button>
          </div>

          {/* Settings Tab Button at Bottom */}
          <button
            onClick={() => setActiveTab('settings')} aria-pressed={activeTab === "settings"}
            className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${activeTab === 'settings'
              ? 'bg-sky-100 text-sky-900 font-bold shadow-xs'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
              }`}
            title="Invitation Settings & Rules"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[9px] font-bold">Settings</span>
          </button>
        </nav>

        {/* LEFT EDITING WORKSPACE PANEL */}
        <aside className="upt-studio-fields shrink-0 border-r border-slate-200/90 bg-white overflow-y-auto p-5 z-10 custom-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {activeTab === 'events' && 'Ceremonies & Events'}
                {activeTab === 'story' && 'Couple Story & Blessing'}
                {activeTab === 'themes' && 'Aesthetic Themes & Music'}
                {activeTab === 'guests' && 'Guest List & Passes'}
                {activeTab === 'gallery' && 'Couple Photos & Media'}
                {activeTab === 'settings' && 'Invitation Settings & Rules'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'events' && 'Schedule, venues & directions for guests'}
                {activeTab === 'story' && 'Invocation, elder blessings & parents'}
                {activeTab === 'themes' && 'Wishlys card templates & audio tracks'}
                {activeTab === 'guests' && 'Personalized passes & greetings'}
                {activeTab === 'gallery' && 'Set pre-wedding moments and cover photo'}
                {activeTab === 'settings' && 'Configure custom slug, music autoplay & PIN passcode'}
              </p>
            </div>
            {activeTab === 'events' && (
              <button
                type="button"
                onClick={addEvent}
                className="flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition border border-sky-200"
              >
                <span>+</span> Add Event
              </button>
            )}
          </div>

          <hr className="my-3 border-slate-100" />

          {/* TAB CONTENT: EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {events.map((ev, idx) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition"
                  >
                    <div
                      onClick={() => toggleEventExpand(ev.id)}
                      className="flex cursor-pointer items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-800 text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{ev.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {ev.date} • {ev.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEvent(ev.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 text-xs px-1"
                        >
                          ✕
                        </button>
                        <span className="text-slate-400 text-xs">{ev.expanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {ev.expanded && (
                      <div className="p-3.5 space-y-2.5 text-xs border-t border-slate-100">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Ceremony Name</label>
                          <input
                            type="text"
                            value={ev.name}
                            onChange={(e) => updateEvent(ev.id, 'name', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-900 outline-none focus:bg-white focus:border-sky-400"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Date</label>
                            <input
                              type="text"
                              value={ev.date}
                              onChange={(e) => updateEvent(ev.id, 'date', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-900 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Time</label>
                            <input
                              type="text"
                              value={ev.time}
                              onChange={(e) => updateEvent(ev.id, 'time', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-900 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Venue / Location</label>
                          <input
                            type="text"
                            value={ev.venue}
                            onChange={(e) => updateEvent(ev.id, 'venue', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Dress Code</label>
                          <input
                            type="text"
                            value={ev.dressCode}
                            onChange={(e) => updateEvent(ev.id, 'dressCode', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Family & Host Details Accordion */}
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs">
                <div
                  onClick={() => setFamilyDetailsOpen(!familyDetailsOpen)}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <h3 className="text-sm font-bold text-slate-900">Family & Host Details</h3>
                  <span className="text-slate-400 text-xs">{familyDetailsOpen ? '▲' : '▼'}</span>
                </div>

                {familyDetailsOpen && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Groom Parents</label>
                      <input
                        type="text"
                        value={groomParents}
                        onChange={(e) => setGroomParents(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Bride Parents</label>
                      <input
                        type="text"
                        value={brideParents}
                        onChange={(e) => setBrideParents(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Host Blessing Message</label>
                      <textarea
                        rows={2}
                        value={hostBlessing}
                        onChange={(e) => setHostBlessing(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Virtual Attendance / Live Stream Setting */}
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>🔴</span> Virtual Attendance (Live Stream)
                    </h3>
                    <p className="text-[11px] text-slate-500">Allow distant guests to join virtually</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLiveStream(!showLiveStream)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${showLiveStream ? 'bg-sky-600' : 'bg-slate-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${showLiveStream ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                    />
                  </button>
                </div>
                {showLiveStream && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      YouTube / Zoom Live Broadcast URL
                    </label>
                    <input
                      type="url"
                      value={liveStreamUrl}
                      onChange={(e) => setLiveStreamUrl(e.target.value)}
                      placeholder="https://youtube.com/live/your-event-id"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: STORY */}
          {activeTab === 'story' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Sacred Invocation / Divine Header
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {[
                    '॥ श्री गणेशाय नमः ॥',
                    '॥ ॐ श्री महावीराय नमः ॥',
                    'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ',
                    'Bismillah-ir-Rahman-ir-Rahim',
                    'Together With Our Families',
                  ].map((inv) => (
                    <button
                      key={inv}
                      onClick={() => setGodBlessing(inv)}
                      className={`truncate rounded-lg px-2 py-1.5 border text-left font-serif text-[11px] ${godBlessing === inv
                        ? 'border-sky-500 bg-sky-50 font-bold text-sky-900'
                        : 'border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {inv}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={godBlessing}
                  onChange={(e) => setGodBlessing(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-serif text-center font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Groom Name</label>
                  <input
                    type="text"
                    aria-label="Groom name"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Bride Name</label>
                  <input
                    type="text"
                    aria-label="Bride name"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: THEMES & WISHLYS SONGS */}
          {activeTab === 'themes' && (
            <div className="space-y-4 text-xs">
              {/* Wishlys Wedding Music Selector */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <span>🎵</span> Festive Wedding Music Suite
                    </h3>
                    <p className="text-[10px] text-amber-800/80">Signature ragas and romantic melodies</p>
                  </div>
                  <button
                    onClick={toggleMusic}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition ${isPlayingMusic ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-amber-300 text-amber-900'
                      }`}
                  >
                    {isPlayingMusic ? '⏸ Pause' : '▶ Play Song'}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {WISHLYS_WEDDING_SONGS.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => {
                        setAudioTrack(song.title);
                        if (isPlayingMusic) {
                          stopSynthesizer();
                          startSynthesizer();
                        }
                        toast.success(`Selected track: ${song.title}`);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${audioTrack === song.title
                        ? 'border-amber-500 bg-white shadow-xs ring-1 ring-amber-300'
                        : 'border-amber-100 bg-white/70 hover:bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{song.emoji}</span>
                        <div>
                          <p className="font-bold text-[11px] text-slate-900">{song.title}</p>
                          <p className="text-[9px] text-slate-500 truncate">{song.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        {song.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme Cards */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2">
                  Wishlys Wedding Theme Collection
                </label>
                <div className="space-y-2">
                  {THEMES.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => {
                        setCurrentTheme(theme);
                        toast.success(`Theme updated to ${theme.name}`);
                      }}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${currentTheme.id === theme.id
                        ? 'border-sky-500 bg-sky-50/80 shadow-xs ring-2 ring-sky-200'
                        : 'border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1.5">
                          {theme.colors.map((c, i) => (
                            <span
                              key={i}
                              className="h-6 w-6 rounded-full border border-white shadow-xs"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">{theme.name}</span>
                          <span className="text-[10px] text-slate-500">{theme.badge}</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                        {theme.isDark ? '🌙 Dark' : '☀️ Light'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: GUESTS */}
          {activeTab === 'guests' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Guests in Simulator ({guests.length})</span>
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(true)}
                  className="rounded-full bg-sky-600 px-3 py-1 font-bold text-white hover:bg-sky-700"
                >
                  + Add Guest
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {guests.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGuestId(g.id)}
                    className={`cursor-pointer rounded-xl border p-3 transition ${selectedGuestId === g.id
                      ? 'border-sky-500 bg-sky-50/90 shadow-xs ring-1 ring-sky-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{g.name}</p>
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                        {g.passes} Passes
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{g.salutation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: GALLERY (WORKABLE REAL PHOTO MOMENTS) */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 text-xs">
              {/* File Upload Area */}
              <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/60 p-5 text-center">
                <span className="text-3xl block mb-1">📸</span>
                <p className="font-bold text-slate-800">Upload Pre-Wedding Photos</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Choose your pre-wedding shoot pictures to display inside the invitation.
                </p>
                <label className="mt-3 inline-flex items-center gap-1.5 cursor-pointer rounded-full bg-[#123b5d] px-4 py-2 text-white font-bold text-xs hover:bg-sky-900 transition shadow-xs">
                  <span>📁</span> Choose Local Photos
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Active Cover Photo Indicator */}
              {coverPhoto && (
                <div className="rounded-2xl border border-sky-200 bg-white p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Active Invitation Cover</span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5">Live on Invite</span>
                  </div>
                  <div className="relative h-28 w-full rounded-xl overflow-hidden">
                    <img src={coverPhoto} alt="Cover" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPhoto('');
                        toast('Reset cover photo to theme mandala banner');
                      }}
                      className="absolute top-2 right-2 rounded-full bg-black/60 text-white px-2 py-0.5 text-[10px] hover:bg-black/80"
                    >
                      ✕ Reset to Theme
                    </button>
                  </div>
                </div>
              )}

              {galleryImages.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold">Uploaded photos</h3>
                  {galleryImages.map((photo, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-xl border p-2">
                      <img src={photo} alt={"Uploaded photo " + (index + 1)} className="size-12 rounded object-cover" />
                      <button type="button" onClick={() => setCoverPhoto(photo)} className="rounded border px-2 py-1">Use as cover</button>
                      <button type="button" onClick={() => {
                        setGalleryImages((photos) => photos.filter((_, i) => i !== index));
                        if (coverPhoto === photo) setCoverPhoto("");
                      }} className="rounded border px-2 py-1">Remove</button>
                    </div>
                  ))}
                </div>
              )}
              {/* Curated Pre-Wedding Moments */}
              <div>
                <p className="font-bold text-slate-800 text-xs mb-2 flex items-center justify-between">
                  <span>✨ Curated Wedding Moments</span>
                  <span className="text-[10px] text-slate-400">Click to set as cover</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_MOMENTS.map((moment) => (
                    <div
                      key={moment.id}
                      onClick={() => {
                        setCoverPhoto(moment.url);
                        toast.success(`Set "${moment.title}" as invitation cover photo!`);
                      }}
                      className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 transition ${coverPhoto === moment.url
                        ? 'border-sky-500 shadow-md ring-2 ring-sky-300'
                        : 'border-slate-200 hover:border-sky-300'
                        }`}
                    >
                      <div className="h-20 w-full overflow-hidden bg-slate-100">
                        <img
                          src={moment.url}
                          alt={moment.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-1.5 bg-white text-left">
                        <p className="font-bold text-[10px] text-slate-800 truncate">{moment.title}</p>
                        <p className="text-[9px] text-slate-400">{moment.tag}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: SETTINGS (WORKABLE CUSTOM SLUG, AUTOPLAY & RULES) */}
          {activeTab === 'settings' && (
            <div className="space-y-4 text-xs">
              {/* 2. Festive Audio Autoplay & Volume */}
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Autoplay Festive Music</p>
                    <p className="text-[10px] text-slate-500">Play music when the sample envelope opens</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMusicAutoplay(!musicAutoplay);
                      toast.success(musicAutoplay ? 'Music autoplay disabled' : 'Music autoplay enabled!');
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${musicAutoplay ? 'bg-sky-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${musicAutoplay ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                    <span>Default Volume</span>
                    <span>{Math.round(audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>
              </div>

              {/* 3. RSVP Cutoff & Rules */}
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-800">RSVP & Guest Rules</h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">RSVP Cutoff Deadline</label>
                  <input
                    type="date"
                    value={rsvpCutoffDate}
                    onChange={(e) => setRsvpCutoffDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="font-bold text-slate-700">Dietary Preferences</p>
                    <p className="text-[10px] text-slate-500">Vegetarian, Jain Vegetarian, and Vegan selectors</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>

              {/* 5. Wishlys Wax Seal Reveal Animation */}
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>💌</span> Wax Seal Envelope Reveal (Wishlys Style)
                  </p>
                  <p className="text-[10px] text-slate-500">Royal wax seal monogram envelope reveal on entry</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !showWaxSealReveal;
                    setShowWaxSealReveal(next);
                    if (next) setIsEnvelopeOpen(false);
                    toast.success(next ? 'Wax seal envelope reveal enabled!' : 'Standard card reveal');
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${showWaxSealReveal ? 'bg-sky-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${showWaxSealReveal ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* 3. CENTER PREVIEW CANVAS (ONE CLEAN SIZE IN THE MIDDLE - EXACT MATCH TO PHOTO 3!) */}
        <main className="upt-studio-preview relative min-w-0 flex-1 overflow-auto px-3 py-4 sm:px-6 flex flex-col items-center">
          {/* Device toggles + replay */}
          <div className="upt-device-bar" role="group" aria-label="Preview size">
            {([['mobile', 'Mobile'], ['tablet', 'Tablet'], ['desktop', 'Web']] as const).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={viewMode === id} onClick={() => setViewMode(id)}>{label}</button>
            ))}
            <button type="button" onClick={replayPreview} title="Replay the opening">↻ Replay</button>
          </div>
          {/* Top Controls Bar: Switcher + Compact Zoom Toolbar (No floating zoom blocking the phone!) */}
          <div className="z-20 mb-3 flex items-center justify-between gap-3 w-full max-w-[420px]">
            {/* Live vs RSVP Mode Switcher */}
            <div className="inline-flex items-center rounded-full border border-slate-300/80 bg-white/95 p-1 shadow-xs backdrop-blur">
              <button
                onClick={() => setPreviewMode('live')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${previewMode === 'live' ? 'bg-[#6e2849] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Invitation
              </button>
              <button
                onClick={() => { setViewMode('mobile'); setIsEnvelopeOpen(true); setRsvpSubmitted(false); setPreviewMode('rsvp'); rsvpRef.current?.scrollIntoView({ block: 'nearest' }); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${previewMode === 'rsvp' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Test RSVP
              </button>
            </div>

            {/* Compact Zoom Controls (No overlap with phone!) */}
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="hover:text-sky-600 px-1"
                title="Zoom out"
              >
                -
              </button>
              <span className="font-mono text-[10px] w-7 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="hover:text-sky-600 px-1"
                title="Zoom in"
              >
                +
              </button>
            </div>
          </div>

          {/* VIEW MODE CONTAINER: FULL PHONE IN ONE SIZE WITHOUT MAIN OVERFLOWING */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="flex w-full justify-center items-start"
          >
            {viewMode !== 'desktop' ? (
              /* EXACT REALISTIC iPHONE 16 PRO FRAME IN ONE CLEAN SIZE (MATCHING PHOTO 3) */
              <div key={previewKey} className={(viewMode === 'tablet' ? 'max-w-[560px] rounded-[30px] upt-anim-in ' : 'max-w-[365px] rounded-[48px] upt-anim-in ') + "relative w-full h-[min(670px,max(420px,calc(100dvh-195px)))] border-[9px] border-slate-900 bg-slate-900 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.4)] ring-1 ring-slate-800 flex flex-col overflow-hidden shrink-0 select-none"}>
                {/* Fixed Dedicated Top Status Bar with Dynamic Island */}
                <div className={`relative z-30 shrink-0 flex items-center justify-between px-6 pt-2 pb-1.5 border-b border-black/5 select-none ${currentTheme.phoneBg}`}>
                  <span className={`text-[11px] font-bold tracking-tight ${currentTheme.isDark ? 'text-white/80' : 'text-slate-800'}`}>9:41</span>
                  {/* Dynamic Island Notch */}
                  <div className="h-4.5 w-22 rounded-full bg-black flex items-center justify-between px-2.5 shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-950" />
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${currentTheme.isDark ? 'text-white/80' : 'text-slate-800'}`}>
                    <span>5G</span>
                    <span className="opacity-90">● ● ▰</span>
                  </div>
                </div>

                {/* Wishlys Wax Seal Envelope Opening Animation Screen */}
                {showWaxSealReveal && !isEnvelopeOpen ? (
                  <div className="relative flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#7a1420] via-[#540914] to-[#2e0308] p-6 text-center text-amber-100">
                    <div className="border border-amber-400/40 rounded-3xl p-6 w-full flex flex-col items-center bg-black/20 backdrop-blur-sm">
                      <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-300 mb-2">
                        SPECIAL INVITATION FOR
                      </p>
                      <h3 className="font-serif text-lg font-bold text-white mb-6">
                        {currentGuest.name}
                      </h3>

                      {/* Golden Wax Seal Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsEnvelopeOpen(true);
                          if (musicAutoplay && !isPlayingMusic) {
                            toggleMusic();
                          }
                          toast.success('Royal Wax Seal Broken! Unfolding card... ✨');
                        }}
                        className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#991b1b] to-[#dc2626] border-4 border-amber-400 shadow-2xl hover:scale-105 transition active:scale-95"
                      >
                        <span className="font-serif font-black text-amber-200 text-lg tracking-widest drop-shadow">
                          A & P
                        </span>
                        <span className="absolute -bottom-7 whitespace-nowrap text-[9px] font-bold text-amber-300">
                          Tap Seal to Open ✉️
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Inner Phone Screen: Smooth internal scroll inside the phone without outer canvas scroll! */
                  <div
                    className={`relative flex-1 overflow-y-auto ${currentTheme.phoneBg} custom-scrollbar font-sans`}
                  >
                    {/* Top Divine Blessing */}
                    <div className="py-2 px-4 text-center border-b border-black/5">
                      <p className={`text-xs font-serif font-bold tracking-widest ${currentTheme.headerAccent}`}>
                        {godBlessing}
                      </p>
                    </div>

                    {/* Couple Palatial Photo Banner */}
                    <div
                      className={`relative h-48 w-full overflow-hidden bg-gradient-to-b ${currentTheme.bannerGradient} flex items-center justify-center`}
                    >
                      {coverPhoto ? (
                        <>
                          <img src={coverPhoto} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="relative text-center p-3 z-10 text-white">
                            <span className="inline-block rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[9px] font-sans font-bold uppercase tracking-[0.2em] border border-white/20">
                              {occasionTitle}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.25)_0%,_rgba(0,0,0,0.35)_100%)]" />
                          <div className="relative text-center p-4 z-10 text-white">
                            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 backdrop-blur-sm text-2xl shadow-lg">
                              💍
                            </div>
                            <span className="inline-block rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
                              {occasionTitle}
                            </span>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
                        </>
                      )}
                    </div>

                    {/* Couple Header */}
                    <div className="px-5 pt-3 pb-3 text-center">
                      <span className={`text-[9px] font-sans font-bold uppercase tracking-[0.22em] ${currentTheme.headerAccent}`}>
                        TOGETHER WITH THEIR FAMILIES
                      </span>
                      <h2
                        className={`text-2xl sm:text-3xl font-bold mt-1 tracking-tight ${currentTheme.titleColor}`}
                        style={{ fontFamily: currentTheme.fontFamily }}
                      >
                        {groomName} <span className="italic font-normal opacity-75">&</span> {brideName}
                      </h2>
                      <p className={`mt-1.5 text-[11px] font-serif leading-relaxed max-w-[260px] mx-auto ${currentTheme.subtextColor}`}>
                        {isWedding ? "Invite you to celebrate their wedding." : "Invite you to celebrate with them."}
                      </p>
                    </div>

                    {/* DYNAMIC PERSONALIZED GUEST CARD */}
                    <div
                      className={`mx-3.5 mb-3 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3.5 shadow-xs text-left`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-base text-amber-700">✉️</span>
                        <div className="flex-1">
                          <p className={`font-bold text-xs ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                            {currentGuest.salutation}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-[9px] font-bold">
                            <span className={`rounded-full px-2 py-0.5 ${currentTheme.badgeBg}`}>
                              {currentGuest.passes} Reserved Passes
                            </span>
                            <span className="rounded-full bg-black/5 px-2 py-0.5 text-slate-500">
                              {guestVisibleEvents.length} Ceremonies
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Ticking Countdown Timer */}
                    <div
                      className={`mx-3.5 mb-3 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3 text-center shadow-xs`}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1.5">
                        COUNTDOWN TO THE EVENT
                      </p>
                      <div className="grid grid-cols-4 gap-1.5 text-center font-sans">
                        <div className="rounded-xl bg-black/5 py-1.5">
                          <p className="text-base font-bold">{timeLeft.days}</p>
                          <p className="text-[8px] uppercase tracking-wider opacity-60">Days</p>
                        </div>
                        <div className="rounded-xl bg-black/5 py-1.5">
                          <p className="text-base font-bold">{timeLeft.hours}</p>
                          <p className="text-[8px] uppercase tracking-wider opacity-60">Hours</p>
                        </div>
                        <div className="rounded-xl bg-black/5 py-1.5">
                          <p className="text-base font-bold">{timeLeft.mins}</p>
                          <p className="text-[8px] uppercase tracking-wider opacity-60">Mins</p>
                        </div>
                        <div className="rounded-xl bg-black/5 py-1.5">
                          <p className="text-base font-bold">{timeLeft.secs}</p>
                          <p className="text-[8px] uppercase tracking-wider opacity-60">Secs</p>
                        </div>
                      </div>
                    </div>

                    {/* Ceremonies & Schedule List for Current Guest */}
                    <div className="px-3.5 mb-3 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">
                          EVENT ITINERARY
                        </p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${currentTheme.badgeBg}`}>
                          {guestVisibleEvents.length} CELEBRATIONS
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {guestVisibleEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3 shadow-xs text-left`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${currentTheme.headerAccent}`}>
                                  {ev.date} • {ev.time}
                                </span>
                                <h4 className={`text-xs font-bold mt-0.5 ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {ev.name}
                                </h4>
                              </div>
                              <span className="text-xs">📍</span>
                            </div>
                            <p className={`text-[10px] mt-1 flex items-center gap-1 ${currentTheme.subtextColor}`}>
                              <span>🏛️</span> {ev.venue}
                            </p>
                            <p className={`text-[9px] mt-0.5 flex items-center gap-1 opacity-70 ${currentTheme.subtextColor}`}>
                              <span>👗</span> {ev.dressCode}
                            </p>

                            {/* Google Maps Directions + Calendar Actions */}
                            <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
                              <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(ev.venue)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 transition"
                              >
                                <span>📍</span> Directions
                              </a>
                              <button
                                type="button"
                                onClick={() => downloadCalendarEvent(ev, groomName + " & " + brideName)}
                                className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition"
                              >
                                <span>📅</span> Add to Cal
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Virtual Attendance / Live Stream Card */}
                    {showLiveStream && /^https?:\/\//i.test(liveStreamUrl) && (
                      <div className={`mx-3.5 mb-3 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3 shadow-xs text-left`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500">
                              LIVE BROADCAST
                            </span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">1080p HD</span>
                        </div>
                        <p className={`text-[11px] font-semibold mt-1 ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                          Virtual Attendance for Distant Guests
                        </p>
                        <a
                          href={liveStreamUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 py-1.5 text-[10px] font-bold text-white shadow-xs hover:opacity-95 transition"
                        >
                          <span>🔴</span> Join Live Broadcast
                        </a>
                      </div>
                    )}

                    {galleryImages.length > 0 && (
                      <section className={currentTheme.titleColor + " mx-3.5 mb-4"} aria-label="Invitation photo gallery">
                        <h3 className="mb-2 font-serif text-base font-bold">Our moments</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {galleryImages.map((photo, index) => (
                            <img key={index} src={photo} alt={"Celebration photo " + (index + 1)} className="aspect-square w-full rounded-xl object-cover" />
                          ))}
                        </div>
                      </section>
                    )}
                    {/* Digital Blessing Wall */}
                    <div className={`mx-3.5 mb-3 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3 shadow-xs text-left`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                          💌 BLESSING WALL ({blessingWishes.length})
                        </span>
                        <span className="text-[9px] font-bold text-sky-600">Guest Wishes</span>
                      </div>
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {blessingWishes.map((w, idx) => (
                          <div key={idx} className="rounded-lg bg-black/5 dark:bg-white/5 p-1.5 text-[9px] leading-relaxed">
                            {w}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex gap-1">
                        <input
                          type="text"
                          placeholder="Write a sweet blessing..."
                          value={newBlessingWish}
                          onChange={(e) => setNewBlessingWish(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newBlessingWish.trim()) {
                              setBlessingWishes((prev) => [...prev, `${newBlessingWish.trim()} - ${currentGuest.name}`]);
                              setNewBlessingWish('');
                              toast.success('Blessing added!');
                            }
                          }}
                          className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[9px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newBlessingWish.trim()) {
                              setBlessingWishes((prev) => [...prev, `${newBlessingWish.trim()} - ${currentGuest.name}`]);
                              setNewBlessingWish('');
                              toast.success('Blessing added!');
                            }
                          }}
                          className="rounded-md bg-sky-600 px-2 py-1 text-[9px] font-bold text-white hover:bg-sky-700 transition"
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Family & Host Blessings */}
                    <div className={`mx-3.5 mb-3 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3 text-center`}>
                      <p className={`text-xs font-bold ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                        {groomParents} & {brideParents}
                      </p>
                      <p className={`text-[10px] italic mt-1 opacity-80 ${currentTheme.subtextColor}`}>
                        "{hostBlessing}"
                      </p>
                    </div>

                    {/* RSVP Interactive Mode inside the Phone */}
                    {previewMode === 'rsvp' && (
                      <div ref={rsvpRef} className="mx-3.5 mb-4 rounded-2xl border-2 border-sky-400 bg-sky-50/95 p-3.5 text-left font-sans text-slate-800">
                        <p className="font-bold text-xs text-sky-950">RSVP for {currentGuest.name}</p>
                        <p className="text-[10px] text-slate-600 mb-2">
                          Will you join our celebration? {rsvpCutoffDate && <span className="block">Reply by {rsvpCutoffDate}</span>}
                        </p>

                        {rsvpSubmitted ? (
                          <div className="rounded-xl bg-emerald-100 p-2.5 text-center text-emerald-900">
                            <p className="font-bold text-xs">✓ Sample response recorded</p>
                            <p className="text-[9px] mt-0.5">{rsvpAttending ? "Attending" : "Declined"}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setRsvpAttending(true)}
                                className={`rounded-xl py-1.5 text-xs font-bold border transition ${rsvpAttending
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white text-slate-700'
                                  }`}
                              >
                                ✓ Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => setRsvpAttending(false)}
                                className={`rounded-xl py-1.5 text-xs font-bold border transition ${!rsvpAttending
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-white text-slate-700'
                                  }`}
                              >
                                ✕ Decline
                              </button>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-600 mb-1">
                                Attending Guests
                              </label>
                              <select
                                value={Math.min(rsvpGuestsCount, currentGuest.passes)}
                                onChange={(e) => setRsvpGuestsCount(Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                              >
                                {Array.from({ length: currentGuest.passes }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>
                                    {n} {n === 1 ? 'Guest' : 'Guests'}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-600 mb-1">
                                Diet Preference
                              </label>
                              <select
                                value={rsvpDiet}
                                onChange={(e) => setRsvpDiet(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                              >
                                <option>Vegetarian</option>
                                <option>Jain Vegetarian</option>
                                <option>Vegan</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setRsvpSubmitted(true);
                                toast.success('Sample RSVP recorded');
                              }}
                              className="w-full rounded-xl bg-sky-700 py-2 font-bold text-white text-xs shadow hover:bg-sky-800 transition"
                            >
                              Submit RSVP
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Home Indicator */}
                <div className={`h-4 shrink-0 flex items-center justify-center select-none border-t border-black/5 ${currentTheme.phoneBg}`}>
                  <span className={`h-1 w-24 rounded-full ${currentTheme.isDark ? 'bg-white/40' : 'bg-black/30'}`} />
                </div>
              </div>
            ) : (
              /* WIDE DESKTOP BROWSER PREVIEW */
              <div className="w-full max-w-[820px] rounded-2xl border-4 border-slate-800 bg-slate-900 shadow-2xl overflow-hidden h-[min(650px,calc(100vh-165px))] flex flex-col">
                <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-300 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="rounded-lg bg-slate-900 px-6 py-1 text-[10px] font-mono text-slate-400 truncate max-w-sm">
                    Invitation preview
                  </div>
                  <div className="text-[10px] font-bold text-sky-400">Desktop View</div>
                </div>

                <div className={`flex-1 overflow-y-auto ${currentTheme.phoneBg} p-6 text-slate-800 custom-scrollbar`}>
                  <div className="text-center mb-6">
                    <p className={`font-serif font-bold text-sm tracking-widest ${currentTheme.headerAccent}`}>
                      {godBlessing}
                    </p>
                    <h2 className={`font-serif text-3xl font-bold mt-2 ${currentTheme.titleColor}`}>
                      {groomName} & {brideName}
                    </h2>
                    <p className={`text-xs mt-1 max-w-md mx-auto ${currentTheme.subtextColor}`}>
                      {isWedding ? "Invite you to celebrate their wedding." : "Invite you to celebrate with them."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-4 shadow-xs`}>
                      <p className="font-bold text-xs mb-1">✉️ Personalized Greeting</p>
                      <p className="text-xs text-slate-700">{currentGuest.salutation}</p>
                      <span className={`inline-block mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${currentTheme.badgeBg}`}>
                        {currentGuest.passes} Reserved Passes
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">SCHEDULE FOR {currentGuest.name}</p>
                      {guestVisibleEvents.map((ev) => (
                        <div key={ev.id} className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3 text-xs shadow-xs`}>
                          <p className={`font-bold ${currentTheme.headerAccent}`}>{ev.name}</p>
                          <p className="text-[10px] text-slate-500">{ev.date} • {ev.time}</p>
                          <p className="text-[10px] mt-1 text-slate-600">📍 {ev.venue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* 4. RIGHT WORKSPACE PANEL (REACTIVE GUEST PERSONALIZATION & INSTANT WHATSAPP) */}
        <aside className="upt-studio-guests shrink-0 border-l border-slate-200/90 bg-white overflow-y-auto p-5 z-10 custom-scrollbar text-xs">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>⚡</span> Guest Pass & WhatsApp Suite
              </h3>
              <p className="text-[11px] text-slate-500">Personalize greetings & test instant WhatsApp delivery</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddGuestModal(true)}
              className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-800 hover:bg-sky-200 transition"
            >
              + Add
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Select Guest Dropdown */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                SELECT GUEST
              </label>
              <select
                value={selectedGuestId}
                onChange={(e) => setSelectedGuestId(e.target.value)}
                className="w-full rounded-xl border border-sky-200 bg-sky-50/50 px-3 py-2 font-bold text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition text-xs"
              >
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* FULLY MANUAL GUEST NAME EDIT */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                GUEST / FAMILY NAME (EDITABLE)
              </label>
              <input
                type="text"
                value={currentGuest.name}
                onChange={(e) => updateCurrentGuest('name', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-900 font-bold outline-none focus:bg-white focus:border-sky-400 text-xs"
              />
            </div>

            {/* FULLY MANUAL CUSTOM SALUTATION TEXTAREA */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  PERSONAL GREETING / SALUTATION
                </label>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Live Synced
                </span>
              </div>
              <textarea
                rows={3}
                value={currentGuest.salutation}
                onChange={(e) => updateCurrentGuest('salutation', e.target.value)}
                placeholder="Type personalized message that appears inside their invitation..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-sky-400 resize-none font-serif leading-relaxed"
              />
            </div>

            {/* ALLOCATED PASSES CONTROLLER */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200">
              <span className="font-bold text-slate-700">Allocated Passes</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateCurrentGuest('passes', Math.max(1, currentGuest.passes - 1))
                  }
                  className="h-6 w-6 rounded-md bg-white border border-slate-300 font-bold hover:bg-slate-100"
                >
                  -
                </button>
                <span className="font-bold text-sm w-4 text-center">{currentGuest.passes}</span>
                <button
                  type="button"
                  onClick={() => updateCurrentGuest('passes', currentGuest.passes + 1)}
                  className="h-6 w-6 rounded-md bg-white border border-slate-300 font-bold hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* REACTIVE CEREMONIES CHECKLIST (WORKS 100% RELIABLY) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                ASSIGN CEREMONIES FOR THIS GUEST
              </label>
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {events.map((ev) => {
                  const isChecked = currentGuest.assignedEventIds
                    ? currentGuest.assignedEventIds.includes(ev.id)
                    : false;
                  return (
                    <label
                      key={ev.id}
                      className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-800 font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGuestEvent(ev.id)}
                        className="rounded accent-sky-600 h-3.5 w-3.5"
                      />
                      <span className="truncate">{ev.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* WHATSAPP MESSAGE DRAFT & COPY */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  WHATSAPP MESSAGE DRAFT (EDITABLE)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    updateCurrentGuest('customWhatsAppText', '');
                    toast('Reset to dynamic template');
                  }}
                  className="text-[9px] text-sky-600 hover:underline"
                >
                  Reset
                </button>
              </div>
              <textarea
                rows={4}
                value={computedWhatsAppText}
                onChange={(e) => updateCurrentGuest('customWhatsAppText', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px] text-slate-700 leading-relaxed outline-none focus:bg-white focus:border-sky-400"
              />
              <button
                type="button"
                onClick={copyWhatsApp}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
              >
                <span>📋</span> Copy WhatsApp Text
              </button>
            </div>

            {/* SEND TEST WHATSAPP MESSAGE BUTTON */}
            <button
              type="button"
              onClick={sendWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:-translate-y-0.5"
            >
              <span>💬</span> Open in WhatsApp
            </button>

            {/* Delete current guest option */}
            <button
              type="button"
              onClick={deleteCurrentGuest}
              className="w-full text-center text-[10px] text-rose-500 hover:text-rose-700 hover:underline pt-1"
            >
              Delete this guest from list
            </button>
          </div>
        </aside>
      </div>

      {/* ADD GUEST MODAL */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-sky-100">
            <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">Add Guest</h3>
            <p className="text-xs text-slate-500 mb-4">
              Create a personalized pass and WhatsApp greeting for this guest.
            </p>

            <form onSubmit={handleAddGuest} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Patel & Family"
                  value={newGuestData.name}
                  onChange={(e) => setNewGuestData({ ...newGuestData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Passes</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newGuestData.passes}
                    onChange={(e) => setNewGuestData({ ...newGuestData, passes: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98250 12345"
                    value={newGuestData.phone}
                    onChange={(e) => setNewGuestData({ ...newGuestData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-sky-600 py-2.5 font-bold text-white hover:bg-sky-700"
                >
                  Add Guest
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

