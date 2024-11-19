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

const ConnectScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { dislikeMatch, currentPotentialMatch, loadNextPotentialMatch } =
    useUserContext();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      loadNextPotentialMatch();
      setTimeout(() => setLoading(false), 2000);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          style={styles.loadingIndicator}
          size="large"
          color="#0000ff"
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
        <Link href={"/user/DatingPreferences" as any} style={styles.slider}>
          <Icon name="sliders" size={24} color="black" />
        </Link>

        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text>Age</Text>
          <Icon
            name="chevron-down"
            size={12}
            color="black"
            style={styles.caretIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>Height</Text>
          <Icon
            name="chevron-down"
            size={12}
            color="black"
            style={styles.caretIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>Dating Intentions</Text>
          <Icon
            name="chevron-down"
            size={12}
            color="black"
            style={styles.caretIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>Active Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text>New Here</Text>
        </TouchableOpacity>
        <Link
          href={"/user/DatingPreferences" as any}
          style={(styles.tab, styles.moreTab)}
        >
          <Text>More</Text>
        </Link>
      </ScrollView>

      {/* Main Content: Potential Match */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer} // Move alignment here
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.matchContainer}>
          <PotentialMatch currentPotentialMatch={currentPotentialMatch} />
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
    </View>
  );
};

export default ConnectScreen;
