import { PageServerLoad } from '@analogjs/router';
import { Document } from './[id].page';
import { adminDb } from '../../../lib/firebase-admin';

// Define Vehicle interfaces for server-side use
interface VehicleDetails {
  acriss: string;
  category: string;
  color: string;
  description: string;
  doors: number;
  gasoline: string;
  insurance: string;
  is_convertible: boolean;
  make: string;
  mileage: number;
  model: string;
  mpg: number;
  nickname: string;
  plate: string;
  seats: number;
  smoke_friendly: boolean;
  transmission: string;
  trim: string;
  vin: string;
  year: number;
}

interface Vehicle {
  id: string;
  details: VehicleDetails;
  photos: { url: string }[];
  dailyRate?: number;
  available?: boolean;
  features?: string[];
  fleetRef?: string;
  pricing?: {
    daily: number;
    deposit: number;
    excessMilePrice: number;
    freeDistanceDeliveryThreshold: number;
    mileAllowance: number;
    monthlyDiscount: number;
    perMileDeliveryPrice: number;
    weeklyDiscount: number;
  };
}

// Mock vehicles function for server-side use
const getMockVehicles = (fleetRef?: string): Vehicle[] => {
  const allVehicles = [
    {
      id: 'v1',
      details: {
        acriss: 'ECAR',
        category: 'E',
        color: 'Black',
        description: '<p>Luxury sedan with premium features</p>',
        doors: 4,
        gasoline: 'Premium Unleaded',
        insurance: 'Full Coverage',
        is_convertible: false,
        make: 'BMW',
        mileage: 25000,
        model: '3 Series',
        mpg: 28,
        nickname: 'The Executive',
        plate: 'BMW001',
        seats: 5,
        smoke_friendly: false,
        transmission: 'A',
        trim: 'Sport',
        vin: '1234567890ABCDEF1',
        year: 2023
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500' }
      ],
      dailyRate: 89,
      available: true,
      features: ['GPS Navigation', 'Leather Seats', 'Bluetooth'],
      fleetRef: 'test-fleet',
      pricing: {
        daily: 89,
        deposit: 500,
        excessMilePrice: 2,
        freeDistanceDeliveryThreshold: 25,
        mileAllowance: 100,
        monthlyDiscount: 15,
        perMileDeliveryPrice: 2,
        weeklyDiscount: 10
      }
    },
    {
      id: 'v2',
      details: {
        acriss: 'SCAR',
        category: 'S',
        color: 'White',
        description: '<p>Reliable and fuel-efficient compact car</p>',
        doors: 4,
        gasoline: 'Regular Unleaded',
        insurance: 'Basic Coverage',
        is_convertible: false,
        make: 'Honda',
        mileage: 15000,
        model: 'Civic',
        mpg: 35,
        nickname: 'The Commuter',
        plate: 'HON002',
        seats: 5,
        smoke_friendly: false,
        transmission: 'A',
        trim: 'LX',
        vin: '1234567890ABCDEF2',
        year: 2022
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500' }
      ],
      dailyRate: 49,
      available: true,
      features: ['Fuel Efficient', 'Backup Camera', 'Apple CarPlay'],
      fleetRef: 'test-fleet',
      pricing: {
        daily: 49,
        deposit: 300,
        excessMilePrice: 1.5,
        freeDistanceDeliveryThreshold: 15,
        mileAllowance: 150,
        monthlyDiscount: 12,
        perMileDeliveryPrice: 1.5,
        weeklyDiscount: 8
      }
    },
    {
      id: 'v3',
      details: {
        acriss: 'ICAR',
        category: 'I',
        color: 'Silver',
        description: '<p>Spacious SUV perfect for families</p>',
        doors: 4,
        gasoline: 'Regular Unleaded',
        insurance: 'Full Coverage',
        is_convertible: false,
        make: 'Toyota',
        mileage: 35000,
        model: 'RAV4',
        mpg: 30,
        nickname: 'Family Cruiser',
        plate: 'TOY003',
        seats: 7,
        smoke_friendly: false,
        transmission: 'A',
        trim: 'XLE',
        vin: '1234567890ABCDEF3',
        year: 2021
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500' }
      ],
      dailyRate: 69,
      available: true,
      features: ['All-Wheel Drive', '7 Seats', 'Safety Sense'],
      fleetRef: 'test-fleet',
      pricing: {
        daily: 69,
        deposit: 400,
        excessMilePrice: 2.5,
        freeDistanceDeliveryThreshold: 20,
        mileAllowance: 120,
        monthlyDiscount: 18,
        perMileDeliveryPrice: 2,
        weeklyDiscount: 12
      }
    }
  ];

  // Filter by fleetRef if provided
  if (fleetRef) {
    return allVehicles.filter(vehicle => vehicle.fleetRef === fleetRef);
  }
  
  return allVehicles;
};

// Server-side load function for the dynamic route
export const load = async ({ params }: PageServerLoad) => {
  const id = params?.['id'];
  
  if (!id || typeof id !== 'string') {
    throw new Error('Document ID is required');
  }
  
  try {
    // Fetch document from Firestore using Firebase Admin SDK
    const docRef = adminDb.collection('vanity-pages').doc(id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const documentData = docSnap.data() as Document;
      console.log('Document data:', documentData);
      
      // Fetch vehicles if fleetRef exists
      let vehicles: Vehicle[] = [];
      if (documentData.fleetRef) {
        try {
          // Try to fetch from Firestore vehicles collection using Admin SDK
          const vehiclesRef = adminDb.collection('vehicles');
          const vehiclesQuery = vehiclesRef.where('fleetRef', '==', documentData.fleetRef);
          const vehiclesSnap = await vehiclesQuery.get();
          
          if (!vehiclesSnap.empty) {
            vehicles = vehiclesSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Vehicle));
          } else {
            // Fallback to mock data if no vehicles found in Firestore
            console.log('No vehicles found in Firestore, using mock data');
            vehicles = getMockVehicles(documentData.fleetRef);
          }
        } catch (vehicleError) {
          console.error('Error fetching vehicles from Firestore, using mock data:', vehicleError);
          vehicles = getMockVehicles(documentData.fleetRef);
        }
      }
      
      // Include vehicles in the document data
      const enrichedDocumentData = {
        ...documentData,
        vehicles
      };
      
      console.log('Enriched document data with vehicles:', enrichedDocumentData);
      return enrichedDocumentData;
    } else {
      console.log('No such document!');
      throw new Error(`Document with ID "${id}" not found`);
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};