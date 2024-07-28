import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "../../context/UserContext";
import { Checkbox } from "expo-checkbox";

const heights = Array.from({ length: 71 }, (_, i) => `${i + 130} cm`);

function HeightScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [selectedHeight, setSelectedHeight] = useState<string>(
    userData?.height || heights[0]
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData.hiddenFields || {}
  );

  // Function to handle height submission
  const handleHeightSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Error", "Invalid user ID");
        return;
      }

      await updateUserData({
        height: selectedHeight,
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save height: " + error.message);
    }
  };

  // Function to handle swipe changes
  const handleSwipeChange = (index: string) => {
    setSelectedHeight(index);
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const renderHeightPicker = (data: string[]) => {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, [selectedHeight]);

    const currentIndex = data.indexOf(selectedHeight);
    const validIndex = currentIndex !== -1 ? currentIndex : 0;

    return (
      <Animated.FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => {
          const isCurrent = index === validIndex;
          const isNearby = index >= validIndex - 2 && index <= validIndex + 2;
          const color = isCurrent ? "black" : "gray";
          const opacityValue = isNearby ? 1 : 0.3;

          return (
            <Animated.View style={{ opacity }}>
              <Text
                style={[styles.heightValue, { color, opacity: opacityValue }]}
              >
                {item}
              </Text>
            </Animated.View>
          );
        }}
        getItemLayout={(data, index) => ({
          length: 40,
          offset: 40 * index,
          index,
        })}
        initialScrollIndex={validIndex}
        onMomentumScrollEnd={(event) => {
          const index = Math.floor(event.nativeEvent.contentOffset.y / 40);
          handleSwipeChange(data[index]);
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={40}
        decelerationRate="fast"
        style={{ height: 200, paddingVertical: 80 }}
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Stand Tall</Text>
        <Text style={styles.subtitle}>What's your height?</Text>
        <View style={styles.heightInputs}>{renderHeightPicker(heights)}</View>
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide Height Field</Text>
          <Checkbox
            value={hiddenFields["height"] || false}
            onValueChange={() => toggleHidden("height")}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.affirmation}>
          Every inch of you is perfectly designed.
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleHeightSubmit}
        >
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 45,
    textAlign: "center",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  heightInputs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  heightValue: {
    fontSize: 24,
    height: 40,
    textAlign: "center",
    lineHeight: 40,
  },
  hiddenContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  hiddenText: {
    fontSize: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  affirmation: {
    marginTop: 20,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
    position: "absolute",
    bottom: 70,
  },
  nextButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HeightScreen;
