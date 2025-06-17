import React, {useEffect, useState} from 'react';
import {FlatList, Keyboard, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import {AppStrings} from '../../../utils/Constants';
import {AppColors} from '../../../theme/AppColors';
import {screenDimensions} from '../../../utils/ScreenDimensions';
import {AppFonts, AppFontSize, AppWeights} from '../../../theme/AppFonts.tsx';
import SearchBar from '../../../components/SearchBar.tsx';
import ReceipeItem from '../../../components/ReceipeItem.tsx';
import {truncateText} from '../../../utils/Helper.tsx';
import {navigate, navigateBack} from '../../../navigators/utils/Utils.tsx';
import {NavigatorNames} from '../../../navigators/tabs/NavigatorsNames.tsx';
import {
  PassioFoodItem,
  PassioSDK,
  PassioFoodDataInfo,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import {ActivityIndicator} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {FoodItemModel} from '../../../models/FoodJournalModel';
import {ScrollView} from 'react-native-gesture-handler';
import {useRoute} from '@react-navigation/native';
import {getRecentIngredientList} from '../../../services/foodService.ts';
import {addToppings} from '../../../store/slices/selectedFoodSlice';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

const AddIngredient = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [recording, setRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [detectedCandidates, setDetectedCandidates] = useState([]);
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const {params}: any = useRoute();
  const isFrom = params?.isFrom;

  const selectedItem: FoodItemModel | null = useSelector(
    (state: RootState) => state.selectedFood.data,
  );

  useEffect(() => {
    fetchRecentAPI();
  }, []);

  const handleIngredientClick = async (item: PassioFoodDataInfo) => {
    try {
      // Fetch food results from the PassioSDK based on the query
      const passioFoodItem = await PassioSDK.fetchFoodItemForDataInfo(item);

      //   getNutritions(passioFoodItem);
      getNutritionsselectedUnit(passioFoodItem);
    } catch (error) {
      // Handle errors, e.g., network issues or API failures
    }
  };

  const fetchRecentAPI = async () => {
    try {
      setRecentLoading(true);
      //const response = {data: []};
      const response = await getRecentIngredientList();
      const list = response.data ?? [];
      setRecent(list);
    } catch (e) {
    } finally {
      setRecentLoading(false);
    }
  };

  const getNutritionsselectedUnit = async (PassioFoodItem: PassioFoodItem) => {
    try {
      const passioFoodItemNutrions =
        await PassioSDK.getNutrientsSelectedSizeOfPassioFoodItem(
          PassioFoodItem,
        );

      const scaledNutrientData = calculaterNutririonAsPerWeight(
        passioFoodItemNutrions,
        PassioFoodItem.amount.weight.value / PassioFoodItem.amount.weightGrams,
      );

      navigate(NavigatorNames.ingredientDetails, {
        nutrientsData: scaledNutrientData,
        passioFoodData: PassioFoodItem,
        isFromEdit: false,
        isFrom: isFrom,
      });
    } catch (error) {}
  };
  function calculaterNutririonAsPerWeight(nutrientData, multiplier) {
    const scaledData = JSON.parse(JSON.stringify(nutrientData));

    for (const key in scaledData) {
      if (
        scaledData[key] &&
        typeof scaledData[key] === 'object' &&
        'value' in scaledData[key]
      ) {
        scaledData[key].value *= multiplier;
      }
    }

    return scaledData;
  }

  const getIngredientItemsForText = async (text: string) => {
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

    return (
      <FlatList
        data={listToRender}
        keyExtractor={(item, index) =>
          item?.resultId?.toString() || index.toString()
        }
        renderItem={({item, index}: {item: any; index: number}) => {
          const isLastItem = index === listToRender.length - 1;
          const customizedItem = {
            ...(typeof item === 'object' ? item : {}),
            id: item?.resultId,
            receipe: item?.foodName,
            calories: item?.nutritionPreview?.calories,
            quantity: `${item?.nutritionPreview?.servingQuantity} ${item?.nutritionPreview?.servingUnit}`,
            image: item?.iconID,
            // brandName: item?.metadata.foodOrigins[0].source,
          };
          return (
            <ReceipeItem
              type="search"
              rawItem={item}
              clickHandler={rawItem => {
                Keyboard.dismiss(); // Ensure keyboard is dismissed on click
                handleIngredientClick(rawItem);
              }}
              item={customizedItem}
              isLastItem={isLastItem}
              truncateText={truncateText}
              actionBtnNeed={false}
            />
          );
        }}
        keyboardShouldPersistTaps="always" // Ensures tap works even when keyboard is open
        ListEmptyComponent={
          // <View style={styles.noRecordsContainer}>
          <Text maxFontSizeMultiplier={1.4} style={styles.emptyText}>
            No records found
          </Text>
          // </View>
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    );
  };

  const renderRecentResultsContent = () => {
    const listToRender = recent.length > 0 ? recent : [];

    return (
      <FlatList
        data={listToRender}
        keyExtractor={(item, index) =>
          item?.ingredients[0]?.id?.toString() || index.toString()
        }
        renderItem={({item, index}) => {
          const isLastItem = index === listToRender.length - 1;
          const customizedItem = {
            ...item,
            id: item?.ingredients[0]?.id,
            receipe: item?.ingredients[0]?.name,
            calories: item?.ingredients[0]?.referenceNutrients?.calories.value,
            quantity: `${item?.ingredients[0]?.amount?.selectedQuantity} ${item?.ingredients[0]?.amount?.selectedUnit}`,
            image: item?.ingredients[0]?.iconId,
          };

          return (
            <ReceipeItem
              type="search"
              rawItem={item}
              clickHandler={() => {
                const currentIngredientsData = {
                  refCode: item?.ingredients[0]?.refCode as any,
                  name: item?.ingredients[0]?.name,
                  id: item?.ingredients[0]?.id,
                  iconId: item?.ingredients[0]?.iconId,
                  weight: item?.ingredients[0]?.weight,
                  referenceNutrients: item?.ingredients[0]?.referenceNutrients,
                  amount: item?.ingredients[0]?.amount,
                };
                dispatch(addToppings(currentIngredientsData));
                navigateBack();
              }}
              item={customizedItem}
              isLastItem={isLastItem}
              truncateText={truncateText}
              actionBtnNeed={false}
            />
          );
        }}
        keyboardShouldPersistTaps="always" // Ensures tap works even when keyboard is open
        ListEmptyComponent={
          <Text maxFontSizeMultiplier={1.3} style={styles.emptyText}>
            No recent data found
          </Text>
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    );
  };

  const handleDoneBtnClick = () => {
    navigateBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollViewContent}>
        <Header
          title={
            isFrom === 'Toppings' ? AppStrings.toppings : AppStrings.ingredient
          }
          varient="TYPE6"
          onActionBtnClick={handleDoneBtnClick}
          actionBtnText={AppStrings.done}
        />
        <View style={styles.searchBarContainer}>
          <SearchBar
            placeholder={isFrom === 'Toppings' ? 'Search Add-ons' : 'Search'}
            searchText={searchText}
            setSearchText={setSearchText}
            recording={recording}
            setRecording={setRecording}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            detectedCandidates={detectedCandidates}
            setDetectedCandidates={setDetectedCandidates}
            resultHandler={getIngredientItemsForText}
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headingContainer}>
            <Text maxFontSizeMultiplier={1.4} style={styles.heading}>
              {searchText ? 'Search Results' : 'Recent'}
            </Text>
          </View>
          <View>
            {searchText ? (
              isSearching ? (
                <ActivityIndicator size="small" color={AppColors.darktBlue} />
              ) : (
                renderSearchResultsContent()
              )
            ) : recentLoading ? (
              <ActivityIndicator size="small" color={AppColors.darktBlue} />
            ) : (
              renderRecentResultsContent()
            )}
          </View>
        </View>
      </View>
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
    backgroundColor: AppColors.bgLightGrey,
    borderTopLeftRadius: isTablet ? 24 : 12,
    borderTopRightRadius: isTablet ? 24 : 12,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(24),
    paddingBottom: isTablet ? moderateScale(35) : moderateScale(40),
  },

  searchBarContainer: {
    width: '100%',
    paddingBottom: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    flexDirection: 'row',
  },
  heading: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  headingContainer: {
    marginBottom: moderateScale(16),
  },
  emptyText: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interRegular,
    textAlign: 'center',
  },
});

export default AddIngredient;
