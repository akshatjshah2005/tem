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
      'w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500';

    return (
      <div key={key}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => setContentValue(key, e.target.checked)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {invitation.name}
              </h1>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invitation.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {invitation.status}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/dashboard/invitations/${invitation.id}/preview`}
                target="_blank"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Preview
              </Link>
              <button
                onClick={handlePublish}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  invitation.status === 'PUBLISHED'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {invitation.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Invitation Details</h2>
              <div className="max-w-2xl space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invitation Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="personalized"
                    checked={formData.isPersonalized}
                    onChange={(e) => setFormData({ ...formData, isPersonalized: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="personalized" className="ml-2 text-sm text-gray-700">
                    Enable guest personalization
                  </label>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleSaveDetails}
                    disabled={saving}
                    className="bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Template Info */}
              {invitation.template && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Template</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">
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
                  <h2 className="text-xl font-semibold text-gray-900">Invitation Content</h2>
                  <p className="text-sm text-gray-500 mt-1">
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
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">✍️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content fields</h3>
                  <p className="text-gray-500">
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
                <h2 className="text-xl font-semibold text-gray-900">Events</h2>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  + Add Event
                </button>
              </div>

              {invitation.events.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-500 mb-4">Add events to your invitation</p>
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
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 font-medium">#{index + 1}</span>
                            <h3 className="font-medium text-gray-900">{event.name}</h3>
                          </div>
                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                            <p>
                              📅 {formatDateOnly(event.date)}
                            </p>
                            {(event.startTime || event.endTime) && (
                              <p>🕐 {formatTimeRange(event.startTime, event.endTime)}</p>
                            )}
                            {event.venueName && <p>📍 {event.venueName}</p>}
                            {event.description && <p className="text-gray-500">{event.description}</p>}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-gray-600 hover:text-gray-900 px-2 py-1 text-sm"
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
              <h2 className="text-xl font-semibold text-gray-900">Media</h2>
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
              <h2 className="text-xl font-semibold text-gray-900">WhatsApp Message</h2>
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
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <div className="max-w-2xl space-y-6">
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
