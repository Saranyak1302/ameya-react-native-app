import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {CustomButton} from './CustomButton';
import {screenDimensions} from '../utils/ScreenDimensions';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// @ts-ignore
const NewFoodPopup = ({visible, value, onChangeText, onPress, closeModal}) => {
  return (
    <View style={styles.container}>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        style={{backgroundColor: 'white'}}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text maxFontSizeMultiplier={1.4} style={styles.titleText}>
                  Create New Food
                </Text>
                <TextInput
                  maxFontSizeMultiplier={1.4}
                  style={styles.input}
                  placeholder="Food Name, Brand Name"
                  placeholderTextColor={AppColors.textFieldHeading}
                  value={value}
                  onChangeText={onChangeText} // Update the state with the entered text
                />
                <CustomButton
                  title="Create Food"
                  onPress={onPress}
                  style={undefined}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderRadius: moderateScale(8),
    paddingLeft: moderateScale(15),
    paddingRight: moderateScale(15),
    paddingBottom: moderateScale(24),
    width: screenDimensions.width - moderateScale(80),
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
  },
  titleText: {
    fontSize: AppFontSize.intersize20,
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    alignSelf: 'center',
    marginTop: moderateScale(25),
  },
  input: {
    height: verticalScale(50),
    borderColor: AppColors.borderGrey,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(10),
    marginBottom: moderateScale(15),
    marginTop: moderateScale(20),
    color: AppColors.textFieldHeading,
  },
  lineContainer: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Align vertically centered
    marginVertical: moderateScale(20), // Add space between the elements vertically
  },
  line: {
    flex: 1,
    height: verticalScale(1),
    backgroundColor: AppColors.textFieldBorderGrey,
  },
  text: {
    marginHorizontal: moderateScale(10),
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interMedium,
    color: AppColors.textFieldHeading,
  },
  card: {
    flexDirection: 'row', // Arrange items horizontally
    padding: moderateScale(10),
    marginBottom: moderateScale(10),
    backgroundColor: AppColors.bgLightGrey,
    borderRadius: moderateScale(8),
    alignItems: 'center', // Center content vertically relative to image
  },
  image: {
    width: verticalScale(40), // Image width
    height: verticalScale(40), // Image height
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: moderateScale(15),
    paddingRight: moderateScale(10),
  },
  title: {
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    color: AppColors.textHeadingBlack,
    fontSize: AppFontSize.intersize16,
    marginBottom: moderateScale(5), // Space between title and description
  },
  description: {
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    color: AppColors.textFieldHeading,
    fontSize: AppFontSize.intersize14,
  },
});

export {NewFoodPopup};
