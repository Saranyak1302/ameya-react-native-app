/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import DeviceInfo from 'react-native-device-info';
import { moderateScale } from 'react-native-size-matters';

interface SlidingContainerProps {
  isVisible: boolean;
  onClose: () => void;
  content: React.ReactNode;
  height?: number;
  bgTransparent?: boolean;
  noHorizontalPadding?: boolean;
}

const SlidingContainer: React.FC<SlidingContainerProps> = ({
  isVisible,
  onClose,
  content,
  height,
  bgTransparent,
  noHorizontalPadding,
}) => {
  const translateY = useRef(
    new Animated.Value(screenDimensions.height),
  ).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isVisible ? 0 : screenDimensions.height,
      duration: 300,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return (
    <Animated.View style={[styles.container, {transform: [{translateY}]}]}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} />
      <View
        style={[
          styles.contentContainer,
          {height: height},
          {backgroundColor: bgTransparent ? 'transparent' : AppColors.white},
          {
            paddingHorizontal: noHorizontalPadding
              ? 0
              : moderateScale(16),
          },
        ]}>
        {content}
      </View>
    </Animated.View>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenDimensions.height,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    flex: 1,
  },
  contentContainer: {
    borderTopLeftRadius: isTablet ? 30 : 20,
    borderTopRightRadius: isTablet ? 30 : 20,
    paddingVertical: moderateScale(25),
  },
});

export default SlidingContainer;
