import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Modal from 'react-native-modal';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {AppColors} from '../theme/AppColors';
import { moderateScale } from 'react-native-size-matters';

const NoInternet = () => {
  return (
    <Modal isVisible style={styles.modal}>
      <View style={styles.noInternetContainer}>
        <Image
          style={styles.noInternetImg}
          resizeMode="contain"
          tintColor={AppColors.buttonBrightBlue}
          source={require('../../assets/images/nointernet.png')}
        />
        <View style={styles.textContainer}>
          <Text maxFontSizeMultiplier={1.3} style={styles.noInternet}>
            No Internet Connection
          </Text>
          <Text maxFontSizeMultiplier={1.3} style={styles.noInternetDesc}>
            Check your connection or try again!
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default NoInternet;

const styles = StyleSheet.create({
  modal: {margin: 0},
  noInternetContainer: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(40),
  },
  noInternetImg: {
    width: screenDimensions.width / moderateScale(1.6),
    height: screenDimensions.width / moderateScale(1.6),
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  noInternet: {
    fontFamily: AppFonts.interExtraBold,
    fontWeight: AppWeights.interExtraBold,
    fontSize: AppFontSize.intersize18,
    color: AppColors.black,
  },
  noInternetDesc: {
    fontFamily: AppFonts.interRegular,
    fontWeight: AppWeights.interRegular,
    fontSize: AppFontSize.intersize14,
    color: AppColors.black,
  },
});
