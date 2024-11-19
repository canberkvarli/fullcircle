import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import {
  GestureHandlerRootView,
  GestureDetector,
  TapGestureHandler,
  GestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome";
import PotentialMatch from "@/components/PotentialMatch";
import { useUserContext } from "@/context/UserContext";
import styles from "@/styles/Main/ConnectStyles";
import { Link } from "expo-router";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

const ConnectScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const {
    dislikeMatch,
    currentPotentialMatch,
    loadNextPotentialMatch,
    updateUserData,
    userData,
  } = useUserContext();

  const [ageRange, setAgeRange] = useState([18, 50]);
  const [originalAgeRange, setOriginalAgeRange] = useState([18, 50]);
  const [datePreferences, setDatePreferences] = useState<string[]>(
    userData?.filterOptions?.datePreferences || userData?.datePreferences || []
  );
  const [preferredEthnicities, setPreferredEthnicities] = useState<string[]>(
    userData?.filterOptions?.preferredEthnicities ||
      userData.preferredEthnicities ||
      []
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      loadNextPotentialMatch();
      setTimeout(() => setLoading(false), 2000);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Prepopulate filter options when the modal opens
    if (userData) {
      setAgeRange([
        userData.filterOptions?.preferredAgeRange.min || 18,
        userData.filterOptions?.preferredAgeRange.max || 35,
      ]);

      setOriginalAgeRange([
        userData.filterOptions?.preferredAgeRange.min || 18,
        userData.filterOptions?.preferredAgeRange.max || 35,
      ]);

      setDatePreferences(userData.filterOptions?.datePreferences || []);
      setPreferredEthnicities(
        userData.filterOptions?.preferredEthnicities ||
          preferredEthnicities ||
          []
      );
    }
  }, [userData]);

  const handleApplyFilter = async () => {
    if (!userData || !userData.userId) {
      console.error("User ID is missing. Cannot apply filter.");
      return;
    }

    const updatedData = {
      userId: userData.userId,
      filterOptions: {
        preferredAgeRange: { min: ageRange[0], max: ageRange[1] },
        datePreferences: datePreferences,
        location:
          userData.filterOptions?.location || userData.location?.city || "",
        preferredDistance:
          userData.filterOptions?.preferredDistance ||
          userData.preferredDistance ||
          100,
        preferredEthnicities:
          userData.filterOptions?.preferredEthnicities ||
          userData.preferredEthnicities ||
          [],
        desiredRelationship: userData.filterOptions?.desiredRelationship || "",
      },
    };

    try {
      await updateUserData(updatedData);
      console.log("Filter applied:", updatedData);
      setShowFilterModal(false);
    } catch (error) {
      console.error("Error applying filter:", error);
    }
  };

  const isApplyButtonDisabled =
    ageRange[0] === originalAgeRange[0] && ageRange[1] === originalAgeRange[1];

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        <Link href={"/user/DatingPreferences" as any} style={styles.slider}>
          <Icon name="sliders" size={24} color="black" />
        </Link>
        <TouchableOpacity
          style={[styles.tab, styles.activeTab]}
          onPress={() => setShowFilterModal(true)}
        >
          <Text>Age</Text>
          <Icon
            name="chevron-down"
            size={12}
            color="black"
            style={styles.caretIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>Height</Text>
          <Icon
            name="chevron-down"
            size={12}
            color="black"
            style={styles.caretIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>Dating Intentions</Text>
          <Icon
            name="chevron-down"
            size={12}
            color="black"
            style={styles.caretIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>Active Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>New Here</Text>
        </TouchableOpacity>
        <Link
          href={"/user/DatingPreferences" as any}
          style={(styles.tab, styles.moreTab)}
        >
          <Text>More</Text>
        </Link>
      </ScrollView>

      {/* Main Content: Potential Match */}
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

      {/* Modal for filtering */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <GestureHandlerRootView style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Age</Text>
            <Text style={styles.subheaderText}>
              Select the range you're open to meeting
            </Text>

            {/* MultiSlider for Age */}
            <MultiSlider
              values={ageRange}
              sliderLength={280}
              min={18}
              max={100}
              onValuesChange={setAgeRange}
              selectedStyle={{ backgroundColor: "#4CAF50" }}
              unselectedStyle={{ backgroundColor: "gray" }}
            />
            <Text style={styles.ageText}>
              Age Range: {ageRange[0]} - {ageRange[1]}
            </Text>

            {/* Add other filters here (datePreferences, preferredEthnicities) */}

            <TouchableOpacity
              onPress={handleApplyFilter}
              style={[
                styles.applyButton,
                isApplyButtonDisabled && styles.applyButtonDisabled,
              ]}
              disabled={isApplyButtonDisabled}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

export default ConnectScreen;
