// Constants for personal practices
// Updated to include ALL practices actually being used in user profiles
const personalPractices = [
  { name: "Meditation", category: "mindfulness", icon: "meditation", iconType: "custom" },
  { name: "Yoga", category: "movement", icon: "yoga", iconType: "custom" },
  { name: "Prayer", category: "mindfulness", icon: "prayer", iconType: "custom" },
  { name: "Energy Healing", category: "wellness", icon: "energy-healing", iconType: "custom" },
  { name: "Crystal Work", category: "wellness", icon: "crystal", iconType: "custom" },
  { name: "Journaling", category: "reflection", icon: "journal", iconType: "custom" },
  { name: "Astrology", category: "insight", icon: "aries", iconType: "custom" },
  { name: "Tarot & Oracle", category: "insight", icon: "tarot", iconType: "custom" },
  { name: "Breathwork", category: "mindfulness", icon: "breathwork", iconType: "custom" },
  { name: "Sound Healing", category: "wellness", icon: "gong", iconType: "custom" },
  { name: "Nature Rituals", category: "earth", icon: "hiking", iconType: "custom" },
  { name: "Sacred Dance", category: "movement", icon: "dance", iconType: "custom" },
  { name: "Shamanic Journey", category: "reflection", icon: "shaman", iconType: "custom" },
  { name: "Plant Medicine", category: "wellness", icon: "leaf", iconType: "custom" },
  { name: "Martial Arts", category: "movement", icon: "martial-arts", iconType: "custom" },
  { name: "Fasting", category: "wellness", icon: "fasting", iconType: "custom" },
  { name: "Mindfulness", category: "mindfulness", icon: "meditation", iconType: "custom" },
  { name: "Chanting", category: "mindfulness", icon: "sound", iconType: "custom" },
  { name: "Contemplation", category: "reflection", icon: "prayer", iconType: "custom" },
  { name: "Sacred Geometry", category: "insight", icon: "infinity", iconType: "custom" },
  { name: "Reflection", category: "mindfulness", icon: "prayer", iconType: "custom" },
  { name: "Holistic Wellness", category: "wellness", icon: "energy-healing", iconType: "custom" },
  { name: "Card Reading", category: "insight", icon: "tarot", iconType: "custom" },
  { name: "Nature Connection", category: "earth", icon: "hiking", iconType: "custom" },
  { name: "Sound Therapy", category: "wellness", icon: "gong", iconType: "custom" },
  { name: "Movement", category: "movement", icon: "dance", iconType: "custom" },
  { name: "Plant Wisdom", category: "wellness", icon: "leaf", iconType: "custom" },
  { name: "Inner Journeying", category: "reflection", icon: "shaman", iconType: "custom" },
];

// Enhanced color palette with wellness vibes
const categoryColors = {
  mindfulness: '#8B5CF6', // Purple - meditation, breathwork, reflection
  movement: '#F59E0B', // Amber - yoga, movement, martial arts
  reflection: '#8B4513', // Saddle Brown - journaling, inner journeying
  wellness: '#10B981', // Emerald - holistic wellness, sound therapy, crystals, plant wisdom
  insight: '#6366F1', // Indigo - card reading, astrology
  earth: '#22C55E', // Green - nature connection
};

// Create a mapping function to convert names
export const getPersonalPracticeCategory = (practiceName: string): string => {
  const practice = personalPractices.find(practice => practice.name === practiceName);
  return practice ? practice.category : '';
};

// For getting multiple practices' info
export const getPersonalPracticesInfo = (practiceNames: string[]): Array<{name: string, category: string, icon: string, iconType: string}> => {
  return practiceNames.map(name => {
    const practice = personalPractices.find(p => p.name === name);
    return practice || {name, category: '', icon: 'help-circle', iconType: 'ionicon'};
  });
};

// Export the full practices array and category colors if needed elsewhere
export { personalPractices, categoryColors };