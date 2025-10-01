import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { createClient } from '@supabase/supabase-js';
import CustomInput from "../../components/Inputs/CustomInput";
import PhoneInput from "../../components/Inputs/PhoneInput";
import SearchSelect, { Option } from "../../components/Inputs/SearchSelect";
import FileUploader from "../../components/Inputs/FileUploader";
import Button from "../../components/Button/Button";

import "../../styles/doctorProfile.css";

const API_BASE = "http://localhost:3000";

// Supabase configuration (same as DoctorSignup)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY as string;
const SUPABASE_BUCKET = 'doctor-docs';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase env vars (REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY)');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Upload file to Supabase (same as DoctorSignup)
async function uploadToSupabase(file: File, kind: 'profile' | 'license' | 'id'): Promise<string> {
    // make a safe filename
    const safe = file.name.replace(/[^A-Za-z0-9_.-]+/g, '_');
    const path = `doctors/${Date.now()}_${kind}_${safe}`;

    const { error } = await supabase
        .storage
        .from(SUPABASE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: true });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}


type ProfileStore = {
  // User data
  name: string;
  email: string;
  phone: string; // E.164 "+..."
  profile_picture_url?: string;
  
  // Doctor specific data
  specialization: string;
  biography: string;
  license_number: string;
  medical_license_url?: string;
  dr_idCard_url?: string;
  verification_status?: string;
  
  // UI state
  publicContact: boolean;
};

const STORAGE_KEY = "doctor_profile_v1";

const SPECIALTIES: Option[] = [
  { value: "Cardiology", label: "Cardiology" },
  { value: "Dermatology", label: "Dermatology" },
  { value: "Endocrinology", label: "Endocrinology" },
  { value: "Family Medicine", label: "Family Medicine" },
  { value: "Gastroenterology", label: "Gastroenterology" },
  { value: "General Surgery", label: "General Surgery" },
  { value: "Neurology", label: "Neurology" },
  { value: "Obstetrics & Gynecology", label: "Obstetrics & Gynecology" },
  { value: "Oncology", label: "Oncology" },
  { value: "Ophthalmology", label: "Ophthalmology" },
  { value: "Orthopedics", label: "Orthopedics" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Psychiatry", label: "Psychiatry" },
  { value: "Urology", label: "Urology" },
];

function loadStore(): ProfileStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    name: "",
    email: "",
    phone: "",
    specialization: "",
    biography: "",
    license_number: "",
    publicContact: false,
  };
}

function saveStore(v: ProfileStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
}


// Helper function to decode JWT token
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// API functions
async function fetchDoctorProfile(): Promise<ProfileStore> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  
  // Get user data from JWT token
  const userData = decodeJWT(token);
  
  // Fetch doctor profile data
  const response = await axios.get(`${API_BASE}/doctors/profile/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Handle different possible response structures
  const data = response.data?.data || response.data || {};
  
  // Try to get user profile data if available
  let userProfileData = null;
  try {
    const userResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    userProfileData = userResponse.data?.data || userResponse.data;
  } catch (error) {
    console.log('User profile API not available, using JWT data only');
  }
  
  return {
    name: userData?.name || userProfileData?.name || "",
    email: userData?.email || userProfileData?.email || "",
    phone: userData?.phone || userProfileData?.phone || data.phone || "",
    profile_picture_url: userData?.profile_picture_url || userProfileData?.profile_picture_url || data.profile_picture_url,
    specialization: data.specialization || "",
    biography: data.biography || "",
    license_number: data.license_number || "",
    medical_license_url: data.medical_license_url,
    dr_idCard_url: data.dr_idCard_url,
    verification_status: data.verification_status,
    publicContact: false, // This is UI state, not from API
  };
}

async function updateUserProfile(updates: any): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  
  await axios.put(`${API_BASE}/auth/profile`, updates, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

async function updateDoctorProfile(updates: Partial<ProfileStore>): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  
  // Prepare the update payload - only send fields that the API expects
  const updatePayload: any = {};
  
  if (updates.specialization !== undefined) updatePayload.specialization = updates.specialization;
  if (updates.biography !== undefined) updatePayload.biography = updates.biography;
  if (updates.license_number !== undefined) updatePayload.license_number = updates.license_number;
  if (updates.medical_license_url !== undefined) updatePayload.medical_license_url = updates.medical_license_url;
  if (updates.dr_idCard_url !== undefined) updatePayload.dr_idCard_url = updates.dr_idCard_url;
  
  await axios.put(`${API_BASE}/doctors/profile/me`, updatePayload, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

export default function DoctorProfile() {
  const [data, setData] = useState<ProfileStore>(loadStore());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // transient files only while editing
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  // local, editable copies while in edit mode
  const [draft, setDraft] = useState<ProfileStore>(data);

  // Fetch profile data on component mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const profileData = await fetchDoctorProfile();
        setData(profileData);
        saveStore(profileData); // Cache in localStorage
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load profile data');
        // Set fallback data to prevent undefined errors
        setData({
          name: "",
          email: "",
          phone: "",
          specialization: "",
          biography: "",
          license_number: "",
          publicContact: false,
        });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    if (editing) setDraft(data);
  }, [editing, data]); // eslint-disable-line

  // simple validation
  const errors = useMemo(() => {
    const e: Partial<Record<keyof ProfileStore, string>> = {};
    if (!draft.name?.trim()) e.name = "Required";
    if (!draft.specialization?.trim()) e.specialization = "Required";
    if (!draft.email?.trim() || !/^\S+@\S+\.\S+$/.test(draft.email))
      e.email = "Enter a valid email";
    if (
      !draft.phone ||
      !draft.phone.startsWith("+") ||
      draft.phone.replace(/\D/g, "").length < 7
    ) {
      e.phone = "Enter a valid international phone";
    }
    if (!draft.license_number?.trim()) e.license_number = "Required";
    return e;
  }, [draft]);

  const hasErrors = Object.keys(errors).length > 0;

  async function onSave() {
    try {
      setSaving(true);
      setError(null);

      // Prepare doctor profile updates
      const doctorUpdates: Partial<ProfileStore> = {
        specialization: draft.specialization,
        biography: draft.biography,
        license_number: draft.license_number,
      };

      // Prepare user profile updates
      const userUpdates: any = {
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
      };

      // Handle profile picture upload
      if (profilePictureFile) {
        try {
          const profilePictureUrl = await uploadToSupabase(profilePictureFile, 'profile');
          userUpdates.profile_picture_url = profilePictureUrl;
        } catch (uploadError) {
          console.error('Failed to upload profile picture:', uploadError);
          setError('Failed to upload profile picture');
          return;
        }
      }

      // Handle medical license upload
      if (licenseFile) {
        try {
          const licenseUrl = await uploadToSupabase(licenseFile, 'license');
          doctorUpdates.medical_license_url = licenseUrl;
        } catch (uploadError) {
          console.error('Failed to upload medical license:', uploadError);
          setError('Failed to upload medical license');
          return;
        }
      }

      // Handle ID card upload
      if (idFile) {
        try {
          const idUrl = await uploadToSupabase(idFile, 'id');
          doctorUpdates.dr_idCard_url = idUrl;
        } catch (uploadError) {
          console.error('Failed to upload ID card:', uploadError);
          setError('Failed to upload ID card');
          return;
        }
      }

      // Update user profile (name, email, phone, profile picture)
      await updateUserProfile(userUpdates);

      // Update doctor profile (specialization, biography, license, documents)
      await updateDoctorProfile(doctorUpdates);

      // Update local state
      const next = { ...draft, ...userUpdates, ...doctorUpdates };
      setData(next);
      saveStore(next);
      setEditing(false);

      // clear transient files
      setLicenseFile(null);
      setIdFile(null);
      setProfilePictureFile(null);
      
      // Show success message (optional)
      console.log('Profile updated successfully!');
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    setEditing(false);
    setLicenseFile(null);
    setIdFile(null);
    setProfilePictureFile(null);
    setError(null);
  }

  // Helpers for read-only file display
  function renderFilePreview(url: string | null, name: string | null) {
    if (!url || !name) return <span className="muted">—</span>;
    const isImage = url.startsWith("data:image/") || url.startsWith("http");
    return (
      <div className="file-preview">
        {isImage ? (
          <img src={url} alt={name} />
        ) : (
          <div className="pdf-chip">PDF</div>
        )}
        <a href={url} target="_blank" rel="noreferrer" className="file-link">
          {name}
        </a>
      </div>
    );
  }

  // Profile picture display
  function renderProfilePicture() {
    const currentPicture = profilePictureFile ? 
      URL.createObjectURL(profilePictureFile) : 
      data.profile_picture_url;
    
    if (!currentPicture) return <span className="muted">No profile picture</span>;
    
    return (
      <div className="profile-picture-preview">
        <img src={currentPicture} style={{width:"150px", height:"150px"}} alt="Profile" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-wrap">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-wrap">
        <div className="error-container">
          <h2>Error loading profile</h2>
          <p>{error}</p>
          <Button 
            variant="primary" 
            text="Retry" 
            onClick={() => window.location.reload()} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrap">
      <header className="profile-header">
        <h1>Profile</h1>

        {!editing ? (
          <div className="header-actions">
            <Button
              variant="primary"
              iconLeft={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M28.4138 9.17171L22.8288 3.58546C22.643 3.39969 22.4225 3.25233 22.1799 3.1518C21.9372 3.05126 21.6771 2.99951 21.4144 2.99951C21.1517 2.99951 20.8916 3.05126 20.6489 3.1518C20.4062 3.25233 20.1857 3.39969 20 3.58546L4.58626 19.0005C4.39973 19.1855 4.25185 19.4058 4.15121 19.6485C4.05057 19.8912 3.99917 20.1515 4.00001 20.4142V26.0005C4.00001 26.5309 4.21072 27.0396 4.5858 27.4147C4.96087 27.7897 5.46958 28.0005 6.00001 28.0005H11.5863C11.849 28.0013 12.1093 27.9499 12.352 27.8493C12.5947 27.7486 12.815 27.6007 13 27.4142L28.4138 12.0005C28.5995 11.8147 28.7469 11.5942 28.8474 11.3516C28.948 11.1089 28.9997 10.8488 28.9997 10.5861C28.9997 10.3234 28.948 10.0633 28.8474 9.82061C28.7469 9.57793 28.5995 9.35743 28.4138 9.17171ZM6.41376 20.0005L17 9.41421L19.0863 11.5005L8.50001 22.0855L6.41376 20.0005ZM6.00001 22.4142L9.58626 26.0005H6.00001V22.4142ZM12 25.5867L9.91376 23.5005L20.5 12.9142L22.5863 15.0005L12 25.5867ZM24 13.5867L18.4138 8.00046L21.4138 5.00046L27 10.5855L24 13.5867Z"
                    fill="currentColor"
                  />
                </svg>
              }
              text="Edit"
              onClick={() => setEditing(true)}
            />
          </div>
        ) : (
          <div className="header-actions">
            <Button variant="tertiary" text="Cancel" onClick={onCancel} />
            <Button
              variant="primary"
              text={saving ? "Saving..." : "Save changes"}
              onClick={onSave}
              disabled={hasErrors || saving}
              iconLeft={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M27.4137 9.0005L23 4.58675C22.815 4.40022 22.5947 4.25234 22.352 4.1517C22.1093 4.05105 21.849 3.99966 21.5863 4.0005H6C5.46957 4.0005 4.96086 4.21121 4.58579 4.58628C4.21071 4.96136 4 5.47007 4 6.0005V26.0005C4 26.5309 4.21071 27.0396 4.58579 27.4147C4.96086 27.7898 5.46957 28.0005 6 28.0005H26C26.5304 28.0005 27.0391 27.7898 27.4142 27.4147C27.7893 27.0396 28 26.5309 28 26.0005V10.4142C28.0008 10.1515 27.9494 9.89122 27.8488 9.64852C27.7482 9.40582 27.6003 9.18554 27.4137 9.0005ZM21 26.0005H11V19.0005H21V26.0005ZM26 26.0005H23V19.0005C23 18.4701 22.7893 17.9614 22.4142 17.5863C22.0391 17.2112 21.5304 17.0005 21 17.0005H11C10.4696 17.0005 9.96086 17.2112 9.58579 17.5863C9.21071 17.9614 9 18.4701 9 19.0005V26.0005H6V6.0005H21.5863L26 10.4142V26.0005ZM20 9.0005C20 9.26571 19.8946 9.52007 19.7071 9.7076C19.5196 9.89514 19.2652 10.0005 19 10.0005H12C11.7348 10.0005 11.4804 9.89514 11.2929 9.7076C11.1054 9.52007 11 9.26571 11 9.0005C11 8.73528 11.1054 8.48093 11.2929 8.29339C11.4804 8.10586 11.7348 8.0005 12 8.0005H19C19.2652 8.0005 19.5196 8.10586 19.7071 8.29339C19.8946 8.48093 20 8.73528 20 9.0005Z"
                    fill="currentColor"
                  />
                </svg>
              }
              title={hasErrors ? "Fix errors before saving" : undefined}
            />
          </div>
        )}
      </header>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {!editing && (
        <section className="card">
          <div className="grid">
            <div className="item span-2">
              <label>Profile Picture</label>
              <div className="value">
                {renderProfilePicture()}
              </div>
            </div>
            <div className="item">
              <label>Name</label>
              <div className="value">
                {data.name || <span className="muted">—</span>}
              </div>
            </div>
            <div className="item">
              <label>Email</label>
              <div className="value">
                {data.email || <span className="muted">—</span>}
              </div>
            </div>
            <div className="item">
              <label>Phone</label>
              <div className="value">
                {data.phone || <span className="muted">—</span>}
              </div>
            </div>
            <div className="item">
              <label>Specialization</label>
              <div className="value">
                {data.specialization || <span className="muted">—</span>}
              </div>
            </div>
            <div className="item">
              <label>Verification Status</label>
              <div className="value">
                <span className={`status-badge ${data.verification_status?.toLowerCase()}`}>
                  {data.verification_status || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="item span-2">
              <label>Biography</label>
              <div className="value">
                {data.biography || <span className="muted">—</span>}
              </div>
            </div>
            <div className="item">
              <label>Medical License #</label>
              <div className="value">
                {data.license_number || <span className="muted">—</span>}
              </div>
            </div>
            <div className="item">
              <label>Medical License (PDF/Image)</label>
              <div className="value">
                {renderFilePreview(data.medical_license_url || null, 'Medical License')}
              </div>
            </div>
            <div className="item">
              <label>Doctor ID Card (PDF/Image)</label>
              <div className="value">
                {renderFilePreview(data.dr_idCard_url || null, 'Doctor ID Card')}
              </div>
            </div>
          </div>
        </section>
      )}

      {editing && (
        <form className="card form">
          <div className="grid">
            <div className="item span-2">
              <FileUploader
                label="Profile Picture"
                description="Upload a profile picture — max 5MB"
                value={profilePictureFile}
                onChange={setProfilePictureFile}
                accept="image/*"
              />
              {data.profile_picture_url && !profilePictureFile && (
                <div className="persisted-file">
                  <span className="muted">Current:</span>{" "}
                  <a href={data.profile_picture_url} target="_blank" rel="noreferrer">
                    View current picture
                  </a>
                </div>
              )}
            </div>

            <div className="item">
              <CustomInput
                label="Name"
                placeholder="Dr. Jane Doe"
                value={draft.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    name: (e.target as HTMLInputElement).value,
                  })
                }
                message={errors.name}
                variant={errors.name ? "error" : "normal"}
              />
            </div>

            <div className="item">
              <CustomInput
                label="Email"
                type="email"
                placeholder="doctor@example.com"
                value={draft.email}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    email: (e.target as HTMLInputElement).value,
                  })
                }
                message={errors.email}
                variant={errors.email ? "error" : "disabled"}
              />
            </div>

            <div className="item">
              <PhoneInput
                label="Phone"
                value={draft.phone}
                onChange={(v) => setDraft({ ...draft, phone: v })}
                message={errors.phone}
                variant={errors.phone ? "error" : "disabled"}
              />
            </div>

            <div className="item">
              <SearchSelect
                label="Specialization"
                placeholder="Select specialization"
                options={SPECIALTIES}
                value={draft.specialization}
                onChange={(v) => setDraft({ ...draft, specialization: v })}
                message={errors.specialization}
                variant={errors.specialization ? "error" : "disabled"}
                creatable
                showOtherRow
              />
            </div>


            <div className="item span-2">
              <CustomInput
                as="textarea"
                label="Biography"
                placeholder="Short professional bio…"
                rows={5}
                maxLength={1000}
                value={draft.biography}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    biography: (e.target as HTMLTextAreaElement).value,
                  })
                }
              />
            </div>

            <div className="item">
              <CustomInput
                label="Medical License #"
                placeholder="e.g. LB-123456"
                value={draft.license_number}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    license_number: (e.target as HTMLInputElement).value,
                  })
                }
                message={errors.license_number}
                variant={errors.license_number ? "error" : "normal"}
              />
            </div>


            <div className="item">
              <FileUploader
                label="Medical License (PDF/Image)"
                description="Upload an image or PDF — max 10MB"
                value={licenseFile}
                onChange={setLicenseFile}
              />
              {data.medical_license_url && !licenseFile && (
                <div className="persisted-file">
                  <span className="muted">Current:</span>{" "}
                  <a href={data.medical_license_url} target="_blank" rel="noreferrer">
                    View current license
                  </a>
                </div>
              )}
            </div>

            <div className="item">
              <FileUploader
                label="Doctor ID Card (PDF/Image)"
                description="Upload an image or PDF — max 10MB"
                value={idFile}
                onChange={setIdFile}
              />
              {data.dr_idCard_url && !idFile && (
                <div className="persisted-file">
                  <span className="muted">Current:</span>{" "}
                  <a href={data.dr_idCard_url} target="_blank" rel="noreferrer">
                    View current ID card
                  </a>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
