import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
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
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";
import { spiritualDraws } from "@/constants/spiritualMappings";

const DEFAULT_REGION = {
  latitude: 37.8715,
  longitude: -122.273,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Updated field options - EXPANDED GENDER OPTIONS
const FIELD_OPTIONS = {
  // Gender options for user's own gender (limit 2)
  gender: [
    "Woman",
    "Man", 
    "Non-binary",
    "Genderqueer",
    "Agender",
    "Two-Spirit",
    "Genderfluid",
    "Transgender",
    "Questioning",
  ],
  
  connectionIntent: [
    { id: "romantic", label: "Dating", subtitle: "Seeking romantic & intimate connections", icon: "heart" },
    { id: "friendship", label: "Friendship", subtitle: "Building meaningful platonic bonds", icon: "people" },
    { id: "both", label: "Both", subtitle: "Open to all types of meaningful connections", icon: "infinite" },
  ],

  // Connection preferences (for dating - who you're interested in) - EXPANDED OPTIONS with limit 2
  connectionPreferences: [
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
  ],

  // Connection styles
  connectionStyles: {
    romantic: [
      "Twin Flame Seeker", "Soul Mate Guided", "Tantric Connection", "Heart-Centered",
      "Consciousness Explorer", "Polyamorous Soul", "Monogamous Journey", 
      "Spiritual Partnership", "Sacred Union", "Love Without Labels",
    ],
    friendship: [
      "Practice Partners", "Meditation Buddies", "Adventure Seekers", "Study Circles",
      "Healing Circles", "Creative Collaborators", "Retreat Companions", 
      "Wisdom Sharers", "Community Builders", "Soul Supporters",
    ],
    both: [
      // Combined styles for "both" option
      "Twin Flame Seeker", "Soul Mate Guided", "Heart-Centered", "Love Without Labels",
      "Practice Partners", "Meditation Buddies", "Healing Circles", "Soul Supporters",
      "Consciousness Explorer", "Community Builders", "Creative Collaborators", "Wisdom Sharers",
    ],
  },

  spiritualPractices: [
    "Meditation", "Yoga", "Prayer", "Journaling", "Energy Healing", 
    "Crystal Work", "Tarot & Oracle", "Astrology", "Nature Rituals", 
    "Sound Healing", "Breathwork", "Sacred Dance", "Plant Medicine", 
    "Shamanic Journey", "Martial Arts", "Fasting", "Chanting",
    "Mindfulness", "Contemplation", "Sacred Geometry"
  ],

  healingModalities: [
    "Reiki", "Acupuncture", "Sound Therapy", "Crystal Healing", 
    "Aromatherapy", "Light Therapy", "Massage Therapy", "Hypnotherapy", 
    "Homeopathy", "Herbalism", "Plant Medicine", "Cupping",
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

  // Get current field value
  const getCurrentFieldValue = () => {
    if (fieldName === "fullName") {
      return userData.fullName || `${userData.firstName || ''} ${userData.familyName || ''}`.trim();
    } else if (fieldName === "age") {
      return userData.age;
    } else if (fieldName === "connectionIntent") {
      return userData.matchPreferences?.connectionIntent || "romantic";
    } else if (fieldName === "connectionPreferences") {
      return userData.matchPreferences?.connectionPreferences || [];
    } else if (fieldName === "connectionStyles") {
      return userData.matchPreferences?.connectionStyles || [];
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
  const isHidden = (userData.hiddenFields as any)?.[fieldName as string] === true;

  // State variables
  const [selectedItems, setSelectedItems] = useState(
    Array.isArray(currentFieldValue) ? currentFieldValue : []
  );
  const [selectedSingleItem, setSelectedSingleItem] = useState(
    typeof currentFieldValue === 'string' ? currentFieldValue : ''
  );
  const [isVisible, setIsVisible] = useState(!isHidden);
  
  const [firstName, setFirstName] = useState(() => {
    if (fieldName === "fullName") {
      const fullName = userData.fullName || '';
      return userData.firstName || fullName.split(' ')[0] || '';
    }
    return userData.firstName || '';
  });
  
  const [familyName, setFamilyName] = useState(() => {
    if (fieldName === "fullName") {
      const fullName = userData.fullName || '';
      const nameParts = fullName.split(' ');
      return userData.familyName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
    }
    return userData.familyName || '';
  });
  
  const [age, setAge] = useState(userData.age?.toString() || '');
  const [selectedHeight, setSelectedHeight] = useState(userData.height || 5.8);

  // Location state
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [regionName, setRegionName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  const fieldTitleMap: Record<string, string> = {
    gender: "Gender",
    connectionIntent: "Connection Type",
    connectionPreferences: "Interested In",
    connectionStyles: "Connection Style",
    fullName: "Name", 
    age: "Age",
    height: "Height",
    location: "Location",
    spiritualDraws: "Your Path",
    spiritualPractices: "Your Practices", 
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
          places[0].district ||
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
    // GENDER VALIDATION - Must select at least one gender
    if (fieldName === "gender" && selectedItems.length === 0) {
      Alert.alert("Gender Required", "Please select at least one gender identity.");
      return;
    }

    let updateData: any = {};
    
    if (fieldName === "fullName") {
      if (!firstName.trim()) {
        Alert.alert("Error", "First name is required.");
        return;
      }
      const fullName = familyName.trim() ? `${firstName.trim()} ${familyName.trim()}` : firstName.trim();
      updateData = {
        firstName: firstName.trim(),
        familyName: familyName.trim(),
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
    } else if (fieldName === "connectionIntent") {
      updateData = {
        matchPreferences: {
          ...userData.matchPreferences,
          connectionIntent: selectedSingleItem,
          // Reset preferences when changing intent
          connectionPreferences: (selectedSingleItem === "romantic" || selectedSingleItem === "both") ? [] : ["Everyone"],
          connectionStyles: [],
        },
      };
    } else if (fieldName === "connectionPreferences") {
      updateData = {
        matchPreferences: {
          ...userData.matchPreferences,
          connectionPreferences: selectedItems,
          // Also update legacy datePreferences for backward compatibility
          datePreferences: selectedItems,
        },
      };
    } else if (fieldName === "connectionStyles") {
      updateData = {
        matchPreferences: {
          ...userData.matchPreferences,
          connectionStyles: selectedItems,
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
    } else if (fieldName === "gender") {
      updateData = { gender: selectedItems };
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

  // UPDATED: Handle item toggle with 2-person limit for gender and connection preferences
  const handleItemToggle = (item: string) => {
    const isLimitedField = fieldName === "gender" || fieldName === "connectionPreferences";
    const maxSelections = 2;

    if (isLimitedField) {
      setSelectedItems(prev => {
        if (item === "Everyone") {
          // If selecting "Everyone", clear all others and just select Everyone
          return prev.includes("Everyone") ? [] : ["Everyone"];
        }
        
        // If "Everyone" is currently selected and we're selecting something else, remove "Everyone"
        let newSelection = prev.includes("Everyone") ? [] : prev;
        
        if (newSelection.includes(item)) {
          // Remove the item
          return newSelection.filter(i => i !== item);
        } else {
          // Add the item, but limit to maxSelections (excluding "Everyone")
          const otherItems = newSelection.filter(i => i !== "Everyone");
          if (otherItems.length >= maxSelections) {
            // Replace the first item with the new one
            return [otherItems[1], item];
          } else {
            return [...newSelection, item];
          }
        }
      });
    } else {
      // Normal toggle logic for other fields
      setSelectedItems(prev => 
        prev.includes(item) 
          ? prev.filter(i => i !== item)
          : [...prev, item]
      );
    }
  };

  const handleSingleSelection = (item: string) => {
    setSelectedSingleItem(item);
  };

  // Get intent colors for dynamic theming
  const getIntentColors = (intent: string) => {
    if (intent === "romantic") {
      return {
        primary: '#EC4899',
        secondary: '#FDF2F8',
        accent: '#BE185D',
      };
    } else if (intent === "friendship") {
      return {
        primary: '#10B981',
        secondary: '#F0FDF4',
        accent: '#047857',
      };
    } else if (intent === "both") {
      return {
        primary: '#8B5CF6',
        secondary: '#F5F3FF',
        accent: '#7C3AED',
      };
    } else {
      return {
        primary: '#0891B2',
        secondary: '#F0F9FF',
        accent: '#0E7490',
      };
    }
  };

  // Custom Selection Component
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
        <Ionicons name="checkmark" size={size * 0.6} color="white" />
      )}
    </View>
  );

  // Render connection intent selector
  const renderConnectionIntent = () => {
    return (
      <View style={styles.connectionIntentContainer}>
        {FIELD_OPTIONS.connectionIntent.map((intent) => {
          const isSelected = selectedSingleItem === intent.id;
          const intentColors = getIntentColors(intent.id);
          
          return (
            <TouchableOpacity
              key={intent.id}
              style={[
                styles.modernOption,
                {
                  borderColor: isSelected ? intentColors.primary : colors.border,
                  backgroundColor: isSelected ? intentColors.secondary : colors.card
                }
              ]}
              onPress={() => handleSingleSelection(intent.id)}
              activeOpacity={0.7}
            >
              <View style={styles.intentHeader}>
                <Ionicons name={intent.icon as any} size={24} color={intentColors.primary} />
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, { color: colors.textDark }]}>
                    {intent.label}
                  </Text>
                </View>
              </View>
              <Text style={[styles.optionSubtitle, { color: colors.textLight }]}>
                {intent.subtitle}
              </Text>
              <SelectionBubble isSelected={isSelected} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // UPDATED: Render gender or connection preferences with improved UI
  const renderLimitedGenderOptions = (options: string[], isConnectionPrefs: boolean = false) => {
    const maxSelections = 2;
    const selectedCount = selectedItems.filter(item => item !== "Everyone").length;
    const hasEveryone = selectedItems.includes("Everyone");
    
    return (
      <View style={styles.connectionPreferencesContainer}>
        {/* Improved Selection Status */}
        {fieldName === "gender" && (
          <View style={[styles.genderSelectionStatus, { 
            backgroundColor: selectedCount > 0 ? colors.primary + '10' : colors.textMuted + '10',
            borderColor: selectedCount > 0 ? colors.primary + '30' : colors.textMuted + '30'
          }]}>
            <Ionicons 
              name={selectedCount > 0 ? "checkmark-circle" : "information-circle"} 
              size={18} 
              color={selectedCount > 0 ? colors.primary : colors.textMuted} 
            />
            <Text style={[styles.statusText, { 
              color: selectedCount > 0 ? colors.primary : colors.textMuted 
            }]}>
              {selectedCount === 0 
                ? "Select at least 1 gender (up to 2)" 
                : `${selectedCount}/2 selected`
              }
            </Text>
          </View>
        )}

        {isConnectionPrefs && (
          <View style={[styles.selectionCounter, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.counterText, { color: colors.primary }]}>
              {hasEveryone 
                ? "All gender identities selected"
                : `${selectedCount}/${maxSelections} selected`
              }
            </Text>
            {selectedCount === maxSelections && !hasEveryone && (
              <Text style={[styles.limitText, { color: colors.textMuted }]}>
                Maximum reached • Selecting another will replace the first
              </Text>
            )}
          </View>
        )}

        <View style={styles.genderGrid}>
          {options.map((option) => {
            const isSelected = selectedItems.includes(option);
            const isEveryone = option === "Everyone";
            const isDisabled = !isSelected && hasEveryone && !isEveryone;
            
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderPill,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                    opacity: isDisabled ? 0.5 : 1
                  }
                ]}
                onPress={() => !isDisabled && handleItemToggle(option)}
                activeOpacity={isDisabled ? 1 : 0.7}
                disabled={isDisabled}
              >
                <Text style={[styles.genderPillText, { 
                  color: isSelected ? colors.primary : colors.textDark,
                  fontWeight: isSelected ? Typography.weights.semibold : Typography.weights.medium
                }]}>
                  {option}
                </Text>
                {isSelected && (
                  <View style={styles.pillSelectedIndicator}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                  </View>
                )}
                {isEveryone && isConnectionPrefs && (
                  <Text style={[styles.everyoneSubtext, { color: colors.textMuted }]}>
                    Open to all
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Render connection styles
  const renderConnectionStyles = () => {
    const currentIntent = userData.matchPreferences?.connectionIntent || "romantic";
    const styles_options = FIELD_OPTIONS.connectionStyles[currentIntent as keyof typeof FIELD_OPTIONS.connectionStyles] || FIELD_OPTIONS.connectionStyles.romantic;
    
    return (
      <View style={styles.spiritualGrid}>
        {styles_options.map((style) => {
          const isSelected = selectedItems.includes(style);
          
          return (
            <TouchableOpacity
              key={style}
              style={[
                styles.spiritualBubble,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                }
              ]}
              onPress={() => handleItemToggle(style)}
              activeOpacity={0.7}
            >
              <Text style={[styles.spiritualBubbleText, { color: colors.textDark }]}>
                {style}
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

  const renderSpiritualDraws = () => {
    return (
      <View style={styles.spiritualDrawsContainer}>
        {spiritualDraws.map((draw) => {
          const isSelected = selectedItems.includes(draw.value);
          
          return (
            <TouchableOpacity
              key={draw.value}
              style={[
                styles.modernOption,
                {
                  borderColor: isSelected ? draw.color : colors.border,
                  backgroundColor: isSelected ? draw.color + '15' : colors.card,
                }
              ]}
              onPress={() => handleItemToggle(draw.value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: colors.textDark }]}>
                  {draw.label}
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>
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

  // Clean spiritual practices/modalities design
  const renderPracticesOrModalities = (items: string[]) => {
    return (
      <View style={styles.spiritualGrid}>
        {items.map((item) => {
          const isSelected = selectedItems.includes(item);
          
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.spiritualBubble,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                }
              ]}
              onPress={() => handleItemToggle(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.spiritualBubbleText, { color: colors.textDark }]}>
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

  const renderContent = () => {
    if (fieldName === "fullName") {
      return (
        <View style={styles.nameContainer}>
          <TextInput
            style={[styles.nameInput, { borderColor: colors.border, backgroundColor: colors.card, color: colors.textDark }]}
            placeholder="First name"
            placeholderTextColor={colors.textMuted}
            value={firstName}
            onChangeText={setFirstName}
            maxLength={18}
          />
          
          <TextInput
            style={[styles.nameInput, { borderColor: colors.border, backgroundColor: colors.card, color: colors.textDark }]}
            placeholder="Last name (optional)"
            placeholderTextColor={colors.textMuted}
            value={familyName}
            onChangeText={setFamilyName}
            maxLength={18}
          />
          <Text style={[styles.helpText, { color: colors.textMuted }]}>
            Last name is optional and only shared with matches.
          </Text>
        </View>
      );
    }

    if (fieldName === "age") {
      return (
        <View style={styles.ageContainer}>
            <Text style={[styles.ageInput, {color: colors.textDark }]}>{age}</Text>
            <Text style={[styles.helpText, { color: colors.textMuted }]}>
              Please contact the Circle team to change your age. This requires you
              to upload your ID.
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
          <Text style={[styles.regionName, { color: colors.textDark }]}>
            {regionName}
          </Text>
          {loading ? (
            <OuroborosLoader 
                size={50}
                duration={3000}
                fillColor="#F5E6D3"
                strokeColor="#7B6B5C"
                strokeWidth={1.5}
                loop={true}
              />
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
              <Marker coordinate={mapRegion} />
            </MapView>
          )}
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: colors.primary }]}
            onPress={initializeLocation}
          >
            <Text style={styles.locationButtonText}>
              Get Current Location
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (fieldName === "connectionIntent") {
      return renderConnectionIntent();
    }

    if (fieldName === "connectionPreferences") {
      return renderLimitedGenderOptions(FIELD_OPTIONS.connectionPreferences, true);
    }

    if (fieldName === "connectionStyles") {
      return renderConnectionStyles();
    }

    if (fieldName === "spiritualDraws") {
      return renderSpiritualDraws();
    }

    if (fieldName === "spiritualPractices") {
      return renderPracticesOrModalities(FIELD_OPTIONS.spiritualPractices);
    }

    if (fieldName === "healingModalities") {
      return renderPracticesOrModalities(FIELD_OPTIONS.healingModalities);
    }

    if (fieldName === "gender") {
      return renderLimitedGenderOptions(FIELD_OPTIONS.gender, false);
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
        
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>
          {fieldTitleMap[fieldName as string] || fieldName}
        </Text>
        {fieldName !== "age" ? (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>
              Save
            </Text>
          </TouchableOpacity>
        ): (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={[styles.saveButtonText, { color: colors.primary }]}>
            Done
          </Text>
        </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollContainer}>
        {renderContent()}
      </ScrollView>

      {/* Visibility Toggle - only show for certain fields */}
      {fieldName !== "fullName" && fieldName !== "connectionIntent" && (
        <View style={[styles.visibilityContainer, { borderTopColor: colors.border }]}>
          <View style={styles.visibilityContent}>
            <Ionicons 
              name={isVisible ? "eye" : "eye-off"} 
              size={20} 
              color={colors.textMuted} 
            />
            <Text style={[styles.visibilityText, { color: colors.textDark }]}>
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
            <View 
              style={[
                styles.visibilityToggleThumb,
                { 
                  backgroundColor: 'white',
                  left: isVisible ? 26 : 2
                }
              ]} 
            />
          </TouchableOpacity>
        </View>
      )}
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
    paddingVertical: Spacing.sm,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
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

  // Connection Intent Styles
  connectionIntentContainer: {
    gap: Spacing.md,
  },

  intentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  
  // Connection Preferences Styles
  connectionPreferencesContainer: {
    gap: Spacing.md,
  },

  selectionCounter: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },

  counterText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },

  limitText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // IMPROVED Gender Selection Status
  genderSelectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    justifyContent: 'center',
  },

  statusText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
  },

  // IMPROVED Gender Grid - Reduced gaps
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm, // Reduced from default spacing
    justifyContent: 'space-between',
  },

  genderPill: {
    minWidth: '47%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  genderPillText: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },

  pillSelectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },

  everyoneSubtext: {
    fontSize: Typography.sizes.xs,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  helpText: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    lineHeight: Typography.sizes.sm * 1.3,
    flex: 1,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
  
  // Name Input Styles
  nameContainer: {
    gap: Spacing.md,
  },
  
  nameInput: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    fontSize: Typography.sizes.base,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default EditFieldScreen;