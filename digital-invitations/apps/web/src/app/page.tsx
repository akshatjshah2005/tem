'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface FunctionCard {
  id: string;
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  gradient: string;
  bgPattern: string;
  icon: string;
  tagline: string;
  previewDate: string;
  features: string[];
  templateId: string;
}

// 5 Trendy Motion / Video Cards for Home Page Showcase
const TRENDY_MOTION_CARDS = [
  {
    id: 'motion-haldi',
    title: 'Haldi Marigold & Brass Urli',
    subtitle: 'Canva & Pinterest Viral ⭐',
    category: 'Haldi Ceremony',
    tag: 'TRENDING #1',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-950',
    icon: '🌼',
    vibe: 'Floating yellow marigold petals & sacred turmeric paste ceremony with brass urli centerpiece.',
    templateId: 'haldi-marigold-urli',
    videoBadge: 'MOTION 4K · MUSIC SYNCED',
  },
  {
    id: 'motion-sangeet',
    title: 'Sangeet Peacock & Bollywood Glam',
    subtitle: 'Musical Beats & Dance Floor',
    category: 'Sangeet Night',
    tag: 'MOST POPULAR',
    gradient: 'from-teal-600 via-cyan-600 to-blue-700',
    borderColor: 'border-teal-300',
    textColor: 'text-teal-950',
    icon: '🪕',
    vibe: 'Pulsing equalizer waves, peacock feather glow, and live dance playlist integration.',
    templateId: 'sangeet-peacock-glam',
    videoBadge: 'AUDIO EQUALIZER · LIVE RSVP',
  },
  {
    id: 'motion-kankotri',
    title: 'Kankotri & Ganesh Vandana',
    subtitle: 'Sacred Gujarati / Hindi Patrika',
    category: 'Kankotri & Sthapna',
    tag: 'AUSPICIOUS TRADITION',
    gradient: 'from-red-600 via-rose-600 to-amber-700',
    borderColor: 'border-rose-300',
    textColor: 'text-rose-950',
    icon: '🪔',
    vibe: 'Lord Ganesha sacred blessings, glowing deepam flames, and traditional Shubh Muhurat wording.',
    templateId: 'kankotri-ganesh-vandana',
    videoBadge: 'VEDIC CHANTS · SHUBH MUHURAT',
  },
  {
    id: 'motion-vivah',
    title: 'Royal Mandap & Sacred Pheras',
    subtitle: 'Heritage Rajputana & Mughal Vivah',
    category: 'The Big Day (Vivah)',
    tag: 'ROYAL HERITAGE',
    gradient: 'from-amber-700 via-red-700 to-rose-900',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-950',
    icon: '💍',
    vibe: 'Golden glitter dust, Varanasi red silk zari borders, and live ticking countdown to Muhurtham.',
    templateId: 'royal-sandalwood',
    videoBadge: 'LIVE COUNTDOWN · MAP PINS',
  },
  {
    id: 'motion-love-story',
    title: 'Secret Passcode Love Story',
    subtitle: 'Anniversary Surprise Timeline',
    category: 'Love Story Experience',
    tag: 'VIRAL ON TIKTOK & REELS',
    gradient: 'from-pink-500 via-rose-500 to-purple-600',
    borderColor: 'border-pink-300',
    textColor: 'text-pink-950',
    icon: '💌',
    vibe: 'Private romantic journey locked behind a secret 4-digit passcode with polaroid milestone cards.',
    templateId: 'love-story-polaroid',
    videoBadge: 'PASSCODE VAULT · POLAROIDS',
  },
];

// Indian Wedding Functions Categories
const FUNCTION_CATEGORIES = [
  { id: 'haldi', name: 'Haldi Ceremony', icon: '🌼', count: '10 Themes' },
  { id: 'sangeet', name: 'Sangeet & Musical Night', icon: '🪕', count: '10 Themes' },
  { id: 'kankotri', name: 'Kankotri & Ganesh Sthapna', icon: '🪔', count: '10 Themes' },
  { id: 'mehendi', name: 'Mehendi & Henna', icon: '🌺', count: '10 Themes' },
  { id: 'vivah', name: 'Marriage Card (The Big Day)', icon: '💍', count: '10 Themes' },
  { id: 'reception', name: 'Royal Reception', icon: '🥂', count: '10 Themes' },
  { id: 'save-the-date', name: 'Save the Date', icon: '📅', count: '10 Themes' },
  { id: 'love-story', name: 'Love Story (Passcode)', icon: '💌', count: '10 Themes' },
  { id: 'common-any', name: 'Any Event (Universal)', icon: '✨', count: '10 Themes' },
];

// 10 Pinterest & Canva Inspired Cards for HALDI (matching https://in.pinterest.com/pin/971440582156120128/)
const HALDI_CARDS: FunctionCard[] = [
  {
    id: 'haldi-1',
    name: 'Marigold Sunshine & Brass Urli',
    category: 'haldi',
    badge: 'Pinterest Viral ⭐',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    gradient: 'from-[#fff9db] via-[#fff3bf] to-[#ffe066]',
    bgPattern: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200',
    icon: '🌼',
    tagline: 'Genda Phool Garland Border with Handcrafted Brass Water Urli',
    previewDate: '13 FEB 2026 · 10:00 AM',
    features: ['Floating Petals Animation', 'Yellow Silk Dress Code', 'Brass Urli Centerpiece'],
    templateId: 'haldi-marigold-urli',
  },
  {
    id: 'haldi-2',
    name: 'Royal Rajputana Genda Phool',
    category: 'haldi',
    badge: 'Canva Trending',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    gradient: 'from-[#fff4e6] via-[#ffe8cc] to-[#ffd8a8]',
    bgPattern: 'bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100',
    icon: '☀️',
    tagline: 'Mewar Palace Arches with Cascading Vibrant Orange Flowers',
    previewDate: '13 FEB 2026 · 11:30 AM',
    features: ['Royal Arch Framing', 'Family Blessings', 'Live Venue Map Pin'],
    templateId: 'haldi-marigold-urli',
  },
  {
    id: 'haldi-3',
    name: 'Turmeric Bliss & Floral Rain',
    category: 'haldi',
    badge: 'Modern Aesthetic',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    gradient: 'from-[#fefce8] via-[#fef9c3] to-[#fef08a]',
    bgPattern: 'bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100',
    icon: '✨',
    tagline: 'Pastel Mustard Drapes with Pink Rose Petals & Golden Sunburst',
    previewDate: '12 FEB 2026 · 09:00 AM',
    features: ['Minimalist Editorial Font', 'Interactive RSVP', 'Music Player'],
    templateId: 'haldi-marigold-urli',
  },
  {
    id: 'haldi-4',
    name: 'Traditional Brass Thal & Kolam',
    category: 'haldi',
    badge: 'Vedic Tradition',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    gradient: 'from-[#fdf8ee] via-[#fdf0d5] to-[#fce4b8]',
    bgPattern: 'bg-gradient-to-br from-amber-100 via-stone-50 to-amber-200',
    icon: '🪔',
    tagline: 'South Indian Banana Leaf & Sacred Rice Kolam Border',
    previewDate: '13 FEB 2026 · 08:30 AM',
    features: ['Kolam Flourishes', 'Muhurtham Ticking Clock', 'Tamil/Telugu Support'],
    templateId: 'south-indian-traditional',
  },
  {
    id: 'haldi-5',
    name: 'Modern Boho Ochre & Sunflowers',
    category: 'haldi',
    badge: 'Pinterest Aesthetic',
    badgeColor: 'bg-stone-100 text-stone-900 border-stone-300',
    gradient: 'from-[#fef3c7] via-[#fde68a] to-[#fcd34d]',
    bgPattern: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-stone-100',
    icon: '🌻',
    tagline: 'Warm Terracotta Arches with Dried Pampas Grass & Sunflower Bunches',
    previewDate: '14 FEB 2026 · 10:30 AM',
    features: ['Boho Chic Palette', 'Photo Gallery Grid', 'WhatsApp Sharing'],
    templateId: 'haldi-marigold-urli',
  },
  {
    id: 'haldi-6',
    name: 'Pichwai Lotus & Cow Haldi Card',
    category: 'haldi',
    badge: 'Heritage Art',
    badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    gradient: 'from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]',
    bgPattern: 'bg-gradient-to-br from-emerald-50 via-amber-50 to-yellow-100',
    icon: '🪷',
    tagline: 'Nathdwara Holy Pichwai Hand-painted Lotus & Genda Phool Bells',
    previewDate: '13 FEB 2026 · 11:00 AM',
    features: ['Traditional Pichwai Art', 'Sacred Shlokas', 'Guest Salutation'],
    templateId: 'emerald-heritage',
  },
  {
    id: 'haldi-7',
    name: 'Poolside Vibrant Haldi Fest',
    category: 'haldi',
    badge: 'Destination Wedding',
    badgeColor: 'bg-sky-100 text-sky-950 border-sky-300',
    gradient: 'from-[#e0f2fe] via-[#bae6fd] to-[#fef08a]',
    bgPattern: 'bg-gradient-to-br from-sky-100 via-amber-50 to-cyan-100',
    icon: '🏊‍♂️',
    tagline: 'Crisp Cyan Pool Reflection with Bright Yellow Sunglasses & Dhol Beats',
    previewDate: '13 FEB 2026 · 12:00 PM',
    features: ['Pool Party Dress Code', 'Live DJ Playlist', 'Google Maps Sync'],
    templateId: 'haldi-marigold-urli',
  },
  {
    id: 'haldi-8',
    name: 'Minimalist Gold Dust & Turmeric',
    category: 'haldi',
    badge: 'Clean & Elegant',
    badgeColor: 'bg-amber-50 text-amber-950 border-amber-200',
    gradient: 'from-[#fffdf7] via-[#fef9ec] to-[#fdf2d6]',
    bgPattern: 'bg-gradient-to-br from-white via-amber-50 to-yellow-50',
    icon: '🪙',
    tagline: 'Cream Textured Paper with Fine Gold Foil Lines & Delicate Flowers',
    previewDate: '13 FEB 2026 · 09:30 AM',
    features: ['Editorial Serif Typography', 'One-Click RSVP', 'Zero Clutter'],
    templateId: 'minimal-zen',
  },
  {
    id: 'haldi-9',
    name: 'Heritage Haveli Saffron Elegance',
    category: 'haldi',
    badge: 'Vintage Palace',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    gradient: 'from-[#fef3c7] via-[#fde68a] to-[#d97706]',
    bgPattern: 'bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200',
    icon: '🏰',
    tagline: 'Carved Sandstone Jharokhas with Glowing Hanging Lanterns',
    previewDate: '13 FEB 2026 · 10:00 AM',
    features: ['Heritage Architecture', 'Parent Blessings', 'Multi-Ceremony Flow'],
    templateId: 'royal-sandalwood',
  },
  {
    id: 'haldi-10',
    name: 'Rangoli Velvet & Haldi Mandap',
    category: 'haldi',
    badge: 'Most Luxurious',
    badgeColor: 'bg-rose-100 text-rose-950 border-rose-300',
    gradient: 'from-[#fff1f2] via-[#fee2e2] to-[#fef08a]',
    bgPattern: 'bg-gradient-to-br from-rose-50 via-yellow-50 to-amber-100',
    icon: '🌺',
    tagline: 'Geometric Floral Rangoli with Plush Velvet Yellow Seating',
    previewDate: '13 FEB 2026 · 11:00 AM',
    features: ['Velvet Floral Theme', 'Pass Allocation', 'WhatsApp Drafts'],
    templateId: 'haldi-marigold-urli',
  },
];

// Cards for SANGEET, KANKOTRI, VIVAH & ANY EVENT
const OTHER_CARDS: Record<string, FunctionCard[]> = {
  sangeet: [
    {
      id: 'sangeet-1',
      name: 'Peacock Glam & Dholak Beats',
      category: 'sangeet',
      badge: 'Bestseller',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
      gradient: 'from-teal-100 via-cyan-50 to-blue-100',
      bgPattern: 'bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-950',
      icon: '🪕',
      tagline: 'Royal Peacock Teal with Disco Lights & High Energy Bollywood Beats',
      previewDate: '13 FEB 2026 · 07:00 PM',
      features: ['Live Sound Wave', 'Cocktail Dress Code', 'RSVP Pass Counter'],
      templateId: 'sangeet-peacock-glam',
    },
    {
      id: 'sangeet-2',
      name: 'Midnight Neon Bollywood Bash',
      category: 'sangeet',
      badge: 'Modern Club',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      gradient: 'from-purple-100 via-indigo-50 to-pink-100',
      bgPattern: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950',
      icon: '🪩',
      tagline: 'Neon Glow Tubes with VIP Table Allocation and Live Spotify Embed',
      previewDate: '13 FEB 2026 · 08:30 PM',
      features: ['Spotify Integration', 'Night Mode First', 'Bar Menu Preview'],
      templateId: 'midnight-sapphire',
    },
    {
      id: 'sangeet-3',
      name: 'Ghazal & Sufi Musical Soiree',
      category: 'sangeet',
      badge: 'Royal & Poetic',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      gradient: 'from-amber-100 via-yellow-50 to-stone-100',
      bgPattern: 'bg-gradient-to-br from-[#1c1209] via-[#2d1b0e] to-[#0f0a05]',
      icon: '🎻',
      tagline: 'Intricate Mughal Jalis with Candlelit Ambience & Classical Strings',
      previewDate: '13 FEB 2026 · 06:30 PM',
      features: ['Urdu/Hindi Shayari', 'Acoustic Shenhai Track', 'VIP Seating'],
      templateId: 'royal-sandalwood',
    },
  ],
  kankotri: [
    {
      id: 'kankotri-1',
      name: 'Shree Ganesh Sthapna Gujarati Patrika',
      category: 'kankotri',
      badge: 'Most Auspicious',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      gradient: 'from-red-100 via-orange-50 to-amber-100',
      bgPattern: 'bg-gradient-to-br from-[#7f1d1d] via-[#991b1b] to-[#450a0a]',
      icon: '🪔',
      tagline: 'Traditional Swastik, Kalash & Shubh Muhurat Sanskrit Stotras',
      previewDate: '11 FEB 2026 · 09:15 AM',
      features: ['Lord Ganesha Vandana', 'Gujarati/Hindi Text', 'Kundali Muhurat'],
      templateId: 'kankotri-ganesh-vandana',
    },
    {
      id: 'kankotri-2',
      name: 'Royal Rajasthani Sandalwood Kankotri',
      category: 'kankotri',
      badge: 'Palace Classic',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      gradient: 'from-amber-100 via-yellow-50 to-orange-100',
      bgPattern: 'bg-gradient-to-br from-[#451a03] via-[#78350f] to-[#291003]',
      icon: '🐘',
      tagline: 'Royal Elephants with Gold Zari & Auspicious Lagna Patrika Format',
      previewDate: '12 FEB 2026 · 10:00 AM',
      features: ['Gold Leaf Emboss', 'Family Tree List', 'Instant WhatsApp Share'],
      templateId: 'royal-sandalwood',
    },
  ],
  'common-any': [
    {
      id: 'any-1',
      name: 'Universal Celebration & Milestone Gala',
      category: 'common-any',
      badge: 'Any Event Ready',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      gradient: 'from-sky-100 via-indigo-50 to-slate-100',
      bgPattern: 'bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950',
      icon: '✨',
      tagline: 'Perfect for Birthdays, Anniversaries, Griha Pravesh & Corporate Dinners',
      previewDate: 'ANY DATE · TIME CUSTOMIZABLE',
      features: ['Editable Category & Title', 'Custom Schedule Builder', 'Guest QR Passes'],
      templateId: 'minimal-zen',
    },
    {
      id: 'any-2',
      name: 'Griha Pravesh & Housewarming Blessings',
      category: 'common-any',
      badge: 'New Beginnings',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
      gradient: 'from-teal-100 via-emerald-50 to-amber-100',
      bgPattern: 'bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22]',
      icon: '🏡',
      tagline: 'Vastu Shanti Puja, Holy Havan & Welcome Dinner for Friends and Family',
      previewDate: 'AUSPICIOUS MUHURAT',
      features: ['Google Maps Pin', 'Puja Timings', 'RSVP Headcount'],
      templateId: 'emerald-heritage',
    },
  ],
};

export default function HomePage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('haldi');
  const [templatesDropdownOpen, setTemplatesDropdownOpen] = useState<boolean>(false);
  const [previewCard, setPreviewCard] = useState<FunctionCard | null>(null);

  // Cards to display according to the active category
  const activeCards: FunctionCard[] =
    activeCategory === 'haldi'
      ? HALDI_CARDS
      : OTHER_CARDS[activeCategory] || HALDI_CARDS.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f8fbff] text-[#142b45] selection:bg-sky-100 selection:text-sky-900">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(190,227,255,0.45),transparent_70%)]" />

      {/* 1. Header with Dropdown matching Screenshot 5 */}
      <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 font-bold text-white shadow-md shadow-sky-200">
              u
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                uptemp<span className="text-sky-600">.</span>
              </span>
              <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-slate-400 mt-0.5">
                Digital Invites · 100% Free Forever
              </span>
            </div>
          </Link>

          {/* Navigation Links with Templates Dropdown (Exact Screenshot 5 design!) */}
          <nav className="hidden items-center gap-7 text-[14px] font-medium text-slate-700 md:flex">
            <Link href="/" className="font-bold text-sky-700 transition">
              Home
            </Link>

            {/* Interactive Templates Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setTemplatesDropdownOpen(true)}
              onMouseLeave={() => setTemplatesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setTemplatesDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-sky-50 transition text-slate-700 font-semibold"
              >
                <span>Templates</span>
                <span className="text-xs transition-transform duration-200">
                  {templatesDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Dropdown Menu Container (Matching Screenshot 5 & Direct Customization) */}
              {templatesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-84 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="space-y-1.5">
                    {/* 1. Wedding Invitations */}
                    <Link
                      href="/create?template=royal-sandalwood&category=wedding"
                      className="flex items-start gap-3 rounded-2xl p-2.5 hover:bg-rose-50/80 transition group"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 text-base group-hover:scale-105 transition">
                        💖
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition">
                          Wedding invitations
                        </p>
                        <p className="text-xs text-slate-500 leading-snug">
                          Animated invites with RSVP, maps and live stream
                        </p>
                      </div>
                    </Link>

                    {/* 2. Save the Date */}
                    <Link
                      href="/create?template=minimal-zen&category=save-the-date"
                      className="flex items-start gap-3 rounded-2xl p-2.5 hover:bg-pink-50/80 transition group"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600 text-base group-hover:scale-105 transition">
                        📅
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-pink-700 transition">
                          Save the Date
                        </p>
                        <p className="text-xs text-slate-500 leading-snug">
                          One screen: names, date and a countdown
                        </p>
                      </div>
                    </Link>

                    {/* 3. Love Story */}
                    <Link
                      href="/create?template=love-story-polaroid&category=love-story"
                      className="flex items-start gap-3 rounded-2xl p-2.5 hover:bg-rose-50/80 transition group"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 text-base group-hover:scale-105 transition">
                        💌
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition">
                          Love Story
                        </p>
                        <p className="text-xs text-slate-500 leading-snug">
                          An anniversary surprise behind a passcode
                        </p>
                      </div>
                    </Link>

                    {/* 4. Diwali Greetings */}
                    <Link
                      href="/create?template=kankotri-ganesh-vandana&category=festivals"
                      className="flex items-start gap-3 rounded-2xl p-2.5 hover:bg-amber-50/80 transition group"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 text-base group-hover:scale-105 transition">
                        🪔
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition">
                          Diwali greetings
                        </p>
                        <p className="text-xs text-slate-500 leading-snug">
                          Crackers, rangoli and sky lanterns
                        </p>
                      </div>
                    </Link>

                    {/* 5. Christmas Cards */}
                    <Link
                      href="/create?template=emerald-heritage&category=festivals"
                      className="flex items-start gap-3 rounded-2xl p-2.5 hover:bg-emerald-50/80 transition group"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-base group-hover:scale-105 transition">
                        🎄
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition">
                          Christmas cards
                        </p>
                        <p className="text-xs text-slate-500 leading-snug">
                          Santa's sleigh, snow globe, tree of lights
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Divider and See all templates -> Direct customization */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <Link
                      href="/create?template=royal-sandalwood"
                      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <span>🔲</span>
                      <span>See all templates & customize</span>
                      <span className="ml-auto text-slate-400">→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/love-story" className="transition hover:text-slate-900">
              Love Story
            </Link>
            <a href="#indian-functions" className="transition hover:text-slate-900">
              Indian Functions
            </a>
            <a href="#how-it-works" className="transition hover:text-slate-900">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-full border border-sky-200 bg-sky-50/70 px-4 py-2 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
              >
                Dashboard ({user.name.split(' ')[0]})
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-sky-700"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/create?template=royal-sandalwood"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition hover:-translate-y-0.5 hover:from-sky-700 hover:to-blue-700"
            >
              Create Invitation (Free) →
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative mx-auto max-w-7xl px-5 pt-12 pb-16 sm:px-8 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Free Forever · No Paywalls · No Watermarks
            </div>

            <h1 className="font-serif text-5xl font-bold leading-[1.08] tracking-[-0.03em] text-[#123b5d] sm:text-6xl lg:text-[66px]">
              Beautiful invitations.
              <br />
              <span className="font-serif italic font-normal text-sky-600">
                Unforgettable
              </span>{' '}
              celebrations.
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 max-w-xl">
              Create breathtaking digital invitations for all Indian wedding functions — Haldi, Sangeet, Kankotri, and the Holy Muhurtham. Completely customizable, interactive RSVP, and WhatsApp instant sharing.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/create?template=haldi-marigold-urli"
                className="inline-flex items-center gap-2 rounded-full bg-[#123b5d] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-sky-950/20 transition hover:-translate-y-0.5 hover:bg-sky-800"
              >
                <span>Start with Haldi Theme</span>
                <span>→</span>
              </Link>
              <a
                href="#indian-functions"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Explore Indian Functions</span>
                <span>▾</span>
              </a>
            </div>

            {/* Highlights row */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> Separate Function Flow
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> 10+ Canva & Pinterest Themes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> 100% Free For Everyone
              </span>
            </div>
          </div>

          {/* Hero Double Phone / Card Visual Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[360px] rounded-[48px] border-[10px] border-slate-900 bg-slate-900 shadow-2xl p-1 overflow-hidden">
              <div className="h-6 flex items-center justify-between px-6 bg-amber-50">
                <span className="text-[10px] font-bold text-slate-800">9:41</span>
                <div className="h-3.5 w-16 rounded-full bg-black" />
                <span className="text-[9px] font-bold text-slate-800">100%</span>
              </div>
              <div className="bg-gradient-to-b from-[#fffbeb] via-[#fffdf5] to-[#fef9c3] p-5 text-center font-serif">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
                  ॥ श्री गणेशाय नमः ॥
                </span>
                <div className="my-3 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 border-2 border-amber-300 text-3xl shadow-sm">
                  🌼
                </div>
                <h3 className="text-2xl font-bold text-amber-950">
                  Akshat & Priya
                </h3>
                <p className="text-xs text-amber-900/80 mt-1">
                  Joyfully invite you to the auspicious Haldi Ceremony
                </p>
                <div className="my-3 mx-auto h-px w-16 bg-amber-300" />
                <div className="rounded-xl border border-amber-200 bg-white/90 p-3 shadow-sm text-left font-sans">
                  <p className="text-[10px] font-bold text-amber-900 uppercase">
                    💛 Haldi & Phoolon Ki Holi
                  </p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    13 Feb 2026 · 10:30 AM
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    🏛️ Grand Courtyard & Poolside
                  </p>
                </div>
                <div className="mt-3 flex justify-center gap-2 font-sans">
                  <span className="rounded-full bg-amber-200/80 px-3 py-1 text-[10px] font-bold text-amber-950">
                    👗 Dress Code: Haldi Yellow
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-950">
                    ✓ RSVP Attending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 5 Minimum Trendy Motion / Video Cards Showcase */}
      <section className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 border-t border-sky-100">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-2">
              <span>🔥</span> 5 Trendy Video & Motion Cards
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#123b5d]">
              Live Motion Previews for Every Function
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Interactive motion cards with sound sync, countdowns, and mobile-first animations.
            </p>
          </div>
          <Link
            href="/templates"
            className="text-xs font-bold text-sky-700 hover:text-sky-900 transition flex items-center gap-1"
          >
            See All Video Cards →
          </Link>
        </div>

        {/* The 5 Trendy Video Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {TRENDY_MOTION_CARDS.map((card) => (
            <div
              key={card.id}
              className={`group relative flex flex-col justify-between rounded-3xl border ${card.borderColor} bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div>
                {/* Visual Header Canvas */}
                <div
                  className={`aspect-[4/5] w-full rounded-2xl bg-gradient-to-br ${card.gradient} p-4 flex flex-col justify-between text-white shadow-inner relative overflow-hidden`}
                >
                  {/* Floating particle sparkle */}
                  <div className="absolute top-2 right-2 text-xs opacity-90 animate-pulse">
                    ✨
                  </div>

                  <div>
                    <span className="inline-block rounded-full bg-black/30 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                      {card.tag}
                    </span>
                  </div>

                  <div className="text-center my-auto">
                    <span className="text-4xl filter drop-shadow">{card.icon}</span>
                    <h3 className="font-serif text-lg font-bold mt-2 leading-tight drop-shadow-sm">
                      {card.title}
                    </h3>
                    <p className="text-[10px] opacity-90 mt-1 tracking-wide uppercase">
                      {card.category}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/40 backdrop-blur-md px-2.5 py-1 text-center text-[8.5px] font-bold tracking-wider uppercase">
                    {card.videoBadge}
                  </div>
                </div>

                {/* Details */}
                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {card.vibe}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/create?template=${card.templateId}`}
                  className="w-full rounded-full bg-[#123b5d] py-2 text-center text-xs font-bold text-white transition hover:bg-sky-800"
                >
                  Customize Now ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Indian Wedding Functions Flow & 10 Pinterest/Canva Cards per Category */}
      <section id="indian-functions" className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 border-t border-sky-100">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="rounded-full bg-sky-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-800">
            All Functions Handcrafted Separately
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#123b5d] mt-3">
            Indian Wedding & Celebration Functions
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Select any ceremony to discover 10 dedicated Pinterest & Canva inspired website cards designed specifically for that occasion.
          </p>
        </div>

        {/* Function Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {FUNCTION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#123b5d] text-white shadow-md shadow-sky-950/20 scale-105'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Category Header Banner */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {FUNCTION_CATEGORIES.find((c) => c.id === activeCategory)?.icon || '🌼'}
            </span>
            <div>
              <h3 className="font-serif text-xl font-bold text-amber-950">
                {FUNCTION_CATEGORIES.find((c) => c.id === activeCategory)?.name} Collection
              </h3>
              <p className="text-xs text-amber-900/80">
                Showing 10 Pinterest/Canva inspired card designs · Click any theme to customize instantly in the Studio Editor.
              </p>
            </div>
          </div>

          <Link
            href={`/create?category=${activeCategory}`}
            className="mt-3 sm:mt-0 rounded-full bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 transition"
          >
            Create in Studio Editor →
          </Link>
        </div>

        {/* 10 Website Cards Grid for Selected Category (Haldi Pinterest matching) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeCards.map((card, idx) => (
            <div
              key={card.id}
              className="group flex flex-col justify-between rounded-3xl border border-amber-200/90 bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            >
              <div>
                {/* Visual Canvas matching Pinterest Pin */}
                <div
                  className={`relative aspect-[4/3] w-full rounded-2xl ${card.bgPattern} p-4 flex flex-col justify-between border border-amber-200/60 overflow-hidden shadow-inner`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                    <span className="text-xs text-amber-700 font-mono font-bold">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="text-center my-auto">
                    <span className="text-3xl">{card.icon}</span>
                    <h4 className="font-serif text-base font-bold text-slate-900 mt-1 leading-snug">
                      {card.name}
                    </h4>
                    <p className="text-[10px] font-bold text-amber-800 tracking-wider uppercase mt-1">
                      {card.previewDate}
                    </p>
                  </div>

                  <div className="text-center">
                    <span className="inline-block rounded-full bg-white/80 px-2 py-0.5 text-[8.5px] font-bold text-slate-700 shadow-sm">
                      100% Free Forever
                    </span>
                  </div>
                </div>

                {/* Details & Features */}
                <div className="mt-3.5 space-y-2">
                  <p className="text-xs text-slate-600 italic">
                    "{card.tagline}"
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {card.features.map((feat) => (
                      <span
                        key={feat}
                        className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-100"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewCard(card)}
                  className="flex-1 rounded-full border border-slate-200 bg-white py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Quick View
                </button>
                <Link
                  href={`/create?template=${card.templateId}&category=${card.category}`}
                  className="flex-1 rounded-full bg-[#123b5d] py-2 text-center text-xs font-bold text-white hover:bg-sky-800 transition"
                >
                  Customize ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Common Template Option for ANY Event */}
      <section className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider">
              ✨ Universal Invitation Builder
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold mt-3">
              Need a Template for Any Other Occasion?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-sky-100 leading-relaxed">
              Whether it is an 80th Birthday, Silver Jubilee Anniversary, Griha Pravesh, Baby Shower, or Corporate Gala — create a custom invitation with your own agenda, map, and RSVP.
            </p>
          </div>

          <Link
            href="/create?template=minimal-zen&category=common-any"
            className="rounded-full bg-white px-7 py-3.5 text-xs font-bold text-[#123b5d] shadow-lg hover:bg-sky-50 transition shrink-0"
          >
            Create Any Event Free →
          </Link>
        </div>
      </section>

      {/* 6. Quick Preview Modal */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setPreviewCard(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              ✕
            </button>

            <span className="text-3xl">{previewCard.icon}</span>
            <h3 className="font-serif text-2xl font-bold text-slate-900 mt-2">
              {previewCard.name}
            </h3>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-0.5">
              {previewCard.badge} · {previewCard.previewDate}
            </p>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {previewCard.tagline}. Designed specifically for Indian celebrations with authentic aesthetics, personalized guest salutations, and live WhatsApp sharing.
            </p>

            <div className="mt-4 rounded-xl bg-amber-50 p-3 border border-amber-200">
              <p className="text-xs font-bold text-amber-950">Included Features:</p>
              <ul className="mt-1 space-y-1 text-xs text-amber-900">
                {previewCard.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPreviewCard(null)}
                className="flex-1 rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close Preview
              </button>
              <Link
                href={`/create?template=${previewCard.templateId}&category=${previewCard.category}`}
                className="flex-1 rounded-full bg-[#123b5d] py-2.5 text-center text-xs font-bold text-white hover:bg-sky-800 shadow"
              >
                Customize This Theme →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-sky-100 bg-white py-10 mt-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 text-xs text-slate-500 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-600 font-bold text-white text-[10px]">
              u
            </span>
            <span className="font-bold text-slate-800">uptemp.</span>
            <span className="text-slate-400">· Digital invitations for every Indian celebration. 100% Free Forever.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-slate-600">
            <Link href="/create?template=haldi-marigold-urli" className="hover:text-sky-700">
              Start Free
            </Link>
            <Link href="/love-story" className="hover:text-sky-700">
              Love Story
            </Link>
            <Link href="/templates" className="hover:text-sky-700">
              Templates
            </Link>
            <Link href="/dashboard" className="hover:text-sky-700">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-sky-700">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
