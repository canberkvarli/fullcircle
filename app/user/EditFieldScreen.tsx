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

// Updated field options - cleaner spiritual design
const FIELD_OPTIONS = {
  gender: [
    "Woman",
    "Man", 
    "Non-binary",
    "Genderqueer",
    "Agender",
    "Two-Spirit",
    "Genderfluid",
  ],
  
  ConnectionPreferences: {
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

  // Clean spiritual practices without emojis
  spiritualPractices: [
    "Meditation", "Yoga", "Prayer", "Journaling", "Energy Healing", 
    "Crystal Work", "Tarot & Oracle", "Astrology", "Nature Rituals", 
    "Sound Healing", "Breathwork", "Sacred Dance", "Plant Medicine", 
    "Shamanic Journey", "Martial Arts", "Fasting", "Chanting",
    "Mindfulness", "Contemplation", "Sacred Geometry"
  ],

  // Clean healing modalities without emojis
  healingModalities: [
    "Reiki", "Acupuncture", "Sound Therapy", "Crystal Healing", 
    "Aromatherapy", "Light Therapy", "Massage Therapy", "Hypnotherapy", 
    "Homeopathy", "Herbalism", "Ayahuasca", "Kambo", "Cupping",
    "Reflexology", "Craniosacral", "Chakra Balancing"
  ],
};

function EditFieldScreen() {
  const router = useRouter();
  const { updateUserData, userData } = useUserContext();
  const { fieldName } = useLocalSearchParams();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  // Get current field value - FIXED
  const getCurrentFieldValue = () => {
    if (fieldName === "fullName") {
      return userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    } else if (fieldName === "age") {
      return userData.age;
    } else if (fieldName === "ConnectionPreferences") {
      return userData.matchPreferences?.ConnectionPreferences || [];
    } else if (fieldName === "spiritualDraws") {
      return userData.spiritualProfile?.draws || [];
    } else if (fieldName === "spiritualPractices") {
      // Check both direct field and nested structure
      return userData.spiritualProfile?.practices || [];
    } else if (fieldName === "healingModalities") {
      return userData.spiritualProfile?.healingModalities || [];
    }
    return (userData as any)[fieldName as string] || null;
  };

  const currentFieldValue = getCurrentFieldValue();
  const isHidden = (userData.hiddenFields as any)?.[fieldName as string] === false;

  // State variables - FIXED initialization
  const [selectedItems, setSelectedItems] = useState<string[]>(
    Array.isArray(currentFieldValue) ? currentFieldValue : []
  );
  const [selectedSingleItem, setSelectedSingleItem] = useState<string>(
    typeof currentFieldValue === 'string' ? currentFieldValue : ''
  );
  const [isVisible, setIsVisible] = useState(!isHidden);
  
  // FIXED: Proper initialization of name fields
  const [firstName, setFirstName] = useState(() => {
    if (fieldName === "fullName") {
      const fullName = userData.fullName || '';
      return userData.firstName || fullName.split(' ')[0] || '';
    }
    return userData.firstName || '';
  });
  
  const [lastName, setLastName] = useState(() => {
    if (fieldName === "fullName") {
      const fullName = userData.fullName || '';
      const nameParts = fullName.split(' ');
      return userData.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
    }
    return userData.lastName || '';
  });
  
  // FIXED: Age initialization
  const [age, setAge] = useState(userData.age?.toString() || '');
  const [selectedHeight, setSelectedHeight] = useState(userData.height || 5.8);
  const [customInput, setCustomInput] = useState('');

  // Location state
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [regionName, setRegionName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  const fieldTitleMap: Record<string, string> = {
    gender: "Gender",
    ConnectionPreferences: "I'm Looking For",
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
    } else if (fieldName === "age") {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        Alert.alert("Error", "Please enter a valid age between 18-100.");
        return;
      }
      updateData = { age: ageNum };
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
    } else if (fieldName === "ConnectionPreferences") {
      updateData = {
        matchPreferences: {
          ...userData.matchPreferences,
          ConnectionPreferences: selectedItems,
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
      // Update both direct field and nested structure for compatibility
      updateData = {
        spiritualPractices: selectedItems,
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

    // FIXED: Add hidden field setting with correct logic
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

  // Custom Selection Component (replaces checkboxes)
  const SelectionBubble = ({ isSelected, size = 20 }: { isSelected: boolean; size?: number }) => (
    <View style={[
      styles.selectionBubble,
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        borderColor: isSelected ? colors.primary : colors.border,
        backgroundColor: isSelected ? colors.primary : 'transparent'
      }
    ]}>
      {isSelected && (
        <Ionicons name="checkmark" size={size * 0.6} color="#FFFFFF" />
      )}
    </View>
  );

  const renderConnectionPreferences = () => {
    const { mainOptions, otherOptions, allEnergyOption } = FIELD_OPTIONS.ConnectionPreferences;
    
    return (
      <View style={styles.ConnectionPreferencesContainer}>
        {/* All Energies Option */}
        <TouchableOpacity
          style={[
            styles.modernOption,
            { borderColor: colors.border, backgroundColor: colors.card },
            selectedItems.includes("Everyone") && { 
              borderColor: colors.primary, 
              backgroundColor: colors.primary + '10' 
            }
          ]}
          onPress={() => handleItemToggle("Everyone")}
          activeOpacity={0.7}
        >
          <View style={styles.optionContent}>
            <Text style={[styles.optionLabel, fonts.buttonFont, { color: colors.textDark }]}>
              {allEnergyOption.label}
            </Text>
            <Text style={[styles.optionSubtitle, fonts.captionFont, { color: colors.textMuted }]}>
              {allEnergyOption.subtitle}
            </Text>
          </View>
          <SelectionBubble isSelected={selectedItems.includes("Everyone")} />
        </TouchableOpacity>

        {/* Main Options */}
        {mainOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.modernOption,
              { borderColor: colors.border, backgroundColor: colors.card },
              selectedItems.includes(option.id) && { 
                borderColor: colors.primary, 
                backgroundColor: colors.primary + '10' 
              }
            ]}
            onPress={() => handleItemToggle(option.id)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionLabel, fonts.buttonFont, { color: colors.textDark }]}>
                {option.label}
              </Text>
              <Text style={[styles.optionSubtitle, fonts.captionFont, { color: colors.textMuted }]}>
                {option.subtitle}
              </Text>
            </View>
            <SelectionBubble isSelected={selectedItems.includes(option.id)} />
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
                  styles.spiritualPill,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
                ]}
                onPress={() => handleItemToggle(optionId)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.pillText,
                  fonts.captionFont,
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
                styles.modernOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { borderColor: draw.color, backgroundColor: draw.color + '10' }
              ]}
              onPress={() => handleItemToggle(draw.value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, fonts.buttonFont, { color: colors.textDark }]}>
                  {draw.label}
                </Text>
                <Text style={[styles.optionSubtitle, fonts.captionFont, { color: colors.textMuted }]}>
                  {draw.description}
                </Text>
              </View>
              <SelectionBubble isSelected={isSelected} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // IMPROVED: Clean spiritual practices/modalities design
  const renderPracticesOrModalities = (items: string[], fieldType: string) => {
    return (
      <View style={styles.spiritualGrid}>
        {items.map((item) => {
          const isSelected = selectedItems.includes(item);
          
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.spiritualBubble,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { 
                  borderColor: colors.primary, 
                  backgroundColor: colors.primary + '15',
                  transform: [{ scale: 1.02 }]
                }
              ]}
              onPress={() => handleItemToggle(item)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.spiritualBubbleText, 
                fonts.captionFont,
                { color: colors.textDark },
                isSelected && { color: colors.primary, fontWeight: Typography.weights.semibold }
              ]}>
                {item}
              </Text>
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                </View>
              )}
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
                styles.modernOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => handleItemToggle(option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, fonts.buttonFont, { color: colors.textDark }]}>
                {option}
              </Text>
              <SelectionBubble isSelected={isSelected} />
            </TouchableOpacity>
          );
        })}
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

    if (fieldName === "age") {
      return (
        <View style={styles.ageContainer}>
          <TextInput
            style={[styles.ageInput, { borderColor: colors.border, color: colors.textDark }]}
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            maxLength={2}
            placeholderTextColor={colors.textMuted}
          />
          <Text style={[styles.helpText, fonts.captionFont, { color: colors.textMuted }]}>
            Your age helps us find compatible matches.
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

    if (fieldName === "ConnectionPreferences") {
      return renderConnectionPreferences();
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

      {/* FIXED: Visibility Toggle */}
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
          style={[
            styles.visibilityToggle, 
            { backgroundColor: isVisible ? colors.primary : colors.textMuted + '40' }
          ]}
          activeOpacity={0.7}
        >
          <View style={[
            styles.visibilityToggleThumb, 
            { 
              backgroundColor: colors.card,
              transform: [{ translateX: isVisible ? 22 : 2 }]
            }
          ]} />
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
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // Modern Selection Bubble
  selectionBubble: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modern Option Style
  modernOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  
  optionContent: {
    flex: 1,
  },
  
  optionLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  
  optionSubtitle: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
  },
  
  // Date Preferences Styles
  ConnectionPreferencesContainer: {
    gap: Spacing.md,
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
  
  spiritualPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  
  pillText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  
  // Spiritual Draws Styles
  spiritualDrawsContainer: {
    gap: Spacing.md,
  },
  
  // Clean Spiritual Grid
  spiritualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  
  spiritualBubble: {
    minWidth: '47%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 50,
  },
  
  spiritualBubbleText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  
  // Basic Options Styles
  basicOptionsContainer: {
    gap: Spacing.sm,
  },
  
  customInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    fontSize: Typography.sizes.base,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  
  // Name Input Styles
  nameContainer: {
    gap: Spacing.md,
  },
  
  nameInput: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    fontSize: Typography.sizes.base,
  },
  
  // Age Input Styles
  ageContainer: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  
  ageInput: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    fontSize: Typography.sizes.xl,
    textAlign: 'center',
    width: 120,
    fontWeight: Typography.weights.bold,
  },
  
  helpText: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    textAlign: 'center',
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
    borderRadius: BorderRadius.xl,
  },
  
  locationButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },

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
    position: 'relative',
  },
  
  visibilityToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default EditFieldScreen;