'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

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

const THEMES: ThemeStyle[] = [
  {
    id: 'haldi-marigold-urli',
    name: 'Haldi Marigold & Brass Urli',
    badge: 'Canva & Pinterest Viral ⭐',
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
    id: 'kankotri-ganesh-vandana',
    name: 'Kankotri & Ganesh Vandana',
    badge: 'Shubh Muhurat Gujarati/Hindi',
    fontFamily: "'Playfair Display', serif",
    colors: ['#7f1d1d', '#fff7ed', '#c2410c'],
    outerBg: 'from-[#fff1f2] via-[#fef2f2] to-[#ffedd5]',
    phoneBg: 'bg-gradient-to-b from-[#fff7ed] via-[#fffbf5] to-[#fef3c7]',
    cardBg: 'bg-[#fffcf7]',
    cardBorder: 'border-orange-300',
    headerAccent: 'text-red-700',
    titleColor: 'text-red-950',
    subtextColor: 'text-slate-700',
    badgeBg: 'bg-red-100 text-red-900 border-red-300',
    bannerGradient: 'from-[#c2410c] via-[#b91c1c] to-[#7f1d1d]',
    primaryButton: 'bg-red-700 hover:bg-red-800 text-white',
    mandalaColor: 'border-red-400/50',
    isDark: false,
  },
  {
    id: 'love-story-polaroid',
    name: 'Love Story & Secret Passcode',
    badge: 'Interactive Timeline',
    fontFamily: "'Playfair Display', serif",
    colors: ['#4c0519', '#fff1f2', '#f43f5e'],
    outerBg: 'from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3]',
    phoneBg: 'bg-gradient-to-b from-[#fff1f2] via-[#fff5f6] to-[#fce7f3]',
    cardBg: 'bg-white',
    cardBorder: 'border-pink-300',
    headerAccent: 'text-pink-700',
    titleColor: 'text-pink-950',
    subtextColor: 'text-slate-700',
    badgeBg: 'bg-pink-100 text-pink-900 border-pink-200',
    bannerGradient: 'from-[#f43f5e] via-[#e11d48] to-[#be123c]',
    primaryButton: 'bg-pink-600 hover:bg-pink-700 text-white',
    mandalaColor: 'border-pink-400/40',
    isDark: false,
  },
  {
    id: 'royal-sandalwood',
    name: 'Royal Sandalwood',
    badge: 'Royal & Classic',
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
    id: 'crimson-gold',
    name: 'Crimson & Gold (Shubh Vivah)',
    badge: 'Traditional Hindu',
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
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire',
    badge: 'Modern Luxury',
    fontFamily: "'Marcellus', serif",
    colors: ['#071326', '#142547', '#4da1ea'],
    outerBg: 'from-[#071326] via-[#0d2144] to-[#040c19]',
    phoneBg: 'bg-gradient-to-b from-[#09152a] via-[#0e203f] to-[#061021]',
    cardBg: 'bg-slate-900/85 backdrop-blur-md',
    cardBorder: 'border-sky-500/30',
    headerAccent: 'text-sky-300',
    titleColor: 'text-white',
    subtextColor: 'text-slate-300',
    badgeBg: 'bg-sky-950/80 text-sky-200 border-sky-600/40',
    bannerGradient: 'from-[#0d2a54] via-[#1a4a8d] to-[#081a36]',
    primaryButton: 'bg-sky-600 hover:bg-sky-500 text-white',
    mandalaColor: 'border-sky-300/30',
    isDark: true,
  },
  {
    id: 'emerald-heritage',
    name: 'Emerald Heritage',
    badge: 'Mughal & Regal',
    fontFamily: "'Playfair Display', serif",
    colors: ['#0a2e20', '#f5fbf7', '#c99e46'],
    outerBg: 'from-[#0c3324] via-[#164733] to-[#072418]',
    phoneBg: 'bg-gradient-to-b from-[#f5fbf7] via-[#fafdfb] to-[#edf7f2]',
    cardBg: 'bg-white',
    cardBorder: 'border-emerald-200',
    headerAccent: 'text-[#0d4f37]',
    titleColor: 'text-[#0a2e20]',
    subtextColor: 'text-slate-600',
    badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-200',
    bannerGradient: 'from-[#0e4732] via-[#1a6649] to-[#0a3324]',
    primaryButton: 'bg-[#0d4f37] hover:bg-[#093927] text-white',
    mandalaColor: 'border-emerald-400/40',
    isDark: false,
  },
  {
    id: 'blush-romance',
    name: 'Blush & Rose Romance',
    badge: 'Soft Pastel Garden',
    fontFamily: "'Great Vibes', cursive",
    colors: ['#4a1d29', '#fff5f7', '#d97b93'],
    outerBg: 'from-[#fff0f3] via-[#fffafe] to-[#fce4eb]',
    phoneBg: 'bg-gradient-to-b from-[#fff5f7] via-[#fffbfd] to-[#fdeef3]',
    cardBg: 'bg-white/90',
    cardBorder: 'border-rose-200',
    headerAccent: 'text-rose-700',
    titleColor: 'text-rose-950',
    subtextColor: 'text-slate-600',
    badgeBg: 'bg-rose-100/90 text-rose-900 border-rose-200',
    bannerGradient: 'from-[#e0899f] via-[#c96a84] to-[#9e435b]',
    primaryButton: 'bg-rose-600 hover:bg-rose-700 text-white',
    mandalaColor: 'border-rose-300/40',
    isDark: false,
  },
  {
    id: 'minimal-zen',
    name: 'Minimal Zen Elegance',
    badge: 'Editorial & Modern',
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
    date: 'Feb 14, 2026',
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
    date: 'Feb 13, 2026',
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
    date: 'Feb 15, 2026',
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
    phone: '+91 98250 12345',
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
    phone: '+91 98251 67890',
    salutation: 'Dearest Priya, our celebration wouldn’t be complete without your dance, laughter and love!',
    customWhatsAppText: '',
    assignedEventIds: ['ev-1', 'ev-2', 'ev-3'],
    slug: 'priya-sister',
  },
  {
    id: 'g-3',
    name: 'Rahul Mehta (College Friend)',
    category: 'Close Friends',
    passes: 1,
    phone: '+91 98252 54321',
    salutation: 'Hey Rahul, get ready for unforgettable celebrations and crazy memories!',
    customWhatsAppText: '',
    assignedEventIds: ['ev-2', 'ev-3'],
    slug: 'rahul-m',
  },
  {
    id: 'g-4',
    name: 'The Singhania Family (Relatives)',
    category: 'Relatives',
    passes: 3,
    phone: '+91 98253 98765',
    salutation: 'Respected Singhania Family, with divine grace we solicit your presence and heartfelt blessings.',
    customWhatsAppText: '',
    assignedEventIds: ['ev-1', 'ev-3'],
    slug: 'singhania-relatives',
  },
];

export default function StudioEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const templateParam = searchParams?.get('template') || 'royal-sandalwood';

  // Initialize theme based on template query or default
  const initialTheme = useMemo(() => {
    return (
      THEMES.find((t) => t.id === templateParam || templateParam.includes(t.id)) ||
      THEMES[0]
    );
  }, [templateParam]);

  // Primary State
  const [currentTheme, setCurrentTheme] = useState<ThemeStyle>(initialTheme);

  useEffect(() => {
    if (templateParam) {
      const found = THEMES.find((t) => t.id === templateParam || templateParam.includes(t.id));
      if (found) {
        setCurrentTheme(found);
      }
    }
  }, [templateParam]);
  const [inviteTitle, setInviteTitle] = useState('Akshat & Priya Wedding Invite');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<'events' | 'story' | 'themes' | 'guests' | 'gallery'>('events');
  const [previewMode, setPreviewMode] = useState<'live' | 'rsvp'>('live');

  // Full Screen Preview Modal
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Audio State & Web Audio Synthesizer
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

  // Events & Guest state
  const [events, setEvents] = useState<CeremonyEvent[]>(DEFAULT_EVENTS);
  const [guests, setGuests] = useState<GuestItem[]>(DEFAULT_GUESTS);
  const [selectedGuestId, setSelectedGuestId] = useState<string>(DEFAULT_GUESTS[0].id);
  const [familyDetailsOpen, setFamilyDetailsOpen] = useState(true);

  // Share Modal & Add Guest Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestData, setNewGuestData] = useState({ name: '', passes: 2, phone: '', category: 'VIP Family' });

  // RSVP Form Interactive State
  const [rsvpAttending, setRsvpAttending] = useState<boolean | null>(true);
  const [rsvpGuestsCount, setRsvpGuestsCount] = useState(2);
  const [rsvpDiet, setRsvpDiet] = useState('Vegetarian');
  const [rsvpMessage, setRsvpMessage] = useState('Heartiest congratulations to the lovely couple!');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Real Ticking Countdown
  const [timeLeft, setTimeLeft] = useState({ days: 48, hours: 14, mins: 26, secs: 35 });
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Currently Selected Guest (Mutable on right panel!)
  const currentGuest = useMemo(() => {
    return guests.find((g) => g.id === selectedGuestId) || guests[0];
  }, [guests, selectedGuestId]);

  // Update current guest fields immediately
  const updateCurrentGuest = (field: keyof GuestItem, value: any) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === selectedGuestId ? { ...g, [field]: value } : g))
    );
  };

  // Toggle assigned event for current guest
  const toggleGuestEvent = (eventId: string) => {
    const assigned = currentGuest.assignedEventIds || [];
    const updated = assigned.includes(eventId)
      ? assigned.filter((id) => id !== eventId)
      : [...assigned, eventId];
    updateCurrentGuest('assignedEventIds', updated);
  };

  // Visible events for this simulated guest
  const guestVisibleEvents = useMemo(() => {
    return events.filter(
      (ev) =>
        ev.visibleToAll ||
        (currentGuest.assignedEventIds && currentGuest.assignedEventIds.includes(ev.id))
    );
  }, [events, currentGuest]);

  // Dynamic, REAL working URL on current host
  const shareableUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const slug = `${groomName}-${brideName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return `${origin}/i/${slug}?guest=${currentGuest.slug}`;
    }
    return `http://localhost:3002/i/akshat-katerina?guest=${currentGuest.slug}`;
  }, [groomName, brideName, currentGuest]);

  // WhatsApp Message Draft: If user wrote custom text, use it; otherwise compute dynamic template
  const computedWhatsAppText = useMemo(() => {
    if (currentGuest.customWhatsAppText && currentGuest.customWhatsAppText.trim()) {
      return currentGuest.customWhatsAppText;
    }
    const guestFirstName = currentGuest.name.split(' ')[0];
    return `Namaste ${guestFirstName}! 🙏 ${groomName} & ${brideName} are tying the knot on Feb 14! View our live invitation, ceremonies & directions here:\n${shareableUrl}`;
  }, [currentGuest, groomName, brideName, shareableUrl]);

  // Web Audio Shenhai / Festive Harmony Generator
  const toggleMusic = () => {
    if (isPlayingMusic) {
      stopSynthesizer();
      setIsPlayingMusic(false);
      toast('Music paused', { icon: '⏸️' });
    } else {
      startSynthesizer();
      setIsPlayingMusic(true);
      toast.success('♫ Shenhai & Tanpura Celebration Melody Playing!');
    }
  };

  const startSynthesizer = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(audioVolume * 0.25, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Create Indian Tanpura Drone (Sa & Pa harmonic base: D3 ~ 146.8Hz, A3 ~ 220Hz, D4 ~ 293.6Hz)
      const baseFreqs = [146.83, 220.0, 293.66];
      const nodes: any[] = [];

      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 1 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Gentle tremolo/vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(idx + 1, ctx.currentTime);
        lfoGain.gain.setValueAtTime(2.5, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        gain.gain.setValueAtTime(0.08 / (idx + 1), ctx.currentTime);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        nodes.push(osc, lfo);
      });

      // Melodic notes sequence (Bhairavi / Kalyan wedding ragas)
      const ragaNotes = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33];
      let step = 0;
      const melodyTimer = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          clearInterval(melodyTimer);
          return;
        }
        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        noteOsc.type = 'sawtooth';
        const noteFreq = ragaNotes[step % ragaNotes.length];
        step++;
        noteOsc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

        noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        noteOsc.connect(noteGain);
        noteGain.connect(masterGain);
        noteOsc.start();
        noteOsc.stop(ctx.currentTime + 1.3);
      }, 700);

      oscillatorNodesRef.current = nodes;
    } catch {
      // Audio fallback
    }
  };

  const stopSynthesizer = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    oscillatorNodesRef.current = [];
  };

  useEffect(() => {
    return () => {
      stopSynthesizer();
    };
  }, []);

  // Events management
  const toggleEventExpand = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e))
    );
  };

  const updateEvent = (id: string, field: keyof CeremonyEvent, value: any) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addEvent = () => {
    const newId = `ev-${Date.now()}`;
    const newEv: CeremonyEvent = {
      id: newId,
      name: 'Haldi & Floral Ceremony',
      categoryTag: 'AUSPICIOUS FUNCTION',
      date: 'Feb 13, 2026',
      time: '11:00 AM',
      venue: 'Palace Courtyard & Poolside',
      dressCode: 'Haldi Yellow / Mustard Silk',
      visibleToAll: true,
      expanded: true,
    };
    setEvents((prev) => [...prev, newEv]);
    toast.success('Ceremony added! Added to guest pass allocations.');
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
    navigator.clipboard.writeText(computedWhatsAppText);
    toast.success('WhatsApp text copied to clipboard! 📋');
  };

  const sendWhatsApp = () => {
    const encoded = encodeURIComponent(computedWhatsAppText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
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

  return (
    <div className="flex h-screen flex-col bg-[#f8fbff] text-slate-800 antialiased overflow-hidden selection:bg-sky-100">
      {/* 1. TOP HEADER (matching Image 2) */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-sky-100 bg-white px-4 sm:px-6 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <span>←</span> Dashboard
          </Link>

          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={inviteTitle}
                autoFocus
                onBlur={() => setIsEditingTitle(false)}
                onChange={(e) => setInviteTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="rounded-lg border border-sky-300 px-2 py-1 font-serif text-base sm:text-lg font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-200"
              />
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group flex cursor-pointer items-center gap-2"
                title="Click to rename"
              >
                <h1 className="font-serif text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-700 transition">
                  {inviteTitle}
                </h1>
                <span className="text-slate-400 group-hover:text-sky-600 text-xs">✏️</span>
              </div>
            )}

            {/* THEME SWITCHER DROPDOWN (Real instant theme change!) */}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold text-sky-800 hover:bg-sky-100 transition"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {currentTheme.name} ▾
              </button>

              <div className="invisible group-hover:visible absolute left-0 top-full mt-1.5 w-72 rounded-2xl border border-sky-100 bg-white p-2.5 shadow-2xl z-50 transition-all opacity-0 group-hover:opacity-100">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Aesthetic Wedding Theme
                </p>
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCurrentTheme(t);
                      toast.success(`Theme switched to: ${t.name}`);
                    }}
                    className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      currentTheme.id === t.id
                        ? 'bg-sky-50 text-sky-950 font-bold border border-sky-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-1">
                        {t.colors.map((c, i) => (
                          <span
                            key={i}
                            className="h-3.5 w-3.5 rounded-full border border-white"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className="truncate max-w-[140px]">{t.name}</span>
                    </div>
                    <span className="text-[10px] opacity-60">{t.badge}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center device toggle & Undo/Redo */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold text-slate-600">
            <button
              onClick={() => {
                setViewMode('mobile');
                toast('Switched to Mobile View (iPhone Frame)');
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${
                viewMode === 'mobile' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              <span>📱</span> Mobile
            </button>
            <button
              onClick={() => {
                setViewMode('desktop');
                toast('Switched to Wide Desktop Browser View');
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${
                viewMode === 'desktop' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              <span>💻</span> Desktop
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span>☁️</span> All changes saved
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* Full Preview Modal Button */}
          <button
            onClick={() => setShowFullPreview(true)}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-sky-300"
          >
            <span>👁️</span> Preview
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#123b5d] px-5 py-2 text-xs font-bold text-white shadow-md shadow-sky-950/20 transition hover:-translate-y-0.5 hover:bg-sky-800"
          >
            <span>🚀</span> Publish & Share
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN WORKSPACE (matching Image 2) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left vertical slim icon bar */}
        <nav className="flex w-16 shrink-0 flex-col items-center justify-between border-r border-sky-100 bg-white py-4 z-20">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setActiveTab('events')}
              title="Ceremonies & Events"
              className={`relative flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${
                activeTab === 'events'
                  ? 'bg-sky-100 text-sky-900 font-bold shadow-sm'
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
              onClick={() => setActiveTab('story')}
              title="Couple Story & Blessings"
              className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${
                activeTab === 'story'
                  ? 'bg-sky-100 text-sky-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">📖</span>
              <span className="text-[9px] font-bold">Story</span>
            </button>

            <button
              onClick={() => setActiveTab('themes')}
              title="Theme, Fonts & Music"
              className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${
                activeTab === 'themes'
                  ? 'bg-sky-100 text-sky-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">🎨</span>
              <span className="text-[9px] font-bold">Themes</span>
            </button>

            <button
              onClick={() => setActiveTab('guests')}
              title="Guest Personalization & Excel"
              className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${
                activeTab === 'guests'
                  ? 'bg-sky-100 text-sky-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">👥</span>
              <span className="text-[9px] font-bold">Guests</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              title="Photo Gallery"
              className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition ${
                activeTab === 'gallery'
                  ? 'bg-sky-100 text-sky-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">🖼️</span>
              <span className="text-[9px] font-bold">Gallery</span>
            </button>
          </div>

          <button
            onClick={() => toast('Platform Settings: 100% Free Lifetime Tier Active · Unlimited Guests')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Settings"
          >
            ⚙️
          </button>
        </nav>

        {/* Left Editing Workspace Panel */}
        <aside className="w-[360px] lg:w-[400px] shrink-0 border-r border-sky-100 bg-white overflow-y-auto p-5 z-10 custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {activeTab === 'events' && 'Ceremonies & Events'}
                {activeTab === 'story' && 'Couple Story & Blessing'}
                {activeTab === 'themes' && 'Aesthetic Themes & Audio'}
                {activeTab === 'guests' && 'Guest List & Personalization'}
                {activeTab === 'gallery' && 'Couple Photos & Media'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'events' && 'Schedule & locations for guests'}
                {activeTab === 'story' && 'Names, invocation and family blessings'}
                {activeTab === 'themes' && 'Color palettes, typography and music'}
                {activeTab === 'guests' && 'Assign events and generate custom links'}
                {activeTab === 'gallery' && 'High resolution images for the invite'}
              </p>
            </div>
            {activeTab === 'events' && (
              <button
                onClick={addEvent}
                className="flex items-center gap-1 rounded-full bg-[#123b5d] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-sky-800 transition"
              >
                + Add Event
              </button>
            )}
            {activeTab === 'guests' && (
              <button
                onClick={() => setShowAddGuestModal(true)}
                className="flex items-center gap-1 rounded-full bg-[#123b5d] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-sky-800 transition"
              >
                + Add Guest
              </button>
            )}
          </div>

          {/* Sub-tabs pills */}
          <div className="flex gap-2 border-b border-sky-100 pb-3 mb-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('events')}
              className={`pb-1 transition border-b-2 ${
                activeTab === 'events'
                  ? 'border-sky-600 text-sky-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Active Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('story')}
              className={`pb-1 transition border-b-2 ${
                activeTab === 'story'
                  ? 'border-sky-600 text-sky-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Couple Story
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`pb-1 transition border-b-2 ${
                activeTab === 'themes'
                  ? 'border-sky-600 text-sky-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Theme & Music
            </button>
          </div>

          {/* TAB CONTENT: EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {/* Aesthetic theme preview strip matching Image 2 */}
              <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                    AESTHETIC THEME
                  </span>
                  <span className="text-xs font-bold text-slate-700">{currentTheme.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setCurrentTheme(theme);
                          toast.success(`Theme: ${theme.name}`);
                        }}
                        className={`h-7 w-7 rounded-full border-2 transition ${
                          currentTheme.id === theme.id
                            ? 'border-slate-800 scale-110 shadow'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: theme.colors[2] }}
                        title={theme.name}
                      />
                    ))}
                  </div>

                  {/* REAL PLAYABLE AUDIO BUTTON */}
                  <button
                    onClick={toggleMusic}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition ${
                      isPlayingMusic
                        ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{isPlayingMusic ? '🔊' : '♫'}</span>
                    <span className="truncate max-w-[110px] text-[11px] font-bold">
                      {isPlayingMusic ? 'Playing Shenhai' : 'Shenhai Preview'}
                    </span>
                    {isPlayingMusic && (
                      <span className="flex items-center gap-0.5 ml-1">
                        <span className="h-2 w-0.5 bg-amber-600 animate-pulse" />
                        <span className="h-3 w-0.5 bg-amber-600 animate-pulse delay-75" />
                        <span className="h-1.5 w-0.5 bg-amber-600 animate-pulse delay-150" />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Event Accordion Cards matching Image 2 */}
              <div className="space-y-3">
                {events.map((ev, index) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-200"
                  >
                    <div
                      onClick={() => toggleEventExpand(ev.id)}
                      className="flex cursor-pointer items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-900 font-bold text-xs">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {ev.name}
                          </h3>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            {ev.categoryTag || 'WEDDING CELEBRATION'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEvent(ev.id);
                          }}
                          className="text-slate-300 hover:text-rose-500 text-xs px-1"
                          title="Delete Event"
                        >
                          ✕
                        </button>
                        <span className="text-slate-400 text-xs">{ev.expanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Expanded Event Details Form */}
                    {ev.expanded && (
                      <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Ceremony Title
                          </label>
                          <input
                            type="text"
                            value={ev.name}
                            onChange={(e) => updateEvent(ev.id, 'name', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Date
                            </label>
                            <input
                              type="text"
                              value={ev.date}
                              onChange={(e) => updateEvent(ev.id, 'date', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Auspicious Time
                            </label>
                            <input
                              type="text"
                              value={ev.time}
                              onChange={(e) => updateEvent(ev.id, 'time', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Venue & Mandapam
                          </label>
                          <input
                            type="text"
                            value={ev.venue}
                            onChange={(e) => updateEvent(ev.id, 'venue', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Dress Code
                          </label>
                          <input
                            type="text"
                            value={ev.dressCode}
                            onChange={(e) => updateEvent(ev.id, 'dressCode', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                          <span className="text-[11px] font-bold text-slate-700">
                            Visible to all guests
                          </span>
                          <button
                            type="button"
                            onClick={() => updateEvent(ev.id, 'visibleToAll', !ev.visibleToAll)}
                            className={`h-5 w-10 rounded-full transition relative ${
                              ev.visibleToAll ? 'bg-sky-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                                ev.visibleToAll ? 'right-0.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Family & Host Details Accordion */}
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                <div
                  onClick={() => setFamilyDetailsOpen(!familyDetailsOpen)}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <h3 className="text-sm font-bold text-slate-900">Family & Host Details</h3>
                  <span className="text-slate-400 text-xs">{familyDetailsOpen ? '▲' : '▼'}</span>
                </div>

                {familyDetailsOpen && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Groom Parents
                      </label>
                      <input
                        type="text"
                        value={groomParents}
                        onChange={(e) => setGroomParents(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Bride Parents
                      </label>
                      <input
                        type="text"
                        value={brideParents}
                        onChange={(e) => setBrideParents(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Host Blessing Message
                      </label>
                      <textarea
                        rows={2}
                        value={hostBlessing}
                        onChange={(e) => setHostBlessing(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400 resize-none"
                      />
                    </div>
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
                      className={`truncate rounded-lg px-2 py-1.5 border text-left font-serif text-[11px] ${
                        godBlessing === inv
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Groom Name
                  </label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Bride Name
                  </label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-bold"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
                <p className="text-[11px] font-bold text-sky-900 mb-1">Couple Portrait Theme Art</p>
                <p className="text-[10px] text-slate-500 mb-2">
                  Automatically adapts to your selected color palette with warm palatial lighting.
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow"
                    style={{ backgroundColor: currentTheme.colors[2] }}
                  >
                    👑
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-[11px]">{currentTheme.name} Artwork</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">✓ High-Res Scaled</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: THEMES & AUDIO */}
          {activeTab === 'themes' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2">
                  Curated Aesthetic Palettes (Live Preview updates)
                </label>
                <div className="space-y-2">
                  {THEMES.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => {
                        setCurrentTheme(theme);
                        toast.success(`Active Palette: ${theme.name}`);
                      }}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                        currentTheme.id === theme.id
                          ? 'border-sky-500 bg-sky-50/80 shadow-sm ring-2 ring-sky-200'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1.5">
                          {theme.colors.map((c, i) => (
                            <span
                              key={i}
                              className="h-6 w-6 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">{theme.name}</span>
                          <span className="text-[10px] text-slate-500 font-serif">{theme.badge}</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {theme.isDark ? '🌙 Dark' : '☀️ Light'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Music Player Control */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs">Audio Soundtrack</span>
                  <button
                    onClick={toggleMusic}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition ${
                      isPlayingMusic ? 'bg-amber-600 text-white shadow' : 'bg-white border border-amber-300 text-amber-900'
                    }`}
                  >
                    {isPlayingMusic ? '⏹ Stop Music' : '▶ Play Music'}
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Select Soundtrack Raga
                  </label>
                  <select
                    value={audioTrack}
                    onChange={(e) => {
                      setAudioTrack(e.target.value);
                      if (isPlayingMusic) {
                        stopSynthesizer();
                        startSynthesizer();
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none text-xs"
                  >
                    <option>Shenhai Instrumental (Mangal Vadya)</option>
                    <option>Royal Sitar & Tanpura Harmony</option>
                    <option>Acoustic Strings - Romantic Prelude</option>
                    <option>Temple Chimes & Auspicious Flute</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Volume</span>
                    <span>{Math.round(audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: GUESTS */}
          {activeTab === 'guests' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-sky-50 p-3 rounded-xl border border-sky-100">
                <div>
                  <p className="font-bold text-sky-950">Guest Personalization System</p>
                  <p className="text-[10px] text-slate-500">Each guest receives a custom salutation & allocated ceremonies</p>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-2">
                {guests.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGuestId(g.id)}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      selectedGuestId === g.id
                        ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-1 ring-sky-300'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{g.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                        {g.passes} Passes
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">
                      "{g.salutation}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-6 text-center">
                <span className="text-3xl block mb-2">📸</span>
                <p className="font-bold text-slate-800">Upload Pre-Wedding Moments</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Drag and drop JPG or PNG photos. Unlimited storage included free forever.
                </p>
                <button
                  type="button"
                  onClick={() => toast.success('Photo added to couple gallery!')}
                  className="mt-3 rounded-full bg-[#123b5d] px-4 py-2 text-white font-bold text-xs"
                >
                  Choose Images
                </button>
              </div>
            </div>
          )}

          {/* Compact Celebration Sound / Shenhai Bar */}
          <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <span>🎵</span> Festive Music Preview
              </span>
              <button
                type="button"
                onClick={toggleMusic}
                className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                  isPlayingMusic
                    ? 'bg-amber-500 text-white shadow'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isPlayingMusic ? '⏸ Pause' : '▶ Play Shenhai'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">
              Track: <span className="font-semibold text-slate-700">{audioTrack}</span> · Auto-plays when guests open the invite.
            </p>
          </div>

          {/* Studio Pro Tip card */}
          <div className="mt-3.5 rounded-xl bg-slate-50 border border-slate-200/90 p-3 text-[11px] text-slate-600">
            <p className="font-bold text-slate-800 mb-0.5 flex items-center gap-1">
              <span>💡</span> Studio Pro Tip
            </p>
            <p className="leading-relaxed">
              Every detail updates live in the center phone preview. Use the Right Panel to test guest passes, custom greetings & instant WhatsApp sharing.
            </p>
          </div>
        </aside>

        {/* Center Live Phone / Desktop Mockup Preview (Centered in canvas with luxury grid) */}
        <main className="flex-1 overflow-y-auto bg-[#f1f6fc] bg-[radial-gradient(#d1dce8_1px,transparent_1px)] [background-size:18px_18px] p-4 lg:p-6 flex flex-col items-center justify-center custom-scrollbar">
          {/* Top Preview Switcher Pill */}
          <div className="mb-4 inline-flex items-center rounded-full border border-sky-200 bg-white/95 px-2 py-1 shadow-md shadow-sky-950/5 backdrop-blur z-10">
            <button
              onClick={() => setPreviewMode('live')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                previewMode === 'live' ? 'bg-emerald-500 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              Live Preview Mode
            </button>
            <button
              onClick={() => setPreviewMode('rsvp')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                previewMode === 'rsvp' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🔀</span> Test Interactive RSVP
            </button>
          </div>

          {/* VIEW MODE CONTAINER: MOBILE VS DESKTOP WITH REAL ZOOM */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full flex justify-center py-1 transition-all"
          >
            {viewMode === 'mobile' ? (
              /* REALISTIC MOBILE iPHONE FRAME */
              <div className="relative w-[340px] sm:w-[375px] h-[720px] rounded-[52px] border-[10px] border-slate-900 bg-slate-900 shadow-[0_25px_60px_-15px_rgba(18,59,93,0.35)] flex flex-col overflow-hidden">
                {/* Fixed Dedicated Top Status Bar with Dynamic Island - NOTCH NEVER CUTS CONTENT */}
                <div className={`relative z-30 shrink-0 flex items-center justify-between px-6 pt-2.5 pb-2 border-b border-black/5 select-none ${currentTheme.phoneBg}`}>
                  <span className={`text-[11px] font-bold tracking-tight ${currentTheme.isDark ? 'text-white/80' : 'text-slate-800'}`}>9:41</span>
                  {/* Dynamic Island Notch */}
                  <div className="h-5 w-24 rounded-full bg-black flex items-center justify-between px-2.5 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-slate-800" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-950" />
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${currentTheme.isDark ? 'text-white/80' : 'text-slate-800'}`}>
                    <span>5G</span>
                    <span className="opacity-90">● ● ▰</span>
                  </div>
                </div>

                {/* Inner Phone Screen: starts cleanly below the notch and scrolls smoothly */}
                <div
                  className={`relative flex-1 overflow-y-auto ${currentTheme.phoneBg} custom-scrollbar font-sans`}
                >
                  {/* Top Divine Blessing */}
                  <div className="py-2.5 px-4 text-center border-b border-black/5">
                    <p className={`text-xs font-serif font-bold tracking-widest ${currentTheme.headerAccent}`}>
                      {godBlessing}
                    </p>
                  </div>

                {/* Couple Palatial Photo Banner matching active theme */}
                <div
                  className={`relative h-56 w-full overflow-hidden bg-gradient-to-b ${currentTheme.bannerGradient} flex items-center justify-center`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.25)_0%,_rgba(0,0,0,0.35)_100%)]" />
                  <div className="relative text-center p-4 z-10 text-white">
                    <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 backdrop-blur-sm text-3xl shadow-lg">
                      💍
                    </div>
                    <span className="inline-block rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
                      Royal Mandap & Palace
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Couple Header */}
                <div className="px-6 pt-3 pb-4 text-center">
                  <span className={`text-[10px] font-sans font-bold uppercase tracking-[0.22em] ${currentTheme.headerAccent}`}>
                    TOGETHER WITH THEIR FAMILIES
                  </span>
                  <h2
                    className={`text-3xl font-bold mt-2 tracking-tight ${currentTheme.titleColor}`}
                    style={{ fontFamily: currentTheme.fontFamily }}
                  >
                    {groomName} <span className="italic font-normal opacity-75">&</span> {brideName}
                  </h2>
                  <p className={`mt-2 text-xs font-serif leading-relaxed max-w-[280px] mx-auto ${currentTheme.subtextColor}`}>
                    Invite you to celebrate their auspicious union and begin their lifelong journey of love and togetherness.
                  </p>
                </div>

                {/* DYNAMIC PERSONALIZED GUEST CARD (Reacts directly to user typing in Right Panel!) */}
                <div
                  className={`mx-4 mb-4 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-4 shadow-sm text-left`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-base text-amber-700">✉️</span>
                    <div className="flex-1">
                      <p className={`font-bold text-xs ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                        {currentGuest.salutation}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold">
                        <span className={`rounded-full px-2.5 py-0.5 ${currentTheme.badgeBg}`}>
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
                  className={`mx-4 mb-4 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3.5 text-center shadow-sm`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">
                    COUNTDOWN TO MUHURTHAM
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center font-sans">
                    <div className="rounded-xl bg-black/5 py-2">
                      <p className="text-lg font-bold">{timeLeft.days}</p>
                      <p className="text-[8px] uppercase tracking-wider opacity-60">Days</p>
                    </div>
                    <div className="rounded-xl bg-black/5 py-2">
                      <p className="text-lg font-bold">{timeLeft.hours}</p>
                      <p className="text-[8px] uppercase tracking-wider opacity-60">Hours</p>
                    </div>
                    <div className="rounded-xl bg-black/5 py-2">
                      <p className="text-lg font-bold">{timeLeft.mins}</p>
                      <p className="text-[8px] uppercase tracking-wider opacity-60">Mins</p>
                    </div>
                    <div className="rounded-xl bg-black/5 py-2">
                      <p className="text-lg font-bold">{timeLeft.secs}</p>
                      <p className="text-[8px] uppercase tracking-wider opacity-60">Secs</p>
                    </div>
                  </div>
                </div>

                {/* Event Itinerary for this Guest (Live filtered by guest permissions) */}
                <div className="px-4 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                      EVENT ITINERARY
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentTheme.badgeBg}`}>
                      {guestVisibleEvents.length} CELEBRATIONS
                    </span>
                  </div>

                  <div className="space-y-3">
                    {guestVisibleEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3.5 shadow-sm text-left`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${currentTheme.headerAccent}`}>
                              {ev.date} • {ev.time}
                            </span>
                            <h4 className={`text-sm font-bold mt-0.5 ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                              {ev.name}
                            </h4>
                          </div>
                          <span className="text-xs">📍</span>
                        </div>
                        <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${currentTheme.subtextColor}`}>
                          <span>🏛️</span> {ev.venue}
                        </p>
                        <p className={`text-[10px] mt-0.5 flex items-center gap-1 opacity-70 ${currentTheme.subtextColor}`}>
                          <span>👗</span> {ev.dressCode}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Family & Host Blessings */}
                  <div className={`mt-4 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3 text-center`}>
                    <p className={`text-xs font-bold ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                      {groomParents} & {brideParents}
                    </p>
                    <p className={`text-[10px] italic mt-1 opacity-80 ${currentTheme.subtextColor}`}>
                      "{hostBlessing}"
                    </p>
                  </div>

                  {/* RSVP Interactive Mode inside the Phone */}
                  {previewMode === 'rsvp' && (
                    <div className="mt-4 rounded-2xl border-2 border-sky-400 bg-sky-50/95 p-4 text-left font-sans text-slate-800">
                      <p className="font-bold text-xs text-sky-950">RSVP for {currentGuest.name}</p>
                      <p className="text-[10px] text-slate-600 mb-3">
                        Will you join our celebration?
                      </p>

                      {rsvpSubmitted ? (
                        <div className="rounded-xl bg-emerald-100 p-3 text-center text-emerald-900">
                          <p className="font-bold text-xs">✓ RSVP Confirmed!</p>
                          <p className="text-[10px] mt-0.5">We look forward to welcoming you.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setRsvpAttending(true)}
                              className={`rounded-xl py-2 text-xs font-bold border transition ${
                                rsvpAttending
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white text-slate-700'
                              }`}
                            >
                              ✓ Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => setRsvpAttending(false)}
                              className={`rounded-xl py-2 text-xs font-bold border transition ${
                                !rsvpAttending
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-white text-slate-700'
                              }`}
                            >
                              ✕ Decline
                            </button>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">
                              Number of Attending Guests
                            </label>
                            <select
                              value={rsvpGuestsCount}
                              onChange={(e) => setRsvpGuestsCount(Number(e.target.value))}
                              className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                            >
                              {[1, 2, 3, 4, 5, 6].map((n) => (
                                <option key={n} value={n}>
                                  {n} {n === 1 ? 'Guest' : 'Guests'}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">
                              Blessing Message
                            </label>
                            <input
                              type="text"
                              value={rsvpMessage}
                              onChange={(e) => setRsvpMessage(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setRsvpSubmitted(true);
                              toast.success('RSVP submitted successfully in live test!');
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
              </div>

              {/* Bottom Home Indicator */}
              <div className={`h-5 shrink-0 flex items-center justify-center select-none border-t border-black/5 ${currentTheme.phoneBg}`}>
                <span className={`h-1 w-28 rounded-full ${currentTheme.isDark ? 'bg-white/40' : 'bg-black/30'}`} />
              </div>
            </div>
          ) : (
            /* WIDE DESKTOP BROWSER PREVIEW */
            <div className="w-[95%] max-w-[840px] rounded-2xl border-4 border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
              {/* Browser chrome top bar */}
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <div className="rounded-lg bg-slate-900 px-6 py-1 text-[11px] font-mono text-slate-400">
                  {shareableUrl}
                </div>
                <div className="text-[11px] font-bold text-sky-400">Desktop View</div>
              </div>

              {/* Desktop Layout Inner Body */}
              <div
                className={`p-8 max-h-[640px] overflow-y-auto ${currentTheme.phoneBg} custom-scrollbar`}
                style={{ fontFamily: currentTheme.fontFamily }}
              >
                <div className="text-center pb-6 border-b border-black/5">
                  <p className={`text-sm font-bold tracking-widest ${currentTheme.headerAccent}`}>
                    {godBlessing}
                  </p>
                  <h2 className={`text-4xl sm:text-5xl font-bold mt-2 ${currentTheme.titleColor}`}>
                    {groomName} <span className="italic font-normal opacity-75">&</span> {brideName}
                  </h2>
                  <p className={`mt-2 text-sm max-w-lg mx-auto ${currentTheme.subtextColor}`}>
                    Invite you to celebrate their auspicious union and begin their lifelong journey of love and togetherness.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Personalized Card & Countdown */}
                  <div className="space-y-4">
                    <div className={`rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-5 shadow-sm`}>
                      <span className="text-lg">✉️</span>
                      <h4 className={`text-sm font-bold mt-1 ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                        {currentGuest.salutation}
                      </h4>
                      <div className="mt-3 flex gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${currentTheme.badgeBg}`}>
                          {currentGuest.passes} Passes Reserved
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-black/5 font-semibold">
                          Assigned: {guestVisibleEvents.length} Ceremonies
                        </span>
                      </div>
                    </div>

                    <div className={`rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-5 text-center shadow-sm`}>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-3">
                        COUNTDOWN TO MUHURTHAM
                      </p>
                      <div className="grid grid-cols-4 gap-2 font-sans">
                        <div className="rounded-xl bg-black/5 py-2">
                          <p className="text-xl font-bold">{timeLeft.days}</p>
                          <p className="text-[9px] uppercase tracking-wider opacity-60">Days</p>
                        </div>
                        <div className="rounded-xl bg-black/5 py-2">
                          <p className="text-xl font-bold">{timeLeft.hours}</p>
                          <p className="text-[9px] uppercase tracking-wider opacity-60">Hours</p>
                        </div>
                        <div className="rounded-xl bg-black/5 py-2">
                          <p className="text-xl font-bold">{timeLeft.mins}</p>
                          <p className="text-[9px] uppercase tracking-wider opacity-60">Mins</p>
                        </div>
                        <div className="rounded-xl bg-black/5 py-2">
                          <p className="text-xl font-bold">{timeLeft.secs}</p>
                          <p className="text-[9px] uppercase tracking-wider opacity-60">Secs</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Events list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider opacity-60">
                      SCHEDULE FOR {currentGuest.name.toUpperCase()}
                    </h4>
                    {guestVisibleEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-4 shadow-sm`}
                      >
                        <div className="flex justify-between">
                          <span className={`text-[10px] font-bold uppercase ${currentTheme.headerAccent}`}>
                            {ev.date} • {ev.time}
                          </span>
                          <span>📍</span>
                        </div>
                        <h4 className={`text-base font-bold mt-0.5 ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                          {ev.name}
                        </h4>
                        <p className={`text-xs mt-1 ${currentTheme.subtextColor}`}>🏛️ {ev.venue}</p>
                        <p className={`text-xs mt-0.5 opacity-75 ${currentTheme.subtextColor}`}>👗 {ev.dressCode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Bottom Zoom & Interactive Controls */}
          <div className="mt-4 flex items-center gap-3 text-xs font-bold text-slate-600 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-sky-100 shadow-sm">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
              className="px-2 py-1 rounded-md hover:bg-slate-100 text-slate-700 transition"
              title="Zoom out"
            >
              🔍 -
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomLevel(100);
                toast('Zoom reset to 100%');
              }}
              className="px-2.5 py-1 rounded-md hover:bg-sky-50 text-sky-800 transition font-mono"
              title="Reset Zoom"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
              className="px-2 py-1 rounded-md hover:bg-slate-100 text-slate-700 transition"
              title="Zoom in"
            >
              + 🔍
            </button>
            <span className="h-3 w-px bg-slate-200" />
            <button
              type="button"
              onClick={() => {
                setRsvpSubmitted(false);
                setZoomLevel(100);
                toast.success('Preview reloaded at 100%');
              }}
              className="hover:text-slate-900 flex items-center gap-1 text-slate-700"
            >
              🔄 Reload Frame
            </button>
          </div>
        </main>

        {/* 3. RIGHT PANEL: 100% MANUALLY EDITABLE GUEST SIMULATOR */}
        <aside className="w-[340px] lg:w-[380px] shrink-0 border-l border-sky-100 bg-white p-5 overflow-y-auto flex flex-col gap-4 custom-scrollbar z-10">
          <div className="space-y-3.5 text-xs">
            {/* Header with Add Guest button */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base text-amber-700">👥</span>
                  <h3 className="font-bold text-slate-900 text-sm">Guest Simulator</h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Fully customizable per-guest personalization
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddGuestModal(true)}
                className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-800 hover:bg-sky-200 transition"
              >
                + New
              </button>
            </div>

            {/* Select Guest Dropdown */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                SELECT GUEST
              </label>
              <select
                value={selectedGuestId}
                onChange={(e) => setSelectedGuestId(e.target.value)}
                className="w-full rounded-xl border border-sky-200 bg-sky-50/50 px-3 py-2 font-bold text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-bold outline-none focus:bg-white focus:border-sky-400"
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

            {/* MANUAL CEREMONIES CHECKLIST FOR THIS GUEST */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                ASSIGN CEREMONIES FOR THIS GUEST
              </label>
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {events.map((ev) => {
                  const isChecked =
                    ev.visibleToAll ||
                    (currentGuest.assignedEventIds &&
                      currentGuest.assignedEventIds.includes(ev.id));
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

            {/* FULLY MANUAL WHATSAPP MESSAGE DRAFT */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  WHATSAPP MESSAGE DRAFT (EDITABLE)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    updateCurrentGuest('customWhatsAppText', '');
                    toast('Reset to default template');
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
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <span>📋</span> Copy WhatsApp Text
              </button>
            </div>

            {/* PRIMARY WORKING WHATSAPP BUTTON */}
            <button
              type="button"
              onClick={sendWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:-translate-y-0.5"
            >
              <span>💬</span> Send Test WhatsApp Message
            </button>

            {/* Open Guest Link in New Tab */}
            <a
              href={shareableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 py-2.5 font-bold text-sky-800 text-xs hover:bg-sky-100 transition shadow-sm"
            >
              <span>🔗</span> Open Guest Link in New Tab ↗
            </a>

            {/* Delete current guest option */}
            <button
              type="button"
              onClick={deleteCurrentGuest}
              className="w-full text-center text-[10px] text-rose-500 hover:text-rose-700 hover:underline pt-1"
            >
              Delete this guest from list
            </button>
          </div>

          {/* Bottom Stats Status Bar */}
          <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs font-bold">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-400">TOTAL GUESTS</p>
              <p className="text-slate-900 text-sm">{guests.length} In Simulator</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wider text-slate-400">STATUS</p>
              <p className="text-emerald-700 text-sm">100% Free Lifetime</p>
            </div>
          </div>
        </aside>
      </div>

      {/* FULL SCREEN INTERACTIVE PREVIEW MODAL */}
      {showFullPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between bg-slate-900 text-white px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">👁️ Live Invitation Preview</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                  {currentGuest.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(shareableUrl, '_blank')}
                  className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs font-semibold"
                >
                  Open in New Tab ↗
                </button>
                <button
                  onClick={() => setShowFullPreview(false)}
                  className="text-slate-400 hover:text-white text-lg p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              className={`p-6 overflow-y-auto flex-1 ${currentTheme.phoneBg} custom-scrollbar`}
              style={{ fontFamily: currentTheme.fontFamily }}
            >
              <div className="text-center pb-4">
                <p className={`text-xs font-bold tracking-widest ${currentTheme.headerAccent}`}>
                  {godBlessing}
                </p>
                <h3 className={`text-3xl font-bold mt-2 ${currentTheme.titleColor}`}>
                  {groomName} & {brideName}
                </h3>
                <p className={`text-xs mt-1 ${currentTheme.subtextColor}`}>
                  Request the honour of your presence at their wedding
                </p>
              </div>

              {/* Salutation Card */}
              <div className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-4 my-4`}>
                <p className={`text-xs font-bold ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentGuest.salutation}
                </p>
              </div>

              {/* Events */}
              <div className="space-y-3 mt-4">
                {guestVisibleEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} p-3.5 text-left`}
                  >
                    <span className={`text-[10px] font-bold uppercase ${currentTheme.headerAccent}`}>
                      {ev.date} • {ev.time}
                    </span>
                    <h4 className={`text-sm font-bold mt-0.5 ${currentTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                      {ev.name}
                    </h4>
                    <p className={`text-xs mt-1 ${currentTheme.subtextColor}`}>🏛️ {ev.venue}</p>
                    <p className={`text-[11px] mt-0.5 opacity-70 ${currentTheme.subtextColor}`}>👗 {ev.dressCode}</p>
                  </div>
                ))}
              </div>

              {/* Family */}
              <div className="mt-4 text-center text-xs opacity-80 pt-4 border-t border-black/5">
                <p className="font-bold">{groomParents} & {brideParents}</p>
                <p className="italic mt-1">"{hostBlessing}"</p>
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t flex justify-between items-center text-xs">
              <span className="text-slate-500">Live guest link: {shareableUrl}</span>
              <button
                onClick={() => setShowFullPreview(false)}
                className="rounded-full bg-[#123b5d] text-white px-4 py-1.5 font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE / PUBLISH MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900">
                🚀 Publish & Share Invitation
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-800 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900">
                <p className="font-bold">✓ 100% Free Lifetime Host Access</p>
                <p className="text-[11px] mt-0.5">
                  Your invitation is live and ready for all guests. No fees, no limits, no watermarks.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Active Guest Link for {currentGuest.name}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-slate-800"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareableUrl);
                      toast.success('Link copied to clipboard!');
                    }}
                    className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={sendWhatsApp}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700"
                >
                  <span>💬</span> WhatsApp Broadcast
                </button>
                <button
                  onClick={() => window.open(shareableUrl, '_blank')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 font-bold text-slate-800 hover:bg-slate-50"
                >
                  <span>↗</span> Open Live Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD GUEST MODAL */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddGuest}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-sky-100"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">Add New Guest</h3>
              <button
                type="button"
                onClick={() => setShowAddGuestModal(false)}
                className="text-slate-400 hover:text-slate-800 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guest / Family Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shah Family"
                  value={newGuestData.name}
                  onChange={(e) => setNewGuestData({ ...newGuestData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passes / Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newGuestData.passes}
                    onChange={(e) =>
                      setNewGuestData({ ...newGuestData, passes: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765..."
                    value={newGuestData.phone}
                    onChange={(e) =>
                      setNewGuestData({ ...newGuestData, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-[#123b5d] py-2.5 font-bold text-white shadow hover:bg-sky-800 transition"
              >
                Save & Generate Personalized Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
