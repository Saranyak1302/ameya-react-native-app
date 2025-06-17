// SignInScreen.tsx
import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import InputField from '../../components/TextInput.tsx';
import {CustomButton} from '../../components/CustomButton.tsx';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {AppColors} from '../../theme/AppColors.tsx';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import {AppStrings} from '../../utils/Constants.tsx';
import Divider from '../../components/Divider.tsx';
import {Checkbox} from 'react-native-paper';
import Header from '../../components/Header.tsx';
import App from '../../App.tsx';
import {navigate} from '../../navigators/utils/Utils.tsx';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames.tsx';
import {AppFonts} from '../../theme/AppFonts.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {pushNotification} from '../../services/authService.ts';

function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = React.useState(false);
  const [isWarning, setIsWarning] = React.useState(false);
  const profileData: ProfileData = useSelector(
    (state: any) => state?.profile?.data,
  );

  const handleSignIn = async () => {
    navigate(NavigatorNames.otpAuth);
  };

  const handleNavForgotPassword = () => {
    navigate(NavigatorNames.forgotPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}>
        <Header
          title={AppStrings.welcomeBackAmeya}
          onBack={null}
          showBackButton={false}
        />
        <View style={styles.subContainer}>
          <View style={styles.paddingContainer}>
            <Text maxFontSizeMultiplier={1.5} style={styles.subHeadingText}>
              {AppStrings.pleaseEnterYourDetails}{' '}
            </Text>

            <Divider marginVertical={12} />
            {isWarning ? (
              <Text maxFontSizeMultiplier={1.5} style={styles.errorText}>
                {AppStrings.invalidEmailPasswordError}
              </Text>
            ) : (
              <></>
            )}
            <InputField
              label="Email Address"
              value={email}
              placeholder="Enter your email"
              onChangeText={setEmail}
              keyboardType="email-address"
              secureTextEntry={false}
              marginTop={12}
            />
            <InputField
              label="Password"
              value={password}
              placeholder="Enter your password"
              onChangeText={setPassword}
              keyboardType="default"
              secureTextEntry={true}
              marginTop={24}
            />
            <View style={styles.rememberMeContainer}>
              <View style={styles.rememberMeSubContainer}>
                <Checkbox.Android
                  background={styles.checkBoxBg}
                  color={AppColors.buttonDarkBlue}
                  uncheckedColor={AppColors.textFieldBorderGrey}
                  status={checked ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setChecked(!checked);
                  }}
                />

                <Text maxFontSizeMultiplier={1.5} style={styles.rememberMeText}>
                  Remember me
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  handleNavForgotPassword();
                }}>
                <Text maxFontSizeMultiplier={1.5} style={styles.forgotPassword}>
                  Forgot password
                </Text>
              </TouchableOpacity>
            </View>
            <CustomButton
              title="Sign In"
              onPress={handleSignIn}
              style={undefined}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.bgLightGrey,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: AppFonts.interSemibold,
    marginHorizontal: 16,
    marginTop: 10,
    color: AppColors.textHeadingBlack,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
    alignItems: 'center',
  },
  rememberMeSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberMeText: {
    color: '#555',
    marginLeft: 10,
  },
  forgotPassword: {
    color: AppColors.hyperLinkTextColor,
    fontWeight: '600',
    fontFamily: AppFonts.interSemibold,
    fontSize: 14,
  },
  subContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 24,
  },
  paddingContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
  },
  subHeadingText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: AppFonts.interSemibold,
    color: AppColors.buttonDarkBlue,
    paddingTop: 32,
  },
  checkBoxBg: {
    borderRadius: 5,
  },
  checkBoxContainer: {
    borderRadius: 12, // Adjust this to your desired radius
    overflow: 'hidden', // Ensures content respects border radius
    padding: 4, // Adjust padding as per design
  },

  errorText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: AppFonts.interMedium,
    color: AppColors.textWaringRed,
    marginVertical: 12,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
});

export default SignInScreen;
