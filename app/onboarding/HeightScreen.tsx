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
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import Checkbox from "expo-checkbox";

const cmHeights = Array.from({ length: 131 }, (_, i) => `${i + 130} cm`);
const ftHeights = [
  "2 ft",
  "2.1 ft",
  "2.2 ft",
  "2.3 ft",
  "2.4 ft",
  "2.5 ft",
  "2.6 ft",
  "2.7 ft",
  "2.8 ft",
  "2.9 ft",
  "3 ft",
  "3.1 ft",
  "3.2 ft",
  "3.3 ft",
  "3.4 ft",
  "3.5 ft",
  "3.6 ft",
  "3.7 ft",
  "3.8 ft",
  "3.9 ft",
  "4 ft",
  "4.1 ft",
  "4.2 ft",
  "4.3 ft",
  "4.4 ft",
  "4.5 ft",
  "4.6 ft",
  "4.7 ft",
  "4.8 ft",
  "4.9 ft",
  "5 ft",
  "5.1 ft",
  "5.2 ft",
  "5.3 ft",
  "5.4 ft",
  "5.5 ft",
  "5.6 ft",
  "5.7 ft",
  "5.8 ft",
  "5.9 ft",
  "6 ft",
  "6.1 ft",
  "6.2 ft",
  "6.3 ft",
  "6.4 ft",
  "6.5 ft",
  "6.6 ft",
  "6.7 ft",
  "6.8 ft",
  "6.9 ft",
  "7 ft",
  "7.1 ft",
  "7.2 ft",
  "7.3 ft",
  "7.4 ft",
  "7.5 ft",
  "7.6 ft",
  "7.7 ft",
  "7.8 ft",
  "7.9 ft",
  "8 ft",
];

function HeightScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [selectedHeight, setSelectedHeight] = useState<string>(
    userData?.height || cmHeights[0]
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    height: userData?.hiddenFields?.height || false,
  });
  const [unit, setUnit] = useState<"cm" | "ft">("cm");

  useEffect(() => {
    if (unit === "cm" && !selectedHeight.includes("cm")) {
      setSelectedHeight(cmHeights[0]);
    } else if (unit === "ft" && !selectedHeight.includes("ft")) {
      setSelectedHeight(ftHeights[0]);
    }
  }, [unit]);

  const handleHeightSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Error", "Invalid user ID");
        return;
      }

      await updateUserData({
        hiddenFields: {
          ...userData.hiddenFields,
          height: hiddenFields.height,
        },
        height: selectedHeight,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save height: " + error.message);
    }
  };

  const handleSwipeChange = (index: string) => {
    setSelectedHeight(index);
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  // TODO-FIX: Last two values can't be selected because it does not center them.
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
          const isCurrent = item === selectedHeight;
          const color = isCurrent ? "black" : "gray";
          const opacityValue = isCurrent ? 1 : 0.3;

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
          const offset = event.nativeEvent.contentOffset.y;
          const index = Math.min(Math.round(offset / 40), data.length - 1);
          if (index >= 0 && index < data.length) {
            handleSwipeChange(data[index]);
          }
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={40}
        decelerationRate="fast"
        style={{ height: 200, paddingVertical: 80 }}
      />
    );
  };

  const heightData = unit === "cm" ? cmHeights : ftHeights;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <OnboardingProgressBar currentScreen="HeightScreen" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Stand Tall</Text>
        <View style={styles.unitToggleContainer}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "cm" && styles.selectedUnitButton,
            ]}
            onPress={() => setUnit("cm")}
          >
            <Text style={styles.unitButtonText}>CM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "ft" && styles.selectedUnitButton,
            ]}
            onPress={() => setUnit("ft")}
          >
            <Text style={styles.unitButtonText}>FT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heightInputs}>
          <Text style={styles.subtitle}>What's your height?</Text>
          {renderHeightPicker(heightData)}
        </View>
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide From Others</Text>
          <Checkbox
            value={hiddenFields["height"] || false}
            onValueChange={() => toggleHidden("height")}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.affirmation}>
          Every inch of you is perfectly designed
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
    marginTop: 25,
  },
  backButton: {
    bottom: 20,
  },
  title: {
    fontSize: 45,
    textAlign: "left",
    marginTop: 40,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  unitToggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  unitButton: {
    padding: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  selectedUnitButton: {
    backgroundColor: "lightblue",
  },
  unitButtonText: {
    fontSize: 18,
  },
  heightInputs: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heightValue: {
    fontSize: 30,
    textAlign: "center",
    paddingVertical: 5,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  hiddenContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  hiddenText: {
    fontSize: 16,
    marginRight: 10,
  },
  checkbox: {
    alignSelf: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    width: 20,
    height: 20,
  },
  affirmation: {
    top: 110,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
  },
  nextButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    zIndex: 1,
  },
});

export default HeightScreen;
