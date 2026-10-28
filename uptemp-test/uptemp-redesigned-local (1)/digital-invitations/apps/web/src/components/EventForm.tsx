'use client';

import { useState, useEffect } from 'react';
import { eventAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { toDateTimeLocal, splitDateTimeInput } from '@/lib/format';

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

interface EventFormProps {
  invitationId: string;
  event: Event | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EventForm({ invitationId, event, onClose, onSave }: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    address: '',
    startDate: '',
    endDate: '',
    dressCode: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        description: event.description || '',
        venue: event.venueName || '',
        address: event.venueAddress || '',
        startDate: toDateTimeLocal(event.date, event.startTime),
        endDate: event.endTime ? toDateTimeLocal(event.date, event.endTime) : '',
        dressCode: event.dressCode || '',
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Event name is required');
      return;
    }

    if (!formData.startDate) {
      toast.error('Start date is required');
      return;
    }

    try {
      setLoading(true);
      const start = splitDateTimeInput(formData.startDate);
      const end = formData.endDate ? splitDateTimeInput(formData.endDate) : null;

      const payload: Record<string, unknown> = {
        name: formData.name,
        description: formData.description || undefined,
        venueName: formData.venue || undefined,
        venueAddress: formData.address || undefined,
        dressCode: formData.dressCode || undefined,
        date: start.datePart,
        startTime: start.timePart,
        endTime: end?.timePart,
      };

      if (event) {
        await eventAPI.update(event.id, payload);
        toast.success('Event updated');
      } else {
        await eventAPI.create(invitationId, payload);
        toast.success('Event created');
      }
      onSave();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          (event ? 'Failed to update event' : 'Failed to create event')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {event ? 'Edit Event' : 'Add Event'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Wedding Ceremony"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Event description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g., The Grand Palace"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                placeholder="Full address..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Dress Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dress Code
              </label>
              <input
                type="text"
                value={formData.dressCode}
                onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                placeholder="e.g., Formal, Traditional"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : event ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
