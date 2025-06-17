import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  LayoutAnimation,
  Alert,
} from 'react-native';
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import {navigate, navigateBack} from '../../navigators/utils/Utils';
import Subtitles from 'react-native-subtitles';
import Video, {BufferingStrategyType, VideoRef} from 'react-native-video';
import {CustomButton} from '../../components/CustomButton';
import {AppFonts, AppFontSize, AppWeights} from '../../theme/AppFonts';
import {ScreenHeight} from 'react-native-elements/dist/helpers';
import BeginTest from '../../components/BeginTest';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames';
import useOnTextChange from '../../hooks/useOnTextChange';
import {StorageKeys} from '../../utils/StorageKeys';
import {getData, storeData} from '../../utils/LocalStorage';
import {useSelector} from 'react-redux';
import {MovementResponseModel} from '../../models/MovementModel';
import AlertModal from '../../components/AlertModal';
import {
  movementJsonData,
  getMovementId,
  MovementTypes,
  findSide,
  requestAndroidPermissionsMocap,
} from './mocap/MocapConstants';
import LottieView from 'lottie-react-native';
import {AppColors} from '../../theme/AppColors';
import {AppContext} from '../../context/AppContextProvider';
import GlobalStyles from '../../styles/GlobalStyles';
import {setTryAgainFalse} from '../../store/slices/tryAgianSlice';
import {useDispatch} from 'react-redux';
import {Camera} from 'react-native-vision-camera';
import ImmersiveMode from 'react-native-immersive-mode';
import {StatusBar} from 'react-native';
import {set} from 'date-fns';
import {Dimensions} from 'react-native';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {AlertButtons} from '../../types/CommonTypes';
import DeviceInfo from 'react-native-device-info';
import SystemNavigationBar from 'react-native-system-navigation-bar';

const SetupVideoInstructions = () => {
  const route = useRoute<any>(); // Access route to fetch params
  const {movement, from} = route.params; // Get video and subtitle URLs from route
  const videoRef = useRef<VideoRef>(null);
  // const movement: MovementResponseModel = useSelector(
  //   (state: any) => state.movement.movement,
  // );

  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('AppContext must be used within an AppProvider');
  }

  const {
    setAlertTitle: setTitle,
    setAlertMessage: setMessage,
    setShowAlert: setAlert,
    clearAlert,
    setAlertButtons: setButtons,
  } = appContext;

  const [isMute, setMute] = useState(false);
  const [pause, setPause] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideoEnded, setVideoEnded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [subtitleHeight, setSubtitleHeight] = useState(0); // Track subtitle container height
  const [beginTestModalVisible, setBeginTestModalVisible] = useState(false);
  const isFromTryAgain = useSelector((state: any) => state.tryAgain.try_again);
  const dispatch = useDispatch();
  const screenHeight = Dimensions.get('screen').height; // Full screen height (includes nav bar)
  const windowHeight = Dimensions.get('window').height; // Visible app height (excludes nav bar)
  const bottomHeight = screenHeight - windowHeight;
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
    if (errorMsg) {
      setShowError(true);
      setTimeout(() => {
        setErrorMsg('');
        setShowError(false);
      }, 3000);
    }
  }, [errorMsg]);
  useEffect(() => {
    if (isFromTryAgain) {
      setBeginTestModalVisible(true);
      setTimeout(() => {
        dispatch(setTryAgainFalse());
      }, 500);
    }
  }, [dispatch, isFromTryAgain]);
  // useEffect(() => {
  //   if (Platform.OS === 'android') {
  //     console.log('android use effect');
  //     setTimeout(() => {
  //       ImmersiveMode.fullLayout(true);
  //     }, 500);
  //   }
  //   return () => {
  //     if (Platform.OS === 'android') {
  //       ImmersiveMode.fullLayout(false);
  //     }
  //   };
  // }, []);
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        SystemNavigationBar.navigationHide();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const onBuffer = (e: any) => {
    setBuffering(e?.isBuffering);
  };

  const onError = (e: any) => {
    setBuffering(false);
    setErrorMsg(e?.error?.errorString);
  };

  const proceedToBegin = async () => {
    //setBeginTestModalVisible(true);
    //show begin test popup or navigate to begin test screen
    setSkipEnable();
    from === 'home'
      ? //setBeginTestModalVisible(true)
        navigate(NavigatorNames.home, {
          setupCompleted: true,
          activeTabRoute: 'today',
        })
      : from === 'beginTest' || from === 'beginTestHome'
      ? setBeginTestModalVisible(true)
      : navigate(NavigatorNames.movementList, {
          isFromTodaysTask: false,
          isFromTodaysItem: {},
          setupCompleted: true,
        });
  };
  const setSkipEnable = async () => {
    try {
      if (
        movement?.movementId &&
        movement?.assessmentId &&
        movement?.metadataId
      ) {
        const visitedItems = await getData({key: StorageKeys.movSkipListSetup});

        if (visitedItems) {
        } else {
          await storeData({
            key: StorageKeys.movSkipListSetup,
            value: JSON.stringify('true'),
          });
        }
      }
    } catch (e) {}
  };

  const onBeginCloseTest = () => {
    setBeginTestModalVisible(!beginTestModalVisible);
  };
  const triggerAnimation = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };
  const handleTextChange = useOnTextChange(triggerAnimation);
  const navigateToMocapView = async () => {
    const movementId = await getMovementId(movement.name, false);
    const side = await findSide(movement.name);
    let frontDeviceIndex = 0;
    if (Platform.OS === 'android') {
      const result = await requestAndroidPermissionsMocap();
      if (!result) {
        console.warn('Permissions denied');
        return;
      }
      if (movementId > 10) {
        if (Platform.OS === 'android') {
          const devices = Camera.getAvailableCameraDevices();
          console.log(`Found ${devices.length} camera devices`);
          frontDeviceIndex = devices.length - 1;
        } else {
          frontDeviceIndex = 0;
        }
      }
      console.log(`Using device index ${frontDeviceIndex}`);
    }
    navigate(NavigatorNames.mocapView, {
      messageToUnity: JSON.stringify({
        id: movementId,
        data: JSON.stringify({
          movement: movementId,
          minimum: movementJsonData[movementId].Minimum,
          maximum: movementJsonData[movementId].Maximum,
          side: side,
          sensor: movementId > 10 ? 0 : 3,
          deviceIndex: frontDeviceIndex,
          // recordDepthData: true,
          videoDuration: movementJsonData[movementId].VideoDuration,
          showRemainingDuration: false,
          smoothing: 0.3,
          brightness: 0.5,
          flipViewHorizontally: movementId > 10 ? true : false,
          showBoundingBox: false,
          hideFaces: true,
          useInitialTimer: movementJsonData[movementId].UseInitialTimer,
          useEnhancedDepth: movementJsonData[movementId].UseEnhancedDepth,
          isCheckPostureFailCondition: false,
          useShouldersGait: movementJsonData[movementId].UseShouldersGait,
          smoothingType: movementJsonData[movementId].SmoothingType,
          videoName: new Date().toISOString(),
          hideUserInterfaceElements: false,
          UseVoiceCommands:
            movementJsonData[movementId].UseVoiceCommands || null,
          uploadData: {
            uploaded: true,
            // text: 'Upload',
          },
        }),
      }),
      isDoctor: false,
      isFromSkip: false,
      movementName: movement.name,
      movementId: movementId,
    });
  };
  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.videoContainer}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => {
            setPause(true);
            videoRef.current?.pause();
            onClear();
            setAlertTitle('Close Setup Instructions');
            setAlertMessage(
              'Are you sure? You want to close the setup instructions?',
            );
            setAlertButtons &&
              setAlertButtons([
                {
                  text: 'Cancel',
                  onPress: () => {
                    setPause(false);
                  },
                },
                {
                  text: 'Yes',
                  onPress: () => {
                    setPause(true);
                    setVideoEnded(false);
                    videoRef.current?.seek(0);
                    if (isVideoEnded) {
                      proceedToBegin();
                    } else {
                      from === 'home'
                        ? navigate(NavigatorNames.home, {
                            setupCompleted: false,
                            activeTabRoute: 'today',
                          })
                        : from === 'beginTest' || from === 'beginTestHome'
                        ? setBeginTestModalVisible(true)
                        : navigate(NavigatorNames.movementList, {
                            isFromTodaysTask: false,
                            isFromTodaysItem: {},
                          });
                    }
                  },
                },
              ]);
            setShowAlert(true);
          }}
          //onPress={navigateBack}
          style={GlobalStyles.videoPlayerbackBtn}>
          <Image
            source={require('../../../assets/images/closewhite.png')}
            style={GlobalStyles.videoPlayerbackImg}
          />
        </TouchableOpacity>

        {/* Video Component */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (pause && !buffering) {
              setPause(false);
              if (isVideoEnded) {
                setVideoEnded(false);
              }
            }
            if (!pause) {
              setPause(true);
              videoRef.current?.pause();
            }
          }}
          style={styles.backgroundVideo}>
          <Video
            source={{uri: movement?.source?.setupVideo}}
            ref={videoRef}
            resizeMode="contain"
            muted={isMute}
            repeat={false}
            ignoreSilentSwitch="ignore"
            hideShutterView
            bufferConfig={{
              minBufferMs: 2500,
              maxBufferMs: 3000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 2500,
            }}
            bufferingStrategy={BufferingStrategyType.DEPENDING_ON_MEMORY}
            onProgress={progress => setCurrentTime(progress.currentTime)}
            paused={pause}
            onBuffer={onBuffer}
            onError={onError}
            onEnd={() => {
              setVideoEnded(true);
              setPause(true);
              videoRef.current?.seek(0);
            }}
            style={styles.backgroundVideo}
          />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.subtitleContainer,
          {
            height:
              Platform.OS === 'android'
                ? bottomHeight > 76
                  ? verticalScale(135)
                  : verticalScale(135)
                : verticalScale(115),
          },
        ]}
        onLayout={event => {
          const {height} = event.nativeEvent.layout;
          setSubtitleHeight(height); // Update subtitle height dynamically
        }}>
        <View style={styles.subtitleSubContainer}>
          <View style={styles.bgWhite}>
            {/* Play Button (Visible only when paused) */}
            {pause && !buffering && (
              <TouchableOpacity
                onPress={() => {
                  setPause(false);
                  if (isVideoEnded) {
                    setVideoEnded(false);
                  }
                }}
                style={[
                  styles.playBtn,
                  {
                    height:
                      (ScreenHeight * moderateScale(90)) / moderateScale(100) -
                      subtitleHeight +
                      moderateScale(50),
                  },
                ]}>
                <Image
                  source={require('../../../assets/images/play.png')}
                  style={styles.playImg}
                />
              </TouchableOpacity>
            )}

            {/* Loader (Visible only when video is buffering) */}
            {buffering && (
              <View
                style={[
                  styles.playBtn,
                  {
                    height:
                      (ScreenHeight * moderateScale(90)) / moderateScale(100) -
                      subtitleHeight +
                      moderateScale(50),
                  },
                ]}>
                <LottieView
                  source={require('../../../assets/lottie/loader.json')} // Update path to your Lottie file
                  style={GlobalStyles.videoPlayeranimation}
                  autoPlay
                  speed={0.8}
                  loop
                />
              </View>
            )}

            {/* Error Text (Visible only when got error) */}
            {showError && (
              <View style={styles.errorBtn}>
                <Text maxFontSizeMultiplier={1.2} style={styles.errorText}>
                  {errorMsg}, try again.
                </Text>
              </View>
            )}

            {/* Pause Button (Visible only when playing) */}
            {!pause && (
              <TouchableOpacity
                onPress={() => {
                  setPause(true);
                  videoRef.current?.pause();
                }}
                style={styles.pauseBtn}>
                <Image
                  source={require('../../../assets/images/pause.png')}
                  style={styles.pauseImg}
                />
              </TouchableOpacity>
            )}

            {/* Mute/Unmute Button */}
            <TouchableOpacity
              onPress={() => setMute(prev => !prev)}
              style={styles.muteBtn}>
              <Image
                source={
                  isMute
                    ? require('../../../assets/images/mute.png')
                    : require('../../../assets/images/unmute.png')
                }
                style={styles.muteImg}
              />
            </TouchableOpacity>
          </View>
          {!isVideoEnded && (
            <Subtitles
              currentTime={currentTime}
              selectedsubtitle={{file: movement?.source?.setupCc}}
              textStyle={styles.subtitleText}
              containerStyle={styles.bgWhite}
              textProps={{maxFontSizeMultiplier: 1.2}}
              onChangeText={text => {
                if (!pause) {
                  handleTextChange(text);
                }
              }}
            />
          )}
          {isVideoEnded && (
            <View style={styles.bottomBtnContainer}>
              <CustomButton
                style={styles.playAgainBtn}
                btnStyle={styles.playAgainTxt}
                onPress={() => {
                  setPause(false);
                  setVideoEnded(false);
                  videoRef.current?.seek(0);
                }}
                title={'Play Again'}
              />
              <CustomButton
                style={styles.continueBtn}
                btnStyle={styles.continueTxt}
                onPress={() => {
                  setPause(true);
                  setVideoEnded(false);
                  videoRef.current?.seek(0);
                  proceedToBegin();
                  console.log(
                    'movement video is',
                    movement?.source?.instructionVideo,
                  );
                }}
                title={from === 'beginTest' || from === 'beginTestHome' ? 'Continue' : 'Continue to Tests'}
              />
            </View>
          )}
        </View>
      </View>
      {beginTestModalVisible && (
        <BeginTest
          beginTestModalVisible={beginTestModalVisible}
          onClose={onBeginCloseTest}
          onBegin={() => {
            setBeginTestModalVisible(false);
            // if (Platform.OS === 'ios') {
            navigateToMocapView();
            // }
          }}
          reviewIns={() => {
            setBeginTestModalVisible(false);
            navigate(NavigatorNames.videoInstructions, {
              movement: movement,
              from: from === "beginTestHome" ? "beginTestHome" : "beginTest",
            });
          }}
          reviewSetup={() => {
            setBeginTestModalVisible(false);
            navigate(NavigatorNames.setupVideoInstructions, {
              movement: movement,
              from: from === "beginTestHome" ? "beginTestHome" : "beginTest",
            });
          }}
          from={from}
        />
      )}
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
    </View>
  );
};

export default SetupVideoInstructions;

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: 'black',
    justifyContent: 'space-between',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  playBtn: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
    zIndex: 1,
  },
  errorBtn: {
    position: 'absolute',
    bottom: moderateScale(90),
    alignSelf: 'center',
    zIndex: 1,
  },
  errorText: {
    color: 'white',
    fontSize: AppFontSize.intersize14,
    textAlign: 'center',
  },
  playImg: {
    width: moderateScale(62),
    height: moderateScale(56),
  },
  pauseBtn: {
    position: 'absolute',
    bottom: moderateScale(30),
    left: moderateScale(20),
    zIndex: 1,
  },
  pauseImg: {
    width: moderateScale(26),
    height: moderateScale(30),
  },
  muteBtn: {
    position: 'absolute',
    bottom: moderateScale(30),
    right: moderateScale(20),
    zIndex: 1,
  },
  muteImg: {
    width: verticalScale(32),
    height: verticalScale(32),
  },
  subtitleContainer: {
    maxHeight: Platform.OS === 'android' ? '50%' : '25%',
    // minHeight: '15%',
    // position: 'absolute',
    width: '100%',
    // bottom: 0,
    // height: Platform.OS === 'android' ? '15%' : 135,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    borderTopRightRadius: isTablet ? 30 : 20,
    borderTopLeftRadius: isTablet ? 30 : 20,
  },
  subtitleSubContainer: {
    borderTopRightRadius: isTablet ? 30 : 20,
    borderTopLeftRadius: isTablet ? 30 : 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(10),
    paddingTop: moderateScale(5),
    padding: undefined,
    width: '100%',
  },
  subtitleText: {
    color: '#333333',
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize28,
    fontWeight: AppWeights.interSemibold,
    backgroundColor: 'white',
    textAlign: 'left',
    alignSelf: 'flex-start',
    paddingHorizontal: moderateScale(10),
    paddingTop: 0,
    textShadowColor: undefined,
    textShadowOffset: undefined,
    textShadowRadius: undefined,
  },
  bottomBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: moderateScale(12),
    marginHorizontal: moderateScale(5),
    marginBottom:
      Platform.OS === 'android' ? moderateScale(100) : moderateScale(20),
    marginTop: moderateScale(40),
    // backgroundColor: 'black'
  },
  playAgainBtn: {flex: 1, backgroundColor: '#DBE7FA'},
  continueBtn: {flex: 1},
  playAgainTxt: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interSemibold,
    color: AppColors.buttonDarkBlue,
    fontWeight: AppWeights.interSemibold,
  },
  continueTxt: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interSemibold,
    fontWeight: AppWeights.interSemibold,
  },
  bgWhite: {backgroundColor: 'white'},
});
