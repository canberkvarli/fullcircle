import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
  useColorScheme,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Checkbox from "expo-checkbox";
import { useUserContext } from "@/context/UserContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { RulerPicker } from "react-native-ruler-picker";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const DEFAULT_REGION = {
  latitude: 37.8715,
  longitude: -122.273,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Updated field options based on your onboarding screens
const FIELD_OPTIONS = {
  gender: [
    "Woman",
    "Man", 
    "Non-binary",
    "Genderqueer",
    "Agender",
    "Two-Spirit",
    "Genderfluid",
    "Other",
  ],
  
  datePreferences: {
    mainOptions: [
      { id: "Men", label: "Masculine Energy", subtitle: "Drawn to masculine souls" },
      { id: "Women", label: "Feminine Energy", subtitle: "Attracted to feminine essence" },
    ],
    otherOptions: [
      { id: "Non-Binary", label: "Non-Binary Souls", subtitle: "Connected to fluid expressions" },
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
    ],
    allEnergyOption: { id: "Everyone", label: "All Energies", subtitle: "Open to every beautiful soul" }
  },

  spiritualDraws: [
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
  ],

  spiritualPractices: [
    { name: "Meditation", icon: "🧘" },
    { name: "Yoga", icon: "🕉️" },
    { name: "Prayer", icon: "🙏" },
    { name: "Journaling", icon: "📝" },
    { name: "Energy Healing", icon: "✨" },
    { name: "Crystal Work", icon: "💎" },
    { name: "Tarot & Oracle", icon: "🔮" },
    { name: "Astrology", icon: "⭐" },
    { name: "Nature Rituals", icon: "🌿" },
    { name: "Sound Healing", icon: "🎵" },
    { name: "Breathwork", icon: "🌬️" },
    { name: "Sacred Dance", icon: "💃" },
    { name: "Plant Medicine", icon: "🍄" },
    { name: "Shamanic Journey", icon: "🥁" },
    { name: "Martial Arts", icon: "🥋" },
    { name: "Fasting", icon: "🌙" },
  ],

  healingModalities: [
    { name: "Reiki", icon: "👐", color: "#E74C3C" },
    { name: "Acupuncture", icon: "📍", color: "#F39C12" },
    { name: "Sound Therapy", icon: "🎼", color: "#F1C40F" },
    { name: "Crystal Healing", icon: "💎", color: "#2ECC71" },
    { name: "Aromatherapy", icon: "🌸", color: "#3498DB" },
    { name: "Light Therapy", icon: "✨", color: "#E91E63" },
    { name: "Massage Therapy", icon: "💆", color: "#FF5722" },
    { name: "Hypnotherapy", icon: "🌀", color: "#607D8B" },
    { name: "Homeopathy", icon: "💧", color: "#009688" },
    { name: "Herbalism", icon: "🌿", color: "#4CAF50" },
    { name: "Ayahuasca", icon: "🍄", color: "#8E24AA" },
    { name: "Kambo", icon: "🐸", color: "#43A047" },
  ],
};

function EditFieldScreen() {
  const router = useRouter();
  const { updateUserData, userData } = useUserContext();
  const { fieldName } = useLocalSearchParams();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  // Get current field value
  const getCurrentFieldValue = () => {
    if (fieldName === "datePreferences") {
      return userData.matchPreferences?.datePreferences || [];
    } else if (fieldName === "spiritualDraws") {
      return userData.spiritualProfile?.draws || [];
    } else if (fieldName === "spiritualPractices") {
      return userData.spiritualProfile?.practices || [];
    } else if (fieldName === "healingModalities") {
      return userData.spiritualProfile?.healingModalities || [];
    }
    return (userData as any)[fieldName as string] || null;
  };

  const currentFieldValue = getCurrentFieldValue();
  const isHidden = (userData.hiddenFields as any)?.[fieldName as string] === false;

  // State variables
  const [selectedItems, setSelectedItems] = useState<string[]>(
    Array.isArray(currentFieldValue) ? currentFieldValue : []
  );
  const [selectedSingleItem, setSelectedSingleItem] = useState<string>(
    typeof currentFieldValue === 'string' ? currentFieldValue : ''
  );
  const [isVisible, setIsVisible] = useState(!isHidden);
  const [firstName, setFirstName] = useState(userData.firstName || '');
  const [lastName, setLastName] = useState(userData.lastName || '');
  const [selectedHeight, setSelectedHeight] = useState(userData.height || 5.8);
  const [customInput, setCustomInput] = useState('');

  // Location state
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [regionName, setRegionName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  const fieldTitleMap: Record<string, string> = {
    gender: "Gender",
    datePreferences: "I'm Looking For",
    fullName: "Name", 
    age: "Age",
    height: "Height",
    location: "Location",
    spiritualDraws: "Spiritual Draws",
    spiritualPractices: "Spiritual Practices", 
    healingModalities: "Healing Modalities",
  };

  useEffect(() => {
    if (fieldName === "location") {
      initializeLocation();
    }
  }, [fieldName]);

  const initializeLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        setMapRegion(DEFAULT_REGION);
        setLoading(false);
        return;
      }
      
      let loc = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(newRegion);
      await updateRegionName(newRegion);
      setLoading(false);
    } catch (error) {
      setMapRegion(DEFAULT_REGION);
      setLoading(false);
    }
  };

  const updateRegionName = async (region: { latitude: number; longitude: number }) => {
    try {
      const places = await Location.reverseGeocodeAsync(region);
      if (places.length > 0) {
        setRegionName(
          places[0].city ||
          places[0].region ||
          places[0].country ||
          "Unknown Location"
        );
      } else {
        setRegionName("Unknown Location");
      }
    } catch (error) {
      setRegionName("Error fetching location");
    }
  };

  const handleSave = async () => {
    let updateData: any = {};
    
    if (fieldName === "fullName") {
      if (!firstName.trim()) {
        Alert.alert("Error", "First name is required.");
        return;
      }
      const fullName = lastName.trim() ? `${firstName.trim()} ${lastName.trim()}` : firstName.trim();
      updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
      };
    } else if (fieldName === "height") {
      updateData = { height: selectedHeight };
    } else if (fieldName === "location") {
      updateData = {
        location: {
          city: regionName,
          latitude: mapRegion.latitude,
          longitude: mapRegion.longitude,
        },
      };
    } else if (fieldName === "datePreferences") {
      updateData = {
        matchPreferences: {
          ...userData.matchPreferences,
          datePreferences: selectedItems,
        },
      };
    } else if (fieldName === "spiritualDraws") {
      updateData = {
        spiritualProfile: {
          ...userData.spiritualProfile,
          draws: selectedItems,
        },
      };
    } else if (fieldName === "spiritualPractices") {
      updateData = {
        spiritualProfile: {
          ...userData.spiritualProfile,
          practices: selectedItems,
        },
      };
    } else if (fieldName === "healingModalities") {
      updateData = {
        spiritualProfile: {
          ...userData.spiritualProfile,
          healingModalities: selectedItems,
        },
      };
    } else {
      updateData = { [fieldName as string]: selectedItems.length ? selectedItems : selectedSingleItem };
    }

    // Add hidden field setting
    updateData.hiddenFields = {
      ...userData.hiddenFields,
      [fieldName as string]: !isVisible,
    };

    await updateUserData(updateData);
    router.back();
  };

  const handleItemToggle = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const renderDatePreferences = () => {
    const { mainOptions, otherOptions, allEnergyOption } = FIELD_OPTIONS.datePreferences;
    
    return (
      <View style={styles.datePreferencesContainer}>
        {/* All Energies Option */}
        <TouchableOpacity
          style={[
            styles.mainOption,
            selectedItems.includes("Everyone") && styles.selectedMainOption
          ]}
          onPress={() => handleItemToggle("Everyone")}
        >
          <View style={styles.mainOptionContent}>
            <Text style={[styles.mainOptionLabel, { color: colors.textDark }]}>
              {allEnergyOption.label}
            </Text>
            <Text style={[styles.mainOptionSubtitle, { color: colors.textMuted }]}>
              {allEnergyOption.subtitle}
            </Text>
          </View>
          <Checkbox value={selectedItems.includes("Everyone")} />
        </TouchableOpacity>

        {/* Main Options */}
        {mainOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.mainOption,
              selectedItems.includes(option.id) && styles.selectedMainOption
            ]}
            onPress={() => handleItemToggle(option.id)}
          >
            <View style={styles.mainOptionContent}>
              <Text style={[styles.mainOptionLabel, { color: colors.textDark }]}>
                {option.label}
              </Text>
              <Text style={[styles.mainOptionSubtitle, { color: colors.textMuted }]}>
                {option.subtitle}
              </Text>
            </View>
            <Checkbox value={selectedItems.includes(option.id)} />
          </TouchableOpacity>
        ))}

        {/* Other Options */}
        <Text style={[styles.sectionLabel, fonts.buttonFont, { color: colors.textDark }]}>
          Connection Types
        </Text>
        <View style={styles.pillContainer}>
          {otherOptions.map((option) => {
            const optionId = typeof option === 'string' ? option : option.id;
            const isSelected = selectedItems.includes(optionId);
            
            return (
              <TouchableOpacity
                key={optionId}
                style={[
                  styles.pill,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
                ]}
                onPress={() => handleItemToggle(optionId)}
              >
                <Text style={[
                  styles.pillText,
                  { color: colors.textMuted },
                  isSelected && { color: colors.primary }
                ]}>
                  {typeof option === 'string' ? option : option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSpiritualDraws = () => {
    return (
      <View style={styles.spiritualDrawsContainer}>
        {FIELD_OPTIONS.spiritualDraws.map((draw) => {
          const isSelected = selectedItems.includes(draw.value);
          
          return (
            <TouchableOpacity
              key={draw.value}
              style={[
                styles.drawCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { borderColor: draw.color, backgroundColor: draw.color + '15' }
              ]}
              onPress={() => handleItemToggle(draw.value)}
            >
              <View style={styles.drawContent}>
                <Text style={[styles.drawLabel, fonts.buttonFont, { color: colors.textDark }]}>
                  {draw.label}
                </Text>
                <Text style={[styles.drawDescription, fonts.captionFont, { color: colors.textMuted }]}>
                  {draw.description}
                </Text>
              </View>
              <Checkbox value={isSelected} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderPracticesOrModalities = (items: any[], fieldType: string) => {
    return (
      <View style={styles.practicesContainer}>
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.name);
          
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.practiceCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
              ]}
              onPress={() => handleItemToggle(item.name)}
            >
              <Text style={styles.practiceIcon}>{item.icon}</Text>
              <Text style={[styles.practiceName, fonts.buttonFont, { color: colors.textDark }]}>
                {item.name}
              </Text>
              <Checkbox value={isSelected} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderBasicOptions = (options: string[]) => {
    return (
      <View style={styles.basicOptionsContainer}>
        {options.map((option) => {
          const isSelected = selectedItems.includes(option);
          
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.basicOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
              ]}
              onPress={() => handleItemToggle(option)}
            >
              <Text style={[styles.basicOptionText, fonts.buttonFont, { color: colors.textDark }]}>
                {option}
              </Text>
              <Checkbox value={isSelected} />
            </TouchableOpacity>
          );
        })}
        
        {/* Custom input for "Other" */}
        {fieldName === "gender" && selectedItems.includes("Other") && (
          <TextInput
            style={[styles.customInput, { borderColor: colors.border, color: colors.textDark }]}
            placeholder="Please specify..."
            value={customInput}
            onChangeText={setCustomInput}
            placeholderTextColor={colors.textMuted}
          />
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (fieldName === "fullName") {
      return (
        <View style={styles.nameContainer}>
          <TextInput
            style={[styles.nameInput, { borderColor: colors.border, color: colors.textDark }]}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={[styles.nameInput, { borderColor: colors.border, color: colors.textDark }]}
            placeholder="Last Name (Optional)"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor={colors.textMuted}
          />
          <Text style={[styles.helpText, fonts.captionFont, { color: colors.textMuted }]}>
            Last name is optional and only shared with matches.
          </Text>
        </View>
      );
    }

    if (fieldName === "height") {
      return (
        <View style={styles.heightContainer}>
          <RulerPicker
            min={3}
            max={8}
            step={0.1}
            unit="ft"
            fractionDigits={1}
            initialValue={selectedHeight}
            onValueChange={(value) => setSelectedHeight(Number(value))}
          />
        </View>
      );
    }

    if (fieldName === "location") {
      return (
        <View style={styles.locationContainer}>
          <Text style={[styles.regionName, fonts.buttonFont, { color: colors.textDark }]}>
            {regionName}
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <MapView
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={(newRegion) => {
                setMapRegion(newRegion);
                updateRegionName(newRegion);
              }}
              showsUserLocation
              showsMyLocationButton
            >
              <Marker
                coordinate={{
                  latitude: mapRegion.latitude,
                  longitude: mapRegion.longitude,
                }}
                title="You are here"
              />
            </MapView>
          )}
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: colors.primary }]}
            onPress={initializeLocation}
          >
            <Text style={[styles.locationButtonText, fonts.buttonFont]}>
              Get Current Location
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (fieldName === "datePreferences") {
      return renderDatePreferences();
    }

    if (fieldName === "spiritualDraws") {
      return renderSpiritualDraws();
    }

    if (fieldName === "spiritualPractices") {
      return renderPracticesOrModalities(FIELD_OPTIONS.spiritualPractices, 'practices');
    }

    if (fieldName === "healingModalities") {
      return renderPracticesOrModalities(FIELD_OPTIONS.healingModalities, 'modalities');
    }

    if (fieldName === "gender") {
      return renderBasicOptions(FIELD_OPTIONS.gender);
    }

    return null;
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
          {fieldTitleMap[fieldName as string] || fieldName}
        </Text>
        
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      {/* Visibility Toggle */}
      <View style={[styles.visibilityContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.visibilityContent}>
          <Ionicons 
            name={isVisible ? "eye" : "eye-off"} 
            size={20} 
            color={isVisible ? colors.primary : colors.textMuted} 
          />
          <Text style={[styles.visibilityText, fonts.buttonFont, { color: colors.textDark }]}>
            {isVisible ? "Visible" : "Hidden"} on profile
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => setIsVisible(!isVisible)}
          style={[styles.visibilityToggle, { backgroundColor: isVisible ? colors.primary : colors.textMuted }]}
        >
          <View style={[styles.visibilityToggleThumb, { backgroundColor: colors.card }]} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 0 : Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  
  backButton: {
    padding: Spacing.sm,
  },
  
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    flex: 1,
    textAlign: 'center',
  },
  
  saveButton: {
    padding: Spacing.sm,
  },
  
  saveButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  
  scrollContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  
  // Date Preferences Styles
  datePreferencesContainer: {
    gap: Spacing.md,
  },
  
  mainOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  
  selectedMainOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  
  mainOptionContent: {
    flex: 1,
  },
  
  mainOptionLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  
  mainOptionSubtitle: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
  },
  
  sectionLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  
  pillText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  
  // Spiritual Draws Styles
  spiritualDrawsContainer: {
    gap: Spacing.md,
  },
  
  drawCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  
  drawContent: {
    flex: 1,
  },
  
  drawLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  
  drawDescription: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.3,
  },
  
  // Practices/Modalities Styles
  practicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  
  practiceCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  practiceIcon: {
    fontSize: 24,
  },
  
  practiceName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  
  // Basic Options Styles
  basicOptionsContainer: {
    gap: Spacing.sm,
  },
  
  basicOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  
  basicOptionText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  
  customInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.sizes.base,
    marginTop: Spacing.sm,
  },
  
  // Name Input Styles
  nameContainer: {
    gap: Spacing.md,
  },
  
  nameInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.sizes.base,
  },
  
  helpText: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
  },
  
  // Height Styles
  heightContainer: {
    paddingVertical: Spacing.xl,
  },
  
  // Location Styles
  locationContainer: {
    gap: Spacing.md,
  },
  
  regionName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  
  map: {
    height: 300,
    borderRadius: BorderRadius.md,
  },
  
  locationButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  
  // Visibility Toggle Styles
  visibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  
  visibilityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  visibilityText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  
  visibilityToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  
  visibilityToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
});

export default EditFieldScreen;