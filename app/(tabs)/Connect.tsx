import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import PotentialMatch from "@/components/PotentialMatch";
import { useUserContext } from "@/context/UserContext";
import styles from "@/styles/Main/ConnectStyles";
import { Link } from "expo-router";
import FilterModal from "@/components/modals/FiltersModal";
import LottieView from "lottie-react-native";
import loadingMandala from "../../assets/animations/loading_mandala.json";

const ConnectScreen: React.FC = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showHeightModal, setShowHeightModal] = useState(false);

  const {
    likeMatch,
    dislikeMatch,
    currentPotentialMatch,
    loadNextPotentialMatch,
    loadingNextBatch,
    updateUserData,
    userData,
    noMoreMatches,
    resetPotentialMatches,
  } = useUserContext();

  const [ageRange, setAgeRange] = useState([18, 70]);
  const [originalAgeRange, setOriginalAgeRange] = useState([18, 50]);
  const [datePreferences, setDatePreferences] = useState<string[]>(
    userData?.matchPreferences?.datePreferences || []
  );
  const [preferredEthnicities, setPreferredEthnicities] = useState<string[]>(
    userData?.matchPreferences?.preferredEthnicities || []
  );

  const [heightRange, setHeightRange] = useState([3, 8]);
  const [originalHeightRange, setOriginalHeightRange] = useState([3, 8]);

  const [isDislikeLoading, setIsDislikeLoading] = useState(false);

  // like.json controls
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [likeAnimFinished, setLikeAnimFinished] = useState(false);

  // dislike.json controls
  const [showDislikeAnimation, setShowDislikeAnimation] = useState(false);
  const [dislikeAnimFinished, setDislikeAnimFinished] = useState(false);

  // photos loaded?
  const [isPhotoLoading, setIsPhotoLoading] = useState(true);

  // reset photo-loading when a new match arrives
  useEffect(() => {
    if (currentPotentialMatch) {
      setIsPhotoLoading(true);
    }
  }, [currentPotentialMatch]);

  const handleLike = async (userId: string) => {
    setShowLikeAnimation(true);
    setLikeAnimFinished(false);
    try {
      await likeMatch(userId);
    } catch (err) {
      console.error("Like failed:", err);
      setShowLikeAnimation(false);
      return;
    }

    loadNextPotentialMatch();
  };

  // when like.json ends
  const handleLikeAnimationFinish = () => {
    setLikeAnimFinished(true);
  };

  // hide like.json only once both it and photos are done
  useEffect(() => {
    if (likeAnimFinished && !isPhotoLoading) {
      setShowLikeAnimation(false);
      setLikeAnimFinished(false);
    }
  }, [likeAnimFinished, isPhotoLoading]);

  const handleDislike = async (userId: string) => {
    setShowDislikeAnimation(true);
    setDislikeAnimFinished(false);
    setIsDislikeLoading(true);

    try {
      await dislikeMatch(userId);
      loadNextPotentialMatch();
    } catch (err) {
      console.error("Dislike failed:", err);
      setShowDislikeAnimation(false);
      return;
    } finally {
      setIsDislikeLoading(false);
    }
  };
  // when dislike.json ends
  const handleDislikeAnimationFinish = () => {
    setDislikeAnimFinished(true);
  };

  // hide dislike.json only once both it and photos are done
  useEffect(() => {
    if (dislikeAnimFinished && !isPhotoLoading) {
      setShowDislikeAnimation(false);
      setDislikeAnimFinished(false);
    }
  }, [dislikeAnimFinished, isPhotoLoading]);

  // sync preferences into local state
  const updateMatchPreferences = (preferences: {
    preferredAgeRange?: { min?: number; max?: number };
    datePreferences?: string[];
    preferredEthnicities?: string[];
    preferredHeightRange?: { min?: number; max?: number };
  }) => {
    setAgeRange([
      preferences?.preferredAgeRange?.min ?? 18,
      preferences?.preferredAgeRange?.max ?? 35,
    ]);
    setOriginalAgeRange([
      preferences?.preferredAgeRange?.min ?? 18,
      preferences?.preferredAgeRange?.max ?? 35,
    ]);
    setDatePreferences(preferences?.datePreferences ?? []);
    setPreferredEthnicities(preferences?.preferredEthnicities ?? []);
    setHeightRange([
      preferences?.preferredHeightRange?.min ?? 3,
      preferences?.preferredHeightRange?.max ?? 8,
    ]);
    setOriginalHeightRange([
      preferences?.preferredHeightRange?.min ?? 3,
      preferences?.preferredHeightRange?.max ?? 8,
    ]);
  };

  useEffect(() => {
    if (userData?.matchPreferences) {
      updateMatchPreferences(userData.matchPreferences);
    }
  }, [userData]);

  // apply filter
  const handleApplyAgeFilter = async () => {
    if (!userData?.userId) {
      console.error("User ID is missing. Cannot apply filter.");
      return;
    }
    const updatedData = {
      userId: userData.userId,
      matchPreferences: {
        preferredAgeRange: { min: ageRange[0], max: ageRange[1] },
        datePreferences,
        preferredDistance: userData.matchPreferences?.preferredDistance ?? 100,
        preferredEthnicities:
          userData.matchPreferences?.preferredEthnicities ?? [],
        desiredRelationship:
          userData.matchPreferences?.desiredRelationship ?? "",
        preferredHeightRange: {
          min: heightRange[0],
          max: heightRange[1],
        },
      },
    };
    try {
      await updateUserData(updatedData);
      await resetPotentialMatches();
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

  // only show loader when fetching & there are matches to load
  const isLoading =
    loadingNextBatch || !currentPotentialMatch || isPhotoLoading;

  return (
    <View style={styles.container}>
      {/* loading_mandala loader */}
      {!noMoreMatches && isLoading && (
        <View style={styles.loadingOverlay}>
          <LottieView
            source={loadingMandala}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
        </View>
      )}

      {/* like.json overlay */}
      {showLikeAnimation && (
        <View style={styles.animationContainer}>
          <LottieView
            source={require("../../assets/animations/like.json")}
            autoPlay
            loop={false}
            onAnimationFinish={handleLikeAnimationFinish}
            style={styles.animation}
          />
        </View>
      )}

      {/* dislike.json overlay */}
      {showDislikeAnimation && (
        <View style={styles.animationContainer}>
          <LottieView
            source={require("../../assets/animations/dislike.json")}
            autoPlay
            loop={false}
            onAnimationFinish={handleDislikeAnimationFinish}
            style={styles.animation}
          />
        </View>
      )}
      {/* IMPORTANT: Previously it was !isLoading && noMoreMatches  */}
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
        <>
          {/* tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            <Link
              href={{ pathname: "/user/DatingPreferences" }}
              style={styles.slider}
            >
              <Icon name="sliders" size={24} color="black" />
            </Link>
            <TouchableOpacity
              style={[styles.tab, styles.activeTab]}
              onPress={() => setShowFilterModal(true)}
            >
              <Text style={styles.tabText}>Age</Text>
              <Icon
                name="chevron-down"
                size={12}
                color={styles.caretIcon.color}
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
                color={styles.caretIcon.color}
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

          {/* match */}
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.matchContainer}>
              {currentPotentialMatch && (
                <PotentialMatch
                  currentPotentialMatch={currentPotentialMatch}
                  isMatched={false}
                  onLike={handleLike}
                  disableInteractions={
                    showLikeAnimation || showDislikeAnimation
                  }
                  onPhotosLoaded={() => setIsPhotoLoading(false)}
                />
              )}
            </View>
          </ScrollView>
        </>
      )}

      {/* dislike button (hidden during both like & dislike animations) */}
      {!showLikeAnimation &&
        !showDislikeAnimation &&
        !isLoading &&
        !noMoreMatches &&
        currentPotentialMatch && (
          <TouchableOpacity
            onPress={() => handleDislike(currentPotentialMatch.userId)}
            style={styles.dislikeButton}
          >
            <Icon name="times" style={styles.dislikeIcon} />
          </TouchableOpacity>
        )}

      {/* filter modals */}
      <FilterModal
        visible={showFilterModal}
        title="Age"
        description="Select the range you're open to meeting"
        values={ageRange}
        min={18}
        max={70}
        onValuesChange={setAgeRange}
        formattedRange={`Age Range: ${ageRange[0]} - ${ageRange[1]}`}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyAgeFilter}
        isApplyDisabled={isApplyButtonDisabled}
        styles={styles}
      />
      <FilterModal
        visible={showHeightModal}
        title="Height"
        description="Select the height range (in feet)"
        values={heightRange}
        min={3}
        max={8}
        step={0.1}
        onValuesChange={(vals) =>
          setHeightRange(vals.map((v) => parseFloat(v.toFixed(1))))
        }
        formattedRange={`Height Range: ${heightRange[0].toFixed(
          1
        )} ft - ${heightRange[1].toFixed(1)} ft`}
        onClose={() => setShowHeightModal(false)}
        onApply={handleApplyAgeFilter}
        isApplyDisabled={isApplyButtonDisabled}
        styles={styles}
      />
    </View>
  );
};

export default ConnectScreen;
