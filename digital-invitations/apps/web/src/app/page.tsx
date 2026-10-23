import Link from 'next/link';

const occasions = [
  { symbol: '✦', title: 'Wedding', detail: 'A timeless beginning', tone: 'from-sky-50 to-amber-50' },
  { symbol: '♡', title: 'Engagement', detail: 'The promise of forever', tone: 'from-violet-50 to-sky-50' },
  { symbol: '✺', title: 'Haldi & Mehendi', detail: 'Colour, music and joy', tone: 'from-amber-50 to-sky-50' },
  { symbol: '✧', title: 'Birthday', detail: 'Make their day memorable', tone: 'from-sky-50 to-sky-50' },
  { symbol: '⌂', title: 'Housewarming', detail: 'Celebrate a new chapter', tone: 'from-emerald-50 to-teal-50' },
  { symbol: '❋', title: 'Every occasion', detail: 'Your moment, your style', tone: 'from-sky-50 to-sky-50' },
];

const benefits = [
  { icon: '✦', title: 'Beautiful by design', text: 'Thoughtfully designed invitations that feel like keepsakes, not generic forms.' },
  { icon: '✎', title: 'Make it yours', text: 'Personalize names, details, event schedules and the message your guests receive.' },
  { icon: '↗', title: 'Share in seconds', text: 'Publish one convenient link and share it with friends and family.' },
  { icon: '♡', title: 'Stay in the loop', text: 'Manage your guest list and keep track of responses from one workspace.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5faff] text-[#142b45]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[700px] bg-[radial-gradient(ellipse_at_top_left,_rgba(251,191,190,0.23),_transparent_50%),radial-gradient(ellipse_at_top_right,_rgba(253,230,138,0.22),_transparent_45%)]" />
      <header className="relative z-10 border-b border-sky-950/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="Uptemp home">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#123b5d] text-xl text-white shadow-lg shadow-sky-950/15">✦</span>
            <span className="leading-tight">
              <span className="block font-serif text-2xl font-bold tracking-tight text-[#123b5d]">Uptemp</span>
              <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.24em] text-sky-700">Digital invitations</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <Link className="transition hover:text-[#123b5d]" href="/templates">Templates</Link>
            <a className="transition hover:text-[#123b5d]" href="#how-it-works">How it works</a>
            <a className="transition hover:text-[#123b5d]" href="#features">Features</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-full px-3 py-2 text-sm font-bold text-[#123b5d] transition hover:bg-sky-50 sm:px-4">Log in</Link>
            <Link href="/register" className="rounded-full bg-[#123b5d] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-950/15 transition hover:-translate-y-0.5 hover:bg-sky-800 sm:px-5">Get started <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-sky-800 shadow-sm">
            <span className="text-base">✧</span> Every celebration deserves a beautiful invitation
          </div>
          <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[1.04] tracking-[-0.045em] text-[#123b5d] sm:text-6xl lg:text-7xl">
            Beautiful invitations. <span className="italic text-sky-700">Unforgettable</span> moments.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Create elegant digital invitations for weddings, engagements, birthdays and every moment worth gathering for. Personal, effortless and ready to share.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#123b5d] px-7 py-4 text-sm font-bold text-white shadow-xl shadow-sky-950/15 transition hover:-translate-y-0.5 hover:bg-sky-800">Create your invitation <span>↗</span></Link>
            <Link href="/templates" className="inline-flex items-center justify-center rounded-full border border-sky-950/15 bg-white px-7 py-4 text-sm font-bold text-[#123b5d] transition hover:border-sky-300 hover:bg-amber-50">Explore templates</Link>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-2"><span className="text-sky-600">✦</span> Personalizable designs</span>
            <span className="flex items-center gap-2"><span className="text-sky-600">✦</span> Easy sharing</span>
            <span className="flex items-center gap-2"><span className="text-sky-600">✦</span> Guest responses</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[590px]">
          <div className="absolute -inset-7 rounded-[3rem] bg-gradient-to-br from-sky-100/70 via-white to-amber-100/70 blur-2xl" />
          <div className="relative grid grid-cols-[.82fr_1fr] items-center gap-3 sm:gap-5">
            <div className="relative z-10 -mr-8 mt-16 rounded-2xl border border-white/80 bg-white/85 p-3 shadow-xl shadow-sky-950/10 backdrop-blur sm:-mr-12 sm:p-4">
              <div className="rounded-xl bg-gradient-to-b from-[#f8e8e6] via-[#fff9ef] to-[#f5e3d1] p-3 text-center sm:p-5">
                <div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-full border border-sky-500/50 text-sky-700">✦</div>
                <p className="font-serif text-[10px] italic text-sky-800 sm:text-xs">Together with their families</p>
                <p className="mt-2 font-serif text-xl leading-tight text-[#123b5d] sm:text-3xl">Riya <span className="italic text-sky-700">&</span> Arjun</p>
                <div className="mx-auto my-4 h-px w-12 bg-sky-500/60" />
                <p className="text-[9px] uppercase tracking-[0.22em] text-slate-500 sm:text-[10px]">Joyfully invite you</p>
                <p className="mt-2 font-serif text-sm text-[#123b5d] sm:text-base">12 December 2026</p>
                <div className="mt-4 overflow-hidden rounded-lg bg-white/70 p-2">
                  <div className="h-20 rounded-md bg-[radial-gradient(ellipse_at_50%_100%,rgba(217,119,6,.28),transparent_60%),linear-gradient(135deg,#fff7ed,#fce7f3)] sm:h-28" />
                  <p className="mt-2 font-serif text-xs italic text-sky-800">A day to remember</p>
                </div>
              </div>
              <p className="pt-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">A little preview of your story</p>
            </div>
            <div className="relative rounded-[2rem] border-[5px] border-[#142b45] bg-[#142b45] p-2 shadow-2xl shadow-sky-950/25 sm:rounded-[2.5rem] sm:border-[7px] sm:p-2.5">
              <div className="overflow-hidden rounded-[1.5rem] bg-[#fdf8f2] sm:rounded-[2rem]">
                <div className="flex items-center justify-between bg-white px-4 py-3 text-[9px] font-bold text-slate-500"><span>9:41</span><span>● ● ▰</span></div>
                <div className="relative bg-gradient-to-b from-sky-100 via-[#fff8ef] to-[#fdf8f2] px-4 pb-6 pt-7 text-center sm:px-6 sm:pb-8 sm:pt-10">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-sky-500/40 font-serif text-lg text-sky-700">❦</span>
                  <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.24em] text-sky-800 sm:text-[10px]">The celebration of love</p>
                  <h2 className="mt-3 font-serif text-3xl leading-none text-[#123b5d] sm:text-4xl">Riya <span className="italic text-sky-700">&</span> Arjun</h2>
                  <p className="mx-auto mt-4 max-w-[210px] text-[10px] leading-5 text-slate-600 sm:text-xs">With joyful hearts, we invite you to be part of our special day.</p>
                  <div className="mx-auto mt-6 flex max-w-[210px] items-center justify-center gap-4 rounded-xl border border-sky-200/80 bg-white/75 p-3">
                    <div><p className="font-serif text-xl text-[#123b5d]">12</p><p className="text-[8px] uppercase tracking-widest text-slate-500">Dec</p></div>
                    <div className="h-8 w-px bg-sky-200" />
                    <div className="text-left"><p className="font-serif text-xs text-[#123b5d]">The Grand Palace</p><p className="mt-1 text-[9px] text-slate-500">Ahmedabad, Gujarat</p></div>
                  </div>
                  <div className="mt-5 rounded-xl bg-[#123b5d] px-4 py-3 text-[10px] font-bold text-white shadow-lg">We would love to see you ♡</div>
                </div>
              </div>
              <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-white/60" />
            </div>
          </div>
          <div className="absolute -right-1 top-8 hidden rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-xl shadow-sky-950/10 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700">Made for your moment</p>
            <p className="mt-1 text-xs font-semibold text-[#123b5d]">Personal. Elegant. Yours.</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-sky-950/5 bg-white/75">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-7 sm:px-8 md:grid-cols-4">
          {[['01', 'Choose a design'], ['02', 'Make it personal'], ['03', 'Share your link'], ['04', 'Welcome your guests']].map(([number, label]) => (
            <div key={number} className="flex items-center gap-3"><span className="font-serif text-2xl italic text-sky-700">{number}</span><span className="text-sm font-semibold text-slate-600">{label}</span></div>
          ))}
        </div>
      </section>

      <section id="occasions" className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-700">Made for every gathering</p><h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-[#123b5d] sm:text-5xl">What are we celebrating?</h2><p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">Start with the occasion. Find a style that feels like you.</p></div>
          <Link href="/templates" className="inline-flex items-center gap-2 text-sm font-bold text-[#123b5d] transition hover:text-sky-700">Browse all templates <span>↗</span></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((occasion) => <Link key={occasion.title} href="/templates" className="group flex items-center gap-4 rounded-2xl border border-sky-950/8 bg-white p-5 shadow-sm shadow-sky-950/[0.03] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-950/[0.07]">
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${occasion.tone} font-serif text-2xl text-sky-800 transition group-hover:scale-105`}>{occasion.symbol}</span>
            <span className="flex-1"><span className="block font-serif text-xl font-bold text-[#123b5d]">{occasion.title}</span><span className="mt-1 block text-sm text-slate-500">{occasion.detail}</span></span>
            <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-sky-700">↗</span>
          </Link>)}
        </div>
      </section>

      <section id="features" className="relative z-10 bg-[#123b5d] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">The details, taken care of</p><h2 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">All the magic. None of the paper chase.</h2><p className="mt-4 leading-7 text-sky-100/75">A beautiful invitation is only the beginning. Keep the details and guest experience together in one place.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => <article key={benefit.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 transition hover:border-sky-300/40 hover:bg-white/[0.09]"><span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-300/10 font-serif text-2xl text-sky-300">{benefit.icon}</span><h3 className="mt-5 font-serif text-xl font-bold">{benefit.title}</h3><p className="mt-3 text-sm leading-6 text-sky-100/75">{benefit.text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-700">Easy from the first click</p><h2 className="mt-3 font-serif text-4xl font-bold text-[#123b5d] sm:text-5xl">Four steps to your celebration</h2><p className="mt-4 leading-7 text-slate-600">No design experience needed. Just bring the details that make your day yours.</p></div>
        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {[['01', 'Choose a template', 'Start with a design you love.'], ['02', 'Add your details', 'Names, dates, venue and your story.'], ['03', 'Publish & share', 'Share one link with your guests.'], ['04', 'Manage responses', 'Keep your guest list organized.']].map(([n, title, desc]) => <div key={n} className="relative rounded-2xl border border-sky-950/10 bg-white p-6 shadow-sm"><span className="font-serif text-3xl italic text-sky-700">{n}</span><h3 className="mt-4 font-serif text-lg font-bold text-[#123b5d]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p></div>)}
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1b5b87] to-[#123b5d] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-sky-200/20" /><div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-sky-200/20" />
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">Your story starts here</p><h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl font-bold sm:text-5xl">Make an invitation they’ll want to open.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-sky-100/75 sm:text-base">Choose a design, make it personal and bring everyone a little closer to your celebration.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/register" className="rounded-full bg-sky-300 px-7 py-3.5 text-sm font-bold text-[#123b5d] transition hover:bg-sky-200">Create your invitation ↗</Link><Link href="/templates" className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">Explore designs</Link></div>
        </div>
      </section>

      <footer className="border-t border-sky-950/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="font-serif text-xl font-bold text-[#123b5d]">Uptemp<span className="text-sky-700">.</span></Link>
          <p>Invitations for the moments that matter.</p>
          <div className="flex gap-5 font-semibold"><Link href="/templates" className="hover:text-[#123b5d]">Templates</Link><Link href="/login" className="hover:text-[#123b5d]">Log in</Link><Link href="/register" className="hover:text-[#123b5d]">Get started</Link></div>
        </div>
      </footer>
    </main>
  );
}
