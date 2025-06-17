// ProgressLoader.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {BlurView} from '@react-native-community/blur';
import {AppColors} from '../theme/AppColors.tsx';
import GlobalStyles from '../styles/GlobalStyles.tsx';
import { AppFontSize } from '../theme/AppFonts.tsx';
import { moderateScale } from 'react-native-size-matters';

// @ts-ignore
const AmeyaLoader = ({visible, message}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.absolute}
        blurType="light"
        blurAmount={3}
        reducedTransparencyFallbackColor="white"
      />
      <LottieView
        source={require('../../assets/lottie/loader.json')} // Update path to your Lottie file
        style={styles.animation}
        autoPlay
        speed={0.8}
        loop
      />
      {message && (
        <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.borderButtonText}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Ensure loader is on top
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  animation: {
    width: '50%',
    height: '20%',
  },
  message: {
    marginTop: moderateScale(20),
    fontSize: AppFontSize.intersize18,
    color: AppColors.buttonDarkBlue, // Adjust color for contrast
    textAlign: 'center',
  },
});

export default AmeyaLoader;
