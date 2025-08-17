/**
 * Master Spiritual Constants File
 * 
 * This file consolidates all spiritual-related constants in one place
 * to ensure consistency across the app.
 */

// All Spiritual Practices
export const SPIRITUAL_PRACTICES = [
  "Meditation", "Yoga", "Prayer", "Energy Healing", "Crystal Work", "Journaling",
  "Astrology", "Tarot & Oracle", "Breathwork", "Sound Healing", "Nature Rituals",
  "Sacred Dance", "Shamanic Journey", "Plant Medicine", "Martial Arts", "Fasting",
  "Mindfulness", "Chanting", "Contemplation", "Sacred Geometry"
];

// All Healing Modalities
export const HEALING_MODALITIES = [
  "Energy Work", "Acupuncture", "Crystal Therapy", "Aromatherapy", "Massage Therapy",
  "Mind-Body Therapy", "Natural Remedies", "Herbalism", "Plant-Based Wellness",
  "Cupping", "Hypnotherapy", "Light Therapy", "Crystal Healing", "Reiki",
  "Sound Therapy", "Plant Medicine", "Homeopathy", "Chakra Balancing",
  "Reflexology", "Craniosacral", "Ayurveda", "Chakra Healing"
];

// All Spiritual Draws
export const SPIRITUAL_DRAWS = [
  "healing", "awakening", "growth", "connection"
];

// Helper function to check if a practice is valid
export const isValidSpiritualPractice = (practice: string): boolean => {
  return SPIRITUAL_PRACTICES.includes(practice);
};

// Helper function to check if a healing modality is valid
export const isValidHealingModality = (modality: string): boolean => {
  return HEALING_MODALITIES.includes(modality);
};

// Helper function to check if a spiritual draw is valid
export const isValidSpiritualDraw = (draw: string): boolean => {
  return SPIRITUAL_DRAWS.includes(draw);
};

// Helper function to clean spiritual profile data
export const cleanSpiritualProfileData = (data: string[], type: 'practices' | 'healing' | 'draws'): string[] => {
  if (type === 'practices') {
    return data.filter(item => isValidSpiritualPractice(item) || item === "Open to All");
  } else if (type === 'healing') {
    return data.filter(item => isValidHealingModality(item) || item === "Open to All");
  } else if (type === 'draws') {
    return data.filter(item => isValidSpiritualDraw(item) || item === "Open to All");
  }
  return data;
};
