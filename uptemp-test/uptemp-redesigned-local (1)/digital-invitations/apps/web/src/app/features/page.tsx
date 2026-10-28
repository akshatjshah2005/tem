'use client';

import Link from 'next/link';

const phases = [
  { number: '01', title: 'Infrastructure & setup', summary: 'The foundation for a reliable invitation platform.', items: ['Next.js website and API service', 'Database schema and migrations', 'Environment configuration', 'File storage and optimized media', 'Production hosting and API connectivity'], state: 'Foundation' },
  { number: '02', title: 'Accounts & dashboard', summary: 'A personal workspace for every creator.', items: ['Registration and secure sign-in', 'Account profile and session handling', 'Invitation overview and status cards', 'Drafts, duplicate and delete actions', 'Create-invitation flow'], state: 'Core flow' },
  { number: '03', title: 'Template library', summary: 'Find a design that fits the occasion.', items: ['Wedding, engagement, birthday and other categories', 'Template search and category filters', 'Preview before choosing', 'Feature labels for galleries, RSVP and countdowns', 'Free template configuration and versioning'], state: 'Core flow' },
  { number: '04', title: 'Invitation editor', summary: 'Shape the invitation around your story.', items: ['Edit names, dates, text and event details', 'Customize colors, fonts and backgrounds', 'Manage sections and media', 'Preview before publishing', 'Undo/redo, auto-save and drag-and-drop editor enhancements'], state: 'Mixed: verify editor depth' },
  { number: '05', title: 'Events & media', summary: 'Keep all ceremonies and memories together.', items: ['Multiple events per invitation', 'Event date, time, venue and description', 'Map directions and location display', 'Photo/video gallery foundations', 'Image optimization and responsive media'], state: 'Core flow' },
  { number: '06', title: 'Guest management', summary: 'Organize your guest list and invitations.', items: ['Add and edit guests', 'Excel/CSV import and validation', 'Assign guests to selected events', 'Search, filters and guest status', 'Groups, bulk actions and export need completion/verification'], state: 'Mixed: gaps remain' },
  { number: '07', title: 'Personalized links', summary: 'Give each guest a more personal welcome.', items: ['Unique guest tokens and invitation links', 'Guest name personalization', 'Show assigned events to each guest', 'Regenerate a guest link', 'Expiry, noindex and access edge cases need testing'], state: 'Security testing needed' },
  { number: '08', title: 'WhatsApp sharing', summary: 'Share invitations in the way families already communicate.', items: ['Editable message templates', 'Personalized message preview', 'Individual WhatsApp sharing flow', 'Bulk-share request foundations', 'Automated WhatsApp Business delivery is a future integration'], state: 'Mixed: gaps remain' },
  { number: '09', title: 'Admin workspace', summary: 'Manage the platform, users and templates.', items: ['Admin dashboard and statistics foundations', 'User and invitation management', 'Template management foundations', 'Category CRUD, complete activity history and some admin actions need work'], state: 'Mixed: gaps remain' },
  { number: '10', title: 'Publishing & security', summary: 'Publish confidently and protect invitation data.', items: ['Publish and unpublish flows', 'Public and personalized invitation routes', 'Authentication and role checks', 'Rate limiting, validation and secure uploads', 'QR codes, expiry handling and durable audit logs need implementation/verification'], state: 'Launch checks required' },
  { number: '11', title: 'Testing & deployment', summary: 'A successful build is the beginning of verification.', items: ['CI build workflow', 'Unit, integration and end-to-end test coverage', 'Typecheck and lint in CI', 'Performance, accessibility and device checks', 'Monitoring, backups and restore drills'], state: 'Verification work required' },
  { number: '12', title: 'Future enhancements', summary: 'A clear home for improvements to the free invitation experience.', items: ['More free templates and languages', 'Video export after the scene renderer is stable', 'AI-assisted creation as an optional helper', 'Mobile improvements and collaboration tools', 'Additional integrations and accessibility improvements'], state: 'Roadmap' },
  { number: '13', title: 'RSVP, analytics & extras', summary: 'Understand responses and make invitations more useful.', items: ['RSVP form and owner response views', 'Analytics dashboard and exports', 'Guest group management', 'QR generation and print sheets', 'Countdowns, slideshow/lightbox and video galleries'], state: 'Mixed: gaps remain' },
];

const labelClass = (state: string) => state === 'Roadmap'
  ? 'border-violet-200 bg-violet-50 text-violet-700'
  : state === 'Foundation' || state === 'Core flow'
    ? 'border-sky-200 bg-sky-50 text-sky-700'
    : 'border-amber-200 bg-amber-50 text-amber-800';

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#f5faff] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-sky-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-xl font-black text-white shadow-lg shadow-sky-200/70">u</span>
            <span className="text-2xl font-extrabold tracking-[-0.06em]">uptemp<span className="text-sky-600">.</span></span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/templates" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-sky-50">Templates</Link>
            <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-sky-50">Log in</Link>
            <Link href="/register?next=%2Fdashboard%2Fcreate" className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-200 hover:bg-sky-700">Start creating</Link>
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-sky-100 bg-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_8%_0%,rgba(125,211,252,0.35),transparent_35%),radial-gradient(ellipse_at_95%_20%,rgba(199,210,254,0.45),transparent_35%)]" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-sky-800"><span className="h-2 w-2 rounded-full bg-sky-500" /> The complete product map</p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-slate-950 sm:text-6xl">Every part of your invitation journey, <span className="bg-gradient-to-r from-sky-600 to-indigo-500 bg-clip-text text-transparent">planned in one place.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Explore Uptemp's 13-phase product plan—from account creation and design to guest links, publishing, RSVP and the future roadmap. We distinguish existing foundations from work that still needs implementation or testing.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/templates" className="rounded-full bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700">Explore templates ↗</Link>
              <Link href="/register?next=%2Fdashboard%2Fcreate" className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50">Create an invitation</Link>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['13','Product phases'],['01','Shared design system'],['∞','Ways to personalize'],['✓','Status transparency']].map(([value,label]) => <div key={label} className="rounded-2xl border border-sky-100 bg-white/85 p-5 shadow-sm shadow-sky-100/50"><p className="text-3xl font-semibold tracking-tight text-sky-700">{value}</p><p className="mt-1 text-sm font-semibold text-slate-600">{label}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">Phase-by-phase</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">The full feature map</h2></div>
          <p className="max-w-xl text-sm leading-6 text-slate-500">Status labels describe current audit findings—not a promise that every item is already live.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {phases.map((phase) => <article key={phase.number} className="group rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm shadow-sky-100/30 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-lg font-black text-white shadow-md shadow-sky-200">{phase.number}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold tracking-tight text-slate-950">{phase.title}</h3><span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${labelClass(phase.state)}`}>{phase.state}</span></div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{phase.summary}</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {phase.items.map((item) => <li key={item} className="flex gap-2.5 text-sm leading-5 text-slate-600"><span className="mt-0.5 shrink-0 text-sky-600">✦</span><span>{item}</span></li>)}
            </ul>
          </article>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="rounded-[2rem] bg-gradient-to-br from-[#0b2b4d] via-[#075985] to-[#2563eb] px-6 py-10 text-white shadow-2xl shadow-sky-200/60 sm:px-10 sm:py-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-200">Build transparently</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Designed for the full journey. Verified one feature at a time.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-100 sm:text-base">The visual design and feature inventory are the plan. Production readiness still depends on finishing missing requirements, connecting the API and database, and running end-to-end tests on real user flows.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/register?next=%2Fdashboard%2Fcreate" className="rounded-full bg-white px-6 py-3.5 text-sm font-bold text-sky-800 hover:bg-sky-50">Start an invitation ↗</Link><Link href="/templates" className="rounded-full border border-white/25 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10">Browse themes</Link></div>
        </div>
      </section>

      <footer className="border-t border-sky-100 bg-white px-5 py-7 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Link href="/" className="font-extrabold tracking-tight text-slate-900">uptemp<span className="text-sky-600">.</span></Link><p className="text-xs text-slate-500">A thoughtful invitation experience, built with transparent feature status.</p><Link href="/" className="text-sm font-semibold text-sky-700 hover:text-sky-900">Back to home ↑</Link></div></footer>
    </main>
  );
}
