'use client';

import { useState, useEffect } from 'react';
import { guestAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { normalizeMobile } from '@/lib/format';

interface Event {
  id: string;
  name: string;
}

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  mobile: string;
  groupName?: string | null;
  guestEvents?: {
    event: {
      id: string;
      name: string;
    };
  }[];
}

interface GuestFormProps {
  invitationId: string;
  events: Event[];
  guest: Guest | null;
  onClose: () => void;
  onSave: () => void;
}

export default function GuestForm({ invitationId, events, guest, onClose, onSave }: GuestFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    groupName: '',
    eventIds: [] as string[],
  });

  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name,
        email: guest.email || '',
        mobile: guest.mobile,
        groupName: guest.groupName || '',
        eventIds: (guest.guestEvents || []).map((ge) => ge.event.id),
      });
    }
  }, [guest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Guest name is required');
      return;
    }

    const mobile = normalizeMobile(formData.mobile);
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number starting with 6-9');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        mobile,
        email: formData.email || undefined,
        groupName: formData.groupName || undefined,
        eventIds: formData.eventIds,
      };

      if (guest) {
        await guestAPI.update(guest.id, payload);
        toast.success('Guest updated');
      } else {
        await guestAPI.create(invitationId, payload);
        toast.success('Guest added');
      }
      onSave();
    } catch (error: any) {
      toast.error(error.response?.data?.error || (guest ? 'Failed to update guest' : 'Failed to add guest'));
    } finally {
      setLoading(false);
    }
  };

  const handleEventToggle = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      eventIds: prev.eventIds.includes(eventId)
        ? prev.eventIds.filter((id) => id !== eventId)
        : [...prev.eventIds, eventId],
    }));
  };

  const groups = ['Family', 'Friends', 'Colleagues', 'Neighbors', 'Other'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {guest ? 'Edit Guest' : 'Add Guest'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Priya Sharma"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="9876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                10-digit Indian mobile number (6-9 starting digit)
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="guest@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group
              </label>
              <select
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select group</option>
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {/* Events */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Events
              </label>
              <div className="space-y-2">
                {events.map((event) => (
                  <label key={event.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.eventIds.includes(event.id)}
                      onChange={() => handleEventToggle(event.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{event.name}</span>
                  </label>
                ))}
              </div>
              {events.length === 0 && (
                <p className="text-sm text-gray-500">No events created yet</p>
              )}
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
                {loading ? 'Saving...' : guest ? 'Update Guest' : 'Add Guest'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
