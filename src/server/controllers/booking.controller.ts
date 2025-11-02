import { adminDb } from '../../lib/firebase-admin';
import { decryptString } from '../utils/crypto.utils';
import { sanitizeVehicle, sanitizeFleet } from '../utils/sanitization.utils';

export interface BookingData {
  password?: string;
  vehicle?: any;
  fleet?: any;
  fleetRef?: string;
  [key: string]: any;
}

export interface FleetData {
  [key: string]: any;
}

/**
 * Verifies the provided password against the booking's stored password
 * and retrieves the booking data with sanitized vehicle and fleet information
 */
export async function verifyAndRetrieveBooking(
  bookingId: string,
  password: string
): Promise<BookingData> {
  try {
    console.info("Looking for booking id:", bookingId);
    
    // Get booking document from Firestore
    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();
    
    console.info("Booking Ref", bookingDoc);
    
    if (!bookingDoc.exists) {
      throw new Error("Booking not found");
    }
    
    const bookingData = bookingDoc.data() as BookingData;
    
    // Get fleet data
    let fleetDoc = await adminDb
      .collection("fleets")
      .doc(bookingData.fleetRef!)
      .get();
    
    const fleetData = fleetDoc.data() as FleetData;
    
    // Decrypt the attempted password
    const attemptedPassword = await decryptString(password);
    const bookingPassword = bookingData?.password;
    
    if (attemptedPassword === bookingPassword) {
      // Sanitize data the renter doesn't need to see
      delete bookingData.password;
      bookingData.vehicle = sanitizeVehicle(bookingData.vehicle);
      bookingData.fleet = sanitizeFleet(fleetData);
      
      return bookingData;
    } else {
      throw new Error("Password does not match");
    }
  } catch (error) {
    console.error("Error retrieving booking:", error);
    throw error;
  }
}