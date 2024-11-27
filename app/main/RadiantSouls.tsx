import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import UserCard from "@/components/UserCard";

const RadiantSouls = () => {
  const { userData, fetchRadiantSouls } = useUserContext();
  const [radiantSouls, setRadiantSouls] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadRadiantSouls = async () => {
      const souls = await fetchRadiantSouls();
      setRadiantSouls(souls as React.SetStateAction<never[]>);
    };

    loadRadiantSouls();
  }, [userData.matchPreferences]);

  const navigateToProfile = (user: any) => {
    console.log(`Navigating to profile for user: ${user.firstName}`);
    router.push({
      pathname: `/user/UserShow` as any,
      params: { user: JSON.stringify(user), isFromRadiantSouls: "true" },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Radiant Souls</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log("Request Roses button clicked!")}
        >
          <Text style={styles.buttonText}>Request Roses</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Discover the most admired profiles.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {radiantSouls.length > 0 ? (
          radiantSouls.map((user: any, index: number) => (
            <TouchableOpacity key={user.userId || index}>
              <UserCard
                user={user}
                variant="radiant"
                style={styles.userCard}
                onPress={() => navigateToProfile(user)}
              />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyMessage}>No radiant souls found.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE9E3",
    padding: 16,
    marginTop: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7E7972",
  },
  subtitle: {
    fontSize: 16,
    color: "#7E7972",
    marginBottom: 16,
  },
  userCard: {
    marginRight: 16,
  },
  emptyMessage: {
    color: "#D8BFAA",
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#D8BFAA",
    borderRadius: 24,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default RadiantSouls;
