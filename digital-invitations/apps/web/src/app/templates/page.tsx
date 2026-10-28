'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TemplatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const category = searchParams?.get('category') || 'wedding';
    let template = 'royal-sandalwood';

    if (category === 'haldi') {
      template = 'haldi-marigold-urli';
    } else if (category === 'sangeet') {
      template = 'sangeet-peacock-glam';
    } else if (category === 'kankotri' || category === 'festivals') {
      template = 'kankotri-ganesh-vandana';
    } else if (category === 'love-story') {
      template = 'love-story-polaroid';
    } else if (category === 'save-the-date') {
      template = 'minimal-zen';
    }

    router.replace(`/create?template=${template}&category=${category}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fbff] text-slate-700">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600 mb-3" />
        <p className="font-serif text-lg font-bold text-slate-900">Loading Studio Customization...</p>
        <p className="text-xs text-slate-500 mt-1">Taking you directly to the interactive customization editor</p>
      </div>
    </div>
  );
}
