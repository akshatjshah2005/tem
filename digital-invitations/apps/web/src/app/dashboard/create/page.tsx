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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4faff] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" className="inline-flex shrink-0 items-center gap-2 font-bold text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white">i</span>
                <span className="hidden sm:inline">invitations<span className="text-sky-600">.</span></span>
              </Link>
              <span className="hidden h-7 w-px bg-slate-200 sm:block" aria-hidden="true" />
              <Link href="/dashboard" className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-sky-50 hover:text-sky-800">← Dashboard</Link>
              <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700">Your invitation studio</p><h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">Create a new invitation</h1></div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex items-center justify-center rounded-2xl border border-sky-100 bg-white/80 px-3 py-5 shadow-sm sm:mb-10 sm:px-6">
          <StepIndicator number={1} title="Name" active={step === 1} completed={step > 1} />
          <div className="mx-3 h-px w-6 bg-sky-200 sm:mx-4 sm:w-14"></div>
          <StepIndicator number={2} title="Category" active={step === 2} completed={step > 2} />
          <div className="mx-3 h-px w-5 bg-sky-200 sm:mx-4 sm:w-12"></div>
          <StepIndicator number={3} title="Template" active={step === 3} completed={step > 3} />
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="rounded-[1.8rem] border border-sky-100 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(2,132,199,0.28)] sm:p-9">
            <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Name Your Invitation</h2>
            <div className="max-w-md">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Invitation Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Akshat & Priya Wedding"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
              <p className="mt-3 text-sm leading-6 text-slate-500">
                This will be used to create your invitation URL
              </p>
            </div>
            <div className="mt-7 flex justify-end">
              <button
                onClick={() => setStep(formData.categorySlug && formData.templateId ? 3 : 2)}
                disabled={!formData.name.trim()}
                className="rounded-full bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="rounded-[1.8rem] border border-sky-100 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(2,132,199,0.28)] sm:p-9">
            <div className="mb-7"><h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">What are you celebrating?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Choose an occasion to find themes and ceremony details that fit.</p></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    className={`rounded-2xl border-2 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 ${
                      formData.categoryId === category.id
                        ? 'border-sky-500 bg-sky-50 shadow-md shadow-sky-100'
                        : 'border-slate-200 bg-white'
                    }`}
                >
                  <span className="text-2xl mb-2 block">{category.icon}</span>
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{category._count.templates} themes</p>
                </button>
              ))}
            </div>
            <div className="mt-7 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-800"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Template */}
        {step === 3 && (
          <div className="rounded-[1.8rem] border border-sky-100 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(2,132,199,0.28)] sm:p-9">
            <div className="mb-7"><h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Choose your visual theme</h2><p className="mt-2 text-sm leading-6 text-slate-500">Pick a starting point. You can personalize the invitation details next.</p></div>
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No themes are available in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
            <div className="mt-7 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-800"
              >
                ← Back
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="rounded-full bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:opacity-50"
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
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
          completed
            ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
            : active
            ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <span className={`ml-2 hidden text-sm font-semibold sm:inline ${active ? 'text-sky-700' : 'text-slate-400'}`}>
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
      className={`group overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? 'border-sky-500 ring-4 ring-sky-100' : 'border-slate-200 hover:border-sky-300'
      }`}
    >
      <div className="flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-white to-indigo-100">
        {template.thumbnailUrl ? (
          <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-serif text-4xl text-sky-700">✦</span>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-slate-900">{template.name}</h3>
          {template.isPremium && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">Premium</span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">{template.category.name}</p>
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
    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">
      {children}
    </span>
  );
}
