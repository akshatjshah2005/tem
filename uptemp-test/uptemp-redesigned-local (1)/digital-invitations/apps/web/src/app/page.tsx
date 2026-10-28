import Link from 'next/link';

const occasions = [
  { title: 'Weddings', subtitle: 'A story worth celebrating', slug: 'wedding', number: '01', tone: 'from-[#d9efff] to-[#f4faff]', monogram: 'A & P' },
  { title: 'Engagements', subtitle: 'The beginning of forever', slug: 'engagement', number: '02', tone: 'from-[#e5e8ff] to-[#f7f8ff]', monogram: 'YES' },
  { title: 'Birthdays', subtitle: 'Make their day feel special', slug: 'birthday', number: '03', tone: 'from-[#dff8f2] to-[#f7fffd]', monogram: 'HBD' },
  { title: 'Jain celebrations', subtitle: 'Tradition, with a personal touch', slug: 'jain-events', number: '04', tone: 'from-[#fff0d7] to-[#fffaf0]', monogram: 'शुभ' },
  { title: 'Housewarming', subtitle: 'Welcome a beautiful new chapter', slug: 'housewarming', number: '05', tone: 'from-[#e0f4e5] to-[#f8fff9]', monogram: 'HOME' },
  { title: 'Every occasion', subtitle: 'A design for your kind of moment', slug: 'all', number: '06', tone: 'from-[#dbefff] to-[#f6fbff]', monogram: 'YOURS' },
];

const benefits = [
  { number: '01', title: 'Designed to feel personal', text: 'Start with a considered design, then make the names, wording and details your own.' },
  { number: '02', title: 'One link, all the details', text: 'Keep event information together in an invitation that is easy to open on a phone.' },
  { number: '03', title: 'Guests stay in the loop', text: 'Manage guests and RSVP responses in the same workspace when those features are enabled.' },
  { number: '04', title: 'Free to create', text: 'Every available template is free to use. No premium tiers, subscriptions or checkout.' },
];

const templateNames = [
  { name: 'Royal Mandala', kind: 'Traditional · Wedding', style: 'royal', slug: 'wedding-royal-mandala' },
  { name: 'Gujarati Shubh Vivah', kind: 'Cultural · Wedding', style: 'gujarati', slug: 'wedding-gujarati-shubh-vivah' },
  { name: 'Floral Romance', kind: 'Soft · Romantic', style: 'floral', slug: 'wedding-floral-romance' },
  { name: 'Minimal Blue Elegance', kind: 'Modern · Editorial', style: 'blue', slug: 'wedding-modern-minimal' },
];

function InvitationArt({ style, name }: { style: string; name: string }) {
  return (
    <div className={`invitation-art invitation-art--${style}`}>
      <div className="invitation-art__frame">
        <span className="invitation-art__eyebrow">TOGETHER WITH THEIR FAMILIES</span>
        <span className="invitation-art__ornament" aria-hidden="true">✳</span>
        <span className="invitation-art__names">Riya <i>&</i> Arjun</span>
        <span className="invitation-art__line" />
        <span className="invitation-art__event">{name}</span>
        <span className="invitation-art__date">12 · DECEMBER · 2026</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="uptemp-home min-h-screen overflow-hidden">
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="brand" aria-label="UPTEMP home">
            <span className="brand__mark">u<span>.</span></span>
            <span className="brand__word">uptemp<span>.</span><small>INVITATIONS, MADE PERSONAL</small></span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link className="main-nav__active" href="/">Home</Link>
            <Link href="/templates">Explore templates</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/features">Features</Link>
          </nav>
          <div className="site-header__actions">
            <Link href="/login" className="button button--quiet">Sign in</Link>
            <Link href="/register?next=%2Fdashboard%2Fcreate" className="button button--primary">Create invitation <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero__grid">
          <div className="home-hero__copy">
            <div className="eyebrow"><span className="eyebrow__dot" /> YOUR MOMENT, BEAUTIFULLY TOLD</div>
            <h1>Beautiful invitations.<br /><em>Unforgettable</em> moments.</h1>
            <p className="home-hero__description">Create a digital invitation that feels like you. Choose a design, personalize every detail, and share your celebration with one simple link.</p>
            <div className="home-hero__actions">
              <Link href="/register?next=%2Fdashboard%2Fcreate" className="button button--primary button--large">Create your invitation <span aria-hidden="true">↗</span></Link>
              <Link href="/templates" className="button button--outline button--large">Explore all templates <span aria-hidden="true">→</span></Link>
            </div>
            <div className="home-hero__proof">
              <span className="proof-check">✓</span><span>Every template is free</span><span className="proof-divider" />
              <span className="proof-check">✓</span><span>Made for mobile sharing</span>
            </div>
          </div>

          <div className="home-hero__visual" aria-label="Examples of digital invitation designs">
            <div className="hero-orbit hero-orbit--one" />
            <div className="hero-orbit hero-orbit--two" />
            <div className="hero-label hero-label--top"><span className="hero-label__dot" /> YOUR DESIGN STUDIO</div>
            <div className="hero-card hero-card--back"><InvitationArt style="floral" name="Floral Romance" /></div>
            <div className="hero-card hero-card--front"><InvitationArt style="blue" name="A new beginning" /></div>
            <div className="hero-note"><span className="hero-note__icon">↗</span><span><strong>Made personal</strong><small>Your story, your details</small></span></div>
            <div className="hero-label hero-label--bottom">A LITTLE MORE YOU, IN EVERY DETAIL</div>
          </div>
        </div>
        <div className="hero-bottomline"><span>INVITATIONS FOR LIFE'S MEANINGFUL MOMENTS</span><span>DESIGNED TO BE SHARED <b>✳</b></span></div>
      </section>

      <section className="occasion-section section-wrap" id="occasions">
        <div className="section-heading">
          <div><p className="section-kicker">FIND YOUR STARTING POINT</p><h2>Every occasion has its own feeling.</h2></div>
          <Link href="/templates" className="text-link">Browse all templates <span>↗</span></Link>
        </div>
        <div className="occasion-grid">
          {occasions.map((item) => (
            <Link key={item.title} href={item.slug === 'all' ? '/templates' : `/templates?category=${item.slug}`} className="occasion-card">
              <div className={`occasion-card__art bg-gradient-to-br ${item.tone}`}><span className="occasion-card__number">{item.number}</span><span className="occasion-card__monogram">{item.monogram}</span><span className="occasion-card__arrow">↗</span></div>
              <div className="occasion-card__body"><h3>{item.title}</h3><p>{item.subtitle}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-wrap">
          <div className="section-heading">
            <div><p className="section-kicker">THE UPTEMP COLLECTION</p><h2>Find a design that feels like yours.</h2><p className="section-subtitle">Distinct starting points. Room for your own story. Always free to use.</p></div>
            <Link href="/templates" className="text-link">Explore the collection <span>↗</span></Link>
          </div>
          <div className="featured-grid">
            {templateNames.map((item, index) => (
              <Link href={`/templates?search=${encodeURIComponent(item.name)}`} key={item.slug} className="featured-card">
                <div className="featured-card__preview"><InvitationArt style={item.style} name={item.name} /><span className="featured-card__index">0{index + 1}</span><span className="featured-card__view">Explore design ↗</span></div>
                <div className="featured-card__meta"><div><span>{item.kind}</span><h3>{item.name}</h3></div><span className="free-label">FREE</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="story-section section-wrap" id="features">
        <div className="story-section__intro"><p className="section-kicker">MORE THAN A PRETTY CARD</p><h2>All the details.<br /><em>One thoughtful place.</em></h2><p>Bring the design and the planning together, so your guests know what matters and you can focus on the celebration.</p><Link href="/features" className="text-link">Discover the features <span>↗</span></Link></div>
        <div className="benefit-list">
          {benefits.map((item) => <article className="benefit-row" key={item.number}><span className="benefit-row__number">{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><span className="benefit-row__arrow">↗</span></article>)}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-wrap">
          <div className="section-heading section-heading--center"><div><p className="section-kicker">SIMPLE FROM THE START</p><h2>From idea to invitation in four steps.</h2><p className="section-subtitle">No design experience needed. Just the details that make your day yours.</p></div></div>
          <div className="steps-grid">
            {[['01', 'Choose a design', 'Start with a style that fits your occasion.'], ['02', 'Make it personal', 'Add names, dates, venue and your own words.'], ['03', 'Bring the details together', 'Add events and guest information as needed.'], ['04', 'Share your invitation', 'Send your invitation link to family and friends.']].map(([number, title, description]) => <article className="step-card" key={number}><span className="step-card__number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="final-cta-wrap">
        <div className="final-cta">
          <div className="final-cta__orb" />
          <p className="section-kicker">YOUR STORY STARTS HERE</p>
          <h2>Make something worth opening.</h2>
          <p>Choose a design, make it personal, and invite everyone into the moment.</p>
          <div className="final-cta__actions"><Link href="/register?next=%2Fdashboard%2Fcreate" className="button button--white button--large">Create your free invitation <span>↗</span></Link><Link href="/templates" className="button button--ghost button--large">Browse templates</Link></div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__top"><Link href="/" className="brand"><span className="brand__mark">u<span>.</span></span><span className="brand__word">uptemp<span>.</span><small>INVITATIONS, MADE PERSONAL</small></span></Link><p>Beautiful invitations for the moments that bring us together.</p><div className="site-footer__links"><Link href="/templates">Templates</Link><Link href="/features">Features</Link><Link href="/login">Sign in</Link><Link href="/register">Create account</Link></div></div>
        <div className="site-footer__bottom"><span>© UPTEMP · MADE FOR MEANINGFUL MOMENTS</span><span>All templates free. Always.</span></div>
      </footer>
    </main>
  );
}
