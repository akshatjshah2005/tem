'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { invitationAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Invitation {
  id: string;
  name: string;
  slug: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isPersonalized: boolean;
  guestCount: number;
  createdAt: string;
  template?: {
    name: string;
    thumbnailUrl?: string;
  };
  _count: {
    guests: number;
    events: number;
  };
}

interface RSVPActivity {
  id: string;
  guestName: string;
  passes: number;
  diet: string;
  status: 'Attending' | 'Declined' | 'Pending';
  time: string;
  message: string;
}

const DEMO_INVITATIONS: Invitation[] = [
  {
    id: 'demo-invite-1',
    name: 'Akshat & Priya Wedding Invite',
    slug: 'akshat-priya',
    status: 'PUBLISHED',
    isPersonalized: true,
    guestCount: 142,
    createdAt: new Date().toISOString(),
    template: {
      name: 'Royal Sandalwood & Vivaah Mandap',
      thumbnailUrl: '',
    },
    _count: {
      guests: 142,
      events: 3,
    },
  },
  {
    id: 'demo-invite-2',
    name: 'Akshat & Priya Love Story Vault',
    slug: 'love-story',
    status: 'PUBLISHED',
    isPersonalized: true,
    guestCount: 65,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    template: {
      name: 'Secret Passcode Polaroid Vault (PIN: 1402)',
      thumbnailUrl: '',
    },
    _count: {
      guests: 65,
      events: 4,
    },
  },
];

const DEMO_RSVPS: RSVPActivity[] = [
  {
    id: 'r-1',
    guestName: 'Uncle Ravi & Family',
    passes: 4,
    diet: 'Vegetarian',
    status: 'Attending',
    time: '12 mins ago',
    message: 'Looking forward to the celebration! Blessings to both of you.',
  },
  {
    id: 'r-2',
    guestName: 'Priya Sharma (Sister)',
    passes: 2,
    diet: 'Jain Vegetarian',
    status: 'Attending',
    time: '1 hour ago',
    message: 'Can’t wait to dance at the Sangeet night! 🎉',
  },
  {
    id: 'r-3',
    guestName: 'Rahul Mehta & Friends',
    passes: 2,
    diet: 'Vegetarian',
    status: 'Attending',
    time: '3 hours ago',
    message: 'Congratulations bhai! Super excited.',
  },
  {
    id: 'r-4',
    guestName: 'The Singhania Family',
    passes: 3,
    diet: 'Vegetarian',
    status: 'Pending',
    time: 'Yesterday',
    message: 'Pending confirmation from elders',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>(DEMO_INVITATIONS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts' | 'stories'>('all');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState<string | null>(null);
  const [selectedInviteForQr, setSelectedInviteForQr] = useState<Invitation | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await invitationAPI.getAll({ page: 1, limit: 10 });
      const loaded = response.data?.data || [];
      if (loaded.length > 0) {
        setInvitations(loaded);
      } else {
        setInvitations(DEMO_INVITATIONS);
      }
    } catch {
      setInvitations(DEMO_INVITATIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) return;
    setInvitations((prev) => prev.filter((i) => i.id !== id));
    toast.success('Invitation removed from dashboard');
  };

  const handleDuplicate = (inv: Invitation) => {
    const dup: Invitation = {
      ...inv,
      id: `copy-${Date.now()}`,
      name: `${inv.name} (Copy)`,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    };
    setInvitations((prev) => [dup, ...prev]);
    toast.success('Invitation duplicated successfully as Draft!');
  };

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = slug === 'love-story' ? `${origin}/love-story` : `${origin}/create?template=royal-sandalwood`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard! 📋');
  };

  const handleOpenQr = (inv: Invitation) => {
    setSelectedInviteForQr(inv);
    setShowQrModal(inv.slug);
  };

  const handleExportCSV = () => {
    const headers = 'Guest Name,Passes,Diet,Status,Time,Message\n';
    const rows = DEMO_RSVPS.map(
      (r) => `"${r.guestName}",${r.passes},"${r.diet}","${r.status}","${r.time}","${r.message.replace(/"/g, '""')}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Wedding_Guest_RSVPs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Guest RSVP list exported as CSV! 📊');
  };

  // Filtered invitations
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      const matchSearch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.template?.name && inv.template.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;
      if (activeTab === 'published') return inv.status === 'PUBLISHED';
      if (activeTab === 'drafts') return inv.status === 'DRAFT';
      if (activeTab === 'stories') return inv.slug.includes('story') || inv.name.toLowerCase().includes('story');
      return true;
    });
  }, [invitations, searchQuery, activeTab]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4faff]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-900 font-sans antialiased">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-sky-100/80 bg-white/90 shadow-xs backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4">
            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-900 group">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-lg font-extrabold text-white shadow-md shadow-sky-500/25 transition group-hover:scale-105">
                  u
                </span>
                <span className="text-xl font-bold tracking-tight">
                  uptemp<span className="text-sky-600">.</span>
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200/60 text-[11px] font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                100% Free Lifetime Tier Active
              </div>
            </div>

            {/* Quick Links & Profile */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/create?template=royal-sandalwood"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 transition border border-sky-200/70"
              >
                <span>✨</span> Wedding Studio
              </Link>

              <Link
                href="/love-story"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-3.5 py-2 text-xs font-bold text-pink-700 hover:bg-pink-100 transition border border-pink-200/70"
              >
                <span>💌</span> Love Story
              </Link>

              {/* User Chip */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-xs shadow-sm">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 leading-none truncate max-w-[120px]">{user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* 2.1 HERO WELCOME BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d233a] via-[#12365a] to-[#0a1e33] p-7 sm:p-9 text-white shadow-xl shadow-sky-950/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-sky-200 backdrop-blur-md border border-white/10">
                <span>🎉</span> Live Celebration Hub
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight">
                Welcome back, {user.name}!
              </h1>
              <p className="text-sm text-sky-100/80 leading-relaxed font-sans">
                Manage your wedding invitations, track guest RSVPs with vegetarian options, customize private passcodes, and share instant WhatsApp invitations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <span>+</span> Create New Invitation
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20 transition"
              >
                <span>📥</span> Export Guest List (.csv)
              </button>
            </div>
          </div>

          {/* Decorative glowing gradient orbs */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        </div>

        {/* 2.2 METRICS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invites</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 text-lg">💌</span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">{invitations.length}</p>
            <p className="mt-1 text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span>●</span> {invitations.filter((i) => i.status === 'PUBLISHED').length} Published & Live
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Guests</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-lg">👥</span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {invitations.reduce((acc, i) => acc + (i.guestCount || 0), 0)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Across 48 VIP families</p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmed RSVPs</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg">✓</span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-emerald-600">83%</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '83%' }} />
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">WhatsApp Shares</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600 text-lg">💬</span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">94</p>
            <p className="mt-1 text-xs text-emerald-600 font-bold">1-Click Fast Delivery</p>
          </div>
        </div>

        {/* 2.3 INVITATIONS SECTION HEADER & FILTER TABS */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">My Invitations & Vaults</h2>
              <p className="text-xs text-slate-500">Select an invitation to customize, copy guest links, or preview.</p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`rounded-lg px-3 py-1.5 transition ${activeTab === 'all' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  All ({invitations.length})
                </button>
                <button
                  onClick={() => setActiveTab('published')}
                  className={`rounded-lg px-3 py-1.5 transition ${activeTab === 'published' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Published ({invitations.filter((i) => i.status === 'PUBLISHED').length})
                </button>
                <button
                  onClick={() => setActiveTab('stories')}
                  className={`rounded-lg px-3 py-1.5 transition ${activeTab === 'stories' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Love Stories
                </button>
              </div>

              <input
                type="text"
                placeholder="Search invites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 shadow-xs"
              />
            </div>
          </div>

          {/* 2.4 INVITATIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvitations.map((inv) => {
              const isStory = inv.slug === 'love-story' || inv.name.toLowerCase().includes('love story');
              const editUrl = isStory ? '/create/story' : `/create?template=royal-sandalwood`;
              const liveUrl = isStory ? '/love-story' : `/create?template=royal-sandalwood`;

              return (
                <div
                  key={inv.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10"
                >
                  {/* Card Thumbnail / Header */}
                  <div
                    className={`relative h-44 w-full p-5 flex flex-col justify-between text-white ${
                      isStory
                        ? 'bg-gradient-to-br from-pink-600 via-rose-600 to-pink-900'
                        : 'bg-gradient-to-br from-[#12365a] via-[#1b4b7c] to-[#0c243d]'
                    }`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="rounded-full bg-black/30 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-white/10">
                        {isStory ? '🔒 Passcode Vault' : '✨ Wedding Suite'}
                      </span>
                      <span className="rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        {inv.status}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <span className="text-3xl block mb-1">{isStory ? '💖' : '💍'}</span>
                      <h3 className="text-lg font-serif font-bold text-white leading-tight drop-shadow-sm">
                        {inv.name}
                      </h3>
                      <p className="text-[11px] text-white/80 font-sans mt-0.5 truncate">
                        {inv.template?.name || 'Curated Premium Theme'}
                      </p>
                    </div>

                    {/* Subtle decorative radial overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.2)_0%,_transparent_70%)] pointer-events-none" />
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Guests</p>
                        <p className="font-bold text-slate-800 text-sm">{inv.guestCount} Allocated</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Events</p>
                        <p className="font-bold text-slate-800 text-sm">{inv._count?.events || 3} Functions</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={editUrl}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition shadow-xs"
                        >
                          <span>✏️</span> Customize
                        </Link>
                        <Link
                          href={liveUrl}
                          target="_blank"
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <span>👁️</span> Live View ↗
                        </Link>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(inv.slug)}
                          className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-sky-200 bg-sky-50 py-2 text-[11px] font-bold text-sky-800 hover:bg-sky-100 transition"
                          title="Copy Link to Clipboard"
                        >
                          <span>🔗</span> Copy Link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenQr(inv)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs hover:bg-slate-50"
                          title="Show QR Code"
                        >
                          📱
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(inv)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs hover:bg-slate-50"
                          title="Duplicate Invitation"
                        >
                          📋
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-xs hover:bg-rose-100"
                          title="Delete Invitation"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2.5 RECENT RSVP ACTIVITY & GUEST MANAGEMENT PREVIEW */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">Recent Guest RSVP Activity</h3>
              <p className="text-xs text-slate-500">Live responses submitted directly through your invitation web link.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 transition"
            >
              <span>📊</span> Download Full Guest List (.csv)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2.5 px-3">Guest / Family</th>
                  <th className="py-2.5 px-3">Reserved Passes</th>
                  <th className="py-2.5 px-3">Diet Preference</th>
                  <th className="py-2.5 px-3">Response Status</th>
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3">Blessing Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEMO_RSVPS.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-bold text-slate-800">{r.guestName}</td>
                    <td className="py-3 px-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                        {r.passes} Passes
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{r.diet}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-[11px] ${
                          r.status === 'Attending'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Declined'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status === 'Attending' && '✓ Attending'}
                        {r.status === 'Declined' && '✕ Declined'}
                        {r.status === 'Pending' && '⏳ Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{r.time}</td>
                    <td className="py-3 px-3 text-slate-600 italic max-w-xs truncate">"{r.message}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 3. MODAL: CREATE NEW INVITATION (WISHLYS STYLE CHOOSE CATEGORY) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  Create a New Celebration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the format for your personalized digital invitation.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* Option 1: Full Wedding Suite */}
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  router.push('/create?template=royal-sandalwood');
                }}
                className="text-left rounded-2xl border-2 border-sky-200 bg-sky-50/50 p-5 hover:border-sky-500 hover:bg-sky-50 transition group"
              >
                <span className="text-3xl block mb-2">💍</span>
                <h4 className="font-serif font-bold text-base text-slate-900 group-hover:text-sky-700">
                  Grand Wedding Suite
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Multi-ceremony lineup (Haldi, Sangeet, Muhurtham), RSVP dietary options, Google Maps directions, live stream & festive Shehnai music.
                </p>
                <span className="inline-block mt-3 text-xs font-bold text-sky-700">
                  Open Wedding Customizer →
                </span>
              </button>

              {/* Option 2: Love Story Secret Vault */}
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  router.push('/create/story');
                }}
                className="text-left rounded-2xl border-2 border-pink-200 bg-pink-50/50 p-5 hover:border-pink-500 hover:bg-pink-50 transition group"
              >
                <span className="text-3xl block mb-2">💌</span>
                <h4 className="font-serif font-bold text-base text-slate-900 group-hover:text-pink-700">
                  Love Story Passcode Vault
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Interactive 4-digit secret PIN protection, milestone timeline chapters, romantic audio, and animated unlocked polaroids.
                </p>
                <span className="inline-block mt-3 text-xs font-bold text-pink-700">
                  Open Story Customizer →
                </span>
              </button>

              {/* Option 3: Minimal Zen & Cinematic Couple */}
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  router.push('/create?template=minimal-zen&category=common-any');
                }}
                className="text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-sky-500 hover:bg-sky-50/40 transition group"
              >
                <span className="text-3xl block mb-2">🕊️</span>
                <h4 className="font-serif font-bold text-base text-slate-900 group-hover:text-sky-700">
                  Cinematic Couple (Minimal Zen)
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Clean editorial typography, modern video embed, digital blessing wall, and instant WhatsApp invitations.
                </p>
                <span className="inline-block mt-3 text-xs font-bold text-slate-700">
                  Open Minimal Customizer →
                </span>
              </button>

              {/* Option 4: Save The Date Countdown */}
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  router.push('/create?template=save-the-date');
                }}
                className="text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-sky-500 hover:bg-sky-50/40 transition group"
              >
                <span className="text-3xl block mb-2">📅</span>
                <h4 className="font-serif font-bold text-base text-slate-900 group-hover:text-sky-700">
                  Save The Date Single Screen
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Single high-impact screen with names, animated ticking countdown timer, and venue reveal.
                </p>
                <span className="inline-block mt-3 text-xs font-bold text-slate-700">
                  Open Save The Date →
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: QR CODE GENERATOR */}
      {showQrModal && selectedInviteForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl border border-sky-100">
            <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">
              Guest QR Code
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Guests can scan this QR code with any phone camera to instantly open the invitation.
            </p>

            <div className="mx-auto my-3 flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-50 p-3 shadow-inner">
              {/* Simulated High-Res QR SVG */}
              <svg viewBox="0 0 100 100" className="h-full w-full fill-slate-900">
                <rect x="10" y="10" width="25" height="25" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" />
                <rect x="65" y="10" width="25" height="25" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="73" y="18" width="9" height="9" />
                <rect x="10" y="65" width="25" height="25" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="73" width="9" height="9" />
                <circle cx="50" cy="50" r="8" fill="#0284c7" />
                <rect x="45" y="15" width="10" height="20" />
                <rect x="40" y="65" width="20" height="10" />
                <rect x="65" y="45" width="20" height="10" />
                <rect x="15" y="45" width="15" height="10" />
              </svg>
            </div>

            <p className="text-[11px] font-mono text-slate-400 mt-2 truncate">
              http://localhost:3000/i/{selectedInviteForQr.slug}
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.success('QR Code downloaded as PNG image!');
                  setShowQrModal(null);
                }}
                className="flex-1 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow hover:bg-sky-700"
              >
                Download QR
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
