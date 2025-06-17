import {Image, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {AppColors} from '../../theme/AppColors.tsx';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Header from '../../components/Header.tsx';
import {AppStrings} from '../../utils/Constants.tsx';
import OTPTextView from 'react-native-otp-textinput';
import {
  CustomButton,
  CustomButtonWithBorder,
} from '../../components/CustomButton.tsx';
import React, { version } from 'react';
import {navigate} from '../../navigators/utils/Utils.tsx';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames.tsx';
import GlobalStyles from '../../styles/GlobalStyles.tsx';
import {signUpToken} from '../../store/slices/authSlice.ts';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../utils/StorageKeys.ts';
import { moderateScale, verticalScale } from 'react-native-size-matters';

function AccountCreated(props: any) {
  const dispatch = useDispatch();

  async function handleContinue() {
    const token = await AsyncStorage.getItem(StorageKeys.token);
    const role = await AsyncStorage.getItem(StorageKeys.role);
    dispatch(signUpToken({token: token, role: role}));
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}>
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
              textAlign: 'center'
            },
          ]}>
          {AppStrings.accountVerified}
        </Text>
        <Image
          source={require('../../../assets/images/accountverified.png')}
          resizeMode="contain"
          style={styles.successImageContainer}
        />
        <Text
          maxFontSizeMultiplier={1.4}
          style={[
            GlobalStyles.subHeadingText,
            {marginTop: moderateScale(24)},
            {textAlign: 'center'},
          ]}>
          {AppStrings.yourInformationIsEncrypted}
        </Text>

        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            marginBottom: moderateScale(24),
          }}>
          <CustomButton
            title={AppStrings.stepIntoWellness}
            onPress={handleContinue}
          />
        </View>
      </KeyboardAwareScrollView>
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
  successImageContainer: {
    width: verticalScale(125),
    height: verticalScale(125),
    alignSelf: 'center',
    marginTop: moderateScale(48),
  },
  imageContainer: {
    marginTop: 10,
    width: moderateScale(94),
    height: moderateScale(40),
    alignSelf: 'center',
  },
});

export default AccountCreated;
