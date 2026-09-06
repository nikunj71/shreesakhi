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
  },
  {
    id: 'usr-staff-1',
    name: 'Priya Sharma',
    email: 'priya@shreesakhi.com',
    phone: '+91 98765 43210',
    role: 'STAFF',
    employeeCode: 'EMP-101',
    password: 'staff',
    joinedDate: '2024-02-15',
  },
  {
    id: 'usr-staff-2',
    name: 'Neha Patel',
    email: 'neha@shreesakhi.com',
    phone: '+91 98111 22334',
    role: 'STAFF',
    employeeCode: 'EMP-102',
    password: 'staff',
    joinedDate: '2024-03-10',
  }
];

// Dummy data wiped. The boutique inventory and bookings are fetched dynamically from MongoDB.
export const INITIAL_CHOLIS: Choli[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
