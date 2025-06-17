// CustomButton.tsx
import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {AppColors} from '../theme/AppColors';
import {screenDimensions} from '../utils/ScreenDimensions.tsx';
import GlobalStyles from '../styles/GlobalStyles.tsx';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import {getModerateScaleSize} from '../theme/AppFonts.tsx';

interface CustomButtonProps {
  onPress?: (value?: any) => void; // Accepts functions with or without parameters.
  title: string;
  style?: ViewStyle;
  btnStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  style,
  btnStyle,
}) => {
  const isIpad = DeviceInfo.isTablet();
  return (
    <TouchableOpacity
      style={[styles.button, style, {height: verticalScale(45)}]}
      onPress={onPress}>
      <Text
        maxFontSizeMultiplier={1.1}
        style={[GlobalStyles.buttonText, btnStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
// @ts-ignore
const CustomButtonWithBorder = ({onPress, title, style}) => {
  const isIpad = DeviceInfo.isTablet();
  return (
    <TouchableOpacity
      style={[styles.buttonBorder, style, {height: verticalScale(45)}]}
      onPress={onPress}>
      <Text maxFontSizeMultiplier={1.1} style={GlobalStyles.borderButtonText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: AppColors.buttonBrightBlue,
    height: getModerateScaleSize(50),
    borderRadius: moderateScale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBorder: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.buttonDarkBlue,
    borderWidth: moderateScale(1),
    height: getModerateScaleSize(50),
    borderRadius: moderateScale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export {CustomButton, CustomButtonWithBorder};
