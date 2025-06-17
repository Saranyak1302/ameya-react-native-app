import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import GlobalStyles from '../styles/GlobalStyles';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

const MicroNutritionEditValue = ({
  isEditNutritionVisible,
  microNutritionData,
  onPress,
  activeTab,
  setActiveTab,
  onSave,
  onEditValue,
  isFrom,
}) => {
  const [nutritionData, setNutritionData] = useState([]);
  const [nutritionDataBackup, setNutritionDataBackup] = useState([]);

  function roundToTwoDecimals(num: number): number {
    return Math.round(num);
  }

  useEffect(() => {
    if (isEditNutritionVisible) {
      const updatedData = [
        {
          category: 'Calories',
          value: microNutritionData.calories
            ? `${roundToTwoDecimals(microNutritionData.calories.value)}`
            : '0',
          unit: microNutritionData.calories
            ? `${microNutritionData.calories.unit}`
            : 'kCal',
          dataKey: 'calories',
        },
        {
          category: 'Total Fat',
          value: microNutritionData.fat
            ? `${roundToTwoDecimals(microNutritionData.fat.value)}`
            : '0',
          unit: microNutritionData.fat ? `${microNutritionData.fat.unit}` : 'g',
          dataKey: 'fat',
          subcategories: [
            {
              name: 'Saturated',
              value: microNutritionData.polyunsaturatedFat
                ? `${roundToTwoDecimals(
                    microNutritionData.polyunsaturatedFat.value,
                  )}`
                : '0',
              unit: microNutritionData.polyunsaturatedFat
                ? `${microNutritionData.polyunsaturatedFat.unit}`
                : 'g',
              dataKey: 'polyunsaturatedFat',
            },
            {
              name: 'Trans',
              value: microNutritionData.transFat
                ? `${roundToTwoDecimals(microNutritionData.transFat.value)}`
                : '0',
              unit: microNutritionData.transFat
                ? `${microNutritionData.transFat.unit}`
                : 'g',
              dataKey: 'transFat',
            },
          ],
        },
        {
          category: 'Total Carbohydrate',
          value: microNutritionData.carbs
            ? `${roundToTwoDecimals(microNutritionData.carbs.value)}`
            : '0',
          unit: microNutritionData.carbs
            ? `${microNutritionData.carbs.unit}`
            : 'g',
          dataKey: 'carbs',
          subcategories: [
            {
              name: 'Dietary Fiber',
              value: microNutritionData.fibers
                ? `${roundToTwoDecimals(microNutritionData.fibers.value)}`
                : '0',
              unit: microNutritionData.fibers
                ? `${microNutritionData.fibers.unit}`
                : 'g',
              dataKey: 'fibers',
            },
            {
              name: 'Total Sugar',
              value: microNutritionData.sugars
                ? `${roundToTwoDecimals(microNutritionData.sugars.value)}`
                : '0',
              unit: microNutritionData.sugars
                ? `${microNutritionData.sugars.unit}`
                : 'g',
              dataKey: 'sugars',
            },
          ],
        },
        {
          category: 'Protein',
          value: microNutritionData.protein
            ? `${roundToTwoDecimals(microNutritionData.protein.value)}`
            : '0',
          unit: microNutritionData.protein
            ? `${microNutritionData.protein.unit}`
            : 'g',
          dataKey: 'protein',
        },
        {
          category: 'Cholesterol',
          value: microNutritionData.cholesterol
            ? `${roundToTwoDecimals(microNutritionData.cholesterol.value)}`
            : '0',
          unit: microNutritionData.cholesterol
            ? `${microNutritionData.cholesterol.unit}`
            : 'mg',
          dataKey: 'cholesterol',
        },
        {
          category: 'Sodium',
          value: microNutritionData.sodium
            ? `${roundToTwoDecimals(microNutritionData.sodium.value)}`
            : '0',
          unit: microNutritionData.sodium
            ? `${microNutritionData.sodium.unit}`
            : 'mg',
          dataKey: 'sodium',
        },
        {
          category: 'Potassium',
          value: microNutritionData.potassium
            ? `${roundToTwoDecimals(microNutritionData.potassium.value)}`
            : '0',
          unit: microNutritionData.potassium
            ? `${microNutritionData.potassium.unit}`
            : 'mg',
          dataKey: 'potassium',
        },
        {
          category: 'Calcium',
          value: microNutritionData.calcium
            ? `${roundToTwoDecimals(microNutritionData.calcium.value)}`
            : '0',
          unit: microNutritionData.calcium
            ? `${microNutritionData.calcium.unit}`
            : 'mg',
          dataKey: 'calcium',
        },
        {
          category: 'Iron',
          value: microNutritionData.iron
            ? `${roundToTwoDecimals(microNutritionData.iron.value)}`
            : '0',
          unit: microNutritionData.iron
            ? `${microNutritionData.iron.unit}`
            : 'mg',
          dataKey: 'iron',
        },
        {
          category: 'Vitamin A',
          value: microNutritionData.vitaminA
            ? `${roundToTwoDecimals(microNutritionData.vitaminA.value)}`
            : '0',
          unit: microNutritionData.vitaminA
            ? `${microNutritionData.vitaminA.unit}`
            : 'mcg',
          dataKey: 'vitaminA',
        },
        {
          category: 'Vitamin C',
          value: microNutritionData.vitaminC
            ? `${roundToTwoDecimals(microNutritionData.vitaminC.value)}`
            : '0',
          unit: microNutritionData.vitaminC
            ? `${microNutritionData.vitaminC.unit}`
            : 'mg',
          dataKey: 'vitaminC',
        },
        {
          category: 'Vitamin D',
          value: microNutritionData.vitaminD
            ? `${roundToTwoDecimals(microNutritionData.vitaminD.value)}`
            : '0',
          unit: microNutritionData.vitaminD
            ? `${microNutritionData.vitaminD.unit}`
            : 'mcg',
          dataKey: 'vitaminD',
        },
      ];

      setNutritionData(updatedData);
      setNutritionDataBackup(JSON.parse(JSON.stringify(updatedData)));
    }
  }, [microNutritionData, isEditNutritionVisible]);

  const handleInputChange = (value, index, subIndex = null) => {
    const newData = [...nutritionData];
    if (subIndex !== null) {
      newData[index].subcategories[subIndex].value = value;
    } else {
      newData[index].value = value;
    }
    setNutritionData(newData);
    onEditValue(newData);
  };

  const handleClose = () => {
    setNutritionData(JSON.parse(JSON.stringify(nutritionDataBackup)));
    onPress();
  };
  const KeyboardAvoidingViewiOS =
    Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  return (
    <Modal
      isVisible={isEditNutritionVisible}
      onBackdropPress={handleClose}
      //onSwipeComplete={onPress}
      propagateSwipe={true}
      //swipeDirection={'down'}
      style={styles.modal}>
      <KeyboardAvoidingViewiOS
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <View style={styles.headerContainer}>
          <Text maxFontSizeMultiplier={1.3} style={styles.title}>
            Nutrition Facts
          </Text>

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text maxFontSizeMultiplier={1.3} style={styles.closeText}>
              Close
            </Text>
          </TouchableOpacity>
        </View>

        {isFrom === 1 ? (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={activeTab === 1 ? styles.activeTab : styles.inactiveTab}
              onPress={() => setActiveTab(1)}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={
                  activeTab === 1
                    ? styles.tabTextActive
                    : styles.tabTextInactive
                }>
                Per Serving
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={activeTab === 2 ? styles.activeTab : styles.inactiveTab}
              onPress={() => setActiveTab(2)}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={
                  activeTab === 2
                    ? styles.tabTextActive
                    : styles.tabTextInactive
                }>
                Portion Size
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <></>
        )}

        <ScrollView
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}>
          {nutritionData.map((item, index) => (
            <View key={index}>
              <View style={styles.servingContainer}>
                <Text maxFontSizeMultiplier={1.1} style={styles.categoryText}>
                  {item.category}
                </Text>
                <View style={styles.valueContainer}>
                  <TextInput
                    maxFontSizeMultiplier={1.1}
                    style={styles.input}
                    value={item.value}
                    onChangeText={text => handleInputChange(text, index)}
                    keyboardType="numeric"
                  />
                  <Text maxFontSizeMultiplier={1.1} style={styles.unitLabel}>
                    {item.category === 'Calories' ? 'cal' : item.unit}
                  </Text>
                </View>
              </View>
              {item.subcategories &&
                item.subcategories.map((sub, subIndex) => (
                  <View key={subIndex} style={styles.servingContainer}>
                    <Text
                      maxFontSizeMultiplier={1.1}
                      style={styles.subCategoryText}>
                      {sub.name}
                    </Text>
                    <View style={styles.valueContainer}>
                      <TextInput
                        maxFontSizeMultiplier={1.1}
                        style={styles.input}
                        value={sub.value}
                        onChangeText={text =>
                          handleInputChange(text, index, subIndex)
                        }
                        keyboardType="numeric"
                      />
                      <Text
                        maxFontSizeMultiplier={1.1}
                        style={styles.unitLabel}>
                        {sub.unit}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={onSave}>
          <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.buttonText}>
            Save
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingViewiOS>
    </Modal>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 30 : 20,
    borderTopRightRadius: isTablet ? 30 : 20,
    padding: moderateScale(20),
    height: '90%', // Set height to allow scrolling
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(40),
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonTextBlue,
    fontFamily: AppFonts.interSemibold,
    textAlign: 'right',
  },
  title: {
    fontSize: AppFontSize.intersize20,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  button: {
    backgroundColor: AppColors.buttonDarkBlue,
    height: verticalScale(45),
    borderRadius: moderateScale(60),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(25),
    marginTop: moderateScale(15),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: AppColors.bgLightGrey,
    borderRadius: moderateScale(30),
  },
  activeTab: {
    flex: 1,
    backgroundColor: AppColors.buttonDarkBlue,
    padding: moderateScale(10),
    borderRadius: moderateScale(30),
    alignItems: 'center',
    // iOS Shadow
    shadowColor: '#000', // Black shadow
    shadowOffset: {
      width: 0,
      height: 5, // Offset shadow downwards
    },
    shadowOpacity: 0.3, // Transparency of shadow
    shadowRadius: 5, // Blur radius for shadow

    // Android Shadow
    elevation: 8, // Elevation for shadow in Android
  },
  inactiveTab: {
    flex: 1,
    padding: moderateScale(10),
    borderRadius: moderateScale(30),
    alignItems: 'center',
  },
  scrollContentContainer: {
    paddingBottom: moderateScale(10),
  },
  tabTextActive: {
    color: AppColors.white,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize16,
  },
  tabTextInactive: {
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize16,
  },
  servingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: moderateScale(25),
  },
  categoryText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  subCategoryText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldHeading,
    fontFamily: AppFonts.interMedium,
    marginLeft: moderateScale(15),
  },
  valueContainer: {
    borderRadius: moderateScale(9),
    borderWidth: moderateScale(1),
    borderColor: AppColors.borderGrey,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: moderateScale(150),
    height: verticalScale(44),
    padding: moderateScale(5),
  },
  value: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonDarkBlue,
    fontFamily: AppFonts.interSemibold,
    marginLeft: moderateScale(12),
  },
  servings: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.buttonDarkBlue,
    fontFamily: AppFonts.interMedium,
    marginRight: moderateScale(12),
  },
  input: {
    textAlign: 'left',
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    color: AppColors.textHeadingBlack,
    flex: 1,
    height: verticalScale(45),
  },
  unitLabel: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    color: AppColors.unitPlaceholder,
    marginLeft: moderateScale(5),
  },
});

export default MicroNutritionEditValue;
