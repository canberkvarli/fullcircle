import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

const FilterModal = ({
  visible,
  title,
  description,
  values,
  min,
  max,
  step = 1,
  onValuesChange,
  formattedRange,
  onClose,
  onApply,
  isApplyDisabled,
  styles,
}: {
  visible: boolean;
  title: string;
  description: string;
  values: number[];
  min: number;
  max: number;
  step?: number;
  onValuesChange: (values: number[]) => void;
  formattedRange: string;
  onClose: () => void;
  onApply: () => void;
  isApplyDisabled: boolean;
  styles: {
    modalOverlay: object;
    modalContent: object;
    modalTitle: object;
    subheaderText: object;
    rangeText: object;
    applyButton: object;
    applyButtonDisabled: object;
    applyButtonText: object;
  };
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <GestureHandlerRootView style={styles.modalOverlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.subheaderText}>{description}</Text>
        <MultiSlider
          values={values}
          sliderLength={280}
          min={min}
          max={max}
          step={step}
          onValuesChange={onValuesChange}
        />
        <Text style={styles.rangeText}>{formattedRange}</Text>
        <TouchableOpacity
          onPress={onApply}
          style={[
            styles.applyButton,
            isApplyDisabled && styles.applyButtonDisabled,
          ]}
          disabled={isApplyDisabled}
        >
          <Text style={styles.applyButtonText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  </Modal>
);
export default FilterModal;
