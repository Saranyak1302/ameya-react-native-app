import React, {useContext, useEffect, useRef, useState} from 'react';
import {navigate, navigateBack} from '../../navigators/utils/Utils.tsx';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames.tsx';
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {AppStrings} from '../../utils/Constants.tsx';
import {CustomButton} from '../../components/CustomButton.tsx';
import {AppColors} from '../../theme/AppColors';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import OTPTextView from 'react-native-otp-textinput';
import GlobalStyles from '../../styles/GlobalStyles.tsx';
import {Icon} from 'react-native-elements';
import AmeyaLoader from '../../components/AmeyaLoader.tsx';
import {doAuthenticate, validateOtp} from '../../services/authService.ts';
import {getData, storeData} from '../../utils/LocalStorage.tsx';
import {StorageKeys} from '../../utils/StorageKeys.ts';
import {useDispatch} from 'react-redux';
import {signUpToken} from '../../store/slices/authSlice.ts';
import {jwtDecode} from 'jwt-decode';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../../theme/AppFonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppContext} from '../../context/AppContextProvider.tsx';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import {checkIsIpad} from '../movements/mocap/MocapConstants.tsx';
import DeviceInfo from 'react-native-device-info';

function OtpAuth({route}: any) {
  const [otpInput, setOtpInput] = useState<string>('');
  const input = useRef<OTPTextView>(null);
  const {email} = route.params;
  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState(
    'We are authenticating...',
  );
  const dispatch = useDispatch();

  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('AppContext must be used within an AppProvider');
  }

  const {
    setAlertTitle: setTitle,
    setAlertMessage: setMessage,
    setShowAlert: setAlert,
    setAlertButtons: setButtons,
    clearAlert,
  } = appContext;
  const isIpad = checkIsIpad();
  useEffect(() => {
    clearAlert();
    setTitle('Verification code sent to Your Email');
    setMessage(
      'A Verification code has been sent to your email address!\nPlease check your inbox.',
    );
    setAlert(true);
  }, []);

  // @ts-ignore
  const handleCellTextChange = async (text, i) => {
    if (i === 0 && Clipboard) {
      const clippedText = await Clipboard.getString();
      if (clippedText && clippedText.slice(0, 1) === text) {
        input.current?.setValue(clippedText, true);
      }
    }
  };

  async function decodeAuthToken(token: any): Promise<boolean> {
    try {
      const decoded: any = jwtDecode(token);

      const isFirstTime = decoded.isFirstTime;
      const role = decoded.role;
      if (decoded?.sub) {
        await checkLastSignedInUser(decoded.sub);
      }
      if (isFirstTime && role === AppStrings.participant) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // Kept this for SKIP Logic
  const checkLastSignedInUser = async (userId: string) => {
    try {
      const lastSignedInUser = await getData({key: StorageKeys.lastSignedUser});
      if (lastSignedInUser && userId === lastSignedInUser) {
      } else {
        await AsyncStorage.removeItem(StorageKeys.movSkipList);
        await AsyncStorage.removeItem(StorageKeys.movSkipListSetup);
      }
      await storeData({
        key: StorageKeys.lastSignedUser,
        value: userId,
      });
    } catch (e) {}
  };

  const handleVerify = async () => {
    // Check if the Verification code is filled and is a six-digit number
    if (!otpInput) {
      clearAlert();
      setTitle('Please enter the Verification code.');
      setAlert(true);
      return;
    }

    if (!/^\d{6}$/.test(otpInput)) {
      clearAlert();
      setTitle('Invalid Verification code');
      setMessage('Please enter a valid six-digit Verification code.');
      setAlert(true);
      return;
    }
    setLoading(true);
    setLoaderMessage(AppStrings.validatingOtp);

    try {
      const response = await validateOtp(email, otpInput);

      // Extract access token from the response
      const accessToken = response.accessToken;
      const idToken = response.idToken;

      // Store the access token in AsyncStorage
      await storeData({key: StorageKeys.token, value: accessToken});
      var isCreatedAccount = await decodeAuthToken(idToken);
      const decoded: any = jwtDecode(idToken);
      const role = decoded.role ? decoded.role : 'Admin';
      await storeData({key: StorageKeys.role, value: role});
      if (isCreatedAccount) {
        // navigate(NavigatorNames.accountCreated, {accessToken: accessToken}); // Navigate after successful validation
        dispatch(signUpToken({token: accessToken, role: role}));
      } else {
        // Dispatch the token to Redux store
        //dispatch(signUpToken(accessToken));
        dispatch(signUpToken({token: accessToken, role: role}));
        //Skip logic check
      }

      setLoading(false);
    } catch (err: any) {
      setLoading(false);

      // Handle the error (display alert, etc.)
      clearAlert();
      setTitle('Failed to validate Verification code');
      setMessage(err?.message ?? 'Try again!');
      setAlert(true);
    }
  };

  const handleBackPress = () => {
    navigateBack();
  };

  const handleResendOtp = async () => {
    if (!email) {
      clearAlert();
      setTitle('Email is required to resend Verification code.');
      setAlert(true);
      return;
    }
    setLoading(true);
    setLoaderMessage(AppStrings.pleaseWaitGeneratingOtp);
    try {
      const response = await doAuthenticate(email);

      setLoading(false);
      clearAlert();
      setTitle('Verification code has been resent to your email.');
      setAlert(true);
    } catch (err: any) {
      // Handle the error (display alert, etc.)
      setLoading(false);
      clearAlert();
      setTitle('Failed to resend Verification code');
      setMessage(`Error: ${err?.message} (Code: ${err?.code})`);
      setAlert(true);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: AppColors.white,
      flexDirection: 'column',
    },
    subContainer: {
      flex: 1,
      backgroundColor: AppColors.white,
      borderTopLeftRadius: isIpad ? 24 : 12,
      borderTopRightRadius: isIpad ? 24 : 12,
      marginTop: moderateScale(8),
      flexDirection: 'column',
    },
    paddingContainer: {
      flexDirection: 'column',
      flex: 1,
      paddingHorizontal: moderateScale(16),
    },
    header: {
      flexDirection: 'row',
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'flex-start',
    },
    textInputContainer: {
      borderColor: AppColors.white,
      marginTop: moderateScale(48),
      flex: 1,
      flexDirection: 'row',
      alignSelf: 'center',
    },
    otpInput: {
      borderWidth: moderateScale(1),
      borderRadius: moderateScale(8),
      borderColor: AppColors.textFieldBorderGrey,
      borderBottomWidth: moderateScale(1),
      fontSize: AppFontSize.intersize22,
      fontWeight: AppWeights.interRegular,
      color: AppColors.textHeadingBlack,
      fontFamily: AppFonts.interRegular,
      height: verticalScale(40),
      width: verticalScale(40),
      textAlign: 'center',
      paddingVertical: moderateScale(5), // Helps center text inside box
      includeFontPadding: false, // Ensures text aligns properly
      //textAlignVertical: 'center', // Centers text for Android
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between', // This ensures the image is horizontally centered
      alignItems: 'center', // This vertically centers both items
      height: verticalScale(50), // Set a height for the header if necessary
      position: 'relative',
    },
    backButton: {
      position: 'absolute', // Keeps the back button on the left
      left: 0, // Align to the left
      padding: moderateScale(10), // Adds touchable area
    },
    imageContainer: {
      height: moderateScale(40), // Set an appropriate height for the image
      width: moderateScale(94), // Adjust width according to your image aspect ratio
    },
    codeView: {
      flexDirection: 'row',
      alignSelf: 'center',
      marginTop: moderateScale(44),
      alignItems: 'center',
      paddingHorizontal: moderateScale(16),
    },
    backIcon: {
      width: verticalScale(20),
      height: verticalScale(20),
      objectFit: 'contain',
    },
    backIconWrapper: {
      width: verticalScale(30),
      height: verticalScale(30),
      // display: 'flex',
      // justifyContent: 'center',
      // alignItems: 'center',
      marginLeft: moderateScale(20),
    },
  });
  // @ts-ignore
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backIconWrapper}>
              <Image
                source={require('../../../assets/images/leftarrow.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Image
              source={require('../../../assets/images/ameyalogo.png')}
              resizeMode="contain"
              style={styles.imageContainer}
            />
            <Text maxFontSizeMultiplier={1.4} style={{color: 'white'}}>
              test
            </Text>
          </View>
          <Text
            maxFontSizeMultiplier={1.4}
            style={[
              GlobalStyles.titleHeadingText,
              {
                marginTop: moderateScale(10),
                alignSelf: 'center',
              },
            ]}>
            {AppStrings.verifyYourAccount}
          </Text>
          <View style={styles.subContainer}>
            <View style={styles.paddingContainer}>
              <Text
                maxFontSizeMultiplier={1.4}
                style={[GlobalStyles.subHeadingText, {alignSelf: 'center'}]}>
                {AppStrings.enterSixDigitCode}{' '}
              </Text>
              <Text
                maxFontSizeMultiplier={1.4}
                style={[
                  GlobalStyles.subHeadingText,
                  {paddingTop: 1, alignSelf: 'center'},
                ]}>
                {email}{' '}
              </Text>

              <OTPTextView
                maxFontSizeMultiplier={1.2}
                ref={input}
                containerStyle={styles.textInputContainer}
                handleTextChange={setOtpInput}
                inputCount={6}
                keyboardType="numeric"
                autoFocus={true}
                tintColor={AppColors.hyperLinkTextColor}
                textInputStyle={styles.otpInput}
                handleCellTextChange={handleCellTextChange}
              />

              <View style={styles.codeView}>
                <Text
                  maxFontSizeMultiplier={1.4}
                  style={[
                    GlobalStyles.textFieldText,
                    {
                      fontWeight: AppWeights.interRegular,
                      fontFamily: AppFonts.interRegular,
                    },
                  ]}>
                  {AppStrings.didNotGetCode}
                </Text>
                <TouchableOpacity onPress={handleResendOtp}>
                  <Text
                    maxFontSizeMultiplier={1.4}
                    style={[
                      GlobalStyles.hyperlinkText,
                      {fontSize: AppFontSize.intersize18},
                    ]}>
                    {AppStrings.resendCode}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View
            style={{
              flex: 1,
              paddingHorizontal: moderateScale(18),
              justifyContent: 'flex-end',
              marginBottom: moderateScale(24),
            }}>
            <CustomButton
              title={AppStrings.verify}
              onPress={handleVerify}
              style={{}}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AmeyaLoader visible={loading} message={loaderMessage} />
    </SafeAreaView>
  );
}

export default OtpAuth;
