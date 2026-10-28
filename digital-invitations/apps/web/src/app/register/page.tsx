'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

/** Strips formatting and country/trunk prefixes so any mobile format works. */
function normalizeMobile(raw: string): string {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 13 && digits.startsWith('910')) digits = digits.slice(3);
  return digits;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, demoLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (formData.name.trim().length < 2) return 'Please enter your full name';
    if (!formData.email.trim() || formData.email.trim().length < 3) return 'Please enter an email address or username';

    const mobile = normalizeMobile(formData.mobile);
    if (mobile.length > 0 && mobile.length < 8) {
      return 'Please enter a valid mobile number';
    }

    if (formData.password.length < 4) return 'Password must be at least 4 characters long';

    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: normalizeMobile(formData.mobile),
        password: formData.password,
      });
      const candidate = new URLSearchParams(window.location.search).get('next');
      const destination = candidate && candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.includes(String.fromCharCode(92)) ? candidate : '/dashboard';
      router.push(destination);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f1f8ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_10%,rgba(125,211,252,0.35),transparent_30%),radial-gradient(ellipse_at_90%_90%,rgba(199,210,254,0.45),transparent_33%)]" />
      <div className="w-full max-w-lg space-y-8 rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_80px_-32px_rgba(2,132,199,0.28)] backdrop-blur sm:p-10">
        <div>
          <Link href="/" className="mx-auto inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-sky-400 to-blue-600 text-xl text-white shadow-md shadow-sky-200">u</span>
            <span className="text-xl">uptemp<span className="text-sky-600">.</span></span>
          </Link>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
            Create your account
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              onClick={(event) => {
                const destination = new URLSearchParams(window.location.search).get('next');
                if (destination && destination.startsWith('/') && !destination.startsWith('//')) {
                  event.preventDefault();
                  router.push(`/login?next=${encodeURIComponent(destination)}`);
                }
              }}
              className="font-semibold text-sky-700 transition hover:text-sky-900"
            >
              Sign in
            </Link>
            <span className="mx-2 text-slate-300">·</span><Link href="/features" className="font-semibold text-sky-700 hover:text-sky-900">Explore features</Link>
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Enter your email or username (e.g. ak@123)"
              />
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-semibold text-slate-700">
                Mobile Number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                autoComplete="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="10-digit mobile number"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Indian mobile number, 10 digits starting with 6-9. The +91 prefix is added for you.
              </p>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Create a password"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Minimum 4 characters.
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center rounded-full bg-[#123b5d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-950/20 transition hover:-translate-y-0.5 hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create your free account  ↗'}
            </button>

            <button
              type="button"
              onClick={() => {
                demoLogin('akshat@uptemp.in', 'Akshat Shah');
                const candidate = new URLSearchParams(window.location.search).get('next');
                router.push(candidate || '/dashboard');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-5 py-3 text-xs font-bold text-sky-800 transition hover:bg-sky-100 hover:text-sky-950"
            >
              <span>⚡</span> 1-Click Instant Demo Login (Akshat Shah)
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
