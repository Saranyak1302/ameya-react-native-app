import {Platform, StyleSheet} from 'react-native';
import {screenDimensions} from '../utils/ScreenDimensions.tsx';
import {AppColors} from '../theme/AppColors.tsx';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts.tsx';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

const GlobalStyles = StyleSheet.create({
  titleHeadingText: {
    fontSize: AppFontSize.intersize24,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
  },
  textFieldHeadingText: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textFieldHeading,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
  },
  textFieldText: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textFieldTextBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
  },
  warningText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textWaringRed,
    marginVertical: moderateScale(12),
    fontFamily: AppFonts.interMedium,
  },
  paddingContainer: {
    // flexDirection: "column",
    // marginHorizontal: 20,
    // alignItems:"center"
  },
  subHeadingText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.lightGrey,
    fontFamily: AppFonts.interMedium,
  },
  labelText: {
    fontSize: AppFontSize.intersize18,
    color: AppColors.headingBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
  },
  hyperlinkText: {
    fontSize: AppFontSize.intersize14,
    fontWeight: AppWeights.interMedium,
    color: AppColors.hyperLinkTextColor,
    textDecorationLine: 'underline',
    fontFamily: AppFonts.interMedium,
  },
  descriptionText: {
    fontSize: AppFontSize.intersize14,
    fontWeight: AppWeights.interMedium,
    color: AppColors.descriptionLightGrey,
    fontFamily: AppFonts.interMedium,
  },
  buttonText: {
    color: AppColors.white,
    fontWeight: AppWeights.interSemibold,
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interSemibold,
  },
  borderButtonText: {
    color: AppColors.buttonDarkBlue,
    fontWeight: AppWeights.interSemibold,
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interSemibold,
  },
  inAppHeading: {
    fontSize: AppFontSize.intersize22,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
  },
  splashLight: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  message: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interRegular,
    marginBottom: moderateScale(20),
    fontWeight: AppWeights.interRegular,
    color: '#000000',
    textAlign: 'center',
  },
  messageBold: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interSemibold,
    fontWeight: AppWeights.interSemibold,
    color: '#000000',
    textAlign: 'center',
  },
  videoPlayerbackBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? verticalScale(30) : verticalScale(20),
    right: 20,
    zIndex: 1,
  },
  videoPlayerbackImg: {
    width: moderateScale(32),
    height: moderateScale(32),
  },
  videoPlayeranimation: {
    width: moderateScale(150),
    height: moderateScale(150),
  },
});

export default GlobalStyles;
