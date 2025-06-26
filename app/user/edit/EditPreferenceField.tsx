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
  datePreferences: "Looking For",
  preferredAgeRange: "Age Range",
  preferredDistance: "Maximum Distance",
  preferredHeightRange: "Height Range",
  preferredSpiritualPractices: "Spiritual Practices",
  preferredSpiritualDraws: "Spiritual Draws",
  preferredHealingModalities: "Healing Modalities",
};

const FIELD_DESCRIPTIONS: Record<string, string> = {
  datePreferences: "Who you're interested in connecting with",
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
    // Clean the value based on field type
    let cleanedValue = value;
    
    if (fieldName === "datePreferences") {
      // ONLY the exact options from your DatePreferenceScreen - NO OLD GENDER OPTIONS AT ALL
      const mainOptions = ["Men", "Women"]; // from mainOptions.id
      const otherOptionsWithId = ["Non-Binary"]; // from otherOptions with id  
      const otherStringOptions = [
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
      ]; // from otherOptions that are strings
      const allEnergyOption = ["Everyone"]; // from allEnergyOption.id
      
      // Combine exactly as they appear in your onboarding
      const validDatePreferenceOptions = [
        ...mainOptions,
        ...otherOptionsWithId,
        ...otherStringOptions,
        ...allEnergyOption
      ];
      
      if (Array.isArray(value)) {
        cleanedValue = value.filter(item => validDatePreferenceOptions.includes(item));
        // Only default to "Everyone" if truly empty after filtering
        if (cleanedValue.length === 0) cleanedValue = ["Everyone"];
      } else {
        cleanedValue = ["Everyone"];
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

        // Handle spiritual compatibility fields differently
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
          updatedData.matchPreferences[fieldName] = cleanedValue;
        }

        console.log("Saving datePreferences:", cleanedValue); // Debug log
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
      // If clicking "Everyone", just toggle it
      return prev.includes(allOption) ? [] : [allOption];
    }

    // For any other option
    if (prev.includes(option)) {
      // Remove this option
      const updated = prev.filter((item) => item !== option);
      return updated;
    } else {
      // Add this option
      // Remove "Everyone" if it exists, then add the new option
      const withoutEveryone = prev.filter(item => item !== allOption);
      const newSelection = [...withoutEveryone, option];
      
      // Check if we now have all individual options (excluding the "all" option)
      const individualOptions = options.filter(opt => opt !== allOption);
      const hasAllIndividualOptions = individualOptions.every(opt => newSelection.includes(opt));
      
      // If we have all individual options, replace with "Everyone"
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
      case "datePreferences": {
        const mainOptions = ["Men", "Women"];
        const otherOptionsWithId = ["Non-Binary"];
        const otherStringOptions = [
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
        const allEnergyOption = ["Everyone"];
        
        const datePreferenceOptions = [
          ...mainOptions,
          ...otherOptionsWithId,
          ...otherStringOptions,
          ...allEnergyOption
        ];
        
        return (
          <CheckboxList
            options={datePreferenceOptions}
            selected={value && value.length > 0 ? value : ["Everyone"]}
            onToggle={(option) =>
              handleCheckboxToggle(option, datePreferenceOptions, "Everyone")
            }
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
          "Hatha/Vinyasa Yoga",
          "Kundalini Yoga", 
          "Yin Yoga",
          "Tantric Practices",
          "Mindfulness Meditation",
          "Breathwork",
          "Reiki (Energy Work)",
          "Chakra Healing",
          "Qi Gong",
          "Ayurveda",
          "Astrology (Western)",
          "Astrology (Vedic)", 
          "Chinese Astrology",
          "Human Design & Numerology",
          "Tarot/Oracle Cards",
          "Cacao Ceremony",
          "Ayahuasca & Plant Medicine",
          "Sound Healing",
          "Ecstatic Dance",
          "Crystal Healing",
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
          "Energy Healing",
          "Sound Therapy",
          "Crystal Healing",
          "Aromatherapy",
          "Massage Therapy",
          "Acupuncture",
          "Herbal Medicine",
          "Nutrition Therapy",
          "Emotional Freedom Technique",
          "Breathwork",
          "Movement Therapy",
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
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  
  sliderTrack: {
    height: 6,
    borderRadius: 3,
  },
  
  sliderSelectedTrack: {
    borderRadius: 3,
  },
  
  sliderMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.card,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  sliderMarkerPressed: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  
  bottomSpacing: {
    height: Spacing['2xl'],
  },
});

export default EditPreferenceField;;