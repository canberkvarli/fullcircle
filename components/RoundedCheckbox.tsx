import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface RoundedCheckboxProps {
  value: boolean;
  onValueChange: () => void;
  size?: number;
  checkmarkSize?: number;
  activeOpacity?: number;
}

const RoundedCheckbox: React.FC<RoundedCheckboxProps> = ({
  value,
  onValueChange,
  size = 24,
  checkmarkSize = 16,
  activeOpacity = 0.7,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = createStyles(colors, size);

  return (
    <TouchableOpacity
      style={[styles.checkbox, value && styles.checkboxChecked]}
      onPress={onValueChange}
      activeOpacity={activeOpacity}
    >
      {value && (
        <Ionicons 
          name="checkmark" 
          size={checkmarkSize} 
          color={colors.background} 
        />
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, size: number) => {
  const borderRadius = size / 2;

  return StyleSheet.create({
    checkbox: {
      width: size,
      height: size,
      borderRadius: borderRadius,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
  });
};

export default RoundedCheckbox;