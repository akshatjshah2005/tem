'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { invitationAPI, eventAPI, mediaAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import EventForm from '@/components/EventForm';
import MediaUploader from '@/components/MediaUploader';
import WhatsAppMessageEditor from '@/components/WhatsAppMessageEditor';
import { formatDateOnly, formatTimeRange, mediaDisplayUrl, mediaIsImage } from '@/lib/format';

interface Invitation {
  id: string;
  name: string;
  slug: string;
  status: string;
  isPersonalized: boolean;
  description?: string;
  whatsappMessageTemplate?: string;
  metadata?: any;
  content?: Record<string, any>;
  personalizationEnabled?: boolean;
  template?: {
    id: string;
    name: string;
    features: any;
    editableFields: any;
  };
  events: Event[];
  media: Media[];
  _count: {
    guests: number;
  };
}

interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  mapUrl?: string | null;
  dressCode?: string | null;
  displayOrder?: number;
}

interface Media {
  id: string;
  originalUrl: string;
  optimizedUrl?: string | null;
  fileName: string;
  mimeType: string;
  isCover: boolean;
  galleryOrder: number;
}

type TabType = 'details' | 'content' | 'events' | 'media' | 'whatsapp' | 'settings';

export default function InvitationEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [saving, setSaving] = useState(false);

  // Details tab state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPersonalized: true,
  });

  // Content tab state (template driven editable fields)
  const [content, setContent] = useState<Record<string, any>>({});

  // Events tab state
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Re-sync the editor from the loaded invitation. This keeps controlled inputs
  // populated after refreshes and after invitation/event/media mutations.
  useEffect(() => {
    if (!invitation) return;
    setFormData({
      name: invitation.name ?? '',
      description: invitation.description ?? '',
      isPersonalized: Boolean(invitation.isPersonalized || invitation.personalizationEnabled),
    });
    setContent(invitation.content && typeof invitation.content === 'object' ? invitation.content : {});
  }, [invitation]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params?.id) {
      fetchInvitation();
    }
  }, [user, params?.id]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const response = await invitationAPI.getOne(params?.id as string);
      const loadedInvitation = response.data?.data;
      if (!loadedInvitation?.id) {
        throw new Error('The invitation response did not contain an invitation.');
      }
      setInvitation(loadedInvitation);
      setFormData({
        name: loadedInvitation.name ?? '',
        description: loadedInvitation.description ?? '',
        isPersonalized: Boolean(loadedInvitation.isPersonalized || loadedInvitation.personalizationEnabled),
      });
      setContent(loadedInvitation.content && typeof loadedInvitation.content === 'object' ? loadedInvitation.content : {});
    } catch (error) {
      toast.error('Failed to load invitation');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!invitation) return;

    try {
      if (!formData.name.trim()) {
        toast.error('Please enter an invitation name.');
        return;
      }
      setSaving(true);
      const payload = {
        ...formData,
        name: formData.name.trim(),
        isPersonalized: formData.isPersonalized,
        personalizationEnabled: formData.isPersonalized,
      };
      const response = await invitationAPI.update(invitation.id, payload);
      setInvitation((current) => current ? { ...current, ...response.data.data } : current);
      setFormData((current) => ({ ...current, name: payload.name }));
      toast.success('Invitation details saved.');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Could not save invitation details.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContent = async () => {
    if (!invitation) return;

    try {
      setSaving(true);
      const response = await invitationAPI.update(invitation.id, { content });
      setInvitation((current) => current ? { ...current, ...response.data.data } : current);
      setContent(response.data.data?.content || content);
      toast.success('Invitation content saved.');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Could not save invitation content.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {    if (!invitation || !confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventAPI.delete(eventId);
      toast.success('Event deleted');
      fetchInvitation();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleCloseEventForm = () => {
    setEditingEvent(null);
    setShowEventForm(false);
  };

  const handleEventSaved = () => {
    handleCloseEventForm();
    fetchInvitation();
  };

  const handlePublish = async () => {
    if (!invitation) return;

    try {
      if (invitation.status === 'PUBLISHED') {
        await invitationAPI.unpublish(invitation.id);
        toast.success('Invitation unpublished');
      } else {
        await invitationAPI.publish(invitation.id);
        toast.success('Invitation published');
      }
      fetchInvitation();
    } catch (error) {
      toast.error('Failed to update invitation status');
    }
  };

  const handleReorderEvents = async (eventIds: string[]) => {
    if (!invitation) return;

    try {
      await eventAPI.reorder(invitation.id, eventIds);
      toast.success('Events reordered');
      fetchInvitation();
    } catch (error) {
      toast.error('Failed to reorder events');
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!invitation || !confirm('Are you sure you want to delete this media?')) return;

    try {
      await mediaAPI.delete(mediaId);
      toast.success('Media deleted');
      fetchInvitation();
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  const handleSetCover = async (mediaId: string) => {
    if (!invitation) return;

    try {
      await mediaAPI.setCover(mediaId);
      toast.success('Cover image set');
      fetchInvitation();
    } catch (error) {
      toast.error('Failed to set cover image');
    }
  };

  const handleReorderMedia = async (mediaIds: string[]) => {
    if (!invitation) return;

    try {
      await mediaAPI.reorder(invitation.id, mediaIds);
      toast.success('Media reordered');
      fetchInvitation();
    } catch (error) {
      toast.error('Failed to reorder media');
    }
  };

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

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'details', label: 'Details', icon: '📝' },
    { id: 'content', label: 'Content', icon: '✍️' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'media', label: 'Media', icon: '🖼️' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const editableFields = (invitation.template?.editableFields || {}) as Record<string, any>;
  const editableFieldKeys = Object.keys(editableFields);

  const setContentValue = (key: string, value: any) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const renderContentField = (key: string, field: any) => {
    const type = field?.type || 'text';
    const label = field?.label || key;
    const required = Boolean(field?.required);
    const placeholder = field?.placeholder || '';
    const value = content[key] ?? field?.default ?? (type === 'boolean' ? false : '');
    const inputClasses =
      'w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500';

    return (
      <div key={key}>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {type === 'textarea' ? (
          <textarea
            value={value}
            placeholder={placeholder}
            rows={Number(field?.rows) || 3}
            maxLength={field?.maxLength}
            onChange={(e) => setContentValue(key, e.target.value)}
            className={inputClasses}
          />
        ) : type === 'boolean' ? (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => setContentValue(key, e.target.checked)}
              className="h-4 w-4 text-primary-600 border-slate-300 rounded"
            />
            {field?.hint || 'Enabled'}
          </label>
        ) : Array.isArray(field?.options) && field.options.length > 0 ? (
          <select
            value={value}
            onChange={(e) => setContentValue(key, e.target.value)}
            className={inputClasses}
          >
            <option value="">Select...</option>
            {field.options.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type === 'date' ? 'date' : type === 'number' ? 'number' : type === 'image' || type === 'url' ? 'url' : 'text'}
            value={value}
            placeholder={placeholder}
            maxLength={field?.maxLength}
            onChange={(e) => setContentValue(key, e.target.value)}
            className={inputClasses}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4faff] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                ← Back
              </Link>
              <span className="hidden h-7 w-px bg-slate-200 sm:block" aria-hidden="true" />
              <h1 className="max-w-[34vw] truncate text-sm font-bold tracking-tight text-slate-950 sm:max-w-md sm:text-base">
                {invitation.name}
              </h1>
              <span
                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
                  invitation.status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {invitation.status}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/dashboard/invitations/${invitation.id}/preview`}
                target="_blank"
                className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
              >
                Preview
              </Link>
              <button
                onClick={handlePublish}
                className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                  invitation.status === 'PUBLISHED'
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : 'bg-sky-600 text-white shadow-sm shadow-sky-200 hover:bg-sky-700'
                }`}
              >
                {invitation.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-10 lg:px-10">
        {/* Tabs */}
        <div className="mb-8 rounded-2xl border border-sky-100 bg-white px-3 shadow-sm sm:px-5">
          <nav className="flex max-w-full gap-5 overflow-x-auto px-1 sm:gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-2 py-4 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Invitation Details</h2>
              <div className="max-w-2xl space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Invitation Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="personalized"
                    checked={formData.isPersonalized}
                    onChange={(e) => setFormData({ ...formData, isPersonalized: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                  />
                  <label htmlFor="personalized" className="ml-2 text-sm text-slate-700">
                    Enable guest personalization
                  </label>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleSaveDetails}
                    disabled={saving}
                    className="rounded-full bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Template Info */}
              {invitation.template && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Template</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700">
                      <span className="font-medium">Template:</span> {invitation.template.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Invitation Content</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Fields are defined by the selected template
                    {invitation.template ? ` (${invitation.template.name})` : ''}.
                  </p>
                </div>
                <button
                  onClick={handleSaveContent}
                  disabled={saving}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Content'}
                </button>
              </div>

              {editableFieldKeys.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <div className="text-4xl mb-4">✍️</div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No content fields</h3>
                  <p className="text-slate-500">
                    This template does not expose any editable content fields.
                  </p>
                </div>
              ) : (
                <div className="max-w-2xl space-y-4">{editableFieldKeys.map((key) => renderContentField(key, editableFields[key]))}</div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">Events</h2>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700"
                >
                  + Add Event
                </button>
              </div>

              {invitation.events.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No events yet</h3>
                  <p className="text-slate-500 mb-4">Add events to your invitation</p>
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    + Add First Event
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitation.events.map((event, index) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-sky-200 hover:bg-sky-50/40"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 font-medium">#{index + 1}</span>
                            <h3 className="font-medium text-slate-900">{event.name}</h3>
                          </div>
                          <div className="mt-2 text-sm text-slate-600 space-y-1">
                            <p>
                              📅 {formatDateOnly(event.date)}
                            </p>
                            {(event.startTime || event.endTime) && (
                              <p>🕐 {formatTimeRange(event.startTime, event.endTime)}</p>
                            )}
                            {event.venueName && <p>📍 {event.venueName}</p>}
                            {event.description && <p className="text-slate-500">{event.description}</p>}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-slate-600 hover:text-slate-900 px-2 py-1 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Media</h2>
              <MediaUploader
                invitationId={invitation.id}
                media={invitation.media}
                onUpload={fetchInvitation}
                onDelete={handleDeleteMedia}
                onSetCover={handleSetCover}
                onReorder={handleReorderMedia}
              />
            </div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">WhatsApp Message</h2>
              <WhatsAppMessageEditor
                invitationId={invitation.id}
                invitation={invitation}
                onSave={fetchInvitation}
              />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
              <div className="max-w-2xl space-y-6">
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Danger Zone</h3>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-red-700 mb-4">
                      Deleting this invitation will remove all associated data including guests, events, and media.
                    </p>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this invitation? This cannot be undone.')) {
                          try {
                            await invitationAPI.delete(invitation.id);
                            toast.success('Invitation deleted');
                            router.push('/dashboard');
                          } catch (error) {
                            toast.error('Failed to delete invitation');
                          }
                        }
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      Delete Invitation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          invitationId={invitation.id}
          event={editingEvent}
          onClose={handleCloseEventForm}
          onSave={handleEventSaved}
        />
      )}
    </div>
  );
}
