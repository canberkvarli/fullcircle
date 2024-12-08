import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

const FIELD_TITLES: Record<string, string> = {
  datePreferences: "I'm interested in",
  location: "My neighborhood",
  preferredAgeRange: "Age Range",
  preferredDistance: "Maximum distance",
  preferredEthnicities: "Ethnicity",
  desiredRelationship: "Relationship Type",
};

export default function EditPreferenceField() {
  const { fieldName, currentValue } = useLocalSearchParams<{
    fieldName: string;
    currentValue: any;
  }>();
  const router = useRouter();
  const { updateUserData, userData } = useUserContext();
  const [value, setValue] = useState<any>(currentValue || null);
  const [isVisible, setIsVisible] = useState<boolean>(
    userData?.hiddenFields?.[fieldName] === false || false
  );

  useEffect(() => {
    if (currentValue) {
      const parsedValue =
        typeof currentValue === "string"
          ? JSON.parse(currentValue)
          : currentValue;
      setValue(parsedValue);
    }
    setIsVisible(userData?.hiddenFields?.[fieldName] === false);
  }, [currentValue, userData, fieldName]);

  const handleSave = async () => {
    const isModified =
      value !== currentValue ||
      (userData?.hiddenFields?.[fieldName] !== undefined &&
        isVisible !== (userData?.hiddenFields?.[fieldName] === false));

    if (isModified) {
      try {
        const updatedData: any = {
          matchPreferences: {
            ...userData.matchPreferences,
            [fieldName]: value || [],
          },
          hiddenFields: {
            ...userData.hiddenFields,
            [fieldName]: !isVisible,
          },
        };

        await updateUserData(updatedData);
        console.log("Preference updated successfully:", updatedData);
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
      const isAllOption = option === allOption;

      if (isAllOption) {
        return [allOption];
      }

      const updated = prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option];

      if (
        options
          .filter((opt) => opt !== allOption)
          .every((opt) => updated.includes(opt))
      ) {
        return [allOption];
      }

      if (updated.includes(allOption)) {
        return updated.filter((item) => item !== allOption);
      }

      return updated;
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
            selected.includes(option) && styles.checkboxSelected,
          ]}
          onPress={() => onToggle(option)}
        >
          <Text
            style={[
              styles.checkboxText,
              selected.includes(option) && styles.checkboxTextSelected,
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
      case "datePreferences":
        const dateOptions = ["Men", "Women", "Non-Binary", "Everyone"];
        return (
          <CheckboxList
            options={dateOptions}
            selected={value || []}
            onToggle={(option) =>
              handleCheckboxToggle(option, dateOptions, "Everyone")
            }
          />
        );

      case "preferredAgeRange":
        return (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Min Age: {value?.min || 18}</Text>
            <MultiSlider
              values={[value?.min || 18, value?.max || 100]}
              min={18}
              max={100}
              step={1}
              onValuesChange={(val) => setValue({ min: val[0], max: val[1] })}
              trackStyle={styles.sliderTrack}
              selectedStyle={styles.sliderSelectedTrack}
              markerStyle={styles.sliderMarker}
              pressedMarkerStyle={styles.sliderMarkerPressed}
              containerStyle={styles.sliderWrapper}
            />
            <Text style={styles.sliderLabel}>Max Age: {value?.max || 100}</Text>
          </View>
        );

      case "preferredDistance":
        return (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              Max Distance: {value || 100} mil
            </Text>
            <MultiSlider
              values={[value || 100]}
              min={1}
              max={100}
              step={1}
              onValuesChange={(val) => setValue(val[0])}
              trackStyle={styles.sliderTrack}
              selectedStyle={styles.sliderSelectedTrack}
              markerStyle={styles.sliderMarker}
              pressedMarkerStyle={styles.sliderMarkerPressed}
              containerStyle={styles.sliderWrapper}
              allowOverlap
            />
          </View>
        );

      case "preferredEthnicities":
        const ethnicityOptions = [
          "American Indian",
          "East Asian",
          "Black/African Descent",
          "Hispanic Latino",
          "Middle Eastern",
          "Native Hawaiian",
          "Pacific Islander",
          "South Asian",
          "White/Caucasian",
          "Open to All",
        ];
        return (
          <CheckboxList
            options={ethnicityOptions}
            selected={value || []}
            onToggle={(option) =>
              handleCheckboxToggle(option, ethnicityOptions, "Open to All")
            }
          />
        );

      case "desiredRelationship":
        const relationshipOptions = ["Monogamy", "Non-Monogamy", "Open to All"];
        return (
          <CheckboxList
            options={relationshipOptions}
            selected={value || []}
            onToggle={(option) =>
              handleCheckboxToggle(option, relationshipOptions, "Open to All")
            }
          />
        );

      default:
        return <Text>No field configured for this selection</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSave}>
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {FIELD_TITLES[fieldName] || `Edit ${fieldName}`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderField()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
  },
  scrollContainer: {
    flexGrow: 1,
    marginVertical: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxText: {
    color: "#111827",
    fontSize: 14,
  },
  checkboxTextSelected: {
    color: "#FFFFFF",
  },
  sliderContainer: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
    marginBottom: 10,
  },
  sliderWrapper: {
    marginLeft: 15,
    marginVertical: 10,
  },
  sliderTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D1D5DB",
  },
  sliderSelectedTrack: {
    backgroundColor: "#4CAF50",
  },
  sliderMarker: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    backgroundColor: "#000000",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  sliderMarkerPressed: {
    backgroundColor: "#FF5722",
  },
});
