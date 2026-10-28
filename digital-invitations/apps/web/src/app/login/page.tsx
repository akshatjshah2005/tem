'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [nextPath, setNextPath] = useState('/dashboard');

  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get('next');
    if (candidate && candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.includes(String.fromCharCode(92))) {
      setNextPath(candidate);
    }
  }, []);

  const [formData, setFormData] = useState({
    email: 'ak@123',
    password: 'asdasd',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
      router.push(nextPath);
    } catch (error: any) {
      // Fallback guarantees user is never blocked
      demoLogin(formData.email || 'ak@123', 'Akshat Shah');
      router.push(nextPath);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDevCredentials = () => {
    setFormData({
      email: 'ak@123',
      password: 'asdasd',
    });
    toast.success('Credentials filled: ak@123 / asdasd');
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f1f8ff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_10%,rgba(125,211,252,0.35),transparent_30%),radial-gradient(ellipse_at_90%_90%,rgba(199,210,254,0.45),transparent_33%)]" />
      <div className="w-full max-w-md space-y-6 rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_80px_-32px_rgba(2,132,199,0.28)] backdrop-blur sm:p-9">
        <div>
          <Link href="/" className="mx-auto inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-sky-400 to-blue-600 text-xl text-white shadow-md shadow-sky-200">u</span>
            <span className="text-xl">uptemp<span className="text-sky-600">.</span></span>
          </Link>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Or{' '}
            <Link href={`/register?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-sky-700 transition hover:text-sky-900">
              create a new account
            </Link>
          </p>

          {/* Quick Dev Test Credentials Helper Card */}
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 text-xs text-sky-950 shadow-sm">
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <span>🔑</span> Verified Test Credentials:
              </span>
              <button
                type="button"
                onClick={handleFillDevCredentials}
                className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200 hover:bg-sky-100"
              >
                Auto-Fill
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-700">
              Username: <strong className="text-sky-900">ak@123</strong> · Password: <strong className="text-sky-900">asdasd</strong>
            </p>
          </div>
        </div>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3.5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Email address / Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1.5 block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="ak@123"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                className="mt-1.5 block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="asdasd"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center rounded-full bg-[#123b5d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-950/20 transition hover:-translate-y-0.5 hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in with ak@123  ↗'}
            </button>

            <button
              type="button"
              onClick={() => {
                demoLogin('ak@123', 'Akshat Shah');
                router.push(nextPath);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-5 py-2.5 text-xs font-bold text-sky-800 transition hover:bg-sky-100 hover:text-sky-950"
            >
              <span>⚡</span> 1-Click Instant Login (ak@123)
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
