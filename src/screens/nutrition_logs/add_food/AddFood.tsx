/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
// @ts-ignore

import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  FlatList,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import {AppColors} from '../../../theme/AppColors';
import {Icon} from 'react-native-elements';
import GlobalStyles from '../../../styles/GlobalStyles';
import {AppStrings} from '../../../utils/Constants';
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {screenDimensions} from '../../../utils/ScreenDimensions';
import {navigateBack, navigate} from '../../../navigators/utils/Utils';
import {AppFonts, AppFontSize, AppWeights} from '../../../theme/AppFonts';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';
import {NavigatorNames} from '../../../navigators/tabs/NavigatorsNames';
import {
  getNutritionMeaList,
  removeNutritionMeal,
  updateNutritionMealFavorite,
  getFoodImageURL,
  getRecentMeaList,
  getFavouriteMealList,
  getFoodorReceipeMealList,
  deleteNutritionMeal,
  postFoodDataSpecificMeal,
} from '../../../services/foodService';
import {Alert} from 'react-native';
import ReceipeItem from '../../../components/ReceipeItem.tsx';
import {
  convertToDateAndTime,
  formatTime,
  toTitleCase,
  truncateText,
} from '../../../utils/Helper.tsx';
import {FoodItem} from '../../../models/FoodJournalModel.ts';
import SearchBar from '../../../components/SearchBar.tsx';
import {FoodItemModel, IntakeModel} from '../../../models/FoodJournalModel';
import {
  addSelectedFoodItem,
  clearSelectedFoodItem,
  removeToppingsWithIndex,
  updateName,
  updateNameAndImage,
  updatePortionAndServingSize,
  updateSelectedQuantityAndSize,
} from '../../../store/slices/selectedFoodSlice';
import {useDispatch, useSelector} from 'react-redux';
import {
  PassioFoodItem,
  PassioNutrients,
  UnitMass,
  PassioSDK,
  ServingUnit,
  ServingSize,
  PassioFoodAmount,
} from '@passiolife/nutritionai-react-native-sdk-v3';
//import {ActivityIndicator} from 'react-native-paper';
import {NewFoodPopup} from '../../../components/NewFoodPopup.tsx';
import Header from '../../../components/Header.tsx';
import {NutrientsModel} from '../../../models/FoodJournalModel';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {
  IconSize,
  PassioIconView,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import moment from 'moment';
import CustomRecipeModal from '../../../components/CreateRecipeModal.tsx';
import TotalQuantityModal from '../../../components/TotalQuantityModal.tsx';
import AlertModal from '../../../components/AlertModal.tsx';
import {additionOfNutritionValuesFromPassioIngrdients} from './nutritionContants';
import {AlertButtons} from '../../../types/CommonTypes.tsx';
import {RootState} from '../../../store/Store.ts';
import {OrderResponseModel} from '../../../models/OrderModel.ts';
import {setIngredientEditFalse} from '../../../store/slices/ingredientsEditSlice';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import SystemNavigationBar from 'react-native-system-navigation-bar';
function AddFood({route}: any) {
  const {mealType, date, isFromScanNewFood} = route.params;
  const [selectedMeal, setSelectedMeal] = useState(mealType);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isRecipeModalVisible, setRecipeModalVisible] = useState(false);
  const [isQuantityModalVisible, setQuantityModalVisible] = useState(false);
  const [isFoodModalVisible, setFoodModalVisible] = useState(false);
  const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const [recipeText, setRecipeText] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');
  const [foodText, setFoodText] = useState('');

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | ReactElement>('');
  const [alertButtons, setAlertButtons] = useState<AlertButtons>();

  const [nutritionMealsList, setNutritionMealsList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [recording, setRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [detectedCandidates, setDetectedCandidates] = useState([]);
  const [isEndReachedCalled, setEndReachedCalled] = useState(false);

  const selectedItem: FoodItemModel | null = useSelector(
    (state: any) => state.selectedFood.data,
  );
  const ingiedientsEdited: Boolean = useSelector(
    (state: any) => state.ingredientsEdit.ingredients_edited,
  );

  interface ItemsRouteProps {
    mealsList: FoodItem[];
    updateFavorite?: (id: string, status: boolean) => void;
    handleRemoveItem?: (item: any) => void;
    handleDetailsNavigation: (item: any) => void;
  }

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

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'recent', title: 'Recent'},
    // {key: 'favorites', title: 'Favorite'},
    {key: 'favorites', title: 'Favorites'},
    {key: 'myrecipes', title: 'Custom\nRecipe'},
    // {key: 'myrecipes', title: 'My Recipe'},
    // {key: 'myfoods', title: 'My Food'},
  ]);
  const dispatch = useDispatch();
  const [data, setData] = useState({
    recent: [],
    favorites: [],
    myrecipes: [],
    myfoods: [],
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const showedCROnce = useRef(false);
  const showedTQOnce = useRef(false);
  const isFocused = useIsFocused();
  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        setRecipeText(selectedItem?.foodData?.name ?? '');
        if (
          selectedItem?.foodData?.amount?.weight?.value &&
          selectedItem?.foodData?.amount?.weight?.value !== 0 &&
          showedTQOnce.current
        ) {
          setQuantityModalVisible(true);
        } else if (
          selectedItem?.foodData?.name &&
          selectedItem?.foodData?.name !== '' &&
          !(
            selectedItem?.foodData?.amount?.weight?.value &&
            selectedItem?.foodData?.amount?.weight?.value !== 0
          ) &&
          !showedCROnce.current
        ) {
          setRecipeModalVisible(true);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItem, isFocused]),
  );
  useEffect(() => {
    if (ingiedientsEdited) {
      dispatch(setIngredientEditFalse());
    }
  }, [ingiedientsEdited]);

  // Function to fetch data based on the selected tab (index)
  const fetchData = async (selectedKey: string, pageNum: number) => {
    setLoading(true);
    let result = [];
    try {
      switch (selectedKey) {
        case 'recent':
          result = await fetchRecentAPI(pageNum);
          break;
        case 'favorites':
          result = await fetchFavoritesAPI(pageNum);
          break;
        case 'myrecipes':
          result = await fetchMyRecipesAPI(pageNum);
          break;
        case 'myfoods':
          result = await fetchMyFoodsAPI(pageNum);
          break;
        default:
          break;
      }
      setData(prevData => ({
        ...prevData,
        [selectedKey]:
          pageNum === 1 ? result : [...prevData[selectedKey], ...result],
      }));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the tab is switched
  useEffect(() => {
    setPage(1); // Reset pagination to first page on tab switch
    setLimit(10);
    setHasNextPage(true);
    fetchData(routes[index].key, 1); // Fetch first page data for the selected tab
  }, [index]);

  const clearAlert = () => {
    setShowAlert(false);
    setAlertTitle('');
    setAlertMessage('');
    setAlertButtons(undefined);
  };

  // Load more data for pagination
  const loadMoreData = () => {
    if (!loading && routes[index].key != 'recent' && hasNextPage) {
      setPage(prevPage => prevPage + 1);
      setLimit(preLimit => preLimit + 10);

      fetchData(routes[index].key, page + 1);
    }
  };

  // Refresh function for pull-to-refresh
  const refreshData = () => {
    //setRefreshing(true);

    setPage(1);
    setLimit(10);
    setHasNextPage(true);

    fetchData(routes[index].key, 1).then(() => setRefreshing(false));
  };

  useFocusEffect(
    useCallback(() => {
      if (isFromScanNewFood) {
        setFoodModalVisible(true);
      }
    }, [route.params]),
  );
  useFocusEffect(
    useCallback(() => {
      SystemNavigationBar.navigationHide();
    }, []),
  );
  // Update favorite status
  const handleUpdateFavorite = async (id: string, item) => {
    setLoading(true);
    try {
      await updateNutritionMealFavorite(
        id,
        item.isDirectLog != undefined ? item.isDirectLog : false,
      );
      refreshData();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
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
      //
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
    } catch (error: any) {}
  };

  const fetchFoodImage = async (foodType: number) => {
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

    if (foodType === 1) {
      try {
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
        const data: FoodItemModel = {
          foodData: foodData,
          nutritions: nutrientsValue,
          toppings: null,
          image: response.data.imageURL,
        };
        showedCROnce.current = true;
        dispatch(addSelectedFoodItem(data));
        // set below false to avoid showing the Total Quantity Popup whenever selectedFood updated from other ways except create recipe
        showedTQOnce.current = false;
        navigate(NavigatorNames.receipeCardNew, {
          isFrom: 1,
          isFromRecent: false,
          mealType: selectedMeal,
          date: date,
          isFavorite: false,
          type: 'RECIPE',
          portionType: 1,
          notes: '',
          mealId: '',
          dateLogged: '',
          isScanned: false,
          isFromCameraScan: false,
          isFromFoodJournal: false,
          isDirectLog: true,
        });
      } catch (error: any) {}
    } else {
      try {
        const response = await getFoodImageURL(foodText);

        setFoodText('');
        // @ts-ignore
        const foodData: PassioFoodItem = {
          name: response.data.foodName,
          iconId: '',
          refCode: '',
          id: '',
          amount: amountData,
          ingredients: null,
          ingredientWeight: null,
        };
        const data: FoodItemModel = {
          foodData: foodData,
          nutritions: nutrientsValue,
          toppings: null,
          image: response.data.imageURL,
        };
        showedCROnce.current = true;
        dispatch(addSelectedFoodItem(data));
        // set below false to avoid showing the Total Quantity Popup whenever selectedFood updated from other ways except create recipe
        showedTQOnce.current = false;
        navigate(NavigatorNames.receipeCardNew, {
          isFrom: 2,
          isFromRecent: false,
          mealType: selectedMeal,
          date: date,
          isFavorite: false,
          type: 'RECIPE',
          portionType: 1,
          notes: '',
          mealId: '',
          dateLogged: '',
          isScanned: false,
          isFromCameraScan: false,
          isFromFoodJournal: false,
          isDirectLog: true,
        });
      } catch (error: any) {}
    }
  };

  // Handle details screen navigation
  const handleDetailsNavigation = (item: any, isRecentOrFav: boolean) => {
    const data: FoodItemModel = convertToFoodItemModel(item);
    showedCROnce.current = true;
    dispatch(addSelectedFoodItem(data));
    // set below false to avoid showing the Total Quantity Popup whenever selectedFood updated from other ways except create recipe
    showedTQOnce.current = false;
    navigate(NavigatorNames.receipeCardNew, {
      isFrom: isRecentOrFav ? 5 : 4,
      isFromRecent: isRecentOrFav ?? false,
      isFavorite: item.isfavorite,
      type: item.type,
      portionType: item.metadata.data.type,
      notes: item.metadata.data.notes,
      mealType: selectedMeal,
      mealId: item.id,
      date: date,
      dateLogged: item.metadata.data.dateandtime,
      isScanned: item.isScanned,
      isFromCameraScan: false,
      isFromFoodJournal: false,
      isDirectLog: item.isDirectLog != undefined ? item.isDirectLog : false,
    });
  };

  // Handle details screen navigation for search Items
  const handleDetailsNavigationSearch = async (item: any) => {
    const passioFoodItem = await PassioSDK.fetchFoodItemForDataInfo(item);
    const data: FoodItemModel = convertToFoodItemModelSearch(passioFoodItem);
    showedCROnce.current = true;
    dispatch(addSelectedFoodItem(data));
    // set below false to avoid showing the Total Quantity Popup whenever selectedFood updated from other ways except create recipe
    showedTQOnce.current = false;
    navigate(NavigatorNames.receipeCardNew, {
      isFrom: 3,
      isFromRecent: false,
      mealType: selectedMeal,
      date: date,
      isFavorite: false,
      type: 'FOOD',
      portionType: 1,
      notes: '',
      mealId: '',
      dateLogged: '',
      isScanned: false,
      isFromCameraScan: false,
      isFromFoodJournal: false,
      isDirectLog: true,
    });
  };

  // Convert to food item model
  const convertToFoodItemModel = (input: any): FoodItemModel => {
    const nutrientsValue: NutrientsModel = {
      weight: input.metadata.data.nutritions.weight,
      vitaminA: input.metadata.data.nutritions.vitaminA,
      calcium: input.metadata.data.nutritions.calcium,
      calories: input.metadata.data.nutritions.calories,
      carbs: input.metadata.data.nutritions.carbs,
      cholesterol: input.metadata.data.nutritions.cholesterol,
      fat: input.metadata.data.nutritions.fat,
      fibers: input.metadata.data.nutritions.fibers,
      iron: input.metadata.data.nutritions.iron,
      polyunsaturatedFat: input.metadata.data.nutritions.polyunsaturatedFat,
      potassium: input.metadata.data.nutritions.potassium,
      protein: input.metadata.data.nutritions.protein,
      satFat: input.metadata.data.nutritions.satFat,
      sodium: input.metadata.data.nutritions.sodium,
      sugars: input.metadata.data.nutritions.sugars,
      transFat: input.metadata.data.nutritions.transFat,
      vitaminC: input.metadata.data.nutritions.vitaminC,
      vitaminD: input.metadata.data.nutritions.vitaminD,
    };
    const foodItemModel: FoodItemModel = {
      foodData: input.metadata.data.foodData as PassioFoodItem,
      nutritions: nutrientsValue as NutrientsModel,
      toppings: input.metadata.data.toppings,
      intake: input.metadata.data.intake,
      image: input.metadata.data.image,
    };

    return foodItemModel;
  };

  // Convert to food item model for search
  const convertToFoodItemModelSearch = (input: any): FoodItemModel => {
    const nutrientsValue: NutrientsModel = {
      weight: input.ingredients[0]?.referenceNutrients.weight,
      vitaminA: input.ingredients[0]?.referenceNutrients.vitaminA,
      calcium: input.ingredients[0]?.referenceNutrients.calcium,
      calories: input.ingredients[0]?.referenceNutrients.calories,
      carbs: input.ingredients[0]?.referenceNutrients.carbs,
      cholesterol: input.ingredients[0]?.referenceNutrients.cholesterol,
      fat: input.ingredients[0]?.referenceNutrients.fat,
      fibers: input.ingredients[0]?.referenceNutrients.fibers,
      iron: input.ingredients[0]?.referenceNutrients.iron,
      polyunsaturatedFat:
        input.ingredients[0]?.referenceNutrients.polyunsaturatedFat,
      potassium: input.ingredients[0]?.referenceNutrients.potassium,
      protein: input.ingredients[0]?.referenceNutrients.protein,
      satFat: input.ingredients[0]?.referenceNutrients.satFat,
      sodium: input.ingredients[0]?.referenceNutrients.sodium,
      sugars: input.ingredients[0]?.referenceNutrients.sugars,
      transFat: input.ingredients[0]?.referenceNutrients.transFat,
      vitaminC: input.ingredients[0]?.referenceNutrients.vitaminC,
      vitaminD: input.ingredients[0]?.referenceNutrients.vitaminD,
    };
    const foodItemModel: FoodItemModel = {
      foodData: {
        id: input.id,
        name: input.name,
        amount: input.amount,
        iconId: input.iconId,
        refCode: input.refCode,
        ingredients: input.ingredients,
        ingredientWeight: input.ingredientWeight,
        details: input.details,
      } as PassioFoodItem,
      nutritions: nutrientsValue as NutrientsModel,
      toppings: null,
      image: '',
    };

    return foodItemModel;
  };

  // Handle removing the item
  const handleRemoveItem = async (id: string) => {
    try {
      await removeNutritionMeal(id);
      refreshData();
    } catch (error: any) {}
  };

  const handleBackPress = () => {
    dispatch(clearSelectedFoodItem());
    navigateBack();
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleMealSelect = (meal: any) => {
    setSelectedMeal(meal);
    toggleModal();
  };

  const fetchImg = async () => {
    try {
      const response = await getFoodImageURL(recipeText);
      dispatch(
        updateNameAndImage({name: recipeText, image: response.data.imageURL}),
      );
    } catch {
      // handle duplicate name error
    }
  };

  const openQuantityModal = async () => {
    if (
      recipeText &&
      selectedItem?.toppings &&
      selectedItem?.toppings.length > 0
    ) {
      try {
        setRecipeModalVisible(false);
        showedCROnce.current = true;
        fetchImg();
        setTimeout(() => {
          setQuantityModalVisible(true);
        }, 100);
      } catch (e) {}
    }
  };
  const handleCreateCustomRecipe = () => {
    if (recipeText) {
      setRecipeModalVisible(false);
      addIngredient();
    } else {
      clearAlert();
      setRecipeModalVisible(false);
      setAlertTitle('Please enter a Recipe Name');
      setAlertButtons([
        {
          text: 'Ok',
          onPress: () => {
            setRecipeModalVisible(true);
          },
        },
      ]);
      setShowAlert(true);
    }
  };
  // const handleCreateRecipe = () => {
  //   if (recipeText) {
  //     setRecipeModalVisible(false);
  //     fetchFoodImage(1);
  //   } else {
  //   }
  // };

  function roundToTwoDecimals(num: number): number {
    return Math.round(num);
  }

  const handleCreateFood = () => {
    if (foodText) {
      setFoodModalVisible(false);
      fetchFoodImage(2);
    } else {
      clearAlert();
      setFoodModalVisible(false);
      setAlertTitle('Please enter a Food Name');
      setAlertButtons([
        {
          text: 'Ok',
          onPress: () => {
            setFoodModalVisible(true);
          },
        },
      ]);
      setShowAlert(true);
    }
  };

  const handleCloseRecipeModal = () => {
    setRecipeModalVisible(false);
  };

  const handleMyRecipe = () => {
    setRecipeModalVisible(false);
    setIndex(2);
  };

  const handleCloseFoodModal = () => {
    setFoodModalVisible(false);
  };

  const getFoodItemsForText = async (text: string) => {
    try {
      const passioFoodItem: any = await PassioSDK?.searchForFoodSemantic(text);

      setIsSearching(false);

      if (passioFoodItem?.results != null) {
        setDetectedCandidates(passioFoodItem?.results);
      } else {
        setDetectedCandidates([]);
      }
    } catch (error) {
      setIsSearching(false);
      setDetectedCandidates([]);
    }
  };

  const renderSearchResultsContent = () => {
    const listToRender =
      detectedCandidates.length > 0 ? detectedCandidates : [];

    if (listToRender.length === 0) {
      return (
        <View style={styles.noRecordsContainer}>
          <Text maxFontSizeMultiplier={1.4} style={styles.noRecordsText}>
            No records found
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={listToRender}
        keyExtractor={(item, index) =>
          item?.resultId?.toString() || index.toString()
        }
        renderItem={({item, index}) => {
          const isLastItem = index === listToRender.length - 1;
          const customizedItem = {
            ...item,
            id: item?.resultId,
            receipe: item?.foodName,
            calories: item?.nutritionPreview?.calories,
            quantity: `${item?.nutritionPreview?.servingQuantity} ${item?.nutritionPreview?.servingUnit}`,
            image: item?.iconID,
            brandName: item?.brandName,
          };
          return (
            <ReceipeItem
              rawItem={item}
              type="search"
              key={index}
              item={customizedItem}
              isLastItem={isLastItem}
              truncateText={truncateText}
              actionBtnNeed={false}
              clickHandler={rawItem => {
                Keyboard.dismiss(); // Dismiss keyboard on item click
                handleDetailsNavigationSearch(rawItem);
              }}
            />
          );
        }}
        keyboardShouldPersistTaps="handled" // Allows tap through when keyboard is open
        ListEmptyComponent={
          <View style={styles.noRecordsContainer}>
            <Text maxFontSizeMultiplier={1.4} style={styles.noRecordsText}>
              No records found
            </Text>
          </View>
        }
      />
    );
  };
  const fetchRecentAPI = async pageNum => {
    const response = await getRecentMeaList();
    return response?.data;
  };
  const fetchFavoritesAPI = async pageNum => {
    const response = await getFavouriteMealList(pageNum, 10);
    //
    setHasNextPage(response.hasNextPage);
    return response?.data;
  };
  const fetchMyRecipesAPI = async pageNum => {
    const response = await getFoodorReceipeMealList(pageNum, 10, 'RECIPE');
    setHasNextPage(response.hasNextPage);
    return response?.data;
  };
  const fetchMyFoodsAPI = async pageNum => {
    const response = await getFoodorReceipeMealList(pageNum, 10, 'FOOD');
    setHasNextPage(response.hasNextPage);
    return response?.data;
  };

  const handleLogFoodToMeal = async item => {
    const dateAndTime = moment(date)
      .set({
        hour: moment().hour(),
        minute: moment().minute(),
        second: moment().second(),
      })
      .format('YYYY-MM-DDTHH:mm:ssZ');
    const updatedData = {
      id: item.id,
      type: item.type,
      isfavorite: item.isfavorite,
      active: item.active,
      isDirectLog: item.isDirectLog != undefined ? item.isDirectLog : false,
      isScanned: item.isScanned,
      metadata: {
        data: {
          type: item.metadata.data.type,
          dateandtime: dateAndTime,
          notes: item.metadata.data.notes,
          foodData: item.metadata.data.foodData,
          nutritions: item.metadata.data.nutritions,
          image: item.metadata.data.image,
          toppings: item.metadata.data.toppings,
          intake: item.metadata.data.intake,
        },
      },
    };
    try {
      await postFoodDataSpecificMeal(
        updatedData,
        orderId,
        metadataId,
        nutritionAnalysisId,
        date,
        selectedMeal,
      );
      dispatch(clearSelectedFoodItem());
      navigateBack();
    } catch (error: any) {}
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
      navigate(NavigatorNames.receipeCardNew, {
        isFrom: 1,
        isFromRecent: false,
        mealType: selectedMeal,
        date: date,
        isFavorite: false,
        type: 'RECIPE',
        portionType: 1,
        notes: '',
        mealId: '',
        dateLogged: '',
        isScanned: false,
        isFromCameraScan: false,
        isFromFoodJournal: false,
        isDirectLog: true,
      });
    } catch (error: any) {}
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
  const renderContent = ({route}) => {
    const tabData = data[route.key] ?? [];
    return (
      <>
        {route?.key === 'myrecipes' && (
          <TouchableOpacity
            style={styles.createCard}
            onPress={() => {
              // TO avoid previously store value
              dispatch(clearSelectedFoodItem());
              showedCROnce.current = false;
              setRecipeModalVisible(true);
            }}>
            <View style={styles.addIconContainer}>
              <Image
                style={styles.actionImage}
                source={require('../../../../assets/images/addicon.png')}
              />
            </View>
            <Text maxFontSizeMultiplier={1.3} style={styles.createText}>
              Create Recipe
            </Text>
          </TouchableOpacity>
        )}
        <FlatList
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          data={tabData}
          ListEmptyComponent={
            !loading &&
            (routes[index].key === 'recent' ||
              routes[index].key === 'favorites') ? (
              <View style={styles.emptyComp}>
                <Text maxFontSizeMultiplier={1.3} style={styles.emptyText}>
                  {routes[index].key === 'recent'
                    ? 'No food added recently.'
                    : routes[index].key === 'favorites'
                    ? 'No food is added to Favourites'
                    : ''}
                </Text>
              </View>
            ) : (
              <></>
            )
          }
          contentContainerStyle={!(tabData?.length > 0) && styles.scene}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, idx) => idx.toString()}
          style={{
            marginBottom: moderateScale(200),
            marginHorizontal: moderateScale(20),
            marginTop: moderateScale(20),
          }}
          renderItem={({item}) => (
            <View style={[styles.receipeItem]}>
              <TouchableOpacity
                onPress={() => {
                  handleDetailsNavigation(
                    item,
                    routes[index].key === 'recent' ||
                      routes[index].key === 'favorites'
                      ? true
                      : false,
                  );
                }}
                style={{
                  width: '85%',
                  paddingTop: moderateScale(12),
                  paddingBottom: moderateScale(12),
                  paddingLeft: moderateScale(16),
                }}>
                <View style={styles.flexedRow}>
                  {item.metadata.data.image === '' ? (
                    <View style={styles.receipeItemImage}>
                      <PassioIconView
                        style={styles.receipeItemImage}
                        config={{
                          passioID: item?.metadata?.data?.foodData?.iconId,
                          iconSize: IconSize.PX180,
                        }}
                      />
                    </View>
                  ) : (
                    <Image
                      style={styles.receipeItemImage}
                      source={
                        typeof item.metadata.data.image === 'string'
                          ? {uri: item.metadata.data.image}
                          : item.metadata.data.image
                      }
                    />
                  )}
                  <View
                    style={{
                      marginRight: moderateScale(55),
                      // , backgroundColor: 'red'
                    }}>
                    <Text
                      maxFontSizeMultiplier={1.4}
                      style={styles.title}
                      // numberOfLines={1}
                    >
                      {/* {truncateText(item.metadata.data.foodData.name)} */}
                      {item.metadata.data.foodData.name}
                    </Text>
                    <Text
                      maxFontSizeMultiplier={1.4}
                      style={styles.description}>
                      {item.metadata.data.foodData.details ? toTitleCase(item.metadata.data.foodData.details) : item.metadata.data.foodData.details}
                    </Text>
                    {/* <Text maxFontSizeMultiplier={1.5} style={styles.description}>
                    {roundToTwoDecimals(
                      item.metadata.data.nutritions.calories.value,
                    )}{' '}
                    Cal | {item.metadata.data.foodData.amount.selectedQuantity}{' '}
                    {item.metadata.data.foodData.amount.selectedUnit}
                  </Text> */}
                  </View>
                </View>
              </TouchableOpacity>

              {routes[index].key === 'myrecipes' ||
              routes[index].key === 'myfoods' ? (
                <TouchableOpacity
                  style={{
                    width: '15%',
                    marginLeft: 'auto',
                    marginRight: moderateScale(16),
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    const buttons: AlertButtons = [
                      {text: 'Cancel', onPress: () => {}},
                      {
                        text: 'Continue',
                        onPress: () => {
                          handleRemoveItem(item.id);
                        },
                      },
                    ];
                    setAlertButtons(buttons);
                    setAlertTitle('Remove Food');
                    setAlertMessage(
                      'Are you sure you want to remove the saved food? This action cannot be reversed.',
                    );
                    setShowAlert(true);
                  }}>
                  <Image
                    source={require('../../../../assets/images/deletetheme.png')}
                    resizeMode="contain"
                    style={styles.foodIcon}
                  />
                </TouchableOpacity>
              ) : routes[index].key === 'favorites' ? (
                <TouchableOpacity
                  style={{
                    width: '15%',
                    marginLeft: 'auto',
                    marginRight: moderateScale(16),
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    handleUpdateFavorite(item.id, item);
                  }}>
                  <Image
                    style={styles.actionImageFav}
                    source={
                      item?.isfavorite
                        ? require('../../../../assets/images/heartred.png')
                        : require('../../../../assets/images/heartlight.png')
                    }
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    width: verticalScale(32),
                    height: verticalScale(32),
                    borderRadius: moderateScale(50),
                    marginLeft: 'auto',
                    marginRight: moderateScale(16),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: AppColors.btnBackground,
                  }}
                  onPress={() => {
                    clearAlert();
                    setAlertTitle('Quick Log');
                    setAlertMessage(
                      <Text
                        maxFontSizeMultiplier={1.3}
                        style={GlobalStyles.message}>
                        You’re about to add{' '}
                        <Text
                          style={GlobalStyles.messageBold}
                          maxFontSizeMultiplier={1.3}>
                          {item.metadata.data.foodData.name}{' '}
                          <Text
                            style={GlobalStyles.message}
                            maxFontSizeMultiplier={1.3}>
                            to
                          </Text>{' '}
                          {selectedMeal}
                        </Text>
                      </Text>,
                    );
                    setAlertButtons([
                      {text: 'Cancel', onPress: () => {}},
                      {
                        text: 'Ok',
                        onPress: () => {
                          handleLogFoodToMeal(item);
                        },
                      },
                    ]);
                    setShowAlert(true);
                  }}>
                  <Image
                    style={styles.actionImage}
                    source={require('../../../../assets/images/addicon.png')}
                    tintColor={item?.isfavorite && AppColors.buttonDarkBlue}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
          onEndReached={() => {
            if (isEndReachedCalled) {
              //  loadMoreData();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator /> : null}
          refreshing={refreshing}
          onRefresh={refreshData}
          onMomentumScrollBegin={() =>
            // setEndReachedCalled(true)
            loadMoreData()
          }
        />
      </>
    );
  };

  // @ts-ignore
  return (
    <SafeAreaView style={styles.container}>
      <Header
        varient="TYPE8"
        middleComponent={
          <TouchableOpacity style={styles.dropdown} onPress={toggleModal}>
            <Text maxFontSizeMultiplier={1.4} style={GlobalStyles.inAppHeading}>
              {selectedMeal}
            </Text>
            <Image
              source={require('../../../../assets/images/droparrow.png')}
              style={styles.dropImage}
            />
          </TouchableOpacity>
        }
        actionBtnText="Done"
        onBack={() => {
          dispatch(clearSelectedFoodItem());
        }}
        onActionBtnClick={handleBackPress}
      />
      <View style={styles.subContainer}>
        <View style={styles.searchContainer}>
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            placeholder="Click here to log your food"
            recording={recording}
            setRecording={setRecording}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            detectedCandidates={detectedCandidates}
            setDetectedCandidates={setDetectedCandidates}
            resultHandler={getFoodItemsForText}
          />
        </View>

        {!searchText && (
          <View style={styles.newFoodConatiner}>
            <TouchableOpacity
              onPress={() => {
                // navigate(NavigatorNames.barCodeScan);
                // set below false to avoid showing the Total Quantity Popup whenever selectedFood updated from other ways except create recipe
                showedTQOnce.current = false;
                navigate(NavigatorNames.foodScan, {
                  isFrom: 1,
                  mealType: selectedMeal,
                  date: date,
                });
              }}
              style={styles.addFoodItemBG}>
              <View style={styles.itemContainer}>
                <Image
                  resizeMode={'contain'}
                  source={require('../../../../assets/images/scanbarcode.png')}
                  style={styles.imageContainerFood}
                />

                <Text maxFontSizeMultiplier={1.3} style={styles.itemText}>
                  {AppStrings.scanBarcode}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // set below false to avoid showing the Total Quantity Popup whenever selectedFood updated from other ways except create recipe
                showedTQOnce.current = false;
                navigate(NavigatorNames.foodScan, {
                  isFrom: 2,
                  mealType: selectedMeal,
                  date: date,
                });
              }}
              style={styles.addFoodItemBG}>
              <View style={styles.itemContainer}>
                <Image
                  resizeMode={'contain'}
                  source={require('../../../../assets/images/scanfood.png')}
                  style={styles.imageContainerFood}
                />

                <Text maxFontSizeMultiplier={1.3} style={styles.itemText}>
                  {AppStrings.scanFood}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.myFoodContainer}>
        {searchText.length > 0 ? (
          <View style={styles.routeWrapper}>
            {isSearching ? (
              <ActivityIndicator size="small" color={AppColors.darktBlue} />
            ) : (
              renderSearchResultsContent()
            )}
          </View>
        ) : (
          <TabView
            navigationState={{index, routes}}
            renderScene={({route}) => renderContent({route})}
            onIndexChange={setIndex}
            initialLayout={{width: Dimensions.get('window').width}}
            renderTabBar={props => (
              <TabBar
                {...props}
                indicatorStyle={{
                  backgroundColor: AppColors.buttonDarkBlue,
                }}
                style={{
                  backgroundColor: AppColors.bgLightGrey,
                  shadowColor: 'transparent',
                  alignContent: 'center',
                  justifyContent: 'center',
                  marginHorizontal: moderateScale(16),
                  paddingVertical: isTablet ? moderateScale(6) : 0,
                }}
                activeColor={AppColors.buttonDarkBlue}
                inactiveColor="#6E6E6E"
                pressColor="transparent"
                renderLabel={({route, focused, color}) => (
                  <Text
                    maxFontSizeMultiplier={1.0}
                    style={[
                      {
                        fontSize: AppFontSize.intersize16,
                        color: color,
                        fontFamily: focused
                          ? AppFonts.interSemibold
                          : AppFonts.interMedium,
                        fontWeight:
                          Platform.OS === 'ios' && focused
                            ? AppWeights.interSemibold
                            : AppWeights.interMedium,
                        // width: '100%',
                        minWidth: moderateScale(110),
                        //marginLeft: '1',
                        //marginRight: '1',
                        textAlign: 'center',
                        alignSelf: 'center',
                      },
                    ]}>
                    {route.title}
                  </Text>
                )}
              />
            )}
          />
        )}
      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={toggleModal}>
          <View style={styles.modalContent}>
            {mealOptions.map((meal, index) => (
              <TouchableOpacity
                key={meal}
                style={[
                  styles.option,
                  index === mealOptions.length - 1 && {borderBottomWidth: 0},
                ]}
                onPress={() => handleMealSelect(meal)}>
                <Text maxFontSizeMultiplier={1.4} style={styles.optionText}>
                  {meal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <NewFoodPopup
        visible={isFoodModalVisible}
        onPress={handleCreateFood}
        closeModal={handleCloseFoodModal}
        value={foodText}
        onChangeText={setFoodText}
      />
      {isRecipeModalVisible && (
        <CustomRecipeModal
          customRecipeModalVisible={isRecipeModalVisible}
          onAddIngredient={() => {
            handleCreateCustomRecipe();
          }}
          onNext={openQuantityModal}
          ingredientList={selectedItem?.toppings ?? []}
          onClose={() => {
            setRecipeModalVisible(false);
            setRecipeText('');
            dispatch(clearSelectedFoodItem());
          }}
          onDeleteIngredient={ind => {
            dispatch(removeToppingsWithIndex(ind));
          }}
          onClear={() => {
            dispatch(clearSelectedFoodItem());
            setRecipeText('');
            setRecipeModalVisible(false);
          }}
          recipeName={recipeText}
          setRecipeName={(txt: string) => {
            dispatch(updateName({name: txt}));
            setRecipeText(txt);
          }}
          dataChanged={value => {}}
          onEditIngredient={(ind: Number) => {
            console.log('edit item is', selectedItem?.toppings[ind]);
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
          onBack={() => {
            setQuantityModalVisible(false);
            showedCROnce.current = false;
            setTimeout(() => {
              setRecipeModalVisible(true);
            }, 500);
          }}
          onClose={() => {
            setQuantityModalVisible(false);
            setRecipeText('');
            dispatch(clearSelectedFoodItem());
          }}
          onClear={() => {
            setQuantityModalVisible(false);
            const buttons: AlertButtons = [
              {
                text: 'Cancel',
                onPress: () => {
                  setQuantityModalVisible(true);
                },
              },
              {
                text: 'Continue',
                onPress: () => {
                  dispatch(clearSelectedFoodItem());
                  setRecipeText('');
                  setQuantityModalVisible(false);
                },
              },
            ];
            setAlertButtons(buttons);
            setAlertTitle('Discard');
            setAlertMessage(
              'Are you sure you want to discard your custom recipe creation?',
            );
            setShowAlert(true);
          }}
          servingSize={selectedItem?.foodData?.amount?.weight.unit ?? ''}
          servingSizes={selectedItem?.foodData?.amount?.servingSizes ?? []}
          totalQuantity={totalQuantity}
          setTotalQuantity={(txt: string) => {
            // dispatch(updateName({name: txt}));
            //
            setTotalQuantity(txt);
          }}
          dataChanged={value => {}}
        />
      )}
      {showAlert && (
        <AlertModal
          alertModalVisible={showAlert}
          title={alertTitle}
          message={alertMessage}
          buttons={
            alertButtons && alertButtons.length > 0 ? alertButtons : undefined
          }
          onClose={clearAlert}
        />
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
  headerContainer: {
    flexDirection: 'row',
    marginTop: moderateScale(10),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subContainer: {
    flexDirection: 'column',
    paddingHorizontal: moderateScale(16),
  },
  back: {
    color: AppColors.textHeadingBlack,
  },
  HeaderTitleText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },

  //dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(8),
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
    width: verticalScale(250),
    height: verticalScale(312),
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
    // paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal: 16,
    borderBottomWidth: moderateScale(1),
    borderBottomColor: AppColors.bgLightGrey,
  },
  optionText: {
    fontSize: AppFontSize.intersize20,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  dropImage: {
    width: verticalScale(14),
    height: verticalScale(6),
    marginLeft: moderateScale(8),
  },
  searchContainer: {
    flex: 1,
    width: '100%',
    marginTop: moderateScale(20),
    marginBottom: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    width: verticalScale(15.5),
    height: verticalScale(15.5),
  },
  micIcon: {
    width: verticalScale(15.5),
    height: verticalScale(15.5),
    marginRight: moderateScale(10),
  },
  searchTextFieldText: {
    fontSize: AppFontSize.intersize17,
    color: AppColors.textFieldTextBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    paddingLeft: moderateScale(6),
    width: moderateScale(283),
    height: '100%',
  },
  searchStartView: {
    flexDirection: 'row',
    paddingLeft: moderateScale(10),
  },
  newFoodConatiner: {
    flexDirection: 'row',
    width: '100%',
    marginTop: moderateScale(26),
    gap: moderateScale(14),
    justifyContent: 'space-between',
  },

  addFoodItemBG: {
    backgroundColor: AppColors.lightGreenItem,
    borderRadius: moderateScale(8),
    // width: 120,
    flex: 1,
    height: verticalScale(44),
    // marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  imageContainerFood: {
    width: verticalScale(18),
    height: verticalScale(18),
    padding: moderateScale(6),
  },
  itemText: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    // marginTop: 12,
  },
  myFoodContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: AppColors.bgLightGrey,
    marginTop: moderateScale(20),
  },
  activeTabText: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.buttonDarkBlue,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    marginBottom: moderateScale(14),
  },
  InActiveTabText: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textFieldHeading,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interMedium,
    marginBottom: moderateScale(14),
  },
  textTabView: {
    // paddingHorizontal: 13.5,
    // marginRight: 8,
    // flexDirection: 'column',
    // alignItems: 'center',
    // width: '25%',
  },
  divider: {
    width: moderateScale(75),
    backgroundColor: AppColors.buttonDarkBlue,
    height: verticalScale(2),
  },
  routeWrapper: {
    marginTop: moderateScale(16),
    paddingHorizontal: moderateScale(16),
  },
  scrollViewContent: {
    paddingBottom: moderateScale(100),
  },
  noRecordsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(16),
  },
  noRecordsText: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interRegular,
    textAlign: 'center',
  },
  scene: {
    flex: 1,
  },
  emptyComp: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interRegular,
    textAlign: 'center',
    top: isTablet ? moderateScale(-60) : moderateScale(-30),
  },
  receipeItem: {
    backgroundColor: AppColors.white,
    borderRadius: moderateScale(8),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  flexedRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: moderateScale(12),
    alignItems: 'center',
  },
  receipeItemImage: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(4),
    objectFit: 'cover',
    overflow: 'hidden',
  },
  title: {
    fontSize: AppFontSize.intersize18,
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    // lineHeight: 16,
    // textAlign: 'center',
    // marginBottom: 4,
    marginRight: moderateScale(10)
  },
  description: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textFieldTextBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    // lineHeight: 16,
  },
  actionImageFav: {
    width: verticalScale(22),
    height: verticalScale(20),
    objectFit: 'contain',
  },
  actionImage: {
    width: verticalScale(11.6),
    height: verticalScale(11.6),
    // objectFit: 'cover',
  },
  foodIcon: {
    width: verticalScale(32),
    height: verticalScale(32),
  },
  addIconContainer: {
    width: verticalScale(32),
    height: verticalScale(32),
    borderRadius: moderateScale(50),
    marginRight: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.btnBackground,
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.white,
    borderRadius: moderateScale(8),
    marginHorizontal: moderateScale(20),
    borderWidth: moderateScale(1),
    borderColor: AppColors.createBorder,
    paddingVertical: moderateScale(14),
    marginTop: moderateScale(22),
  },
  createText: {
    color: AppColors.buttonDarkBlue,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize18,
    // lineHeight: 16,
    textAlign: 'center',
  },
});

export default AddFood;
