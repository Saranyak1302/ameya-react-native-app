import React, {useEffect, useState, ReactNode} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
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
import {StorageKeys} from '../utils/StorageKeys';
import {getData} from '../utils/LocalStorage';
import {useSelector} from 'react-redux';
import {MovementResponseModel} from '../models/MovementModel';
import FastImage from 'react-native-fast-image';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import AlertModal from '../components/AlertModal';
import {AlertButtons} from '../types/CommonTypes';
import {navigate, navigateBack} from '../navigators/utils/Utils';
import {NavigatorNames} from '../navigators/tabs/NavigatorsNames';
import DeviceInfo from 'react-native-device-info';
type MovementGeneralInfoProps = {
  isGeneralInfoModalVisible: boolean;
  onPress: () => void;
  onSkip: () => void;
  onInstruction: () => void;
  isLoading: boolean;
};

const MovementGeneralInfo = ({
  isGeneralInfoModalVisible,
  onPress,
  onSkip,
  onInstruction,
  isLoading,
}: MovementGeneralInfoProps) => {
  const [seeMore, setSeeMore] = useState(false);
  const [isSkipEnabled, setSkipEnabled] = useState(false);
  const item: MovementResponseModel = useSelector(
    (state: any) => state.movement.movement,
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState<ReactNode | string>('');
  const [alertButtons, setAlertButtons] = useState<AlertButtons>();

  const onClear = () => {
    setAlertTitle('');
    setAlertMessage('');
    setAlertButtons(undefined);
    setShowAlert(false);
  };
  useEffect(() => {
    const checkFirstVisit = async () => {
      if (item?.movementId && item?.assessmentId && item?.metadataId) {
        const visitedItems = await getData({key: StorageKeys.movSkipList});
        const visited = visitedItems ? JSON.parse(visitedItems) : {};

        if (visited[item.movementId + item.assessmentId + item.metadataId]) {
          setSkipEnabled(true);
        } else {
          setSkipEnabled(false);
        }
      }
    };

    checkFirstVisit();
  }, [item]);

  return (
    <View style={styles.container}>
      <Modal
        isVisible={isGeneralInfoModalVisible}
        onBackdropPress={onPress}
        style={styles.modal}
        propagateSwipe={true}>
        <View style={styles.modalContent}>
          <View style={{height: '89%'}}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={onPress}>
                <Text
                  maxFontSizeMultiplier={1.4}
                  style={styles.HeaderTitleText}>
                  Cancel
                </Text>
              </TouchableOpacity>
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size={'large'} />
                </View>
              )}
              {item?.image && (
                <FastImage
                  source={{
                    uri: item?.image,
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  style={styles.movementImage}
                />
                // <FastImage style={{ width: 200, height: 200, alignSelf: 'center', }} source={{ uri: 'https://d2836w4seyn9qk.cloudfront.net/movementInfo/images/Posture/Posture.gif', priority: FastImage.priority.normal, }} resizeMode={FastImage.resizeMode.contain} />
              )}
              <Text
                maxFontSizeMultiplier={1.4}
                style={styles.movementTitleText}>
                {item?.title}
              </Text>

              {/* {seeMore ? ( */}
              <Text
                maxFontSizeMultiplier={1.4}
                style={[
                  styles.movementDescText,
                  {
                    marginTop: moderateScale(10),
                    // flexDirection: 'flex-start',
                  },
                ]}>
                {item?.description}
              </Text>

              <View style={styles.goalContainer}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={styles.movementSeeMoreText}>
                  Goal:
                </Text>
                <Text maxFontSizeMultiplier={1.3} style={styles.goalText}>
                  {item?.goals.length > 0 && item.goals.join('\n')}
                </Text>
              </View>

              <View style={styles.tagsContainer}>
                {item?.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={[styles.tagWrapper, {backgroundColor: tag.color}]}>
                    <Image
                      source={{
                        uri: tag.icon,
                      }}
                      style={styles.tagIconStyle}
                    />
                    <Text maxFontSizeMultiplier={1.3} style={styles.tag}>
                      {tag.title}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={styles.buttonContainer}>
            {isSkipEnabled && (
              <TouchableOpacity style={styles.skipButton} 
              //onPress={onSkip}
              onPress={() => {
                onClear();
                setAlertTitle('Skip Instructions')
                setAlertMessage(
                  'Are you sure you want to skip?',
                );
                setAlertButtons &&
                  setAlertButtons([
                    {
                      text: 'Yes, Proceed to Recording',
                      onPress: () => {
                        onSkip()
                      },
                    },
                    {
                      text: 'Cancel',
                      onPress: () => {},
                    },
                  ]);
                setShowAlert(true);
              }}>
                <Text maxFontSizeMultiplier={1.3} style={styles.skipButtonText}>
                  Skip
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.instructionsButton,
                !isSkipEnabled && styles.instructionSkipDiabled,
              ]}
              onPress={onInstruction}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={styles.instructionButtonText}>
                Instructions
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {showAlert && (
        <AlertModal
          alertModalVisible={showAlert}
          title={alertTitle}
          message={alertMessage}
          buttons={
            alertButtons && alertButtons.length > 0 ? alertButtons : undefined
          }
          column
          onClose={onClear}
        />
      )}
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
    borderTopLeftRadius: isTablet  ? 30 : 20,
    borderTopRightRadius: isTablet ? 30 : 20,
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(12),
    height: '90%', // Limits height of bottom sheet
  },
  scrollContent: {
    paddingBottom: moderateScale(10),
  },
  HeaderTitleText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.hyperLinkTextColor,
    fontFamily: AppFonts.interMedium,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    marginTop: moderateScale(30),
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'white',
  },
  movementImage: {
    width: screenDimensions.width - moderateScale(20),
    height: verticalScale(195),
    // height: screenDimensions.width / 1.5,
    marginTop: moderateScale(0),
    alignSelf: 'center',
  },
  movementTitleText: {
    fontSize: AppFontSize.intersize28,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
    alignSelf: 'flex-start',
    marginTop: moderateScale(0),
  },
  movementDescText: {
    fontSize: AppFontSize.intersize20,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
  },
  movementSeeMoreText: {
    fontSize: AppFontSize.intersize20,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonDarkBlue,
    fontFamily: AppFonts.interSemibold,
  },
  goalContainer: {
    marginTop: moderateScale(10),
    padding: moderateScale(15),
    backgroundColor: AppColors.lightBlue,
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(10),
  },
  goalText: {
    marginTop: moderateScale(5),
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
  },
  tagWrapper: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    marginRight: moderateScale(10),
    marginBottom: moderateScale(8),
    flexDirection: 'row',
    gap: moderateScale(5),
    alignItems: 'center'
  },
  tag: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.black, // Default text color
    fontFamily: AppFonts.interMedium,
  },
  tagIconStyle: {
    width: verticalScale(20),
    height: verticalScale(20),
  },
  tagsContainer: {
    flexDirection: 'row', // Aligns tags horizontally
    flexWrap: 'wrap', // Allows tags to wrap to the next line if they overflow
    justifyContent: 'flex-start', // Align tags to the start
    marginBottom: moderateScale(0), // Space below the tags section
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(16),
    position: 'absolute',
    bottom: Platform.OS === 'android' ? moderateScale(10) : moderateScale(20),
    alignSelf: 'center',
  },
  skipButton: {
    flex: 1,
    backgroundColor: AppColors.lightBlue,
    borderRadius: moderateScale(45) / 2,
    marginRight: moderateScale(10),
    height: moderateScale(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsButton: {
    flex: 1,
    backgroundColor: AppColors.buttonDarkBlue,
    borderRadius: moderateScale(45) / 2,
    marginLeft: moderateScale(10),
    height: moderateScale(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonDarkBlue,
    fontFamily: AppFonts.interSemibold,
  },
  instructionButtonText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.white,
    fontFamily: AppFonts.interSemibold,
  },
  instructionSkipDiabled: {marginLeft: 0},
});

export default MovementGeneralInfo;
