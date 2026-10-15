'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [nextPath, setNextPath] = useState('/dashboard');

  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get('next');
    if (candidate && candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.includes(String.fromCharCode(92))) {
      setNextPath(candidate);
    }
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push(nextPath);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f1f8ff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_10%,rgba(125,211,252,0.35),transparent_30%),radial-gradient(ellipse_at_90%_90%,rgba(199,210,254,0.45),transparent_33%)]" />
      <div className="w-full max-w-md space-y-8 rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_80px_-32px_rgba(2,132,199,0.28)] backdrop-blur sm:p-10">
        <div>
          <Link href="/" className="mx-auto inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-sky-400 to-blue-600 text-xl text-white shadow-md shadow-sky-200">i</span>
            <span className="text-xl">invitations<span className="text-sky-600">.</span></span>
          </Link>
          <h2 className="mt-7 text-3xl font-semibold tracking-tight text-slate-950">
            Sign in to your account
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Or{' '}
            <Link href={`/register?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-sky-700 transition hover:text-sky-900">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center rounded-full bg-sky-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in to your workspace  ↗'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
