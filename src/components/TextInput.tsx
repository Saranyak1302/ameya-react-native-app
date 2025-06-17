// InputField.tsx
import React, {useState} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import {AppColors} from '../theme/AppColors.tsx';
import {screenDimensions} from '../utils/ScreenDimensions.tsx';
import {Icon} from 'react-native-elements';
import GlobalStyles from '../styles/GlobalStyles.tsx';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import {checkIsIpad} from '../screens/movements/mocap/MocapConstants.tsx';
import {getModerateScaleSize} from '../theme/AppFonts.tsx';

// @ts-ignore
const InputField = ({
  label,
  value,
  placeholder,
  onChangeText,
  secureTextEntry = false,
  keyboardType,
  marginTop = moderateScale(10),
  marginBottom = moderateScale(10),
  isEmail = false,
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const isIpad = checkIsIpad();

  const styles = StyleSheet.create({
    input: {
      height: verticalScale(45),
      borderColor: AppColors.textFieldBorderGrey,
      borderWidth: moderateScale(1),
      borderRadius: moderateScale(10),
      paddingHorizontal: moderateScale(10),
      backgroundColor: AppColors.white,
    },
    passwordInputContainer: {
      backgroundColor: AppColors.textFieldBG,
      height: verticalScale(45),
      alignSelf: 'center',
      alignContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      width: '100%',
      borderRadius: moderateScale(10),
      borderColor: AppColors.textFieldBorderGrey,
      borderWidth: moderateScale(1),
      paddingLeft: moderateScale(8),
    },
    imageContainer: {
      height: verticalScale(19),
      width : verticalScale(19)
    },
  });
  return (
    <View
      style={{
        marginTop: marginTop,
        marginBottom: marginBottom,
        width: '100%',
      }}>
      {label && (
        <Text
          maxFontSizeMultiplier={1.4}
          style={[GlobalStyles.labelText, {marginBottom: 16}]}>
          {label}
        </Text>
      )}
      {isEmail ? (
        <View style={[styles.passwordInputContainer, {}]}>
          <Image
            source={require('../../assets/images/email.png')}
            resizeMode="contain"
            style={[styles.imageContainer, {marginStart: moderateScale(5)}]}
          />

          <TextInput
            maxFontSizeMultiplier={1.4}
            style={[
              GlobalStyles.textFieldText,
              {
                borderRadius: 10,
                paddingHorizontal: 10,
                width: screenDimensions.width - moderateScale(90),
                height: verticalScale(45),
              },
            ]}
            onChangeText={onChangeText}
            value={value}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ) : secureTextEntry ? (
        <View style={[styles.passwordInputContainer, {}]}>
          <TextInput
            maxFontSizeMultiplier={1.4}
            style={[
              GlobalStyles.textFieldText,
              {
                borderRadius: 10,
                paddingHorizontal: moderateScale(10),
                backgroundColor: AppColors.textFieldBG,
                width: screenDimensions.width - moderateScale(90),
              },
            ]}
            secureTextEntry={!isPasswordVisible}
            onChangeText={onChangeText}
            value={value}
          />
          <TouchableOpacity
            onPress={() => {
              setPasswordVisible(!isPasswordVisible);
            }}
            style={{marginLeft: moderateScale(10)}}>
            {isPasswordVisible ? (
              <Image
                source={require('../../assets/images/eye.png')}
                resizeMode="contain"
                style={styles.imageContainer}
              />
            ) : (
              <Image
                source={require('../../assets/images/eyeoff.png')}
                resizeMode="contain"
                style={styles.imageContainer}
              />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TextInput
          maxFontSizeMultiplier={1.4}
          style={[styles.input, GlobalStyles.textFieldText]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
        />
      )}
    </View>
  );
};

export default InputField;
