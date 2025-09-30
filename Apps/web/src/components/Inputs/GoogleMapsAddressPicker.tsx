import React, { useEffect, useRef, useState, useCallback } from 'react';
import './GoogleMapsAddressPicker.css';

interface AddressData {
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  building_name?: string;
  building_number?: string;
  floor_number?: string;
  area_description?: string;
  maps_link?: string;
  latitude?: number;
  longitude?: number;
}

interface GoogleMapsAddressPickerProps {
  label?: string;
  value?: AddressData;
  onChange: (address: AddressData) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  variant?: 'normal' | 'error' | 'disabled';
  message?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Google Maps types
interface GoogleMapsMap {
  setCenter: (location: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  addListener: (event: string, callback: (event: any) => void) => void;
}

interface GoogleMapsMarker {
  setMap: (map: GoogleMapsMap | null) => void;
  getPosition: () => { lat: () => number; lng: () => number } | null;
  addListener: (event: string, callback: () => void) => void;
}

interface GoogleMapsSearchBox {
  getPlaces: () => any[];
  addListener: (event: string, callback: () => void) => void;
}

interface GoogleMapsGeocoder {
  geocode: (request: { location: { lat: number; lng: number } }, callback: (results: any[], status: string) => void) => void;
}

interface GoogleMapsMapMouseEvent {
  latLng: { lat: () => number; lng: () => number } | null;
}

interface GoogleMapsPlace {
  address_components?: Array<{
    long_name: string;
    types: string[];
  }>;
  geometry?: {
    location?: { lat: () => number; lng: () => number };
  };
  formatted_address?: string;
  name?: string;
  url?: string;
}

const GoogleMapsAddressPicker: React.FC<GoogleMapsAddressPickerProps> = ({
  label,
  value,
  onChange,
  onError,
  placeholder = "Search for an address...",
  variant = 'normal',
  message,
  disabled = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<GoogleMapsMarker | null>(null);
  const [map, setMap] = useState<GoogleMapsMap | null>(null);
  const [marker, setMarker] = useState<GoogleMapsMarker | null>(null);
  const [searchBox, setSearchBox] = useState<GoogleMapsSearchBox | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const GOOGLE_MAPS_API_KEY = 'AIzaSyBXOiQ1pFAkUz2Uf-rnAqqYvFB9l8NQq80';

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => onError?.('Failed to load Google Maps');
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onError]);

  // Initialize map and search box
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !searchInputRef.current) return;

    const mapInstance = new (window.google as any).maps.Map(mapRef.current, {
      center: { lat: 33.8938, lng: 35.5018 }, // Default to Lebanon
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const searchBoxInstance = new (window.google as any).maps.places.SearchBox(searchInputRef.current);
    
    // Handle search box changes
    searchBoxInstance.addListener('places_changed', () => {
      const places = searchBoxInstance.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      // Update map center
      mapInstance.setCenter({ lat, lng });
      mapInstance.setZoom(15);

      // Clear existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Add new marker
      const newMarker = new (window.google as any).maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        draggable: true,
      });

      markerRef.current = newMarker;
      setMarker(newMarker);

      // Handle marker drag
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        if (position) {
          reverseGeocode(position.lat(), position.lng());
        }
      });

      // Extract address components
      extractAddressFromPlace(place);
    });

    // Handle map click
    mapInstance.addListener('click', (event: GoogleMapsMapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Clear existing marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        // Add new marker
        const newMarker = new (window.google as any).maps.Marker({
          position: { lat, lng },
          map: mapInstance,
          draggable: true,
        });

        markerRef.current = newMarker;
        setMarker(newMarker);

        // Handle marker drag
        newMarker.addListener('dragend', () => {
          const position = newMarker.getPosition();
          if (position) {
            reverseGeocode(position.lat(), position.lng());
          }
        });

        reverseGeocode(lat, lng);
      }
    });

    setMap(mapInstance);
    setSearchBox(searchBoxInstance);

  }, [isLoaded]);

  // Handle marker updates
  useEffect(() => {
    if (!map || !markerRef.current) return;

    // Ensure marker is properly displayed on the map
    markerRef.current.setMap(map);
  }, [map, marker]);

  // Reverse geocoding
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = new (window.google as any).maps.Geocoder() as GoogleMapsGeocoder;
    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        extractAddressFromPlace(results[0]);
      }
    });
  }, []);

  // Extract address components from place
  const extractAddressFromPlace = useCallback((place: GoogleMapsPlace) => {
    const addressComponents = place.address_components || [];
    const geometry = place.geometry || {};
    const location = geometry.location;

    let street = '';
    let city = '';
    let state = '';
    let country = '';
    let zipcode = '';
    let buildingName = '';
    let buildingNumber = '';

    addressComponents.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        buildingNumber = component.long_name;
      } else if (types.includes('route')) {
        street = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('postal_code')) {
        zipcode = component.long_name;
      } else if (types.includes('premise')) {
        buildingName = component.long_name;
      }
    });

    // If no street name found, try to extract from formatted address
    if (!street && place.formatted_address) {
      const addressParts = place.formatted_address.split(',');
      if (addressParts.length > 0) {
        // Take the first part as street if it doesn't look like a city
        const firstPart = addressParts[0].trim();
        if (firstPart && !firstPart.includes(city) && !firstPart.includes(state)) {
          street = firstPart;
        }
      }
    }

    // If still no street, use a generic description
    if (!street) {
      const lat = location?.lat() || 0;
      const lng = location?.lng() || 0;
      street = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    const fullAddress = place.formatted_address || '';
    const lat = location?.lat() || 0;
    const lng = location?.lng() || 0;
    const mapsLink = place.url || `https://www.google.com/maps?q=${lat},${lng}`;

    const addressData: AddressData = {
      street: buildingNumber ? `${buildingNumber} ${street}` : street,
      city,
      state,
      country,
      zipcode,
      building_name: buildingName,
      building_number: buildingNumber,
      area_description: place.name || '',
      maps_link: mapsLink,
      latitude: location?.lat(),
      longitude: location?.lng(),
    };

    onChange(addressData);
    setSearchValue(fullAddress);
  }, [onChange]);

  // Update search input when value changes externally
  useEffect(() => {
    if (value && value.street && value.city) {
      const fullAddress = `${value.street}, ${value.city}, ${value.state}, ${value.country}`;
      setSearchValue(fullAddress);
    }
  }, [value]);

  // Update map and marker when value changes externally
  useEffect(() => {
    if (!map || !value || !value.latitude || !value.longitude) return;

    const lat = value.latitude;
    const lng = value.longitude;

    // Update map center
    map.setCenter({ lat, lng });
    map.setZoom(15);

    // Clear existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Add new marker
    const newMarker = new (window.google as any).maps.Marker({
      position: { lat, lng },
      map: map,
      draggable: true,
    });

    // Handle marker drag
    newMarker.addListener('dragend', () => {
      const position = newMarker.getPosition();
      if (position) {
        reverseGeocode(position.lat(), position.lng());
      }
    });

    markerRef.current = newMarker;
    setMarker(newMarker);
  }, [map, value, reverseGeocode]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  const getInputClassName = () => {
    let className = 'gmap-input';
    if (variant === 'error') className += ' gmap-input-error';
    if (variant === 'disabled' || disabled) className += ' gmap-input-disabled';
    return className;
  };

  const getContainerClassName = () => {
    let className = 'gmap-container';
    if (variant === 'error') className += ' gmap-container-error';
    if (variant === 'disabled' || disabled) className += ' gmap-container-disabled';
    return className;
  };

  if (!isLoaded) {
    return (
      <div className="gmap-loading">
        <div className="gmap-loading-spinner"></div>
        <span>Loading Google Maps...</span>
      </div>
    );
  }

  return (
    <div className={getContainerClassName()}>
      {label && <label className="gmap-label">{label}</label>}
      
      <div className="gmap-search-container">
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={getInputClassName()}
          disabled={disabled}
        />
        <div className="gmap-search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="gmap-map-container">
        <div ref={mapRef} className="gmap-map" key="google-map" />
      </div>

      {message && (
        <div className={`gmap-message gmap-message-${variant}`}>
          {message}
        </div>
      )}

      <div className="gmap-instructions">
        <p>💡 <strong>How to use:</strong></p>
        <ul>
          <li>Type in the search box to find an address</li>
          <li>Click anywhere on the map to set a location</li>
          <li>Drag the marker to fine-tune the position</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleMapsAddressPicker;
