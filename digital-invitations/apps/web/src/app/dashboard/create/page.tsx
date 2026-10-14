'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { invitationAPI, templateAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  _count: {
    templates: number;
  };
}

interface Template {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string;
  features: any;
  isPremium: boolean;
  category: {
    name: string;
  };
}

export default function CreateInvitationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    categorySlug: '',
    templateId: '',
  });

  useEffect(() => {
    if (!authLoading && !user && typeof window !== 'undefined') {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(returnTo)}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await templateAPI.getCategories();
      const loadedCategories: Category[] = response.data.data || [];
      setCategories(loadedCategories);

      // Preserve the category and template selected from the public template gallery.
      if (typeof window !== 'undefined') {
        const query = new URLSearchParams(window.location.search);
        const requestedCategory = query.get('category');
        const requestedTemplate = query.get('template');
        const matchedCategory = loadedCategories.find((item) => item.slug === requestedCategory);

        if (matchedCategory) {
          setFormData((current) => ({
            ...current,
            categoryId: matchedCategory.id,
            categorySlug: matchedCategory.slug,
            templateId: requestedTemplate || '',
          }));
          try {
            const templateResponse = await templateAPI.getAll({ category: matchedCategory.slug, limit: 100 });
            setTemplates(templateResponse.data.data || []);
          } catch {
            toast.error('The selected category loaded, but its templates could not be loaded.');
          }
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async (categorySlug: string) => {
    try {
      const response = await templateAPI.getAll({ category: categorySlug });
      setTemplates(response.data.data);
    } catch (error) {
      toast.error('Failed to load templates');
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter invitation name');
      return;
    }

    try {
      setCreating(true);
      const response = await invitationAPI.create({
        name: formData.name,
        templateId: formData.templateId || undefined,
      });
      toast.success('Invitation created!');
      router.push(`/dashboard/invitations/${response.data.data.id}`);
    } catch (error) {
      toast.error('Failed to create invitation');
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-900">Create New Invitation</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <StepIndicator number={1} title="Name" active={step === 1} completed={step > 1} />
          <div className="w-12 h-px bg-gray-300 mx-2"></div>
          <StepIndicator number={2} title="Category" active={step === 2} completed={step > 2} />
          <div className="w-12 h-px bg-gray-300 mx-2"></div>
          <StepIndicator number={3} title="Template" active={step === 3} completed={step > 3} />
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Name Your Invitation</h2>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invitation Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Akshat & Priya Wedding"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                This will be used to create your invitation URL
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(formData.categorySlug && formData.templateId ? 3 : 2)}
                disabled={!formData.name.trim()}
                className="bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      categoryId: category.id,
                      categorySlug: category.slug,
                      templateId: '',
                    });
                    setTemplates([]);
                    setStep(3);
                    fetchTemplates(category.slug);
                  }}
                    className={`p-4 border-2 rounded-lg text-left hover:border-primary-500 transition-colors ${
                      formData.categoryId === category.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                >
                  <span className="text-2xl mb-2 block">{category.icon}</span>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category._count.templates} templates</p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Template */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Template</h2>
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No templates available in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={formData.templateId === template.id}
                    onSelect={() => setFormData({ ...formData, templateId: template.id })}
                  />
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Invitation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  title,
  active,
  completed,
}: {
  number: number;
  title: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          completed
            ? 'bg-primary-600 text-white'
            : active
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <span className={`ml-2 text-sm font-medium ${active ? 'text-primary-600' : 'text-gray-500'}`}>
        {title}
      </span>
    </div>
  );
}

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: Template;
  selected: boolean;
  onSelect: () => void;
}) {
  const features = template.features as any;
  
  return (
    <button
      onClick={onSelect}
      className={`border-2 rounded-lg overflow-hidden text-left transition-all ${
        selected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="h-32 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
        {template.thumbnailUrl ? (
          <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">🎨</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900">{template.name}</h3>
          {template.isPremium && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Premium</span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{template.category.name}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {features?.multipleEvents && <FeatureBadge>Events</FeatureBadge>}
          {features?.gallery && <FeatureBadge>Gallery</FeatureBadge>}
          {features?.guestPersonalization && <FeatureBadge>Personalized</FeatureBadge>}
          {features?.map && <FeatureBadge>Map</FeatureBadge>}
          {features?.countdown && <FeatureBadge>Countdown</FeatureBadge>}
        </div>
      </div>
    </button>
  );
}

function FeatureBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
      {children}
    </span>
  );
}
