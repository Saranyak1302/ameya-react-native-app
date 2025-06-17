import React, { version } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import {AppColors} from '../theme/AppColors';
import {screenDimensions} from '../utils/ScreenDimensions';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../theme/AppFonts';
import {CustomButton} from './CustomButton';
import {AppStrings} from '../utils/Constants';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

const SafetyFirst = ({
  isSafetyModalVisible,
  onPress,
  onContinue,
  onCall,
  screenType,
}) => {
  return (
    <View style={styles.container}>
      <Modal
        isVisible={isSafetyModalVisible}
        onBackdropPress={onPress}
        style={styles.modal}
        propagateSwipe={true}>
        <View style={styles.modalContent}>
          <View style={{flex: 1}}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}>
              {screenType === 1 ? (
                <></>
              ) : (
                <TouchableOpacity onPress={onPress}>
                  <Text
                    maxFontSizeMultiplier={1.4}
                    style={styles.HeaderTitleText}>
                    {AppStrings.done}
                  </Text>
                </TouchableOpacity>
              )}

              <View
                style={[
                  styles.iconContainer,
                  {
                    marginTop: screenType === 1 ? 25 : 10,
                  },
                ]}>
                <Image
                  source={require('../../assets/images/safetyfirst.png')}
                  style={screenType === 1 ? styles.icon : styles.safetyicon}
                />
              </View>

              {/* Title */}
              <Text
                maxFontSizeMultiplier={1.4}
                style={[
                  styles.title,
                  {
                    marginBottom: screenType === 1 ? 20 : 10,
                  },
                ]}>
                {screenType === 1 ? 'Safety First!' : 'Safety considerations:'}
              </Text>

              {/* Description */}
              {screenType === 1 ? (
                <Text maxFontSizeMultiplier={1.4} style={styles.description}>
                  Before beginning, please take a moment and review these
                  important safety considerations:
                </Text>
              ) : (
                <></>
              )}

              {/* Safety Tips */}
              <View style={styles.safetyTip}>
                <Image
                  source={require('../../assets/images/safetypain.png')}
                  style={styles.tipIcon}
                />
                <View style={styles.tipTextContainer}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.tipTitle}>
                    If you are experiencing pain or discomfort
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.4}
                    style={styles.tipDescription}>
                    Throughout any movements, pause testing and consult your
                    physician before proceeding.
                  </Text>
                </View>
              </View>

              <View style={styles.safetyTip}>
                <Image
                  source={require('../../assets/images/safetychest.png')}
                  style={styles.tipIcon}
                />
                <View style={styles.tipTextContainer}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.tipTitle}>
                    If you begin to experience new, unusual, or severe symptoms
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.4}
                    style={styles.tipDescription}>
                    Including lightheadedness, shortness of breath, or chest
                    pain, stop movement immediately and consult with a physician
                    before proceeding.
                  </Text>
                </View>
              </View>

              <View style={styles.safetyTip}>
                <Image
                  source={require('../../assets/images/safetymotion.png')}
                  style={styles.tipIcon}
                />
                <View style={styles.tipTextContainer}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.tipTitle}>
                    Perform movement testing
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.4}
                    style={styles.tipDescription}>
                    In an area clear of any tripping hazards or obstacles.
                  </Text>
                </View>
              </View>
              {screenType === 1 ? (
                <></>
              ) : (
                <View style={styles.safetyTip}>
                  <Image
                    source={require('../../assets/images/safetymedical.png')}
                    style={styles.tipIcon}
                  />
                  <View style={styles.tipTextContainer}>
                    <Text maxFontSizeMultiplier={1.4}>
                      <Text maxFontSizeMultiplier={1.4} style={styles.tipTitle}>
                        If you are experiencing a medical emergency,
                      </Text>
                      <Text
                        maxFontSizeMultiplier={1.4}
                        style={styles.tipDescription}>
                        call{' '}
                      </Text>
                      <Text
                        maxFontSizeMultiplier={1.4}
                        style={styles.link}
                        onPress={onCall}>
                        911
                      </Text>
                      <Text
                        maxFontSizeMultiplier={1.4}
                        style={styles.tipDescription}>
                        {' '}
                        immediately.
                      </Text>
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  modal: {
    justifyContent: 'flex-end', // Makes modal appear at the bottom
    margin: 0, // Remove default margin for full width
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 30 : 20,
    borderTopRightRadius: isTablet ? 30 : 20,
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(20),
    height: '90%', // Limits height of bottom sheet
  },
  scrollContent: {
    paddingBottom: moderateScale(10),
  },
  iconContainer: {
    borderRadius: moderateScale(50), // Make the container circular
    padding: moderateScale(10),
    marginBottom: moderateScale(0),
    alignItems: 'center',
    alignSelf: 'center',
  },
  icon: {
    width: verticalScale(56),
    height: verticalScale(56),
  },
  safetyicon: {
    width: verticalScale(64),
    height: verticalScale(64),
  },
  title: {
    fontWeight: AppWeights.interBold,
    fontSize: AppFontSize.intersize26,
    fontFamily: AppFonts.interBold,
    color: AppColors.textHeadingBlack,
    textAlign: 'center',
  },
  description: {
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize18,
    fontFamily: AppFonts.interMedium,
    color: AppColors.textHeadingBlack,
    textAlign: 'center',
    marginBottom: moderateScale(35),
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align icons with the title of each tip
    marginBottom: moderateScale(10),
  },
  tipIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    marginRight: moderateScale(10),
    marginTop: 0, // Align icon with the top of the title
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontWeight: AppWeights.interSemibold,
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interSemibold,
    color: AppColors.headingBlack,
  },
  tipDescription: {
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interMedium,
    color: AppColors.descriptionLightGrey,
  },
  link: {
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interMedium,
    color: AppColors.hyperLinkTextColor,
    textDecorationLine: 'underline',
  },
  HeaderTitleText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.hyperLinkTextColor,
    fontFamily: AppFonts.interMedium,
    alignSelf: 'flex-end',
  },
});

export default SafetyFirst;
