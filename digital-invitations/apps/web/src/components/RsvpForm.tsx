'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { rsvpAPI } from '@/lib/api';

interface Event {
  id: string;
  name: string;
  date: string;
}

interface RsvpFormProps {
  token: string;
  invitationName: string;
  events: Event[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function RsvpForm({
  token,
  invitationName,
  events,
  onClose,
  onSuccess,
}: RsvpFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    response: 'ACCEPT' as 'ACCEPT' | 'DECLINE',
    guestsCount: 1,
    message: '',
    dietary: '',
    selectedEvents: events.map((e) => e.id),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await rsvpAPI.submit(token, {
        response: formData.response,
        guestsCount: formData.response === 'ACCEPT' ? formData.guestsCount : 1,
        message: formData.message || undefined,
        dietary: formData.dietary || undefined,
        eventIds: formData.response === 'ACCEPT' ? formData.selectedEvents : undefined,
      });
      toast.success('RSVP submitted successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit RSVP');
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedEvents: prev.selectedEvents.includes(eventId)
        ? prev.selectedEvents.filter((id) => id !== eventId)
        : [...prev.selectedEvents, eventId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">RSVP</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
              &times;
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Will you be attending <span className="font-semibold">{invitationName}</span>?
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-green-50 border-green-200">
                  <input
                    type="radio"
                    name="response"
                    value="ACCEPT"
                    checked={formData.response === 'ACCEPT'}
                    onChange={() => setFormData({ ...formData, response: 'ACCEPT' })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">Joyfully Accept</span>
                    <span className="block text-xs text-gray-500">Yes, I will be there!</span>
                  </span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-red-50 border-red-200">
                  <input
                    type="radio"
                    name="response"
                    value="DECLINE"
                    checked={formData.response === 'DECLINE'}
                    onChange={() => setFormData({ ...formData, response: 'DECLINE' })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">Regretfully Decline</span>
                    <span className="block text-xs text-gray-500">Unable to attend</span>
                  </span>
                </label>
              </div>
            </div>

            {formData.response === 'ACCEPT' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Attendees
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {events.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Events Attending</label>
                    <div className="space-y-2">
                      {events.map((event) => (
                        <label key={event.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={formData.selectedEvents.includes(event.id)}
                            onChange={() => toggleEvent(event.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{event.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Requirements (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.dietary}
                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                    placeholder="Vegetarian, Vegan, Gluten-free..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                placeholder="Leave a message for the hosts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit RSVP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
