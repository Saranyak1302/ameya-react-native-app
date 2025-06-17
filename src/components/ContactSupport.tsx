import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AppStrings} from '../utils/Constants.tsx';
import React from 'react';
import {AppColors} from '../theme/AppColors.tsx';
import {screenDimensions} from '../utils/ScreenDimensions.tsx';
import {openComposer} from 'react-native-email-link';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts.tsx';
import { moderateScale } from 'react-native-size-matters';

const ContactSupport = () => {
  const navigateSupport = () => {
    openComposer({
      to: AppStrings.supportEmailID,
      subject: 'I have a question',
      body: 'Hi, can you help me with...',
    }).then(r => {});
  };

  return (
    <View style={styles.supportTextView}>
      <Text maxFontSizeMultiplier={1.5} style={styles.questionText}>
        {AppStrings.havingTrouble}
      </Text>
      <TouchableOpacity onPress={navigateSupport}>
        <Text maxFontSizeMultiplier={1.5} style={styles.hyperlinkText}>
          {AppStrings.supportEmailID}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  supportTextView: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: moderateScale(200),
  },
  hyperlinkText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    color: AppColors.hyperLinkTextColor,
    textDecorationLine: 'underline',
  },
  questionText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interRegular,
    color: AppColors.textFieldHeading,
    fontFamily: AppFonts.interRegular,
  },
});

export default ContactSupport;
