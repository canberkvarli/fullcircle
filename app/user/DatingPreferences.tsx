import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const DatingPreferences = () => {
  const handleEditField = (fieldName: string) => {
    // Navigate to the appropriate field edit page
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dating Preferences</Text>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Member Preferences</Text>

        <TouchableOpacity onPress={() => handleEditField("gender")}>
          <Text style={styles.preferenceItem}>I'm Interested In: Women</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("neighborhood")}>
          <Text style={styles.preferenceItem}>My Neighborhood: City Name</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("maxDistance")}>
          <Text style={styles.preferenceItem}>Maximum Distance: 10km</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("ageRange")}>
          <Text style={styles.preferenceItem}>Age Range: 25-35</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("ethnicity")}>
          <Text style={styles.preferenceItem}>Ethnicity: Open to all</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("religion")}>
          <Text style={styles.preferenceItem}>Religion: Open to all</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("relationshipType")}>
          <Text style={styles.preferenceItem}>
            Relationship Type: Open to all
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Subscriber Preferences</Text>
        <TouchableOpacity onPress={() => handleEditField("height")}>
          <Text style={styles.preferenceItem}>Height: Open to all</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("datingIntentions")}>
          <Text style={styles.preferenceItem}>
            Dating Intentions: Open to all
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("children")}>
          <Text style={styles.preferenceItem}>Children: Open to all</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("familyPlans")}>
          <Text style={styles.preferenceItem}>Family Plans: Open to all</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("educationLevel")}>
          <Text style={styles.preferenceItem}>
            Education Level: Open to all
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditField("spirituality")}>
          <Text style={styles.preferenceItem}>Spirituality: Open to all</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.subscribeButton}>
        <Text style={styles.subscribeText}>
          Upgrade to fine-tune your preferences
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  preferenceSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  preferenceItem: {
    fontSize: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  subscribeButton: {
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    marginTop: 20,
  },
  subscribeText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});

export default DatingPreferences;
