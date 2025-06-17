import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from 'react';
import {StyleSheet, TouchableOpacity, View, Alert} from 'react-native';
import {Image, Text} from 'react-native-elements';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import {AppStrings} from '../../../utils/Constants';
import {AppColors} from '../../../theme/AppColors';
import {screenDimensions} from '../../../utils/ScreenDimensions';
import {AppFonts, AppFontSize, AppWeights} from '../../../theme/AppFonts.tsx';
import {ScrollView} from 'react-native-gesture-handler';
import NutritionInfo from '../../../components/NutritionInfo.tsx';
import MicronutrientsList from '../../../components/MicroNutritionList.tsx';
import {CustomButton} from '../../../components/CustomButton.tsx';
import {
  formatToTwoDecimals,
  navigate,
  navigateBack,
  navigateBackTwoScreens,
} from '../../../navigators/utils/Utils';
import {
  addIngredients,
  updateIngredient,
  addToppings,
  updateToppings,
} from '../../../store/slices/selectedFoodSlice';
import {useDispatch, useSelector} from 'react-redux';
import {
  PassioFoodItem,
  PassioIngredient,
  UnitMass,
  PassioSDK,
  PassioIconView,
  IconSize,
  PassioNutrients,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import {FoodItemModel} from '../../../models/FoodJournalModel';
import {NavigatorNames} from '../../../navigators/tabs/NavigatorsNames';
import IngredientServingSizeBottomSheet from '../../../components/IngredientServingSizeBottomSheet';
import MicroNutritionEditValue from '../../../components/MicroNutritionEditValue';
import {useFocusEffect} from '@react-navigation/native';
import {capitalizeWords} from '../../../components/CommonFunctions';
import {removeLastItemFromServingSizes} from './nutritionContants';
import {AppContext} from '../../../context/AppContextProvider.tsx';
import AlertModal from '../../../components/AlertModal';
import {setIngredientEditTrue} from '../../../store/slices/ingredientsEditSlice';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import { toTitleCase } from '../../../utils/Helper.tsx';
const IngredientDetails = ({route}) => {
  const dispatch = useDispatch();
  const [nutrientsData, setNutrientsData] = useState(
    route.params.nutrientsData,
  );
  const [passioFoodData, setPassioFoodData] = useState(
    route.params.passioFoodData,
  );
  const {isFromEdit, isFrom} = route.params;
  const [isServingModalVisible, setServingModalVisible] = useState(false);
  const [servingSize, setServingSize] = useState();
  const [unit, setUnit] = useState('');
  const [isServingGuideVisible, setServingGuideVisible] = useState(false);
  const [isValuesSet, setIsValuesset] = useState(false);
  const [isEditNutritionVisible, setEditNutritionVisible] = useState(false);
  const [MicroNutritionData, setMicroNutritionData] = useState();
  const [editNutritionAlert, setEditNutritionAlert] = useState(false);
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('AppContext must be used within an AppProvider');
  }

  const {
    setAlertTitle: setTitle,
    setAlertMessage: setMessage,
    setShowAlert: setAlert,
    setAlertButtons: setButtons,
    clearAlert,
  } = appContext;

  function handleServingSizeClose() {
    setServingModalVisible(!isServingModalVisible);
  }
  function handleServingGuide() {
    setServingGuideVisible(!isServingGuideVisible);
  }
  useEffect(() => {
    setPassioFoodData(passioFoodData);
    setServingSize(passioFoodData.amount.selectedQuantity);
    setUnit(passioFoodData.amount.selectedUnit);
    setIsValuesset(true);
  }, []);
  useFocusEffect(useCallback(() => {}, []));

  function roundToTwoDecimals(num: number): number {
    return Math.round(num);
  }

  function handleSaveServingSize() {
    if (servingSize === '' || servingSize === '0') {
      setIsValuesset(false);
      clearAlert();
      setTitle('Please enter Serving Size');
      setButtons &&
        setButtons([
          {
            text: 'Ok',
            onPress: () => {
              setIsValuesset(true);
            },
          },
        ]);
      setAlert(true);
    } else {
      setServingModalVisible(!isServingModalVisible);
      const updatedFoodItem = updateSelectedAmountandUnitWeight(
        passioFoodData,
        servingSize,
        unit,
      );

      setPassioFoodData(updatedFoodItem);
      getNutritionsselectedUnit(updatedFoodItem);
    }
  }
  const getSources = array => {
    const uniqueSources = [...new Set(array.map(item => item.source?.toLowerCase()))];
  
    if (uniqueSources.includes('fdc') || uniqueSources.includes('firebase')) {
      return 'USDA';
    }
  
    if (uniqueSources.includes('openfood')) {
      return 'Open Food Facts';
    }
  
    return 'Internal Database';
  };

  const assignMicroNutritionData = async nutritionData => {
    const microNutritionData = nutritionData;
    const updatedData = microNutritionData
      ? [
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
            unit: microNutritionData.fat
              ? `${microNutritionData.fat.unit}`
              : 'g',
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
        ]
      : [];

    setMicroNutritionData(updatedData);
  };

  const getNutritionsselectedUnit = async (PassioFoodData: PassioFoodItem) => {
    try {
      const passioFoodItemNutrions =
        await PassioSDK.getNutrientsSelectedSizeOfPassioFoodItem(
          PassioFoodData,
        );
      const weightForSelectedUnit =
        PassioFoodData.amount.servingUnits?.find(
          i => i.unitName === PassioFoodData.amount.selectedUnit,
        )?.value ?? 1;
      const scaledNutritionData = calculaterNutientsAsperWeightAndServingUnit(
        passioFoodItemNutrions,
        PassioFoodData.amount.weightGrams,
        weightForSelectedUnit * PassioFoodData.amount.selectedQuantity,
      );

      const updatednutrientsData = multiplyNutritionValuesWithPortionSize(
        scaledNutritionData,
        PassioFoodData.amount.weight.unit === 'Servings'
          ? PassioFoodData.amount.weight.value
          : 1,
      );
      //
      const nutrientsValue: NutrientsModel = {
        weight: updatednutrientsData.weight,
        vitaminA: updatednutrientsData.vitaminA,
        calcium: updatednutrientsData.calcium,
        calories: updatednutrientsData.calories,
        carbs: updatednutrientsData.carbs,
        cholesterol: updatednutrientsData.cholesterol,
        fat: updatednutrientsData.fat,
        fibers: updatednutrientsData.fibers,
        iron: updatednutrientsData.iron,
        polyunsaturatedFat: updatednutrientsData.polyunsaturatedFat,
        potassium: updatednutrientsData.potassium,
        protein: updatednutrientsData.protein,
        satFat: updatednutrientsData.satFat,
        sodium: updatednutrientsData.sodium,
        sugars: updatednutrientsData.sugars,
        transFat: updatednutrientsData.transFat,
        vitaminC: updatednutrientsData.vitaminC,
        vitaminD: updatednutrientsData.vitaminD,
      };

      setNutrientsData(nutrientsValue);
      assignMicroNutritionData(nutrientsValue);
    } catch (error) {}
  };
  const multiplyNutritionValuesWithPortionSize = (
    nutritionData: PassioNutrients,
    factor: number = 1,
  ): PassioNutrients => {
    const updatedNutritionData: PassioNutrients = {
      weight: {
        unit: nutritionData.weight.unit,
        value: nutritionData.weight.value * factor,
      },
    };

    Object.keys(nutritionData).forEach(key => {
      const nutrient = nutritionData[key as keyof PassioNutrients];

      if (nutrient && nutrient.value !== undefined && nutrient.unit) {
        updatedNutritionData[key as keyof PassioNutrients] = {
          unit: nutrient.unit,
          value: nutrient.value * factor,
        };
      }
    });

    return updatedNutritionData;
  };
  function calculaterNutientsAsperWeightAndServingUnit(
    nutritionData: PassioNutrients,
    originalWeight: Number,
    targetWeight: Number,
  ) {
    // Scale each nutrient value proportionally to the target weight
    const scaledData = {};
    Object.keys(nutritionData).forEach(key => {
      if (typeof nutritionData[key].value === 'number') {
        scaledData[key] = {
          ...nutritionData[key],
          value: (nutritionData[key].value / originalWeight) * targetWeight,
        };
      } else {
        scaledData[key] = nutritionData[key]; // If it's not a numeric value, keep it as is
      }
    });

    // Update the weight with the target weight
    scaledData.weight = {...nutritionData.weight, value: targetWeight};

    return scaledData;
  }

  const updateSelectedAmountandUnitWeight = (
    foodItem,
    selectedQuantity,
    newUnit,
  ) => {
    const newQuantityValue = Number(
      selectedQuantity.length > 0 ? selectedQuantity : 1,
    );

    const weight =
      foodItem.amount.servingUnits?.find(
        i => i.unitName === foodItem.amount.selectedUnit,
      )?.value ?? 1;
    return {
      ...foodItem,
      amount: {
        ...foodItem.amount,
        selectedQuantity: newQuantityValue,
        selectedUnit: newUnit,
        weight: {
          ...foodItem.amount.weight,
          value: weight * newQuantityValue,
        },
      },
    };
  };

  function handleEditNutrition() {
    setEditNutritionVisible(!isEditNutritionVisible);
  }

  function handleEditNutritionValue(value) {
    setMicroNutritionData(value);
  }

  function handleMicroNutritionSave() {
    if (MicroNutritionData != undefined) {
      const nutritionConvertData = convertToMicroNutritionData();
      setNutrientsData(nutritionConvertData);
    }

    setEditNutritionVisible(!isEditNutritionVisible);
  }

  const convertToMicroNutritionData = () => {
    const convertedData = {};

    MicroNutritionData.forEach(item => {
      const key = item.dataKey; // Use dataKey directly as the key name
      convertedData[key] = {
        value: parseFloat(item.value),
        unit: item.unit,
      };

      if (item.subcategories) {
        item.subcategories.forEach(sub => {
          const subKey = sub.dataKey; // Use subcategory's dataKey directly
          convertedData[subKey] = {
            value: parseFloat(sub.value),
            unit: sub.unit,
          };
        });
      }
    });

    return convertedData;
  };
  const handleBackPress = () => {
    if (isFromEdit) {
      dispatch(setIngredientEditTrue());
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={
          isFrom === 'Toppings' ? AppStrings.toppings : AppStrings.ingredient
        }
        varient="TYPE2"
        onActionBtnClick={handleBackPress}
      />

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.receipeInfo}>
          <View
            style={{
              height: verticalScale(60),
              width: verticalScale(60),
              // marginLeft: 20,
              justifyContent: 'center',
            }}>
            <PassioIconView
              style={{
                height: verticalScale(60),
                width: verticalScale(60),
                alignSelf: 'center',
              }}
              config={{
                passioID: passioFoodData.iconId,
                iconSize: IconSize.PX180,
              }}
            />
          </View>
          <View style={styles.flex1}>
            <Text maxFontSizeMultiplier={1.4} style={styles.receipeName}>
              {passioFoodData.name}
            </Text>
            {passioFoodData.details != '' &&
            passioFoodData.details != undefined ? (
              <Text maxFontSizeMultiplier={1.4} style={styles.sizeLabel}>
                {toTitleCase(passioFoodData.details)} |{' '}
                {getSources(
                  passioFoodData.ingredients?.[0]?.metadata?.foodOrigins || [],
                )}
              </Text>
            ) : (
              <Text maxFontSizeMultiplier={1.4} style={styles.sizeLabel}>
                {getSources(
                  passioFoodData.ingredients?.[0]?.metadata?.foodOrigins || [],
                )}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.servingContainer}>
          <Text maxFontSizeMultiplier={1.4} style={styles.ingredientLabel}>
            Quantity
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setServingModalVisible(true);
          }}>
          <View style={styles.valueContainer}>
            <Text maxFontSizeMultiplier={1.4} style={styles.value}>
              {formatToTwoDecimals(passioFoodData?.amount?.selectedQuantity)}
            </Text>
            <Text maxFontSizeMultiplier={1.4} style={styles.servings}>
              {capitalizeWords(passioFoodData.amount.selectedUnit)}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.ingredientContainer}>
          <View style={styles.ingredientHeader}>
            <View style={styles.nutritionContainer}>
              <Text maxFontSizeMultiplier={1.5} style={styles.ingredientLabel}>
                Nutrition Per Serving
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              // onPress={handleEditNutrition}>
              onPress={() => {
                setEditNutritionAlert(true);
              }}>
              <Text maxFontSizeMultiplier={1.3} style={styles.editButtonText}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.separator} />
          <NutritionInfo
            nutritionData={nutrientsData}
            foodData={passioFoodData}
          />
          <MicronutrientsList nutritionData={nutrientsData} />
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <CustomButton
          title={
            isFromEdit
              ? 'Edit'
              : isFrom === 'Toppings'
              ? 'Save'
              : AppStrings.addIngredient
          }
          onPress={() => {
            const currentingrdeinetsData: PassioIngredient = {
              refCode: passioFoodData.refCode,
              name: passioFoodData.name,
              id: passioFoodData.id,
              iconId: passioFoodData.iconId,
              weight: passioFoodData.weight,
              referenceNutrients: nutrientsData,
              // metadata: PassioFoodMetadata,
              amount: passioFoodData.amount,
            };
            if (isFromEdit) {
              // dispatch(updateIngredient(currentingrdeinetsData));
              dispatch(updateToppings(currentingrdeinetsData));
              navigateBack();
              dispatch(setIngredientEditTrue());
            } else {
              // dispatch(addIngredients(currentingrdeinetsData));
              dispatch(addToppings(currentingrdeinetsData));
              navigateBackTwoScreens();
            }
          }}
          style={{
            marginHorizontal: moderateScale(15),
            marginBottom: moderateScale(10),
          }}
        />
      </View>
      {isValuesSet && (
        <IngredientServingSizeBottomSheet
          isServingModalVisible={isServingModalVisible}
          onPress={handleServingSizeClose}
          onSave={handleSaveServingSize}
          onServingGuide={handleServingGuide}
          isServingGuideVisible={isServingGuideVisible}
          servingSize={servingSize}
          setServingSize={setServingSize}
          unit={unit}
          setUnit={setUnit}
          servingSizesList={removeLastItemFromServingSizes(
            passioFoodData.amount.servingSizes,
          )}
        />
      )}

      <MicroNutritionEditValue
        isEditNutritionVisible={isEditNutritionVisible}
        onPress={handleEditNutrition}
        activeTab={null}
        setActiveTab={null}
        onSave={handleMicroNutritionSave}
        microNutritionData={nutrientsData}
        onEditValue={handleEditNutritionValue}
        isFrom={2}
      />
      <AlertModal
        alertModalVisible={editNutritionAlert}
        title={''}
        message={
          'You are about to edit the nutritional values for this food item. Proceed only if you are certain the values are accurate.'
        }
        onClose={() => {
          setEditNutritionAlert(false);
          handleEditNutrition();
        }}
      />
    </SafeAreaView>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.lightGreen,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 24 : 12,
    borderTopRightRadius: isTablet ? 24 : 12,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(24),
  },

  receipeInfo: {
    display: 'flex',
    flexDirection: 'row',
    gap: moderateScale(16),
  },

  image: {
    width: verticalScale(60),
    height: verticalScale(60),
    borderRadius: moderateScale(12),
    objectFit: 'cover',
  },
  actionImage: {
    width: verticalScale(24),
    height: verticalScale(24),
    objectFit: 'cover',
    marginTop: moderateScale(9),
  },

  receipeName: {
    fontSize: AppFontSize.intersize18,
    fontFamily: AppFonts.interSemibold,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    // marginTop: 12,
    // lineHeight: 24,
  },

  servingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: moderateScale(28),
  },

  sizeLabel: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
  },

  valueContainer: {
    backgroundColor: AppColors.bgLightGrey,
    borderRadius: moderateScale(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: verticalScale(44),
    marginTop: verticalScale(12),
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

  nutritionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ingredientContainer: {
    marginTop: moderateScale(40),
    paddingBottom: moderateScale(40),
  },

  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(15),
  },
  ingredientLabel: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  editButton: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
  },
  editButtonText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.hyperLinkTextColor,
    fontFamily: AppFonts.interMedium,
  },
  separator: {
    borderBottomColor: AppColors.textFieldBorderGrey,
    borderBottomWidth: moderateScale(1),
    marginBottom: moderateScale(16),
  },

  buttonContainer: {
    flex: 0,
    backgroundColor: AppColors.white,
    paddingBottom: moderateScale(15),
  },
  flex1: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default IngredientDetails;
