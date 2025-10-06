import { defineEventHandler, readBody, createError } from 'h3';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../lib/firebase';

interface InquiryData {
  name: string;
  email: string;
  fleetSize: string;
  message: string;
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
    const body: InquiryData = await readBody(event);

    // Validate required fields
    if (!body.name || !body.email || !body.fleetSize || !body.message) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, email, fleetSize, message'
      });
    }

    // Validate email format
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(body.email)) {
    //   throw createError({
    //     statusCode: 400,
    //     statusMessage: 'Invalid email format'
    //   });
    // }

    // Call Firebase function
    const submitInquiry = httpsCallable(functions, 'inquire_email');
    
    const result = await submitInquiry({
      name: body.name,
      email: body.email,
      fleetSize: body.fleetSize,
      message: body.message,
      timestamp: new Date().toISOString(),
      source: 'landing_page'
    });

    return {
      success: true,
      message: 'Inquiry submitted successfully',
      data: result.data
    };

  } catch (error: any) {
    console.error('Error submitting inquiry:', error);
    
    // Handle Firebase function errors
    if (error.code === 'functions/not-found') {
      // Firebase function doesn't exist yet - provide helpful error
      throw createError({
        statusCode: 503,
        statusMessage: 'Firebase function "submitInquiry" not found. Please deploy the Firebase function first.'
      });
    } else if (error.code) {
      throw createError({
        statusCode: 500,
        statusMessage: `Firebase error: ${error.message}`
      });
    }

    // Handle other errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});