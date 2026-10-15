import Link from 'next/link';

const occasionGroups = [
  { label: 'Wedding', symbol: '✦' },
  { label: 'Engagement', symbol: '♡' },
  { label: 'Haldi & Mehendi', symbol: '✺' },
  { label: 'Reception', symbol: '❋' },
  { label: 'Birthday', symbol: '✧' },
  { label: 'Housewarming', symbol: '⌂' },
];

const benefits = [
  {
    number: '01',
    icon: '✦',
    title: 'A little film, not another card',
    description: 'Names reveal, ornaments move, and every section unfolds with considered motion. Your invitation feels like an occasion before the event begins.',
    tint: 'from-sky-100 to-blue-50',
  },
  {
    number: '02',
    icon: '◈',
    title: 'Every ceremony, one beautiful link',
    description: 'Keep Haldi, Mehendi, Sangeet, the wedding and reception together. Each event can have its own time, venue, directions and message.',
    tint: 'from-indigo-100 to-sky-50',
  },
  {
    number: '03',
    icon: '♡',
    title: 'A personal hello for every family',
    description: 'Create a unique invitation link for each guest, with their greeting and assigned events when personalization is enabled.',
    tint: 'from-cyan-100 to-blue-50',
  },
  {
    number: '04',
    icon: '⌁',
    title: 'Details that stay up to date',
    description: 'Update a time, venue or message in your invitation. The same published link shows the latest saved details.',
    tint: 'from-blue-100 to-indigo-50',
  },
];

const included = [
  { icon: '⌖', title: 'Venue directions', body: 'A tap opens the location in Maps.' },
  { icon: '◷', title: 'Live countdown', body: 'Count down to the main event.' },
  { icon: '▧', title: 'Photo gallery', body: 'Bring favourite moments into the story.' },
  { icon: '✓', title: 'Guest RSVP', body: 'Let guests respond from their invite.' },
];

function Arrow() {
  return <span aria-hidden="true" className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">↗</span>;
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" aria-label="Invitations home" className={`inline-flex items-center gap-2.5 font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-gradient-to-br from-sky-400 to-blue-600 text-lg text-white shadow-sm shadow-sky-200">i</span>
      <span className="text-xl">invitations<span className={light ? 'text-sky-200' : 'text-sky-600'}>.</span></span>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/templates" className="text-sm font-medium text-slate-600 transition hover:text-sky-700">Explore themes</Link>
            <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-sky-700">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition hover:text-sky-700">How it works</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-4">Log in</Link>
            <Link href="/register?next=%2Fdashboard%2Fcreate" className="group inline-flex items-center rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200/70 transition hover:-translate-y-0.5 hover:bg-sky-700 sm:px-5">Create invitation <Arrow /></Link>
          </div>
        </div>
      </nav>

      <section className="relative isolate overflow-hidden bg-[#f4faff]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_15%,rgba(125,211,252,0.35),transparent_32%),radial-gradient(ellipse_at_92%_12%,rgba(199,210,254,0.50),transparent_32%),linear-gradient(180deg,#f4faff_0%,#ffffff_100%)]" />
        <div className="pointer-events-none absolute -right-40 top-20 -z-10 h-[32rem] w-[32rem] rounded-full border border-sky-200/60" />
        <div className="pointer-events-none absolute -right-24 top-36 -z-10 h-[24rem] w-[24rem] rounded-full border border-sky-200/60" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-10 lg:pb-24 lg:pt-20">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-sky-800 shadow-sm shadow-sky-100">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-sky-600" /></span>
              MADE FOR YOUR BIG MOMENTS
            </div>
            <h1 className="max-w-2xl text-[2.8rem] font-semibold leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.35rem]">
              Your invitation should feel like <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-500 bg-clip-text text-transparent">the beginning.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Cinematic digital invitations for weddings and every celebration around them. Add your story, bring your events together, then send one beautiful link.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?next=%2Fdashboard%2Fcreate" className="group inline-flex items-center justify-center rounded-full bg-sky-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700">Create your invitation <Arrow /></Link>
              <Link href="/templates" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50">Explore the themes <span className="ml-2">↓</span></Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm">
              <span className="inline-flex items-center gap-2"><span className="text-sky-600">✓</span> Opens in a phone browser</span>
              <span className="inline-flex items-center gap-2"><span className="text-sky-600">✓</span> Personal links for guests</span>
              <span className="inline-flex items-center gap-2"><span className="text-sky-600">✓</span> Edit when plans change</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[36rem]">
            <div className="absolute -left-2 top-12 z-20 hidden -rotate-6 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-xl shadow-sky-900/10 sm:block">
              <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700">✓</span><span><strong className="block text-xs text-slate-800">One link, all events</strong><span className="text-[11px] text-slate-500">Always up to date</span></span></div>
            </div>
            <div className="absolute -right-1 top-28 z-20 hidden rotate-3 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-xl shadow-sky-900/10 sm:block">
              <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-lg text-sky-700">♡</span><span><strong className="block text-xs text-slate-800">Made personal</strong><span className="text-[11px] text-slate-500">Hello, Riya & family</span></span></div>
            </div>
            <div className="relative mx-auto w-[min(100%,420px)] rounded-[2.6rem] border-[7px] border-slate-900 bg-slate-900 p-2 shadow-[0_35px_90px_-28px_rgba(14,116,195,0.45)] sm:rotate-[2.2deg]">
              <div className="relative overflow-hidden rounded-[2.05rem] bg-[#f8faff]">
                <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-900" />
                <div className="relative flex min-h-[570px] flex-col overflow-hidden bg-gradient-to-b from-[#0a2545] via-[#174d78] to-[#071a32] px-6 pb-7 pt-12 text-center sm:min-h-[590px]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(125,211,252,0.48),transparent_32%),radial-gradient(ellipse_at_50%_80%,rgba(56,189,248,0.14),transparent_45%)]" />
                  <div className="pointer-events-none absolute left-1/2 top-[4.5rem] h-64 w-64 -translate-x-1/2 rounded-full border border-sky-100/30" />
                  <div className="pointer-events-none absolute left-1/2 top-[5.2rem] h-52 w-52 -translate-x-1/2 rounded-full border border-sky-100/25" />
                  <div className="pointer-events-none absolute left-1/2 top-[6.1rem] h-36 w-36 -translate-x-1/2 rounded-full border border-sky-100/20" />
                  <div className="relative z-10 mt-6 flex justify-center">
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-sky-100/50 bg-white/5 shadow-[0_0_65px_rgba(125,211,252,0.22)]">
                      <svg viewBox="0 0 100 100" className="h-24 w-24 text-sky-100/90" fill="none" aria-hidden="true">
                        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeOpacity=".65"/>
                        <circle cx="50" cy="50" r="34" stroke="currentColor" strokeOpacity=".35" strokeDasharray="2 4"/>
                        <path d="M50 12 C35 31 38 43 50 50 C62 43 65 31 50 12Z M50 88 C35 69 38 57 50 50 C62 57 65 69 50 88Z M12 50 C31 35 43 38 50 50 C43 62 31 65 12 50Z M88 50 C69 35 57 38 50 50 C57 62 69 65 88 50Z" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M30 30 L70 70 M70 30 L30 70" stroke="currentColor" strokeOpacity=".35"/>
                        <circle cx="50" cy="50" r="7" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <p className="relative z-10 mt-7 text-[10px] font-semibold uppercase tracking-[0.36em] text-sky-100/85">Together with our families</p>
                  <h2 className="relative z-10 mt-5 font-serif text-[2.65rem] italic leading-[0.98] tracking-tight text-white">Akshat <span className="block py-1 text-xl not-italic text-sky-200">&amp;</span> Priya</h2>
                  <div className="relative z-10 mx-auto mt-5 h-px w-20 bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
                  <p className="relative z-10 mt-5 font-serif text-base italic text-sky-50/90">A new chapter, a lifetime of memories.</p>
                  <div className="relative z-10 mx-auto mt-6 rounded-full border border-sky-100/30 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100">Saturday · 14 February 2027</div>
                  <div className="relative z-10 mt-auto pt-10">
                    <Link href="/i/akshat-wedding" className="mx-auto flex max-w-[240px] items-center justify-center gap-3 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20">Open sample invitation <span aria-hidden="true">↗</span></Link>
                    <p className="mt-4 text-[9px] uppercase tracking-[0.24em] text-sky-100/45">A preview of your invitation experience</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-5 -left-5 -z-10 h-40 w-40 rounded-full bg-sky-300/35 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-8 -z-10 h-48 w-48 rounded-full bg-indigo-300/35 blur-3xl" />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p className="text-sm font-semibold text-slate-500">Made for the moments your family celebrates</p>
          <div className="flex flex-wrap gap-2">
            {occasionGroups.map((item) => <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/75 px-3.5 py-2 text-xs font-semibold text-slate-700"><span className="text-sky-600">{item.symbol}</span>{item.label}</span>)}
          </div>
        </div>
      </section>

      <section id="themes" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Meet your invitation</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Choose a feeling. Make it yours.</h2>
              <p className="mt-4 leading-7 text-slate-600">Distinct visual styles, made to hold your story and your traditions—not just your names.</p>
            </div>
            <Link href="/templates" className="group inline-flex w-fit items-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50">Explore all themes <Arrow /></Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Link href="/templates" className="group overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100">
              <div className="relative flex h-72 items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a2545] via-[#23577b] to-[#101b36] p-7 text-center">
                <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-100/35 transition duration-700 group-hover:scale-110" />
                <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-100/25" />
                <div className="relative text-white"><span className="text-[9px] font-bold uppercase tracking-[0.35em] text-sky-100">Royal Mandala</span><p className="mt-6 font-serif text-3xl italic">A &amp; P</p><div className="mx-auto my-4 h-px w-12 bg-sky-200" /><p className="font-serif text-sm text-sky-50">A day to remember</p></div>
                <span className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">ANIMATED STYLE ↗</span>
              </div>
              <div className="p-5"><h3 className="text-lg font-bold">Royal Mandala</h3><p className="mt-1 text-sm text-slate-500">Deep blue, luminous ornaments and a ceremonial reveal.</p></div>
            </Link>
            <Link href="/templates" className="group overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100">
              <div className="relative flex h-72 items-center justify-center overflow-hidden bg-gradient-to-br from-[#ecf8ff] via-white to-[#d8e8ff] p-7 text-center">
                <div className="absolute -right-8 -top-10 h-48 w-48 rounded-full bg-sky-200/40 blur-2xl transition duration-700 group-hover:scale-125" />
                <div className="relative max-w-[240px] border border-sky-300/70 px-6 py-8"><span className="text-[9px] font-bold uppercase tracking-[0.3em] text-sky-700">Floral Romance</span><p className="mt-6 font-serif text-3xl text-slate-800">Two hearts</p><p className="mt-1 font-serif text-sm italic text-sky-800">one beautiful beginning</p><div className="mx-auto mt-5 h-px w-12 bg-sky-400" /></div>
                <span className="absolute bottom-4 right-4 rounded-full border border-sky-200 bg-white/85 px-3 py-1.5 text-[10px] font-semibold text-sky-900">SOFT & DREAMY ↗</span>
              </div>
              <div className="p-5"><h3 className="text-lg font-bold">Floral Romance</h3><p className="mt-1 text-sm text-slate-500">Light, airy tones, elegant type and soft scene transitions.</p></div>
            </Link>
            <Link href="/templates" className="group overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100">
              <div className="relative flex h-72 items-center justify-center overflow-hidden bg-[#f4f7fb] p-7 text-center">
                <div className="absolute inset-x-0 top-0 h-2 bg-slate-900" /><div className="absolute inset-x-0 bottom-0 h-2 bg-slate-900" />
                <div className="relative"><span className="text-[9px] font-bold uppercase tracking-[0.35em] text-slate-500">Modern Editorial</span><p className="mt-7 font-serif text-3xl uppercase tracking-[0.14em] text-slate-900">A &amp; P</p><p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-slate-500">The beginning of forever</p><div className="mx-auto mt-6 h-px w-16 bg-slate-400" /></div>
                <span className="absolute bottom-4 right-4 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-white">CINEMATIC CUT ↗</span>
              </div>
              <div className="p-5"><h3 className="text-lg font-bold">Modern Editorial</h3><p className="mt-1 text-sm text-slate-500">A clean film-inspired layout with confident typography.</p></div>
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="relative overflow-hidden bg-[#f2f9ff] py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">More than a digital card</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">A whole celebration in one link.</h2>
            <p className="mt-4 leading-7 text-slate-600">Everything your guests need, wrapped in a visual experience that feels personal from the first second.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {included.map((feature) => <div key={feature.title} className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100/50 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-100"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-2xl text-sky-700">{feature.icon}</span><h3 className="mt-5 font-bold text-slate-900">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p></div>)}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {benefits.map((feature) => <div key={feature.number} className="group flex gap-4 rounded-2xl border border-sky-100/80 bg-white/80 p-6 transition hover:bg-white">
              <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-gradient-to-br ${feature.tint} text-xl text-sky-800`}>{feature.icon}</div>
              <div><div className="text-xs font-bold tracking-[0.16em] text-sky-700">{feature.number}</div><h3 className="mt-1 text-lg font-bold text-slate-900">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p></div>
            </div>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Simple by design</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From first idea to sent invite.</h2></div>
            <p className="max-w-md text-sm leading-6 text-slate-600">No design software to learn. Start with a theme and make it yours one step at a time.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              { n: '01', title: 'Pick your mood', body: 'Preview an animated theme and choose the style that feels right.' },
              { n: '02', title: 'Add your story', body: 'Enter names, family details, event times, places and photos.' },
              { n: '03', title: 'Make it personal', body: 'Manage guests and create guest-specific links when you are ready.' },
              { n: '04', title: 'Share the moment', body: 'Publish your invitation and share the link with your family.' },
            ].map((step) => <div key={step.n} className="relative rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-sky-200 hover:bg-sky-50/50">
              <span className="font-serif text-4xl text-sky-200">{step.n}</span><h3 className="mt-5 text-lg font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-600 px-6 py-12 text-white shadow-2xl shadow-sky-200 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-10 -top-24 h-80 w-80 rounded-full border border-white/15" /><div className="pointer-events-none absolute -right-0 top-[-4rem] h-64 w-64 rounded-full border border-white/15" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100">Your moment, your way</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Make the invite they remember opening.</h2><p className="mt-4 max-w-xl leading-7 text-sky-50/90">Start with a theme, bring your celebrations together and make every guest feel included.</p></div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col"><Link href="/register?next=%2Fdashboard%2Fcreate" className="group inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-bold text-sky-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-50">Start creating <Arrow /></Link><Link href="/templates" className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">Explore themes</Link></div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-[#f7fbff] py-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Good to know</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">A few quick answers.</h2></div>
          <div className="mt-8 space-y-3">
            <details className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-sky-200"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">Do guests need to install an app?<span className="text-xl text-sky-600 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">No. Published invitations are web links designed to open in a phone browser, including from messaging apps.</p></details>
            <details className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-sky-200"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">Can I include more than one ceremony?<span className="text-xl text-sky-600 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Yes. Add events such as Haldi, Mehendi, Sangeet, Wedding and Reception, each with its own time and venue. Custom event names can be added through the event manager.</p></details>
            <details className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-sky-200"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">Can I edit after sharing the invitation?<span className="text-xl text-sky-600 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">You can edit and save invitation details from your dashboard. The published page loads the latest saved content at the same URL.</p></details>
            <details className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-sky-200"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">Can each guest receive a different invitation link?<span className="text-xl text-sky-600 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Guest-specific links are supported by the platform's personalization system. You can manage guests and assign events from your invitation dashboard.</p></details>
          </div>
        </div>
      </section>

      <footer className="bg-[#081c35] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div><Brand light /><p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">Cinematic digital invitations made for the moments your family celebrates.</p></div>
            <div><h3 className="font-semibold">Explore</h3><ul className="mt-4 space-y-3 text-sm text-slate-300"><li><Link className="hover:text-white" href="/templates">All themes</Link></li><li><a className="hover:text-white" href="#features">Features</a></li><li><a className="hover:text-white" href="#how-it-works">How it works</a></li></ul></div>
            <div><h3 className="font-semibold">Your account</h3><ul className="mt-4 space-y-3 text-sm text-slate-300"><li><Link className="hover:text-white" href="/login">Log in</Link></li><li><Link className="hover:text-white" href="/register?next=%2Fdashboard%2Fcreate">Create account</Link></li><li><Link className="hover:text-white" href="/dashboard">My invitations</Link></li></ul></div>
            <div><h3 className="font-semibold">Try the experience</h3><ul className="mt-4 space-y-3 text-sm text-slate-300"><li><Link className="hover:text-white" href="/i/akshat-wedding">Open sample invitation</Link></li><li><Link className="hover:text-white" href="/templates">Choose a theme</Link></li></ul></div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Invitations. Made for meaningful moments.</span><span>Designed for phone-first sharing.</span></div>
        </div>
      </footer>
    </main>
  );
}
