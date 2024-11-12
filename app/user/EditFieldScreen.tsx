import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from "react-native";
import styles from "@/styles/User/EditFieldScreenStyles";
import Checkbox from "expo-checkbox";
import { useUserContext } from "@/context/UserContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { RulerPicker } from "react-native-ruler-picker";
import useFieldState from "@/hooks/useFieldState";

function EditFieldScreen() {
  // TODO: Possibly think about moving every field into a separate component
  const router = useRouter();
  const { updateUserData, userData } = useUserContext();
  const { fieldName } = useLocalSearchParams();

  const currentFieldValue = (userData as any)[fieldName as string] || null;
  const isHidden =
    (userData.hiddenFields as any)?.[fieldName as string] === false;
  const fieldState = useFieldState(fieldName as string, currentFieldValue);
  const {
    OPTIONS,
    selectedGender,
    setSelectedGender,
    selectedOrientations,
    setSelectedOrientations,
    selectedDatePreferences,
    setSelectedDatePreferences,
    selectedEducation,
    setSelectedEducation,
    jobLocation,
    setJobLocation,
    jobTitle,
    setJobTitle,
    customInput,
    setCustomInput,
    fieldConfig,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    selectedHeight,
    setSelectedHeight,
    selectedChildrenPreferences,
    setSelectedChildrenPreferences,
    selectedEthnicities,
    setSelectedEthnicities,
    unit,
    setUnit,
  } = fieldState;

  const [isVisible, setIsVisible] = useState(isHidden);

  const fieldTitleMap: Record<string, string> = {
    gender: "Gender",
    sexualOrientation: "Sexuality",
    datePreferences: "Date Preference",
    childrenPreference: "Family Vision",
    jobLocation: "Work",
    jobTitle: "Job Title",
    educationDegree: "Education Level",
    firstName: "First Name",
    lastName: "Last Name",
    height: "Height",
    location: "Location",
    ethnicities: "Ethnic Root",
  };

  const handleSave = async () => {
    const config = fieldConfig[fieldName as string];
    let newFieldValue;

    if (fieldName === "fullName") {
      // Ensure the first name is not empty
      if (!firstName) {
        alert("First name is required.");
        return;
      }
      newFieldValue = lastName ? `${firstName} ${lastName}` : firstName;
    } else if (fieldName === "height") {
      newFieldValue = `${selectedHeight} ${unit}`;
    } else if (fieldName === "gender") {
      // Ensure gender is not empty or invalid
      if (!selectedGender || (selectedGender === "Other" && !customInput)) {
        alert("Please select a valid gender or provide a custom input.");
        return;
      }
      newFieldValue = selectedGender === "Other" ? customInput : selectedGender;
    } else {
      newFieldValue = config?.selectedValue;
    }

    const isModified =
      newFieldValue !== currentFieldValue || isVisible !== isHidden;

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

  const handleEthnicitySelection = (title: string) => {
    const newEthnicities = selectedEthnicities.includes(title)
      ? selectedEthnicities.filter((ethnicity) => ethnicity !== title)
      : [...selectedEthnicities, title];
    setSelectedEthnicities(newEthnicities);
  };

  const handleDatePreferenceSelection = (title: string) => {
    if (title === "Everyone") {
      if (
        selectedDatePreferences.includes("Men") ||
        selectedDatePreferences.includes("Women")
      ) {
        setSelectedDatePreferences(["Everyone"]);
      } else {
        setSelectedDatePreferences((prev) =>
          prev.includes("Everyone") ? [] : ["Everyone"]
        );
      }
    } else {
      const newPreferences = selectedDatePreferences.includes(title)
        ? selectedDatePreferences.filter((pref) => pref !== title)
        : [...selectedDatePreferences, title];

      if (newPreferences.includes("Men") && newPreferences.includes("Women")) {
        setSelectedDatePreferences([title]);
      } else {
        setSelectedDatePreferences(newPreferences);
      }

      if (newPreferences.includes("Men") || newPreferences.includes("Women")) {
        setSelectedDatePreferences(
          newPreferences.filter((pref) => pref !== "Everyone")
        );
      }
    }
  };

  const renderHeightPicker = () => (
    <View style={styles.heightPickerContainer}>
      <RulerPicker
        min={unit === "cm" ? 130 : 4.3} // min height in cm or ft
        max={unit === "cm" ? 240 : 7.9} // max height in cm or ft
        step={unit === "cm" ? 1 : 0.1} // step size in cm or ft
        unit={unit} // cm or ft
        fractionDigits={unit === "cm" ? 0 : 1} // decimal places
        initialValue={selectedHeight}
        onValueChange={(value) => setSelectedHeight(Number(value))}
      />
      <View style={styles.unitToggleContainer}>
        <TouchableOpacity
          style={unit === "cm" ? styles.activeUnit : styles.inactiveUnit}
          onPress={() => setUnit("cm")}
        >
          <Text style={styles.unitText}>cm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={unit === "ft" ? styles.activeUnit : styles.inactiveUnit}
          onPress={() => setUnit("ft")}
        >
          <Text style={styles.unitText}>ft</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAgeSection = () => {
    const { age, birthdate } = userData;
    return (
      <View style={styles.ageContainer}>
        <Text style={styles.ageText}>{age}</Text>
        <Text style={styles.birthdateText}>{birthdate}</Text>
        <Text style={styles.noticeText}>
          Please contact the Circle team at [your-email@example.com] to change
          your age. This requires you to upload your ID.
        </Text>
      </View>
    );
  };

  const renderOption = (
    option:
      | {
          title: string;
          subtitle?: string;
          input?: boolean;
        }
      | string
  ) => {
    const title = typeof option === "string" ? option : option.title;
    const subtitle = typeof option === "string" ? null : option.subtitle;
    const input = typeof option === "string" ? false : option.input;
    const isSelected =
      fieldName === "gender"
        ? selectedGender === title
        : fieldName === "datePreferences"
        ? selectedDatePreferences.includes(title)
        : fieldName === "sexualOrientation"
        ? selectedOrientations.includes(title)
        : fieldName === "educationDegree"
        ? selectedEducation === title
        : fieldName === "ethnicities"
        ? selectedEthnicities.includes(title)
        : fieldName === "childrenPreference"
        ? fieldState.selectedChildrenPreferences?.includes(title)
        : false;
    return (
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => {
          if (fieldName === "gender") {
            if (title === "Other") {
              setSelectedGender("Other");
              setCustomInput("");
            } else {
              setSelectedGender(title);
              setCustomInput("");
            }
          } else if (fieldName === "sexualOrientation") {
            setSelectedOrientations((prev) =>
              prev.includes(title)
                ? prev.filter((orientation) => orientation !== title)
                : [...prev, title]
            );
          } else if (fieldName === "datePreferences") {
            handleDatePreferenceSelection(title);
          } else if (fieldName === "educationDegree") {
            setSelectedEducation(title);
          } else if (fieldName === "ethnicities") {
            handleEthnicitySelection(title);
          } else if (fieldName === "childrenPreference") {
            setSelectedChildrenPreferences(title);
          }
        }}
      >
        <View>
          <Text style={styles.optionText}>{title}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
          {input && selectedGender === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Enter here"
              value={customInput}
              onChangeText={setCustomInput}
            />
          )}
        </View>
        <Checkbox value={isSelected} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSave}>
        <Icon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {fieldTitleMap[fieldName as string] ||
          (typeof fieldName === "string"
            ? fieldName
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
            : fieldName)}
      </Text>

      <ScrollView style={styles.scrollContainer}>
        {fieldName === "fullName" && (
          <>
            <TextInput
              style={styles.workInput}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.workInput}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <Text
              style={styles.optionalText}
              onPress={() => console.log("Why is clicked")}
            >
              Last name is optional, and only shared with matches. Why?
            </Text>
          </>
        )}

        {(fieldName === "jobLocation" || fieldName === "jobTitle") && (
          <TextInput
            style={styles.workInput}
            placeholder={`Enter ${fieldTitleMap[fieldName as string]}`}
            value={fieldName === "jobLocation" ? jobLocation : jobTitle}
            onChangeText={
              fieldName === "jobLocation" ? setJobLocation : setJobTitle
            }
          />
        )}

        {fieldName !== "jobLocation" &&
          fieldName !== "jobTitle" &&
          fieldName !== "firstName" && (
            <FlatList
              data={
                OPTIONS[fieldName as keyof typeof OPTIONS] as Array<
                  string | { title: string; subtitle?: string; input?: boolean }
                >
              }
              renderItem={({ item }) => renderOption(item)}
              keyExtractor={(item) =>
                typeof item === "string" ? item : item.title
              }
              scrollEnabled={false}
            />
          )}
        {fieldName === "age" && renderAgeSection()}
        {fieldName === "height" && renderHeightPicker()}
      </ScrollView>

      <View style={styles.visibilityContainer}>
        <Text style={styles.visibilityText}>
          {isVisible ? "Visible" : "Hidden"} on profile
        </Text>
        <TouchableOpacity onPress={() => setIsVisible((prev) => !prev)}>
          <Icon
            name={isVisible ? "eye" : "eye-slash"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default EditFieldScreen;
