'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { invitationAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Invitation {
  id: string;
  name: string;
  slug: string;
  status: string;
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user, page]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await invitationAPI.getAll({ page, limit: 10 });
      setInvitations(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      await invitationAPI.delete(id);
      toast.success('Invitation deleted');
      fetchInvitations();
    } catch (error) {
      toast.error('Failed to delete invitation');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await invitationAPI.duplicate(id);
      toast.success('Invitation duplicated');
      fetchInvitations();
    } catch (error) {
      toast.error('Failed to duplicate invitation');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f4faff] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <div className="flex items-center">
              <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-gradient-to-br from-sky-400 to-blue-600 text-lg text-white">i</span>
                <span className="text-xl">invitations<span className="text-sky-600">.</span></span>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/templates" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-sky-50 sm:inline-flex">Explore themes</Link>
              <span className="hidden text-sm text-slate-500 sm:inline">Welcome, <strong className="font-semibold text-slate-800">{user.name}</strong></span>
              <button
                onClick={logout}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-slate-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Invitations" value={invitations.length} />
          <StatCard title="Published" value={invitations.filter(i => i.status === 'PUBLISHED').length} />
          <StatCard title="Total Guests" value={invitations.reduce((acc, i) => acc + i._count.guests, 0)} />
          <StatCard title="Draft" value={invitations.filter(i => i.status === 'DRAFT').length} />
        </div>

        {/* Actions */}
        <div className="mb-7 flex flex-col gap-4 rounded-[1.7rem] border border-sky-100 bg-gradient-to-r from-white via-white to-sky-50 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">My Invitations</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Create, personalize, and share your next celebration.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Browse templates
            </Link>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700"
            >
              + Create New
            </Link>
          </div>
        </div>

        {/* Invitations List */}
        {invitations.length === 0 ? (
          <div className="rounded-[2rem] border border-sky-100 bg-white px-6 py-16 text-center shadow-sm shadow-sky-100/50 sm:px-12">
            <div className="text-6xl mb-4">💌</div>
            <h3 className="mb-2 text-2xl font-semibold tracking-tight text-slate-950">No invitations yet</h3>
            <p className="mb-7 text-slate-500">Create your first beautiful invitation</p>
            <Link
              href="/dashboard/create"
              className="inline-flex rounded-full bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700"
            >
              Create Invitation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onEdit={() => router.push(`/dashboard/invitations/${invitation.id}`)}
                onDelete={() => handleDelete(invitation.id)}
                onDuplicate={() => handleDuplicate(invitation.id)}
                onView={() => window.open(`/dashboard/invitations/${invitation.id}/preview`, '_blank', 'noopener,noreferrer')}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                  page === p
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-sky-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100/50">
      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function InvitationCard({
  invitation,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
}: {
  invitation: Invitation;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onView: () => void;
}) {
  const statusColors: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    UNPUBLISHED: 'bg-gray-100 text-gray-800',
    ARCHIVED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="group overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/70">
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-white to-indigo-100">
        {invitation.template?.thumbnailUrl ? (
          <img
            src={invitation.template.thumbnailUrl}
            alt={invitation.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">💌</span>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="truncate font-bold text-slate-900">{invitation.name}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[invitation.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {invitation.status}
          </span>
        </div>
        <p className="mb-2 text-sm text-slate-500">
          {invitation.template?.name || 'No template'}
        </p>
        <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span>👥 {invitation._count.guests} guests</span>
          <span>📅 {invitation._count.events} events</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 rounded-full bg-sky-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700"
          >
            Edit
          </button>
          <button
            onClick={onView}
            className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50"
          >
            View
          </button>
          <div className="relative group">
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-sky-50">
              ⋮
            </button>
            <div className="invisible absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-slate-100 bg-white p-1 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
              <button
                onClick={onDuplicate}
                className="block w-full rounded-xl px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-sky-50"
              >
                Duplicate
              </button>
              <button
                onClick={onDelete}
                className="block w-full rounded-xl px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
