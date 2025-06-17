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
import GlobalStyles from '../styles/GlobalStyles';
import ServingGuide from './ServingGuide';
import {Item} from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import {capitalizeWords} from './CommonFunctions';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

const ServingSizeBottomSheet = ({
  isServingModalVisible,
  onPress,
  onServingGuide,
  isServingGuideVisible,
  onSave,
  // portionSize,
  // setPortionSize,
  // servingSize,
  // setServingSize,
  unit,
  setUnit,
  isFrom,
  servingSizesList,
  isScanned,
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
              <Text maxFontSizeMultiplier={1.5} style={styles.label}>
                Portion Size
              </Text>
              <TextInput
                maxFontSizeMultiplier={1.5}
                style={styles.input}
                placeholder="Enter the number of servings"
                placeholderTextColor={AppColors.textFieldHeading}
                keyboardType="numeric"
                value={
                  portionSize.toString() === '0' ? '' : portionSize.toString()
                }
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
              {/* <TextInput
                maxFontSizeMultiplier={1.5}
                style={styles.input}
                placeholder="Enter the serving size"
                placeholderTextColor={AppColors.textFieldHeading}
                keyboardType="numeric"
                value={
                  servingSize.toString() === '0' ? '' : servingSize.toString()
                }
                onChangeText={setServingSize}
              /> */}
            </View>
            {(servingSizesList &&
              servingSizesList?.length > 0 &&
              servingSizesList[0].unitName != 'string') ||
            isScanned ? (
              <View
  style={
    isTablet
      ? { transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }], marginTop: moderateScale(30), marginHorizontal: moderateScale(80)}
      : {}
  }>
              <Picker
                selectedValue={unit}
                style={styles.picker}
                dropdownIconColor={AppColors.textHeadingBlack}
                onValueChange={itemValue => setUnit(itemValue)}>
                {servingSizesList?.map((item, index) => (
                  <Picker.Item
                    key={index}
                    label={capitalizeWords(item.unitName)}
                    value={item.unitName}
                  />
                ))}
              </Picker>
              </View>
            ) : (
              <Picker
                selectedValue={unit}
                style={styles.picker}
                dropdownIconColor={AppColors.black}
                itemStyle={{ color: AppColors.black }}
                onValueChange={itemValue => setUnit(itemValue)}>
                <Picker.Item label="Bottle" value="Bottle" />
                <Picker.Item label="Box" value="Box" />
                <Picker.Item label="Can" value="Can" />
                <Picker.Item label="Container" value="Container" />
                <Picker.Item label="Cube" value="Cube" />
                <Picker.Item label="Cup" value="Cup" />
                <Picker.Item label="Dessertsspoon" value="Dessertsspoon" />
                <Picker.Item label="Each" value="Each" />
                <Picker.Item label="Gallon" value="Gallon" />
                <Picker.Item label="Grams" value="Grams" />
                <Picker.Item label="Jar" value="Jar" />
                <Picker.Item label="Kilogram" value="Kilogram" />
                <Picker.Item label="Metric Cup" value="Metric Cup" />
                <Picker.Item label="Microgram" value="Microgram" />
                <Picker.Item label="Milligram" value="Milligram" />
                <Picker.Item label="Millilitre" value="Millilitre" />
                <Picker.Item label="Ounce" value="Ounce" />
                <Picker.Item label="Package" value="Package" />
                <Picker.Item label="Piece" value="Piece" />
                <Picker.Item label="Pint" value="Pint" />
                <Picker.Item label="Pot" value="Pot" />
                <Picker.Item label="Pouch" value="Pouch" />
                <Picker.Item label="Pound" value="Pound" />
                <Picker.Item label="Punnet" value="Punnet" />
                <Picker.Item label="Quart" value="Quart" />
                <Picker.Item label="Scoop" value="Scoop" />
                <Picker.Item label="Serving" value="Serving" />
                <Picker.Item label="Slice" value="Slice" />
                <Picker.Item label="Stich" value="Stich" />
                <Picker.Item label="TableSpoon" value="TableSpoon" />
                <Picker.Item label="Tablet" value="Tablet" />
                <Picker.Item label="TeaSpoon" value="TeaSpoon" />
              </Picker>
            )}
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
    color: AppColors.buttonDarkBlue,
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
    height: verticalScale(130),
    borderColor: AppColors.white,
    marginBottom: moderateScale(70),
    paddingHorizontal: moderateScale(15),
    color: AppColors.black
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

export default ServingSizeBottomSheet;
