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
import Icon from "react-native-vector-icons/FontAwesome";

function EditFieldScreen() {
  const router = useRouter();
  const { updateUserData } = useUserContext();
  const { fieldName, fieldValue } = useLocalSearchParams();
  const [value, setValue] = useState(fieldValue as string);

  const handleSave = () => {
    updateUserData({ [fieldName as string]: value });
    router.replace("/user/EditUserProfile" as any);
  };

  const handleBack = () => {
    router.replace("/user/EditUserProfile" as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit {fieldName}</Text>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        autoFocus
      />
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
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 4,
    fontSize: 16,
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
