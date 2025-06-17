import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import {screenDimensions} from '../utils/ScreenDimensions';
import {Picker} from '@react-native-picker/picker';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import GlobalStyles from '../styles/GlobalStyles.tsx';
import ServingGuide from './ServingGuide';
import {capitalizeWords} from './CommonFunctions';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import App from '../App.tsx';

const IngredientServingSizeBottomSheet = ({
  isServingModalVisible,
  onPress,
  onServingGuide,
  isServingGuideVisible,
  onSave,
  servingSize,
  setServingSize,
  unit,
  setUnit,
  servingSizesList,
}) => {
  return (
    <View style={styles.container}>
      <Modal
        isVisible={isServingModalVisible}
        onBackdropPress={onPress}
        style={styles.modal}
        // swipeDirection="down"
        // onSwipeComplete={onPress}
        propagateSwipe={true}>
        <KeyboardAvoidingView
          style={styles.ServeContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView>
            <TouchableOpacity style={styles.header} onPress={onPress}>
              <Text maxFontSizeMultiplier={1.4} style={styles.closeText}>
                Close
              </Text>
            </TouchableOpacity>

            {/* <View style={styles.inputContainer}>
              <Text maxFontSizeMultiplier={1.5} style={styles.label}>Portion Size</Text>
              <TextInput
              maxFontSizeMultiplier={1.5}
                style={styles.input}
                placeholder="Enter the number of servings"
                placeholderTextColor={AppColors.textFieldHeading}
                keyboardType="numeric"
                value={portionSize}
                onChangeText={setPortionSize}
              />
            </View> */}

            <View style={styles.inputContainer}>
              <View style={styles.row}>
                <Text maxFontSizeMultiplier={1.4} style={styles.label}>
                  Serving Size
                </Text>
                <TouchableOpacity onPress={onServingGuide}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.closeText}>
                    Serving Guide
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                maxFontSizeMultiplier={1.4}
                style={styles.input}
                keyboardType="numeric"
                value={servingSize.toString()}
                onChangeText={setServingSize}
              />
            </View>

            <Picker
              selectedValue={unit}
              style={styles.picker}
              itemStyle={{ color: AppColors.black }}
              dropdownIconColor={AppColors.black}
              onValueChange={itemValue => setUnit(itemValue)}>
              {servingSizesList.map((item, index) => (
                <Picker.Item
                  key={index}
                  label={capitalizeWords(item.unitName)}
                  value={item.unitName}
                />
              ))}
            </Picker>
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={onSave}>
            <Text maxFontSizeMultiplier={1.4} style={GlobalStyles.buttonText}>
              Save
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        <Modal
          isVisible={isServingGuideVisible}
          onBackdropPress={onServingGuide} // Close when backdrop is pressed
          style={[styles.container, {backgroundColor: 'transparent'}]}>
          <ServingGuide onPress={onServingGuide} />
        </Modal>
      </Modal>
    </View>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  modal: {
    justifyContent: 'flex-end', // Align modal to bottom
    margin: 0,
  },
  ServeContainer: {
    justifyContent: 'space-between',
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 30 : 20,
    borderTopRightRadius: isTablet ? 30 : 20,
    marginTop: moderateScale(24),
  },
  header: {
    alignItems: 'flex-end',
    marginTop: moderateScale(25),
    marginRight: moderateScale(15),
  },
  closeText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.buttonTextBlue,
    fontFamily: AppFonts.interMedium,
  },
  inputContainer: {
    marginVertical: moderateScale(20),
    marginHorizontal: moderateScale(15),
  },
  label: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interSemibold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: moderateScale(1),
    borderColor: AppColors.borderGrey,
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonDarkBlue,
    fontFamily: AppFonts.interSemibold,
    marginTop: moderateScale(15),
    height: verticalScale(50),
  },
  picker: {
    height: verticalScale(170),
    borderColor: AppColors.white,
    marginBottom: moderateScale(70),
    paddingHorizontal: moderateScale(15),
    color: AppColors.black,
  },
  button: {
    backgroundColor: AppColors.buttonDarkBlue,
    height: verticalScale(45),
    borderRadius: moderateScale(60),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(30),
    marginHorizontal: moderateScale(15),
  },
});

export default IngredientServingSizeBottomSheet;
