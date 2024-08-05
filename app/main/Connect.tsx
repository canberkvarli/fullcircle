import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Button,
  Image,
} from "react-native";
import Slider from "@react-native-community/slider";
import Checkbox from "expo-checkbox";
import Icon from "react-native-vector-icons/FontAwesome";
import potentialMatches from "@/data/potentialMatches";
import useFetchUnsplashImages from "@/hooks/useFetchUnsplashImages";

export default function Connect() {
  const [loading, setLoading] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [ageRange, setAgeRange] = useState([22, 30]);
  const [dealbreaker, setDealbreaker] = useState(false);
  const { images } = useFetchUnsplashImages("beatiful woman", 6);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    };

    loadData();
  }, []);

  const handleLike = () => {
    console.log(`Liked user: ${potentialMatches[currentMatchIndex].firstName}`);
    moveToNextUser();
  };

  const handleDecline = () => {
    console.log(
      `Declined user: ${potentialMatches[currentMatchIndex].firstName}`
    );
    moveToNextUser();
  };

  const moveToNextUser = () => {
    if (currentMatchIndex < potentialMatches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      // Reset to the first user or handle end of matches
      console.log("No more matches available");
    }
  };

  // Get current user data
  const currentMatch = potentialMatches[currentMatchIndex];

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
      <View style={styles.userContainer}>
        <Text
          style={styles.userName}
        >{`${currentMatch.firstName} ${currentMatch.lastName}`}</Text>
        <Text>{`Age: ${
          new Date().getFullYear() - parseInt(currentMatch.birthyear)
        }`}</Text>
        <View>
          <View>
            {currentMatch.photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.image} />
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleDecline}>
          <Text style={styles.declineButton}>X</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLike}>
          <Text style={styles.likeButton}>❤️</Text>
        </TouchableOpacity>
      </View>

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
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 16,
  },
  ageText: {
    fontSize: 18,
    marginHorizontal: 8,
  },
  userContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  userPhoto: {
    width: 300,
    height: 300,
    borderRadius: 15,
    marginVertical: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  declineButton: {
    fontSize: 30,
    color: "red",
  },
  likeButton: {
    fontSize: 30,
    color: "green",
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
