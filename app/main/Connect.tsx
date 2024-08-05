import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Button,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import Checkbox from "expo-checkbox";
import Icon from "react-native-vector-icons/FontAwesome";
import potentialMatches from "@/data/potentialMatches";
import PotentialMatch from "@/components/PotentialMatch";

export default function Connect() {
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [ageRange, setAgeRange] = useState([22, 30]);
  const [dealbreaker, setDealbreaker] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => console.log("Preferences clicked")}>
          <Icon name="cog" size={24} />
        </TouchableOpacity>
        <Text style={styles.ageText}>Age</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Icon name="caret-down" size={24} />
        </TouchableOpacity>
      </View>

      {/* Wrap content in ScrollView */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {potentialMatches.map((match, index) => (
          <PotentialMatch key={index} match={match} />
        ))}
      </ScrollView>

      {/* Age Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Age</Text>
            <Text style={styles.modalSubtitle}>
              Select the range you're open to meeting
            </Text>

            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={85}
              step={1}
              value={ageRange[0]}
              onValueChange={(value) => setAgeRange([value, ageRange[1]])}
              minimumTrackTintColor="#1fb28a"
              maximumTrackTintColor="#d3d3d3"
            />
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={85}
              step={1}
              value={ageRange[1]}
              onValueChange={(value) => setAgeRange([ageRange[0], value])}
              minimumTrackTintColor="#1fb28a"
              maximumTrackTintColor="#d3d3d3"
            />
            <Text>
              Age Range: {ageRange[0]} - {ageRange[1]}
            </Text>

            <Checkbox value={dealbreaker} onValueChange={setDealbreaker} />
            <Text>This is a dealbreaker</Text>

            <Button title="Apply Filter" onPress={() => {}} />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ageText: {
    fontSize: 18,
    marginHorizontal: 8,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalSubtitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
