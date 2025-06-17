import React, { version } from 'react';
import {View, StyleSheet, Image, Text, Dimensions} from 'react-native';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import { moderateScale, verticalScale } from 'react-native-size-matters';

type CheckProgressBarType = {
  currentStep: number;
  totalSteps: number;
};

const CheckProgressBar = ({currentStep, totalSteps}: CheckProgressBarType) => {
  const screenWidth = Dimensions.get('window').width;
  const maxGap = moderateScale(16);
  const minGap = moderateScale(4);
  const stepBaseWidth = moderateScale(16);
  const gap = Math.max(
    minGap,
    Math.min(
      maxGap,
      (screenWidth - totalSteps * stepBaseWidth) / (totalSteps - 1),
    ),
  );

  const renderSteps = () => {
    let steps = [];
    for (let i = 1; i <= totalSteps; i++) {
      steps.push(
        <View
          key={i}
          style={[
            styles.surveyCheckItem,
            i !== totalSteps && {marginRight: gap},
          ]}>
          <Image
            resizeMode="contain"
            source={
              i <= currentStep
                ? require('../../assets/images/checkboxfill.png')
                : require('../../assets/images/checkboxunfill.png')
            }
            style={styles.step}
          />
          <Text maxFontSizeMultiplier={1.2} style={styles.checkText}>
            {i}
          </Text>
        </View>,
      );
    }
    return steps;
  };

  return <View style={styles.progressBar}>{renderSteps()}</View>;
};

const styles = StyleSheet.create({
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  surveyCheckItem: {
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 1,
    gap: moderateScale(3),
  },
  step: {
    height: verticalScale(16),
    width: verticalScale(16),
  },
  checkText: {
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.checkBoxText,
  },
});

export default CheckProgressBar;
