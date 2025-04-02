import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import PotentialMatch from "@/components/PotentialMatch";
import { useUserContext } from "@/context/UserContext";
import styles from "@/styles/Main/ConnectStyles";
import { Link } from "expo-router";
import FilterModal from "@/components/modals/FiltersModal";

const ConnectScreen: React.FC = () => {
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showHeightModal, setShowHeightModal] = useState<boolean>(false);
  const {
    dislikeMatch,
    currentPotentialMatch,
    loadNextPotentialMatch,
    loadingNextBatch,
    updateUserData,
    userData,
    fetchDetailedLikes,
    fetchPotentialMatches,
    noMoreMatches,
  } = useUserContext();

  const [ageRange, setAgeRange] = useState([18, 50]);
  const [originalAgeRange, setOriginalAgeRange] = useState([18, 50]);
  const [datePreferences, setDatePreferences] = useState<string[]>(
    userData?.matchPreferences?.datePreferences || []
  );
  const [preferredEthnicities, setPreferredEthnicities] = useState<string[]>(
    userData?.matchPreferences?.preferredEthnicities || []
  );

  const [heightRange, setHeightRange] = useState([3, 7]);
  const [originalHeightRange, setOriginalHeightRange] = useState([3, 7]);
  const [isDislikeLoading, setIsDislikeLoading] = useState(false);
  const fullCircleSubscription = userData.fullCircleSubscription || false;

  useEffect(() => {
    if (!currentPotentialMatch) {
      loadNextPotentialMatch();
    }
  }, [currentPotentialMatch]);

  useEffect(() => {
    if (!userData.detailedLikesReceived) {
      fetchDetailedLikes();
    }
  }, [userData]);

  const updateMatchPreferences = (preferences: {
    preferredAgeRange?: { min?: number; max?: number };
    datePreferences?: string[];
    preferredEthnicities?: string[];
    preferredHeightRange?: { min?: number; max?: number };
  }) => {
    setAgeRange([
      preferences?.preferredAgeRange?.min || 18,
      preferences?.preferredAgeRange?.max || 35,
    ]);
    setOriginalAgeRange([
      preferences?.preferredAgeRange?.min || 18,
      preferences?.preferredAgeRange?.max || 35,
    ]);
    setDatePreferences(preferences?.datePreferences || []);
    setPreferredEthnicities(preferences?.preferredEthnicities || []);
    setHeightRange([
      Math.floor(preferences?.preferredHeightRange?.min || 36) / 12 || 3,
      Math.floor(preferences?.preferredHeightRange?.max || 84) / 12 || 7,
    ]);
    setOriginalHeightRange([
      Math.floor(preferences?.preferredHeightRange?.min || 36) / 12 || 3,
      Math.floor(preferences?.preferredHeightRange?.max || 84) / 12 || 7,
    ]);
  };

  useEffect(() => {
    if (userData?.matchPreferences) {
      updateMatchPreferences(userData.matchPreferences);
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

  return (
    <View style={styles.container}>
      {noMoreMatches ? (
        <View style={styles.noMatchesContainer}>
          <Text style={styles.noMatchesText}>No more matches available</Text>
          <Text style={styles.noMatchesSubText}>
            Upgrade your account for more matches or change your filters.
          </Text>
          <Link
            href={{ pathname: "/user/FullCircleSubscription" }}
            style={styles.upgradeButton}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </Link>
          <Link
            href={{ pathname: "/user/DatingPreferences" }}
            style={styles.filtersButton}
          >
            <Text style={styles.filtersButtonText}>Update Filters</Text>
          </Link>
        </View>
      ) : (
        <View>
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
              {loadingNextBatch || !currentPotentialMatch ? (
                <ActivityIndicator
                  size="large"
                  color="black"
                  style={styles.loadingIndicator}
                />
              ) : (
                <PotentialMatch currentPotentialMatch={currentPotentialMatch} />
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {!loadingNextBatch && !noMoreMatches && (
        <TouchableOpacity
          onPress={() => {
            if (!isDislikeLoading) {
              setIsDislikeLoading(true);
              dislikeMatch(currentPotentialMatch.userId)
                .then(() => {
                  loadNextPotentialMatch();
                })
                .finally(() => {
                  setIsDislikeLoading(false);
                });
            }
          }}
          style={styles.dislikeButton}
        >
          {isDislikeLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Icon name="times" style={styles.dislikeIcon} />
          )}
        </TouchableOpacity>
      )}

      {/* Age Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        title="Age"
        description="Select the range you're open to meeting"
        values={ageRange}
        min={18}
        max={100}
        onValuesChange={setAgeRange}
        formattedRange={`Age Range: ${ageRange[0]} - ${ageRange[1]}`}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyAgeFilter}
        isApplyDisabled={isApplyButtonDisabled}
        styles={styles}
      />

      {/* Height Filter Modal */}
      <FilterModal
        visible={showHeightModal}
        title="Height"
        description="Select the height range"
        values={heightRange}
        min={3}
        max={7}
        step={0.1}
        onValuesChange={(values) =>
          setHeightRange(values.map((val) => parseFloat(val.toFixed(1))))
        }
        formattedRange={`Height Range: ${Math.floor(
          heightRange[0]
        )}'${Math.round((heightRange[0] % 1) * 10)}" - ${Math.floor(
          heightRange[1]
        )}'${Math.round((heightRange[1] % 1) * 10)}"`}
        onClose={() => setShowHeightModal(false)}
        onApply={handleApplyAgeFilter}
        isApplyDisabled={isApplyButtonDisabled}
        styles={styles}
      />
    </View>
  );
};

export default ConnectScreen;
