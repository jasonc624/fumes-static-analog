import { defineEventHandler, readBody, createError } from 'h3';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../lib/firebase';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  fleetName: string;
  accountType: string;
  type: string;
  [key: string]: any; // Allow additional properties
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
    const body: RegisterData = await readBody(event);

    // Validate required fields
    if (!body.email || !body.password || !body.firstName || !body.lastName || !body.phone || !body.dateOfBirth || !body.fleetName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: email, password, firstName, lastName, phone, dateOfBirth, fleetName'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      });
    }

    // Validate password length
    if (body.password.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 8 characters long'
      });
    }

    // Set default values
    const accountData = {
      ...body,
      type: body.type || 'host',
      accountType: body.accountType || 'owner',
      timestamp: new Date().toISOString()
    };

    // Call Firebase function
    const createAccountWithDetails = httpsCallable(functions, 'create_account_with_details');
    
    const result = await createAccountWithDetails(accountData);

    return {
      success: true,
      message: 'Account created successfully',
      data: result.data
    };

  } catch (error: any) {
    console.error('Error creating account:', error);
    
    // Handle Firebase function errors
    if (error.code === 'functions/not-found') {
      // Firebase function doesn't exist yet - provide helpful error
      throw createError({
        statusCode: 503,
        statusMessage: 'Firebase function "create_account_with_details" not found. Please deploy the Firebase function first.'
      });
    } else if (error.code === 'auth/email-already-in-use') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email address is already in use'
      });
    } else if (error.code === 'auth/weak-password') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password is too weak'
      });
    } else if (error.code === 'auth/invalid-email') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email address'
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