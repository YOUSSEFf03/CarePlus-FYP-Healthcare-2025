import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}

export interface AddressData {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;
  private locationPermissionGranted: boolean = false;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.locationPermissionGranted = status === 'granted';
      
      if (this.locationPermissionGranted) {
        console.log('Location permission granted');
        // Get initial location
        await this.getCurrentLocation();
      } else {
        console.log('Location permission denied');
      }
      
      return this.locationPermissionGranted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      if (!this.locationPermissionGranted) {
        console.log('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      };

      // Get address from coordinates
      const address = await this.getAddressFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );

      locationData.address = address.formattedAddress;

      this.currentLocation = locationData;
      
      // Store location in AsyncStorage
      await this.storeLocation(locationData);

      console.log('Current location:', locationData);
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<AddressData> {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        return {
          street: address.street,
          city: address.city,
          state: address.region,
          country: address.country,
          postalCode: address.postalCode,
          formattedAddress: `${address.street || ''}, ${address.city || ''}, ${address.region || ''}`.replace(/^,\s*|,\s*$/g, ''),
        };
      }
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
    }

    return {
      formattedAddress: 'Address not available',
    };
  }

  async storeLocation(location: LocationData): Promise<void> {
    try {
      await AsyncStorage.setItem('user_location', JSON.stringify(location));
    } catch (error) {
      console.error('Error storing location:', error);
    }
  }

  async getStoredLocation(): Promise<LocationData | null> {
    try {
      const stored = await AsyncStorage.getItem('user_location');
      if (stored) {
        const location = JSON.parse(stored);
        // Check if location is not too old (1 hour)
        if (Date.now() - location.timestamp < 3600000) {
          return location;
        }
      }
    } catch (error) {
      console.error('Error getting stored location:', error);
    }
    return null;
  }

  getCurrentLocationData(): LocationData | null {
    return this.currentLocation;
  }

  isLocationPermissionGranted(): boolean {
    return this.locationPermissionGranted;
  }

  async refreshLocation(): Promise<LocationData | null> {
    return await this.getCurrentLocation();
  }
}

export default LocationService.getInstance();
