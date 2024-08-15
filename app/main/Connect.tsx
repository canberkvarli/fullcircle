import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Button,
} from "react-native";
import styles from "@/styles/Main/ConnectStyles";
import Slider from "@react-native-community/slider";
import Checkbox from "expo-checkbox";
import Icon from "react-native-vector-icons/FontAwesome";
import PotentialMatch from "@/components/PotentialMatch";
import { useUserContext } from "@/context/UserContext";

export default function Connect() {
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [ageRange, setAgeRange] = useState([22, 30]);
  const [dealbreaker, setDealbreaker] = useState(false);
  const { dislikeMatch, currentPotentialMatch, loadNextPotentialMatch } =
    useUserContext();

  useEffect(() => {
    const loadData = async () => {
      loadNextPotentialMatch();
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
          <Icon name="sliders" size={24} />
        </TouchableOpacity>
        <Text style={styles.ageText}>Age</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Icon name="caret-down" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.matchContainer}>
          <PotentialMatch currentPotentialMatch={currentPotentialMatch} />
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => {
          dislikeMatch(currentPotentialMatch.userId).then(() => {
            loadNextPotentialMatch();
          });
        }}
        style={styles.dislikeButton}
      >
        <Icon name="times" style={styles.dislikeIcon} />
      </TouchableOpacity>

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
