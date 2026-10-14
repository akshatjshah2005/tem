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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
                Invitations
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Invitations" value={invitations.length} />
          <StatCard title="Published" value={invitations.filter(i => i.status === 'PUBLISHED').length} />
          <StatCard title="Total Guests" value={invitations.reduce((acc, i) => acc + i._count.guests, 0)} />
          <StatCard title="Draft" value={invitations.filter(i => i.status === 'DRAFT').length} />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Invitations</h2>
          <Link
            href="/dashboard/create"
            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
          >
            + Create New
          </Link>
        </div>

        {/* Invitations List */}
        {invitations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No invitations yet</h3>
            <p className="text-gray-600 mb-6">Create your first beautiful invitation</p>
            <Link
              href="/dashboard/create"
              className="bg-primary-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Create Invitation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onEdit={() => router.push(`/dashboard/invitations/${invitation.id}`)}
                onDelete={() => handleDelete(invitation.id)}
                onDuplicate={() => handleDuplicate(invitation.id)}
                onView={() => window.open(`/i/${invitation.slug}`, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-md ${
                  page === p
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
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
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{invitation.name}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[invitation.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {invitation.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          {invitation.template?.name || 'No template'}
        </p>
        <div className="flex items-center text-sm text-gray-600 space-x-4 mb-4">
          <span>👥 {invitation._count.guests} guests</span>
          <span>📅 {invitation._count.events} events</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Edit
          </button>
          <button
            onClick={onView}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            View
          </button>
          <div className="relative group">
            <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200">
              ⋮
            </button>
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={onDuplicate}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Duplicate
              </button>
              <button
                onClick={onDelete}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
