import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import CustomText from "../../components/Text/CustomText";
import CustomInput from "../../components/Inputs/CustomInput";
import PhoneInput from "../../components/Inputs/PhoneInput";
import SearchSelect from "../../components/Inputs/SearchSelect";
import Button from "../../components/Button/Button";
import "../../styles/addWorkplace.css";

// Supabase configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://rpxacozovhkexaqdjnan.supabase.co";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJweGFjb3pvdmhreHFxZGpuYW4iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTQzNzQ5MCwiZXhwIjoyMDUxMDEzNDkwfQ.zribA3wQYL7f2J7P0IU1CpRYbiMBrdL3OkR4Wzs2O9Q";
const SUPABASE_BUCKET = "doctor-docs";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    googleMapsReady: boolean;
  }
}

const API_BASE = "http://localhost:3000";

interface WorkplaceFormData {
  name: string;
  workplace_type: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  maps_link: string;
  image_url?: string;
  addresses: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  working_hours: {
    monday: { is_open: boolean; start_time: string; end_time: string };
    tuesday: { is_open: boolean; start_time: string; end_time: string };
    wednesday: { is_open: boolean; start_time: string; end_time: string };
    thursday: { is_open: boolean; start_time: string; end_time: string };
    friday: { is_open: boolean; start_time: string; end_time: string };
    saturday: { is_open: boolean; start_time: string; end_time: string };
    sunday: { is_open: boolean; start_time: string; end_time: string };
  };
  services: string[];
  insurance_accepted: string[];
  consultation_fee: number;
  is_primary: boolean;
}

const workplaceTypes = [
  { value: "clinic", label: "Clinic" },
  { value: "hospital", label: "Hospital" },
  { value: "private_practice", label: "Private Practice" },
  { value: "medical_center", label: "Medical Center" },
  { value: "home_visits", label: "Home Visits" },
];

const commonServices = [
  "General Consultation",
  "Emergency Care",
  "Preventive Care",
  "Diagnostic Services",
  "Laboratory Tests",
  "X-Ray Services",
  "Ultrasound",
  "ECG",
  "Blood Pressure Check",
  "Vaccination",
  "Health Screening",
  "Chronic Disease Management",
  "Mental Health Services",
  "Physical Therapy",
  "Nutrition Counseling",
  "Pediatric Care",
  "Geriatric Care",
  "Women's Health",
  "Men's Health",
  "Travel Medicine",
];

const commonInsurance = [
  "Blue Cross Blue Shield",
  "Aetna",
  "Cigna",
  "UnitedHealth",
  "Humana",
  "Kaiser Permanente",
  "Medicare",
  "Medicaid",
  "Tricare",
  "Self-Pay",
  "Other",
];

export default function AddWorkplace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [workplaceImage, setWorkplaceImage] = useState<File | null>(null);
  const [workplaceImageUrl, setWorkplaceImageUrl] = useState<string>("");

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [formData, setFormData] = useState<WorkplaceFormData>({
    name: "",
    workplace_type: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    maps_link: "",
    image_url: "",
    addresses: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      latitude: 0,
      longitude: 0,
    },
    working_hours: {
      monday: { is_open: true, start_time: "09:00", end_time: "17:00" },
      tuesday: { is_open: true, start_time: "09:00", end_time: "17:00" },
      wednesday: { is_open: true, start_time: "09:00", end_time: "17:00" },
      thursday: { is_open: true, start_time: "09:00", end_time: "17:00" },
      friday: { is_open: true, start_time: "09:00", end_time: "17:00" },
      saturday: { is_open: false, start_time: "09:00", end_time: "17:00" },
      sunday: { is_open: false, start_time: "09:00", end_time: "17:00" },
    },
    services: [],
    insurance_accepted: [],
    consultation_fee: 0,
    is_primary: false,
  });

  // Initialize Google Maps function
  const initializeMap = () => {
    if (
      window.google &&
      window.google.maps &&
      window.google.maps.Map &&
      mapRef.current &&
      !isInitializing
    ) {
      try {
        console.log("Initializing Google Maps...");
        console.log("Map ref current:", mapRef.current);
        console.log("Google Maps object:", window.google.maps);
        setIsInitializing(true);

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 33.8938, lng: 35.5018 }, // Beirut, Lebanon
          zoom: 13,
        });

        console.log("Map created successfully:", map);
        mapInstanceRef.current = map;

        // Test if map is actually visible
        setTimeout(() => {
          console.log("Map should be visible now, checking...");
          if (mapRef.current && mapRef.current.children.length > 0) {
            console.log("Map container has children, map should be visible");
          } else {
            console.log("Map container is empty, something went wrong");
          }
        }, 1000);

        // Create search box and connect it to the input (with a small delay to ensure DOM is ready)
        setTimeout(() => {
          const searchInput = document.getElementById('search-location-input') as HTMLInputElement;
          if (searchInput) {
            const searchBox = new window.google.maps.places.SearchBox(searchInput);

        // Listen for place selection
        searchBox.addListener("places_changed", () => {
          const places = searchBox.getPlaces();
          if (places.length > 0) {
            const place = places[0];
            const location = place.geometry.location;

            // Update map center and zoom
            map.setCenter(location);
            map.setZoom(15);

            // Clear existing marker
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            // Add new marker
            const marker = new window.google.maps.Marker({
              position: location,
              map: map,
              title: place.name || "Selected Location",
              draggable: true,
            });

            markerRef.current = marker;

            // Update form data with place details
            const addressComponents = place.address_components || [];
            let street = "";
            let city = "";
            let state = "";
            let postalCode = "";
            let country = "";

            addressComponents.forEach((component: any) => {
              const types = component.types;
              if (
                types.includes("street_number") ||
                types.includes("route")
              ) {
                street += component.long_name + " ";
              } else if (types.includes("locality")) {
                city = component.long_name;
              } else if (types.includes("administrative_area_level_1")) {
                state = component.long_name;
              } else if (types.includes("postal_code")) {
                postalCode = component.long_name;
              } else if (types.includes("country")) {
                country = component.long_name;
              }
            });

            setSelectedLocation({
              lat: location.lat(),
              lng: location.lng(),
              address: place.formatted_address || "",
            });

            setFormData((prev) => ({
              ...prev,
              addresses: {
                street: street.trim(),
                city,
                state,
                postal_code: postalCode,
                country,
                latitude: location.lat(),
                longitude: location.lng(),
              },
            }));
          }
        });
          } else {
            console.log("Search input not found, search functionality will not be available");
          }
        }, 500);

        // Listen for map clicks
        map.addListener("click", (event: any) => {
          const location = event.latLng;

          // Clear existing marker
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }

          // Add new marker
          const marker = new window.google.maps.Marker({
            position: location,
            map: map,
            title: "Selected Location",
            draggable: true,
          });

          markerRef.current = marker;

          // Reverse geocoding to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              const place = results[0];
              const addressComponents = place.address_components || [];
              let street = "";
              let city = "";
              let state = "";
              let postalCode = "";
              let country = "";

              addressComponents.forEach((component: any) => {
                const types = component.types;
                if (
                  types.includes("street_number") ||
                  types.includes("route")
                ) {
                  street += component.long_name + " ";
                } else if (types.includes("locality")) {
                  city = component.long_name;
                } else if (types.includes("administrative_area_level_1")) {
                  state = component.long_name;
                } else if (types.includes("postal_code")) {
                  postalCode = component.long_name;
                } else if (types.includes("country")) {
                  country = component.long_name;
                }
              });

              setSelectedLocation({
                lat: location.lat(),
                lng: location.lng(),
                address: place.formatted_address || "",
              });

              setFormData((prev) => ({
                ...prev,
                addresses: {
                  street: street.trim(),
                  city,
                  state,
                  postal_code: postalCode,
                  country,
                  latitude: location.lat(),
                  longitude: location.lng(),
                },
              }));
            }
          });
        });

        console.log("Setting map loaded to true...");
        setMapLoaded(true);
        console.log("Map initialization completed successfully!");
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
        setError(
          "Failed to initialize Google Maps. Please refresh the page."
        );
        setIsInitializing(false);
      }
    } else {
      console.log("Google Maps not ready yet...", {
        hasGoogle: !!window.google,
        hasMaps: !!(window.google && window.google.maps),
        hasMapConstructor: !!(
          window.google &&
          window.google.maps &&
          window.google.maps.Map
        ),
        hasMapRef: !!mapRef.current,
        isInitializing,
        mapLoaded,
      });
    }
  };

  // Initialize Google Maps - only when on step 2
  useEffect(() => {
    if (currentStep !== 2) return;

    // Show retry button after 5 seconds
    const retryTimeout = setTimeout(() => {
      if (!mapLoaded) {
        setShowRetryButton(true);
      }
    }, 5000);

    // Simple approach - wait for the callback AND the map ref
    let checkAttempts = 0;
    const maxCheckAttempts = 20; // 10 seconds max
    
    const checkGoogleMaps = () => {
      if (window.googleMapsReady && window.google && window.google.maps && window.google.maps.Map && mapRef.current && !isInitializing && !mapLoaded) {
        console.log("Google Maps is ready, initializing...");
        initializeMap();
      } else if (!mapLoaded && checkAttempts < maxCheckAttempts) {
        checkAttempts++;
        console.log(`Waiting for Google Maps... attempt ${checkAttempts}`, {
          googleMapsReady: !!window.googleMapsReady,
          hasGoogle: !!window.google,
          hasMaps: !!(window.google && window.google.maps),
          hasMapConstructor: !!(window.google && window.google.maps && window.google.maps.Map),
          hasMapRef: !!mapRef.current,
          isInitializing,
          mapLoaded,
        });
        setTimeout(checkGoogleMaps, 500);
      } else if (checkAttempts >= maxCheckAttempts) {
        console.error("Google Maps failed to load after 10 seconds");
        setError("Failed to load Google Maps. Please refresh the page.");
        setShowRetryButton(true);
      }
    };

    // Start checking after a longer delay to ensure DOM is ready
    setTimeout(checkGoogleMaps, 2000);

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(retryTimeout);
    };
  }, [currentStep, mapLoaded, initializeMap, isInitializing]);

  // Separate effect to initialize map when ref is ready AND we're on step 2
  useEffect(() => {
    if (currentStep === 2 && mapRef.current && window.googleMapsReady && window.google && window.google.maps && window.google.maps.Map && !isInitializing && !mapLoaded) {
      console.log("Map ref is ready and we're on step 2, initializing Google Maps...");
      initializeMap();
    }
  }, [currentStep, mapLoaded, isInitializing, initializeMap]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Upload image to Supabase
  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_workplace_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const path = `workplaces/${fileName}`;

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: true });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleInputChange = (field: keyof WorkplaceFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }

    // Validate email in real-time
    if (field === "email" && value) {
      if (!validateEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError(null);
      }
    } else if (field === "email" && !value) {
      setEmailError(null);
    }

    // Validate phone in real-time
    if (field === "phone" && value) {
      if (value.length < 8) {
        setPhoneError("Please enter a valid phone number");
      } else {
        setPhoneError(null);
      }
    } else if (field === "phone" && !value) {
      setPhoneError(null);
    }
  };

  const handleAddressChange = (
    field: keyof WorkplaceFormData["addresses"],
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [field]: value,
      },
    }));
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleWorkingHoursChange = (
    day: keyof WorkplaceFormData["working_hours"],
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: {
          ...prev.working_hours[day],
          [field]: value,
        },
      },
    }));
    // Clear validation error when user makes changes
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleArrayChange = (
    field: "services" | "insurance_accepted",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };


  const removeItem = (
    field: "services" | "insurance_accepted",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== value),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWorkplaceImage(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setWorkplaceImageUrl(previewUrl);
    }
  };

  const removeImage = () => {
    setWorkplaceImage(null);
    setWorkplaceImageUrl("");
    setFormData((prev) => ({
      ...prev,
      image_url: "",
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Debug: Check what tokens are available
      console.log("Checking for authentication tokens...");
      console.log("localStorage access_token:", localStorage.getItem("access_token"));
      console.log("localStorage token:", localStorage.getItem("token"));
      console.log("sessionStorage access_token:", sessionStorage.getItem("access_token"));
      console.log("sessionStorage token:", sessionStorage.getItem("token"));
      
      // Try multiple token storage locations
      let token = localStorage.getItem("token");
      if (!token) {
        token = localStorage.getItem("access_token");
      }
      if (!token) {
        token = sessionStorage.getItem("token");
      }
      if (!token) {
        token = sessionStorage.getItem("access_token");
      }
      
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      
      console.log("Using token:", token.substring(0, 20) + "...");

      // Upload image if provided
      let imageUrl = formData.image_url;
      if (workplaceImage) {
        console.log("Uploading workplace image...");
        imageUrl = await uploadToSupabase(workplaceImage);
        console.log("Image uploaded successfully:", imageUrl);
      }

      // Validate required fields
      const requiredFields = [
        "name",
        "workplace_type",
        "description",
        "phone",
        "email",
        "consultation_fee",
      ];

      for (const field of requiredFields) {
        if (!formData[field as keyof WorkplaceFormData]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate address fields
      const addressFields = ["street", "city", "state", "country"];
      for (const field of addressFields) {
        if (!formData.addresses[field as keyof typeof formData.addresses]) {
          throw new Error(`Address ${field} is required`);
        }
      }

      // Transform data to match backend API structure
      const workplaceData = {
        workplace_name: formData.name,
        workplace_type: formData.workplace_type,
        phone_number: formData.phone,
        email: formData.email,
        description: formData.description,
        website: formData.website || undefined,
        working_hours: Object.fromEntries(
          Object.entries(formData.working_hours).map(([day, schedule]) => [
            day,
            schedule.is_open
              ? {
                  start: schedule.start_time,
                  end: schedule.end_time,
                }
              : null,
          ])
        ),
        consultation_fee: formData.consultation_fee,
        services_offered: formData.services,
        insurance_accepted: formData.insurance_accepted,
        is_primary: formData.is_primary,
        address: {
          street: formData.addresses.street,
          city: formData.addresses.city,
          state: formData.addresses.state,
          country: formData.addresses.country,
          zipcode: formData.addresses.postal_code || undefined,
          maps_link: formData.maps_link || undefined,
        },
        // Add image_url if provided
        ...(imageUrl && { image_url: imageUrl }),
      };

      console.log("Sending workplace data:", JSON.stringify(workplaceData, null, 2));

      const response = await axios.post(
        `${API_BASE}/doctors/workplaces`,
        workplaceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Workplace created successfully:", response.data);
      navigate("/doctor/workplaces");
    } catch (error: any) {
      console.error("Error creating workplace:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create workplace"
      );
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    return (
      formData.name.trim() !== "" &&
      formData.workplace_type !== "" &&
      formData.description.trim() !== "" &&
      formData.email.trim() !== "" &&
      validateEmail(formData.email) &&
      formData.phone.trim() !== "" &&
      formData.consultation_fee > 0
    );
  };

  const validateStep2 = () => {
    return (
      formData.addresses.street.trim() !== "" &&
      formData.addresses.city.trim() !== "" &&
      formData.addresses.state.trim() !== "" &&
      formData.addresses.country.trim() !== "" &&
      formData.addresses.latitude !== 0 &&
      formData.addresses.longitude !== 0
    );
  };

  const validateStep3 = () => {
    // At least one day should be open
    const hasOpenDay = Object.values(formData.working_hours).some(
      (day) => day.is_open
    );
    return hasOpenDay;
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      case 4:
        return true; // Step 4 has no required fields
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      if (validateCurrentStep()) {
        setValidationError(null);
        setCurrentStep(currentStep + 1);
      } else {
        setValidationError(getValidationMessage());
      }
    }
  };

  const getValidationMessage = () => {
    switch (currentStep) {
      case 1:
        return "Please fill in all required fields: Name, Type, Description, Email, Phone, and Consultation Fee.";
      case 2:
        return "Please select a location on the map and ensure all address fields are filled.";
      case 3:
        return "Please set working hours for at least one day of the week.";
      default:
        return "Please complete all required fields before proceeding.";
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h3>Basic Information</h3>
      <div className="step-requirements">
        <p>Please fill in all required fields marked with *</p>
      </div>
      <div className="form-grid">
        <CustomInput
          label="Workplace Name *"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter workplace name"
          required
        />

        <SearchSelect
          label="Workplace Type *"
          value={formData.workplace_type}
          onChange={(value) => handleInputChange("workplace_type", value)}
          options={workplaceTypes}
          placeholder="Select workplace type"
        />

        <div className="form-row">
          <CustomInput
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="workplace@example.com"
            required
            variant={emailError ? "error" : "normal"}
            message={emailError || undefined}
          />
        </div>

        <PhoneInput
          label="Phone Number *"
          value={formData.phone}
          onChange={(value) => handleInputChange("phone", value)}
          variant={phoneError ? "error" : "normal"}
          message={phoneError || undefined}
        />

        <CustomInput
          label="Consultation Fee (USD) *"
          type="number"
          value={formData.consultation_fee.toString()}
          onChange={(e) =>
            handleInputChange(
              "consultation_fee",
              parseFloat(e.target.value) || 0
            )
          }
          placeholder="0.00"
          required
        />

        {/* <CustomInput
          label="Google Maps Link"
          type="text"
          value={formData.maps_link}
          onChange={(e) => handleInputChange('maps_link', e.target.value)}
          placeholder="https://maps.google.com/..."
        /> */}

        <div className="form-row">
          <CustomInput
            label="Website"
            type="text"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://www.example.com"
            optional
          />
        </div>

        <div className="form-row">
          <CustomInput
            label="Description *"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe your workplace"
            required
            as="textarea"
          />
        </div>

        <div className="checkbox-row">
          <input
            type="checkbox"
            id="is_primary"
            checked={formData.is_primary}
            onChange={(e) => handleInputChange("is_primary", e.target.checked)}
          />
          <label htmlFor="is_primary">Set as primary workplace</label>
        </div>

        <div className="form-row">
          <label className="file-upload-label">Workplace Image (Optional)</label>
          <div className="file-upload-container">
            <input
              type="file"
              id="workplace-image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <label htmlFor="workplace-image" className="file-upload-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.5 4H7.5C6.12 4 5 5.12 5 6.5V17.5C5 18.88 6.12 20 7.5 20H16.5C17.88 20 19 18.88 19 17.5V9L14.5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V8H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Choose Image
            </label>
            {workplaceImageUrl && (
              <div className="image-preview">
                <img src={workplaceImageUrl} alt="Workplace preview" />
                <button type="button" onClick={removeImage} className="remove-image-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>Location & Address</h3>
      <div className="step-requirements">
        <p>
          Select a location on the map and fill in all required address fields
        </p>
      </div>
      <div className="form-grid">
        <div className="search-input-container">
          <label className="search-label">Search Location</label>
          <input
            id="search-location-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              console.log("Searching for:", e.target.value);
            }}
            placeholder="Search for a location..."
            className="search-input"
          />
          <div className="search-icon-location">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
      </div>

      <div className="map-container">
        <div
          ref={mapRef}
          className="map"
          style={{ height: "400px", width: "100%" }}
        />
        {!mapLoaded && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Loading Google Maps...</p>
            <p className="loading-subtitle">
              Please wait while the map initializes
            </p>
            {showRetryButton && (
              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Retry Loading Map
              </button>
            )}
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="selected-location">
          <h4>Selected Location:</h4>
          <p>{selectedLocation.address}</p>
          <p>
            Coordinates: {selectedLocation.lat.toFixed(6)},{" "}
            {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

      <div className="form-grid">
        <CustomInput
          label="Street Address *"
          value={formData.addresses.street}
          onChange={(e) => handleAddressChange("street", e.target.value)}
          placeholder="Enter street address"
          required
        />

        <CustomInput
          label="City *"
          value={formData.addresses.city}
          onChange={(e) => handleAddressChange("city", e.target.value)}
          placeholder="Enter city"
          required
        />

        <CustomInput
          label="State/Province *"
          value={formData.addresses.state}
          onChange={(e) => handleAddressChange("state", e.target.value)}
          placeholder="Enter state or province"
          required
        />

        <CustomInput
          label="Postal Code"
          value={formData.addresses.postal_code}
          onChange={(e) => handleAddressChange("postal_code", e.target.value)}
          placeholder="Enter postal code"
        />

        <CustomInput
          label="Country *"
          value={formData.addresses.country}
          onChange={(e) => handleAddressChange("country", e.target.value)}
          placeholder="Enter country"
          required
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>Working Hours</h3>
      <div className="step-requirements">
        <p>Set working hours for at least one day of the week</p>
      </div>
      <div className="working-hours">
        {Object.entries(formData.working_hours).map(([day, schedule]) => (
          <div key={day} className="day-schedule">
            <div className="day-header">
              <input
                type="checkbox"
                id={`${day}_open`}
                checked={schedule.is_open}
                onChange={(e) =>
                  handleWorkingHoursChange(
                    day as keyof WorkplaceFormData["working_hours"],
                    "is_open",
                    e.target.checked
                  )
                }
              />
              <label htmlFor={`${day}_open`} className="day-name">
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </label>
            </div>
            {schedule.is_open && (
              <div className="time-inputs">
                <CustomInput
                  type="time"
                  value={schedule.start_time}
                  onChange={(e) =>
                    handleWorkingHoursChange(
                      day as keyof WorkplaceFormData["working_hours"],
                      "start_time",
                      e.target.value
                    )
                  }
                />
                <span>to</span>
                <CustomInput
                  type="time"
                  value={schedule.end_time}
                  onChange={(e) =>
                    handleWorkingHoursChange(
                      day as keyof WorkplaceFormData["working_hours"],
                      "end_time",
                      e.target.value
                    )
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h3>Services & Insurance</h3>
      <div className="step-requirements">
        <p>Add services and insurance (optional - you can skip this step)</p>
      </div>

      <div className="multi-select-section">
        <h4>Services Offered</h4>
        <div className="chip-container">
          {formData.services.map((service) => (
            <span key={service} className="chip">
              <span className="chip-text">{service}</span>
              <button
                type="button"
                onClick={() => removeItem("services", service)}
                className="chip-remove"
                title="Remove service"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="chip-selector">
          <SearchSelect
            label="Add Service"
            value=""
            onChange={(value) => handleArrayChange("services", value)}
            options={commonServices.map((service) => ({
              value: service,
              label: service,
            }))}
            placeholder="Select or type a service"
            creatable
            showOtherRow
          />
        </div>
      </div>

      <div className="multi-select-section">
        <h4>Insurance Accepted</h4>
        <div className="chip-container">
          {formData.insurance_accepted.map((insurance) => (
            <span key={insurance} className="chip">
              <span className="chip-text">{insurance}</span>
              <button
                type="button"
                onClick={() => removeItem("insurance_accepted", insurance)}
                className="chip-remove"
                title="Remove insurance"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="chip-selector">
          <SearchSelect
            label="Add Insurance"
            value=""
            onChange={(value) => handleArrayChange("insurance_accepted", value)}
            options={commonInsurance.map((insurance) => ({
              value: insurance,
              label: insurance,
            }))}
            placeholder="Select or type an insurance"
            creatable
            showOtherRow
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="add-workplace-container">
      <div className="add-workplace-header">
        <CustomText variant="text-heading-H2" as="h2">
          Add New Workplace
        </CustomText>
      </div>

      <div className="progress-bar">
        <div className="progress-steps">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`step ${currentStep >= step ? "active" : ""}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && "Basic Info"}
                {step === 2 && "Location"}
                {step === 3 && "Hours"}
                {step === 4 && "Services"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-container">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {validationError && (
          <div className="validation-banner">
            <p>{validationError}</p>
          </div>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="form-actions">
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={prevStep}
              text="Previous"
              iconLeft={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          )}

          {currentStep < 4 ? (
            <div className="next-button-container">
              <Button
                variant="primary"
                onClick={nextStep}
                text="Next"
                disabled={!validateCurrentStep()}
                iconRight={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
              {/* {!validateCurrentStep() && (
                <div className="validation-hint">
                  Complete all required fields to continue
                </div>
              )} */}
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              text={loading ? "Creating..." : "Create Workplace"}
              disabled={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
