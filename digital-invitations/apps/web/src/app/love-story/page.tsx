'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface StoryChapter {
  id: string;
  year: string;
  title: string;
  date: string;
  location: string;
  desc: string;
  tag: string;
  icon: string;
  gradient: string;
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 'ch-1',
    year: '2021',
    title: 'Where It All Began',
    date: 'OCTOBER 14, 2021',
    location: 'Cafe Roastery, Ahmedabad',
    desc: 'A quiet rainy evening, two warm cups of cappuccino, and a conversation that was supposed to last twenty minutes but stretched into four magical hours under city streetlights.',
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
    desc: 'Watching the royal sun dip behind the Aravali hills from a wooden boat. That was the moment we both silently realized life was infinitely brighter side by side.',
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
    desc: 'Surrounded by hundreds of glowing earthen diyas and marigold garlands, Akshat got down on one knee with a diamond ring. Priya wept happy tears and said YES before he could even finish the sentence.',
    tag: 'SHE SAID YES! 💍',
    icon: '✨',
    gradient: 'from-rose-500 via-pink-600 to-rose-700',
  },
  {
    id: 'ch-4',
    year: '2025',
    title: 'Two Families, One Heart',
    date: 'MARCH 18, 2025',
    location: 'Sharma & Verma Ancestral Courtyard',
    desc: 'Over mithai, dholak beats, and blessings from grandparents, both families united with joy. Kundalis matched, auspicious dates set, and a lifetime celebration began.',
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
    desc: 'Seven vows around the holy fire, sworn before God, family, and lifelong friends. Beginning our greatest adventure as husband and wife.',
    tag: 'THE AUSPICIOUS MUHURTHAM',
    icon: '🕊️',
    gradient: 'from-red-600 via-rose-700 to-amber-700',
  },
];

export default function LoveStoryPage() {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const handleUnlock = (code: string) => {
    // Accepts "2026", "1402", or any 4 digit code for seamless demo experience
    if (code.length === 4 || code === 'DEMO') {
      setIsUnlocked(true);
      toast.success('✨ Secret Love Story Unlocked!');
    } else {
      toast.error('Please enter 4 digits (e.g. 2026)');
    }
  };

  return (
    <main className="min-h-screen bg-[#fff8fa] text-slate-900 selection:bg-rose-100 selection:text-rose-900">
      {/* Background Floral & Sky Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(254,205,211,0.35)_0%,_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(253,230,138,0.25)_0%,_transparent_60%)]" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 font-bold text-white shadow-md shadow-rose-200">
              💌
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                uptemp<span className="text-rose-600">.</span>
              </span>
              <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-rose-500 mt-0.5">
                Love Story Experience
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/" className="hover:text-slate-900 transition">
              Home
            </Link>
            <Link href="/templates" className="hover:text-slate-900 transition">
              Templates
            </Link>
            <Link href="/love-story" className="font-bold text-rose-600">
              Love Story
            </Link>
            <Link href="/create" className="hover:text-slate-900 transition">
              Studio Editor
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/create?template=love-story-polaroid"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition hover:-translate-y-0.5 hover:from-rose-700 hover:to-pink-700"
            >
              Create Free Story →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-5 pt-12 pb-16 text-center sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 shadow-sm">
          <span>🔒</span> Passcode Protected Milestone Vault · 100% Free
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 mt-5 leading-tight">
          An Anniversary Surprise Behind a Passcode.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Share your private romantic journey with close friends and family. Complete with secret passcode unlocking, polaroids, milestone dates, and audio harmony.
        </p>

        {/* Passcode Lock Container */}
        {!isUnlocked ? (
          <div className="mt-10 mx-auto max-w-md rounded-3xl border border-rose-200 bg-white/95 p-8 shadow-xl shadow-rose-950/5 backdrop-blur-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-3xl shadow-inner">
              🔐
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 mt-4">
              Enter Secret Wedding Passcode
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hint: Try the wedding year <strong>2026</strong> or click instant demo below
            </p>

            <div className="mt-6 flex justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`passcode-${idx}`}
                  type="password"
                  maxLength={1}
                  value={passcode[idx] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const newCode = passcode.slice(0, idx) + val + passcode.slice(idx + 1);
                    setPasscode(newCode);
                    if (val && idx < 3) {
                      document.getElementById(`passcode-${idx + 1}`)?.focus();
                    }
                    if (newCode.length === 4) {
                      handleUnlock(newCode);
                    }
                  }}
                  className="h-14 w-14 rounded-2xl border-2 border-rose-200 bg-rose-50/50 text-center font-mono text-2xl font-bold text-rose-900 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100 transition"
                />
              ))}
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={() => handleUnlock(passcode)}
                className="w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 py-3.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:from-rose-700 hover:to-pink-700 transition"
              >
                Unlock Secret Journey 🔓
              </button>

              <button
                type="button"
                onClick={() => {
                  setPasscode('2026');
                  handleUnlock('2026');
                }}
                className="w-full rounded-full border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition"
              >
                ⚡ 1-Click Instant Demo Unlock (2026)
              </button>
            </div>
          </div>
        ) : (
          /* UNLOCKED TIMELINE EXPERIENCE */
          <div className="mt-12 text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-rose-200 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
                  AKSHAT & PRIYA'S SACRED CHRONICLES
                </span>
                <h3 className="font-serif text-3xl font-bold text-slate-900 mt-1">
                  From First Coffee to The Holy Mandap
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsUnlocked(false);
                    setPasscode('');
                    toast('Story locked again');
                  }}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  🔒 Lock Again
                </button>
                <Link
                  href="/create?template=love-story-polaroid"
                  className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
                >
                  Customize Your Own Free Story ↗
                </Link>
              </div>
            </div>

            {/* Chapters Progress Pill Tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
              {CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChapter(idx)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                    activeChapter === idx
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'bg-white border border-rose-200 text-slate-700 hover:bg-rose-50'
                  }`}
                >
                  <span>{ch.icon}</span>
                  <span>{ch.year}: {ch.title}</span>
                </button>
              ))}
            </div>

            {/* Active Chapter Feature Card */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center rounded-3xl border border-rose-200 bg-white p-7 sm:p-10 shadow-xl shadow-rose-950/5">
              <div>
                <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-800">
                  {CHAPTERS[activeChapter].tag}
                </span>
                <span className="ml-3 text-xs font-bold text-slate-400">
                  {CHAPTERS[activeChapter].date}
                </span>

                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
                  {CHAPTERS[activeChapter].title}
                </h2>
                <p className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                  <span>📍</span> {CHAPTERS[activeChapter].location}
                </p>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                  {CHAPTERS[activeChapter].desc}
                </p>

                <div className="mt-8 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={activeChapter === 0}
                    onClick={() => setActiveChapter((prev) => Math.max(0, prev - 1))}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition"
                  >
                    ← Previous Milestone
                  </button>
                  <button
                    type="button"
                    disabled={activeChapter === CHAPTERS.length - 1}
                    onClick={() => setActiveChapter((prev) => Math.min(CHAPTERS.length - 1, prev + 1))}
                    className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white disabled:opacity-30 hover:bg-rose-700 transition"
                  >
                    Next Milestone →
                  </button>
                </div>
              </div>

              {/* Polaroid Photo Visual Frame */}
              <div className="relative mx-auto w-full max-w-[320px] rotate-[2deg] rounded-2xl bg-white p-4 shadow-2xl border border-rose-100 transform hover:rotate-0 transition duration-300">
                <div
                  className={`aspect-[4/3] w-full rounded-xl bg-gradient-to-tr ${CHAPTERS[activeChapter].gradient} flex items-center justify-center text-center p-6 text-white shadow-inner`}
                >
                  <div>
                    <span className="text-5xl">{CHAPTERS[activeChapter].icon}</span>
                    <p className="font-serif text-xl font-bold mt-2">
                      {CHAPTERS[activeChapter].year}
                    </p>
                    <p className="text-[10px] tracking-widest uppercase opacity-80 mt-1">
                      {CHAPTERS[activeChapter].location}
                    </p>
                  </div>
                </div>
                <div className="pt-4 text-center">
                  <p className="font-serif text-sm font-bold text-slate-800">
                    "{CHAPTERS[activeChapter].title}"
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Memories that will last a lifetime
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-rose-100 bg-white py-8 mt-16 text-center text-xs text-slate-500">
        <p>uptemp. Love Story & Interactive Wedding Vault · 100% Free Forever</p>
      </footer>
    </main>
  );
}
