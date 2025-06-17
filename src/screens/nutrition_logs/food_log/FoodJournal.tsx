import React, {useContext, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FoodItem,
  FoodItemModel,
  FoodJournalResponse,
  NutrientsModel,
} from '../../../models/FoodJournalModel.ts';
import {screenDimensions} from '../../../utils/ScreenDimensions.tsx';
import {AppColors} from '../../../theme/AppColors.tsx';
import {AppFonts, AppFontSize, AppWeights} from '../../../theme/AppFonts.tsx';
import Divider from '../../../components/Divider.tsx';
import {navigate} from '../../../navigators/utils/Utils.tsx';
import {NavigatorNames} from '../../../navigators/tabs/NavigatorsNames.tsx';
import moment from 'moment';
import {addSelectedFoodItem} from '../../../store/slices/selectedFoodSlice';
import {useDispatch} from 'react-redux';
import {
  PassioFoodItem,
  IconSize,
  PassioIconView,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import {AppContext} from '../../../context/AppContextProvider.tsx';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import {toTitleCase} from '../../../utils/Helper.tsx';

// Adjust the path accordingly

interface FoodJournalProps {
  // mealData: Meal[];
  onDeleteMeal: (mealType: string, foodId: string) => void;
  selectedDate: string;
  data: FoodJournalResponse | null;
  isCompleted: boolean;
}

const FoodJournal: React.FC<FoodJournalProps> = ({
  data,
  // mealData,
  // statusData,
  onDeleteMeal,
  selectedDate,
  isCompleted,
}) => {
  const dispatch = useDispatch();
  // const { globalSelectedDate, setGlobalSelectedDate } = useGlobalContext();

  //const [meals, setMeals] = useState<Meal[]>([]);
  //const [loading, setLoading] = useState<boolean>(true);
  const [error, _] = useState<string | null>(null);
  const [expandedMeals, setExpandedMeals] = useState<{
    [mealName: string]: boolean;
  }>({});
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

  // const selectedDate = useSelector((state: any) => state.logDate.selectedDate);

  function onFoodItemRemove(item: FoodItem, mealType: String) {
    // @ts-ignore
    onDeleteMeal(mealType, item.id);
  }

  function canLogFood(selectedPDate: string): boolean {
    const today = moment().format('YYYY-MM-DD');

    // Return true if selected date is today or in the past, otherwise return false
    return moment(selectedPDate).isSameOrBefore(today);
  }

  function handleLogFood(item: any) {
    console.log('add clicked');
    if (data?.status !== 'COMPLETED') {
      if (canLogFood(selectedDate)) {
        navigate(NavigatorNames.addFood, {
          date: selectedDate,
          mealType: item.name,
          isFromScanNewFood: false,
        });
      } else {
        clearAlert();
        setTitle('Failed to Add Meal.');
        setMessage('Cannot add Meal for future date');
        setAlert(true);
      }
    }
  }
  // Fetch data from API
  // useEffect(() => {
  // }, [data]);

  // useFocusEffect(
  //   useCallback(() => {
  //   }, []),
  // );

  const toggleMeal = (mealName: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealName]: !prev[mealName],
    }));
  };
  function roundToTwoDecimals(num: number): number {
    return Math.round(num);
  }
  const renderMealHeader = (meal: any) => {
    // const isExpanded = !!expandedMeals[meal.name];
    // const hasFoods = meal.foods && meal.foods.length > 0;
    const totalCalories =
      meal.name === 'Breakfast'
        ? meal?.breakfastCalories || 0
        : meal.name === 'Lunch'
        ? meal?.lunchCalories || 0
        : meal.name === 'Dinner'
        ? meal?.dinnerCalories || 0
        : meal.name === 'Snacks'
        ? meal?.snacksCalories || 0
        : 0;
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          // if (hasFoods) {
          //   toggleMeal(meal.name, meal);
          // } else {
          // handleLogFood(meal);
          // }
        }}
        style={styles.mealHeaderContainer}>
        <Text maxFontSizeMultiplier={1.4} style={styles.mealName}>
          {meal.name}
          {totalCalories !== 0
            ? ` (${roundToTwoDecimals(totalCalories)} Cal)`
            : ''}
        </Text>
        <TouchableOpacity
          disabled={isCompleted}
          onPress={() => {
            // if (hasFoods) {
            // toggleMeal(meal.name, meal);
            // } else {
            handleLogFood(meal);
            // }
          }}>
          {/* {hasFoods ? (
            <>
              {isExpanded ? (
                <Image
                  source={require('../../../../assets/images/expandclose.png')}
                  resizeMode="contain"
                  style={styles.foodIcon}
                />
              ) : (
                <Image
                  source={require('../../../../assets/images/expand.png')}
                  resizeMode="contain"
                  style={styles.foodIcon}
                />
              )}
            </>
          ) : ( */}
          <Image
            source={require('../../../../assets/images/add.png')}
            resizeMode="contain"
            style={[styles.foodIcon, isCompleted ? styles.disabled : undefined]}
          />
          {/* )} */}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderSubHeader = (count: string | number, mealName: string): any => {
    return (
      <TouchableOpacity
        style={styles.subHeaderBtn}
        onPress={() => {
          toggleMeal(mealName);
        }}>
        {/* <Text maxFontSizeMultiplier={1.3} style={styles.subHeadText}>
          {mealName === 'Snacks' ? 'Snacks ' : 'Meal '}
        </Text> */}
        <Image
          source={require('../../../../assets/images/arrowupicon.png')}
          style={styles.arrowDown}
          resizeMode="contain"
          tintColor={AppColors.textFieldTextBlack}
        />
      </TouchableOpacity>
    );
  };

  // @ts-ignore
  const renderMealItem = (
    items: any[],
    date: string,
    mealName: string,
  ): any => {
    // Concatenate food names into a single string separated by commas
    const hasFoods = items && items.length > 0;
    const foodText = items
      .map(food => food.metadata.data.foodData.name)
      .join(', ');

    return hasFoods ? (
      <TouchableOpacity
        style={styles.foodContainer}
        onPress={() => {
          toggleMeal(mealName);
        }}>
        {/* Time on the left side */}
        {/* <Text maxFontSizeMultiplier={1.2} style={styles.mealTime}>
          {formatTo12Hour(date)}
        </Text> */}

        {/* Food text occupies the right side, wrapping when necessary */}
        <Text maxFontSizeMultiplier={1.4} style={styles.foodText}>
          {toTitleCase(foodText)}
        </Text>
        <Image
          source={require('../../../../assets/images/arrowdownicon.png')}
          resizeMode="contain"
          style={styles.arrowDown}
        />
      </TouchableOpacity>
    ) : (
      <></>
    );
  };

  const handleDetailsNavigation = (
    item: FoodItem,
    mealType: String,
    date: String,
  ) => {
    if (data?.status !== 'COMPLETED') {
      const foodItemData: FoodItemModel = convertToFoodItemModel(item);
      // const data: FoodItemModel = {
      //   foodData: {
      //     id: item.data.foodData.id,
      //     name: item.data.foodData.name,
      //     amount: item.data.foodData.amount,
      //     iconId: item.data.foodData.iconId,
      //     refCode: item.data.foodData.refCode,
      //     ingredients: item.data.foodData.ingredients,
      //     ingredientWeight: item.data.foodData.ingredientWeight,
      //   } as PassioFoodItem,
      //   nutritions: item.data.foodData.ingredients[0]
      //     ?.referenceNutrients as PassioNutrients,
      //   image: item.data.foodData.iconId,
      // }
      dispatch(addSelectedFoodItem(foodItemData));
      navigate(NavigatorNames.receipeCardNew, {
        isFrom: 5,
        isFromRecent: false,
        isFavorite: item.isfavorite,
        type: item.type,
        portionType: item.metadata.data.type,
        notes: item.metadata.data.notes,
        mealType: mealType,
        mealId: item.id,
        date: date,
        dateLogged: item.metadata.data.dateandtime,
        isScanned: item.isScanned,
        isFromCameraScan: false,
        isFromFoodJournal: true,
        isDirectLog: item.isDirectLog !== undefined ? item.isDirectLog : false,
      });
    }
  };

  const groupDataByTime = (items: any) => {
    // const sortedItems = [...items].sort((a, b) => {
    //   const dateA = new Date(a.metadata.data.dateandtime).getTime();
    //   const dateB = new Date(b.metadata.data.dateandtime).getTime();
    //   return dateA - dateB;
    // });
    const grouped = items.reduce((acc: any, item: any) => {
      const time = item.metadata.data.dateandtime;
      if (!acc[time]) {
        acc[time] = [];
      }
      acc[time].push(item);
      return acc;
    }, {});

    return Object.keys(grouped).map(time => ({
      title: time,
      data: grouped[time],
    }));
  };

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
      intake: {
        intakeValue: input?.metadata?.data?.intake?.intakeValue,
        unit: input?.metadata?.data?.intake?.unit,
      },
      image: input.metadata.data.image,
    };

    return foodItemModel;
  };

  const renderSectionHeader = ({
    section: {title},
  }: {
    section: {title: string};
  }) => (
    <View style={styles.timeHeader}>
      <Text maxFontSizeMultiplier={1.3} style={styles.timeHeaderText}>
        {moment(title).format('h:mm A')}
      </Text>
    </View>
  );

  // @ts-ignore
  const renderMealFoods = (foods: Food[], mealName: String): any => {
    return (
      <FlatList
        data={foods}
        keyExtractor={item =>
          `${item.metadata.data.foodData.id.toString()}-${Math.random()}`
        }
        // eslint-disable-next-line react/no-unstable-nested-components
        ItemSeparatorComponent={() => <View style={styles.seperator} />} // Adjust the height for the gap
        renderItem={({item, index}) => {
          const currentFormattedTime = moment(
            item.metadata.data.dateandtime,
          ).format('HH:mm');
          const prevFormattedTime =
            index > 0
              ? moment(foods[index - 1]?.metadata.data.dateandtime).format(
                  'HH:mm',
                )
              : null;

          const shouldRenderHeader =
            index === 0 || currentFormattedTime !== prevFormattedTime;
          return (
            <View>
              {item.metadata.data.dateandtime != '' &&
                shouldRenderHeader &&
                renderSectionHeader({
                  section: {title: item.metadata.data.dateandtime},
                })}

              <TouchableOpacity
                onPress={() =>
                  handleDetailsNavigation(item, mealName, selectedDate)
                }
                style={styles.foodItem}>
                {item.metadata.data.image && item.metadata.data.image !== '' ? (
                  <Image
                    source={{uri: item.metadata.data.image}} // Assuming your API provides imageUrl
                    style={styles.foodImage}
                  />
                ) : (
                  <PassioIconView
                    style={styles.foodImage}
                    config={{
                      passioID: item.metadata.data.foodData.iconId,
                      iconSize: IconSize.PX180,
                    }}
                  />
                )}

                <View style={styles.foodDetails}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.foodCardText}>
                    {toTitleCase(item.metadata.data.foodData.name)}
                  </Text>
                  <Text maxFontSizeMultiplier={1.4} style={styles.calText}>
                    {roundToTwoDecimals(
                      item.metadata.data.nutritions.calories.value,
                    )}{' '}
                    cal | {item.metadata.data.foodData.amount.selectedQuantity}{' '}
                    {item.metadata.data.foodData.amount.selectedUnit}
                  </Text>
                  {item.metadata.data.toppings ? (
                    <Text maxFontSizeMultiplier={1.4} style={styles.calText}>
                      Add-ons: {item.metadata.data.toppings.length}
                    </Text>
                  ) : (
                    <></>
                  )}
                </View>
                <TouchableOpacity
                  disabled={isCompleted}
                  onPress={() => {
                    if (data && data.status !== 'COMPLETED') {
                      onFoodItemRemove(item, mealName);
                    }
                  }}>
                  <Image
                    source={require('../../../../assets/images/deletetheme.png')}
                    resizeMode="contain"
                    style={[
                      styles.foodIcon,
                      data && data.status === 'COMPLETED' && styles.disabled,
                    ]}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    );
  };

  // if (loading) {
  //   return <ActivityIndicator size="large" color="#007AFF" />;
  // }

  if (error) {
    return <Text maxFontSizeMultiplier={1.4}>{error}</Text>;
  }

  // @ts-ignore
  return (
    <FlatList
      data={data?.meals}
      showsVerticalScrollIndicator={false}
      keyExtractor={item => `${item.name}-${Math.random()}`}
      renderItem={({item}) => {
        const hasFoods = item.foods && item.foods.length > 0;
        const isExpanded = expandedMeals[item.name];
        // const groupData = groupDataByTime(item.foods);
        return (
          <View style={styles.mealContainer}>
            {renderMealHeader(item)}
            {hasFoods ? (
              <Divider color={AppColors.dividerColor} marginVertical={10} />
            ) : (
              <></>
            )}
            {!isExpanded &&
              renderMealItem(item.foods, item.lastUpdatedDate, item?.name)}
            {isExpanded &&
              hasFoods &&
              renderSubHeader(item?.foods?.length || 0, item?.name)}
            {expandedMeals[item.name] && renderMealFoods(item.foods, item.name)}
            {/* {isExpanded && hasFoods && (
              <CustomButton
                title={AppStrings.logFood}
                onPress={
                  data.status != 'COMPLETED'
                    ? () => {
                        handleLogFood(item);
                      }
                    : () => {}
                }
                style={
                  data.status != 'COMPLETED'
                    ? {marginTop: 16}
                    : {
                        marginHorizontal: 15,
                        marginBottom: 10,
                        backgroundColor: AppColors.buttonDisable,
                        marginTop: 16,
                      }
                }
              />
            )} */}
          </View>
        );
      }}
    />
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  mealContainer: {
    marginBottom: moderateScale(8),
    backgroundColor: AppColors.bgLightGrey,
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(12),
  },
  mealHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealName: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  seperator: {height: verticalScale(16)},
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
  },
  foodImage: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(8),
    marginRight: moderateScale(12),
  },
  foodDetails: {
    flex: 1,
  },
  foodIcon: {
    width: verticalScale(32),
    height: verticalScale(32),
  },
  disabled: {opacity: 0.5},
  divider: {
    width: '100%',
  },
  foodText: {
    flex: 3, // Take up the remaining space on the right
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
    flexWrap: 'wrap', // Ensure the text wraps when it reaches the end of the line
  },
  timeHeader: {
    // marginTop: 16,
    marginBottom: moderateScale(4),
  },
  timeHeaderText: {
    fontSize: AppFontSize.intersize14,
    fontWeight: AppWeights.interMedium,
    color: AppColors.descriptionLightGrey,
    fontFamily: AppFonts.interMedium,
  },
  arrowDown: {
    width: verticalScale(14),
    height: verticalScale(8.17),
    marginVertical: moderateScale(6),
    marginHorizontal: moderateScale(9),
  },
  foodCardText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  calText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldHeading,
    fontFamily: AppFonts.interMedium,
  },
  subHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(0),
  },
  subHeadText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
  },
  mealTime: {
    flex: 1, // Assign some space for the time on the left
    marginRight: moderateScale(24),
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.darkGreen,
    fontFamily: AppFonts.interSemibold,
    textAlign: 'left', // Ensure the time aligns to the left
  },
  foodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // This will ensure that the food text wraps to the next line if necessary
    alignItems: 'center', // Aligns items to the top
    // paddingVertical: 8,
  },
});

export default FoodJournal;
