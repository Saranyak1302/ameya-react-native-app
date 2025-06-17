import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {AppColors} from '../theme/AppColors';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {
  PassioSDK,
  PassioIconView,
  IconSize,
  PassioSearchResult,
  PassioFoodItem,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import {moderateScale, scale} from 'react-native-size-matters';

const NutritionInfo = ({nutritionData, foodData}) => {
  const screenWidth = Dimensions.get('window').width;
  const cardSize = screenWidth / 4 - moderateScale(15);
  function roundToTwoDecimals(num: number): number {
    return Math.round(num);
  }
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.nutritionCard,
          {
            width: cardSize,
            height: cardSize,
            backgroundColor: AppColors.caloriebg,
          },
        ]}>
        <Text maxFontSizeMultiplier={1.1} style={styles.label}>
          Calories
        </Text>
        {/* <Text maxFontSizeMultiplier={1.1} style={styles.value}>
          {nutritionData?.calories
            ? `${roundToTwoDecimals(nutritionData.calories.value)} ${
                nutritionData.calories.unit
              }`
            : '0kCal'}
        </Text> */}
        <Text maxFontSizeMultiplier={1.1} style={styles.value}>
          {nutritionData?.calories?.value
            ? `${roundToTwoDecimals(nutritionData.calories.value)} cal`
            : '0 cal'}
        </Text>
      </View>

      <View
        style={[
          styles.nutritionCard,
          {
            width: cardSize,
            height: cardSize,
            backgroundColor: AppColors.lightPink,
          },
        ]}>
        <Text maxFontSizeMultiplier={1.1} style={styles.label}>
          Protein
        </Text>
        <Text maxFontSizeMultiplier={1.1} style={styles.value}>
          {' '}
          {nutritionData?.protein
            ? `${roundToTwoDecimals(nutritionData.protein.value)} ${
                nutritionData.protein.unit
              }`
            : '0g'}
        </Text>
      </View>

      <View
        style={[
          styles.nutritionCard,
          {
            width: cardSize,
            height: cardSize,
            backgroundColor: AppColors.movementBG,
          },
        ]}>
        <Text maxFontSizeMultiplier={1.1} style={styles.label}>
          Carbs
        </Text>
        <Text maxFontSizeMultiplier={1.1} style={styles.value}>
          {' '}
          {nutritionData?.carbs
            ? `${roundToTwoDecimals(nutritionData.carbs.value)} ${
                nutritionData.carbs.unit
              }`
            : '0g'}
        </Text>
      </View>

      <View
        style={[
          styles.nutritionCard,
          {
            width: cardSize,
            height: cardSize,
            backgroundColor: AppColors.fatbg,
          },
        ]}>
        <Text maxFontSizeMultiplier={1.1} style={styles.label}>
          Fat
        </Text>
        <Text maxFontSizeMultiplier={1.1} style={styles.value}>
          {' '}
          {nutritionData?.fat
            ? `${roundToTwoDecimals(nutritionData.fat.value)} ${
                nutritionData.fat.unit
              }`
            : '0g'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionCard: {
    borderRadius: moderateScale(10),
    borderWidth: moderateScale(1),
    borderColor: AppColors.textFieldBorderGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
  },
  value: {
    marginTop: 5,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
});

export default NutritionInfo;
