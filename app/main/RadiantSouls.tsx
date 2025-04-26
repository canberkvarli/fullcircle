import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import UserCard from "@/components/UserCard";

const RadiantSouls = () => {
  const { userData, fetchRadiantSouls, getImageUrl } = useUserContext();
  const [radiantSouls, setRadiantSouls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // USE REDIS CACHE or alternatively use a local cache
    const loadRadiantSouls = async () => {
      setLoading(true);
      const souls = await fetchRadiantSouls();
      // Convert each user's photo storage paths into download URLs
      const soulsWithPhotos = await Promise.all(
        souls.map(async (user: any) => {
          if (user.photos && user.photos.length > 0) {
            const urls = await Promise.all(
              user.photos.map(async (photoPath: string) => {
                const url = await getImageUrl(photoPath);
                return url;
              })
            );
            return { ...user, photos: urls.filter((url) => url !== null) };
          }
          return user;
        })
      );
      setRadiantSouls(soulsWithPhotos);
      setLoading(false);
    };

    loadRadiantSouls();
  }, [userData.matchPreferences, getImageUrl]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Radiant Souls</Text>
        <Link href="/user/FullCircleSubscription" style={styles.button}>
          <Text style={styles.buttonText}>Request Orbs</Text>
        </Link>
      </View>
      <Text style={styles.subtitle}>Discover the most admired profiles.</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#7E7972" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {radiantSouls.length > 0 ? (
            radiantSouls.map((user: any, index: number) => (
              <Link
                key={user.userId || index}
                href={{
                  pathname: "/user/UserShow" as any,
                  params: {
                    user: JSON.stringify(user),
                    isFromRadiantSouls: "true",
                  },
                }}
              >
                <UserCard
                  user={user}
                  variant="radiant"
                  style={styles.userCard}
                />
              </Link>
            ))
          ) : (
            <Text style={styles.emptyMessage}>No radiant souls found.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE9E3",
    padding: 16,
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
