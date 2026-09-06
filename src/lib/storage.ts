import { Choli, Booking, UserProfile } from '@/types';
import { INITIAL_USERS } from './demoData';

const CHOLIS_KEY = 'shreesakhi_cholis_v3';
const BOOKINGS_KEY = 'shreesakhi_bookings_v3';
const USERS_KEY = 'shreesakhi_users_v2';
const CURRENT_USER_KEY = 'shreesakhi_session_v3';

export function getStoredCholis(): Choli[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(CHOLIS_KEY);
    if (!item) return [];
    return JSON.parse(item);
  } catch {
    return [];
  }
}

export function saveStoredCholis(cholis: Choli[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHOLIS_KEY, JSON.stringify(cholis));
  } catch (err) {
    console.error('Failed to save cholis to localStorage', err);
  }
}

export function getStoredBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(BOOKINGS_KEY);
    if (!item) return [];
    return JSON.parse(item);
  } catch {
    return [];
  }
}

export function saveStoredBookings(bookings: Booking[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (err) {
    console.error('Failed to save bookings to localStorage', err);
  }
}

export function getStoredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const item = localStorage.getItem(USERS_KEY);
    if (!item) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(item);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: UserProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
}

export function getStoredCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(CURRENT_USER_KEY);
    if (!item) return null;
    return JSON.parse(item);
  } catch {
    return null;
  }
}

export function saveStoredCurrentUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error('Failed to save current user to localStorage', err);
  }
}
