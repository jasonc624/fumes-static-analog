import { defineEventHandler, readBody, createError } from 'h3';
import { verifyAndRetrieveBooking } from '../../../controllers/booking.controller';

interface AuthenticateBookingData {
  bookingId: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    });
  }

  try {
    // Read the request body
    const body: AuthenticateBookingData = await readBody(event);

    // Validate required fields
    if (!body.bookingId || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: bookingId, password'
      });
    }

    // Use the controller to verify and retrieve booking data
    const bookingData = await verifyAndRetrieveBooking(body.bookingId, body.password);

    return {
      success: true,
      data: bookingData
    };

  } catch (error: any) {
    console.error('Error authenticating booking:', error);
    
    // Handle specific error messages from the controller
    if (error.message === 'Booking not found') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Booking not found'
      });
    }
    
    if (error.message === 'Password does not match') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid booking ID or password'
      });
    }
    
    if (error.message === 'Failed to decrypt password') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid password format'
      });
    }
    
    if (error.message === 'CIPHER_CRYPTO_KEY environment variable is not set') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error'
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});