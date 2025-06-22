import { StyleSheet } from "react-native";
import { Colors } from '@/constants/Colors';

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    animation: {
      width: "80%",
      height: "80%",
      opacity: 0.9,
    },
  });
};

export default createStyles;