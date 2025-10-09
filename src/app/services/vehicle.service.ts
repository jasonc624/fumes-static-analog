import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface VehicleDetails {
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

export interface Vehicle {
  id: string;
  details: VehicleDetails;
  photos: { url: string }[];
  dailyRate?: number;
  available?: boolean;
  features?: string[];
  fleetRef?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Query vehicles by fleet reference
   * @param fleetRef The fleet reference ID
   * @returns Observable of vehicles array
   */
  getVehiclesByFleetRef(fleetRef: string): Observable<Vehicle[]> {
    if (!fleetRef) {
      return of([]);
    }

    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles/fleet/${fleetRef}`)
      .pipe(
        map(vehicles => vehicles || []),
        catchError(error => {
          console.error('Error fetching vehicles:', error);
          // Return mock data for development/testing
          return of(this.getMockVehicles());
        })
      );
  }

  /**
   * Get a single vehicle by ID
   * @param vehicleId The vehicle ID
   * @returns Observable of vehicle
   */
  getVehicleById(vehicleId: string): Observable<Vehicle | null> {
    return this.http.get<Vehicle>(`${this.apiUrl}/vehicles/${vehicleId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching vehicle:', error);
          return of(null);
        })
      );
  }

  /**
   * Mock vehicles for development/testing when API is not available
   */
  private getMockVehicles(): Vehicle[] {
    return [
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
        fleetRef: 'fleet-001'
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
          nickname: 'City Runner',
          plate: 'HON002',
          seats: 5,
          smoke_friendly: false,
          transmission: 'A',
          trim: 'LX',
          vin: '1234567890ABCDEF2',
          year: 2024
        },
        photos: [
          { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500' }
        ],
        dailyRate: 49,
        available: true,
        features: ['Fuel Efficient', 'Apple CarPlay', 'Backup Camera'],
        fleetRef: 'fleet-001'
      },
      {
        id: 'v3',
        details: {
          acriss: 'SVAR',
          category: 'S',
          color: 'Silver',
          description: '<p>Spacious SUV perfect for family trips</p>',
          doors: 4,
          gasoline: 'Regular Unleaded',
          insurance: 'Full Coverage',
          is_convertible: false,
          make: 'Toyota',
          mileage: 35000,
          model: 'RAV4',
          mpg: 30,
          nickname: 'Family Explorer',
          plate: 'TOY003',
          seats: 7,
          smoke_friendly: false,
          transmission: 'A',
          trim: 'XLE',
          vin: '1234567890ABCDEF3',
          year: 2022
        },
        photos: [
          { url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500' }
        ],
        dailyRate: 69,
        available: true,
        features: ['All-Wheel Drive', '7 Seats', 'Safety Sense'],
        fleetRef: 'fleet-001'
      },
      {
        id: 'v4',
        details: {
          acriss: 'LCAR',
          category: 'L',
          color: 'Red',
          description: '<p>High-performance sports car</p>',
          doors: 2,
          gasoline: 'Premium Unleaded',
          insurance: 'Premium Coverage',
          is_convertible: true,
          make: 'Ford',
          mileage: 8000,
          model: 'Mustang',
          mpg: 25,
          nickname: 'Speed Demon',
          plate: 'MUS004',
          seats: 4,
          smoke_friendly: false,
          transmission: 'M',
          trim: 'GT',
          vin: '1234567890ABCDEF4',
          year: 2024
        },
        photos: [
          { url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500' }
        ],
        dailyRate: 129,
        available: false,
        features: ['Convertible', 'V8 Engine', 'Sport Mode'],
        fleetRef: 'fleet-002'
      },
      {
        id: 'v5',
        details: {
          acriss: 'PCAR',
          category: 'P',
          color: 'Blue',
          description: '<p>Luxury pickup truck for work and play</p>',
          doors: 4,
          gasoline: 'Regular Unleaded',
          insurance: 'Commercial Coverage',
          is_convertible: false,
          make: 'Chevrolet',
          mileage: 45000,
          model: 'Silverado',
          mpg: 22,
          nickname: 'Work Horse',
          plate: 'CHV005',
          seats: 5,
          smoke_friendly: false,
          transmission: 'A',
          trim: 'LT',
          vin: '1234567890ABCDEF5',
          year: 2021
        },
        photos: [
          { url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500' }
        ],
        dailyRate: 79,
        available: true,
        features: ['4WD', 'Towing Package', 'Bed Liner'],
        fleetRef: 'fleet-001'
      },
      {
        id: 'v6',
        details: {
          acriss: 'ECAR',
          category: 'E',
          color: 'Gray',
          description: '<p>Electric luxury sedan</p>',
          doors: 4,
          gasoline: 'Electric',
          insurance: 'Full Coverage',
          is_convertible: false,
          make: 'Tesla',
          mileage: 12000,
          model: 'Model S',
          mpg: 120,
          nickname: 'Silent Runner',
          plate: 'TES006',
          seats: 5,
          smoke_friendly: false,
          transmission: 'A',
          trim: 'Long Range',
          vin: '1234567890ABCDEF6',
          year: 2023
        },
        photos: [
          { url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500' }
        ],
        dailyRate: 149,
        available: true,
        features: ['Autopilot', 'Supercharging', 'Premium Interior'],
        fleetRef: 'fleet-002'
      }
    ];
  }
}