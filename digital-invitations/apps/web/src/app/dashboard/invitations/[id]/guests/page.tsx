'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { guestAPI, invitationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import GuestForm from '@/components/GuestForm';

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  mobile: string;
  personalToken: string;
  personalizedLink?: string | null;
  groupName?: string | null;
  guestEvents?: {
    event: {
      id: string;
      name: string;
    };
  }[];
  rsvp?: {
    response: string;
    respondedAt?: string | null;
    guestsCount: number;
  };
  createdAt: string;
}

interface Invitation {
  id: string;
  name: string;
  slug: string;
  status: string;
  isPersonalized: boolean;
  events: {
    id: string;
    name: string;
  }[];
  _count: {
    guests: number;
  };
}

export default function GuestManagementPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params?.id) {
      fetchInvitation();
      fetchGuests();
    }
  }, [user, params?.id]);

  const fetchInvitation = async () => {
    try {
      const response = await invitationAPI.getOne(params?.id as string);
      setInvitation(response.data.data);
    } catch (error) {
      toast.error('Failed to load invitation');
      router.push('/dashboard');
    }
  };

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const response = await guestAPI.getAll(params?.id as string);
      setGuests(response.data.data);
    } catch (error) {
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setImporting(true);
      const response = await guestAPI.import(params?.id as string, file);
      const { imported, skipped, errors } = response.data.data;
      
      if (imported > 0) {
        toast.success(`Imported ${imported} guests`);
      }
      if (skipped > 0) {
        toast.error(`Skipped ${skipped} duplicates`);
      }
      if (errors && errors.length > 0) {
        console.error('Import errors:', errors);
      }
      
      fetchGuests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to import guests');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;

    try {
      await guestAPI.delete(guestId);
      toast.success('Guest deleted');
      fetchGuests();
    } catch (error) {
      toast.error('Failed to delete guest');
    }
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setShowGuestForm(true);
  };

  const handleCloseGuestForm = () => {
    setEditingGuest(null);
    setShowGuestForm(false);
  };

  const handleGuestSaved = () => {
    handleCloseGuestForm();
    fetchGuests();
  };

  const handleRegenerateLink = async (guestId: string) => {
    if (!confirm('This will generate a new unique link for this guest. Continue?')) return;

    try {
      await guestAPI.regenerateLink(guestId);
      toast.success('New link generated');
      fetchGuests();
    } catch (error) {
      toast.error('Failed to regenerate link');
    }
  };

  const handleCopyLink = (guest: Guest) => {
    if (!guest.personalizedLink) {
      toast.error('No personalized link for this guest. Try regenerate.');
      return;
    }
    navigator.clipboard.writeText(guest.personalizedLink);
    toast.success('Link copied to clipboard');
  };

  const handleBulkWhatsApp = () => {
    const selectedGuests = guests.filter((g) => filterGroup ? g.groupName === filterGroup : true);
    if (selectedGuests.length === 0) {
      toast.error('No guests to message');
      return;
    }
    // TODO: Open bulk WhatsApp modal
    toast.success(`Ready to send to ${selectedGuests.length} guests`);
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.mobile.includes(searchTerm);
    const matchesGroup = filterGroup ? guest.groupName === filterGroup : true;
    return matchesSearch && matchesGroup;
  });

  const groups = [...new Set(guests.map((g) => g.groupName).filter(Boolean))] as string[];

  const getGuestStats = () => {
    const total = guests.length;
    const withEvents = guests.filter((g) => (g.guestEvents || []).length > 0).length;
    const withRsvp = guests.filter((g) => g.rsvp).length;
    const accepted = guests.filter((g) => g.rsvp?.response === 'ACCEPT').length;
    return { total, withEvents, withRsvp, accepted };
  };

  const stats = getGuestStats();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !invitation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/invitations/${invitation.id}`} className="text-gray-600 hover:text-gray-900">
                ← Back to Editor
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-900">
                Guest Management - {invitation.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Guests" value={stats.total} />
          <StatCard title="With Events" value={stats.withEvents} />
          <StatCard title="RSVP Sent" value={stats.withRsvp} />
          <StatCard title="Accepted" value={stats.accepted} />
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowGuestForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
            >
              + Add Guest
            </button>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {importing ? 'Importing...' : '📊 Import Excel'}
              </button>
            </div>
            <button
              onClick={handleBulkWhatsApp}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
            >
              💬 Send WhatsApp
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Guests Table */}
        {guests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No guests yet</h3>
            <p className="text-gray-600 mb-6">Add guests manually or import from Excel</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowGuestForm(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                + Add First Guest
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                📊 Import from Excel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RSVP
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.mobile}</div>
                      {guest.email && (
                        <div className="text-xs text-gray-500">{guest.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.groupName ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {guest.groupName}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(guest.guestEvents || []).length} / {invitation.events.length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(guest.guestEvents || []).map((ge) => ge.event.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.rsvp ? (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            guest.rsvp.response === 'ACCEPT'
                              ? 'bg-green-100 text-green-800'
                              : guest.rsvp.response === 'DECLINE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {guest.rsvp.response}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleCopyLink(guest)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Copy personalized link"
                        >
                          🔗
                        </button>
                        <button
                          onClick={() => handleEditGuest(guest)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit guest"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleRegenerateLink(guest.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Regenerate link"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete guest"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredGuests.length === 0 && guests.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No guests match your search</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Guest Form Modal */}
      {showGuestForm && (
        <GuestForm
          invitationId={invitation.id}
          events={invitation.events}
          guest={editingGuest}
          onClose={handleCloseGuestForm}
          onSave={handleGuestSaved}
        />
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
