import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {
  Image,
  LayoutChangeEvent,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {AppColors} from '../../../theme/AppColors';
import {AppStrings} from '../../../utils/Constants';
import {useState} from 'react';
import {screenDimensions} from '../../../utils/ScreenDimensions';
import {
  navigate,
  navigateBack,
  navigateBackTwoScreens,
  navigateBackMulripleScreen,
} from '../../../navigators/utils/Utils';
import {AppFonts, AppFontSize, AppWeights} from '../../../theme/AppFonts';
import NutritionInfo from '../../../components/NutritionInfo';
import MicronutrientsList from '../../../components/MicroNutritionList';
import {CustomButton} from '../../../components/CustomButton';
import ServingSizeBottomSheet from '../../../components/ServingSizeBottomSheet';
import {NavigatorNames} from '../../../navigators/tabs/NavigatorsNames';
import IngredientItem from '../../../components/IngredientItem';
import SlidingContainer from '../../../components/SlidingContainer';
import TimePicker from '../../../components/TimePicker';
import MicroNutritionEditValue from '../../../components/MicroNutritionEditValue';
import {
  PassioSDK,
  PassioFoodItem,
  PassioIconView,
  IconSize,
  PassioNutrients,
  PassioIngredient,
  ServingSizeUnit,
  RefCode,
  PassioFoodAmount,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import {useDispatch, useSelector} from 'react-redux';
import {Alert} from 'react-native';
import {
  FoodItemModel,
  IntakeModel,
  ServingSize,
  ServingUnit,
} from '../../../models/FoodJournalModel';
import {
  updatePortionAndServingSize,
  updateNutrionData,
  clearSelectedFoodItem,
  removeIngredientByIndex,
  updateName,
  updateSelectedQuantityAndSize,
  removeToppingsWithIndex,
  updateIntakeSize,
  clearWeightAndName,
  addSelectedFoodItem,
  updateNameAndImage,
} from '../../../store/slices/selectedFoodSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../../../components/Header';
import {UnitMass} from '@passiolife/nutritionai-react-native-sdk-v3';
import {parse, formatISO, format, setDate, parseISO} from 'date-fns';
import {
  getFoodImageURL,
  postFoodData,
  postFoodDataSpecificMeal,
  postFoodDataUpdate,
  updateNutritionMealFavorite,
} from '../../../services/foodService';
import {OrderResponseModel} from '../../../models/OrderModel';
import {NutrientsModel} from '../../../models/FoodJournalModel';
import {SaveRecipeNamePopup} from '../../../components/SaveRecipeNamePopup';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {combineSlices, configureStore} from '@reduxjs/toolkit';
import {Item} from 'react-native-paper/lib/typescript/components/List/List';
import {capitalizeWords} from '../../../components/CommonFunctions';
import AlertModal from '../../../components/AlertModal';
import {convertToDateAndTime, formatTime, toTitleCase} from '../../../utils/Helper';
import IntakeModal from '../../../components/IntakeModal';
import {
  additionOfNutritionValuesFromPassioIngrdients,
  addTwoNutrients,
  calculateNutritionForIntakePercentage,
  removeLastItemFromServingSizes,
} from './nutritionContants';

import moment from 'moment';
import GlobalStyles from '../../../styles/GlobalStyles';
import AlertModalMultiple from '../../../components/AlertModalMutiple';
import {storeData} from '../../../utils/LocalStorage';
import {StorageKeys} from '../../../utils/StorageKeys';
import CustomRecipeModal from '../../../components/CreateRecipeModal';
import TotalQuantityModal from '../../../components/TotalQuantityModal';
import {AppContext} from '../../../context/AppContextProvider';
import {RootState} from '../../../store/Store';
import LottieView from 'lottie-react-native';
import AlertModalThree from '../../../components/AlertModalThree';
import {setIngredientEditFalse} from '../../../store/slices/ingredientsEditSlice';
import {toZonedTime} from 'date-fns-tz';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import babelConfig from '../../../../babel.config';
// @ts-ignore
export default function ReceipeCardNew({route}) {
  const [note, setNote] = useState('');
  const [
    isSlidingContainerVisibleIngredient,
    setSlidingContainerVisibleIngredient,
  ] = useState(false);
  const [isSlidingContainerVisibleLogFood, setSlidingContainerVisibleLogFood] =
    useState(false);
  const [slidingContentIngredient, setSlidingContentIngredient] =
    useState<React.ReactNode>(null);
  const [slidingContentLogFood, setSlidingContentLogFood] =
    useState<React.ReactNode>(null);
  const showedCROnce = useRef(true);
  const showedTQOnce = useRef(false);

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

  const [isRecipeModalVisible, setRecipeModalVisible] = useState(false);
  const [isQuantityModalVisible, setQuantityModalVisible] = useState(false);
  const [recipeText, setRecipeText] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');

  const [contentHeight, setContentHeight] = useState(0);
  const [isServingModalVisible, setServingModalVisible] = useState(false);
  const [isServingGuideVisible, setServingGuideVisible] = useState(false);
  const [isShowTimePickerVisible, setShowTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [changedTime, setChangedTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDateChooser, setDateChooser] = useState(false);
  const [isEditNutritionVisible, setEditNutritionVisible] = useState(false);
  const [portionSize, setPortionSize] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [unit, setUnit] = useState('Grams');
  const [intakeValue, setIntakeValue] = useState('0');
  const [intakeUnit, setIntakeUnit] = useState('%');
  const [isNutrionDataAdded, setIsNutrionDataAdded] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [showInfoAlert, setInfoAlert] = useState(false);
  const [showMultiButtonModalPassio, setShowMultiButtonModalPassio] =
    useState(false);
  const [showMultiButtonModalCustom, setShowMultiButtonModalCustom] =
    useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const deleteIngredientIndex = useRef<number>(-1);
  // const [isDirectLog, setIsDirectLog] = useState(false);
  const [isSaveNameModalVisible, setIsSaveNameModalVisible] = useState(false);
  const {
    isFrom,
    isFromRecent,
    mealType,
    date,
    isFavorite,
    portionType,
    notes,
    mealId,
    type,
    dateLogged,
    isScanned,
    isFromCameraScan,
    isFromFoodJournal,
    isDirectLog,
  } = route.params;
  const [isNutritionModalVisible, setIsNutritionModalVisible] = useState(false);
  const [selectedNutritionOption, setSelectedNutritionOption] = useState(1); // 1 : Nutrition Per Serving ; 2 : Nutrition Portion Size
  const [
    selectedNutritionOptionFromModal,
    setSelectedNutritionOptionFromModal,
  ] = useState(1); // 1 : Nutrition Per Serving ; 2 : Nutrition Portion Size
  const [isLogFoodBtnClicked, setIsLogFoodBtnClicked] = useState(false);
  //   const [ingrdeiltsList, setIngrdientsList] = useState([]);
  const [toppingsList, setToppingsList] = useState([]);

  const [foodType, setFoodType] = useState('');

  const [saveNameAs, setSaveNameAs] = useState('');

  const [loader, setLoader] = useState(false);

  const nutritionOptions = [
    {name: AppStrings.nutritionPerServing, id: 1},
    {name: AppStrings.nutritionPortionSize, id: 2},
  ];
  const selectedItem: FoodItemModel | null = useSelector(
    (state: any) => state.selectedFood.data,
  );

  const oResponse: OrderResponseModel | null = useSelector(
    (state: RootState) => state.order.orderResponse,
  );
  const pastResponse: any | null = useSelector(
    (state: RootState) => state.order.pastNutritionResponse,
  );
  const isFromTodaysTask: boolean = useSelector(
    (state: RootState) => state.order.isFromTodaysTask,
  );
  const orderResponse = isFromTodaysTask ? pastResponse : oResponse;

  let orderId = orderResponse?.order.id;
  let metadataId = orderResponse?.nutrition.metadataId;
  let nutritionAnalysisId = orderResponse?.nutrition.nutritionAnalysisId;

  const [MicroNutritionData, setMicroNutritionData] = useState();
  const [updatedMicroNutritionData, setUpdatedMicroNutritionData] = useState(
    selectedItem?.nutritions,
  );
  const [focusedField, setFocusedField] = useState(null);
  const [showIngredientInfo, setIngredientInfo] = useState(false);
  const [editNutritionAlert, setEditNutritionAlert] = useState(false);
  const dispatch = useDispatch();
  //   const [selectedQuantity, setSelectedQuantity] = useState('');
  //   const [selectedUnit, setSelectedUnit] = useState('');
  const [intakeModalVisible, setIntakeModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFirstTime, SetIsFirstTime] = useState(true);
  const [isCustomSavedDataChanged, setIsCustomSavedDataChanged] =
    useState(false);
  const [toppingsChanged, setToppingsChanged] = useState(false);
  const [initialToppings, setInitialToppings] = useState([]);
  const ingiedientsEdited: Boolean = useSelector(
    (state: any) => state.ingredientsEdit.ingredients_edited,
  );

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcDate = parseISO(date);
  const localDate = toZonedTime(utcDate, timeZone);

  // This useEffect set the current time when food clicked from food journal to show the food added time other wise current time will be displayed
  useEffect(() => {
    if (isFrom === 5 && isFromFoodJournal) {
      setChangedTime(convertTo12HourDate(dateLogged));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This will call when add , delete,edit ingredient
  useEffect(() => {
    console.log('dateee', localDate);
    setIsNutrionDataAdded(true);
    // formatDate();
    // setIngrdientsList(selectedItem?.foodData?.ingredients);
    setToppingsList(selectedItem?.toppings);
    setInitialToppings(selectedItem?.toppings);
    if (isFrom === 1 || isFrom === 2) {
      setCurrentDate(format(localDate, 'dd MMMM yyyy'));
      sumIngredientsAndMultiplePortion();
      if (isFrom === 1) {
        setFoodType('RECIPE');
      } else {
        setFoodType('FOOD');
      }
    } else if (isFrom === 3) {
      setFoodType('FOOD');
      setCurrentDate(format(localDate, 'dd MMMM yyyy'));
      getNutritionsselectedUnit(selectedItem?.foodData);
    } else if (isFrom === 4 || isFrom === 5) {
      setFoodType(type);
      setIsFavourite(isFavorite);
      setNote(notes);
      if (!(isFrom === 5 && isFromFoodJournal)) {
        setChangedTime(convertTo12HourDate(new Date().toISOString()));
      }
      setCurrentDate(format(localDate, 'dd MMMM yyyy'));
      if (portionType) {
        setSelectedNutritionOption(portionType);
      }
      addNutritionDataIfExists();
      if (isFirstTime) {
        SetIsFirstTime(false);
      } else {
        if (selectedNutritionOption != undefined) {
          isScanned
            ? getNutritionsselectedUnit(selectedItem?.foodData)
            : sumIngredientsAndMultiplePortion();
        }
      }
    }
  }, [
    // selectedItem?.toppings,
    // selectedItem?.foodData.amount.selectedQuantity,
    // selectedItem?.foodData.amount.selectedUnit,
    selectedItem?.intake,
    selectedNutritionOption,
  ]);
  useEffect(() => {
    setIsNutrionDataAdded(true);
    // formatDate();
    // setIngrdientsList(selectedItem?.foodData?.ingredients);
    setToppingsList(selectedItem?.toppings);
    if (isFrom === 1 || isFrom === 2) {
      sumIngredientsAndMultiplePortion();
      if (isFrom === 1) {
        setFoodType('RECIPE');
      } else {
        setFoodType('FOOD');
      }
    } else if (isFrom === 3) {
      setFoodType('FOOD');
      getNutritionsselectedUnit(selectedItem?.foodData);
    } else if (isFrom === 4 || isFrom === 5) {
      setFoodType(type);
      setIsFavourite(isFavorite);
      setNote(notes);
      if (!(isFrom === 5 && isFromFoodJournal)) {
        setChangedTime(convertTo12HourDate(new Date().toISOString()));
      }
      setCurrentDate(format(localDate, 'dd MMMM yyyy'));
      if (portionType) {
        setSelectedNutritionOption(portionType);
      }
      addNutritionDataIfExists();
      if (isFirstTime) {
      } else {
        isScanned
          ? getNutritionsselectedUnit(selectedItem?.foodData)
          : sumIngredientsAndMultiplePortion();
      }
    }
  }, [
    selectedItem?.toppings,
    selectedItem?.foodData.amount.selectedQuantity,
    selectedItem?.foodData.amount.selectedUnit,
  ]);
  useEffect(() => {
    if (ingiedientsEdited) {
      dispatch(setIngredientEditFalse());
      if (isFrom != 3 && !isScanned) {
        setRecipeModalVisible(true);
        showedCROnce.current = false;
      }
    }
  }, [ingiedientsEdited]);

  const isFocused = useIsFocused();
  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        setRecipeText(selectedItem?.foodData?.name ?? '');
        setTotalQuantity(
          selectedItem?.foodData?.amount?.selectedQuantity.toString() ?? '',
        );
        if (!showedCROnce.current) {
          setRecipeModalVisible(true);
          showedCROnce.current = true;
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItem, isFocused]),
  );

  useEffect(() => {}, []);

  useEffect(() => {
    setServingSize(
      selectedItem &&
        selectedItem.foodData.amount &&
        selectedItem.foodData.amount.selectedQuantity != null
        ? selectedItem.foodData.amount.selectedQuantity.toString()
        : '0',
    );
    setUnit(
      selectedItem &&
        selectedItem.foodData.amount &&
        selectedItem.foodData.amount.selectedUnit != null
        ? selectedItem.foodData.amount.selectedUnit
        : 'Grams',
    );
  }, [
    selectedItem?.foodData.amount.selectedQuantity,
    selectedItem?.foodData.amount.selectedUnit,
    // selectedItem?.foodData.amount.weight,
  ]);

  useFocusEffect(useCallback(() => {}, []));

  useFocusEffect(
    useCallback(() => {
      setServingSize(
        selectedItem &&
          selectedItem.foodData.amount &&
          selectedItem.foodData.amount.selectedQuantity != null
          ? selectedItem.foodData.amount.selectedQuantity.toString()
          : '0',
      );
      setUnit(
        selectedItem &&
          selectedItem.foodData.amount &&
          selectedItem.foodData.amount.selectedUnit != null
          ? selectedItem.foodData.amount.selectedUnit
          : 'Grams',
      );
      setIntakeValue(String(selectedItem?.intake?.intakeValue));
      setIntakeUnit(String(selectedItem?.intake?.unit));
      if (isFrom === 4 || isFrom === 5) {
        setFoodType(type);
        setIsFavourite(isFavorite);
        setNote(notes);
        if (!(isFrom === 5 && isFromFoodJournal)) {
          setChangedTime(convertTo12HourDate(new Date().toISOString()));
        }
        setCurrentDate(format(localDate, 'dd MMMM yyyy'));
        if (portionType) {
          setSelectedNutritionOption(portionType);
        }
        addNutritionDataIfExists();
      } else if (isFrom === 3) {
        addNutritionDataIfExists();
      }
    }, [
      selectedItem?.foodData.amount.selectedQuantity,
      selectedItem?.foodData.amount.selectedUnit,
      selectedItem?.foodData.amount.weight,
      selectedItem?.intake?.intakeValue,
    ]),
  );

  const handleBackPress = () => {
    // navigateBack();
    // setTimeout(() => {
    if (isFromFoodJournal) {
      dispatch(clearSelectedFoodItem());
    }
    //   dispatch(clearWeightAndName());
    // }, 1000);
  };

  function roundToTwoDecimals(num: number): number {
    return Math.round(num);
  }

  function addNutritionDataIfExists() {
    assignMicroNutritionData(selectedItem?.nutritions);
  }

  function handleLogFood() {
    if (isFrom === 1) {
      setShowMultiButtonModalPassio(true);
    } else if (isFrom === 3) {
      //setIsSaveNameModalVisible(true);
      if (toppingsList?.length > 0) {
        if (selectedItem?.foodData.amount.selectedQuantity > 0) {
          setShowMultiButtonModalPassio(true);
        } else {
          setTitle('');
          setMessage(
            'The amount eaten must be greater than zero. Please enter how much you ate to the food log',
          );
          setButtons &&
            setButtons([
              {
                text: 'Ok',
                onPress: () => {
                  setAlert(false);
                },
              },
            ]);
          setAlert(true);
        }
      } else {
        if (selectedItem?.foodData.amount.selectedQuantity > 0) {
          handleLogFoodToMeal();
        } else {
          setTitle('');
          setButtons &&
            setButtons([
              {
                text: 'Ok',
                onPress: () => {
                  setAlert(false);
                },
              },
            ]);
          setMessage(
            'The amount eaten must be greater than zero. Please enter how much you ate to the food log',
          );
          setAlert(true);
        }
      }
    } else if (isFrom === 4 && isScanned) {
      if (toppingsList != initialToppings) {
        setShowMultiButtonModalCustom(true);
      } else {
        handleLogFoodToMeal();
      }
    } else if (isFrom === 4 && !isScanned) {
      if (isCustomSavedDataChanged || toppingsList != initialToppings) {
        setShowMultiButtonModalCustom(true);
      } else {
        handleLogFoodToMeal();
      }
    } else if (isFrom === 5) {
      handleLogFoodToMeal();
      // if (toppingsList != initialToppings) {
      //   setShowMultiButtonModalCustom(true);
      // } else {
      //   handleLogFoodToMeal();
      // }
    }
  }

  async function handleFavorite() {
    setLoader(true);
    try {
      if (mealId) {
        await updateNutritionMealFavorite(mealId, isDirectLog);
      }
      setIsFavourite(!isFavourite);
    } catch (error: any) {
    } finally {
      setLoader(false);
    }
  }

  function handleServingSizeClose() {
    setServingSize(
      selectedItem &&
        selectedItem.foodData.amount &&
        selectedItem.foodData.amount.selectedQuantity != null
        ? selectedItem.foodData.amount.selectedQuantity.toString()
        : '0',
    );
    setUnit(
      selectedItem &&
        selectedItem.foodData.amount &&
        selectedItem.foodData.amount.selectedUnit != null
        ? selectedItem.foodData.amount.selectedUnit
        : 'Grams',
    );
    // setPortionSize(
    //   selectedItem &&
    //     selectedItem.foodData.amount &&
    //     selectedItem.foodData.amount.weight.value != null &&
    //     selectedItem.foodData.amount.weight.unit === 'Servings'
    //     ? selectedItem.foodData.amount.weight.value.toString()
    //     : '1',
    // );
    setServingModalVisible(!isServingModalVisible);
  }

  function handleSaveServingSize() {
    // if (portionSize === '' || portionSize === '0' || portionSize === 0) {
    //   .alert('Please enter Portion Size');
    // } else
    if (unit === '' || servingSize === '0') {
      setServingModalVisible(false);
      clearAlert();
      setTitle('Please enter Amount');
      setButtons &&
        setButtons([
          {
            text: 'Ok',
            onPress: () => {
              setServingModalVisible(true);
            },
          },
        ]);
      setAlert(true);
    } else {
      //   const data: UnitMass = {
      //     unit: 'Servings', //String(selectedItem?.foodData.amount.weight.unit),
      //     value: Number(portionSize),
      //   };
      //   // setIsNeedUpdate(true);
      //   dispatch(
      //     updatePortionAndServingSize({
      //       portionSize: Number(servingSize),
      //       portionUnit: String(unit),
      //       servingSize: data,
      //     }),
      //   );
      dispatch(
        updateSelectedQuantityAndSize({
          selectedQuantity: Number(servingSize),
          selectedUnit: String(unit),
        }),
      );
      setServingSize(
        selectedItem &&
          selectedItem.foodData.amount &&
          selectedItem.foodData.amount.selectedQuantity != null
          ? selectedItem.foodData.amount.selectedQuantity.toString()
          : '0',
      );
      setUnit(
        selectedItem &&
          selectedItem.foodData.amount &&
          selectedItem.foodData.amount.selectedUnit != null
          ? selectedItem.foodData.amount.selectedUnit
          : 'Grams',
      );
      //   setPortionSize(
      //     selectedItem &&
      //       selectedItem.foodData.amount &&
      //       selectedItem.foodData.amount.weight.value != null &&
      //       selectedItem.foodData.amount.weight.unit === 'Servings'
      //       ? selectedItem.foodData.amount.weight.value.toString()
      //       : '1',
      //   );
      setServingModalVisible(!isServingModalVisible);
    }
  }

  function handleServingGuide() {
    setServingGuideVisible(!isServingGuideVisible);
  }

  const handleTimePicker = () => {
    setShowTimePickerVisible(!isShowTimePickerVisible);
  };

  const handleTimeChange = time => {
    setSelectedTime(time);
  };

  const handleSetTime = () => {
    setChangedTime(selectedTime);
    setShowTimePickerVisible(false);
  };

  const handleAddIngredient = () => {
    handleCloseSlidingContainerIngredient();
    navigate(NavigatorNames.addIngredient, {isFrom: 'Toppings'});
  };
  const getPercentageValue = () => {
    let percentage = 0;
    if (selectedNutritionOption === 1) {
      if (selectedItem?.intake && selectedItem.intake?.intakeValue) {
        if (
          selectedItem.intake.unit === 'Percentage' ||
          selectedItem.intake.unit === '%'
        ) {
          percentage = selectedItem.intake?.intakeValue;
        } else {
          percentage =
            (selectedItem.intake?.intakeValue * 100) /
            selectedItem.foodData.amount.selectedQuantity;
        }
      } else {
        percentage = 100;
      }
    } else {
      percentage = 100;
    }
    return percentage;
  };
  const sumIngredientsAndMultiplePortion = () => {
    if (selectedItem?.toppings) {
      const sumIngrdients = additionOfNutritionValuesFromPassioIngrdients(
        selectedItem?.toppings,
      );
      const percentageValue = getPercentageValue();
      const updatednutrientsData = calculateNutritionForIntakePercentage(
        sumIngrdients,
        percentageValue,
      );
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
      dispatch(updateNutrionData(nutrientsValue));
      setIsNutrionDataAdded(true);
      assignMicroNutritionData(nutrientsValue);
    }
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
      const scaledNutritionData = calculaterNutientsAsperIntake(
        passioFoodItemNutrions,
        PassioFoodData.amount.weightGrams,
        weightForSelectedUnit * PassioFoodData.amount.selectedQuantity,
      );
      // toppings empty handle
      let updatednutrientsData: NutrientsModel = {};
      if (selectedItem?.toppings && selectedItem.toppings.length > 0) {
        const toppingsNutrientsData =
          additionOfNutritionValuesFromPassioIngrdients(selectedItem?.toppings);
        updatednutrientsData = addTwoNutrients(
          scaledNutritionData,
          toppingsNutrientsData,
        );
      } else {
        updatednutrientsData = scaledNutritionData;
      }
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
      dispatch(updateNutrionData(nutrientsValue));
      setIsNutrionDataAdded(true);
    } catch (error) {
      console.log('error', error);
    }
  };

  // const multiplyNutritionValuesWithPortionSize = (
  //   nutritionData: PassioNutrients,
  //   factor: number = 1,
  // ): PassioNutrients => {
  //   const updatedNutritionData: PassioNutrients = {
  //     weight: {
  //       unit: nutritionData.weight.unit,
  //       value: nutritionData.weight.value * factor,
  //     },
  //   };

  //   Object.keys(nutritionData).forEach(key => {
  //     const nutrient = nutritionData[key as keyof PassioNutrients];

  //     if (nutrient && nutrient.value !== undefined && nutrient.unit) {
  //       updatedNutritionData[key as keyof PassioNutrients] = {
  //         unit: nutrient.unit,
  //         value: nutrient.value * factor,
  //       };
  //     }
  //   });

  //   return updatedNutritionData;
  // };
  function calculaterNutientsAsperIntake(
    nutritionData: PassioNutrients,
    originalWeight: Number,
    targetWeight: Number,
  ): PassioNutrients {
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

  // const sumNutrients = (ingredients: PassioIngredient[]): PassioNutrients => {
  //   const summedNutrients: PassioNutrients = {
  //     weight: {unit: 'g', value: 0},
  //     vitaminA: {unit: 'µg', value: 0},
  //     alcohol: {unit: 'g', value: 0},
  //     calcium: {unit: 'mg', value: 0},
  //     calories: {unit: 'kCal', value: 0},
  //     carbs: {unit: 'g', value: 0},
  //     cholesterol: {unit: 'mg', value: 0},
  //     fat: {unit: 'g', value: 0},
  //     fibers: {unit: 'g', value: 0},
  //     iodine: {unit: 'µg', value: 0},
  //     iron: {unit: 'mg', value: 0},
  //     magnesium: {unit: 'mg', value: 0},
  //     monounsaturatedFat: {unit: 'g', value: 0},
  //     phosphorus: {unit: 'mg', value: 0},
  //     polyunsaturatedFat: {unit: 'g', value: 0},
  //     potassium: {unit: 'mg', value: 0},
  //     protein: {unit: 'g', value: 0},
  //     satFat: {unit: 'g', value: 0},
  //     sodium: {unit: 'mg', value: 0},
  //     sugarAlcohol: {unit: 'g', value: 0},
  //     sugars: {unit: 'g', value: 0},
  //     sugarsAdded: {unit: 'g', value: 0},
  //     transFat: {unit: 'g', value: 0},
  //     vitaminB12: {unit: 'µg', value: 0},
  //     vitaminB12Added: {unit: 'µg', value: 0},
  //     vitaminB6: {unit: 'mg', value: 0},
  //     vitaminC: {unit: 'mg', value: 0},
  //     vitaminD: {unit: 'µg', value: 0},
  //     vitaminE: {unit: 'mg', value: 0},
  //     vitaminEAdded: {unit: 'mg', value: 0},
  //     zinc: {unit: 'mg', value: 0},
  //     selenium: {unit: 'µg', value: 0},
  //     folicAcid: {unit: 'µg', value: 0},
  //     vitaminKPhylloquinone: {unit: 'µg', value: 0},
  //     vitaminKMenaquinone4: {unit: 'µg', value: 0},
  //     vitaminKDihydrophylloquinone: {unit: 'µg', value: 0},
  //     chromium: {unit: 'µg', value: 0},
  //     vitaminARAE: {unit: 'µg', value: 0},
  //   };

  //   ingredients.forEach(ingredient => {
  //     Object.keys(summedNutrients).forEach(key => {
  //       const nutrientKey = key as keyof PassioNutrients;
  //       const ingredientNutrient = ingredient.referenceNutrients[nutrientKey];

  //       if (ingredientNutrient && ingredientNutrient.value != null) {
  //         summedNutrients[nutrientKey]!.value += ingredientNutrient.value;
  //       }
  //     });
  //   });

  //   return summedNutrients;
  // };

  const convertTo12HourDate = isoString => {
    const date = new Date(isoString);

    // Extract hours and minutes
    let hours = date.getHours();
    const minutes = date.getMinutes();

    // Determine AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Adjust hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Adjust for 0 -> 12 for midnight

    // Create a new Date object with the converted time
    const newDate = new Date(date);
    newDate.setHours(hours + (ampm === 'PM' ? 12 : 0), minutes, 0, 0); // Set in 24-hour equivalent

    return newDate;
  };

  const onChange = (event: any, selectedTime: any) => {
    setShowTimePickerVisible(false);
    const currentTime = selectedTime;
    setChangedTime(currentTime);
  };

  const handleIngredientClick = item => {
    // if (isFrom != 3 && !isScanned) {
    getFoodItemsForRefCode(item);
    // }
  };
  const getFoodItemsForRefCode = async item => {
    try {
      const passioFoodItem = await PassioSDK.fetchFoodItemForRefCode(
        item.refCode,
      );
      const updatedData = {
        ...passioFoodItem,
        amount: item.amount, // Replace the amount property
      };
      navigate(NavigatorNames.ingredientDetails, {
        nutrientsData: item.referenceNutrients,
        passioFoodData: updatedData,
        isFromEdit: true,
      });
      // return passioFoodItem;
    } catch (error) {
      console.log('Error fetching food items:', error);
    }
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = toppingsList.filter((_, i) => i !== index);
    // setIngrdientsList(updatedIngredients);
    setToppingsList(updatedIngredients);
    // setToppingsChanged(true);
    // dispatch(removeIngredientByIndex(index));
    dispatch(removeToppingsWithIndex(index));
  };

  const renderIngredientList = () => {
    return toppingsList?.map((item: any, index: number) => {
      return (
        <IngredientItem
          clickHandler={() => handleIngredientClick(item)}
          key={index}
          item={item}
          isLastItem={false}
          // truncateText={truncateText}
          actionBtnNeed={true}
          actionBtnImage={require('../../../../assets/images/delete.png')}
          removeHandler={() => {
            deleteIngredientIndex.current = index;
            setShowDeleteAlert(true);
          }}
        />
      );
    });
  };

  const handleSaveRecipeAndLogFoodFrom = async () => {
    if (isFrom === 4) {
      setIsSaveNameModalVisible(true);
    } else {
      handleSaveRecipeAndLogFood();
    }
  };

  const handleSaveClose = () => {
    setIsSaveNameModalVisible(false);
    // setIsLogFoodBtnClicked(true);
    // setSlidingContainerVisibleLogFood(true);
  };

  const handleSaveRecipeAndLogFoodSave = async () => {
    if (saveNameAs === '') {
      setIsSaveNameModalVisible(false);
      clearAlert();
      setTitle('Please enter Recipe name');
      setButtons &&
        setButtons([
          {
            text: 'Ok',
            onPress: () => {
              setIsSaveNameModalVisible(true);
            },
          },
        ]);
      setAlert(true);
    } else {
      setIsSaveNameModalVisible(false);
      dispatch(updateName({name: saveNameAs}));
      // const ddate = moment(currentDate, 'DD MMMM YYYY').toDate();
      const ddate = moment(currentDate, 'DD MMMM YYYY').startOf('day').toDate();
      const getTime = convertToDateAndTime(formatTime(changedTime), ddate);
      const data = {
        type: isFrom === 3 ? 'RECIPE' : foodType,
        isfavorite: isFavourite,
        active: true,
        isScanned:
          isFrom === 3
            ? true
            : isFrom === 4 || isFrom === 5
            ? isScanned
            : false,
        id: undefined,
        metadata: {
          data: {
            type: selectedNutritionOption,
            dateandtime: getTime,
            notes: note,
            foodData: {...selectedItem?.foodData, name: saveNameAs},
            nutritions: selectedItem?.nutritions,
            image: selectedItem?.image,
            toppings: selectedItem?.toppings,
            intake: selectedItem?.intake,
          },
        },
      };
      try {
        setLoader(true);
        const response = await postFoodData(data);
        data.id = response.data.id;
        data.isDirectLog = false;
        try {
          const response = await postFoodDataSpecificMeal(
            data,
            orderId,
            metadataId,
            nutritionAnalysisId,
            moment(currentDate, 'DD MMMM YYYY').format('YYYY-MM-DD'),
            mealType,
          );
          await storeData({
            key: StorageKeys.selectedDate,
            value: moment(currentDate, 'DD MMMM YYYY').format('YYYY-MM-DD'),
          });
          dispatch(clearSelectedFoodItem());
          if (isFromCameraScan) {
            navigateBackMulripleScreen(3);
          } else {
            if (isFrom === 5) {
              navigateBack();
            } else {
              navigateBackMulripleScreen(2);
            }
          }
        } catch (error: any) {
          console.error('Error posting log food:', error);
        } finally {
          setLoader(false);
        }
      } catch (error: any) {
        console.error('Error posting log food:', error);
      } finally {
        setLoader(false);
      }
    }
  };

  const handleSaveRecipeAndLogFood = async () => {
    setSlidingContainerVisibleLogFood(false);
    setIsLogFoodBtnClicked(false);
    //const ddate = moment(currentDate, 'DD MMMM YYYY').toDate();
    const ddate = moment(currentDate, 'DD MMMM YYYY').startOf('day').toDate();
    const getTime = convertToDateAndTime(formatTime(changedTime), ddate);
    const data = {
      type: foodType,
      isfavorite: isFavourite,
      active: true,
      isScanned:
        isFrom === 3 ? true : isFrom === 4 || isFrom === 5 ? isScanned : false,
      id: undefined,
      metadata: {
        data: {
          type: selectedNutritionOption,
          dateandtime: getTime,
          notes: note,
          foodData: selectedItem?.foodData,
          nutritions: selectedItem?.nutritions,
          image: selectedItem?.image,
          toppings: selectedItem?.toppings,
          intake: selectedItem?.intake,
        },
      },
    };
    try {
      setLoader(true);
      const response = await postFoodData(data);
      data.id = response.data.id;
      data.isDirectLog = false;
      try {
        const response = await postFoodDataSpecificMeal(
          data,
          orderId,
          metadataId,
          nutritionAnalysisId,
          moment(currentDate, 'DD MMMM YYYY').format('YYYY-MM-DD'),
          mealType,
        );
        await storeData({
          key: StorageKeys.selectedDate,
          value: moment(currentDate, 'DD MMMM YYYY').format('YYYY-MM-DD'),
        });
        dispatch(clearSelectedFoodItem());
        if (isFromCameraScan) {
          navigateBackMulripleScreen(3);
        } else {
          if (isFrom === 5) {
            navigateBack();
          } else {
            navigateBackMulripleScreen(2);
          }
        }
      } catch (error: any) {
        console.error('Error posting log food:', error);
      } finally {
        setLoader(false);
      }
    } catch (error: any) {
      console.error('Error posting log food:', error);
    } finally {
      setLoader(false);
    }
  };

  const handleUpdateRecipeAndLogFood = async () => {
    //const ddate = moment(currentDate, 'DD MMMM YYYY').toDate();
    const ddate = moment(currentDate, 'DD MMMM YYYY').startOf('day').toDate();
    const getTime = convertToDateAndTime(formatTime(changedTime), ddate);
    const data = {
      id: mealId,
      type: foodType,
      isfavorite: isFavourite,
      isScanned: isScanned,
      active: true,
      metadata: {
        data: {
          type: selectedNutritionOption,
          dateandtime: getTime,
          notes: note,
          foodData: selectedItem?.foodData,
          nutritions: selectedItem?.nutritions,
          image: selectedItem?.image,
          toppings: selectedItem?.toppings,
          intake: selectedItem?.intake,
        },
      },
    };
    try {
      setLoader(true);
      const response = await postFoodDataUpdate(data);
      data.isDirectLog = false;
      try {
        const response = await postFoodDataSpecificMeal(
          data,
          orderId,
          metadataId,
          nutritionAnalysisId,
          moment(currentDate, 'DD MMMM YYYY').format('YYYY-MM-DD'),
          mealType,
        );
        await storeData({
          key: StorageKeys.selectedDate,
          value: moment(currentDate, 'DD MMMM YYYY').format('YYYY-MM-DD'),
        });
        dispatch(clearSelectedFoodItem());
        if (isFrom === 5) {
          navigateBack();
        } else {
          navigateBackMulripleScreen(2);
        }
      } catch (error: any) {
        console.error('Error posting log food:', error);
      } finally {
        setLoader(false);
      }
    } catch (error: any) {
      console.error('Error posting log food:', error);
    } finally {
      setLoader(false);
    }
  };

  const handleLogFoodToMeal = async () => {
    setSlidingContainerVisibleLogFood(false);
    setIsLogFoodBtnClicked(false);
    const ddate = moment(currentDate, 'DD MMMM YYYY').startOf('day').toDate();
    const getTime = convertToDateAndTime(formatTime(changedTime), ddate);
    const uniqueId = uuidv4();
    const data = {
      id: isFrom === 4 || isFrom === 5 ? mealId : uniqueId,
      type: foodType,
      isfavorite: isFavourite,
      active: true,
      isDirectLog: isDirectLog,
      isScanned:
        isFrom === 3 ? true : isFrom === 4 || isFrom === 5 ? isScanned : false,
      metadata: {
        data: {
          type: selectedNutritionOption,
          dateandtime: getTime,
          notes: note,
          foodData: selectedItem?.foodData,
          nutritions: selectedItem?.nutritions,
          image: selectedItem?.image,
          toppings: selectedItem?.toppings,
          intake: selectedItem?.intake,
        },
      },
    };
    try {
      setLoader(true);
      const response = await postFoodDataSpecificMeal(
        data,
        orderId,
        metadataId,
        nutritionAnalysisId,
        moment(currentDate, 'DD MMMM YYYY').format('YYYY-MM-DD'),
        mealType,
      );
      await storeData({
        key: StorageKeys.selectedDate,
        value: moment(currentDate, 'DD MMMM YYYY').format('YYYY-MM-DD'),
      });
      dispatch(clearSelectedFoodItem());
      if (isFrom === 5 && !isFromRecent) {
        navigateBack();
      } else {
        if (isFromCameraScan) {
          navigateBackMulripleScreen(3);
        } else {
          navigateBackMulripleScreen(2);
        }
      }
    } catch (error: any) {
      console.error('Error posting log food:', error);
    } finally {
      setLoader(false);
    }
  };

  function handleEditNutrition() {
    setEditNutritionVisible(!isEditNutritionVisible);
    setSelectedNutritionOptionFromModal(selectedNutritionOption);
  }

  function handleNutritionChange(value: number) {
    setSelectedNutritionOptionFromModal(value);
    setSelectedNutritionOption(value);
  }

  function handleEditNutritionValue(value) {
    setMicroNutritionData(value);
  }

  function handleMicroNutritionSave() {
    setSelectedNutritionOption(selectedNutritionOptionFromModal);
    const nutritionConvertData = convertToMicroNutritionData();
    setUpdatedMicroNutritionData(nutritionConvertData);
    dispatch(updateNutrionData(nutritionConvertData));
    setEditNutritionVisible(!isEditNutritionVisible);
  }

  const handleCloseSlidingContainerIngredient = () => {
    setSlidingContainerVisibleIngredient(false);
  };

  const handleCloseSlidingContainerLogFood = () => {
    setSlidingContainerVisibleLogFood(false);
  };

  const onContentLayout = (event: LayoutChangeEvent) => {
    const {height} = event.nativeEvent.layout;
    setContentHeight(height);
  };

  const handleNutritionModal = () => {
    if (isFrom != 3 && !isScanned) {
      setIsNutritionModalVisible(!isNutritionModalVisible);
    }
  };

  const handleCreateCustomRecipe = () => {
    if (recipeText) {
      setRecipeModalVisible(false);
      setIsCustomSavedDataChanged(true);
      addIngredient();
    } else {
      setRecipeModalVisible(false);
      clearAlert();
      setTitle('Please enter a Recipe Name');
      setButtons &&
        setButtons([
          {
            text: 'Ok',
            onPress: () => {
              setRecipeModalVisible(true);
            },
          },
        ]);
      setAlert(true);
    }
  };
  const fetchImage = async () => {
    try {
      const response = await getFoodImageURL(recipeText);
      console.log('response is', response);
      dispatch(
        updateNameAndImage({name: recipeText, image: response.data.imageURL}),
      );
      setQuantityModalVisible(true);
    } catch (error) {
      console.log('response is failure', error);
      setQuantityModalVisible(true);
    }
  };
  const openQuantityModal = async () => {
    if (
      recipeText &&
      selectedItem?.toppings &&
      selectedItem?.toppings.length > 0
    ) {
      try {
        console.log('is open called');
        setRecipeModalVisible(false);
        showedCROnce.current = true;
        fetchImage();
        //  setTimeout(() => {
        //   console.log('quantiti model visible')
        // setQuantityModalVisible(true);
        //  }, 1000);
      } catch (e) {}
    }
  };

  const setDataForNewCustomReceipe = async (
    selectedQuantity: number,
    selectedUnit: string,
  ) => {
    const nutrionsData = additionOfNutritionValuesFromPassioIngrdients(
      selectedItem?.toppings,
    );
    const nutrientsValue: NutrientsModel = {
      weight: nutrionsData.weight,
      vitaminA: nutrionsData.vitaminA,
      calcium: nutrionsData.calcium,
      calories: nutrionsData.calories,
      carbs: nutrionsData.carbs,
      cholesterol: nutrionsData.cholesterol,
      fat: nutrionsData.fat,
      fibers: nutrionsData.fibers,
      iron: nutrionsData.iron,
      polyunsaturatedFat: nutrionsData.polyunsaturatedFat,
      potassium: nutrionsData.potassium,
      protein: nutrionsData.protein,
      satFat: nutrionsData.satFat,
      sodium: nutrionsData.sodium,
      sugars: nutrionsData.sugars,
      transFat: nutrionsData.transFat,
      vitaminC: nutrionsData.vitaminC,
      vitaminD: nutrionsData.vitaminD,
    };
    const serveUnit: ServingUnit = {
      unitName: '',
      value: 0,
      unit: '',
    };
    const serveSize: ServingSize = {
      quantity: 0,
      unitName: 'string',
    };
    const weightData: UnitMass = {
      unit: 'Servings',
      value: 0,
    };
    const amountData: PassioFoodAmount = {
      selectedUnit: selectedUnit,
      selectedQuantity: selectedQuantity,
      weightGrams: 0,
      servingUnits: [serveUnit],
      servingSizes: [serveSize],
      weight: weightData,
    };

    try {
      setLoader(true);
      const response = await getFoodImageURL(recipeText);
      setRecipeText('');
      const foodData: PassioFoodItem = {
        name: response.data.foodName,
        iconId: '',
        refCode: '',
        id: '',
        amount: amountData,
        ingredients: null,
        ingredientWeight: null,
      };
      const intakeData: IntakeModel = {
        intakeValue: 0,
        portion: 1 / 2,
        unit: '%',
      };
      const data: FoodItemModel = {
        foodData: foodData,
        nutritions: nutrientsValue,
        toppings: selectedItem?.toppings,
        intake: intakeData,
        image: response.data.imageURL,
      };
      dispatch(addSelectedFoodItem(data));
      // set below false to avoid showing the Total Quantity Popup whenever selectedFood updated from other ways except create recipe
      showedTQOnce.current = false;
      // navigate(NavigatorNames.receipeCardNew, {
      //   isFrom: 1,
      //   mealType: mealType,
      //   date: date,
      //   isFavorite: false,
      //   type: 'RECIPE',
      //   portionType: 1,
      //   notes: '',
      //   mealId: '',
      //   dateLogged: '',
      //   isScanned: false,
      //   isFromCameraScan: false,
      //   isFromFoodJournal: false,
      //   isDirectLog: true,
      // });
    } catch (error: any) {
      console.error('Error getting image for entered Recipe:', error);
    } finally {
      setLoader(false);
    }
  };

  const addIngredient = async () => {
    if (selectedItem?.toppings && selectedItem?.toppings?.length > 0) {
      // set below false to avoid showing the Total Quantity Popup whenever selectedFood updated from other ways except create recipe
      showedTQOnce.current = false;
      navigate(NavigatorNames.addIngredient);
      return;
    }
    const nutrionsData: PassioNutrients = {
      calories: {unit: 'kCal', value: 0},
      fat: {unit: 'g', value: 0},
      polyunsaturatedFat: {unit: 'g', value: 0},
      transFat: {unit: 'g', value: 0},
      cholesterol: {unit: 'mg', value: 0},
      sodium: {unit: 'g', value: 0},
      carbs: {unit: 'g', value: 0},
      fibers: {unit: 'g', value: 0},
      sugars: {unit: 'g', value: 0},
      vitaminD: {unit: 'g', value: 0},
      potassium: {unit: 'g', value: 0},
      calcium: {unit: 'g', value: 0},
      iron: {unit: 'g', value: 0},
      vitaminA: {unit: 'g', value: 0},
      vitaminC: {unit: 'g', value: 0},
      weight: {unit: 'g', value: 0},
    };
    const serveUnit: ServingUnit = {
      unitName: '',
      value: 0,
      unit: '',
    };
    const serveSize: ServingSize = {
      quantity: 0,
      unitName: 'string',
    };
    const weightData: UnitMass = {
      unit: 'Servings',
      value: 0,
    };
    const amountData: PassioFoodAmount = {
      selectedUnit: 'Grams',
      selectedQuantity: 0,
      weightGrams: 0,
      servingUnits: [serveUnit],
      servingSizes: [serveSize],
      weight: weightData,
    };
    const nutrientsValue: NutrientsModel = {
      weight: nutrionsData.weight,
      vitaminA: nutrionsData.vitaminA,
      calcium: nutrionsData.calcium,
      calories: nutrionsData.calories,
      carbs: nutrionsData.carbs,
      cholesterol: nutrionsData.cholesterol,
      fat: nutrionsData.fat,
      fibers: nutrionsData.fibers,
      iron: nutrionsData.iron,
      polyunsaturatedFat: nutrionsData.polyunsaturatedFat,
      potassium: nutrionsData.potassium,
      protein: nutrionsData.protein,
      satFat: nutrionsData.satFat,
      sodium: nutrionsData.sodium,
      sugars: nutrionsData.sugars,
      transFat: nutrionsData.transFat,
      vitaminC: nutrionsData.vitaminC,
      vitaminD: nutrionsData.vitaminD,
    };
    try {
      // const response = await getFoodImageURL(recipeText);
      setRecipeText('');
      const foodData: PassioFoodItem = {
        name: recipeText,
        iconId: '',
        refCode: '',
        id: '',
        amount: amountData,
        ingredients: null,
        ingredientWeight: null,
      };
      const updatedData: FoodItemModel = {
        foodData: foodData,
        nutritions: nutrientsValue,
        toppings: null,
        image: '',
      };
      dispatch(addSelectedFoodItem(updatedData));
      // set below false to avoid showing the Total Quantity Popup whenever selectedFood updated from other ways except create recipe
      showedTQOnce.current = false;
      navigate(NavigatorNames.addIngredient);
      return;
    } catch (error: any) {
      console.error('Error getting image for entered Recipe:', error);
    }
  };

  const handleNutritionSelection = (item: any) => {
    setSelectedNutritionOption(item.id);
    setSelectedNutritionOptionFromModal(item.id);
    setIsNutritionModalVisible(false);
  };

  const handleEditIngredient = () => {
    console.log('edit ingredient called');
    setSlidingContainerVisibleIngredient(true);
  };

  useEffect(() => {
    if (isSlidingContainerVisibleIngredient) {
      setSlidingContentIngredient(
        <View style={styles.ingredientCustomizeContainer}>
          <View style={styles.ingredientHeader}>
            <Text
              maxFontSizeMultiplier={1.4}
              style={styles.ingredientLabelBold}>
              Add-ons
            </Text>
            {/* {isFrom !== 3 && !isScanned && ( */}
            <TouchableOpacity
              onPress={handleAddIngredient}
              style={styles.editButton}>
              <Text maxFontSizeMultiplier={1.4} style={styles.editButtonText}>
                Add
              </Text>
            </TouchableOpacity>
            {/* )} */}
          </View>
          {toppingsList?.length > 0 ? (
            <ScrollView style={styles.ingredientListContainer}>
              {renderIngredientList()}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text maxFontSizeMultiplier={1.3} style={styles.emptyTitle}>
                No Ingredients
              </Text>
              <Text maxFontSizeMultiplier={1.3} style={styles.emptyDesc}>
                Looks like you, haven't added your ingredients yet
              </Text>
            </View>
          )}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
            }}>
            <CustomButton
              title="Save"
              onPress={handleCloseSlidingContainerIngredient}
            />
          </View>
        </View>,
      );
    }
  }, [isSlidingContainerVisibleIngredient, toppingsList]);

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

  // @ts-ignore
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollViewContent}>
        <Header varient="TYPE2" title={mealType} onBack={handleBackPress} />
        <KeyboardAwareScrollView
          style={styles.container}
          enableOnAndroid={true} // Enables scrolling for Android as well
          extraScrollHeight={100} // Adjusts the scroll position to ensure input visibility
          contentContainerStyle={{flexGrow: 1}}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            // style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onLayout={onContentLayout}>
            <View style={styles.itemCardContainer}>
              <View>
                {selectedItem?.image === '' || isFrom === 3 ? (
                  <View
                    style={{
                      height: verticalScale(50),
                      width: verticalScale(50),
                      paddingHorizontal: moderateScale(40),
                      justifyContent: 'center',
                      borderRadius: moderateScale(8),
                    }}>
                    <PassioIconView
                      style={{
                        height: verticalScale(50),
                        width: verticalScale(50),
                        borderRadius: moderateScale(8),
                        alignSelf: 'center',
                      }}
                      config={{
                        passioID: selectedItem?.foodData.iconId,
                        iconSize: IconSize.PX180,
                      }}
                    />
                  </View>
                ) : (
                  <Image
                    source={{
                      uri: String(selectedItem?.image),
                    }}
                    style={styles.itemImage}
                  />
                )}
              </View>

              <View style={styles.itemTextContainer}>
                <Text maxFontSizeMultiplier={1.4} style={styles.itemTitle}>
                  {selectedItem?.foodData?.name}
                </Text>
                {selectedItem?.foodData?.details != '' &&
                selectedItem?.foodData?.details != undefined ? (
                  <Text
                    maxFontSizeMultiplier={1.4}
                    style={styles.SourceTextLabel}>
                    {toTitleCase(selectedItem?.foodData?.details)} |{' '}
                    {getSources(
                      selectedItem?.foodData?.ingredients?.[0]?.metadata
                        ?.foodOrigins || [],
                    )}
                  </Text>
                ) : (
                  <Text
                    maxFontSizeMultiplier={1.4}
                    style={styles.SourceTextLabel}>
                    {getSources(
                      selectedItem?.foodData?.ingredients?.[0]?.metadata
                        ?.foodOrigins || [],
                    )}
                  </Text>
                )}
              </View>
              {isFrom === 5 ? (
                <></>
              ) : (
                <TouchableOpacity
                  onPress={handleFavorite}
                  style={styles.favoriteButton}>
                  <Image
                    source={
                      isFavourite
                        ? require('../../../../assets/images/heartred.png')
                        : require('../../../../assets/images/heartlight.png')
                    }
                    style={styles.favoriteImage}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.ingreMarContainer}>
              <View style={styles.ingredientsContainer}>
                {isFrom != 3 && !isScanned && (
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: moderateScale(10),
                        marginVertical: moderateScale(10),
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        maxFontSizeMultiplier={1.4}
                        style={styles.ingredientLabel}>
                        Recipe
                      </Text>
                      <TouchableOpacity
                        style={{marginRight: moderateScale(15)}}
                        onPress={() => {
                          //TO open Custom Food Popup &
                          // handleEditIngredient();
                          setRecipeModalVisible(true);
                          showedCROnce.current = false;
                        }}>
                        <Text
                          maxFontSizeMultiplier={1.4}
                          style={styles.editButtonText}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={styles.custonFoodQuantityText}
                      maxFontSizeMultiplier={1.4}>
                      {servingSize} {unit}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: moderateScale(10),
                    marginVertical: moderateScale(10),
                  }}>
                  <Text
                    maxFontSizeMultiplier={1.4}
                    style={styles.ingredientLabel}>
                    Ingredients
                  </Text>
                  {!(isFrom !== 3 && !isScanned) && (
                    <TouchableOpacity
                      onPress={() => {
                        setIngredientInfo(true);
                      }}>
                      <Image
                        source={require('../../../../assets/images/info.png')}
                        tintColor={isFavorite && AppColors.buttonDarkBlue}
                        style={styles.infoIcon}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <Text
                  maxFontSizeMultiplier={1.4}
                  style={styles.ingrdeintTextLabel}>
                  {isFrom != 3 && !isScanned
                    ? selectedItem &&
                      selectedItem.toppings &&
                      selectedItem.toppings.length > 0
                      ? selectedItem.toppings.map(item => item.name).join(', ')
                      : 'please add your ingredients'
                    : selectedItem &&
                      selectedItem.foodData &&
                      selectedItem.foodData.ingredients &&
                      selectedItem.foodData.ingredients.length > 0
                    ? selectedItem.foodData.ingredients
                        .map(item => item.name)
                        .join(', ')
                    : 'please add your ingredients'}
                </Text>
              </View>
            </View>

            <Text style={styles.inTakeTitle} maxFontSizeMultiplier={1.4}>
              Amount
            </Text>

            {isFrom != 3 && !isScanned && (
              <Text style={styles.ateText} maxFontSizeMultiplier={1.4}>
                From this recipe I ate:
              </Text>
            )}
            {/* InTake textfield view */}
            {isFrom != 3 && !isScanned ? (
              <View
                style={{
                  flex: 1,
                  height: verticalScale(50),
                  marginHorizontal: moderateScale(15),
                  marginTop: moderateScale(15),
                  paddingLeft: 0,
                  paddingRight: moderateScale(15),
                  flexDirection: 'row',
                  borderWidth: moderateScale(1),
                  borderColor: '#ccc',
                  borderRadius: moderateScale(8),
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}>
                <TouchableOpacity
                  style={[styles.IntakeTextField, {justifyContent: 'center'}]}
                  onPress={() => {
                    setIntakeModalVisible(true);
                  }}>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: AppFontSize.intersize16,
                      fontWeight: AppWeights.interMedium,
                      fontFamily: AppFonts.interMedium,
                      color: AppColors.headingBlack,
                    }}>
                    {intakeValue === '0' && intakeUnit === '%'
                      ? '100'
                      : intakeValue}
                  </Text>
                </TouchableOpacity>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{
                    color: AppColors.buttonDarkBlue,
                    fontSize: AppFontSize.intersize16,
                    fontWeight: AppWeights.interMedium,
                    fontFamily: AppFonts.interMedium,
                  }}>
                  {intakeUnit != 'Percentage' ? intakeUnit : '%'}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  height: verticalScale(50),
                  marginHorizontal: 0,
                  marginTop: moderateScale(15),
                  paddingHorizontal: moderateScale(10),
                  flexDirection: 'row',
                  backgroundColor: 'transparent',
                }}>
                <TextInput
                  maxFontSizeMultiplier={1.3}
                  style={[
                    styles.selectedQuantitytextField,
                    focusedField === 'selectedQuantity' && styles.focusedBorder,
                  ]}
                  keyboardType="numeric"
                  returnKeyType="done"
                  placeholderTextColor={AppColors.textGrey}
                  placeholder="#Serving"
                  onFocus={() => setFocusedField('selectedQuantity')}
                  onBlur={() => {
                    setFocusedField(null);
                    // Also update when input loses focus
                    let numValue = parseFloat(servingSize);
                    dispatch(
                      updateSelectedQuantityAndSize({
                        selectedQuantity: isNaN(numValue) ? 0 : numValue,
                        selectedUnit: String(unit),
                      }),
                    );
                  }}
                  onChangeText={text => {
                    // Handle various decimal input patterns
                    const sanitizedText = text.trim();

                    // Allow empty input
                    if (sanitizedText === '') {
                      setServingSize('');
                      // dispatch(
                      //   updateSelectedQuantityAndSize({
                      //     selectedQuantity: 0,
                      //     selectedUnit: String(unit),
                      //   }),
                      // );
                      return;
                    }

                    // Validate decimal input patterns
                    const decimalPattern =
                      /^(?!00)(?:\d*\.?\d{0,2}|\.\d{0,2})$/;
                    if (!decimalPattern.test(sanitizedText)) {
                      return;
                    }

                    // Handle special cases like ".5" or "0.5"
                    if (sanitizedText.startsWith('.')) {
                      setServingSize(`0${sanitizedText}`);
                    } else {
                      setServingSize(sanitizedText);
                    }

                    // Update the value immediately when text changes
                    let numValue = parseFloat(sanitizedText);
                    dispatch(
                      updateSelectedQuantityAndSize({
                        selectedQuantity: isNaN(numValue) ? 0 : numValue,
                        selectedUnit: String(unit),
                      }),
                    );
                  }}
                  onEndEditing={() => {
                    // Convert input to proper number format
                    let numValue = parseFloat(servingSize);
                    dispatch(
                      updateSelectedQuantityAndSize({
                        selectedQuantity: isNaN(numValue) ? 0 : numValue,
                        selectedUnit: String(unit),
                      }),
                    );
                  }}
                  value={servingSize}
                />

                <TouchableOpacity
                  style={[
                    styles.selectedUnittextField,
                    {justifyContent: 'center'},
                  ]}
                  onPress={() => {
                    handleServingSizeClose();
                  }}>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{
                      alignSelf: 'flex-start',
                      color: AppColors.titleColorOne,
                      fontSize: AppFontSize.intersize16,
                      fontWeight: AppWeights.interMedium,
                      fontFamily: AppFonts.interMedium,
                    }}>
                    {unit}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Date Container View */}
            <View style={styles.dateContainer}>
              <Text maxFontSizeMultiplier={1.4} style={styles.dateLabel}>
                Date & Time{' '}
                <Text maxFontSizeMultiplier={1.4} style={styles.dateLabelOp}>
                  (Optional)
                </Text>
              </Text>
              <View style={styles.row}>
                <TouchableOpacity
                  disabled={isFromFoodJournal}
                  onPress={() => {
                    setDateChooser(true);
                  }}
                  style={styles.box}>
                  <Text maxFontSizeMultiplier={1.2} style={[styles.boxText]}>
                    {moment(currentDate, 'DD MMMM YYYY').format('MMM DD, YYYY')}
                  </Text>
                  <Image
                    style={styles.dateImg}
                    resizeMode="contain"
                    source={require('../../../../assets/images/date.png')}
                  />
                </TouchableOpacity>
                <View style={[{width: moderateScale(10)}]}></View>
                <TouchableOpacity
                  disabled={isFromFoodJournal}
                  style={styles.box}
                  onPress={handleTimePicker}>
                  <Text maxFontSizeMultiplier={1.2} style={styles.boxText}>
                    {(isFrom === 5 && dateLogged == "" && !isFromRecent) ? " " : moment(changedTime).format('h:mm a')}
                    {/* {formatTime(changedTime)} */}
                  </Text>
                  <Image
                    style={styles.dateImg}
                    resizeMode="contain"
                    source={require('../../../../assets/images/time.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* Add Toppings View */}
            {(isFrom === 3 || isScanned) && (
              <View style={styles.ingredientContainer}>
                <View style={styles.ingredientHeader}>
                  <View style={styles.ingreWrapper}>
                    <Text maxFontSizeMultiplier={1.4} style={styles.dateLabel}>
                      Add-ons
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setInfoAlert(true);
                      }}>
                      <Image
                        source={require('../../../../assets/images/info.png')}
                        style={styles.infoIcon}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={handleAddIngredient}
                    style={styles.editButton}>
                    <Text
                      maxFontSizeMultiplier={1.4}
                      style={styles.editButtonText}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* <View style={styles.separator} /> */}

                {/* { */}

                <TouchableOpacity
                  style={styles.ingredientCard}
                  onPress={() => {
                    if (
                      selectedItem?.toppings &&
                      selectedItem?.toppings.length > 0
                    ) {
                      handleEditIngredient();
                    } else {
                      handleAddIngredient();
                    }
                  }}>
                  {selectedItem &&
                  selectedItem.toppings &&
                  selectedItem.toppings.length > 0 ? (
                    <Text
                      maxFontSizeMultiplier={1.4}
                      style={{
                        color: '#252D2C',
                        fontFamily: AppFonts.interRegular,
                        fontSize: AppFontSize.intersize16,
                        fontWeight: AppWeights.interRegular,
                      }}>
                      {selectedItem.toppings.map(item => item.name).join(', ')}
                    </Text>
                  ) : (
                    <Text
                      maxFontSizeMultiplier={1.4}
                      style={{
                        color: '#999999',
                        fontFamily: AppFonts.interRegular,
                        fontSize: AppFontSize.intersize16,
                        fontWeight: AppWeights.interRegular,
                      }}>
                      Add-ons
                    </Text>
                  )}
                  {selectedItem &&
                    selectedItem.toppings &&
                    selectedItem.toppings.length > 0 && (
                      <Image
                        style={styles.editImg}
                        resizeMode="contain"
                        source={require('../../../../assets/images/Edit.png')}
                      />
                    )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.ingredientContainer}>
              <View style={styles.ingredientHeader}>
                <TouchableOpacity onPress={handleNutritionModal}>
                  <View style={styles.nutritionContainer}>
                    <Text maxFontSizeMultiplier={1.4} style={styles.dateLabel}>
                      {selectedNutritionOption === 1
                        ? 'Nutrition Per Serving'
                        : 'Nutrition Portion Size'}
                    </Text>
                    {isFrom != 3 && !isScanned && (
                      <Image
                        source={require('../../../../assets/images/droparrow.png')}
                        style={styles.nutritionDropdownIcon}
                      />
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setEditNutritionAlert(true);
                  }}>
                  <Text
                    maxFontSizeMultiplier={1.4}
                    style={styles.editButtonText}>
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.separator} />
              {isNutrionDataAdded && (
                <NutritionInfo
                  nutritionData={selectedItem?.nutritions}
                  foodData={selectedItem?.foodData}
                />
              )}
              {isNutrionDataAdded && (
                <MicronutrientsList nutritionData={selectedItem?.nutritions} />
              )}
              <View style={styles.notesContainer}>
                {/* Notes Title */}
                <Text maxFontSizeMultiplier={1.4} style={styles.dateLabel}>
                  Notes
                </Text>

                {/* Notes Text View */}
                <TextInput
                  maxFontSizeMultiplier={1.4}
                  style={styles.noteInput}
                  placeholderTextColor={AppColors.textGrey}
                  placeholder="Enter any additional notes for your meal here"
                  value={note}
                  onChangeText={text => setNote(text)}
                  multiline
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        {!isServingModalVisible && !isShowTimePickerVisible && (
          <View
            style={{
              flex: 0,
              backgroundColor: AppColors.white,
              paddingBottom: moderateScale(15),
            }}>
            <CustomButton
              title={
                isFrom === 5 && !isFromRecent
                  ? 'Save Changes'
                  : AppStrings.logFood
              }
              onPress={() => {
                handleLogFood();
              }}
              style={{
                marginHorizontal: moderateScale(15),
                // marginBottom: 10,
              }}
            />
          </View>
        )}
      </View>
      <ServingSizeBottomSheet
        isServingModalVisible={isServingModalVisible}
        onPress={handleServingSizeClose}
        onSave={handleSaveServingSize}
        onServingGuide={handleServingGuide}
        isServingGuideVisible={isServingGuideVisible}
        // portionSize={portionSize}
        // setPortionSize={setPortionSize}
        // servingSize={servingSize}
        // setServingSize={setServingSize}
        unit={unit}
        setUnit={setUnit}
        isFrom={isFrom}
        servingSizesList={removeLastItemFromServingSizes(
          selectedItem?.foodData.amount.servingSizes,
        )}
        isScanned={isScanned}
      />
      {Platform.OS === 'ios' ? (
        <Modal
          transparent={true}
          visible={showDateChooser}
          animationType="slide"
          onRequestClose={() => setDateChooser(false)}>
          <View style={styles.overlay}>
            <View style={styles.datecontainer}>
              <View style={styles.header}>
                <Text maxFontSizeMultiplier={1.3} style={styles.title}>
                  Date
                </Text>
                <TouchableOpacity onPress={() => setDateChooser(false)}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.closeText}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={
                  isTablet ? {transform: [{scaleX: 1.4}, {scaleY: 1.4}]} : {}
                }>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  minimumDate={
                    orderResponse?.nutrition?.startDateTime
                      ? new Date(orderResponse?.nutrition?.startDateTime)
                      : new Date()
                  }
                  maximumDate={new Date()}
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  onChange={(event, sDate) => {
                    //setDateChooser(false);
                    if (sDate) {
                      setSelectedDate(sDate);
                    }
                  }}
                  textColor={AppColors.buttonDarkBlue}
                />
              </View>
              <TouchableOpacity
                style={styles.setDateButton}
                onPress={() => {
                  setDateChooser(false);
                  setCurrentDate(moment(selectedDate).format('DD MMMM YYYY'));
                }}>
                <Text
                  maxFontSizeMultiplier={1.4}
                  style={GlobalStyles.buttonText}>
                  Set Date
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : (
        showDateChooser && (
          <View
            style={isTablet ? {transform: [{scaleX: 1.4}, {scaleY: 1.4}]} : {}}>
            <DateTimePicker
              value={new Date()}
              mode="date"
              minimumDate={
                orderResponse?.nutrition?.startDateTime
                  ? new Date(orderResponse?.nutrition?.startDateTime)
                  : new Date()
              }
              maximumDate={new Date()}
              display="calendar"
              onChange={(event, sDate) => {
                setDateChooser(false);
                if (event.type === 'set' && sDate) {
                  setCurrentDate(moment(sDate).format('DD MMMM YYYY'));
                }
              }}
            />
          </View>
        )
      )}
      {Platform.OS === 'ios' ? (
        <TimePicker
          isShowTimePickerVisible={isShowTimePickerVisible}
          onPress={handleTimePicker}
          onTimeChange={handleTimeChange}
          time={selectedTime}
          setTime={setSelectedTime}
          onSetTime={handleSetTime}
        />
      ) : (
        isShowTimePickerVisible && (
          <View
            style={isTablet ? {transform: [{scaleX: 1.4}, {scaleY: 1.4}]} : {}}>
            <DateTimePicker
              value={changedTime}
              mode="time"
              display="spinner" // You can also use 'default', 'clock', or 'compact' depending on the look you prefer
              is24Hour={false}
              onChange={onChange}
              textColor={AppColors.buttonDarkBlue}
            />
          </View>
        )
      )}

      <MicroNutritionEditValue
        isEditNutritionVisible={isEditNutritionVisible}
        onPress={handleEditNutrition}
        activeTab={selectedNutritionOptionFromModal}
        setActiveTab={handleNutritionChange}
        onSave={handleMicroNutritionSave}
        microNutritionData={selectedItem?.nutritions}
        onEditValue={handleEditNutritionValue}
        isFrom={isFrom != 3 && !isScanned ? 1 : 2}
      />

      <SlidingContainer
        isVisible={isSlidingContainerVisibleIngredient}
        onClose={handleCloseSlidingContainerIngredient}
        content={slidingContentIngredient}
        height={screenDimensions.height * 0.85}
        bgTransparent={false}
        noHorizontalPadding={false}
      />

      <Modal
        visible={isNutritionModalVisible}
        transparent={true}
        animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={handleNutritionModal}>
          <View style={styles.modalContent}>
            {nutritionOptions.map((item, index) => {
              const isLastItem = index === nutritionOptions.length - 1;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.option, isLastItem && {borderBottomWidth: 0}]}
                  onPress={() => {
                    handleNutritionSelection(item);
                  }}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.optionText}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {isRecipeModalVisible && (
        <CustomRecipeModal
          customRecipeModalVisible={isRecipeModalVisible}
          onAddIngredient={() => {
            showedCROnce.current = false;
            handleCreateCustomRecipe();
          }}
          onDeleteIngredient={ind => {
            dispatch(removeToppingsWithIndex(ind));
            // setToppingsChanged(true);
          }}
          onNext={openQuantityModal}
          ingredientList={selectedItem?.toppings ?? []}
          onClose={() => {
            setRecipeModalVisible(false);
            // setRecipeText('');
            // dispatch(clearSelectedFoodItem());
          }}
          onClear={() => {
            // dispatch(clearSelectedFoodItem());
            // setRecipeText('');
            setRecipeModalVisible(false);
          }}
          recipeName={recipeText}
          setRecipeName={(txt: string) => {
            dispatch(updateName({name: txt}));
            setRecipeText(txt);
          }}
          dataChanged={value => {
            setIsCustomSavedDataChanged(value);
          }}
          onEditIngredient={ind => {
            setRecipeModalVisible(false);
            getFoodItemsForRefCode(selectedItem?.toppings[ind]);
          }}
        />
      )}
      {isQuantityModalVisible && (
        <TotalQuantityModal
          totalQuantityModalVisible={isQuantityModalVisible}
          onNext={(servingSize: ServingSize) => {
            setQuantityModalVisible(false);
            dispatch(
              updateSelectedQuantityAndSize({
                selectedQuantity: Number(totalQuantity),
                selectedUnit: servingSize.unitName,
              }),
            );

            // Allow only here To show the Total Quantity Popup whenever selectedFood updated from create recipe
            showedTQOnce.current = true;
            // navigate(NavigatorNames.receipeCardNew, {
            //   isFrom: 1,
            //   mealType: selectedMeal,
            //   date: date,
            //   isFavorite: false,
            //   type: 'RECIPE',
            //   portionType: 1,
            //   notes: '',
            //   mealId: '',
            //   dateLogged: '',
            //   isScanned: false,
            //   isFromCameraScan: false,
            //   isFromFoodJournal: false,
            //   isDirectLog: true,
            // });
            setDataForNewCustomReceipe(
              Number(totalQuantity),
              servingSize.unitName,
            );
          }}
          save={true}
          onBack={() => {
            showedCROnce.current = false;
            setQuantityModalVisible(false);
            setTimeout(() => {
              setRecipeModalVisible(true);
            }, 500);
          }}
          onClose={() => {
            setQuantityModalVisible(false);
            // setRecipeText('');
            // dispatch(clearSelectedFoodItem());
          }}
          onClear={() => {
            // dispatch(clearSelectedFoodItem());
            // setRecipeText('');
            setQuantityModalVisible(false);
          }}
          servingSize={selectedItem?.foodData?.amount?.selectedUnit ?? ''}
          servingSizes={selectedItem?.foodData?.amount?.servingSizes ?? []}
          totalQuantity={totalQuantity}
          setTotalQuantity={(txt: string) => {
            // dispatch(updateName({name: txt}));
            setTotalQuantity(txt);
          }}
          dataChanged={value => {
            setIsCustomSavedDataChanged(value);
          }}
        />
      )}
      <AlertModal
        alertModalVisible={showInfoAlert}
        title={'Ingredients'}
        message={
          <Text maxFontSizeMultiplier={1.2} style={styles.infoAlertMsg}>
            Want to make changes to this food? Select{' '}
            <Text
              maxFontSizeMultiplier={1.3}
              style={[styles.infoAlertMsg, styles.infoAlertBold]}>
              Add
            </Text>{' '}
            to make edits.
          </Text>
        }
        onClose={() => {
          setInfoAlert(false);
        }}
      />
      {showDeleteAlert && (
        <AlertModal
          alertModalVisible={showDeleteAlert}
          title={'Remove Add-on'}
          message={
            'Are you sure you want to remove the add-on? This action cannot be reversed.'
          }
          buttons={[
            {
              text: 'Cancel',
              onPress: () => {
                setShowDeleteAlert(false);
              },
            },
            {
              text: 'Continue',
              onPress: () => {
                if (
                  deleteIngredientIndex?.current === 0 ||
                  deleteIngredientIndex?.current > 0
                ) {
                  removeIngredient(deleteIngredientIndex.current);
                }
                setShowDeleteAlert(false);
              },
            },
          ]}
          onClose={() => {
            deleteIngredientIndex.current = -1;
            setShowDeleteAlert(false);
          }}
        />
      )}
      {/* Intake Popup can be moved to RecipeCardNew */}
      {intakeModalVisible && (
        <IntakeModal
          intakeModalVisible={intakeModalVisible}
          onClose={function (): void {
            setIntakeModalVisible(false);
          }}
          onClear={function (): void {
            setIntakeModalVisible(false);
          }}
          onSave={(intake: string | number, intakeType: string) => {
            setIntakeModalVisible(false);
            dispatch(
              updateIntakeSize({
                portionSize: Number(intake) ?? intake,
                portionUnit: intakeType,
              }),
            );
          }}
        />
      )}
      <AlertModal
        alertModalVisible={showInfoAlert}
        title={'Add-ons'}
        message={
          'Add toppings, sides, sauces, spreads or additional items to your selected food. Note, this will alter its nutritional values.'
        }
        onClose={() => {
          setInfoAlert(false);
        }}
      />
      <AlertModal
        alertModalVisible={showIngredientInfo}
        title={'Ingredients'}
        message={
          <Text maxFontSizeMultiplier={1.2} style={styles.infoAlertMsg}>
            Want to make changes to this food? Select{' '}
            <Text
              maxFontSizeMultiplier={1.2}
              style={[styles.infoAlertMsg, styles.infoAlertBold]}>
              Add
            </Text>{' '}
            to make edits.
          </Text>
        }
        onClose={() => {
          setIngredientInfo(false);
        }}
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
      <AlertModalMultiple
        alertModalVisible={showMultiButtonModalPassio}
        title={'Log Food'}
        message={
          'Would you like to save to your custom recipe & log the food, or just log the food?'
        }
        buttons={[
          {
            text: 'Save Recipe & Log Food',
            onPress: () => {
              setShowMultiButtonModalPassio(false);
              if (isFrom === 1) {
                handleSaveRecipeAndLogFood();
              } else if (isFrom === 3) {
                setIsSaveNameModalVisible(true);
              }
            },
          },
        ]}
        buttonsExtra={[
          {
            text: 'Log Food',
            onPress: () => {
              setShowMultiButtonModalPassio(false);
              handleLogFoodToMeal();
            },
          },
        ]}
        onClose={() => {
          setShowMultiButtonModalPassio(false);
        }}
        closeIcon={true}
      />
      <AlertModalThree
        alertModalVisible={showMultiButtonModalCustom}
        title={'Log Food'}
        message={
          'Would you like to Update the current recipe, save it as a New recipe or just log the food?'
        }
        buttons={[
          {
            text: 'Update Recipe & Log Food',
            onPress: () => {
              setShowMultiButtonModalCustom(false);
              handleUpdateRecipeAndLogFood();
            },
          },
        ]}
        buttonsExtra={[
          {
            text: 'Save as New Recipe & Log Food',
            onPress: () => {
              setShowMultiButtonModalCustom(false);
              setIsSaveNameModalVisible(true);
            },
          },
        ]}
        buttonsExtraa={[
          {
            text: 'Log Food',
            onPress: () => {
              setShowMultiButtonModalCustom(false);
              handleLogFoodToMeal();
            },
          },
        ]}
        onClose={() => {
          setShowMultiButtonModalCustom(false);
        }}
        closeIcon={true}
      />
      {isSaveNameModalVisible && (
        <SaveRecipeNamePopup
          type={type}
          visible={isSaveNameModalVisible}
          onPress={handleSaveRecipeAndLogFoodSave}
          closeModal={handleSaveClose}
          value={saveNameAs}
          onChangeText={setSaveNameAs}
        />
      )}
      {loader && (
        <View style={styles.loader}>
          <LottieView
            source={require('../../../../assets/lottie/loader.json')} // Update path to your Lottie file
            style={styles.animation}
            autoPlay
            speed={0.8}
            loop
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.lightGreen,
  },
  loader: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  animation: {
    width: verticalScale(150),
    height: verticalScale(150),
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  subContainer: {
    marginTop: moderateScale(16),
    flexDirection: 'column',
    paddingHorizontal: moderateScale(16),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(10),
    justifyContent: 'space-between',
  },
  backButton: {
    paddingRight: moderateScale(26),
    color: AppColors.textHeadingBlack,
  },
  dueHeaderText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 30 : 20,
    borderTopRightRadius: isTablet ? 30 : 20,
    marginTop: moderateScale(24),
  },
  itemCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    marginTop: moderateScale(25),
  },
  itemImage: {
    width: verticalScale(50),
    height: verticalScale(50),
    borderRadius: moderateScale(8),
    marginHorizontal: moderateScale(15),
    backgroundColor: AppColors.lightBlue,
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: AppFontSize.intersize22,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
    textAlign: 'left',
  },
  favoriteButton: {
    width: verticalScale(24),
    height: verticalScale(24),
    marginRight: moderateScale(18),
    marginLeft: moderateScale(10),
  },
  favoriteImage: {
    width: verticalScale(22),
    height: verticalScale(20),
  },
  servingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(15),
    marginTop: moderateScale(25),
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
    width: moderateScale(150),
    height: moderateScale(44),
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
  dateContainer: {
    marginTop: moderateScale(25),
    paddingHorizontal: moderateScale(15),
  },
  dateLabel: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.titleColorOne,
    fontFamily: AppFonts.interSemibold,
  },
  dateLabelOp: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interRegular,
    color: '#33333399',
    fontFamily: AppFonts.interRegular,
    marginBottom: moderateScale(5),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: moderateScale(8),
  },
  box: {
    backgroundColor: AppColors.textFieldBG,
    paddingVertical: moderateScale(15),
    borderColor: AppColors.borderBox,
    borderWidth: moderateScale(1),
    marginHorizontal: 0,
    borderRadius: moderateScale(10),
    flex: 1,
    paddingHorizontal: moderateScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateImg: {width: verticalScale(15), height: verticalScale(15)},
  editImg: {width: verticalScale(20), height: verticalScale(20)},
  boxText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interRegular,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interRegular,
    textAlign: 'left',
  },
  ingredientContainer: {
    marginTop: moderateScale(25),
    marginHorizontal: moderateScale(15),
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(10),
  },
  ingredientLabel: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
  },
  editButtonTextTwo: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.titleColorOne,
    fontFamily: AppFonts.interMedium,
  },
  ingreWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },

  infoIcon: {
    width: verticalScale(17),
    height: verticalScale(17),
    alignSelf: 'center',
    // padding: 2,
    marginLeft: moderateScale(5),
  },
  editButton: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
  },
  editButtonText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.buttonDarkBlue,
    fontFamily: AppFonts.interMedium,
  },
  separator: {
    borderBottomColor: AppColors.textFieldBorderGrey,
    borderBottomWidth: moderateScale(1),
    marginBottom: moderateScale(15),
  },
  ingredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(13),
    borderWidth: moderateScale(1),
    borderColor: AppColors.textFieldHeading,
    borderStyle: 'dashed',
    borderRadius: moderateScale(8),
    justifyContent: 'center',
  },
  ingredientCard: {
    borderWidth: moderateScale(0.5),
    borderColor: '#D4D4D4',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    backgroundColor: '#f9f9fa',
    paddingVertical: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ingredientIconContainer: {
    width: verticalScale(32),
    height: verticalScale(32),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(10),
  },
  ingredentButtonText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonDarkBlue,
    fontFamily: AppFonts.interSemibold,
  },
  nutritionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionDropdownIcon: {
    width: isTablet ? moderateScale(14) : moderateScale(16),
    height: isTablet ? moderateScale(6) : moderateScale(8),
    marginLeft: moderateScale(6),
  },
  notesContainer: {
    flex: 1,
    marginTop: moderateScale(50),
  },
  noteInput: {
    marginTop: moderateScale(10),
    backgroundColor: AppColors.bgLightGrey,
    height: verticalScale(130),
    borderRadius: moderateScale(10),
    padding: moderateScale(15),
    textAlignVertical: 'top',
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldHeading,
    fontFamily: AppFonts.interMedium,
    marginBottom: moderateScale(20),
  },
  ingredientLabelBold: {
    fontSize: AppFontSize.intersize20,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  ingreMarContainer: {marginHorizontal: moderateScale(15)},
  ingredientsContainer: {
    width: '100%',
    backgroundColor: AppColors.lightBlue,
    alignSelf: 'center',
    marginTop: moderateScale(32),
    borderRadius: moderateScale(12),
  },
  ingrdeintTextLabel: {
    color: '#555555',
    fontFamily: AppFonts.interRegular,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interRegular,
    marginLeft: moderateScale(10),
    paddingBottom: moderateScale(20),
  },
  SourceTextLabel: {
    color: '#555555',
    fontFamily: AppFonts.interRegular,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interRegular,
  },

  ingredientListContainer: {
    marginTop: moderateScale(18),
    marginBottom: moderateScale(50)
  },
  ingredientCustomizeContainer: {
    flex: 1,
  },
  mt12: {
    marginTop: moderateScale(12),
  },
  ingredientList: {},
  ingredientListItem: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldHeading,
    fontFamily: AppFonts.interMedium,
    //lineHeight: scale(20),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center', // Align content to the top
    alignItems: 'center', // Center the content horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add some transparency for the backdrop
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    width: moderateScale(200),
    justifyContent: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
  },
  option: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: AppColors.bgLightGrey,
  },
  optionText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  contentContainerFlextGrow: {
    flexGrow: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: AppFontSize.intersize20,
    fontFamily: AppFonts.interSemibold,
    fontWeight: AppWeights.interSemibold,
    color: '#333333',
    marginBottom: moderateScale(5),
  },
  emptyDesc: {
    marginTop: moderateScale(5),
    fontSize: AppFontSize.intersize15,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    color: '#999999',
    marginHorizontal: moderateScale(20),
  },
  inTakeTitle: {
    paddingHorizontal: moderateScale(15),
    marginTop: moderateScale(25),
    color: AppColors.titleColorOne,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
  },
  ateText: {
    paddingHorizontal: moderateScale(15),
    marginTop: moderateScale(3),
    color: AppColors.descColor,
    fontSize: AppFontSize.intersize14,
    fontWeight: AppWeights.interRegular,
    fontFamily: AppFonts.interRegular,
  },
  selectedQuantitytextField: {
    // flex: 1,
    color: AppColors.titleColorOne,
    height: verticalScale(50),
    marginHorizontal: moderateScale(5),
    borderWidth: moderateScale(1),
    borderColor: '#ccc',
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(10),
    width: screenDimensions.width / 3,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
  },
  selectedUnittextField: {
    flex: 1,
    height: verticalScale(50),
    marginHorizontal: moderateScale(5),
    borderWidth: moderateScale(1),
    borderColor: '#ccc',
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(10),
  },
  IntakeTextField: {
    flex: 1,
    height: verticalScale(50),
    marginHorizontal: moderateScale(5),
    paddingHorizontal: moderateScale(10),
  },
  focusedBorder: {
    borderColor: '#007AFF',
  },
  custonFoodQuantityText: {
    color: AppColors.headingBlack,
    fontWeight: AppWeights.interSemibold,
    fontSize: AppFontSize.intersize26,
    fontFamily: AppFonts.interSemibold,
    marginLeft: moderateScale(10),
  },
  infoAlertMsg: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interRegular,
    marginBottom: moderateScale(20),
    fontWeight: AppWeights.interRegular,
    //lineHeight: scale(18),
    color: '#000000',
    textAlign: 'center',
  },
  infoAlertBold: {
    fontFamily: AppFonts.interSemibold,
    fontWeight: AppWeights.interSemibold,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  datecontainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: isTablet ? 30 : 20,
    borderTopRightRadius: isTablet ? 30 : 20,
    padding: moderateScale(20),
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: moderateScale(20),
    marginLeft: moderateScale(15),
    marginTop: moderateScale(5),
  },
  title: {
    fontSize: AppFontSize.intersize20,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  closeText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonTextBlue,
    fontFamily: AppFonts.interSemibold,
    textAlign: 'right',
    marginRight: moderateScale(15),
    marginTop: moderateScale(5),
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  setDateButton: {
    backgroundColor: AppColors.buttonDarkBlue,
    height: verticalScale(45),
    borderRadius: moderateScale(60),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(15),
    marginTop: moderateScale(35),
    width: '97%',
  },
});
