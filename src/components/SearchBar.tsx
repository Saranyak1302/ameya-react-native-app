import React, {useEffect, useRef, useContext} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Linking
} from 'react-native';
import {AppColors} from '../theme/AppColors';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {Text} from 'react-native-elements';
import Voice from '@react-native-voice/voice';
import LottieView from 'lottie-react-native';
import {AppContext} from '../context/AppContextProvider';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import {
  check,
  checkMultiple,
  Permission,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions'

interface SearchBarProps {
  placeholder: string;
  searchText: string;
  setSearchText: any;
  recording: boolean;
  setRecording: any;
  isSearching: boolean;
  setIsSearching: any;
  detectedCandidates: any;
  setDetectedCandidates: any;
  resultHandler: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  searchText,
  setSearchText,
  recording,
  setRecording,
  setIsSearching,
  setDetectedCandidates,
  resultHandler,
}) => {
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
  const typingTimeout = useRef<any>(null);
  useEffect(() => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    if (searchText.length > 0) {
      typingTimeout.current = setTimeout(() => {
        setIsSearching(true);
        resultHandler(searchText);
      }, 1000); // 1 second delay
    } else {
      setDetectedCandidates([]);
    }
    return () => clearTimeout(typingTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const requestMicrophonePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'This app needs access to your microphone to recognize speech.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      } else {
        showPermissionAlert("Microphone");
      }
    } catch (err) {}
  };
  const requestMicrophonePermissioniOS = async () => {

    // let currentPermission = await check(permission)

    // if (
    //   currentPermission === RESULTS.UNAVAILABLE ||
    //   currentPermission === RESULTS.GRANTED
    // )
    //   return currentPermission

    // if (currentPermission === RESULTS.BLOCKED)
    //   showPermissionAlert();

    const permissionResponse = await requestMultiple([PERMISSIONS.IOS.MICROPHONE, PERMISSIONS.IOS.SPEECH_RECOGNITION])

    return permissionResponse
    
}
  const showPermissionAlert = (msg: string) => {
    clearAlert();
    setTitle('Permission Required');
    setMessage(
      msg+' permission was not granted. Please enable it in app settings to continue.',
    );
    setButtons &&
      setButtons([
        {
          text: 'Cancel',
        },
        {
          text: 'Open Settings',
          onPress: openAppSettings,
        },
      ]);
    setAlert(true);
  };

  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      clearAlert();
      setTitle('Error');
      setMessage('Unable to open app settings.');
      setAlert(true);
    });
  };

  // Speech recognition event handlers
  const onSpeechResultsHandler = (event: any) => {
    const text = event.value[0];
    onStopRecord(text);
  };

  const onSpeechErrorHandler = (event: any) => {};
  const checkMicrophone = async () => {
    if (Platform.OS === 'ios') {
      checkMultiple([PERMISSIONS.IOS.MICROPHONE, PERMISSIONS.IOS.SPEECH_RECOGNITION]).then((statuses) => {
      if (
        (statuses[PERMISSIONS.IOS.SPEECH_RECOGNITION] === RESULTS.UNAVAILABLE ||
        statuses[PERMISSIONS.IOS.SPEECH_RECOGNITION] === RESULTS.GRANTED) && 
        (statuses[PERMISSIONS.IOS.MICROPHONE] === RESULTS.UNAVAILABLE ||
        statuses[PERMISSIONS.IOS.MICROPHONE] === RESULTS.GRANTED)
      )
      {
        onStartRecord()
      }
      else{
        if(statuses[PERMISSIONS.IOS.MICROPHONE] === RESULTS.BLOCKED || statuses[PERMISSIONS.IOS.SPEECH_RECOGNITION] === RESULTS.BLOCKED)
        {
          switch (true) {
            case (statuses[PERMISSIONS.IOS.MICROPHONE] === RESULTS.BLOCKED && statuses[PERMISSIONS.IOS.SPEECH_RECOGNITION] === RESULTS.BLOCKED):
              showPermissionAlert("Microphone & Speech recognition");
              break;
          
            case (statuses[PERMISSIONS.IOS.MICROPHONE] === RESULTS.BLOCKED):
              showPermissionAlert("Microphone");
              break;
          
            case (statuses[PERMISSIONS.IOS.SPEECH_RECOGNITION] === RESULTS.BLOCKED):
              showPermissionAlert("Speech recognition");
              break;
          
            default:
              // Handle other cases or do nothing
              break;
          }
        }
        else{
          requestMicrophonePermissioniOS();
        }
        
      }
    });
    }
    else{
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
     result ? onStartRecord() : requestMicrophonePermission();
    }
    
 };
  // Start recording and speech recognition
  const onStartRecord = async () => {
      try {
        setRecording(true);
        await Voice.start('en-US');
      } catch (error) {}
    
  };

  const onStopRecord = async (text: string) => {
    setRecording(false);
    try {
      await Voice.stop();
      resultHandler(text);
      setSearchText(text);
    } catch (error) {}
  };

  useEffect(() => {
    // if (Platform.OS === 'android') {
    //   requestMicrophonePermission();
    // }
    // if (Platform.OS === 'ios') {
    //   requestMicrophonePermissioniOS(PERMISSIONS.IOS.MICROPHONE);
    // }
    Voice.onSpeechResults = onSpeechResultsHandler;
    Voice.onSpeechError = onSpeechErrorHandler;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.searchWrapper}>
      <View style={styles.searchContainer}>
        <View style={styles.searchStartView}>
          <Image
            resizeMode={'contain'}
            source={require('../../assets/images/searchglass.png')}
            style={styles.searchIcon}
          />
          <TextInput
            maxFontSizeMultiplier={1.0}
            style={styles.searchTextFieldText}
            placeholder={placeholder}
            placeholderTextColor={AppColors.textFieldHeading}
            value={searchText}
            onChangeText={item => {
              setSearchText(item);
              // if (item.length > 0 && !isSearching) {
              //   setIsSearching(true);
              //   resultHandler(item);
              // } else {
              //   setDetectedCandidates([]);
              // }
            }}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            recording ? onStopRecord('') : checkMicrophone();
          }}>
          {recording ? (
            <LottieView
              source={require('../../assets/lottie/micloading.json')} // Update path to your Lottie file
              style={styles.micIconExtend}
              autoPlay
              speed={1}
              loop
            />
          ) : (
            <Image
              resizeMode={'contain'}
              source={require('../../assets/images/mic.png')}
              style={styles.micIcon}
            />
          )}
        </TouchableOpacity>
      </View>
      {searchText.length > 0 && (
        <View style={styles.searchCancel}>
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text maxFontSizeMultiplier={1.5} style={styles.cancelText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(48),
    flex: 1,
    gap: moderateScale(14),
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    flex: 1,
    borderWidth: moderateScale(1),
    borderColor: AppColors.borderColor,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(12),
    height: verticalScale(48),
  },
  searchStartView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    width: verticalScale(18),
    height: verticalScale(18),
    marginRight: moderateScale(6),
  },
  searchTextFieldText: {
    flex: 1,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
    paddingVertical: 0,
    //lineHeight: scale(16),
    height: verticalScale(30),
  },
  micIcon: {
    width: verticalScale(18),
    height: verticalScale(18),
  },
  micIconExtend: {
    width: verticalScale(40),
    height: verticalScale(40),
    right: moderateScale(-10),
  },
  searchCancel: {},
  cancelText: {
    color: AppColors.textHeadingBlack,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
  },
});

export default SearchBar;
