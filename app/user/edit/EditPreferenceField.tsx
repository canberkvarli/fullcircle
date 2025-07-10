import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const FIELD_TITLES: Record<string, string> = {
  connectionIntent: "Connection Type",
  connectionPreferences: "Who You're Interested In",
  connectionStyles: "Connection Style",
  preferredAgeRange: "Age Range",
  preferredDistance: "Maximum Distance",
  preferredHeightRange: "Height Range",
  preferredSpiritualPractices: "Spiritual Practices",
  preferredSpiritualDraws: "Spiritual Draws",
  preferredHealingModalities: "Healing Modalities",
};

const FIELD_DESCRIPTIONS: Record<string, string> = {
  connectionIntent: "Choose between dating and friendship connections",
  connectionPreferences: "Who you're interested in connecting with",
  connectionStyles: "How you prefer to connect with others",
  preferredAgeRange: "Your preferred age range for connections",
  preferredDistance: "How far you're willing to connect",
  preferredHeightRange: "Your preferred height range",
  preferredSpiritualPractices: "Spiritual practices you'd like to connect over",
  preferredSpiritualDraws: "Spiritual draws you resonate with",
  preferredHealingModalities: "Healing modalities you're drawn to",
};

function EditPreferenceField() {
  const { fieldName, currentValue } = useLocalSearchParams<{
    fieldName: string;
    currentValue: any;
  }>();
  
  const router = useRouter();
  const { updateUserData, userData, resetPotentialMatches } = useUserContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  
  const [value, setValue] = useState<any>(currentValue || null);
  const [isVisible, setIsVisible] = useState<boolean>(
    userData?.hiddenFields?.[fieldName] === false || false
  );

  // Get current connection intent to show appropriate options
  const connectionIntent = userData?.matchPreferences?.connectionIntent || "romantic";

  useEffect(() => {
    if (currentValue) {
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(currentValue);
      } catch (e) {
        parsedValue = currentValue;
      }
      
      if (fieldName === "preferredAgeRange" && typeof parsedValue === "string") {
        const [min, max] = parsedValue.split(" - ");
        setValue({ min: parseInt(min, 10), max: parseInt(max, 10) });
      } else if (fieldName === "preferredHeightRange" && typeof parsedValue === "string" && parsedValue.includes(" - ")) {
        const [minStr, maxStr] = parsedValue.split(" - ");
        const cleanMin = minStr.replace(/[^0-9.]/g, "");
        const cleanMax = maxStr.replace(/[^0-9.]/g, "");
        setValue({ min: parseFloat(cleanMin), max: parseFloat(cleanMax) });
      } else {
        setValue(parsedValue);
      }
    }
    setIsVisible(userData?.hiddenFields?.[fieldName] === false);
  }, [currentValue, userData, fieldName]);

  const handleSave = async () => {
    let cleanedValue = value;
    
    // Handle connection preferences based on current connection intent
    if (fieldName === "connectionPreferences") {
      if (connectionIntent === "romantic") {
        // Romantic options - same as your ConnectionPreferenceScreen
        const romanticOptions = ["Men", "Women", "Non-Binary", "Everyone"];
        if (Array.isArray(value)) {
          cleanedValue = value.filter(item => romanticOptions.includes(item));
          if (cleanedValue.length === 0) cleanedValue = ["Everyone"];
        } else {
          cleanedValue = ["Everyone"];
        }
      } else {
        // Friendship - automatically set to Everyone (no gender selection needed)
        cleanedValue = ["Everyone"];
      }
    }

    // Handle connection styles based on current connection intent
    if (fieldName === "connectionStyles") {
      const romanticStyles = [
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
      
      const friendshipStyles = [
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

      const validStyles = connectionIntent === "romantic" ? romanticStyles : friendshipStyles;
      if (Array.isArray(value)) {
        cleanedValue = value.filter(item => validStyles.includes(item));
      } else {
        cleanedValue = [];
      }
    }

    const isModified =
      JSON.stringify(cleanedValue) !== JSON.stringify(currentValue) ||
      (userData?.hiddenFields?.[fieldName] !== undefined &&
        isVisible !== (userData?.hiddenFields?.[fieldName] === false));

    if (isModified) {
      try {
        let updatedData: any = {
          matchPreferences: {
            ...userData.matchPreferences,
          },
          hiddenFields: {
            ...userData.hiddenFields,
            [fieldName]: !isVisible,
          },
        };

        // Handle spiritual compatibility fields
        if (fieldName === "preferredSpiritualPractices" || 
            fieldName === "preferredSpiritualDraws" || 
            fieldName === "preferredHealingModalities") {
          const spiritualField = fieldName.replace("preferred", "").toLowerCase();
          const finalField = spiritualField === "spiritualdraws" ? "spiritualDraws" : 
                           spiritualField === "spiritualpractices" ? "practices" :
                           spiritualField === "healingmodalities" ? "healingModalities" : spiritualField;
          
          updatedData.matchPreferences.spiritualCompatibility = {
            ...userData.matchPreferences?.spiritualCompatibility,
            [finalField]: cleanedValue,
          };
        } else {
          // Handle new connection fields
          updatedData.matchPreferences[fieldName] = cleanedValue;
          
          // Also update legacy datePreferences for backward compatibility
          if (fieldName === "connectionPreferences" && connectionIntent === "romantic") {
            updatedData.matchPreferences.datePreferences = cleanedValue;
          }
        }

        console.log(`Saving ${fieldName}:`, cleanedValue);
        await updateUserData(updatedData);
        await resetPotentialMatches();
      } catch (error) {
        console.error("Error updating preferences:", error);
      }
    }
    router.back();
  };

  const handleCheckboxToggle = (
    option: string,
    options: string[],
    allOption: string
  ) => {
    setValue((prev: string[] = []) => {
      if (!Array.isArray(prev)) prev = [];
      
      if (option === allOption) {
        return prev.includes(allOption) ? [] : [allOption];
      }

      if (prev.includes(option)) {
        const updated = prev.filter((item) => item !== option);
        return updated;
      } else {
        const withoutAll = prev.filter(item => item !== allOption);
        const newSelection = [...withoutAll, option];
        
        const individualOptions = options.filter(opt => opt !== allOption);
        const hasAllIndividualOptions = individualOptions.every(opt => newSelection.includes(opt));
        
        if (hasAllIndividualOptions) {
          return [allOption];
        }
        
        return newSelection;
      }
    });
  };

  const CheckboxList = ({
    options,
    selected,
    onToggle,
  }: {
    options: string[];
    selected: string[];
    onToggle: (option: string) => void;
  }) => (
    <View style={styles.checkboxContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.checkbox,
            { backgroundColor: colors.card, borderColor: colors.border },
            selected.includes(option) && { 
              backgroundColor: colors.primary, 
              borderColor: colors.primary 
            },
          ]}
          onPress={() => onToggle(option)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.checkboxText,
              fonts.spiritualBodyFont,
              { color: colors.textDark },
              selected.includes(option) && { color: colors.card },
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderField = () => {
    switch (fieldName) {
      case "connectionIntent": {
        const connectionIntents = ["romantic", "friendship"];
        return (
          <View style={styles.connectionIntentContainer}>
            {connectionIntents.map((intent) => (
              <TouchableOpacity
                key={intent}
                style={[
                  styles.connectionIntentCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  value === intent && { 
                    backgroundColor: colors.primary + '15', 
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setValue(intent)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={intent === "romantic" ? "heart" : "people"} 
                  size={32} 
                  color={value === intent ? colors.primary : colors.textMuted} 
                />
                <Text
                  style={[
                    styles.connectionIntentTitle,
                    fonts.spiritualTitleFont,
                    { color: value === intent ? colors.primary : colors.textDark },
                  ]}
                >
                  {intent === "romantic" ? "Dating" : "Friendship"}
                </Text>
                <Text
                  style={[
                    styles.connectionIntentSubtitle,
                    fonts.spiritualBodyFont,
                    { color: colors.textLight },
                  ]}
                >
                  {intent === "romantic" 
                    ? "Seeking romantic & intimate connections"
                    : "Building meaningful platonic bonds"
                  }
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      }

      case "connectionPreferences": {
        // Only show gender options for romantic connections
        if (connectionIntent === "romantic") {
          const romanticOptions = ["Men", "Women", "Non-Binary", "Everyone"];
          return (
            <CheckboxList
              options={romanticOptions}
              selected={value && value.length > 0 ? value : ["Everyone"]}
              onToggle={(option) =>
                handleCheckboxToggle(option, romanticOptions, "Everyone")
              }
            />
          );
        } else {
          // For friendship, just show a message
          return (
            <View style={styles.friendshipMessage}>
              <Ionicons name="people" size={48} color={colors.primary} />
              <Text style={[styles.friendshipTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                Open to All Connections
              </Text>
              <Text style={[styles.friendshipSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                Friendship connections are open to everyone in the circle, regardless of gender.
              </Text>
            </View>
          );
        }
      }

      case "connectionStyles": {
        const romanticStyles = [
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
        
        const friendshipStyles = [
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

        const currentStyles = connectionIntent === "romantic" ? romanticStyles : friendshipStyles;
        
        return (
          <CheckboxList
            options={currentStyles}
            selected={value && value.length > 0 ? value : []}
            onToggle={(option) => {
              setValue((prev: string[] = []) => {
                if (!Array.isArray(prev)) prev = [];
                return prev.includes(option)
                  ? prev.filter((item) => item !== option)
                  : [...prev, option];
              });
            }}
          />
        );
      }
      
      case "preferredAgeRange": {
        return (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                Min Age: {value?.min || 18}
              </Text>
              <Text style={[styles.sliderLabel, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                Max Age: {value?.max || 70}
              </Text>
            </View>
            <MultiSlider
              values={[value?.min || 18, value?.max || 70]}
              min={18}
              max={70}
              step={1}
              onValuesChange={(val) => setValue({ min: val[0], max: val[1] })}
              trackStyle={{ backgroundColor: colors.border }}
              selectedStyle={{ backgroundColor: colors.primary }}
              markerStyle={{ backgroundColor: colors.primary }}
              pressedMarkerStyle={{ backgroundColor: colors.accent }}
              containerStyle={styles.sliderWrapper}
            />
          </View>
        );
      }
      
      case "preferredDistance": {
        return (
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderLabel, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Maximum Distance: {value || 100} miles
            </Text>
            <MultiSlider
              values={[value || 100]}
              min={1}
              max={100}
              step={1}
              onValuesChange={(val) => setValue(val[0])}
              trackStyle={{ backgroundColor: colors.border }}
              selectedStyle={{ backgroundColor: colors.primary }}
              markerStyle={{ backgroundColor: colors.primary }}
              pressedMarkerStyle={{ backgroundColor: colors.accent }}
              containerStyle={styles.sliderWrapper}
              allowOverlap
            />
          </View>
        );
      }
      
      case "preferredHeightRange": {
        const defaultValue = { min: 3, max: 8 };
        const heightValue = value || defaultValue;
        return (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                Min Height: {Number(heightValue.min).toFixed(1)} ft
              </Text>
              <Text style={[styles.sliderLabel, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                Max Height: {Number(heightValue.max).toFixed(1)} ft
              </Text>
            </View>
            <MultiSlider
              values={[Number(heightValue.min), Number(heightValue.max)]}
              min={3}
              max={8}
              step={0.1}
              onValuesChange={(val) => setValue({ min: val[0], max: val[1] })}
              trackStyle={{ backgroundColor: colors.border }}
              selectedStyle={{ backgroundColor: colors.primary }}
              markerStyle={{ backgroundColor: colors.primary }}
              pressedMarkerStyle={{ backgroundColor: colors.accent }}
              containerStyle={styles.sliderWrapper}
            />
          </View>
        );
      }
      
      case "preferredSpiritualPractices": {
        const spiritualPracticeOptions: string[] = [
          "Meditation",
          "Yoga",
          "Prayer",
          "Journaling",
          "Energy Healing",
          "Crystal Work",
          "Tarot & Oracle",
          "Astrology",
          "Nature Rituals",
          "Sound Healing",
          "Breathwork",
          "Sacred Dance",
          "Plant Medicine",
          "Shamanic Journey",
          "Martial Arts",
          "Fasting",
          "Open to All",
        ];
        return (
          <CheckboxList
            options={spiritualPracticeOptions}
            selected={value && value.length > 0 ? value : ["Open to All"]}
            onToggle={(option) =>
              handleCheckboxToggle(option, spiritualPracticeOptions, "Open to All")
            }
          />
        );
      }
      
      case "preferredSpiritualDraws": {
        const spiritualDrawsOptions: string[] = [
          "Mysticism",
          "Sacred Geometry",
          "Ancient Wisdom",
          "Nature Spirituality",
          "Energy Healing",
          "Consciousness Expansion",
          "Divine Feminine",
          "Sacred Masculine",
          "Shadow Work",
          "Soul Purpose",
          "Cosmic Consciousness",
          "Open to All",
        ];
        return (
          <CheckboxList
            options={spiritualDrawsOptions}
            selected={value && value.length > 0 ? value : ["Open to All"]}
            onToggle={(option) =>
              handleCheckboxToggle(option, spiritualDrawsOptions, "Open to All")
            }
          />
        );
      }
      
      case "preferredHealingModalities": {
        const healingModalityOptions: string[] = [
          "Reiki",
          "Acupuncture",
          "Sound Therapy",
          "Crystal Healing",
          "Aromatherapy",
          "Light Therapy",
          "Massage Therapy",
          "Hypnotherapy",
          "Homeopathy",
          "Herbalism",
          "Plant Medicine",
          "Open to All",
        ];
        return (
          <CheckboxList
            options={healingModalityOptions}
            selected={value && value.length > 0 ? value : ["Open to All"]}
            onToggle={(option) =>
              handleCheckboxToggle(option, healingModalityOptions, "Open to All")
            }
          />
        );
      }
      
      default:
        return (
          <Text style={[fonts.spiritualBodyFont, { color: colors.textMuted, textAlign: 'center' }]}>
            No field configured for this selection
          </Text>
        );
    }
  };

  const styles = createStyles(colors, fonts);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSave} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            {FIELD_TITLES[fieldName] || `Edit ${fieldName}`}
          </Text>
          <Text style={[styles.headerDescription, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            {FIELD_DESCRIPTIONS[fieldName] || "Update your preference"}
          </Text>
        </View>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderField()}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, fonts: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.lg,
  },
  
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
    marginTop: 2, // Align with title
  },
  
  headerContent: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
    letterSpacing: 0.3,
  },
  
  headerDescription: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    lineHeight: Typography.sizes.sm * 1.4,
  },
  
  scrollContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },

  connectionIntentContainer: {
    gap: Spacing.lg,
  },

  connectionIntentCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  connectionIntentTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  connectionIntentSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  friendshipMessage: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: colors.primary + '10',
    borderRadius: BorderRadius.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },

  friendshipTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  friendshipSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.sizes.base * 1.4,
  },
  
  checkboxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  
  checkbox: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  checkboxText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.3,
  },
  
  sliderContainer: {
    paddingVertical: Spacing.xl,
  },
  
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  
  sliderLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
  },
  
  sliderWrapper: {
    alignSelf: 'center',
    width: '90%',
  },
  
  bottomSpacing: {
    height: Spacing['2xl'],
  },
});

export default EditPreferenceField;