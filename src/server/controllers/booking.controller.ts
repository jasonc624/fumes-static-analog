import { adminDb } from '../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
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

export interface AgreementData {
  password?: string;
  booking?: BookingData;
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

/**
 * Verifies the provided password against the agreement's stored password
 * and retrieves the agreement data with booking information
 */
export async function verifyAndRetrieveAgreement(
  bookingId: string,
  password: string,
  requestedAgreementId: string
): Promise<AgreementData> {
  try {
    console.info("Looking for agreement:", requestedAgreementId, "in booking:", bookingId);
    
    // Access the 'agreements' subcollection within the booking document
    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const agreementRef = adminDb
      .collection("bookings")
      .doc(bookingId)
      .collection("agreements")
      .doc(requestedAgreementId);

    // Get the agreement document
    const agreementDoc = await agreementRef.get();

    if (!agreementDoc.exists) {
      throw new Error("Agreement not found");
    }

    const agreementData = agreementDoc.data() as AgreementData;
    const decryptedPassword = await decryptString(agreementData.password!);
    
    // Check if the passwords match
    if (password === decryptedPassword) {
      // Update agreement with view tracking
       await agreementRef.update({
         customerViewed: true,
         dateViewed: FieldValue.serverTimestamp()
       });
      
      // Get booking data
      const bookingDoc = await bookingRef.get();
      const booking = bookingDoc.data() as BookingData;
      agreementData.booking = booking;
      
      // Remove password from response for security
      delete agreementData.password;
      
      return agreementData;
    } else {
      throw new Error("Password does not match");
    }
  } catch (error) {
    console.error("Error retrieving agreement:", error);
    throw error;
  }
}