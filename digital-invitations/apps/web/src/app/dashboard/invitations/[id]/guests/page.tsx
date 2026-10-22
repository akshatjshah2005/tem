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
  const [whatsAppQueue, setWhatsAppQueue] = useState<Guest[]>([]);
  const [whatsAppIndex, setWhatsAppIndex] = useState(0);
  const [whatsAppMessage, setWhatsAppMessage] = useState('Hi {guest_name}! You are invited to {invitation_name}. Please find your invitation here: {invitation_link}');
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

  const handleExportCsv = () => {
    const escapeCell = (value: unknown) => `\"${String(value ?? '').replace(/\"/g, '\"\"')}\"`;
    const rows = [
      ['Name', 'Mobile', 'Email', 'Group', 'Assigned events', 'RSVP status', 'RSVP guests', 'Personalized link'],
      ...filteredGuests.map((guest) => [
        guest.name,
        guest.mobile,
        guest.email || '',
        guest.groupName || '',
        (guest.guestEvents || []).map((item) => item.event.name).join('; '),
        guest.rsvp?.response || 'PENDING',
        guest.rsvp?.guestsCount ?? '',
        guest.personalizedLink || '',
      ]),
    ];
    const csv = '\\uFEFF' + rows.map((row) => row.map(escapeCell).join(',')).join('\\r\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(invitation?.name || 'invitation').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()}-guests.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredGuests.length} guest${filteredGuests.length === 1 ? '' : 's'}`);
  };

  const handleBulkWhatsApp = () => {
    const selectedGuests = filteredGuests.filter((guest) => Boolean(guest.mobile));
    if (selectedGuests.length === 0) {
      toast.error('No guests with phone numbers match these filters.');
      return;
    }
    setWhatsAppQueue(selectedGuests);
    setWhatsAppIndex(0);
  };

  const getWhatsAppUrl = (guest: Guest) => {
    const digits = guest.mobile.replace(/\\D/g, '');
    const phone = digits.length === 10 ? `91${digits}` : digits;
    const invitationLink = guest.personalizedLink || (invitation ? `${window.location.origin}/i/${invitation.slug}` : window.location.origin);
    const message = whatsAppMessage
      .replace(/\\{guest_name\\}/gi, guest.name)
      .replace(/\\{invitation_name\\}/gi, invitation?.name || 'our celebration')
      .replace(/\\{invitation_link\\}/gi, invitationLink);
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleOpenWhatsApp = () => {
    const guest = whatsAppQueue[whatsAppIndex];
    if (!guest) return;
    const digits = guest.mobile.replace(/\\D/g, '');
    if (digits.length < 10) {
      toast.error('This guest phone number looks invalid. Edit it before continuing.');
      return;
    }
    window.open(getWhatsAppUrl(guest), '_blank', 'noopener,noreferrer');
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

      {whatsAppQueue.length > 0 && whatsAppIndex < whatsAppQueue.length && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="whatsapp-queue-title">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">WhatsApp sharing queue</p>
                <h2 id="whatsapp-queue-title" className="mt-1 text-xl font-bold text-slate-900">Send invitations one by one</h2>
                <p className="mt-1 text-sm text-slate-500">{whatsAppIndex + 1} of {whatsAppQueue.length} guests. WhatsApp opens for review; you must press Send there.</p>
              </div>
              <button onClick={() => setWhatsAppQueue([])} className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100" aria-label="Close sharing queue">✕</button>
            </div>
            <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
              <p className="font-semibold text-slate-900">{whatsAppQueue[whatsAppIndex].name}</p>
              <p className="mt-1 text-sm text-slate-600">{whatsAppQueue[whatsAppIndex].mobile}</p>
              <p className="mt-1 text-xs text-slate-500">Group: {whatsAppQueue[whatsAppIndex].groupName || 'Not assigned'}</p>
            </div>
            <label htmlFor="whatsapp-message-template" className="mt-5 block text-sm font-semibold text-slate-800">Message template</label>
            <p className="mt-1 text-xs leading-5 text-slate-500">Use {'{guest_name}'}, {'{invitation_name}'}, and {'{invitation_link}'} to personalize each message.</p>
            <textarea id="whatsapp-message-template" rows={5} value={whatsAppMessage} onChange={(event) => setWhatsAppMessage(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
            <div className="mt-5 flex flex-wrap justify-between gap-3">
              <button onClick={() => setWhatsAppQueue([])} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Close queue</button>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleOpenWhatsApp} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">Open WhatsApp ↗</button>
                <button onClick={() => { if (whatsAppIndex + 1 >= whatsAppQueue.length) { setWhatsAppQueue([]); toast.success('Sharing queue completed.'); } else { setWhatsAppIndex((index) => index + 1); } }} className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700">{whatsAppIndex + 1 === whatsAppQueue.length ? 'Finish' : 'Next guest →'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
