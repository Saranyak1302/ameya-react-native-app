import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AppStrings} from '../utils/Constants.tsx';
import React from 'react';
import {AppColors} from '../theme/AppColors.tsx';
import {screenDimensions} from '../utils/ScreenDimensions.tsx';
import GlobalStyles from '../styles/GlobalStyles.tsx';
import {navigate} from '../navigators/utils/Utils.tsx';
import {NavigatorNames} from '../navigators/tabs/NavigatorsNames.tsx';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts.tsx';
import {moderateScale, verticalScale} from 'react-native-size-matters';

const TermsAndConditions = () => {
  const navigateTerms = () => {
    navigate(NavigatorNames.termsOfUse);
  };

  const navigatePrivacy = () => {
    navigate(NavigatorNames.privacyNotice);
  };

  return (
    <View style={styles.supportTextView}>
      <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.descriptionText}>
        {AppStrings.termsTap}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: moderateScale(5),
        }}>
        <TouchableOpacity onPress={navigateTerms}>
          <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.hyperlinkText}>
            {AppStrings.termsOfService}
          </Text>
        </TouchableOpacity>

        <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.descriptionText}>
          {' '}
          and{' '}
        </Text>

        <TouchableOpacity onPress={navigatePrivacy}>
          <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.hyperlinkText}>
            {AppStrings.privacyPolicy}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  supportTextView: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  questionText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interRegular,
    fontFamily: AppFonts.interRegular,
    color: AppColors.textFieldHeading,
  },
});

export default TermsAndConditions;
