import Link from 'next/link';

const occasions = [
  { icon: '✦', title: 'Wedding', note: 'Your story, beautifully told' },
  { icon: '♡', title: 'Engagement', note: 'The beginning of forever' },
  { icon: '✺', title: 'Haldi & Mehendi', note: 'Colourful moments together' },
  { icon: '✧', title: 'Birthday', note: 'Make their day feel special' },
  { icon: '⌂', title: 'Housewarming', note: 'A warm new beginning' },
  { icon: '❋', title: 'Every celebration', note: 'Your moment, your way' },
];

const platformAreas = [
  ['01', 'Infrastructure & setup', 'Reliable app foundation, database and deployment'],
  ['02', 'Accounts & dashboard', 'Secure sign-in, profile and invitation workspace'],
  ['03', 'Template library', 'Categories, search, previews and template selection'],
  ['04', 'Invitation editor', 'Text, colors, media, sections and live preview'],
  ['05', 'Events & media', 'Ceremonies, venues, maps, photos and galleries'],
  ['06', 'Guest management', 'Guest list, import, assignment, filters and groups'],
  ['07', 'Personalized links', 'Unique guest links, names and assigned events'],
  ['08', 'WhatsApp sharing', 'Message templates, previews and share flows'],
  ['09', 'Admin workspace', 'Users, invitations, templates and platform controls'],
  ['10', 'Publishing & security', 'Publish controls, public pages and access safeguards'],
  ['11', 'Testing & deployment', 'Build checks, E2E testing, monitoring and backups'],
  ['12', 'Future roadmap', 'Premium plans, AI, marketplace and video features'],
  ['13', 'RSVP & analytics', 'Responses, guest insights, QR codes and advanced gallery'],
];

const features = [
  { n: '01', icon: '✦', title: 'A little film, not another card', body: 'Create an invitation that unfolds like a story, with a cinematic feel designed for the phone in every guest’s hand.' },
  { n: '02', icon: '◈', title: 'Every event in one place', body: 'Bring ceremonies, timings, venues and directions together in one easy-to-share invitation.' },
  { n: '03', icon: '♡', title: 'Make every guest feel included', body: 'Personal invitation links can greet guests by name and show the events assigned to them.' },
  { n: '04', icon: '↗', title: 'Share it in seconds', body: 'Send a link to family and friends, and let guests open the invitation directly in their browser.' },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="Uptemp home" className="inline-flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-xl font-black text-white shadow-lg shadow-sky-200/70">u</span>
      <span className="text-[1.35rem] font-extrabold tracking-[-0.06em] text-slate-950">uptemp<span className="text-sky-600">.</span>{compact ? null : <span className="ml-2 hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:inline">invitations</span>}</span>
    </Link>
  );
}

function Arrow() {
  return <span aria-hidden="true" className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">↗</span>;
}

function InvitationPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="absolute -left-2 top-16 z-20 hidden -rotate-6 rounded-2xl border border-white bg-white/95 p-3.5 shadow-xl shadow-sky-900/10 sm:block">
        <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700">✓</span><span><strong className="block text-xs text-slate-800">One link, all events</strong><span className="text-[11px] text-slate-500">Easy for every guest</span></span></div>
      </div>
      <div className="absolute -right-1 top-36 z-20 hidden rotate-3 rounded-2xl border border-white bg-white/95 p-3.5 shadow-xl shadow-sky-900/10 sm:block">
        <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-lg text-sky-700">♡</span><span><strong className="block text-xs text-slate-800">Made personal</strong><span className="text-[11px] text-slate-500">A warm hello for guests</span></span></div>
      </div>
      <div className="relative mx-auto w-[min(100%,360px)] rotate-[1deg] rounded-[2.8rem] border-[8px] border-slate-900 bg-slate-900 p-2 shadow-[0_38px_100px_-32px_rgba(2,132,199,0.5)] sm:mr-10">
        <div className="relative min-h-[540px] overflow-hidden rounded-[2.1rem] bg-[#f7faff]">
          <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-900" />
          <div className="relative flex min-h-[540px] flex-col items-center overflow-hidden bg-gradient-to-b from-[#0b2948] via-[#174f78] to-[#081c34] px-6 pb-7 pt-14 text-center text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(125,211,252,0.5),transparent_34%),radial-gradient(ellipse_at_50%_80%,rgba(56,189,248,0.18),transparent_44%)]" />
            <div className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full border border-sky-100/25" />
            <div className="pointer-events-none absolute left-1/2 top-28 h-52 w-52 -translate-x-1/2 rounded-full border border-sky-100/25" />
            <div className="relative z-10 mt-7 flex h-24 w-24 items-center justify-center rounded-full border border-sky-100/40 bg-white/5 text-5xl text-sky-100">✺</div>
            <p className="relative z-10 mt-7 text-[10px] font-semibold uppercase tracking-[0.32em] text-sky-200">Together with our families</p>
            <h2 className="relative z-10 mt-5 font-serif text-[2.6rem] leading-[1.05] tracking-tight">Riya <span className="text-sky-200">&amp;</span> Arjun</h2>
            <p className="relative z-10 mt-4 font-serif text-lg italic text-sky-100">invite you to celebrate</p>
            <div className="relative z-10 my-6 h-px w-16 bg-sky-200/70" />
            <p className="relative z-10 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">The wedding celebration</p>
            <p className="relative z-10 mt-3 text-sm text-white/80">12 December · 6:30 PM</p>
            <div className="relative z-10 mt-7 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold backdrop-blur">Open the invitation ↗</div>
            <p className="relative z-10 mt-auto pt-8 text-[9px] uppercase tracking-[0.3em] text-sky-200/75">A beautiful beginning</p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-5 -left-3 -z-10 h-40 w-40 rounded-full bg-sky-200/60 blur-3xl" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/templates" className="text-sm font-semibold text-slate-600 transition hover:text-sky-700">Explore templates</Link>
            <Link href="/features" className="text-sm font-semibold text-slate-600 transition hover:text-sky-700">All features</Link>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 transition hover:text-sky-700">How it works</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-full px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 sm:px-4">Log in</Link>
            <Link href="/register?next=%2Fdashboard%2Fcreate" className="group inline-flex items-center rounded-full bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-200/70 transition hover:-translate-y-0.5 hover:bg-sky-700 sm:px-5">Get started <Arrow /></Link>
          </div>
        </div>
      </nav>

      <section className="relative isolate overflow-hidden bg-[#f3faff]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_15%,rgba(125,211,252,0.38),transparent_32%),radial-gradient(ellipse_at_92%_12%,rgba(199,210,254,0.50),transparent_32%),linear-gradient(180deg,#f3faff_0%,#ffffff_100%)]" />
        <div className="pointer-events-none absolute -right-32 top-10 -z-10 h-[32rem] w-[32rem] rounded-full border border-sky-200/60" />
        <div className="pointer-events-none absolute -right-12 top-28 -z-10 h-[24rem] w-[24rem] rounded-full border border-sky-200/60" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1fr_0.95fr] lg:gap-10 lg:px-10 lg:pb-24 lg:pt-20">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/85 px-3.5 py-2 text-[11px] font-extrabold tracking-[0.12em] text-sky-800 shadow-sm shadow-sky-100"><span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.12)]" /> MADE FOR YOUR BIG MOMENTS</div>
            <h1 className="max-w-2xl text-[2.8rem] font-semibold leading-[1.04] tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-[4.35rem]">Your invitation should feel like <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-500 bg-clip-text text-transparent">the beginning.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Cinematic digital invitations for weddings and every celebration around them. Add your story, bring your events together, then share one beautiful link.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?next=%2Fdashboard%2Fcreate" className="group inline-flex items-center justify-center rounded-full bg-sky-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700">Create your invitation <Arrow /></Link>
              <Link href="/templates" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50">Explore templates <span className="ml-2">↓</span></Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 sm:text-sm"><span><span className="mr-2 text-sky-600">✓</span>Designed for phones</span><span><span className="mr-2 text-sky-600">✓</span>Personal guest links</span><span><span className="mr-2 text-sky-600">✓</span>Easy to update</span></div>
            <div className="mt-10 flex items-center gap-4 border-t border-sky-200/70 pt-6">
              <div className="flex -space-x-2"><span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-sm">💍</span><span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-sm">🎉</span><span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-cyan-100 text-sm">♡</span></div>
              <p className="text-xs leading-5 text-slate-500"><strong className="block text-slate-800">For every kind of celebration</strong>Wedding · Birthday · Engagement · More</p>
            </div>
          </div>
          <InvitationPreview />
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-7">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 text-center text-xs font-bold uppercase tracking-[0.13em] text-slate-400 sm:px-8 lg:justify-between lg:px-10"><span>One thoughtful link</span><span className="hidden h-1 w-1 rounded-full bg-sky-300 sm:block" /><span>Every event together</span><span className="hidden h-1 w-1 rounded-full bg-sky-300 sm:block" /><span>Personalized for guests</span><span className="hidden h-1 w-1 rounded-full bg-sky-300 sm:block" /><span>Made to share</span></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-700">Find your moment</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl">One place for all the things worth celebrating.</h2></div><Link href="/templates" className="group inline-flex w-fit items-center text-sm font-bold text-sky-700 hover:text-sky-900">Browse all templates <Arrow /></Link></div>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {occasions.map((occasion, index) => <Link href="/templates" key={occasion.title} className="group rounded-2xl border border-slate-200/80 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60 sm:p-5"><span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition group-hover:scale-105 ${index % 2 ? 'bg-indigo-50 text-indigo-600' : 'bg-sky-50 text-sky-700'}`}>{occasion.icon}</span><h3 className="mt-4 text-sm font-bold text-slate-900">{occasion.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{occasion.note}</p></Link>)}
        </div>
      </section>

      <section id="features" className="bg-[#f5faff] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-700">More than an invitation</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl">All the little details. One lovely experience.</h2><p className="mt-4 text-base leading-7 text-slate-600">The practical information your guests need, presented with the feeling your occasion deserves.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => <article key={feature.n} className="rounded-[1.7rem] border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100/50 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-100/60"><div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-2xl text-sky-700">{feature.icon}</span><span className="text-xs font-extrabold tracking-[0.18em] text-sky-300">{feature.n}</span></div><h3 className="mt-6 text-lg font-bold tracking-tight text-slate-950">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{feature.body}</p></article>)}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[['⌖','Venue directions','Help guests find the place.'],['◷','Live countdown','Build excitement as the day gets closer.'],['▧','Photo gallery','Share the memories around your moment.'],['✓','Guest RSVP','Collect replies from the invitation.']].map(([icon,title,body]) => <div key={title} className="flex items-center gap-3 rounded-2xl border border-sky-100/80 bg-white/70 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-sky-700 shadow-sm">{icon}</span><span><strong className="block text-sm text-slate-800">{title}</strong><span className="mt-0.5 block text-xs text-slate-500">{body}</span></span></div>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-700">Simple from the start</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl">From your idea to their inbox in three steps.</h2><p className="mt-4 text-base leading-7 text-slate-600">No design experience needed. Start with a theme and make it yours.</p><Link href="/register?next=%2Fdashboard%2Fcreate" className="group mt-7 inline-flex items-center rounded-full bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700">Start creating <Arrow /></Link></div>
          <div className="space-y-4">
            {[['01','Choose a theme','Pick a visual style that fits your celebration.'],['02','Add your details','Include names, events, venues, photos and the details guests need.'],['03','Publish and share','Create your invitation link and send it to family and friends.']].map(([n,title,body]) => <div key={n} className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sm font-extrabold text-sky-700">{n}</span><div><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{body}</p></div></div>)}
          </div>
        </div>
      </section>


      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-700">The complete platform</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl">More than a beautiful invite. The whole journey.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">From the first design choice to guest responses, Uptemp is planned across 13 connected product areas.</p></div>
            <Link href="/features" className="group inline-flex w-fit items-center text-sm font-bold text-sky-700 hover:text-sky-900">Explore all 13 phases <Arrow /></Link>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {platformAreas.map(([number,title,body]) => <Link key={number} href="/features" className="group flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/60 sm:p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-extrabold text-sky-700 group-hover:bg-sky-600 group-hover:text-white">{number}</span><span><strong className="block text-sm font-bold text-slate-900">{title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{body}</span></span></Link>)}
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">Some advanced items are still planned or require testing. <Link href="/features" className="font-bold text-sky-700 underline underline-offset-4">See feature status and details.</Link></p>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b2b4d] via-[#075985] to-[#2563eb] px-6 py-12 text-center text-white shadow-2xl shadow-sky-200/60 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/15" /><div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/15" />
          <p className="relative text-xs font-extrabold uppercase tracking-[0.22em] text-sky-200">Your moment deserves this</p><h2 className="relative mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Make the invitation part of the memory.</h2><p className="relative mx-auto mt-4 max-w-xl text-sm leading-6 text-sky-100 sm:text-base">Create something personal, beautiful and easy to share.</p><Link href="/register?next=%2Fdashboard%2Fcreate" className="group relative mt-8 inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-extrabold text-sky-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-50">Create your invitation <Arrow /></Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><Brand compact /><p className="text-xs text-slate-500">Thoughtful invitations for moments that matter.</p><div className="flex gap-5 text-sm font-semibold text-slate-500"><Link href="/templates" className="hover:text-sky-700">Templates</Link><Link href="/features" className="hover:text-sky-700">Features</Link><Link href="/login" className="hover:text-sky-700">Log in</Link><Link href="/register" className="hover:text-sky-700">Create account</Link></div></div>
      </footer>
    </main>
  );
}
