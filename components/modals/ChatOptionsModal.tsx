import React, { useEffect, useRef } from "react";
import {
  Modal,
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const { height: screenHeight } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
  onUnmatch: () => void;
  onReport: () => void;
};

export default function ChatOptionsModal({
  visible,
  onClose,
  onUnmatch,
  onReport,
}: Props) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onUnmatch();
            onClose();
          }}
        >
          <Text style={styles.text}>Unmatch</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, styles.report]}
          onPress={() => {
            onReport();
            onClose();
          }}
        >
          <Text style={[styles.text, styles.reportText]}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={onClose}>
          <Text style={styles.text}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000066",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
  report: {
    borderBottomColor: "transparent",
  },
  reportText: {
    color: "red",
  },
});
