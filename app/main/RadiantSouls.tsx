import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Link } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import UserCard from "@/components/UserCard";
import LottieView from "lottie-react-native";
import blackCircleAnimation from "../../assets/animations/black-circle.json";

const { width: screenWidth } = Dimensions.get("window");

const RadiantSouls: React.FC = () => {
  const { userData, fetchRadiantSouls, getImageUrl } = useUserContext();
  const [radiantSouls, setRadiantSouls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRadiantSouls = async () => {
      setLoading(true);
      const souls = await fetchRadiantSouls();
      const soulsWithPhotos = await Promise.all(
        souls.map(async (user: any) => {
          if (user.photos && user.photos.length > 0) {
            const urls = await Promise.all(
              user.photos.map((photoPath: string) => getImageUrl(photoPath))
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={blackCircleAnimation}
          autoPlay
          loop
          style={styles.loaderAnimation}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Radiant Souls</Text>
        <Link href="/user/FullCircleSubscription" style={styles.button}>
          <Text style={styles.buttonText}>Request Orbs</Text>
        </Link>
      </View>
      <Text style={styles.subtitle}>Discover the most admired profiles.</Text>

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
              <UserCard user={user} variant="radiant" style={styles.userCard} />
            </Link>
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
    paddingTop: 40,
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
  userCard: {
    marginRight: 16,
  },
  emptyMessage: {
    color: "#D8BFAA",
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE9E3",
  },
  loaderAnimation: {
    width: 120,
    height: 120,
  },
});

export default RadiantSouls;
