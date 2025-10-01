// Specialization icons mapping with comprehensive coverage
export const SPECIALIZATION_ICONS: { [key: string]: string } = {
    // Common specializations
    'General Physician': 'stethoscope',
    'General Practice': 'stethoscope',
    'Family Medicine': 'stethoscope',
    'Internal Medicine': 'stethoscope',
    
    // Medical specialties
    'Cardiologist': 'heart-pulse',
    'Cardiology': 'heart-pulse',
    'Neurologist': 'brain',
    'Neurology': 'brain',
    'Dermatologist': 'face-woman-outline',
    'Dermatology': 'face-woman-outline',
    'Orthopedist': 'bone',
    'Orthopedics': 'bone',
    'Pediatrician': 'baby-face-outline',
    'Pediatrics': 'baby-face-outline',
    'Gynecologist': 'female-outline',
    'Gynecology': 'female-outline',
    'Obstetrician': 'female-outline',
    'Obstetrics': 'female-outline',
    
    // Surgical specialties
    'Surgeon': 'medical-bag',
    'General Surgery': 'medical-bag',
    'Cardiac Surgeon': 'heart-pulse',
    'Neurosurgeon': 'brain',
    'Orthopedic Surgeon': 'bone',
    'Plastic Surgeon': 'face-woman-outline',
    
    // Mental health
    'Psychiatrist': 'psychology',
    'Psychiatry': 'psychology',
    'Psychologist': 'psychology',
    
    // Eye and ear
    'Ophthalmologist': 'eye-outline',
    'Ophthalmology': 'eye-outline',
    'ENT Specialist': 'ear-outline',
    'Otolaryngologist': 'ear-outline',
    'ENT': 'ear-outline',
    
    // Internal medicine subspecialties
    'Gastroenterologist': 'stomach',
    'Gastroenterology': 'stomach',
    'Endocrinologist': 'pulse',
    'Endocrinology': 'pulse',
    'Rheumatologist': 'hand-left-outline',
    'Rheumatology': 'hand-left-outline',
    'Nephrologist': 'kidney-outline',
    'Nephrology': 'kidney-outline',
    'Pulmonologist': 'lungs',
    'Pulmonology': 'lungs',
    'Hematologist': 'blood-bag',
    'Hematology': 'blood-bag',
    
    // Oncology
    'Oncologist': 'medical',
    'Oncology': 'medical',
    'Medical Oncologist': 'medical',
    'Radiation Oncologist': 'medical',
    
    // Emergency and critical care
    'Emergency Medicine': 'ambulance',
    'Emergency Physician': 'ambulance',
    'Intensivist': 'ambulance',
    'Critical Care': 'ambulance',
    
    // Anesthesia
    'Anesthesiologist': 'medical-bag',
    'Anesthesia': 'medical-bag',
    
    // Radiology and pathology
    'Radiologist': 'scan',
    'Radiology': 'scan',
    'Pathologist': 'microscope',
    'Pathology': 'microscope',
    
    // Other specialties
    'Urologist': 'medical-bag',
    'Urology': 'medical-bag',
    'Dentist': 'tooth-outline',
    'Dentistry': 'tooth-outline',
    'Oral Surgeon': 'tooth-outline',
    'Periodontist': 'tooth-outline',
    'Orthodontist': 'tooth-outline',
    
    // Alternative medicine
    'Chiropractor': 'bone',
    'Chiropractic': 'bone',
    'Physical Therapist': 'bone',
    'Physiotherapy': 'bone',
    'Acupuncturist': 'needle',
    'Acupuncture': 'needle',
    
    // Geriatrics
    'Geriatrician': 'elderly',
    'Geriatrics': 'elderly',
    
    // Sports medicine
    'Sports Medicine': 'run',
    'Sports Physician': 'run',
};

/**
 * Get the appropriate icon for a specialization with intelligent fallback
 * @param specialization - The specialization name
 * @returns The MaterialCommunityIcons icon name
 */
export const getSpecializationIcon = (specialization: string): string => {
    // Try exact match first
    if (SPECIALIZATION_ICONS[specialization]) {
        return SPECIALIZATION_ICONS[specialization];
    }
    
    // Try case-insensitive match
    const lowerSpecialization = specialization.toLowerCase();
    for (const [key, icon] of Object.entries(SPECIALIZATION_ICONS)) {
        if (key.toLowerCase() === lowerSpecialization) {
            return icon;
        }
    }
    
    // Try partial match (contains)
    for (const [key, icon] of Object.entries(SPECIALIZATION_ICONS)) {
        if (lowerSpecialization.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerSpecialization)) {
            return icon;
        }
    }
    
    // Default fallback
    return 'stethoscope';
};

/**
 * Get a random default icon for unknown specializations
 * This provides variety instead of always using stethoscope
 */
export const getRandomDefaultIcon = (): string => {
    const defaultIcons = [
        'stethoscope',
        'medical-bag',
        'medical',
        'hospital',
        'doctor',
        'heart-pulse',
        'brain',
        'eye-outline',
        'tooth-outline',
        'bone',
    ];
    
    const randomIndex = Math.floor(Math.random() * defaultIcons.length);
    return defaultIcons[randomIndex];
};

/**
 * Get icon with random fallback for unknown specializations
 * @param specialization - The specialization name
 * @returns The MaterialCommunityIcons icon name
 */
export const getSpecializationIconWithRandomFallback = (specialization: string): string => {
    const icon = getSpecializationIcon(specialization);
    return icon === 'stethoscope' ? getRandomDefaultIcon() : icon;
};

/**
 * Get all available specializations with their icons
 * @returns Array of objects with specialization and icon
 */
export const getAllSpecializationMappings = (): Array<{ specialization: string; icon: string }> => {
    return Object.entries(SPECIALIZATION_ICONS).map(([specialization, icon]) => ({
        specialization,
        icon,
    }));
};

/**
 * Check if a specialization has a specific icon mapping
 * @param specialization - The specialization name
 * @returns True if the specialization has a specific icon mapping
 */
export const hasSpecificIcon = (specialization: string): boolean => {
    return SPECIALIZATION_ICONS[specialization] !== undefined;
};
