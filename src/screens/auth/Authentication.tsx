import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
} from 'react-native';
import {AppColors} from '../../theme/AppColors.tsx';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import React, {useContext, useState} from 'react';
import GlobalStyles from '../../styles/GlobalStyles.tsx';
import {AppStrings} from '../../utils/Constants.tsx';
import InputField from '../../components/TextInput.tsx';
import TermsAndConditions from '../../components/TermsAndConditions.tsx';
import {CustomButton} from '../../components/CustomButton.tsx';
import {doAuthenticate} from '../../services/authService.ts';
import {navigate} from '../../navigators/utils/Utils.tsx';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames.tsx';
import {validateEmail} from '../../utils/AppValidations.ts';
import AmeyaLoader from '../../components/AmeyaLoader.tsx';
import {AppContext} from '../../context/AppContextProvider.tsx';
import {Error as ErrorType} from '../../types/CommonTypes.tsx';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../../theme/AppFonts';
import DeviceInfo from 'react-native-device-info';

function Authentication() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState(
    'We are authenticating...',
  );

  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('AppContext must be used within an AppProvider');
  }
  const {setAlertTitle, setShowAlert, setAlertMessage} = appContext;

  async function handleContinue() {
    const normalizedEmail = email.toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      setAlertTitle(
        email?.length === 0
          ? 'Please enter an email address '
          : 'Please enter a valid email address',
      );
      setShowAlert(true);
      return;
    }
    setLoading(true);
    setLoaderMessage(AppStrings.verifyingYourCredentials);
    try {
      const response = await doAuthenticate(normalizedEmail);
      setLoading(false);
      navigate(NavigatorNames.otpAuth, {email: normalizedEmail});
    } catch (err) {
      setLoading(false);
      setAlertTitle('Email not found.');
      setAlertMessage(
        <Text maxFontSizeMultiplier={1.0} style={styles.message}>
          Re-enter your email and try again (or) contact
          <Text
            style={{color: '#007AFF'}}
            onPress={() => Linking.openURL('mailto:support@ameya.ca')}>
            {' support@ameya.ca'}
          </Text>
        </Text>,
      );
      setShowAlert(true);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Add KeyboardAvoidingView for iOS */}
      <KeyboardAvoidingView
        behavior='padding'
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled" // Helps to move content up
        >
          <Image
            source={require('../../../assets/images/ameyalogo.png')}
            resizeMode="contain"
            style={styles.imageContainer}
          />

          <Text
            maxFontSizeMultiplier={1.4}
            style={[
              GlobalStyles.titleHeadingText,
              {
                marginTop: moderateScale(24),
                alignSelf: 'center',
              },
            ]}>
            {AppStrings.welcomeToAmeya}
          </Text>

          <Text
            maxFontSizeMultiplier={1.4}
            style={[
              GlobalStyles.subHeadingText,
              {marginTop: moderateScale(6), textAlign: 'center'},
            ]}>
            {AppStrings.enterYourEmailAddressToBeginTheProcess}
          </Text>

          <InputField
            label={AppStrings.emailAddress}
            value={email}
            placeholder=""
            onChangeText={setEmail}
            keyboardType="email-address"
            isEmail={true}
            marginTop={moderateScale(48)}
          />

          <View
            style={{
              paddingHorizontal: moderateScale(20),
              flex: 1,
              justifyContent: 'flex-end',
            }}>
            <TermsAndConditions />
          </View>

          {/* Ensure button is positioned correctly */}
          
        </ScrollView>
        <View style={{marginBottom: moderateScale(24), paddingHorizontal: moderateScale(20)}}>
            <CustomButton
              title={AppStrings.continue}
              onPress={handleContinue}
              style={{marginTop: moderateScale(24)}}
            />
          </View>
      </KeyboardAvoidingView>

      <AmeyaLoader visible={loading} message={loaderMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: moderateScale(20),
  },
  imageContainer: {
    marginTop: moderateScale(10),
    width: moderateScale(194),
    height: verticalScale(40),
    alignSelf: 'center',
    // backgroundColor: AppColors.black,
  },
  message: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interRegular,
    marginBottom: moderateScale(20),
    fontWeight: AppWeights.interRegular,
    color: '#000000',
    textAlign: 'center',
    flexDirection: 'row',
  },
});

export default Authentication;
