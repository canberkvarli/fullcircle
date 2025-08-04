const spiritualDraws = [
  { 
    label: "Wellness & Balance", 
    value: "healing", 
    description: "Personal restoration, emotional wellbeing, finding harmony",
    color: "#228B22" 
  },
  { 
    label: "Self-Discovery", 
    value: "growth", 
    description: "Personal evolution, expanding awareness, meaningful growth",
    color: "#FF6B35" 
  },
  { 
    label: "Authentic Connection", 
    value: "connection", 
    description: "Community, meaningful relationships, deeper bonds",
    color: "#4169E1" 
  },
  { 
    label: "Inner Wisdom", 
    value: "awakening", 
    description: "Finding clarity, deeper insights, expanded perspective",
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