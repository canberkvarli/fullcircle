import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Text,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import PotentialMatch from "@/components/PotentialMatch";
import { useUserContext } from "@/context/UserContext";
import styles from "@/styles/Main/ConnectStyles"; // Assuming custom styles are here

const ConnectScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  const openPreferencesModal = () => setIsModalVisible(true);
  const closePreferencesModal = () => setIsModalVisible(false);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          style={styles.loadingIndicator}
          size="large"
          color="#0000ff"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scrollable Tabs Section */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer} // Apply the layout styles here
      >
        <TouchableOpacity onPress={openPreferencesModal}>
          <Icon name="sliders" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text>Age</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>Height</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>Dating Intentions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>Active Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>New Here</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>More</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Preferences Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={closePreferencesModal}
              style={styles.closeButton}
            >
              <Text>X</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Dating Preferences</Text>
            <Text>Here you can update your dating preferences.</Text>
          </View>
        </View>
      </Modal>

      {/* Main Content: Potential Match */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer} // Move alignment here
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
    </View>
  );
};

export default ConnectScreen;
