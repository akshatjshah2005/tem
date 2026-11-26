export type DesignTier = 'Free' | 'Premium';

export type StudioDesign = {
  id: string;
  name: string;
  category: string;
  label: string;
  description: string;
  color: string;
  photo: string;
  tier: DesignTier;
  badge?: string;
  style: 'Traditional' | 'Modern' | 'South Indian';
  isNew?: boolean;
  order: number;
  features: string[];
  couple: string;
  dateLine: string;
};

export const studioDesigns: StudioDesign[] = [
  { id: 'royal-sandalwood', name: 'Royal Sandalwood', category: 'wedding', label: 'Wedding', description: 'Palace gold and warm ivory', color: '#634329', photo: '1583939003579-730e3918a45a', tier: 'Premium', badge: 'Royal', style: 'Traditional', order: 1, features: ['Envelope intro', 'Multiple events', 'RSVP', 'Music'], couple: 'Akshat & Priya', dateLine: '14 Feb 2027 · Ahmedabad' },
  { id: 'sanskara-ivory', name: 'Sanskara Ivory', category: 'wedding', label: 'Wedding', description: 'Soft rose and floral details', color: '#643f48', photo: '1511285560929-80b456fea0bc', tier: 'Free', badge: 'Elegant', style: 'Traditional', order: 2, features: ['Floral intro', 'Countdown', 'Gallery', 'RSVP'], couple: 'Aarav & Meera', dateLine: '02 Dec 2026 · Udaipur' },
  { id: 'haldi-marigold-urli', name: 'Marigold Haldi', category: 'haldi', label: 'Haldi', description: 'Sun-warmed marigold and amber', color: '#81511d', photo: '1606800052052-a08af7148866', tier: 'Free', badge: 'Festive', style: 'Traditional', order: 4, features: ['Single event', 'Dress code', 'Map', 'RSVP'], couple: 'Rohan & Isha', dateLine: 'Haldi · 11 Dec 2026' },
  { id: 'sangeet-peacock-glam', name: 'Peacock Glam', category: 'sangeet', label: 'Sangeet', description: 'Deep teal for an evening celebration', color: '#183e3e', photo: '1519741497674-611481863552', tier: 'Premium', badge: 'Evening', style: 'Modern', isNew: true, order: 5, features: ['Music', 'Countdown', 'Gallery', 'RSVP'], couple: 'Kabir & Tara', dateLine: 'Sangeet · 12 Dec 2026' },
  { id: 'cinematic-couple', name: 'Cinematic Couple', category: 'wedding', label: 'Wedding', description: 'Midnight blue with a film-inspired palette', color: '#233045', photo: '1519741497674-611481863552', tier: 'Premium', badge: 'Cinematic', style: 'Modern', isNew: true, order: 3, features: ['Film intro', 'Love story', 'Gallery', 'Music'], couple: 'Vihaan & Anaya', dateLine: '20 Jan 2027 · Jaipur' },
  { id: 'crimson-gold', name: 'Crimson & Gold', category: 'wedding', label: 'Wedding', description: 'Rich crimson and ceremonial gold', color: '#651f2d', photo: '1544078751-58fee2d8a03b', tier: 'Premium', badge: 'Luxury', style: 'Traditional', order: 6, features: ['Shubh Vivah intro', 'Multiple events', 'Map', 'RSVP'], couple: 'Arjun & Diya', dateLine: '08 Mar 2027 · Delhi' },
  { id: 'south-indian-traditional', name: 'Temple Gold', category: 'wedding', label: 'Wedding', description: 'Temple gold and warm cream', color: '#762b2a', photo: '1583939003579-730e3918a45a', tier: 'Free', badge: 'Traditional', style: 'South Indian', order: 7, features: ['Muhurtham timing', 'Multiple events', 'Map', 'RSVP'], couple: 'Karthik & Lakshmi', dateLine: 'Muhurtham · 06 Feb 2027' },
  { id: 'minimal-zen', name: 'Minimal Zen', category: 'common-any', label: 'Any occasion', description: 'Airy whites and clean typography', color: '#415361', photo: '1519225424909-66170d473489', tier: 'Free', badge: 'Serene', style: 'Modern', order: 8, features: ['Save the date', 'Countdown', 'Map', 'RSVP'], couple: 'Save the Date', dateLine: 'Any celebration' },
];

export const occasions = [
  { label: 'Wedding', category: 'wedding' },
  { label: 'Haldi', category: 'haldi' },
  { label: 'Sangeet', category: 'sangeet' },
  { label: 'Any occasion', category: 'common-any' },
];

export function designImage(design: StudioDesign, width = 900) {
  return 'https://images.unsplash.com/photo-' + design.photo + '?auto=format&fit=crop&w=' + width + '&q=80';
}

export function studioHref(design: StudioDesign, trial = false) {
  return '/create?' + new URLSearchParams({
    template: design.id,
    category: design.category,
    ...(trial ? { mode: 'trial' } : {}),
  }).toString();
}
