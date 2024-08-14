import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const BackButton = ({ onPress }: any) => {
  return (
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
      <Icon name="chevron-left" size={24} color="black" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    bottom: 20,
  },
});

export default BackButton;
