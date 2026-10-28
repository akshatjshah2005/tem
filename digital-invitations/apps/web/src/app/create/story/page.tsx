'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface MilestoneChapter {
  id: string;
  year: string;
  title: string;
  date: string;
  location: string;
  note: string;
  tag: string;
  icon: string;
  gradient: string;
}

const DEFAULT_CHAPTERS: MilestoneChapter[] = [
  {
    id: 'ch-1',
    year: '2021',
    title: 'Where It All Began',
    date: 'OCTOBER 14, 2021',
    location: 'Cafe Roastery, Ahmedabad',
    note: 'A quiet rainy evening, two warm cups of cappuccino, and a conversation that stretched into four magical hours.',
    tag: 'THE FIRST MEETING',
    icon: '☕',
    gradient: 'from-amber-500 via-orange-600 to-amber-700',
  },
  {
    id: 'ch-2',
    year: '2022',
    title: 'The First Spontaneous Getaway',
    date: 'JUNE 22, 2022',
    location: 'Udaipur Lake Pichola',
    note: 'Watching the royal sun dip behind the Aravali hills. We silently realized life was infinitely brighter side by side.',
    tag: 'FALLING IN LOVE',
    icon: '⛵',
    gradient: 'from-blue-600 via-sky-600 to-teal-500',
  },
  {
    id: 'ch-3',
    year: '2024',
    title: 'The Starry Night Proposal',
    date: 'DECEMBER 05, 2024',
    location: 'Jaipur Heritage Fort Dunes',
    note: 'Surrounded by hundreds of glowing earthen diyas, Akshat got down on one knee. Priya wept happy tears and said YES!',
    tag: 'SHE SAID YES! 💍',
    icon: '✨',
    gradient: 'from-rose-500 via-pink-600 to-rose-700',
  },
  {
    id: 'ch-4',
    year: '2025',
    title: 'Two Families, One Heart',
    date: 'MARCH 18, 2025',
    location: 'Sharma & Verma Courtyard',
    note: 'Over traditional mithai and dholak beats, both families united with auspicious blessings for our upcoming vivah.',
    tag: 'ROKA & BLESSINGS',
    icon: '🪔',
    gradient: 'from-amber-600 via-yellow-600 to-orange-700',
  },
  {
    id: 'ch-5',
    year: '2026',
    title: 'The Sacred Pheras & Forever',
    date: 'FEBRUARY 14, 2026',
    location: 'The Grand Palace, Ahmedabad',
    note: 'Seven sacred vows around the holy agni, beginning our greatest adventure together as husband and wife.',
    tag: 'THE AUSPICIOUS MUHURTHAM',
    icon: '🕊️',
    gradient: 'from-red-600 via-rose-700 to-amber-700',
  },
];

export default function CreateLoveStoryPage() {
  const [partner1, setPartner1] = useState('Akshat');
  const [partner2, setPartner2] = useState('Priya');
  const [passcode, setPasscode] = useState('2026');
  const [anniversaryDate, setAnniversaryDate] = useState('14 February 2026');
  const [chapters, setChapters] = useState<MilestoneChapter[]>(DEFAULT_CHAPTERS);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Phone Interactive Simulator State
  const [phoneEnteredCode, setPhoneEnteredCode] = useState('');
  const [phoneUnlocked, setPhoneUnlocked] = useState(false);
  const [phoneActiveChapter, setPhoneActiveChapter] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Audio ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleMusic = () => {
    if (isPlayingAudio) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setIsPlayingAudio(false);
      toast('Music paused', { icon: '⏸️' });
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
        }
      } catch {}
      setIsPlayingAudio(true);
      toast.success('♫ Romantic Love Melody Playing!');
    }
  };

  const handlePhoneKeyPress = (digit: string) => {
    if (phoneEnteredCode.length < 4) {
      const updated = phoneEnteredCode + digit;
      setPhoneEnteredCode(updated);
      if (updated === passcode) {
        setPhoneUnlocked(true);
        toast.success('✨ Secret Passcode Verified! Story Unlocked!');
      } else if (updated.length === 4) {
        toast.error(`Incorrect PIN. The secret passcode is: ${passcode}`);
        setTimeout(() => setPhoneEnteredCode(''), 600);
      }
    }
  };

  const handlePhoneBackspace = () => {
    setPhoneEnteredCode((prev) => prev.slice(0, -1));
  };

  const shareableUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/love-story?code=${passcode}`;
    }
    return `http://localhost:3000/love-story?code=${passcode}`;
  }, [passcode]);

  const whatsAppText = useMemo(() => {
    return `Hey! 💖 ${partner1} & ${partner2} created a secret interactive Love Story locked behind passcode [${passcode}]. Unlock our milestone memories here:\n${shareableUrl}`;
  }, [partner1, partner2, passcode, shareableUrl]);

  const copyWhatsApp = () => {
    navigator.clipboard.writeText(whatsAppText);
    toast.success('WhatsApp invitation text copied! 📋');
  };

  const sendWhatsApp = () => {
    const encoded = encodeURIComponent(whatsAppText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const addChapter = () => {
    const newCh: MilestoneChapter = {
      id: `ch-${Date.now()}`,
      year: '2025',
      title: 'Our Next Beautiful Memory',
      date: 'SEPTEMBER 2025',
      location: 'Our Favorite Spot',
      note: 'Another unforgettable chapter in our journey together filled with laughter, adventures, and endless love.',
      tag: 'NEW MILESTONE',
      icon: '💖',
      gradient: 'from-pink-500 via-rose-500 to-purple-600',
    };
    setChapters([...chapters, newCh]);
    setActiveChapterIndex(chapters.length);
    toast.success('New milestone chapter added!');
  };

  const updateActiveChapter = (key: keyof MilestoneChapter, value: string) => {
    setChapters((prev) =>
      prev.map((ch, idx) => (idx === activeChapterIndex ? { ...ch, [key]: value } : ch))
    );
  };

  return (
    <div className="flex h-screen flex-col bg-[#fff8fa] text-slate-800 antialiased overflow-hidden">
      {/* Top Navigation */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-rose-100 bg-white px-5 sm:px-8 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/love-story"
            className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/50 px-3.5 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition"
          >
            <span>←</span> Love Story
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">💌</span>
            <h1 className="font-serif text-lg font-bold text-slate-900">
              {partner1} & {partner2}'s Love Story Vault
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMusic}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition border ${
              isPlayingAudio
                ? 'bg-rose-100 border-rose-300 text-rose-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{isPlayingAudio ? '🔊' : '🔈'}</span>
            <span>{isPlayingAudio ? 'Melody Playing' : 'Play Music'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPhoneEnteredCode(passcode);
              setPhoneUnlocked(true);
              toast.success('1-Click Test Unlock Active in Phone!');
            }}
            className="rounded-full bg-rose-50 border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition"
          >
            ⚡ Test Unlock in Phone
          </button>

          <button
            type="button"
            onClick={sendWhatsApp}
            className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
          >
            Share Story →
          </button>
        </div>
      </header>

      {/* 3-Column Customization Studio */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Editing Workspace Panel */}
        <aside className="w-[380px] xl:w-[420px] shrink-0 border-r border-rose-100 bg-white overflow-y-auto p-5 z-10 custom-scrollbar space-y-5">
          <div>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-800">
              STORY CONFIGURATION
            </span>
            <h2 className="font-serif text-xl font-bold text-slate-900 mt-1">
              Couple & Passcode Details
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize couple names, secret vault PIN, and milestone memories.
            </p>
          </div>

          {/* Couple Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                PARTNER 1 NAME
              </label>
              <input
                type="text"
                value={partner1}
                onChange={(e) => setPartner1(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-rose-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                PARTNER 2 NAME
              </label>
              <input
                type="text"
                value={partner2}
                onChange={(e) => setPartner2(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-rose-400"
              />
            </div>
          </div>

          {/* Secret 4-Digit Passcode Input */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-rose-950 flex items-center gap-1.5">
                <span>🔒</span> SECRET 4-DIGIT PASSCODE
              </label>
              <span className="text-[9px] font-bold bg-white text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                Live Synced
              </span>
            </div>
            <input
              type="text"
              maxLength={4}
              value={passcode}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPasscode(clean);
                setPhoneEnteredCode('');
                setPhoneUnlocked(false);
              }}
              placeholder="2026"
              className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2.5 text-center font-mono text-xl font-bold tracking-[0.4em] text-rose-900 outline-none focus:ring-4 focus:ring-rose-100"
            />
            <p className="text-[10px] text-rose-800/80 mt-1.5 leading-snug">
              Guests must enter this 4-digit code in the phone screen to unlock your polaroid timeline.
            </p>
          </div>

          {/* Anniversary / Wedding Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              THE BIG DAY / ANNIVERSARY DATE
            </label>
            <input
              type="text"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-rose-400"
            />
          </div>

          {/* Chapters List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                MILESTONES TIMELINE ({chapters.length})
              </label>
              <button
                type="button"
                onClick={addChapter}
                className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition"
              >
                + Add Milestone
              </button>
            </div>

            {/* Chapter Pills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setActiveChapterIndex(idx);
                    setPhoneActiveChapter(idx);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${
                    activeChapterIndex === idx
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-rose-50'
                  }`}
                >
                  <span>{ch.icon}</span>
                  <span>{ch.year}</span>
                </button>
              ))}
            </div>

            {/* Active Chapter Details Form */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  MILESTONE TITLE
                </label>
                <input
                  type="text"
                  value={chapters[activeChapterIndex].title}
                  onChange={(e) => updateActiveChapter('title', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    YEAR / DATE
                  </label>
                  <input
                    type="text"
                    value={chapters[activeChapterIndex].date}
                    onChange={(e) => updateActiveChapter('date', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    LOCATION / CAFE
                  </label>
                  <input
                    type="text"
                    value={chapters[activeChapterIndex].location}
                    onChange={(e) => updateActiveChapter('location', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  ROMANTIC STORY NOTE
                </label>
                <textarea
                  rows={3}
                  value={chapters[activeChapterIndex].note}
                  onChange={(e) => updateActiveChapter('note', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-rose-400 font-serif leading-relaxed"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Center Canvas: Interactive Phone Mockup */}
        <main className="relative flex-1 overflow-y-auto bg-[#fbf3f5] bg-[radial-gradient(#f3d8df_1.2px,transparent_1.2px)] [background-size:22px_22px] p-6 lg:p-8 flex flex-col items-center custom-scrollbar">
          {/* Status Header Pill */}
          <div className="sticky top-2 z-20 mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/95 px-4 py-1.5 text-xs font-bold shadow-md shadow-rose-950/5 backdrop-blur text-rose-900">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Interactive Phone Simulator · Try Passcode: {passcode}</span>
          </div>

          {/* REALISTIC iPHONE MOCKUP */}
          <div className="relative w-[360px] sm:w-[380px] h-[750px] rounded-[52px] border-[10px] border-slate-900 bg-slate-900 shadow-[0_30px_80px_-20px_rgba(244,63,94,0.35)] ring-1 ring-slate-800 flex flex-col overflow-hidden shrink-0 my-2">
            {/* Status Bar with Dynamic Island */}
            <div className="shrink-0 flex items-center justify-between px-6 pt-3 pb-2 border-b border-black/5 select-none bg-gradient-to-b from-[#fff1f3] to-[#ffe4e8]">
              <span className="text-[11px] font-bold text-rose-950">9:41</span>
              <div className="h-5 w-24 rounded-full bg-black flex items-center justify-between px-2.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-slate-800" />
                <span className="h-1.5 w-1.5 rounded-full bg-rose-950" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-950">
                <span>5G</span>
                <span>● ● ▰</span>
              </div>
            </div>

            {/* Inner Phone Screen */}
            <div className="relative flex-1 overflow-y-auto bg-gradient-to-b from-[#fff1f3] via-[#fff5f7] to-[#fce7ed] custom-scrollbar flex flex-col justify-between p-6">
              {!phoneUnlocked ? (
                /* LOCKED PASSCODE SCREEN */
                <div className="flex flex-col items-center justify-center flex-1 my-auto text-center">
                  <div className="h-14 w-14 rounded-2xl bg-white/80 border border-rose-200 flex items-center justify-center text-2xl shadow-sm mb-3">
                    🔒
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    {partner1} & {partner2}
                  </h3>
                  <p className="text-xs text-rose-700 font-semibold mt-0.5">
                    Enter Secret Passcode to Unlock
                  </p>

                  {/* 4 PIN Dots */}
                  <div className="my-6 flex justify-center gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-4 w-4 rounded-full border-2 border-rose-400 transition-all ${
                          phoneEnteredCode.length > i ? 'bg-rose-600 scale-110 shadow-sm' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Interactive Keypad */}
                  <div className="grid grid-cols-3 gap-3 w-56 mx-auto mt-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, idx) => {
                      if (k === '') return <div key={idx} />;
                      if (k === '⌫') {
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={handlePhoneBackspace}
                            className="h-12 w-12 rounded-full bg-white/70 hover:bg-white text-slate-700 font-bold text-sm shadow-sm flex items-center justify-center mx-auto transition"
                          >
                            ⌫
                          </button>
                        );
                      }
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePhoneKeyPress(k)}
                          className="h-12 w-12 rounded-full bg-white/80 hover:bg-white text-rose-950 font-bold text-base shadow-sm flex items-center justify-center mx-auto transition active:scale-95"
                        >
                          {k}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-slate-500 mt-4">
                    Hint: Passcode is <strong>{passcode}</strong>
                  </p>
                </div>
              ) : (
                /* UNLOCKED POLAROID TIMELINE SCREEN */
                <div className="flex-1 overflow-y-auto space-y-4 pt-1 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-rose-600">
                        {anniversaryDate}
                      </span>
                      <h4 className="font-serif text-base font-bold text-slate-900">
                        {partner1} & {partner2}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneUnlocked(false);
                        setPhoneEnteredCode('');
                      }}
                      className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
                    >
                      🔒 Lock
                    </button>
                  </div>

                  {/* Polaroid Frame */}
                  <div className="rounded-2xl bg-white p-3.5 shadow-xl border border-rose-100 rotate-1 hover:rotate-0 transition duration-300 text-center">
                    <div
                      className={`aspect-[4/3] w-full rounded-xl bg-gradient-to-tr ${chapters[phoneActiveChapter].gradient} flex items-center justify-center text-white shadow-inner p-4`}
                    >
                      <div>
                        <span className="text-4xl">{chapters[phoneActiveChapter].icon}</span>
                        <p className="font-serif text-lg font-bold mt-1">
                          {chapters[phoneActiveChapter].year}
                        </p>
                        <p className="text-[9px] tracking-widest uppercase opacity-80">
                          {chapters[phoneActiveChapter].location}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 text-left">
                      <span className="text-[9px] font-bold text-rose-600 uppercase">
                        {chapters[phoneActiveChapter].tag}
                      </span>
                      <h5 className="font-serif text-sm font-bold text-slate-900">
                        {chapters[phoneActiveChapter].title}
                      </h5>
                      <p className="text-xs text-slate-600 mt-1 font-serif leading-relaxed">
                        {chapters[phoneActiveChapter].note}
                      </p>
                    </div>
                  </div>

                  {/* Chapter Navigation Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={phoneActiveChapter === 0}
                      onClick={() => setPhoneActiveChapter((p) => Math.max(0, p - 1))}
                      className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 disabled:opacity-30 border border-slate-200"
                    >
                      ← Prev
                    </button>
                    <span className="text-[10px] font-bold text-slate-400">
                      {phoneActiveChapter + 1} of {chapters.length}
                    </span>
                    <button
                      type="button"
                      disabled={phoneActiveChapter === chapters.length - 1}
                      onClick={() => setPhoneActiveChapter((p) => Math.min(chapters.length - 1, p + 1))}
                      className="rounded-full bg-rose-600 px-3.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-30 shadow"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* iPhone Home Bar */}
              <div className="shrink-0 pt-3 flex justify-center select-none">
                <div className="h-1 w-28 rounded-full bg-black/25" />
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel: WhatsApp Sharing & Links */}
        <aside className="w-[340px] xl:w-[380px] shrink-0 border-l border-rose-100 bg-white p-5 overflow-y-auto flex flex-col gap-4 custom-scrollbar z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💌</span>
              <h3 className="font-bold text-slate-900 text-sm">Guest Vault Link</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant 1-tap WhatsApp sharing with secret passcode
            </p>
          </div>

          {/* Shareable Link Box */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              SECRET STORY VAULT URL
            </span>
            <p className="font-mono text-[11px] text-slate-700 break-all mt-1 bg-white p-2 rounded-lg border border-rose-100">
              {shareableUrl}
            </p>
            <button
              type="button"
              onClick={copyWhatsApp}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition shadow-sm"
            >
              <span>📋</span> Copy Secret Vault Link
            </button>
          </div>

          {/* WhatsApp Message Draft */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              WHATSAPP INVITATION MESSAGE
            </label>
            <textarea
              rows={5}
              readOnly
              value={whatsAppText}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px] text-slate-700 leading-relaxed outline-none resize-none"
            />
          </div>

          {/* Primary WhatsApp Action */}
          <button
            type="button"
            onClick={sendWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition hover:-translate-y-0.5"
          >
            <span>💬</span> Send on WhatsApp
          </button>

          <Link
            href="/love-story"
            className="text-center text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline pt-2"
          >
            ← View Public Love Story Page
          </Link>
        </aside>
      </div>
    </div>
  );
}
