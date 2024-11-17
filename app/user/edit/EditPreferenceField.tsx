import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";

export default function EditPreferenceField() {
  const { fieldName, currentValue } = useLocalSearchParams<{
    fieldName: string;
    currentValue: any;
  }>();
  const router = useRouter();
  const { updateUserData, userData } = useUserContext();

  const [value, setValue] = useState<any>(currentValue);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue, fieldName]);

  const handleGoBack = async () => {
    if (fieldName && value !== currentValue) {
      const updatedData = { [fieldName]: value };

      try {
        await updateUserData(updatedData);
        console.log("Updated field:", fieldName, value);
      } catch (error) {
        console.error("Error updating preference:", error);
      }
    }
    router.back();
  };

  const renderField = () => {
    switch (fieldName) {
      case "datePreferences":
        const options = ["Men", "Women", "Everyone"];
        return (
          <View style={styles.checkboxContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.checkbox,
                  value?.includes(option) && styles.checkboxSelected,
                ]}
                onPress={() =>
                  setValue((prev: any) =>
                    prev?.includes(option)
                      ? prev.filter((item: any) => item !== option)
                      : [...(prev || []), option]
                  )
                }
              >
                <Text style={styles.checkboxText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case "ethnicities":
        const ethnicities = [
          "American Indian",
          "East Asian",
          "Black/African Descent",
          "Hispanic Latino",
        ];
        return (
          <View style={styles.checkboxContainer}>
            {ethnicities.map((ethnicity) => (
              <TouchableOpacity
                key={ethnicity}
                style={[
                  styles.checkbox,
                  value?.includes(ethnicity) && styles.checkboxSelected,
                ]}
                onPress={() =>
                  setValue((prev: any) =>
                    prev?.includes(ethnicity)
                      ? prev.filter((item: any) => item !== ethnicity)
                      : [...(prev || []), ethnicity]
                  )
                }
              >
                <Text style={styles.checkboxText}>{ethnicity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case "preferredAgeRange":
        return (
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={value?.min ? `${value.min}` : ""}
              placeholder="Min Age"
              keyboardType="numeric"
              onChangeText={(text) => setValue({ ...value, min: Number(text) })}
            />
            <TextInput
              style={styles.input}
              value={value?.max ? `${value.max}` : ""}
              placeholder="Max Age"
              keyboardType="numeric"
              onChangeText={(text) => setValue({ ...value, max: Number(text) })}
            />
          </View>
        );

      case "preferredDistance":
        return (
          <TextInput
            style={styles.input}
            value={String(value)}
            placeholder="Preferred Distance (km)"
            keyboardType="numeric"
            onChangeText={(text) => setValue(Number(text))}
          />
        );

      default:
        return (
          <TextInput
            style={styles.input}
            value={String(value || "")}
            placeholder={`Enter ${fieldName}`}
            onChangeText={(text) => setValue(text)}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Chevron */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit {fieldName}</Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderField()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#111827",
  },
  scrollContainer: {
    flexGrow: 1,
    marginVertical: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 10,
    marginVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
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
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
