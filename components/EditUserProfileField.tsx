import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // Adjust icon as per the library you're using

interface EditUserProfileFieldProps {
  title: string;
  fieldName: string;
  value: string | string[] | undefined;
  isVisible: boolean;
  onPress: () => void;
}

const EditUserProfileField: React.FC<EditUserProfileFieldProps> = ({
  title,
  fieldName,
  value,
  isVisible,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.rowContainer as any}>
      <View style={styles.rowTextContainer}>
        <Text style={styles.titleText as any}>{title}</Text>
        <Text style={styles.valueText as any}>
          {Array.isArray(value) ? value.join(", ") : value}
        </Text>
      </View>
      <View style={styles.rowEnd as any}>
        <Text style={styles.visibilityText}>
          {isVisible ? "Visible" : "Hidden"}
        </Text>
        <Icon name="chevron-right" size={16} color="gray" />
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  rowTextContainer: {
    flex: 1,
  },
  titleText: {
    fontWeight: "bold",
    textAlign: "left",
  },
  fieldNameText: {
    fontWeight: "bold",
    textAlign: "left",
  },
  valueText: {
    color: "gray",
    textAlign: "left",
  },
  rowEnd: {
    flexDirection: "row",
    alignItems: "center",
  },
  visibilityText: {
    color: "gray",
    marginRight: 5,
  },
};

export default EditUserProfileField;
