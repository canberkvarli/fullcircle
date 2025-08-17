/**
 * Healing Modalities Constants
 * 
 * This file contains the healing modalities used throughout the app.
 * Updated to include ALL modalities actually being used in user profiles.
 */

// Constants for wellness modalities
const healingModalities = [
    { name: "Energy Work", icon: "energy-healing", iconType: "custom", color: "#E74C3C" },
    { name: "Acupuncture", icon: "acupuncture", iconType: "custom", color: "#F39C12" },
    { name: "Crystal Therapy", icon: "crystal", iconType: "custom", color: "#2ECC71" },
    { name: "Aromatherapy", icon: "aroma", iconType: "custom", color: "#3498DB" },
    { name: "Massage Therapy", icon: "massage", iconType: "custom", color: "#FF5722" },
    { name: "Mind-Body Therapy", icon: "therapy", iconType: "custom", color: "#607D8B" },
    { name: "Natural Remedies", icon: "homeopathy", iconType: "custom", color: "#009688" },
    { name: "Herbalism", icon: "plant", iconType: "custom", color: "#4CAF50" },
    { name: "Plant-Based Wellness", icon: "leaf", iconType: "custom", color: "#8E24AA" },
    { name: "Cupping", icon: "energy-healing", iconType: "custom", color: "#795548" },
    { name: "Hypnotherapy", icon: "therapy", iconType: "custom", color: "#607D8B" },
    { name: "Light Therapy", icon: "light", iconType: "custom", color: "#E91E63" },
    { name: "Crystal Healing", icon: "crystal", iconType: "custom", color: "#2ECC71" },
    { name: "Reiki", icon: "energy-healing", iconType: "custom", color: "#E74C3C" },
    { name: "Sound Therapy", icon: "sound", iconType: "custom", color: "#F1C40F" },
    { name: "Plant Medicine", icon: "mushroom", iconType: "custom", color: "#8E24AA" },
    { name: "Homeopathy", icon: "homeopathy", iconType: "custom", color: "#009688" },
    { name: "Chakra Balancing", icon: "energy-healing", iconType: "custom", color: "#9C27B0" },
    { name: "Reflexology", icon: "massage", iconType: "custom", color: "#FF5722" },
    { name: "Craniosacral", icon: "massage", iconType: "custom", color: "#FF5722" },
    { name: "Ayurveda", icon: "plant", iconType: "custom", color: "#4CAF50" },
    { name: "Chakra Healing", icon: "energy-healing", iconType: "custom", color: "#9C27B0" },
];

// Helper function to get modality color
export const getWellnessModalityColor = (modalityName: string): string => {
  const modality = healingModalities.find(modality => modality.name === modalityName);
  return modality ? modality.color : '#6B7280'; // Default color if not found
};

// For getting multiple modalities' info
export const getHealingModalitiesInfo = (modalityNames: string[]): Array<{name: string, icon: string, iconType: string, color: string}> => {
  return modalityNames.map(name => {
    const modality = healingModalities.find(m => m.name === name);
    return modality || {name, icon: 'help-circle', iconType: 'ionicon', color: '#6B7280'};
  });
};

// Export the full modalities array if needed elsewhere
export { healingModalities };