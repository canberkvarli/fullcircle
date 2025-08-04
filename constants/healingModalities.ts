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
    { name: "Plant-Based Wellness", icon: "mushroom", iconType: "custom", color: "#8E24AA" },  // Changed from Plant Medicine
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