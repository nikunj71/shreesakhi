import { Choli, Booking, UserProfile } from '@/types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-1',
    name: 'Boutique Owner (Admin)',
    email: 'admin@shreesakhi.com',
    phone: '+91 98200 11223',
    role: 'ADMIN',
    employeeCode: 'OWNER-01',
    password: 'admin',
    joinedDate: '2024-01-01',
  }
];

// Dummy data wiped. The boutique inventory and bookings are fetched dynamically from MongoDB.
export const INITIAL_CHOLIS: Choli[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
