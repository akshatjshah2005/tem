'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Invitation {
  id: string;
  name: string;
  slug: string;
  status: string;
  isPersonalized: boolean;
  guestCount: number;
  views: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  template: {
    name: string;
  } | null;
  _count: {
    guests: number;
    events: number;
  };
}

export default function AdminInvitationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchInvitations();
  }, [user, page, statusFilter]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getInvitations({ page, limit: 20, status: statusFilter });
      setInvitations(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'UNPUBLISHED': return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-primary-600">
                Admin Panel
              </Link>
              <Link href="/admin/users" className="text-gray-600 hover:text-gray-900">
                Users
              </Link>
              <Link href="/admin/invitations" className="text-gray-900 font-medium">
                Invitations
              </Link>
              <Link href="/admin/templates" className="text-gray-600 hover:text-gray-900">
                Templates
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-sm text-primary-600 hover:text-primary-700">
                Customer Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Invitations</h1>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="UNPUBLISHED">Unpublished</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : invitations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No invitations found
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{inv.name}</div>
                      <div className="text-sm text-gray-500">/{inv.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{inv.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{inv.template?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{inv._count.guests}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{inv.views}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${
                  p === page ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
