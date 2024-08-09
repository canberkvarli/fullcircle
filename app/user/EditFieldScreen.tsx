import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useUserContext } from "@/context/UserContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import NavigationIcon from "react-native-vector-icons/FontAwesome";

function EditFieldScreen() {
  const router = useRouter();
  const { updateUserData } = useUserContext();
  const { fieldName, fieldValue } = useLocalSearchParams();
  const [value, setValue] = useState(fieldValue as string);

  const handleSave = () => {
    updateUserData({ [fieldName as string]: value });
    router.back();
  };

  const handleBack = () => {
    router.replace("/user/EditUserProfile" as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Edit {fieldName}</Text>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <NavigationIcon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>
      <TextInput style={styles.input} value={value} onChangeText={setValue} />
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  backButton: {
    bottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default EditFieldScreen;
