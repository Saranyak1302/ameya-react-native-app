import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {AppColors} from '../../theme/AppColors.tsx';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Header from '../../components/Header.tsx';
import {AppStrings} from '../../utils/Constants.tsx';
import InputField from '../../components/TextInput.tsx';
import {CustomButton} from '../../components/CustomButton.tsx';
import {navigate} from '../../navigators/utils/Utils.tsx';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames.tsx';
import {AppFonts} from '../../theme/AppFonts.tsx';

function Forgot_Password() {
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    navigate(NavigatorNames.resetPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}>
        <Header
          title={AppStrings.forgotPasswordHeading}
          onBack={() => {}}
          showBackButton={true}
          varient={'TYPE1'}
        />
        <View style={styles.subContainer}>
          <View style={styles.paddingContainer}>
            <Text maxFontSizeMultiplier={1.4} style={styles.subHeadingText}>
              {AppStrings.forgotPasswordBody}{' '}
            </Text>
            <InputField
              label="Email Address"
              value={email}
              placeholder="Enter your email"
              onChangeText={setEmail}
              keyboardType="email-address"
              secureTextEntry={false}
              marginTop={12}
            />

            <CustomButton
              title={AppStrings.continue}
              onPress={handleContinue}
              style={{marginTop: 24}}
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
});

export default Forgot_Password;
