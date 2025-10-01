import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationData {
  address: string;
  latitude?: number;
  longitude?: number;
}

const locationService = {
  async getStoredLocation(): Promise<LocationData | null> {
    try {
      const locationData = await AsyncStorage.getItem('user_location');
      if (locationData) {
        return JSON.parse(locationData);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored location:', error);
      return null;
    }
  },

  async storeLocation(location: LocationData): Promise<void> {
    try {
      await AsyncStorage.setItem('user_location', JSON.stringify(location));
    } catch (error) {
      console.error('Error storing location:', error);
    }
  },

  async clearLocation(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user_location');
    } catch (error) {
      console.error('Error clearing location:', error);
    }
  },

  async requestLocationPermission(): Promise<boolean> {
    // Placeholder implementation for location permission
    console.log('Location permission requested');
    return true;
  },

  async getCurrentLocation(): Promise<LocationData | null> {
    // Placeholder implementation
    console.log('Getting current location');
    return null;
  },

  async refreshLocation(): Promise<void> {
    // Placeholder implementation
    console.log('Refreshing location');
  },
};

export default locationService;