/**
 * Connection Options Constants
 * 
 * This file contains all connection-related options used throughout the app.
 * Centralized to avoid duplication and ensure consistency.
 */

// Connection Intent Options
export const connectionIntents = [
  { 
    id: "romantic", 
    label: "Dating", 
    subtitle: "Seeking romantic & intimate connections",
    icon: "hand-heart",
    iconType: "custom"
  },
  { 
    id: "friendship", 
    label: "Friendship", 
    subtitle: "Building meaningful platonic bonds",
    icon: "friendship",
    iconType: "custom"
  },
  { 
    id: "both", 
    label: "Both", 
    subtitle: "Open to all types of meaningful connections",
    icon: "infinity",
    iconType: "custom"
  },
];

// Romantic connection styles
export const romanticStyles = [
  "Twin Flame Seeker",
  "Soul Mate Guided", 
  "Tantric Connection",
  "Heart-Centered",
  "Consciousness Explorer",
  "Polyamorous Soul",
  "Monogamous Journey",
  "Spiritual Partnership",
  "Sacred Union",
  "Love Without Labels",
];

// Friendship connection styles
export const friendshipStyles = [
  "Practice Partners",
  "Meditation Buddies",
  "Adventure Seekers",
  "Study Circles",
  "Healing Circles",
  "Creative Collaborators",
  "Retreat Companions",
  "Wisdom Sharers",
  "Community Builders",
  "Soul Supporters",
];

// Combined connection styles (for "both" option)
export const combinedStyles = [
  // Romantic styles
  "Twin Flame Seeker",
  "Soul Mate Guided", 
  "Tantric Connection",
  "Heart-Centered",
  "Polyamorous Soul",
  "Monogamous Journey",
  "Love Without Labels",
  // Friendship styles
  "Practice Partners",
  "Meditation Buddies",
  "Adventure Seekers",
  "Study Circles",
  "Healing Circles",
  "Creative Collaborators",
  "Retreat Companions",
  "Wisdom Sharers",
  "Community Builders",
  "Soul Supporters",
];

// Connection styles mapping by intent
export const connectionStylesByIntent = {
  romantic: romanticStyles,
  friendship: friendshipStyles,
  both: combinedStyles,
};

// Gender options for user's own gender (limit 2)
export const genderOptions = [
  "Woman",
  "Man", 
  "Non-binary",
  "Genderqueer",
  "Agender",
  "Two-Spirit",
  "Genderfluid",
  "Transgender",
  "Questioning",
];

// Connection preferences (for dating - who you're interested in) - limit 2
export const connectionPreferences = [
  "Woman",
  "Man", 
  "Non-binary",
  "Genderqueer",
  "Agender",
  "Two-Spirit",
  "Genderfluid",
  "Transgender",
  "Questioning",
  "Everyone", // Special option that selects all
];
