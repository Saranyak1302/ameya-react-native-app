import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppColors} from '../../../theme/AppColors.tsx';
import {screenDimensions} from '../../../utils/ScreenDimensions.tsx';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppStrings} from '../../../utils/Constants.tsx';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {AppFonts, AppFontSize, AppWeights} from '../../../theme/AppFonts.tsx';
import moment, {Moment} from 'moment';
import FoodJournal from './FoodJournal';
import WaterJournal from './WaterJournal';
import {
  DaysData,
  DaysList,
  FoodJournalResponse,
} from '../../../models/FoodJournalModel';
import {OrderResponseModel} from '../../../models/OrderModel.ts';
import {useDispatch, useSelector} from 'react-redux';
import {
  deleteNutritionMeal,
  getFoodByDate,
  getNutritionDaysStatus,
  postCompleteDayLog,
  updateWaterLog,
} from '../../../services/foodService.ts';
import {fetchFoodJournalSuccess} from '../../../store/slices/foodJournalSlice';
import AmeyaLoader from '../../../components/AmeyaLoader.tsx';
import Header from '../../../components/Header.tsx';
import {getOrders} from '../../../services/orderService.ts';
import {setOrderResponse} from '../../../store/slices/orderSlice';
import {getData, storeData} from '../../../utils/LocalStorage';
import {StorageKeys} from '../../../utils/StorageKeys';
import AlertModal from '../../../components/AlertModal.tsx';
import LottieView from 'lottie-react-native';
import {RootState} from '../../../store/Store.ts';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

type AlertButtons =
  | [{text: string; onPress?: () => void}]
  | [
      {text: string; onPress?: () => void},
      {text: string; onPress?: () => void},
    ];
function FoodLog() {
  const data: FoodJournalResponse | null = useSelector(
    (state: RootState) => state.foodJournal.data,
  );

  const [cups, setCups] = useState(0);
  const [loader, setLoader] = useState(false);
  const [datesArray, setDatesArray] = useState([]);
  const flatListRef = useRef<FlatList>(null);
  const [showInCompleteCard, setShowInCompleteCard] = useState(true);
  const totalCups = data?.waterlogging?.totalCups || 0; // Use optional chaining
  // @ts-ignore
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

  const dispatch = useDispatch();

  // Convert to moment objects and format
  const startDate = moment(orderResponse?.nutrition?.startDateTime).format(
    'YYYY-MM-DD',
  );

  const dueDate = moment(orderResponse?.nutrition?.endDateTime).format(
    'YYYY-MM-DD',
  );
  // const selectedDate = useSelector((state: any) => state.logDate.selectedDate);

  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState(
    'Hang tight, retrieving your order...',
  );
  const [showInfoAlert, setInfoAlert] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<AlertButtons>();
  const [daysStatus, setDaysStatus] = useState<DaysList>();
  const [inProgressCount, setInProgressCount] = useState(0);
  const [isSingleInPro, setSingleInPro] = useState(false);

  const warningDueDate = moment(orderResponse?.nutrition?.endDateTime).format(
    'MMM D',
  );

  const [selectedDate, setSelectedDate] = useState(Date());

  // const {globalSelectedDate, setGlobalSelectedDate} = useGlobalContext();
  const currentMonth = moment(selectedDate).format('MMMM YYYY');

  const itemWidth = isTablet ? moderateScale(45) : moderateScale(55); // Width from dateContainer
  const separatorWidth = moderateScale(20); // Width from seperator style
  const totalItemWidth = itemWidth + separatorWidth; // Total width per item

  // function canShowCompleteView(
  //   orderResponse: OrderResponseModel | null,
  //   selectedDate: string,
  // ): boolean {
  //   if (!orderResponse || !orderResponse.nutrition) return false;

  //   const {nutrition} = orderResponse;

  //   return nutrition.daysDetails.some(
  //     dayDetail =>
  //       dayDetail.date === selectedDate &&
  //       (dayDetail.status === 'TodayTask' || dayDetail.status === 'overdue'),
  //   );
  // }
  // const isCompleteViewAvailable = canShowCompleteView(
  //   orderResponse,
  //   selectedDate,
  // );

  useEffect(() => {
    generateDateArray(startDate, dueDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToCurrentWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datesArray]);

  useEffect(() => {
    // if(selectedDate)
    if (
      inProgressCount === 1 &&
      daysStatus &&
      selectedDate === daysStatus[selectedDate]?.date &&
      daysStatus[selectedDate]?.status === 'INPROGRESS'
    ) {
      setSingleInPro(true);
    } else {
      setSingleInPro(false);
    }
  }, [daysStatus, inProgressCount, selectedDate]);

  useEffect(() => {}, [data]);

  useFocusEffect(
    useCallback(() => {
      // fetchOrderData();
      // fetchFoodJournal();
      fetchLocalStorageDate();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const fetchLocalStorageDate = async (skipLoading?: boolean) => {
    const storageDate = await getData({key: StorageKeys.selectedDate});

    if (storageDate) {
      setSelectedDate(storageDate); // Update state with the retrieved date
      if (flatListRef?.current) {
        const index = datesArray.findIndex(
          (date: Moment) =>
            date.format('YYYY-MM-DD') ===
            moment(storageDate).format('YYYY-MM-DD'),
        );
        if (index >= 0) {
          const totalW = screenDimensions.width - moderateScale(32);
          const offset =
            index * totalItemWidth - totalW / 2 + itemWidth / 2;
          flatListRef.current.scrollToOffset({offset, animated: true});
        }
      }
      fetchOrderData();
      fetchFoodJournal(storageDate, skipLoading);
    }
  };
  const getFJournal = async (selectDate: string) => {
    try {
      getDaysStatus();
      const rawResponse = await getFoodByDate(
        orderResponse?.order?.id || '',
        selectDate,
        orderResponse?.nutrition?.metadataId || '',
        orderResponse?.nutrition?.nutritionAnalysisId || '',
      );
      const response = rawResponse.nutritionItem;
      const defaultMeals = [
        {
          name: 'Breakfast',
          foods: [],
          lastUpdatedDate: new Date().toISOString(),
        },
        {name: 'Lunch', foods: [], lastUpdatedDate: new Date().toISOString()},
        {name: 'Dinner', foods: [], lastUpdatedDate: new Date().toISOString()},
        {name: 'Snacks', foods: [], lastUpdatedDate: new Date().toISOString()},
      ];
      let mealsTemp = [];

      if (response.meals && response.meals?.length === 0) {
        mealsTemp = defaultMeals;
      } else {
        mealsTemp = defaultMeals.map(defaultMeal => {
          const existingMeal = response.meals?.find(
            (meal: any) => meal.name === defaultMeal.name,
          );

          return {
            name: defaultMeal.name,
            foods: existingMeal ? existingMeal.foods : defaultMeal.foods,
            breakfastCalories: existingMeal?.breakfastCalories || 0,
            lunchCalories: existingMeal?.lunchCalories || 0,
            dinnerCalories: existingMeal?.dinnerCalories || 0,
            snacksCalories: existingMeal?.snacksCalories || 0,
            lastUpdatedDate:
              existingMeal && existingMeal.lastUpdatedDate
                ? existingMeal.lastUpdatedDate
                : defaultMeal.lastUpdatedDate,
          };
        });
      }

      let waterlogging = {};

      if (response.waterlogging) {
        waterlogging = response.waterlogging;
      } else {
        waterlogging = {
          numberOfCupsDriken: 0,
          totalCups: 8,
        };
      }

      const updatedData = {
        date: response.date,
        meals: mealsTemp,
        status: response.status,
        totalCalories: response.totalCalories,
        waterlogging: waterlogging,
      };

      dispatch(fetchFoodJournalSuccess(updatedData as any));
      return updatedData;
    } catch (error: any) {
      setAlertTitle(`Failed to Fetch Food for ${selectDate}.`);
      setAlertMessage(`Error: ${error?.message} (Code: ${error?.code})`);
      setShowAlert(true);
    }
  };
  const fetchFoodJournal = async (date: string, skipLoading?: boolean) => {
    if (!skipLoading) {
      setLoading(true);
    } else {
      setLoader(true);
    }
    const resData: any = await getFJournal(date);
    if (
      resData?.waterlogging?.numberOfCupsDriken === 0 ||
      resData?.waterlogging?.numberOfCupsDriken > 0
    ) {
      setCups(resData?.waterlogging?.numberOfCupsDriken);
    }
    if (!skipLoading) {
      setLoading(false);
    } else {
      setLoader(false);
    }
  };

  const generateDateArray = (start: any, end: any) => {
    let startMoment = moment(start);
    let endMoment = moment(end);
    let dateArray = [];

    while (startMoment.isSameOrBefore(endMoment)) {
      dateArray.push(startMoment.clone());
      startMoment.add(1, 'day');
    }

    // @ts-ignore
    setDatesArray(dateArray);
  };

  const getDaysStatus = async () => {
    try {
      if (orderResponse?.order?.id) {
        const statusResponse: DaysData = await getNutritionDaysStatus(
          orderResponse?.order?.id,
        );
        const statusList = statusResponse?.daysDetails
          .map(item => {
            return {...item, date: item?.date};
          })
          .filter(
            item =>
              !(
                item.date === moment().format('YYYY-MM-DD') &&
                item.status === 'INPROGRESS'
              ),
          );
        const inProCount =
          Array.isArray(statusList) && statusList.length > 0
            ? statusList.filter(item => item?.status === 'INPROGRESS').length
            : 0;
        setInProgressCount(inProCount);
        const daysList: DaysList = statusList.reduce((acc, item) => {
          acc[item.date] = item; // Set the date as the key
          return acc;
        }, {} as DaysList);
        setDaysStatus(daysList);
        // setShowInCompleteCard(inProCount > 0);
      }
    } catch (e) {}
  };

  const scrollToCurrentWeek = () => {
    if (isFromTodaysTask) {
      if (flatListRef?.current) {
        const index = datesArray.findIndex(
          (date: Moment) =>
            date.format('YYYY-MM-DD') ===
            moment(orderResponse?.nutrition?.date).format('YYYY-MM-DD'),
        );
        if (index >= 0) {
          const totalW = screenDimensions.width - moderateScale(32);
          const offset = index * totalItemWidth - totalW / 2 + itemWidth / 2;
          flatListRef.current.scrollToOffset({offset, animated: true});
        }
      }
      return;
    }
    const todayIndex = datesArray.findIndex(
      // @ts-ignore
      date => date.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'),
    );

    setTimeout(() => {
      if (flatListRef.current && todayIndex !== -1) {
        const totalW = screenDimensions.width - moderateScale(32);
        const offset = todayIndex * totalItemWidth - totalW / 2 + itemWidth / 2;
        flatListRef.current.scrollToOffset({offset, animated: true});
      }
    }, 100);
  };

  // @ts-ignore
  const renderDayItem = ({item}) => {
    const isSelected = item.format('YYYY-MM-DD') === selectedDate;
    const isComplete =
      daysStatus &&
      daysStatus[item.format('YYYY-MM-DD')]?.status === 'COMPLETED';
    const isInProgress =
      daysStatus &&
      daysStatus[item.format('YYYY-MM-DD')]?.status === 'INPROGRESS';

    return (
      <TouchableOpacity
        onPress={() => {
          // setGlobalSelectedDate(item.format('YYYY-MM-DD'));
          // dispatch(setSelectedDate(item.format('YYYY-MM-DD')));
          storeData({
            key: StorageKeys.selectedDate,
            value: item.format('YYYY-MM-DD'),
          });
          fetchLocalStorageDate(true);
        }}>
        <View
          style={[
            styles.dateContainer,
            isSelected
              ? styles.selectedDate
              : isComplete && styles.completedDate,
          ]}>
          {isComplete ? (
            <Image
              source={require('../../../../assets/images/done.png')}
              style={styles.doneImg}
              resizeMode="contain"
              tintColor={isSelected ? 'white' : undefined}
            />
          ) : (
            isInProgress && (
              <Image
                source={require('../../../../assets/images/incomplete.png')}
                style={styles.inCompleteImg}
                resizeMode="contain"
                tintColor={isSelected ? 'white' : undefined}
              />
            )
          )}
          <Text
            maxFontSizeMultiplier={1.2}
            style={[styles.dayText, isSelected && styles.selectedDayText]}>
            {item.format('ddd')}
          </Text>
          <Text
            maxFontSizeMultiplier={1.2}
            style={[
              styles.dateText,
              isSelected && styles.selectedDateText,
              // {marginTop: 8},
            ]}>
            {item.format('D')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleDeleteMeal = async (mealType: string, foodId: string) => {
    if (data?.status !== 'COMPLETED') {
      setLoaderMessage('Deleting selected food, hang tight...');
      setLoading(true);

      try {
        await deleteNutritionMeal(
          orderResponse?.order?.id || '',
          selectedDate,
          mealType,
          foodId,
          orderResponse?.nutrition?.metadataId || '',
          orderResponse?.nutrition?.nutritionAnalysisId || '',
        );
        setAlertTitle('Meal deleted successfully.');
        setShowAlert(true);
        await fetchFoodJournal(selectedDate);
      } catch (error: any) {
        setAlertTitle('Failed to Delete Food.');
        setAlertMessage(`Error: ${error?.message} (Code: ${error?.code})`);
        setShowAlert(true);
      } finally {
        setLoading(false);
        setLoaderMessage('Hang tight, retrieving your order...');
      }
    }
  };

  const addCup = async () => {
    if (data?.status !== 'COMPLETED') {
      if (canLogFood(selectedDate)) {
        // if (cups < totalCups) {
        try {
          setCups(pre => pre + 1);
          await updateWaterLog(
            orderResponse?.order?.id || '',
            selectedDate,
            orderResponse?.nutrition?.metadataId || '',
            orderResponse?.nutrition?.nutritionAnalysisId || '',
            'add',
          );
          getFJournal(selectedDate);
        } catch (error: any) {
          if (cups > 0) {
            setCups(pre => pre - 1);
          }
          setAlertTitle('Failed to Add Cup.');
          setAlertMessage(`Error: ${error?.message} (Code: ${error?.code})`);
          setShowAlert(true);
        }
        // }
      } else {
        setAlertTitle('Unable to Add Cup.');
        setAlertMessage('Cannot add cup for future date');
        setShowAlert(true);
      }
    }
  };

  const removeCup = async () => {
    if (data?.status !== 'COMPLETED') {
      if (canLogFood(selectedDate)) {
        if (cups > 0) {
          try {
            setCups(pre => pre - 1);
            await updateWaterLog(
              orderResponse?.order?.id || '',
              selectedDate,
              orderResponse?.nutrition?.metadataId || '',
              orderResponse?.nutrition?.nutritionAnalysisId || '',
              'remove',
            );
            getFJournal(selectedDate);
          } catch (error: any) {
            // if (cups < totalCups) {
            setCups(pre => pre + 1);
            // }
            setAlertTitle('Failed to Remove Cup.');
            setAlertMessage(`Error: ${error?.message} (Code: ${error?.code})`);
            setShowAlert(true);
          }
        }
      } else {
        setAlertTitle('Unable to Remove Cup.');
        setAlertMessage('Cannot remove cup for future date');
        setShowAlert(true);
      }
    }
  };

  const fetchOrderData = async () => {
    try {
      const response = await getOrders();
      dispatch(setOrderResponse(response)); // Store the fetched order in Redux
    } catch (error) {}
  };

  const updateCompleteDayLog = async () => {
    try {
      if (data?.status === 'COMPLETED') {
        setLoaderMessage('Please wait...');
      } else {
        setLoaderMessage('Completing your day...');
      }
      setLoading(true);
      const response = await postCompleteDayLog(
        selectedDate,
        orderResponse?.order.id || '',
        orderResponse?.nutrition.metadataId || '',
        orderResponse?.nutrition.nutritionAnalysisId || '',
      );

      if (response.message) {
        setLoading(false);
        setAlertTitle(response.message);
        setShowAlert(true);
      } else {
        await fetchOrderData();
        fetchFoodJournal(selectedDate).then(() => {
          setLoading(false);
        });
      }
    } catch (error: any) {
      setLoading(false);
      setAlertTitle('Failed to Complete Day');
      setAlertMessage(`Error: ${error?.message} (Code: ${error?.code})`);
      setShowAlert(true);
    }
  };

  const onClickEditDayLog = async () => {
    updateCompleteDayLog();
  };

  function canLogFood(selDate: string): boolean {
    const today = moment().format('YYYY-MM-DD');

    // Return true if selected date is today or in the past, otherwise return false
    return moment(selDate).isSameOrBefore(today);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollViewContent}>
        <Header
          varient="TYPE7"
          title={AppStrings.nutrition}
          rightComponent={
            <Text maxFontSizeMultiplier={1.0} style={styles.dueHeaderText}>
              Due {warningDueDate}
            </Text>
          }
        />

        <View style={styles.subContainer}>
          <View style={styles.calendarView}>
            <FlatList
              data={datesArray}
              keyExtractor={item => item.format('YYYY-MM-DD')}
              renderItem={renderDayItem}
              horizontal
              // eslint-disable-next-line react/no-unstable-nested-components
              ItemSeparatorComponent={() => <View style={styles.seperator} />}
              showsHorizontalScrollIndicator={false}
              ref={flatListRef}
              getItemLayout={(_, index) => ({
                length: totalItemWidth,
                offset: totalItemWidth * index,
                index,
              })}
            />
            <Text maxFontSizeMultiplier={1.4} style={styles.monthText}>
              {currentMonth}
            </Text>
          </View>
        </View>

        <View style={styles.foodContainer}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            style={styles.foodSubContainer}
            contentContainerStyle={styles.scrollSec}>
            {showInCompleteCard && inProgressCount > 0 && (
              <TouchableOpacity
                style={styles.warningContainer}
                disabled={isSingleInPro}
                onPress={() => {
                  if (daysStatus) {
                    const firstInProgressKey = Object.entries(daysStatus).find(
                      ([key, value]) =>
                        key !== selectedDate && value.status === 'INPROGRESS',
                    )?.[0];
                    if (flatListRef?.current) {
                      const index = datesArray.findIndex(
                        (date: Moment) =>
                          date.format('YYYY-MM-DD') ===
                          moment(firstInProgressKey).format('YYYY-MM-DD'),
                      );
                      if (index >= 0) {
                        const totalW = screenDimensions.width - moderateScale(32);
                        const offset =
                          index * totalItemWidth - totalW / 2 + itemWidth / 2;
                        flatListRef.current.scrollToOffset({
                          offset,
                          animated: true,
                        });
                      }
                    }
                    if (firstInProgressKey) {
                      storeData({
                        key: StorageKeys.selectedDate,
                        value: moment(firstInProgressKey).format('YYYY-MM-DD'),
                      });
                      fetchLocalStorageDate(true);
                    }
                  }
                }}>
                <View style={styles.warLeftContainer}>
                  <Image
                    source={require('../../../../assets/images/incomplete.png')}
                    style={styles.inCompleteWarImg}
                    resizeMode="contain"
                  />
                  <Text maxFontSizeMultiplier={1.2} style={styles.warningText}>
                    {isSingleInPro ? (
                      <>
                        You haven't completed this day yet. Tap the 'Complete
                        Day' button to continue.
                      </>
                    ) : (
                      <>
                        You have{' '}
                        <Text
                          maxFontSizeMultiplier={1.2}
                          style={styles.warningTextDay}>
                          {inProgressCount}
                          {inProgressCount > 1 ? ' days' : ' day'}
                        </Text>{' '}
                        of incomplete food logs. Click here to start completing.
                      </>
                    )}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => {
                    setShowInCompleteCard(false);
                  }}>
                  <Image
                    source={require('../../../../assets/images/close2.png')}
                    style={styles.closeImg}
                    tintColor={''}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            <View style={styles.cupsConatiner}>
              <View style={styles.cupHeader}>
                <Text
                  maxFontSizeMultiplier={1.4}
                  style={styles.foodHeadingText}>
                  {AppStrings.waterJournal}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setInfoAlert(true);
                  }}>
                  <Image
                    source={require('../../../../assets/images/info.png')}
                    style={styles.infoIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text maxFontSizeMultiplier={1.4} style={styles.numberCupsText}>
                {cups} {cups > 1 ? 'Cups' : 'Cup'}
              </Text>
            </View>

            <WaterJournal
              totalCups={totalCups}
              numberOfCupsDrinken={cups}
              addCup={addCup}
              isCompleted={data?.status === 'COMPLETED'}
              removeCup={removeCup}
            />
            <View style={styles.foodJournalSection}>
              <Text
                maxFontSizeMultiplier={1.4}
                style={[styles.foodHeadingText]}>
                {AppStrings.foodJournal}
              </Text>
              {data?.totalCalories !== 0 && data?.totalCalories && (
                <Text
                  maxFontSizeMultiplier={1.4}
                  style={[styles.foodHeadingTextCal]}>
                  {Math.round(data?.totalCalories)} Cal
                </Text>
              )}
            </View>
            <FoodJournal
              key={selectedDate}
              data={data}
              isCompleted={data?.status === 'COMPLETED'}
              // mealData={data?.meals ? data?.meals : []}
              // statusData={data?.status ? data?.status : ''}
              onDeleteMeal={(mealType: string, foodId: string) => {
                const buttons: AlertButtons = [
                  {text: 'Cancel', onPress: () => {}},
                  {
                    text: 'Continue',
                    onPress: () => {
                      handleDeleteMeal(mealType, foodId);
                    },
                  },
                ];
                setAlertButtons(buttons);
                setAlertTitle('Remove Food');
                setAlertMessage(
                  'Are you sure you want to remove the saved food? This action cannot be reversed.',
                );
                setShowAlert(true);
              }}
              selectedDate={selectedDate}
            />
          </ScrollView>
        </View>
        {data?.status !== 'COMPLETED' ? (
          <View style={styles.logActionSheet}>
            <View style={styles.logActionView}>
              <Text maxFontSizeMultiplier={1.2} style={styles.logActionText}>
                {AppStrings.doneLoggingForTheDay}
              </Text>

              <TouchableOpacity
                onPress={updateCompleteDayLog}
                style={styles.logActionBtn}>
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={styles.logActionBtnText}
                  adjustsFontSizeToFit
                  numberOfLines={2}>
                  {AppStrings.completeDay}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.logActionSheet}>
            <View style={styles.logActionView}>
              <Text maxFontSizeMultiplier={1.2} style={styles.logActionText}>
                {AppStrings.greatJob}
              </Text>

              <TouchableOpacity
                onPress={onClickEditDayLog}
                style={styles.logActionBtn}>
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={styles.logActionBtnText}>
                  {AppStrings.editDay}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      <AmeyaLoader visible={loading} message={loaderMessage} />
      {loader && (
        <View style={styles.loaderStyle}>
          <LottieView
            source={require('../../../../assets/lottie/loader.json')} // Update path to your Lottie file
            style={styles.animation}
            autoPlay
            speed={0.8}
            loop
          />
        </View>
      )}
      <AlertModal
        alertModalVisible={showInfoAlert}
        title={'Water Journal'}
        message={
          <Text maxFontSizeMultiplier={1.2} style={styles.infoAlertMsg}>
            Track your hydration! One cup of water is 250 ml (8 oz). Click to{' '}
            <Text
              maxFontSizeMultiplier={1.2}
              style={[styles.infoAlertMsg, styles.infoAlertBold]}>
              Add
            </Text>{' '}
            more as you drink.
          </Text>
        }
        onClose={() => {
          setInfoAlert(false);
        }}
      />
      {showAlert && (
        <AlertModal
          alertModalVisible={showAlert}
          title={alertTitle}
          message={alertMessage}
          buttons={
            alertButtons && alertButtons.length > 0 ? alertButtons : undefined
          }
          onClose={() => {
            setAlertTitle('');
            setAlertMessage('');
            setAlertButtons(undefined);
            setShowAlert(false);
          }}
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
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: moderateScale(64),
  },
  subContainer: {
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
    fontSize: AppFontSize.intersize17,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
  },
  foodJournalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: moderateScale(28),
    marginBottom: moderateScale(16),
  },
  foodHeadingText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldHeading,
    fontFamily: AppFonts.interMedium,
  },
  foodHeadingTextCal: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
  },
  numberCupsText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
    marginBottom: moderateScale(16),
  },
  cupsConatiner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(16),
    gap: moderateScale(4),
  },
  infoIcon: {
    width: verticalScale(14),
    height: verticalScale(14),
    alignSelf: 'center',
    padding: 2,
  },
  calendarView: {
    marginBottom: moderateScale(5),
    marginTop: moderateScale(0),
    flexDirection: 'column',
    alignItems: 'center',
  },
  dateContainer: {
    height: isTablet ? verticalScale(75) : verticalScale(80),
    gap: moderateScale(4),
    width: isTablet ? moderateScale(45) : moderateScale(55),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Platform.OS === 'android' ? moderateScale(100) : moderateScale(40),
    marginBottom: moderateScale(12), // Added margin at the bottom
  },
  doneImg: {
    width: verticalScale(10),
    height: verticalScale(10),
    position: 'absolute',
    top: moderateScale(7),
  },
  inCompleteImg: {
    width: verticalScale(11),
    height: verticalScale(11),
    position: 'absolute',
    top: moderateScale(7),
  },
  selectedDate: {
    backgroundColor: AppColors.darkGreen,
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 4}, // Shadow direction and height
    shadowOpacity: 0.3, // Opacity of the shadow
    shadowRadius: 4, // Blur radius of the shadow
    elevation: 5, // Elevation for Android to achieve similar shadow effect,
    borderRadius: Platform.OS === 'android' ? moderateScale(100) : moderateScale(40),
  },
  completedDate: {
    backgroundColor: '#CEE0B8',
    borderRadius: Platform.OS === 'android' ? moderateScale(100) : moderateScale(40),
  },
  dayText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
  },
  dateText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
  },
  selectedDayText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.white,
    fontFamily: AppFonts.interSemibold,
  },
  selectedDateText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interBold,
    color: AppColors.white,
    fontFamily: AppFonts.interBold,
  },

  foodContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: AppColors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
  },
  scrollSec: {
    paddingBottom: isTablet ? moderateScale(35) : moderateScale(50),
  },
  foodSubContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(16),
    backgroundColor: AppColors.white,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F4F6',
    borderWidth: moderateScale(1),
    borderColor: '#e4e4e4',
    borderRadius: moderateScale(8),
    gap: moderateScale(12),
    marginBottom: moderateScale(24),
    // height: 180,
  },
  inCompleteWarImg: {width: verticalScale(15), height: verticalScale(15)},
  warningText: {
    flex: 1,
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize15,
    // lineHeight: 18,
  },
  warningTextDay: {
    flex: 1,
    color: '#467267',
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize15,
    // lineHeight: 18,
  },
  warLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: moderateScale(8),
    paddingLeft: moderateScale(12),
    paddingVertical: moderateScale(12),
  },
  closeBtn: {
    paddingHorizontal: moderateScale(12),
    height: '100%',
    alignItems: 'center',
  },
  closeImg: {
    width: verticalScale(16),
    height: verticalScale(16),
    alignSelf: 'center',
    flex: 1,
  },
  monthText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
    // marginTop: 16,
  },
  seperator: {width: moderateScale(20)},
  logActionSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: AppColors.lightGreen,
    right: 0,
  },
  logActionView: {
    backgroundColor: AppColors.lightGreen,
    height: verticalScale(64),
    paddingHorizontal: moderateScale(16),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Platform.OS === 'ios' ? moderateScale(5) : 0,
    alignItems: 'center',
  },
  logActionText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
    width: '55%',
  },
  logActionBtn: {
    backgroundColor: AppColors.darkGreen,
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 4}, // Shadow direction and height
    shadowOpacity: 0.3, // Opacity of the shadow
    shadowRadius: 4, // Blur radius of the shadow
    elevation: 5, // Elevation for Android to achieve similar shadow effect
    width: '45%',
    height: verticalScale(40),
    borderRadius: moderateScale(30),
    paddingHorizontal: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logActionBtnText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.white,
    fontFamily: AppFonts.interSemibold,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  loaderStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Ensure loader is on top
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
  animation: {
    width: '50%',
    height: '20%',
  },
});

export default FoodLog;
