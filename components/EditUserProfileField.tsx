import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

interface EditUserProfileFieldProps {
  title: string;
  fieldName: string;
  value: string | string[] | number | undefined;
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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const formatValue = (val: string | string[] | number | undefined): string => {
    if (!val) return "Not set";
    
    if (Array.isArray(val)) {
      if (val.length === 0) return "Not set";
      return val.join(", ");
    }
    
    if (typeof val === 'number') {
      if (fieldName === 'height') {
        return `${val} ft`;
      }
      if (fieldName === 'age') {
        return `${val} years old`;
      }
      return val.toString();
    }
    
    return val.toString();
  };

  const styles = createStyles(colors);

  return (
    <TouchableOpacity onPress={onPress} style={styles.rowContainer} activeOpacity={0.7}>
      <View style={styles.rowContent}>
        <View style={styles.rowTextContainer}>
          <Text style={[styles.titleText, fonts.buttonFont, { color: colors.textDark }]}>
            {title}
          </Text>
          <Text style={[styles.valueText, fonts.captionFont, { color: colors.textMuted }]}>
            {formatValue(value)}
          </Text>
        </View>
        
        <View style={styles.rowEnd}>
          <View style={[
            styles.visibilityBadge, 
            { 
              backgroundColor: isVisible ? colors.primary + '15' : colors.textMuted + '15',
              borderColor: isVisible ? colors.primary + '40' : colors.textMuted + '40'
            }
          ]}>
            <Ionicons 
              name={isVisible ? "eye" : "eye-off"} 
              size={12} 
              color={isVisible ? colors.primary : colors.textMuted}
              style={styles.visibilityIcon}
            />
            <Text style={[
              styles.visibilityText, 
              fonts.captionFont,
              { color: isVisible ? colors.primary : colors.textMuted }
            ]}>
              {isVisible ? "Visible" : "Hidden"}
            </Text>
          </View>
          
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={colors.textMuted} 
            style={styles.chevron}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  rowContainer: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  rowContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
  },
  
  rowTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  
  titleText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: 0.3,
  },
  
  valueText: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.3,
  },
  
  rowEnd: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  visibilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  
  visibilityIcon: {
    marginRight: Spacing.xs,
  },
  
  visibilityText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
  },
  
  chevron: {
    opacity: 0.6,
  },
});

export default EditUserProfileField;