import React, {useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Example JSON data
const micronutrientData = {
  micronutrients: [
    {
      category: 'Total Fat',
      value: '2 g',
      id: '1',
      subcategories: [
        {name: 'Saturated', value: '1 g', id: '1.1'},
        {name: 'Trans', value: '0 g', id: '1.2'},
      ],
    },
    {
      category: 'Cholesterol',
      value: '0 mg',
      id: '2',
      subcategories: [],
    },
    {
      category: 'Sodium',
      value: '310 mg',
      subcategories: [],
      id: '3',
    },
    {
      category: 'Total Carbohydrate',
      value: '40 g',
      id: '4',
      subcategories: [
        {name: 'Dietary Fiber', value: '3 g', id: '4.1'},
        {name: 'Total Sugar', value: '7 g', id: '4.2'},
      ],
    },
    {
      category: 'Vitamin D',
      value: '2 mcg',
      id: '5',
      subcategories: [],
    },
    {
      category: 'Potassium',
      value: '58 mg',
      id: '6',
      subcategories: [],
    },
    {
      category: 'Calcium',
      value: '58 mg',
      id: '7',
      subcategories: [],
    },
    {
      category: 'Iron',
      value: '2 mg',
      id: '8',
      subcategories: [],
    },
    {
      category: 'Vitamin A',
      value: '0 mcg',
      id: '9',
      subcategories: [],
    },
    {
      category: 'Vitamin C',
      value: '0 mg',
      id: '10',
      subcategories: [],
    },
  ],
};

const MicronutrientsList = ({nutritionData}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  function roundToTwoDecimals(num: number): number {
    return Math.round(num);
  } // State to track expand/collapse of entire content

  // Function to toggle the expand/collapse state of the entire list
  const toggleExpandCollapse = () => {
    setIsExpanded(!isExpanded);
  };
  const getCustomText = item => {
    switch (item.id) {
      case '1':
        return nutritionData?.fat
          ? `${roundToTwoDecimals(nutritionData.fat.value)} ${
              nutritionData.fat.unit
            }`
          : '0 g'; // fat
      case '2':
        return nutritionData?.cholesterol
          ? `${roundToTwoDecimals(nutritionData.cholesterol.value)} ${
              nutritionData.cholesterol.unit
            }`
          : '0 g'; // cholesterol
      case '3':
        return nutritionData?.sodium
          ? `${roundToTwoDecimals(nutritionData.sodium.value)} ${
              nutritionData.sodium.unit
            }`
          : '0 g'; // sodium
      case '4':
        return nutritionData?.carbs
          ? `${roundToTwoDecimals(nutritionData.carbs.value)} ${
              nutritionData.carbs.unit
            }`
          : '0 g'; // carbs
      case '5':
        return nutritionData?.vitaminD
          ? `${roundToTwoDecimals(nutritionData.vitaminD.value)} ${
              nutritionData.vitaminD.unit
            }`
          : '0 g'; // vitaminD
      case '6':
        return nutritionData?.potassium
          ? `${roundToTwoDecimals(nutritionData.potassium.value)} ${
              nutritionData.potassium.unit
            }`
          : '0 g'; // potassium
      case '7':
        return nutritionData?.calcium
          ? `${roundToTwoDecimals(nutritionData.calcium.value)} ${
              nutritionData.calcium.unit
            }`
          : '0 g'; // calcium
      case '8':
        return nutritionData?.iron
          ? `${roundToTwoDecimals(nutritionData.iron.value)} ${
              nutritionData.iron.unit
            }`
          : '0 g'; // iron
      case '9':
        return nutritionData?.vitaminA
          ? `${roundToTwoDecimals(nutritionData.vitaminA.value)} ${
              nutritionData.vitaminA.unit
            }`
          : '0 g'; // vitaminA
      case '10':
        return nutritionData?.vitaminC
          ? `${roundToTwoDecimals(nutritionData.vitaminC.value)} ${
              nutritionData.vitaminC.unit
            }`
          : '0 g'; // vitaminC
      default:
        return `${roundToTwoDecimals(item.value)} ${item.unit}`; // Default behavior
    }
  };
  const getCustomSubText = item => {
    switch (item.id) {
      case '1.1':
        return nutritionData?.polyunsaturatedFat
          ? `${roundToTwoDecimals(nutritionData.polyunsaturatedFat.value)} ${
              nutritionData.polyunsaturatedFat.unit
            }`
          : '0 g'; // Customize for monounsaturatedFat
      case '1.2':
        return nutritionData?.transFat
          ? `${roundToTwoDecimals(nutritionData.transFat.value)} ${
              nutritionData.transFat.unit
            }`
          : '0 g'; // Customize for transFat
      case '4.1':
        return nutritionData?.fibers
          ? `${roundToTwoDecimals(nutritionData.fibers.value)} ${
              nutritionData.fibers.unit
            }`
          : '0 g'; // Customize for transFat
      case '4.2':
        return nutritionData?.sugars
          ? `${roundToTwoDecimals(nutritionData.sugars.value)} ${
              nutritionData.sugars.unit
            }`
          : '0 g'; // Customize for transFat
      default:
        return `${roundToTwoDecimals(item.value)}`; // Default behavior
    }
  };
  return (
    <View style={styles.scrollView}>
      <TouchableOpacity onPress={toggleExpandCollapse} style={styles.header}>
        <Text maxFontSizeMultiplier={1.4} style={styles.headerText}>
          More Nutritional Info
        </Text>
        <Image
          source={
            isExpanded
              ? require('../../assets/images/uparrow.png')
              : require('../../assets/images/downarrow.png')
          }
          tintColor={AppColors.buttonDarkBlue}
          style={styles.arrowImage}
        />
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {micronutrientData.micronutrients.map((item, index) => (
            <View key={index}>
              {/* Main Category */}
              <View style={styles.nutrientRow}>
                <Text maxFontSizeMultiplier={1.4} style={styles.nutrientLabel}>
                  {item.category}
                </Text>
                <Text maxFontSizeMultiplier={1.4} style={styles.nutrientLabel}>
                  {getCustomText(item)}
                </Text>
              </View>

              {/* Subcategories */}
              {item.subcategories.map((sub, subIndex) => (
                <View key={subIndex} style={styles.subNutrientRow}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.subLabel}>
                    {sub.name}
                  </Text>
                  <Text maxFontSizeMultiplier={1.4} style={styles.subLabel}>
                    {getCustomSubText(sub)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    marginTop: moderateScale(25),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(5),
  },
  headerText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.buttonDarkBlue,
    fontFamily: AppFonts.interMedium,
    paddingRight: moderateScale(10),
  },
  contentContainer: {
    padding: moderateScale(10),
    flexGrow: 1,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(8),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: AppColors.textFieldHeading,
    marginTop: moderateScale(15),
  },
  nutrientLabel: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  subNutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(4),
    paddingLeft: moderateScale(15),
    marginTop: moderateScale(10),
  },
  subLabel: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interRegular,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interRegular,
  },

  arrowButton: {
    width: verticalScale(15),
    height: verticalScale(8),
    marginRight: moderateScale(18),
    marginLeft: moderateScale(10),
  },
  arrowImage: {
    width: verticalScale(15),
    height: verticalScale(8),
  },
});

export default MicronutrientsList;
