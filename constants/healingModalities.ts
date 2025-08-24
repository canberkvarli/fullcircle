/**
 * Healing Modalities Constants
 * 
 * This file contains the healing modalities used throughout the app.
 * Based on the original 10 healing modalities from the previous version.
 */

// Constants for wellness modalities - clean, organized list of 10 modalities
const healingModalities = [
  { name: "Reiki", icon: "energy-healing", iconType: "custom", color: "#E74C3C" },
  { name: "Acupuncture", icon: "acupuncture", iconType: "custom", color: "#F39C12" },
  { name: "Sound Therapy", icon: "sound", iconType: "custom", color: "#F1C40F" },
  { name: "Crystal Healing", icon: "crystal", iconType: "custom", color: "#2ECC71" },
  { name: "Aromatherapy", icon: "aroma", iconType: "custom", color: "#3498DB" },
  { name: "Light Therapy", icon: "light", iconType: "custom", color: "#E91E63" },
  { name: "Massage Therapy", icon: "massage", iconType: "custom", color: "#FF5722" },
  { name: "Hypnotherapy", icon: "therapy", iconType: "custom", color: "#607D8B" },
  { name: "Homeopathy", icon: "homeopathy", iconType: "custom", color: "#009688" },
  { name: "Herbalism", icon: "plant", iconType: "custom", color: "#4CAF50" },
  { name: "Plant Medicine", icon: "mushroom", iconType: "custom", color: "#8E24AA" },
];

// Helper function to normalize modality names (handles legacy names and variations)
export const normalizeModalityName = (modalityName: string): string => {
  if (!modalityName) return "";
  
  // Normalize common variations and legacy names
  const normalized = modalityName.trim();
  
  // Handle any legacy naming conventions here if needed
  // For now, just return the normalized name as-is
  return normalized;
};

// Helper function to safely get healing modalities from user data
export const getSafeHealingModalities = (userData: any): string[] => {
  try {
    const modalities = userData?.spiritualProfile?.healingModalities;
    if (Array.isArray(modalities)) {
      return modalities.map(normalizeModalityName).filter(Boolean);
    }
    return [];
  } catch (error) {
    console.warn('Error getting healing modalities:', error);
    return [];
  }
};

// Helper function to get modality color
export const getWellnessModalityColor = (modalityName: string): string => {
  const modality = healingModalities.find(modality => modality.name === modalityName);
  return modality ? modality.color : '#6B7280'; // Default color if not found
};

// For getting multiple modalities' info
export const getHealingModalitiesInfo = (modalityNames: string[]): Array<{name: string, icon: string, iconType: string, color: string}> => {
  if (!Array.isArray(modalityNames)) return [];
  
  return modalityNames.map(name => {
    const modality = healingModalities.find(m => m.name === name);
    return modality || {name, icon: 'help-circle', iconType: 'ionicon', color: '#6B7280'};
  });
};

// Export the full modalities array if needed elsewhere
export { healingModalities };