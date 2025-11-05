import { Envelope } from '../../models/envelope.model';

export const sampleEnvelopeData: Envelope = {
  id: 'env-001',
  name: 'Vehicle Rental Agreement Package',
  created: {
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0
  },
  updated: {
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0
  },
  status: 'draft',
  settings: {
    sequential_signing: false,
    reminder_enabled: true,
    reminder_interval_days: 3,
    expiration_days: 30,
    require_authentication: false,
    allow_decline: true
  },
  customer: {
    id: 'cust-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    }
  },
  vehicle: {
    id: 'veh-001',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    vin: '1HGBH41JXMN109186',
    licensePlate: 'ABC123',
    color: 'Silver',
    pricing: {
      dailyRate: 89.99,
      weeklyRate: 549.99,
      monthlyRate: 1899.99,
      deposit: 200.00,
      taxes: 45.50,
      fees: 25.00
    }
  },
  reservation: {
    id: 'res-001',
    startDate: {
      seconds: Math.floor(new Date('2024-02-01').getTime() / 1000),
      nanoseconds: 0
    },
    endDate: {
      seconds: Math.floor(new Date('2024-02-07').getTime() / 1000),
      nanoseconds: 0
    },
    pickupLocation: 'Downtown Office',
    dropoffLocation: 'Airport Terminal',
    totalAmount: 754.48,
    duration: 7
  },
  agreements: [
    {
      id: 'agreement-001',
      name: 'Vehicle Rental Agreement',
      type: 'rental',
      wet_sign: false,
      appliedTo: ['customer'],
      created: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0
      },
      updated: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0
      },
      version: '1.0',
      text: [
        {
          id: 'section-001',
          order: 1,
          sectionTitle: 'Rental Terms and Conditions',
          sectionBody: `
            <p>This rental agreement is between <span class="mention" data-id="1">Customer Name</span> and Fumes Car Rental.</p>
            <p>Vehicle: <span class="mention" data-id="10">Vehicle Make</span> <span class="mention" data-id="11">Vehicle Model</span> (<span class="mention" data-id="12">Vehicle Year</span>)</p>
            <p>Rental Period: <span class="mention" data-id="20">Start Date</span> to <span class="mention" data-id="21">End Date</span></p>
            <p>Daily Rate: <span class="mention" data-id="30">Daily Rate</span></p>
          `,
          initials: true,
          date: true,
          fullName: false,
          digitalSignature: false
        },
        {
          id: 'section-002',
          order: 2,
          sectionTitle: 'Payment and Deposit',
          sectionBody: `
            <p>Total Rental Amount: <span class="mention" data-id="31">Total Amount</span></p>
            <p>Security Deposit: <span class="mention" data-id="32">Deposit Amount</span></p>
            <p>The renter agrees to pay all charges and fees associated with this rental.</p>
          `,
          initials: false,
          date: false,
          fullName: true,
          digitalSignature: true
        }
      ]
    },
    {
      id: 'agreement-002',
      name: 'Insurance Waiver',
      type: 'waiver',
      wet_sign: false,
      appliedTo: ['customer'],
      created: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0
      },
      updated: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0
      },
      version: '1.0',
      text: [
        {
          id: 'section-003',
          order: 1,
          sectionTitle: 'Insurance Coverage',
          sectionBody: `
            <p>The renter <span class="mention" data-id="1">Customer Name</span> acknowledges understanding of insurance coverage options.</p>
            <p>Vehicle: <span class="mention" data-id="10">Vehicle Make</span> <span class="mention" data-id="11">Vehicle Model</span></p>
            <p>By signing below, the renter accepts responsibility for any damages not covered by insurance.</p>
          `,
          initials: true,
          date: true,
          fullName: true,
          digitalSignature: false
        }
      ]
    }
  ],
  signers: [
    {
      id: 'signer-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'renter',
      order: 1,
      status: 'pending'
    }
  ]
};

// Sample legacy template data for backward compatibility testing
export const sampleLegacyTemplate = {
  id: 'template-001',
  title: 'Legacy Rental Agreement',
  text: [
    {
      sectionTitle: 'Legacy Agreement Section',
      sectionBody: `
        <p>This is a legacy template format for <span class="mention" data-id="1">Customer Name</span>.</p>
        <p>Vehicle: <span class="mention" data-id="10">Vehicle Make</span> <span class="mention" data-id="11">Vehicle Model</span></p>
      `,
      initials: true,
      date: true,
      fullName: false,
      digitalSignature: false
    }
  ]
};

export const sampleCustomer = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123'
};

export const sampleVehicle = {
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  pricing: {
    dailyRate: 89.99,
    deposit: 200.00
  }
};

export const sampleReservation = {
  startDate: {
    seconds: Math.floor(new Date('2024-02-01').getTime() / 1000),
    nanoseconds: 0
  },
  endDate: {
    seconds: Math.floor(new Date('2024-02-07').getTime() / 1000),
    nanoseconds: 0
  },
  totalAmount: 754.48
};