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
  const [showHeightModal, setShowHeightModal] = useState<boolean>(false);
  const {
    dislikeMatch,
    currentPotentialMatch,
    loadNextPotentialMatch,
    updateUserData,
    userData,
    fetchDetailedLikes,
    fetchPotentialMatches,
  } = useUserContext();

  const [ageRange, setAgeRange] = useState([18, 50]);
  const [originalAgeRange, setOriginalAgeRange] = useState([18, 50]);
  const [datePreferences, setDatePreferences] = useState<string[]>(
    userData?.matchPreferences?.datePreferences ||
      userData?.datePreferences ||
      []
  );
  const [preferredEthnicities, setPreferredEthnicities] = useState<string[]>(
    userData?.matchPreferences?.preferredEthnicities || []
  );

  const [heightRange, setHeightRange] = useState([3, 7]);
  const [originalHeightRange, setOriginalHeightRange] = useState([3, 7]);
  const fullCircleSubscription = userData.fullCircleSubscription || false;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadNextPotentialMatch();
      setLoading(false);
    };

    if (!userData.detailedLikesReceived) {
      fetchDetailedLikes();
    } else {
      loadData();
    }
  }, [userData]);

  useEffect(() => {
    if (userData && userData.matchPreferences) {
      setAgeRange([
        userData.matchPreferences.preferredAgeRange?.min || 18,
        userData.matchPreferences.preferredAgeRange?.max || 35,
      ]);
      setOriginalAgeRange([
        userData.matchPreferences.preferredAgeRange?.min || 18,
        userData.matchPreferences.preferredAgeRange?.max || 35,
      ]);
      setDatePreferences(userData.matchPreferences.datePreferences || []);
      setPreferredEthnicities(preferredEthnicities || []);
      setHeightRange([
        Math.floor(userData.matchPreferences.preferredHeightRange?.min ?? 36) /
          12 || 3,
        Math.floor(userData.matchPreferences.preferredHeightRange?.max ?? 84) /
          12 || 7,
      ]);
      setOriginalHeightRange([
        Math.floor(userData.matchPreferences.preferredHeightRange?.min ?? 36) /
          12 || 3,
        Math.floor(userData.matchPreferences.preferredHeightRange?.max ?? 84) /
          12 || 7,
      ]);
    }
  }, [userData]);

  const handleApplyAgeFilter = async () => {
    if (!userData || !userData.userId) {
      console.error("User ID is missing. Cannot apply filter.");
      return;
    }

    const updatedData = {
      userId: userData.userId,
      matchPreferences: {
        preferredAgeRange: { min: ageRange[0], max: ageRange[1] },
        datePreferences: datePreferences,
        preferredDistance: userData.matchPreferences?.preferredDistance || 100,
        preferredEthnicities:
          userData.matchPreferences?.preferredEthnicities || [],
        desiredRelationship:
          userData.matchPreferences?.desiredRelationship || "",
        preferredHeightRange: {
          min: heightRange[0] * 12,
          max: heightRange[1] * 12,
        },
      },
    };

    try {
      updateUserData(updatedData);
      console.log("Filter applied:", updatedData);
      setShowFilterModal(false);
      setShowHeightModal(false);
    } catch (error) {
      console.error("Error applying filter:", error);
    }
  };

  const isApplyButtonDisabled =
    ageRange[0] === originalAgeRange[0] &&
    ageRange[1] === originalAgeRange[1] &&
    heightRange[0] === originalHeightRange[0] &&
    heightRange[1] === originalHeightRange[1];

  const isSubscriber = String(fullCircleSubscription) === "true";

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          style={styles.loadingIndicator}
          size="large"
          color="#EDE9E3"
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
        <Link
          href={{ pathname: "/user/DatingPreferences" }}
          style={styles.slider}
        >
          <Icon name="sliders" size={24} color={"black"} />
        </Link>
        <TouchableOpacity
          style={[styles.tab, styles.activeTab]}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.tabText}>Age</Text>
          <Icon
            name="chevron-down"
            size={12}
            color={"#7E7972"}
            style={styles.caretIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setShowHeightModal(true)}
        >
          <Text style={styles.tabText}>Height</Text>
          <Icon
            name="chevron-down"
            size={12}
            color={"#7E7972"}
            style={styles.caretIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Dating Intentions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Active Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>New Here</Text>
        </TouchableOpacity>
        <Link
          href={{ pathname: "/user/DatingPreferences" }}
          style={[styles.tab, styles.moreTab]}
        >
          <Text style={styles.tabText}>More</Text>
        </Link>
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.matchContainer}>
          {currentPotentialMatch ? (
            <PotentialMatch currentPotentialMatch={currentPotentialMatch} />
          ) : loading ? (
            <ActivityIndicator size="large" color="#EDE9E3" />
          ) : (
            <Text style={styles.nameText}>No more matches available</Text>
          )}
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

      {/* Age Filter Modal */}
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
            <MultiSlider
              values={ageRange}
              sliderLength={280}
              min={18}
              max={100}
              onValuesChange={setAgeRange}
            />
            <Text style={styles.ageText}>
              Age Range: {ageRange[0]} - {ageRange[1]}
            </Text>

            <TouchableOpacity
              onPress={handleApplyAgeFilter}
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

      {/* Height Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHeightModal}
        onRequestClose={() => setShowHeightModal(false)}
      >
        <GestureHandlerRootView style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowHeightModal(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Height</Text>
            <Text style={styles.subheaderText}>Select the height range</Text>
            <MultiSlider
              values={heightRange}
              sliderLength={280}
              min={3}
              max={7}
              step={0.1}
              onValuesChange={(values) => {
                const roundedValues = values.map((val) =>
                  parseFloat(val.toFixed(1))
                );
                setHeightRange(roundedValues);
              }}
            />
            <Text style={styles.heightText}>
              Height Range: {Math.floor(heightRange[0])}'
              {Math.round((heightRange[0] % 1) * 10)}" -{" "}
              {Math.floor(heightRange[1])}'
              {Math.round((heightRange[1] % 1) * 10)}"
            </Text>

            <TouchableOpacity
              onPress={handleApplyAgeFilter}
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
