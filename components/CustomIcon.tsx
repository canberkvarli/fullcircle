// components/CustomIcon.tsx
import React from 'react';
import { Image, ImageStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CustomIconNames = 
  | 'spiritual-draw' 
  | 'healing-modality'
  | 'practice-meditation'
  | 'chakra-alignment';

type UsedIoniconNames = 
  | 'heart' 
  | 'heart-outline' 
  | 'close' 
  | 'star' 
  | 'person'
  | 'chevron-back'
  | 'chevron-forward';

type IconProps = {
  name: CustomIconNames | UsedIoniconNames;
  size?: number;
  color?: string;
  // Use a more flexible style type
  style?: Pick<ImageStyle & TextStyle, 'margin' | 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight' | 'opacity' | 'transform'>;
};

const iconMap: Record<CustomIconNames, any> = {
  'spiritual-draw': require('../assets/icons/spiritual-draw.png'),
  'healing-modality': require('../assets/icons/healing.png'),
  'practice-meditation': require('../assets/icons/meditation.png'),
  'chakra-alignment': require('../assets/icons/chakra.png'),
};

const customIconNames: CustomIconNames[] = [
  'spiritual-draw',
  'healing-modality', 
  'practice-meditation',
  'chakra-alignment'
];

export const CustomIcon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color, 
  style 
}) => {
  // Common style properties that work for both Image and Text
  const commonStyle = {
    ...style,
  };

  if (customIconNames.includes(name as CustomIconNames)) {
    return (
      <Image 
        source={iconMap[name as CustomIconNames]}
        style={[
          { 
            width: size, 
            height: size,
            ...(color && { tintColor: color })
          },
          commonStyle
        ]}
      />
    );
  }
  
  return (
    <Ionicons 
      name={name as UsedIoniconNames} 
      size={size} 
      color={color} 
      style={commonStyle}
    />
  );
};