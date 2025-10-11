import { PageServerLoad } from '@analogjs/router';
import { adminDb } from '../../../lib/firebase-admin';
import { VanityPage, VanityPageVehicle } from '@fumes/types';

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
      const documentData = docSnap.data() as VanityPage;
      console.log('Document data:', documentData);
      
      // Fetch vehicles if fleetRef exists
      let vehicles: VanityPageVehicle[] = [];
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
            } as VanityPageVehicle));
          } else {
            // Fallback to mock data if no vehicles found in Firestore
            console.log('No vehicles found in Firestore, using mock data');
          }
        } catch (vehicleError) {
          console.error('Error fetching vehicles from Firestore, using mock data:', vehicleError);
          
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