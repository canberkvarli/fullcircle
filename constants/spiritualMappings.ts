const spiritualDraws = [
  { 
    label: "Healing & Restoration", 
    value: "healing", 
    description: "Energy work, trauma healing, emotional restoration",
    color: "#228B22" 
  },
  { 
    label: "Personal Growth", 
    value: "growth", 
    description: "Self-discovery, consciousness expansion, evolution",
    color: "#FF6B35" 
  },
  { 
    label: "Sacred Connection", 
    value: "connection", 
    description: "Community, relationships, divine communion",
    color: "#4169E1" 
  },
  { 
    label: "Spiritual Awakening", 
    value: "awakening", 
    description: "Enlightenment, transcendence, higher consciousness",
    color: "#8A2BE2" 
  },
];

// Create a mapping function to convert values to labels
export const getSpiritualDrawLabel = (value: string): string => {
  const draw = spiritualDraws.find(draw => draw.value === value);
  return draw ? draw.label : value; // fallback to value if not found
};

// For multiple values, convert all at once
export const getSpiritualDrawLabels = (values: string[]): string[] => {
  return values.map(value => getSpiritualDrawLabel(value));
};

// Export the full spiritual draws array if needed elsewhere
export { spiritualDraws };

// Example usage in your PotentialMatch component:
// Instead of:
//   content: user.spiritualProfile.draws.slice(0, 3).join(", ")
// Use:
//   content: getSpiritualDrawLabels(user.spiritualProfile.draws).slice(0, 3).join(", ")

// And for pills:
// Instead of:
//   pillsData: user.spiritualProfile.draws
// Use:
//   pillsData: getSpiritualDrawLabels(user.spiritualProfile.draws)