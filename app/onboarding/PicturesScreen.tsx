// import React, { useState } from "react";
// import {
//   Button,
//   StyleSheet,
//   SafeAreaView,
//   Text,
//   TouchableOpacity,
//   Image,
//   View,
//   Alert,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import * as ImagePicker from "expo-image-picker";
// import DraggableFlatList from "react-native-draggable-flatlist";

// const PicturesScreen = () => {
//   const [pictures, setPictures] = useState<string[]>(Array(6).fill(""));
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const {
//     userId,
//     phoneNumber,
//     email,
//     birthdate,
//     firstName,
//     lastName,
//     gender,
//     sexualOrientation,
//     interestedIn,
//     distancePreference,
//     desiredRelationship,
//     drinkingHabit,
//     smokingHabit,
//     workoutHabit,
//     petHabit,
//     communicationStyle,
//     loveLanguage,
//     educationLevel,
//     zodiacSign,
//     preferences,
//   } = params;

//   const handleAddPicture = async (index: number) => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const newPictures = [...pictures];
//       newPictures[index] = result.uri;
//       setPictures(newPictures);
//     }
//   };

//   const handleNext = async () => {
//     if (pictures.filter((pic) => pic !== "").length < 2) {
//       Alert.alert("Error", "You must upload at least two pictures.");
//       return;
//     }

//     try {
//       const docRef = doc(FIRESTORE, "users", userId);
//       await setDoc(
//         docRef,
//         { pictures: pictures.filter((pic) => pic !== "") },
//         { merge: true }
//       );
//       router.replace({
//         pathname: "onboarding/HomeScreen",
//         params: {
//           userId,
//           phoneNumber,
//           email,
//           birthdate,
//           firstName,
//           lastName,
//           gender,
//           sexualOrientation,
//           interestedIn,
//           distancePreference,
//           desiredRelationship,
//           drinkingHabit,
//           smokingHabit,
//           workoutHabit,
//           petHabit,
//           communicationStyle,
//           loveLanguage,
//           educationLevel,
//           zodiacSign,
//           preferences,
//           pictures: pictures.filter((pic) => pic !== ""),
//         },
//       });
//     } catch (error: any) {
//       Alert.alert("Error", "Failed to save pictures: " + error.message);
//     }
//   };

//   const handleBack = () => {
//     router.replace({
//       pathname: "onboarding/AnythingYouLikeScreen",
//       params: {
//         userId,
//         phoneNumber,
//         email,
//         birthdate,
//         firstName,
//         lastName,
//         gender,
//         sexualOrientation,
//         interestedIn,
//         distancePreference,
//         desiredRelationship,
//         drinkingHabit,
//         smokingHabit,
//         workoutHabit,
//         petHabit,
//         communicationStyle,
//         loveLanguage,
//         educationLevel,
//         zodiacSign,
//         preferences,
//       },
//     });
//   };

//   const renderItem = ({ item, index, drag, isActive }) => (
//     <TouchableOpacity
//       key={index}
//       style={[
//         styles.pictureFrame,
//         isActive ? styles.activeFrame : styles.inactiveFrame,
//       ]}
//       onLongPress={drag}
//       onPress={() => handleAddPicture(index)}
//     >
//       {item ? (
//         <Image source={{ uri: item }} style={styles.picture} />
//       ) : (
//         <Text style={styles.plusSign}>+</Text>
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Upload your pictures</Text>
//       <Text style={styles.subtitle}>
//         You need at least 2 pictures to proceed.
//       </Text>
//       <DraggableFlatList
//         data={pictures}
//         renderItem={renderItem}
//         keyExtractor={(item, index) => `draggable-item-${index}`}
//         onDragEnd={({ data }) => setPictures(data)}
//         horizontal={false}
//         numColumns={3}
//       />
//       <Button
//         title="Next"
//         onPress={handleNext}
//         disabled={pictures.filter((pic) => pic !== "").length < 2}
//       />
//       <Button title="Back" onPress={handleBack} />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     marginVertical: 16,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 16,
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   pictureFrame: {
//     width: 100,
//     height: 100,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     justifyContent: "center",
//     alignItems: "center",
//     margin: 8,
//   },
//   activeFrame: {
//     backgroundColor: "#e0e0e0",
//   },
//   inactiveFrame: {
//     backgroundColor: "#f0f0f0",
//   },
//   picture: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 5,
//   },
//   plusSign: {
//     fontSize: 24,
//     color: "#aaa",
//   },
// });

// export default PicturesScreen;
