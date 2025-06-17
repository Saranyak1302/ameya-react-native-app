import React, {useRef, useState} from 'react';
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

const GetMoving = ({isGetMovingModalVisible, onPress, onBegin}) => {
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const handleScroll = event => {
    const page = Math.round(
      event.nativeEvent.contentOffset.x / screenDimensions.width,
    );
    setActivePage(page);
  };
  return (
    <View style={styles.container}>
      <Modal
        isVisible={isGetMovingModalVisible}
        onBackdropPress={onPress}
        style={styles.modal}
        propagateSwipe={true}>
        <View style={styles.modalContent}>
          <ScrollView
            horizontal
            pagingEnabled
            ref={scrollRef}
            onScroll={handleScroll}
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            <View style={{height: '85%'}}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                <View style={styles.subContainer}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        marginTop: moderateScale(5),
                      },
                    ]}>
                    <Image
                      source={require('../../assets/images/safetyfirst.png')}
                      style={styles.iconSafety}
                    />
                  </View>

                  {/* Title */}
                  <Text
                    maxFontSizeMultiplier={1.5}
                    style={[
                      styles.title,
                      {
                        marginBottom: moderateScale(0),
                        marginTop: moderateScale(0),
                      },
                    ]}>
                    {'Safety First!'}
                  </Text>

                  {/* Description */}

                  <Text maxFontSizeMultiplier={1.4} style={styles.description}>
                    Before beginning, please take a moment and review these
                    important safety considerations:
                  </Text>

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
                        If you begin to experience new, unusual, or severe
                        symptoms
                      </Text>
                      <Text
                        maxFontSizeMultiplier={1.4}
                        style={styles.tipDescription}>
                        Including lightheadedness, shortness of breath, or chest
                        pain, stop movement immediately and consult with a
                        physician before proceeding.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.safetyTip,{marginBottom: 0}]}>
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
                </View>
              </ScrollView>
            </View>
            <View style={{height: '85%'}}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={false}>
                <View style={styles.subContainer}>
                  <TouchableOpacity onPress={onPress}>
                    <Text
                      maxFontSizeMultiplier={1.4}
                      style={styles.HeaderTitleText}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  {/* Title */}
                  <Text maxFontSizeMultiplier={1.4} style={styles.title}>
                    {"Great, Let's Get Moving!"}
                  </Text>
                  <Text maxFontSizeMultiplier={1.4} style={styles.description}>
                    {
                      'During testing, you can click on the icon to access safety information at any time.'
                    }
                  </Text>
                  <Image
                    source={require('../../assets/images/bigsafetyfirst.png')}
                    style={styles.icon}
                  />
                </View>
              </ScrollView>
            </View>
          </ScrollView>
          <View style={styles.bottomContainer}>
            <View style={styles.pagination}>
              <View
                style={[styles.dot, activePage === 0 && styles.activeDot]}
              />
              <View
                style={[styles.dot, activePage === 1 && styles.activeDot]}
              />
            </View>
            {activePage === 0 ? (
              <CustomButton
                title={'Continue'}
                onPress={() => {
                  setActivePage(1);
                  scrollRef?.current?.scrollTo({
                    x: screenDimensions.width, // Calculate horizontal offset
                    animated: true,
                  });
                }}
                style={undefined}
              />
            ) : (
              <CustomButton
                title={'Begin'}
                onPress={onBegin}
                style={undefined}
              />
            )}
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
    height: '90%', // Limits height of bottom sheet
  },
  scrollContent: {
    flexDirection: 'column',
    alignItems: 'center',
    width: screenDimensions.width - moderateScale(40),
  },
  subContainer: {width: '100%'},
  icon: {
    width: verticalScale(250),
    height: verticalScale(250),
    marginTop: moderateScale(20),
    alignSelf: 'center',
  },
  title: {
    fontWeight: AppWeights.interBold,
    fontSize: AppFontSize.intersize26,
    fontFamily: AppFonts.interBold,
    color: AppColors.textHeadingBlack,
    textAlign: 'center',
    marginTop: moderateScale(40),
  },
  description: {
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize18,
    fontFamily: AppFonts.interMedium,
    color: AppColors.textHeadingBlack,
    textAlign: 'center',
    marginBottom: moderateScale(20),
    marginTop: moderateScale(10),
  },
  HeaderTitleText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.hyperLinkTextColor,
    fontFamily: AppFonts.interMedium,
    alignSelf: 'flex-end',
    marginTop: moderateScale(8)
  },
  bottomContainer: {
    width: '100%',
    position: 'absolute',
    bottom: moderateScale(20),
    alignSelf: 'center',
  },
  pagination: {
    flexDirection: 'row',
    // position: 'absolute',
    marginBottom: moderateScale(10),
    alignSelf: 'center',
  },
  dot: {
    width: verticalScale(10),
    height: verticalScale(10),
    borderRadius: verticalScale(10) / 2,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: AppColors.buttonDarkBlue,
  },
  iconContainer: {
    borderRadius: moderateScale(50), // Make the container circular
    padding: moderateScale(10),
    //marginBottom: moderateScale(8),
    alignItems: 'center',
    alignSelf: 'center',
  },
  iconSafety: {
    width: verticalScale(56),
    height: verticalScale(56),
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align icons with the title of each tip
    marginBottom: moderateScale(8),
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
});

export default GetMoving;
