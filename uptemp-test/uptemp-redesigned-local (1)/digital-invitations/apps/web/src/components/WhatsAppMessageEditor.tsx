'use client';

import { useState, useEffect } from 'react';
import { invitationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDateOnly, formatTimeRange } from '@/lib/format';

interface WhatsAppMessage {
  templateText: string;
}

interface Invitation {
  id: string;
  name: string;
  whatsappMessageTemplate?: string;
  template?: {
    name: string;
  };
  events: {
    id: string;
    name: string;
    venueName?: string | null;
    date: string;
    startTime?: string | null;
  }[];
}

interface WhatsAppMessageEditorProps {
  invitationId: string;
  invitation: Invitation;
  onSave: () => void;
}

export default function WhatsAppMessageEditor({
  invitationId,
  invitation,
  onSave,
}: WhatsAppMessageEditorProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<WhatsAppMessage>({
    templateText: '',
  });
  const [previewGuestName, setPreviewGuestName] = useState('Guest Name');
  const [previewToken, setPreviewToken] = useState('preview-token-123');

  useEffect(() => {
    const initial =
      invitation.whatsappMessageTemplate || generateDefaultTemplate();
    setMessage({ templateText: initial });
  }, [invitationId, invitation.whatsappMessageTemplate]);

  const generateDefaultTemplate = () => {
    const guestName = '{{guest_name}}';
    const eventName = invitation.events[0]?.name || 'Our Special Event';
    const event = invitation.events[0];
    const date = event ? formatDateOnly(event.date) : 'Date TBD';
    const venue = event?.venueName || 'Venue TBD';
    const invitationLink = `{{invitation_link}}`;

    return `Dear ${guestName},

You are cordially invited to ${invitation.name}! 🎉

✨ ${eventName}
📅 ${date}
📍 ${venue}

Click the link below to view your personalized invitation:
${invitationLink}

We look forward to celebrating with you! 🙏`;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await invitationAPI.update(invitationId, {
        whatsappMessageTemplate: message.templateText,
      });
      toast.success('WhatsApp message saved');
      onSave();
    } catch (error) {
      toast.error('Failed to save message');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    let preview = message.templateText;

    preview = preview.replace(/\{\{guest_name\}\}/g, previewGuestName);
    preview = preview.replace(
      /\{\{invitation_link\}\}/g,
      `${window.location.origin}/i/${invitation.id}/${previewToken}`
    );
    preview = preview.replace(/\{\{event_name\}\}/g, invitation.events[0]?.name || 'Event');
    preview = preview.replace(
      /\{\{event_date\}\}/g,
      invitation.events[0] ? formatDateOnly(invitation.events[0].date) : 'Date TBD'
    );
    preview = preview.replace(
      /\{\{event_venue\}\}/g,
      invitation.events[0]?.venueName || 'Venue'
    );

    return preview;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(message.templateText);
    toast.success('Message copied to clipboard');
  };

  const variables = [
    { name: 'guest_name', label: 'Guest Name', example: 'Priya Sharma' },
    { name: 'invitation_link', label: 'Invitation Link', example: 'https://...' },
    { name: 'event_name', label: 'Event Name', example: 'Wedding Ceremony' },
    { name: 'event_date', label: 'Event Date', example: 'December 15, 2026' },
    { name: 'event_venue', label: 'Event Venue', example: 'The Grand Palace' },
  ];

  return (
    <div className="space-y-6">
      {/* Message Template */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp Message Template
        </label>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">Available variables:</p>
          <div className="flex flex-wrap gap-2">
            {variables.map((v) => (
              <button
                key={v.name}
                onClick={() => {
                  setMessage({
                    ...message,
                    templateText: message.templateText + `{{${v.name}}}`,
                  });
                }}
                className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-100"
              >
                {`{{${v.name}}}`}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={message.templateText}
          onChange={(e) => setMessage({ ...message, templateText: e.target.value })}
          rows={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your WhatsApp message template..."
        />
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Message Preview</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Preview as:</label>
            <input
              type="text"
              value={previewGuestName}
              onChange={(e) => setPreviewGuestName(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm w-40"
            />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              W
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">WhatsApp Message</p>
              <div className="bg-green-50 rounded-lg p-3 whitespace-pre-wrap text-sm">
                {handlePreview()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={handleCopyToClipboard}
          className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium"
        >
          📋 Copy to Clipboard
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Message'}
        </button>
      </div>
    </div>
  );
}
