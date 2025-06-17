import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Image} from 'react-native-elements';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppStrings} from '../utils/Constants';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {AppColors} from '../theme/AppColors';
import {moderateScale, verticalScale} from 'react-native-size-matters';

function ComingSoon() {
  return (
    <View style={styles.comingSoonDetails}>
      <Image
        source={require('../../assets/images/comingsoon.png')}
        style={styles.comingSoonImg}
      />
      <View style={styles.comingSoonText}>
        <Text maxFontSizeMultiplier={1.5} style={styles.comingSoonHeading}>
          {AppStrings.comingSoonHeading}
        </Text>
        <Text maxFontSizeMultiplier={1.3} style={styles.comingSoonDescription}>
          {AppStrings.comingSoonDescription}
        </Text>
      </View>
    </View>
  );
}

export default ComingSoon;

const styles = StyleSheet.create({
  comingSoonDetails: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonImg: {
    width: moderateScale(400),
    height: verticalScale(311),
    objectFit: 'contain',
    marginBottom: moderateScale(32),
  },
  comingSoonText: {
    paddingHorizontal: moderateScale(35),
  },
  comingSoonHeading: {
    fontSize: AppFontSize.intersize20,
    fontWeight: AppWeights.interSemibold,
    //lineHeight: scale(20),
    marginBottom: moderateScale(14),
    fontFamily: AppFonts.interSemibold,
    color: AppColors.buttonDarkBlue,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    //lineHeight: scale(20),
    fontFamily: AppFonts.interMedium,
    color: AppColors.textFieldTextBlack,
    textAlign: 'center',
  },
});
