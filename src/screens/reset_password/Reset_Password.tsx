import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {
  navigate,
  navigateBackTwoScreens,
} from '../../navigators/utils/Utils.tsx';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames.tsx';
import {AppColors} from '../../theme/AppColors.tsx';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Header from '../../components/Header.tsx';
import {AppStrings} from '../../utils/Constants.tsx';
import InputField from '../../components/TextInput.tsx';
import {CustomButton} from '../../components/CustomButton.tsx';
import App from '../../App.tsx';
import {openComposer} from 'react-native-email-link';
import {AppFonts} from '../../theme/AppFonts.tsx';

function Reset_Password() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSetPassword = () => {
    navigate(NavigatorNames.otpAuth);
  };

  const navigateLogin = () => {
    navigateBackTwoScreens();
  };

  const navigateSupport = () => {
    openComposer({
      to: AppStrings.supportEmailID,
      subject: 'I have a question',
      body: 'Hi, can you help me with...',
    }).then(r => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}>
        <Header
          title={AppStrings.resetPasswordHeading}
          onBack={null}
          showBackButton={true}
        />
        <View style={styles.subContainer}>
          <View style={styles.paddingContainer}>
            <InputField
              label={AppStrings.createNewPassword}
              value={password}
              placeholder=""
              onChangeText={setPassword}
              keyboardType="default"
              secureTextEntry={true}
              marginTop={12}
            />

            <InputField
              label={AppStrings.confirmNewPassword}
              value={confirmPassword}
              placeholder=""
              onChangeText={setConfirmPassword}
              keyboardType="default"
              secureTextEntry={true}
              marginTop={24}
            />

            <CustomButton
              title={AppStrings.setNewPassword}
              onPress={handleSetPassword}
              style={{marginTop: 24}}
            />

            <View style={styles.alreadyTextView}>
              <Text maxFontSizeMultiplier={1.5} style={styles.questionText}>
                {AppStrings.alreadyHaveAnAccount}
              </Text>
              <TouchableOpacity onPress={navigateLogin}>
                <Text maxFontSizeMultiplier={1.5} style={styles.hyperlinkText}>
                  {AppStrings.login}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.supportTextView}>
              <Text maxFontSizeMultiplier={1.5} style={styles.questionText}>
                {AppStrings.havingTrouble}
              </Text>
              <TouchableOpacity onPress={navigateSupport}>
                <Text maxFontSizeMultiplier={1.5} style={styles.hyperlinkText}>
                  {AppStrings.supportEmailID}
                </Text>
              </TouchableOpacity>
            </View>
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
    flexDirection: 'column',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: AppFonts.interSemibold,
    marginHorizontal: 16,
    marginTop: 10,
    color: AppColors.textHeadingBlack,
  },
  subContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 24,
    flexDirection: 'column',
  },
  paddingContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
  },
  subHeadingText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: AppFonts.interSemibold,
    color: AppColors.buttonDarkBlue,
    paddingTop: 32,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  alreadyTextView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  supportTextView: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 200,
  },
  hyperlinkText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: AppFonts.interSemibold,
    color: AppColors.hyperLinkTextColor,
    textDecorationLine: 'underline',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: AppFonts.interRegular,
    color: AppColors.textFieldHeading,
  },
});

export default Reset_Password;
