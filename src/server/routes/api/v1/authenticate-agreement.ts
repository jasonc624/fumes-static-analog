import { defineEventHandler, readBody, createError } from 'h3';
import { verifyAndRetrieveAgreement } from '../../../controllers/booking.controller';

interface AuthenticateAgreementData {
  bookingId: string;
  password: string;
  agreementId: string;
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
    const body: AuthenticateAgreementData = await readBody(event);

    // Validate required fields
    if (!body.bookingId || !body.password || !body.agreementId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: bookingId, password, agreementId'
      });
    }

    // Use the controller to verify and retrieve agreement data
    const agreementData = await verifyAndRetrieveAgreement(
      body.bookingId, 
      body.password, 
      body.agreementId
    );

    return {
      success: true,
      data: agreementData
    };

  } catch (error: any) {
    console.error('Error authenticating agreement:', error);
    
    // Handle specific error messages from the controller
    if (error.message === 'Agreement not found') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Agreement not found'
      });
    }
    
    if (error.message === 'Password does not match') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid password'
      });
    }

    // Generic server error for other cases
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});