import { dbConnect } from './dbConnect';
import Choli from '@/models/Choli';
import Booking from '@/models/Booking';

export const SEED_CHOLIS: any[] = [];

export async function resetAndSeedDatabase() {
  await dbConnect();
  await Choli.deleteMany({});
  await Booking.deleteMany({});
  return [];
}
