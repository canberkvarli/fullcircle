// constants/CountryCodes.ts

export interface CountryCode {
    code: string;
    country: string;
    flag: string;
    name: string;
    format?: string; // Optional: for different phone number formats
    maxLength?: number; // Optional: max digits for validation
    isActive?: boolean; // Optional: to enable/disable countries
  }
  
  // Primary markets - These are your main target countries
  export const PRIMARY_COUNTRIES: CountryCode[] = [
    { 
      code: '+1', 
      country: 'US', 
      flag: '🇺🇸', 
      name: 'United States',
      format: '(XXX) XXX-XXXX',
      maxLength: 10,
      isActive: true
    },
    { 
      code: '+1', 
      country: 'CA', 
      flag: '🇨🇦', 
      name: 'Canada',
      format: '(XXX) XXX-XXXX',
      maxLength: 10,
      isActive: true
    },
  ];
  
  // Secondary markets - Countries you might expand to next
  export const SECONDARY_COUNTRIES: CountryCode[] = [
    { 
      code: '+44', 
      country: 'GB', 
      flag: '🇬🇧', 
      name: 'United Kingdom',
      format: 'XXXX XXXXXX',
      maxLength: 10,
      isActive: true
    },
    { 
      code: '+61', 
      country: 'AU', 
      flag: '🇦🇺', 
      name: 'Australia',
      format: 'XXX XXX XXX',
      maxLength: 9,
      isActive: true
    },
    { 
      code: '+64', 
      country: 'NZ', 
      flag: '🇳🇿', 
      name: 'New Zealand',
      format: 'XX XXX XXXX',
      maxLength: 9,
      isActive: true
    },
    { 
      code: '+353', 
      country: 'IE', 
      flag: '🇮🇪', 
      name: 'Ireland',
      format: 'XX XXX XXXX',
      maxLength: 9,
      isActive: true
    },
  ];
  
  // International markets - For future expansion
  export const INTERNATIONAL_COUNTRIES: CountryCode[] = [
    { 
      code: '+91', 
      country: 'IN', 
      flag: '🇮🇳', 
      name: 'India',
      format: 'XXXXX XXXXX',
      maxLength: 10,
      isActive: false // Set to true when ready to launch in India
    },
    { 
      code: '+86', 
      country: 'CN', 
      flag: '🇨🇳', 
      name: 'China',
      format: 'XXX XXXX XXXX',
      maxLength: 11,
      isActive: false
    },
    { 
      code: '+81', 
      country: 'JP', 
      flag: '🇯🇵', 
      name: 'Japan',
      format: 'XX XXXX XXXX',
      maxLength: 10,
      isActive: false
    },
    { 
      code: '+49', 
      country: 'DE', 
      flag: '🇩🇪', 
      name: 'Germany',
      format: 'XXXX XXXXXXX',
      maxLength: 11,
      isActive: false
    },
    { 
      code: '+33', 
      country: 'FR', 
      flag: '🇫🇷', 
      name: 'France',
      format: 'X XX XX XX XX',
      maxLength: 9,
      isActive: false
    },
    { 
      code: '+39', 
      country: 'IT', 
      flag: '🇮🇹', 
      name: 'Italy',
      format: 'XXX XXX XXXX',
      maxLength: 10,
      isActive: false
    },
    { 
      code: '+34', 
      country: 'ES', 
      flag: '🇪🇸', 
      name: 'Spain',
      format: 'XXX XX XX XX',
      maxLength: 9,
      isActive: false
    },
    { 
      code: '+55', 
      country: 'BR', 
      flag: '🇧🇷', 
      name: 'Brazil',
      format: '(XX) XXXXX-XXXX',
      maxLength: 11,
      isActive: false
    },
    { 
      code: '+52', 
      country: 'MX', 
      flag: '🇲🇽', 
      name: 'Mexico',
      format: 'XX XXXX XXXX',
      maxLength: 10,
      isActive: false
    },
    { 
      code: '+82', 
      country: 'KR', 
      flag: '🇰🇷', 
      name: 'South Korea',
      format: 'XX XXXX XXXX',
      maxLength: 10,
      isActive: false
    },
    { 
      code: '+65', 
      country: 'SG', 
      flag: '🇸🇬', 
      name: 'Singapore',
      format: 'XXXX XXXX',
      maxLength: 8,
      isActive: false
    },
    { 
      code: '+971', 
      country: 'AE', 
      flag: '🇦🇪', 
      name: 'United Arab Emirates',
      format: 'XX XXX XXXX',
      maxLength: 9,
      isActive: false
    },
    { 
      code: '+27', 
      country: 'ZA', 
      flag: '🇿🇦', 
      name: 'South Africa',
      format: 'XX XXX XXXX',
      maxLength: 9,
      isActive: false
    },
    { 
      code: '+31', 
      country: 'NL', 
      flag: '🇳🇱', 
      name: 'Netherlands',
      format: 'X XXXX XXXX',
      maxLength: 9,
      isActive: false
    },
    { 
      code: '+46', 
      country: 'SE', 
      flag: '🇸🇪', 
      name: 'Sweden',
      format: 'XX XXX XX XX',
      maxLength: 9,
      isActive: false
    },
    { 
      code: '+47', 
      country: 'NO', 
      flag: '🇳🇴', 
      name: 'Norway',
      format: 'XXX XX XXX',
      maxLength: 8,
      isActive: false
    },
    { 
      code: '+45', 
      country: 'DK', 
      flag: '🇩🇰', 
      name: 'Denmark',
      format: 'XX XX XX XX',
      maxLength: 8,
      isActive: false
    },
  ];
  
  // Helper function to get all active countries
  export const getActiveCountries = (): CountryCode[] => {
    const allCountries = [
      ...PRIMARY_COUNTRIES,
      ...SECONDARY_COUNTRIES,
      ...INTERNATIONAL_COUNTRIES
    ];
    
    // Filter only active countries
    return allCountries.filter(country => country.isActive !== false);
  };
  
  // Helper function to get countries by region
  export const getCountriesByRegion = (region: 'primary' | 'secondary' | 'international' | 'all'): CountryCode[] => {
    switch (region) {
      case 'primary':
        return PRIMARY_COUNTRIES.filter(c => c.isActive !== false);
      case 'secondary':
        return SECONDARY_COUNTRIES.filter(c => c.isActive !== false);
      case 'international':
        return INTERNATIONAL_COUNTRIES.filter(c => c.isActive !== false);
      case 'all':
      default:
        return getActiveCountries();
    }
  };
  
  // Helper function to find country by code
  export const findCountryByCode = (code: string): CountryCode | undefined => {
    const allCountries = getActiveCountries();
    return allCountries.find(country => country.code === code);
  };
  
  // Helper function to find country by country code (US, GB, etc.)
  export const findCountryByCountryCode = (countryCode: string): CountryCode | undefined => {
    const allCountries = getActiveCountries();
    return allCountries.find(country => country.country === countryCode);
  };
  
  // Format phone number based on country format
  export const formatPhoneNumberForCountry = (phoneNumber: string, countryCode: CountryCode): string => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // For US/Canada specific formatting
    if (countryCode.code === '+1') {
      if (cleaned.length === 0) return '';
      if (cleaned.length <= 3) return `(${cleaned}`;
      if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      if (cleaned.length <= 10) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    
    // For other countries, you can add specific formatting rules
    // For now, return cleaned number with basic spacing
    return cleaned;
  };
  
  // Validate phone number length for country
  export const validatePhoneNumberForCountry = (phoneNumber: string, countryCode: CountryCode): boolean => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const maxLength = countryCode.maxLength || 10; // Default to 10 if not specified
    return cleaned.length === maxLength;
  };
  
  // Default country based on user location or preferences
  export const DEFAULT_COUNTRY = PRIMARY_COUNTRIES[0]; // US by default
  
  // Export configuration for easy toggling
  export const COUNTRY_CONFIG = {
    showInternational: false, // Set to true to show international countries
    defaultRegion: 'primary' as 'primary' | 'secondary' | 'international' | 'all',
    allowManualEntry: false, // Set to true to allow manual country code entry
  };