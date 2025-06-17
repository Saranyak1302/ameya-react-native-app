import React, {ReactNode, useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import {AppColors} from '../theme/AppColors';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {CustomButton} from './CustomButton';
import {useSelector} from 'react-redux';
import {MovementResponseModel} from '../models/MovementModel';
import {AlertButtons} from '../types/CommonTypes';
import AlertModal from './AlertModal';
import GlobalStyles from '../styles/GlobalStyles';
import {NavigatorNames} from '../navigators/tabs/NavigatorsNames';
import {navigate} from '../navigators/utils/Utils';
import {ScrollView} from 'react-native';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import { VolumeManager, RINGER_MODE, RingerModeType } from 'react-native-volume-manager';

const BeginTest = ({
  beginTestModalVisible,
  onClose,
  onBegin,
  reviewIns,
  reviewSetup,
  from = 'movement',
}) => {
  const movementInfo: MovementResponseModel = useSelector(
    (state: any) => state.movement.movement,
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState<ReactNode | string>('');
  const [alertButtons, setAlertButtons] = useState<AlertButtons>();

  const [ringerMode, setRingerMode] = useState<RingerModeType | undefined>(undefined);
  const [currentVolume, setCurrentVolume] = useState<number | null>(null);

  useEffect(() => {
    

    if (Platform.OS === 'android') {
      
      // Add ringer mode change listener
      const ringerModeListener = VolumeManager.addRingerListener((event) => {
        console.log('Ringer Mode changed:', event.mode);
        setRingerMode(event.mode as unknown as RingerModeType);
      });

      return () => {
        // Clean up the listener on unmount
        ringerModeListener.remove();
      };
    }
  }, []);

  useEffect(() => {
   
    // Add volume change listener
    const volumeListener = VolumeManager.addVolumeListener(({ volume }) => {
      console.log('Volume changed:', volume);
      setCurrentVolume(volume);
    });

    return () => {
      // Clean up the listener on unmount
      volumeListener.remove();
    };
  }, []);


  const onClear = () => {
    setAlertTitle('');
    setAlertMessage('');
    setAlertButtons(undefined);
    setShowAlert(false);
  };

  const renderInstruction = ({item}) => (
    <View style={styles.instructionContainer}>
      <Text maxFontSizeMultiplier={1.3} style={styles.bulletPoint}>
        •
      </Text>
      <Text maxFontSizeMultiplier={1.3} style={styles.instructionText}>
        {item}
      </Text>
    </View>
  );

  return (
    <Modal
      isVisible={beginTestModalVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      propagateSwipe={true}>
      <View style={styles.modalContent}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <TouchableOpacity
            onPress={() => {
              onClear();
              setAlertMessage(
                'This will exit the current assessment. Are you sure you want to exit?',
              );
              setAlertButtons &&
                setAlertButtons([
                  {
                    text: 'No',
                    onPress: () => {},
                  },
                  {
                    text: 'Yes',
                    onPress: () => {
                      onClose && onClose();
                      from === 'home' || from === 'beginTestHome'
                        ? navigate(NavigatorNames.home, {
                            setupCompleted: false,
                            activeTabRoute: 'today',
                          })
                          :
                          navigate(NavigatorNames.movementList, {
                            isFromTodaysTask: false,
                            isFromTodaysItem: {},
                          });
                    },
                  },
                ]);
              setShowAlert(true);
            }}
            style={styles.cancelButton}>
            <Text maxFontSizeMultiplier={1.3} style={styles.cancelText}>
              Cancel
            </Text>
          </TouchableOpacity>

          {/* Title */}
          <Text maxFontSizeMultiplier={1.3} style={styles.title}>
            Ok, It’s Time For The {movementInfo.title}
          </Text>

          {/* Instruction Section */}
          <View style={styles.instructionsBox}>
            <Text style={styles.subTitle}>Quick Reminders:</Text>
            <FlatList
              data={movementInfo?.remainders}
              renderItem={renderInstruction}
              keyExtractor={(item, index) => item + index}
              contentContainerStyle={styles.instructionsList}
            />
          </View>

          {/* Buttons Section */}
          <View>
            <TouchableOpacity style={styles.playButton} onPress={reviewIns}>
              <Image
                source={require('../../assets/images/playicon.png')}
                tintColor={AppColors.buttonDarkBlue}
                style={styles.playIcon}
              />
              <Text maxFontSizeMultiplier={1.3} style={styles.playButtonText}>
                Review Instructions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={reviewSetup}>
              <Image
                source={require('../../assets/images/playicon.png')}
                tintColor={AppColors.buttonDarkBlue}
                style={styles.playIcon}
              />
              <Text maxFontSizeMultiplier={1.3} style={styles.playButtonText}>
                Review Setup
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* Main Action Button */}
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Begin The Test!"
          onPress={async () => {
            onClear();
            // Get latest volume and ringer mode before checking
            const { volume } = await VolumeManager.getVolume();
            const mode = await VolumeManager.getRingerMode();
            setCurrentVolume(volume);
            setRingerMode(mode);
            
            const isRingerModeNormal = mode === RINGER_MODE.normal;
            const isVolumeSufficient = volume >= 0.8;
            
            if (!isRingerModeNormal || !isVolumeSufficient) {
              setAlertTitle('Sound Check');
              setAlertMessage(
                <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.message}>
                  Please turn up your volume and make sure your device is not in
                  silent mode.
                </Text>
              );
              setAlertButtons &&
                setAlertButtons([
                  {
                    text: 'Ok',
                    onPress: async () => {
                      if (Platform.OS === 'android') {
                      // Check volume and ringer mode again when user clicks Ok
                      const { volume: newVolume } = await VolumeManager.getVolume();
                      const newMode = await VolumeManager.getRingerMode();
                      setCurrentVolume(newVolume);
                      setRingerMode(newMode);
                      
                      if (newVolume >= 0.8 && newMode === RINGER_MODE.normal) {
                        setShowAlert(false);
                        onBegin && onBegin();
                      }
                    }
                    else{
                      setShowAlert(true);
                      onBegin && onBegin();}
                    },
                  },
                ]);
              setShowAlert(true);
            } else {
              onBegin && onBegin();
            }
          }}
          style={styles.beginButton}
        />
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
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 30 : 20,
    borderTopRightRadius: isTablet ? 30 : 20,
    padding: moderateScale(20),
    height: '80%',
  },
  cancelButton: {
    alignSelf: 'flex-end',
  },
  cancelText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.hyperLinkTextColor,
    fontFamily: AppFonts.interMedium,
  },
  title: {
    fontWeight: AppWeights.interBold,
    fontSize: AppFontSize.intersize26,
    fontFamily: AppFonts.interBold,
    color: AppColors.textHeadingBlack,
    textAlign: 'center',
    marginTop: moderateScale(30),
  },
  instructionsBox: {
    backgroundColor: AppColors.lightBlue,
    borderRadius: moderateScale(8),
    padding: moderateScale(20),
    marginVertical: moderateScale(20),
    marginTop: moderateScale(30),
  },
  subTitle: {
    fontWeight: AppWeights.interSemibold,
    fontSize: AppFontSize.intersize20,
    fontFamily: AppFonts.interSemibold,
    color: AppColors.buttonDarkBlue,
    marginBottom: moderateScale(10),
  },
  instructionsList: {
    paddingBottom: moderateScale(10),
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: moderateScale(2.5),
  },
  bulletPoint: {
    fontSize: AppFontSize.intersize32,
    marginRight: moderateScale(10),
    color: AppColors.textFieldTextBlack,
  },
  instructionText: {
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize18,
    fontFamily: AppFonts.interMedium,
    color: AppColors.textFieldTextBlack,
    marginRight: moderateScale(15),
    paddingRight: moderateScale(15),
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.lightBlue,
    borderRadius: moderateScale(8),
    padding: moderateScale(20),
    marginVertical: moderateScale(10),
  },
  playIcon: {
    width: verticalScale(20),
    height: verticalScale(20),
    marginRight: moderateScale(10),
  },
  playButtonText: {
    fontWeight: AppWeights.interSemibold,
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interSemibold,
    color: AppColors.buttonDarkBlue,
  },
  buttonContainer: {
    backgroundColor: AppColors.white,
    padding: moderateScale(20),
    paddingBottom: moderateScale(30),
    alignItems: 'flex-end',
    flexDirection: 'column',
  },
  beginButton: {
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingBottom: moderateScale(5),
  },
});

export default BeginTest;
