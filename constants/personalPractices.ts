// Constants for personal practices (previously spiritualPractices)
const personalPractices = [
    { name: "Meditation", category: "mindfulness", icon: "meditation", iconType: "custom" },
    { name: "Yoga", category: "movement", icon: "yoga", iconType: "custom" },
    { name: "Reflection", category: "mindfulness", icon: "prayer", iconType: "custom" }, // Changed from Prayer
    { name: "Journaling", category: "reflection", icon: "journal", iconType: "custom" },
    { name: "Holistic Wellness", category: "wellness", icon: "energy-healing", iconType: "custom" }, // Changed from Energy Healing
    { name: "Crystal Work", category: "wellness", icon: "crystal", iconType: "custom" },
    { name: "Card Reading", category: "insight", icon: "tarot", iconType: "custom" }, // Changed from Tarot & Oracle
    { name: "Astrology", category: "insight", icon: "aries", iconType: "custom" },
    { name: "Nature Connection", category: "earth", icon: "hiking", iconType: "custom" }, // Changed from Nature Rituals
    { name: "Sound Therapy", category: "wellness", icon: "gong", iconType: "custom" }, // Changed from Sound Healing
    { name: "Breathwork", category: "mindfulness", icon: "breathwork", iconType: "custom" },
    { name: "Movement", category: "movement", icon: "dance", iconType: "custom" }, // Changed from Ecstatic Dance
    { name: "Plant Wisdom", category: "wellness", icon: "leaf", iconType: "custom" }, // Changed from Plant Medicine
    { name: "Inner Journeying", category: "reflection", icon: "shaman", iconType: "custom" }, // Changed from Shamanic Journey
    { name: "Martial Arts", category: "movement", icon: "martial-arts", iconType: "custom" },
    { name: "Fasting", category: "wellness", icon: "fasting", iconType: "custom" },
  ];
  
  // Enhanced color palette with better wellness vibes
  const categoryColors = {
    mindfulness: '#8B5CF6', // Purple - for meditation, breathwork, reflection
    movement: '#F59E0B', // Amber - for yoga, movement, martial arts
    reflection: '#8B4513', // Saddle Brown - for journaling, inner journeying
    wellness: '#10B981', // Emerald - for holistic wellness, sound therapy, crystals, plant wisdom
    insight: '#6366F1', // Indigo - for card reading, astrology
    earth: '#22C55E', // Green - for nature connection
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