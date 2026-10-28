'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { templateAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  isPremium: boolean;
  version: string;
  popularity: number;
  createdAt: string;
  category: {
    name: string;
  };
  _count: {
    invitations: number;
  };
}

export default function AdminTemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const templateResponse = await templateAPI.adminGetAll({ limit: 100 });
      setTemplates(templateResponse.data.data);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (templateId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'PUBLISHED') {
        await templateAPI.adminUnpublish(templateId);
      } else {
        await templateAPI.adminPublish(templateId);
      }
      toast.success('Template status updated');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to update template');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
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
              <Link href="/admin/invitations" className="text-gray-600 hover:text-gray-900">
                Invitations
              </Link>
              <Link href="/admin/templates" className="text-gray-900 font-medium">
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
          <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">No templates found</div>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <span className="text-4xl">💌</span>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                      {template.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{template.category?.name}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>v{template.version}</span>
                    <span>{template._count?.invitations || 0} invitations</span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Free</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePublish(template.id, template.status)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        template.status === 'PUBLISHED'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {template.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
