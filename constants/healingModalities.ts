/**
 * Healing Modalities Constants
 * 
 * This file contains the healing modalities used throughout the app.
 * We've updated the names to be more professional/wellness-focused while
 * maintaining backward compatibility for existing user data.
 * 
 * Legacy names are automatically mapped to new names to ensure
 * data consistency across the app.
 */

// Constants for wellness modalities (previously healingModalities)
const healingModalities = [
    { name: "Energy Work", icon: "energy-healing", iconType: "custom", color: "#E74C3C" },  // Changed from Reiki
    { name: "Acupuncture", icon: "acupuncture", iconType: "custom", color: "#F39C12" },
    { name: "Sound Therapy", icon: "sound", iconType: "custom", color: "#F1C40F" },  // Changed from Sound Therapy
    { name: "Crystal Therapy", icon: "crystal", iconType: "custom", color: "#2ECC71" },  // Changed from Crystal Healing
    { name: "Aromatherapy", icon: "aroma", iconType: "custom", color: "#3498DB" },
    { name: "Light Therapy", icon: "light", iconType: "custom", color: "#E91E63" },
    { name: "Massage Therapy", icon: "massage", iconType: "custom", color: "#FF5722" },
    { name: "Mind-Body Therapy", icon: "therapy", iconType: "custom", color: "#607D8B" },  // Changed from Hypnotherapy
    { name: "Natural Remedies", icon: "homeopathy", iconType: "custom", color: "#009688" },  // Changed from Homeopathy
    { name: "Herbalism", icon: "plant", iconType: "custom", color: "#4CAF50" },
    { name: "Plant Medicine", icon: "mushroom", iconType: "custom", color: "#8E24AA" },  // Changed from Plant Medicine
];

// Legacy name mappings for backward compatibility
const legacyNameMappings: { [key: string]: string } = {
  "Reiki": "Energy Work",
  "Crystal Healing": "Crystal Therapy", 
  "Hypnotherapy": "Mind-Body Therapy",
  "Homeopathy": "Natural Remedies",
  "Plant Medicine": "Plant-Based Wellness",
  "Sound Healing": "Sound Therapy",
};

// Helper function to get modality color
export const getWellnessModalityColor = (modalityName: string): string => {
  // First check if it's a legacy name and map it
  const mappedName = legacyNameMappings[modalityName] || modalityName;
  const modality = healingModalities.find(modality => modality.name === mappedName);
  return modality ? modality.color : '#6B7280'; // Default color if not found
};

// For getting multiple modalities' info
export const getHealingModalitiesInfo = (modalityNames: string[]): Array<{name: string, icon: string, iconType: string, color: string}> => {
  return modalityNames.map(name => {
    // Map legacy names to new names
    const mappedName = legacyNameMappings[name] || name;
    const modality = healingModalities.find(m => m.name === mappedName);
    return modality || {name: mappedName, icon: 'help-circle', iconType: 'ionicon', color: '#6B7280'};
  });
};

// Function to normalize legacy names to new names
export const normalizeModalityName = (modalityName: string): string => {
  return legacyNameMappings[modalityName] || modalityName;
};

// Function to get all possible names (new + legacy) for search/filtering
export const getAllModalityNames = (): string[] => {
  const newNames = healingModalities.map(m => m.name);
  const legacyNames = Object.keys(legacyNameMappings);
  return [...newNames, ...legacyNames];
};

// Export the full modalities array if needed elsewhere
export { healingModalities };