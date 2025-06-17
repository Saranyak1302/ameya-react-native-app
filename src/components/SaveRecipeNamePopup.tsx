import React, { version } from 'react';
import {View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform} from 'react-native';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {CustomButton} from '../components/CustomButton';
import Modal from 'react-native-modal';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

// @ts-ignore
const SaveRecipeNamePopup = ({
  type,
  visible,
  value,
  onChangeText,
  onPress,
  closeModal,
}) => {
  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onDismiss={closeModal}
      propagateSwipe
      onBackdropPress={closeModal}>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={styles.modalContent}>
          <Text maxFontSizeMultiplier={1.4} style={styles.titleText}>
            Custom Recipe Name
          </Text>
          <Text maxFontSizeMultiplier={1.4} style={styles.message}>
            Give your custom recipe a name that’s distinct.
            <Text
              maxFontSizeMultiplier={1.4}
              style={[styles.message, { color: AppColors.buttonDarkBlue }]}>
              {' '}e.g. Mom’s chocolate chip cookies
            </Text>
          </Text>
          <TextInput
            maxFontSizeMultiplier={1.4}
            style={styles.input}
            placeholder="Enter Custom Recipe Name"
            placeholderTextColor={AppColors.textFieldHeading}
            value={value}
            onChangeText={onChangeText}
          />
          <CustomButton
            title="Save as New Recipe & Log Food"
            onPress={onPress}
            style={undefined}
          />
        </View>
      </KeyboardAvoidingView>   
    </Modal>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center', // Align content to the top
    alignItems: 'center', // Center the content horizontally
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderRadius: moderateScale(8),
    paddingLeft: moderateScale(15),
    paddingRight: moderateScale(15),
    width: isTablet ? '65%' : '98%',
    alignSelf: 'center',
    // // Shadow for iOS
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // // Shadow for Android
    // elevation: 5,
    paddingBottom: moderateScale(20),
  },
  titleText: {
    fontSize: AppFontSize.intersize20,
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    alignSelf: 'center',
    marginTop: moderateScale(25),
    marginBottom: moderateScale(8),
  },
  input: {
    height: verticalScale(50),
    borderColor: AppColors.borderGrey,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(10),
    marginBottom: moderateScale(20),
    marginTop: moderateScale(20),
    color: AppColors.textFieldHeading,
  },
  message: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interRegular,
    fontWeight: AppWeights.interRegular,
    color: '#000000',
    textAlign: 'center',
  },
});

export {SaveRecipeNamePopup};
