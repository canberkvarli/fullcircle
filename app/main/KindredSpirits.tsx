import React, { useState, useEffect } from "react";
import { View, Text, Button, Image, TouchableOpacity } from "react-native";
import { useUserContext } from "@/context/UserContext";
import { doc, getDoc } from "firebase/firestore";
import { FIRESTORE } from "@/services/FirebaseConfig";

const KindredSpirits = () => {
  const { userData } = useUserContext();
  const [likedByUsers, setLikedByUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikedByUsers = async () => {
      if (userData.userId) {
        try {
          const userDocRef = doc(FIRESTORE, "users", userData.userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userDataFromFirestore = userDocSnap.data();
            setLikedByUsers(userDataFromFirestore.likedBy || []);
          }
        } catch (error) {
          console.error("Failed to fetch likedBy users:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLikedByUsers();
  }, [userData.userId]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (likedByUsers.length === 0) {
    return (
      <View>
        <Text>No likes yet--we're here to help</Text>
        <Text>We can get you seen by more daters, sooner.</Text>
        <Button
          title="Boost your profile"
          onPress={() => console.log("Boost clicked")}
        />
        <Button
          title="Upgrade to FullCircle"
          onPress={() => console.log("Upgrade clicked")}
        />
      </View>
    );
  }

  return (
    <View>
      <Text>Likes you</Text>
      {likedByUsers.slice(0, 1).map((userId) => (
        <TouchableOpacity
          key={userId}
          onPress={() => console.log(`View ${userId}'s profile`)}
        >
          <Text>{userId}</Text>
          {/* Replace with actual profile card */}
        </TouchableOpacity>
      ))}
      {userData.fullCircleSubscription === false && likedByUsers.length > 1 && (
        <View>
          <Text>More users liked you...</Text>
          {/* Display blurred out profiles here */}
        </View>
      )}
    </View>
  );
};

export default KindredSpirits;
