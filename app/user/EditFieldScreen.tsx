import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useUserContext } from "@/context/UserContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";

const options = {
  gender: [
    { title: "Man", subtitle: "Radiate your masculine energy" },
    { title: "Woman", subtitle: "Embrace your feminine essence" },
    { title: "Non-binary" },
    { title: "Genderqueer" },
    { title: "Agender" },
    { title: "Two-Spirit", subtitle: "Honor your sacred duality" },
    {
      title: "Other",
      subtitle: "Describe your unique path",
      input: true,
    },
  ],
  sexualOrientation: ["Heterosexual", "Homosexual", "Bisexual"],
  datePreference: ["Men", "Women", "Everyone"],
  childrenPreference: ["Yes", "No", "Maybe"],
};

function EditFieldScreen() {
  const router = useRouter();
  const { updateUserData, userData } = useUserContext();
  const { fieldName } = useLocalSearchParams();

  const currentFieldValue = (userData as any)[fieldName as string] || null;
  const isHidden =
    (userData.hiddenFields as any)?.[fieldName as string] === false;

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(isHidden);
  const [customGender, setCustomGender] = useState("");

  useEffect(() => {
    if (fieldName === "gender") {
      // Set selectedOption and customGender from userData
      if (
        options["gender"].some((option) => option.title === currentFieldValue)
      ) {
        setSelectedOption(currentFieldValue);
        setCustomGender(""); // Clear custom gender if not "Other"
      } else if (currentFieldValue) {
        setSelectedOption("Other");
        setCustomGender(currentFieldValue); // Set custom gender from the database
      }
    }
  }, [fieldName, currentFieldValue]);

  const handleSave = async () => {
    const newFieldValue =
      selectedOption === "Other" ? customGender : selectedOption;

    const isModified =
      newFieldValue !== currentFieldValue || isVisible !== isHidden;

    if (fieldName === "gender" && !selectedOption) {
      alert("Please select a gender or provide a custom value.");
      return; // Prevent saving if no option is selected
    }

    if (selectedOption === "Other" && customGender.trim() === "") {
      alert("Please provide a custom gender value.");
      return;
    }

    if (isModified) {
      await updateUserData({
        [fieldName as string]: newFieldValue,
        hiddenFields: {
          ...userData.hiddenFields,
          [fieldName as string]: !isVisible,
        },
      });
    }

    router.back();
  };

  const renderOption = (option: {
    title: string;
    subtitle?: string;
    input?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.optionContainer}
      onPress={() => {
        if (option.title === "Other") {
          setSelectedOption("Other");
          setCustomGender(""); // Clear input when selecting Other
        } else {
          setSelectedOption(option.title);
          setCustomGender(""); // Clear custom gender input if selecting any other option
        }
      }}
    >
      <View>
        <Text style={styles.optionText}>{option.title}</Text>
        {option.subtitle && (
          <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
        )}
        {option.input && selectedOption === "Other" && (
          <TextInput
            style={styles.input}
            placeholder="Enter here"
            value={customGender}
            onChangeText={setCustomGender}
          />
        )}
      </View>
      <Checkbox
        value={selectedOption === option.title}
        onValueChange={() => {
          if (option.title !== "Other") {
            setSelectedOption(option.title);
            setCustomGender(""); // Clear custom gender input if selecting any other option
          }
        }}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSave}>
        <Icon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{fieldName}</Text>
      <ScrollView style={styles.scrollContainer}>
        <FlatList
          data={
            options[fieldName as keyof typeof options] as Array<{
              title: string;
              subtitle?: string;
              input?: boolean;
            }>
          }
          renderItem={({ item }) => renderOption(item)}
          keyExtractor={(item) => item.title}
          scrollEnabled={false} // Disable FlatList scrolling
        />
      </ScrollView>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setIsVisible(!isVisible)}
      >
        <Checkbox
          value={isVisible}
          onValueChange={() => setIsVisible(!isVisible)}
        />
        <Text style={styles.checkboxLabel}>Visible on profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
    justifyContent: "flex-start",
  },
  scrollContainer: {
    flexGrow: 1, // Ensure ScrollView can grow
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  optionText: {
    fontSize: 18,
  },
  optionSubtitle: {
    fontSize: 14,
    fontStyle: "italic",
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginVertical: 8,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
  },
});

export default EditFieldScreen;
