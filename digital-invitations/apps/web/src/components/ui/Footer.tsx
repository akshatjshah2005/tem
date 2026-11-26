import Link from 'next/link';
import { Brand } from './Navbar';
import Icon from './Icon';
import { FUNCTIONS } from '@/lib/functions';

export default function Footer() {
  return (
    <footer className="sx-footer">
      <div className="sx-shell">
        <div className="sx-footer-cta rv">
          <div>
            <h2>Your celebration, on every guest’s phone.</h2>
            <p>Pick a design, add your functions and send personal links on WhatsApp.</p>
          </div>
          <Link className="sx-btn sx-btn-primary" href="/templates">Start your invitation <Icon name="arrow-right" /></Link>
        </div>

        <div className="sx-footer-grid">
          <div className="sx-footer-about">
            <Brand />
            <p>Cinematic digital invitations for Indian celebrations — personal for every guest.</p>
            <ul className="sx-footer-trust">
              <li><Icon name="access" /> Private guest links</li>
              <li><Icon name="phone" /> No app for guests</li>
            </ul>
          </div>
          <nav aria-label="Occasions">
            <h4>Occasions</h4>
            <ul className="sx-footer-tags">
              {FUNCTIONS.map((f) => <li key={f.id}><Link href={'/templates?category=' + f.id}><Icon name={f.icon} /> {f.short}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="Explore">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/templates">Templates</Link></li>
              <li><Link href="/poster-maker">Poster maker</Link></li>
              <li><Link href="/love-story">Love Story</Link></li>
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </nav>
          <nav aria-label="Account">
            <h4>Account</h4>
            <ul>
              <li><Link href="/dashboard">My invitations</Link></li>
              <li><Link href="/login">Sign in</Link></li>
              <li><Link href="/register">Create account</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
        </div>
        <div className="sx-footer-bottom">
          <span>© {new Date().getFullYear()} uptemp. All rights reserved.</span>
          <span>Made in India, for Indian celebrations</span>
        </div>
      </div>
    </footer>
  );
}
