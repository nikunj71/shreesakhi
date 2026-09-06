import { CholiCategory, CholiStatus } from '@/types';

export const APP_CONFIG = {
  BRAND_NAME: 'Shree Sakhi',
  FULL_TITLE: 'Shree Sakhi Choli Collection',
  TAGLINE: 'Designer Cholis on Rent',
  CURRENCY: '₹',
  LOCATION: 'Bandra West, Mumbai & Satellite, Ahmedabad',
  PHONE: '+91 98200 11223',
  EMAIL: 'contact@shreesakhi.com',
  DEFAULT_INSTAGRAM_PROFILE: 'https://www.instagram.com/shreesakhi_couture',
  DEFAULT_PLACEHOLDER_IMAGE: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
};

export const CHOLI_CATEGORIES: { label: string; value: CholiCategory }[] = [
  { label: 'Bridal', value: 'Bridal' },
  { label: 'Sangeet', value: 'Sangeet' },
  { label: 'Navratri', value: 'Navratri' },
  { label: 'Reception', value: 'Reception' },
  { label: 'Partywear', value: 'Partywear' },
];

export const CHOLI_SIZES = [
  '32 (XS)',
  '34 (S)',
  '36 (M - Alterable 34-38)',
  '38 (L)',
  '40 (XL)',
  '42 (XXL)',
  'Free Size / Customizable'
] as const;

export const CHOLI_STATUS_LABELS: Record<CholiStatus, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Available', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  RENTED: { label: 'Rented', color: '#DFBD76', bg: 'rgba(223, 189, 118, 0.15)' },
  IN_ALTERATION: { label: 'In Alteration', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  AT_DRY_CLEANER: { label: 'Dry Cleaning', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' },
  RETIRED: { label: 'Archived', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' },
};

export const CLOUDINARY_CONFIG = {
  FOLDER: 'shreesakhi_choli_collection',
  DEFAULT_PRESET: 'shreesakhi_unsigned',
};

// Curated high-resolution image bank for choli additions and placeholders
export const CHOLI_IMAGE_BANK = {
  CRIMSON_ROYAL: [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=1200&auto=format&fit=crop',
  ],
  EMERALD_MINT: [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
  ],
  KUTCH_MULTICOLOR: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
  ],
  CHAMPAGNE_ROSE: [
    'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
  ],
  SUNSHINE_HALDI: [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=1200&auto=format&fit=crop',
  ],
  NAVY_ZARI: [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
  ],
};
