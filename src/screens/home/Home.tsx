/* eslint-disable react-native/no-inline-styles */
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  TextStyle,
  Platform,
  Alert,
  NativeModules,
} from "react-native";
import { screenDimensions } from "../../utils/ScreenDimensions.tsx";
import { AppColors } from "../../theme/AppColors";
import { AppStrings } from "../../utils/Constants.tsx";
import GlobalStyles from "../../styles/GlobalStyles.tsx";
import DashProgressBar from "../../components/DashProgressBar.tsx";
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from "../../theme/AppFonts.tsx";
import { navigate } from "../../navigators/utils/Utils.tsx";
import { NavigatorNames } from "../../navigators/tabs/NavigatorsNames.tsx";
import { getOrders, getTodayOrders } from "../../services/orderService.ts";
import { useDispatch, useSelector } from "react-redux";
import healthService from "../../services/health/healthService";
import {
  setOrderResponse,
  setPastNutritionResponse,
  updateIsFromTodaysTask,
} from "../../store/slices/orderSlice.ts";
import AmeyaLoader from "../../components/AmeyaLoader";
import { useFocusEffect } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import { getProfileDetailsByID } from "../../services/profileService.ts";
import { addProfileData } from "../../store/slices/profileSlice.ts";
import { ProfileData } from "../../models/ProfileModel.ts";
import { formatDateMMDD, getFirstCharacter } from "../../utils/Helper.tsx";
import moment from "moment";
import { StorageKeys } from "../../utils/StorageKeys";
import { storeData } from "../../utils/LocalStorage";
import GetMoving from "../../components/GetMoving";
import AlertModal from "../../components/AlertModal";
import CheckProgressBar from "../../components/CheckProgressBar.tsx";
import { pushNotification } from "../../services/authService.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../../context/AppContextProvider.tsx";
import BackgroundTaskManager from "../../native_modules/ios/HealthSyncModule.ts";
import { getHealthKitStatus } from "../../services/devicesService";
import RBSheet from "react-native-raw-bottom-sheet";
import {
  findSide,
  getMovementId,
  movementJsonData,
  requestAndroidPermissionsMocap,
} from "../movements/mocap/MocapConstants";
import {
  moderateScale,
  s,
  scale,
  verticalScale,
} from "react-native-size-matters";
import { getGrantedPermissions, initialize } from "react-native-health-connect";
import { useHealth } from "../../hooks/useHealth";
import DeviceInfo from "react-native-device-info";
import { MovementResponseModel } from "../../models/MovementModel";
import { getData } from "../../utils/LocalStorage";
import { MovementItem } from "../../types/MovementTypes";
import {
  clearMovementResponse,
  setMovementResponse,
} from "../../store/slices/movementSlice";
import { getMovementInfo } from "../../services/orderService";
import SystemNavigationBar from "react-native-system-navigation-bar";
import MovementGeneralInfo from "../../components/MovementGeneralInfoPopup.tsx";
import BeginTest from "../../components/BeginTest.tsx";
import { setTryAgainFalse } from "../../store/slices/tryAgianSlice.ts";
import { Camera } from "react-native-vision-camera";
import AlertModalMultiple from "../../components/AlertModalMutiple.tsx";
import { VolumeManager, RINGER_MODE, RingerModeType } from 'react-native-volume-manager';
// @ts-ignore

const Home = ({ route }) => {
  // @ts-ignore
  const calculateSteps = (nutritionData) => {
    // Check if nutritionData is defined
    if (!nutritionData || Object.keys(nutritionData).length === 0) {
      return {
        currentStep: 0,
        totalSteps: 0,
        dueDate: null, // Add this to track due date
        daysToGo: 0, // Track remaining days
        isNutritionExpired: true, // Default to false when no data
      };
    }

    const {
      totalDays: totalDaysToLog,
      completedDays,
      pendingDays,
      todayTaskDate,
      // startDateTime,
      endDateTime,
    } = nutritionData;

    // const maxSteps = 7; // Maximum steps we want to show in the progress bar

    // Use today's date if todayTaskDate is null
    const today = todayTaskDate ? new Date(todayTaskDate) : new Date();
    // const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    // const diffDays = Math.floor(
    //   (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    // );
    // const eDate = moment(endDateTime);
    // const diff = eDate.diff(moment(), 'days');
    // Determine which set of 7 days we're in
    // const currentSetStart =
    //   Math.floor((diffDays - 1) / maxSteps) * maxSteps + 1;
    // const currentSetEnd = Math.min(
    //   currentSetStart + maxSteps - 1,
    //   totalDaysToLog,
    // );

    // Calculate how many steps to fill based on the current set
    // const stepsInSet = currentSetEnd - currentSetStart + 1; // Total steps in this set
    // const completedStepsInSet = Math.min(
    //   completedDays - currentSetStart + 1,
    //   stepsInSet,
    // ); // Completed steps within the set

    // const totalDays = Math.ceil(
    //   (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    // );

    // Calculate days remaining
    // const daysRemaining = totalDays - diffDays; // Total days minus the current day

    // Format due date
    const dueDate = formatDateMMDD(endDateTime);

    // Check if the nutrition plan is expired
    const isNutritionExpired = today.getTime() >= endDate.getTime();

    return {
      currentStep: completedDays,
      totalSteps: totalDaysToLog,
      daysToGo: isNaN(pendingDays) ? 0 : Math.max(pendingDays, 0), // Dynamic message for remaining days
      dueDate: dueDate, // Return formatted due date
      isNutritionExpired: isNutritionExpired, // True if today is past the end date
    };
  };

  const movementDetails = (movementData: any) => {
    if (!movementData || Object.keys(movementData).length === 0) {
      return {
        isMovementExpired: true, // Default to false when no data
        mvDaysToGo: 0,
        mvMoreToGo: 0,
        mvDueDate: "",
      };
    } else {
      const {
        // todayTaskDate,
        // startDateTime,
        endDateTime,
        totalMovementCount,
        completedMovementCount,
      } = movementData;

      // Calculate totalDays dynamically based on startDateTime and endDateTime
      // const startDate = new Date(startDateTime);
      // const endDate = new Date(endDateTime);
      // const totalDays = Math.ceil(
      //   (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      // );
      const eDate = moment(endDateTime);
      const diff = eDate.diff(moment(), "days");
      // Use today's date if todayTaskDate is null
      // const today = todayTaskDate ? new Date(todayTaskDate) : new Date();
      // const diffDays = Math.floor(
      //   (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      // );

      // Calculate days remaining
      // const daysRemaining = totalDays - diffDays; // Total days minus the current day

      // Format due date
      const dueDate = formatDateMMDD(endDateTime);
      const mvMoreToGo =
        isNaN(totalMovementCount) || isNaN(completedMovementCount)
          ? 0
          : Math.max(totalMovementCount - completedMovementCount, 0);
      return {
        isMovementExpired: false,
        mvDaysToGo: Math.max(diff, 0), // Ensure daysRemaining is not negative
        mvDueDate: dueDate,
        mvMoreToGo,
      };
    }
  };

  const activityDetails = (activityData: any) => {
    if (!activityData || Object.keys(activityData).length === 0) {
      return {
        isActivityExpired: true, // Default to false when no data
        actDaysToGo: 0,
        actDueDate: "",
        devicesConnected: "-",
        noOfDeviceConnected: 0,
        connectedDevices: [],
      };
    } else {
      const {
        // todayTaskDate,
        // startDateTime,
        endDateTime,
        noOfDeviceConnected,
        connectedDevices,
      } = activityData;

      // Calculate totalDays dynamically based on startDateTime and endDateTime
      // const startDate = new Date(startDateTime);
      // const endDate = new Date(endDateTime);
      // const totalDays = Math.ceil(
      //   (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      // );
      const eDate = moment(endDateTime);
      const diff = eDate.diff(moment(), "days");
      // Use today's date if todayTaskDate is null
      // const today = todayTaskDate ? new Date(todayTaskDate) : new Date();
      // const diffDays = Math.floor(
      //   (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      // );
      // Calculate days remaining
      // const daysRemaining = totalDays - diffDays; // Total days minus the current day

      // Format due date
      const dueDate = formatDateMMDD(endDateTime);
      const deviceString =
        noOfDeviceConnected === 1 && connectedDevices?.length >= 1
          ? connectedDevices[0]?.deviceName
            ? connectedDevices[0]?.serviceName
              ? `${connectedDevices[0]?.deviceName} (${connectedDevices[0]?.serviceName}) device connected`
              : `${connectedDevices[0]?.deviceName} device connected`
            : `${connectedDevices[0]?.serviceName} device connected`
          : noOfDeviceConnected >= 2 && connectedDevices?.length > 1
          ? `${noOfDeviceConnected} devices connected`
          : "Click here to connect a device";

      return {
        isActivityExpired: false,
        actDaysToGo: Math.max(diff, 0),
        actDueDate: dueDate,
        devicesConnected: deviceString,
        noOfDeviceConnected: noOfDeviceConnected,
        connectedDevices: connectedDevices,
      };
    }
  };

  const surveyDetails = (surveyData: any) => {
    if (!surveyData || Object.keys(surveyData).length === 0) {
      return {
        isSurveyExpired: true, // Default to false when no data
        surDaysToGo: 0,
        surDueDate: "",
        surCurrentStep: 0,
        surTotalStep: 2,
        surMoreToGo: 0,
      };
    } else {
      const {
        // startDateTime,
        endDateTime,
        totalSurveyCount,
        completedSurveyCount,
      } = surveyData;

      // Calculate totalDays dynamically based on startDateTime and endDateTime
      // const startDate = new Date(startDateTime);
      // const endDate = new Date(endDateTime);
      // const totalDays = Math.ceil(
      //   (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      // );
      const eDate = moment(endDateTime);
      const diff = eDate.diff(moment(), "days");
      // Use today's date if todayTaskDate is null
      // const today = new Date();
      // const diffDays = Math.floor(
      //   (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      // );
      // Calculate days remaining
      // const daysRemaining = totalDays - diffDays; // Total days minus the current day
      const surMoreToGo = Math.max(totalSurveyCount - completedSurveyCount, 0);
      // Format due date
      const dueDate = formatDateMMDD(endDateTime);
      return {
        isSurveyExpired: false,
        surDaysToGo: Math.max(diff, 0),
        surDueDate: dueDate,
        surCurrentStep: completedSurveyCount,
        surTotalStep: totalSurveyCount,
        surMoreToGo,
      };
    }
  };

  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error("AppContext must be used within an AppProvider");
  }
  const {
    setAlertTitle: setTitle,
    setShowAlert: setAlert,
    setAlertMessage: setMessage,
    clearAlert,
    setAlertButtons: setAlertButtons,
  } = appContext;

  const movement: MovementResponseModel = useSelector(
    (state: any) => state.movement.movement
  );
  const [activeTab, setActiveTab] = useState("Progress");
  const [loading, setLoading] = useState(false);
  // const [isSafetyModalVisible, setIsSafetyModalVisible] = useState(false);
  const [isGetMovingModalVisible, setIsGetMovingModalVisible] = useState(false);
  // const [isGeneralInfoModalVisible, setIsGeneralInfoModalVisible] =
  //   useState(false);
  // const [beginTestModalVisible, setBeginTestModalVisible] = useState(false);
  const [loaderMessage] = useState("Hang tight, retrieving your order...");
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [isSkipEnabled, setSkipEnabled] = useState(false);
  const isSkipEnabledRef = useRef(false);
  const { setupCompleted, activeTabRoute } = route.params || {};
  const [showDevicePopup, setShowDevicePopup] = useState(false);
  const [showSetupAlert, setSetupAlert] = useState(false);
  const [ringerMode, setRingerMode] = useState<RingerModeType | undefined>(undefined);
  const [currentVolume, setCurrentVolume] = useState<number | null>(null);
  const token = useSelector((state: any) => state?.auth?.token);
  const profileData: ProfileData = useSelector(
    (state: any) => state?.profile?.data
  );
  const decodedToken = jwtDecode(token);
  const userID = decodedToken?.sub;
  if (Platform.OS === "ios") {
    BackgroundTaskManager.saveToken(token);
    BackgroundTaskManager.setUserId(userID as string);
  }

  const dispatch = useDispatch();
  // @ts-ignore
  const orderResponse = useSelector((state: any) => state.order.orderResponse);
  const { currentStep, totalSteps, daysToGo, dueDate, isNutritionExpired } =
    calculateSteps(orderResponse?.nutrition); // Destructure to get dueDate
  const { isMovementExpired, mvMoreToGo, mvDueDate } = movementDetails(
    orderResponse?.movement
  );
  const {
    isActivityExpired,
    actDueDate,
    devicesConnected,
    noOfDeviceConnected,
    connectedDevices,
  } = activityDetails(orderResponse?.activity);
  const {
    isSurveyExpired,
    surDueDate,
    surCurrentStep,
    surTotalStep,
    surMoreToGo,
  } = surveyDetails(orderResponse?.surveys);

  const [todayData, setTodayData] = useState<any>({});
  const [overdueTasksList, setOverdueTasksList] = useState<any>([]);
  const [todayTasksList, setTodayTasksList] = useState<any>([]);

  const [isLoadingHealthKit, setIsLoadingHealthKit] = useState(false);
  const [isGeneralInfoModalVisible, setIsGeneralInfoModalVisible] =
    useState(false);
  const [movementLoading, setMovementLoading] = useState(false);
  const [beginTestModalVisible, setBeginTestModalVisible] = useState(false);
  const bottomSheetRef = useRef<RBSheet>(null);
  const { refreshData } = useHealth();

  const checkFirstVisit = async () => {
    if (
      movement?.movementId &&
      movement?.assessmentId &&
      movement?.metadataId
    ) {
      const visitedItems: any = await getData({
        key: StorageKeys.movSkipListSetup,
      });
      const visited = visitedItems ? JSON.parse(visitedItems) : {};
      if (visited === "true" || isSkipEnabledRef.current) {
        setSkipEnabled(true);
        isSkipEnabledRef.current = true;
      } else {
        isSkipEnabledRef.current = false;
        setSkipEnabled(false);
      }
    }
  };
  useEffect(() => {
    checkFirstVisit();
  }, [movement]);
  useEffect(() => {
    if (setupCompleted) {
      setSkipEnabled(true);
      isSkipEnabledRef.current = true;
    }
  }, [setupCompleted]);
  useEffect(() => {
    activeTabRoute === "today" && setActiveTab("For Today");
  }, [activeTabRoute]);
  useEffect(() => {
    activeTab === "For Today" && checkFirstVisit();
  }, [activeTab]);
  useEffect(() => {
    movement === null &&
      overdueTasksList.length > 0 &&
      fetchMovementInfo(overdueTasksList[0]);
  }, [overdueTasksList]);
  useEffect(() => {
    movement === null &&
      todayTasksList.length > 0 &&
      fetchMovementInfo(todayTasksList[0]);
  }, [todayTasksList]);
  const fetchMovementInfo = async (item: MovementItem) => {
    try {
      //setLoading(true);
      setMovementLoading(true);
      dispatch(clearMovementResponse());
      const movResponse: any = await getMovementInfo(item.id);
      const data = {
        ...movResponse,
        assessmentId: item.assessmentId,
        metadataId: item.metadataId,
        name: item.name,
        startDate: item.startDate,
        endDate: item.endDate,
        id: item.id,
      };
      dispatch(setMovementResponse(data));
    } catch (e) {
      console.log(e);
      //@ts-ignore

      clearAlert();
    } finally {
      setLoading(false);
      setMovementLoading(false);
    }
  };

  // Add new state for bottom sheet visibility
  const [shouldShowBottomSheet, setShouldShowBottomSheet] = useState(false);

  //BackgroundTaskManager.saveToken(token);

  const renderStyledText = (text: string): JSX.Element => {
    const parts = text ? text.split(/(<\/?[bu]>)/) : []; // Split the text by the tags
    const components: JSX.Element[] = [];

    const renderPart = (subParts: string[], style: TextStyle) => {
      let currentStyle: TextStyle = { ...style };

      subParts.forEach((part, index) => {
        if (part === "<b>") {
          currentStyle = { ...currentStyle, ...styles.boldText };
        } else if (part === "</b>") {
          currentStyle = { ...currentStyle, ...styles.normalText };
        } else if (part === "<u>") {
          currentStyle = { ...currentStyle, ...styles.underlineText };
        } else if (part === "</u>") {
          currentStyle = { ...currentStyle, ...styles.normalText };
        } else {
          if (part.includes("For Today")) {
            {
              Platform.OS === "ios"
                ? components.push(
                    <View style={{ borderBottomWidth: 0.5, marginBottom: -3 }}>
                      <Text
                        // allowFontScaling={false}
                        maxFontSizeMultiplier={1.3}
                        key={index}
                        onPress={() => {
                          setActiveTab("For Today");
                        }}
                        style={currentStyle}
                      >
                        {part}
                      </Text>
                    </View>
                  )
                : components.push(
                    <Text
                      // allowFontScaling={false}
                      maxFontSizeMultiplier={1.3}
                      key={index}
                      onPress={() => {
                        setActiveTab("For Today");
                      }}
                      style={currentStyle}
                    >
                      {part}
                    </Text>
                  );
            }
          } else {
            components.push(
              <Text
                key={index}
                // allowFontScaling={false}
                maxFontSizeMultiplier={1.3}
                style={currentStyle}
              >
                {part}
              </Text>
            );
          }
        }
      });
    };

    renderPart(parts, {});

    return (
      <Text
        maxFontSizeMultiplier={1.3}
        // allowFontScaling={false}
        style={styles.normalText}
      >
        {components}
      </Text>
    );
  };

  useEffect(() => {
    if (Object.keys(todayData).length > 0) {
      const overdueTasks = [
        ...todayData.overdueTasks.movements.map((task: any) =>
          typeof task === "object" && task !== null
            ? { ...task, type: "movements", isOverDue: true }
            : { value: task, type: "movements", isOverDue: true }
        ),
        ...todayData.overdueTasks.nutrition.map((task: any) =>
          typeof task === "object" && task !== null
            ? { ...task, type: "nutrition", isOverDue: true }
            : { value: task, type: "nutrition", isOverDue: true }
        ),
        ...todayData.overdueTasks.activities.map((task: any) =>
          typeof task === "object" && task !== null
            ? { ...task, type: "activities", isOverDue: true }
            : { value: task, type: "activities", isOverDue: true }
        ),
        ...todayData.overdueTasks.surveys.map((task: any) =>
          typeof task === "object" && task !== null
            ? { ...task, type: "surveys", isOverDue: true }
            : { value: task, type: "surveys", isOverDue: true }
        ),
      ];

      const todayTasks = [
        ...todayData.todayTasks.movements.map((task: any) =>
          typeof task === "object" && task !== null
            ? { ...task, type: "movements", isOverDue: false }
            : { value: task, type: "movements", isOverDue: false }
        ),
        ...todayData.todayTasks.nutrition.map((task: any) =>
          typeof task === "object" && task !== null
            ? { ...task, type: "nutrition", isOverDue: false }
            : { value: task, type: "nutrition", isOverDue: false }
        ),
        ...todayData.todayTasks.activities.map((task: any) =>
          typeof task === "object" && task !== null
            ? { ...task, type: "activities", isOverDue: false }
            : { value: task, type: "activities", isOverDue: false }
        ),
        ...todayData.todayTasks.surveys.map((task: any) =>
          typeof task === "object" && task !== null
            ? { ...task, type: "surveys", isOverDue: false }
            : { value: task, type: "surveys", isOverDue: false }
        ),
      ];

      setOverdueTasksList(overdueTasks);
      setTodayTasksList(todayTasks);
    }
  }, [todayData]);
  useFocusEffect(
    useCallback(() => {
      SystemNavigationBar.navigationHide();
      const fetchData = async () => {
        try {
          // setLoading(true);
          await getProfileDetails();
          await fetchOrderData();
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };

      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  useEffect(() => {
    const fetchHealthKitStatus = async () => {
      try {
        setIsLoadingHealthKit(true);
        const response = await getHealthKitStatus();

        if (!response?.length) {
          return;
        }

        const deviceData = response.find(
          (item: any) =>
            item.serviceName === (Platform.OS === "ios" ? "APPLE" : "GOOGLE")
        );

        if (deviceData) {
          const { typeOfSync, lastSyncDateTime, active } = deviceData;

          await Promise.all([
            AsyncStorage.setItem("syncMode", typeOfSync.toLowerCase()),
            AsyncStorage.setItem("lastSyncDateTime", lastSyncDateTime),
            AsyncStorage.setItem("isDeviceActive", active.toString()),
          ]);

          if (Platform.OS === "ios") {
            BackgroundTaskManager.setSyncMode(typeOfSync.toLowerCase());
            BackgroundTaskManager.setLastSyncDateTime(lastSyncDateTime);
            if (active) {
              BackgroundTaskManager.syncHealthData();
            }
          } else {
            const isHealthKitActive = await healthService.isAvailable();
            if (active && isHealthKitActive) {
              await initialize();
              getGrantedPermissions()
                .then((permissions) => {
                  if (!permissions?.length) {
                    AsyncStorage.setItem("isHealthKitError", "true");
                  } else {
                    AsyncStorage.setItem("isHealthKitError", "false");
                    refreshData();
                  }
                })
                .catch((error) => {});
            }
          }
        }
      } catch (error) {
        console.error("Error getting health kit status:", error);
      } finally {
        setIsLoadingHealthKit(false);
      }
    };

    fetchHealthKitStatus();
    // Update the useEffect that shows the bottom sheet
    const checkBottomSheetVisibility = async () => {
      try {
        const hasShownBottomSheet = await AsyncStorage.getItem(
          StorageKeys.hasShownHealthKitBottomSheet
        );
        if (!hasShownBottomSheet) {
          // Small delay to ensure smooth animation after component mount
          const timer = setTimeout(() => {
            setShouldShowBottomSheet(true);
            showBottomSheet();
            AsyncStorage.setItem(
              StorageKeys.hasShownHealthKitBottomSheet,
              "true"
            );
          }, 500);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error("Error checking bottom sheet visibility:", error);
      }
    };

    Platform.OS === "ios" && checkBottomSheetVisibility();
  }, []);

  function onNotificationClick() {}

  function onNutritionClick() {
    dispatch(updateIsFromTodaysTask(false));
    if (!isNutritionExpired) {
      storeData({
        key: StorageKeys.selectedDate,
        value: moment().format("YYYY-MM-DD"),
      });
      navigate(NavigatorNames.foodLog);
    } else {
      setAlertTitle("No order found for Nutrition");
      setShowAlert(true);
    }
  }

  // function onMovementClick() {
  //   setIsSafetyModalVisible(!isSafetyModalVisible);
  //   setTimeout(() => {
  //     setIsGetMovingModalVisible(!isGetMovingModalVisible);
  //   }, 100);
  // }

  // function onMovementClose() {
  //   if (!isMovementExpired) {
  //     setIsSafetyModalVisible(!isSafetyModalVisible);
  //   } else {
  //     setAlertTitle('No order found for Movement');
  //     setShowAlert(true);
  //   }
  //   //navigate(NavigatorNames.patientList);
  // }

  function onActivityPress() {
    if (
      !isActivityExpired &&
      noOfDeviceConnected >= 1 &&
      connectedDevices.length >= 1
    ) {
      navigate(NavigatorNames.connectedDevices, {
        devices: connectedDevices,
      });
    } else if (isActivityExpired) {
      setAlertTitle("No order found for Activity");
      setShowAlert(true);
    } else {
      setShowDevicePopup(true);
    }
  }

  function onGetMovingClose() {
    if (!isMovementExpired) {
      setIsGetMovingModalVisible(!isGetMovingModalVisible);
    } else {
      setAlertTitle("No order found for Movement");
      setShowAlert(true);
    }
  }

  function onGeneralInfoClose() {
    setIsGeneralInfoModalVisible(!isGeneralInfoModalVisible);
  }
  function onBeginOpenTest() {
    setIsGeneralInfoModalVisible(!isGeneralInfoModalVisible);
    setTimeout(() => {
      setBeginTestModalVisible(!beginTestModalVisible);
    }, 100);
  }
  function onBeginCloseTest() {
    setBeginTestModalVisible(!beginTestModalVisible);
  }
  const updateTryAgianAsFalse = () => {
    dispatch(setTryAgainFalse());
  };
  const navigateToMocapView = async () => {
    const movementId = await getMovementId(movement.name, false);
    const side = await findSide(movement.name);
    console.log("movemnet is", movementId, "side", side);
    let frontDeviceIndex = 0;
    if (Platform.OS === "android") {
      const result = await requestAndroidPermissionsMocap();
      if (!result) {
        console.warn("Permissions denied");
        return;
      }
      if (movementId > 10) {
        if (Platform.OS === "android") {
          const devices = Camera.getAvailableCameraDevices();
          console.log(`Found ${devices.length} camera devices`);
          frontDeviceIndex = devices.length - 1;
        } else {
          frontDeviceIndex = 0;
        }
      }
      console.log(`Using device index ${frontDeviceIndex}`);
    }

    navigate(NavigatorNames.mocapView, {
      messageToUnity: JSON.stringify({
        id: movementId,
        data: JSON.stringify({
          movement: movementId,
          minimum: movementJsonData[movementId].Minimum,
          maximum: movementJsonData[movementId].Maximum,
          side: side,
          sensor: movementId > 10 ? 0 : 3,
          deviceIndex: frontDeviceIndex,
          // recordDepthData: true,
          videoDuration: movementJsonData[movementId].VideoDuration,
          showRemainingDuration: false,
          smoothing: 0.3,
          brightness: 0.5,
          flipViewHorizontally: movementId > 10 ? true : false,
          showBoundingBox: false,
          hideFaces: true,
          useInitialTimer: movementJsonData[movementId].UseInitialTimer,
          useEnhancedDepth: movementJsonData[movementId].UseEnhancedDepth,
          isCheckPostureFailCondition: false,
          useShouldersGait: movementJsonData[movementId].UseShouldersGait,
          smoothingType: movementJsonData[movementId].SmoothingType,
          videoName: new Date().toISOString(),
          hideUserInterfaceElements: false,
          UseVoiceCommands:
            movementJsonData[movementId].UseVoiceCommands || null,
          uploadData: {
            uploaded: true,
            // text: 'Upload',
          },
        }),
      }),
      isDoctor: false,
      isFromSkip: true,
      movementName: movement.name,
      movementId: movementId,
    });
  };
  function onGetMovingBegin() {
    setIsGetMovingModalVisible(!isGetMovingModalVisible);
    navigate(NavigatorNames.movementList, {
      isFromTodaysTask: false,
      isFromTodaysItem: {},
    });
  }

  const fetchOrderData = async () => {
    try {
      const response = await getOrders();
      dispatch(setOrderResponse(response)); // Store the fetched order in Redux

      const todayDataResponse = await getTodayOrders(response.order.id);
      setTodayData(todayDataResponse);
    } catch (error) {}
  };

  // Get profile details
  const getProfileDetails = async () => {
    try {
      const response = await getProfileDetailsByID(userID as string);
      dispatch(addProfileData(response));
      const ameyaId = response?.ameyaId;
      console.log("ameyaID: ", ameyaId);
      const fcmToken = await AsyncStorage.getItem("fcmToken");
      if (ameyaId && fcmToken) {
        const data = {
          ameyaId: response.ameyaId,
          token: fcmToken,
        };
        pushNotification(data);
      }
    } catch (error: any) {}
  };

  const setColorBasedOnType = (type: any) => {
    switch (type) {
      case "movements":
        return "#E5F4FA";
      case "nutrition":
        return AppColors.lightGreen;
      case "activities":
        return "#FFE6E8";
      case "surveys":
        return AppColors.lightPurple;
      default:
        return "gray"; // Default color if type doesn't match any case
    }
  };

  const imageMap: any = {
    movements: require("../../../assets/images/movement.png"),
    nutrition: require("../../../assets/images/apple.png"),
    activities: require("../../../assets/images/activityiconorange.png"),
    surveys: require("../../../assets/images/survey.png"),
    default: require("../../../assets/images/survey.png"),
  };

  const getImageBasedOnType = (type: any) => imageMap[type] || imageMap.default;
  const getIcobStyleBasedOnType = (type: any) => {
    switch (type) {
      case "movements":
        return styles.appleImageContainer;
      case "nutrition":
        return styles.appleImageContainer;
      case "activities":
        return styles.movementImageContainer;
      case "surveys":
        return styles.appleImageContainer;
      default:
        return styles.appleImageContainer;
    }
  };

  const renderTodayTaskItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.itemContainer,
        {
          backgroundColor: setColorBasedOnType(item.type),
          // justifyContent: 'space-between',
        },
      ]}
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onPress={async () => {
          console.log("");
          if (item.isOverDue && item.type === "nutrition") {
            clearAlert();
            setMessage(
              "Please note that you are editing the log of a past date."
            );
            setAlert(true);
          }
          if (item.type === "movements") {
            console.log("item is", item);
            const movementId = await getMovementId(item.name, false);
            if (movementId > 10 && !item.name.includes("Single Leg Balance")) {
              // navigate(NavigatorNames.movementList, {
              //   isFromTodaysTask: true,
              //   isFromTodaysItem: item,
              // });
              if (!isSkipEnabled || !isSkipEnabledRef.current) {
                setSetupAlert(true);
              } else {
                fetchMovementInfo(item);
                setIsGeneralInfoModalVisible(!isGeneralInfoModalVisible);
              }
            } else {
              setAlertTitle("3D Movements will record by doctor");
              setShowAlert(true);
            }
          } else if (item.type === "surveys") {
            navigate(NavigatorNames.surveyList, {
              isFromTodaysTask: true,
              isFromTodaysItem: item,
            });
          } else if (item.type === "nutrition") {
            dispatch(updateIsFromTodaysTask(true));

            const renamedData = {
              ...item,
              nutritionAnalysisId: item.assessmentId,
              startDateTime: item.startDate,
              endDateTime: item.endDate,
            };

            ["assessmentId", "startDate", "endDate"].forEach(
              (key) => delete renamedData[key]
            );
            storeData({
              key: StorageKeys.selectedDate,
              value: moment(item?.date).format("YYYY-MM-DD"),
            });
            dispatch(setPastNutritionResponse(renamedData));
            navigate(NavigatorNames.foodLog, { isFromTodaysTask: true });
          }
        }}
      >
        <View style={{ flexDirection: "row", flex: 1 }}>
          <Image
            source={getImageBasedOnType(item.type)}
            resizeMode="contain"
            style={getIcobStyleBasedOnType(item.type)}
          />
          {item.type === "nutrition" ? (
            <Text maxFontSizeMultiplier={1.3} style={styles.flatListText}>
              {moment(item.date).format("MMM DD")} - Nutrition log
            </Text>
          ) : (
            <Text maxFontSizeMultiplier={1.3} style={styles.flatListText}>
              {item.name}
            </Text>
          )}
        </View>
        {!item.isOverDue ? (
          <Image
            source={require("../../../assets/images/rightarrow.png")}
            resizeMode="contain"
            style={styles.arrowImgTodo}
          />
        ) : (
          <View style={styles.arrowImgTodo}></View>
        )}
      </TouchableOpacity>
    </View>
  );

  const showBottomSheet = () => {
    bottomSheetRef.current?.open();
  };

  const hideBottomSheet = () => {
    bottomSheetRef.current?.close();
    setShouldShowBottomSheet(false);
  };

  const handleConnectHealth = async () => {
    hideBottomSheet();
    await healthService.initialize();
    setShouldShowBottomSheet(false);
    navigate(NavigatorNames.devices, { enableToggle: true });
    //navigate(NavigatorNames.devices);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.scrollViewContent}
        // keyboardShouldPersistTaps="handled"
        // enableOnAndroid={true}
      >
        <View style={styles.subContainer}>
          <View style={styles.header}>
            <View style={styles.subHeader}>
              <View style={styles.profileImageContainer}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={styles.profileInitials}
                >
                  {getFirstCharacter(profileData?.firstName) +
                    getFirstCharacter(profileData?.lastName)}
                </Text>
              </View>

              <View style={styles.textHeader}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={GlobalStyles.textFieldText}
                >
                  {AppStrings.hello}
                </Text>
                <Text
                  maxFontSizeMultiplier={1.3}
                  numberOfLines={1}
                  style={[
                    GlobalStyles.titleHeadingText,
                    {
                      fontSize: AppFontSize.intersize20,
                      fontWeight: AppWeights.interMedium,
                      fontFamily: AppFonts.interMedium,
                      marginTop: scale(2),
                      textTransform: "capitalize",
                    },
                  ]}
                >
                  {profileData
                    ? profileData?.firstName + " " + profileData?.lastName
                    : "---"}
                </Text>
              </View>
            </View>
            {/* <TouchableOpacity
              onPress={onNotificationClick}
              style={styles.notificationButton}>
              <Image
                source={require('../../../assets/images/notificationbell.png')}
                resizeMode="contain"
                style={styles.bellImageContainer}
              />
            </TouchableOpacity> */}
          </View>

          {/* <View style={styles.greetingsContainer}>
            <View style={styles.greatContainer}>
              <Image
                source={
                  Object.keys(todayData).length > 0
                    ? {uri: todayData?.greetings?.icon}
                    : require('../../../assets/images/star.png')
                }
                resizeMode="contain"
                tintColor={AppColors.buttonDarkBlue}
                style={styles.starImg}
              />
              <Text
                maxFontSizeMultiplier={1.3}
                style={[
                  GlobalStyles.borderButtonText,
                  {
                    fontSize: AppFontSize.intersize18,
                    fontFamily: AppFonts.interSemibold,
                    fontWeight: AppWeights.interSemibold,
                  },
                ]}>
                {Object.keys(todayData).length > 0
                  ? todayData?.greetings?.title
                  : 'Welcome User!'}
              </Text>
            </View>
            <Text
              maxFontSizeMultiplier={1.3}
              //  allowFontScaling={false}
              style={[
                GlobalStyles.textFieldHeadingText,
                {
                  marginTop: 2,
                  textAlign: 'center',
                },
              ]}>
              {Object.keys(todayData).length > 0 ? todayData?.greetings?.subTitle1 : "You will see your to-dos in the For Today tab once they are assigned to you."}
            </Text>
            {renderStyledText(todayData?.greetings?.subTitle2)}
          </View> */}

          {/* Task Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={
                activeTab === "Progress" ? styles.activeTab : styles.inactiveTab
              }
              onPress={() => setActiveTab("Progress")}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={
                  activeTab === "Progress"
                    ? styles.tabTextActive
                    : styles.tabTextInactive
                }
              >
                Progress
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                activeTab === "For Today"
                  ? styles.activeTab
                  : styles.inactiveTab
              }
              onPress={() => {refreshData(); setActiveTab("For Today")}}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={
                  activeTab === "For Today"
                    ? styles.tabTextActive
                    : styles.tabTextInactive
                }
              >
                For Today
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "Progress" ? (
            <View style={{ flex: 1 }}>
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.cardsContainer}>
                  <View style={styles.row}>
                    <View
                      style={[styles.column, { marginRight: moderateScale(8) }]}
                    >
                      {/* Nutrition Card */}
                      <TouchableOpacity
                        style={[
                          styles.card,
                          {
                            backgroundColor: AppColors.lightGreen,
                            //height: scale(screenDimensions.height * 0.27),
                          },
                        ]}
                        onPress={onNutritionClick}
                      >
                        <View style={styles.cardInnerContainer}>
                          <View style={styles.cardInnerHeader}>
                            <Text
                              maxFontSizeMultiplier={1.3}
                              style={[
                                GlobalStyles.textFieldText,
                                {
                                  fontWeight: AppWeights.interBold,
                                  fontFamily: AppFonts.interBold,
                                },
                              ]}
                            >
                              {AppStrings.nutrition}
                            </Text>
                            <Image
                              source={require("../../../assets/images/apple.png")}
                              resizeMode="contain"
                              style={styles.appleImageContainer}
                            />
                          </View>

                          {isNutritionExpired ? (
                            <View style={styles.emptyContainer}>
                              <Text
                                maxFontSizeMultiplier={1.3}
                                style={[
                                  styles.dueDate,
                                  { marginTop: moderateScale(30) },
                                ]}
                              >
                                {AppStrings.trackNutrtionSeamlessly}
                              </Text>

                              <View style={[styles.noLog]}>
                                <Text
                                  maxFontSizeMultiplier={1.3}
                                  style={styles.dueText}
                                >
                                  {AppStrings.noLogs}
                                </Text>
                                <Image
                                  source={require("../../../assets/images/dashboardlock.png")}
                                  resizeMode="contain"
                                  style={styles.arrowImg}
                                />
                              </View>
                            </View>
                          ) : (
                            <>
                              <View style={styles.progressContainer}>
                                {totalSteps !== 0 && (
                                  <Text
                                    maxFontSizeMultiplier={1.3}
                                    style={[styles.completeText]}
                                  >
                                    {currentStep}/{totalSteps} days{" "}
                                    {AppStrings.complete}
                                  </Text>
                                )}
                                {totalSteps <= 10 && (
                                  <DashProgressBar
                                    currentStep={currentStep}
                                    totalSteps={totalSteps}
                                  />
                                )}
                              </View>

                              <View
                                style={[
                                  styles.cardInnerBottomContainer,
                                  { marginTop: moderateScale(15) },
                                ]}
                              >
                                <View style={styles.dueDateContainer}>
                                  {daysToGo > 0 && (
                                    <View style={styles.numberContainer}>
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={styles.numberText}
                                      >
                                        {daysToGo}
                                      </Text>
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={styles.daysToGo}
                                      >
                                        {daysToGo <= 1
                                          ? AppStrings.foodLogToGo
                                          : AppStrings.foodLogsToGo}
                                      </Text>
                                    </View>
                                  )}
                                  <View
                                    style={
                                      daysToGo > 0
                                        ? styles.bottomCardSec
                                        : [
                                            styles.bottomCardSec,
                                            { marginTop: moderateScale(50) },
                                          ]
                                    }
                                  >
                                    {daysToGo > 0 ? (
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={styles.dueText}
                                      >
                                        Finish by{"\n"}
                                        {dueDate}
                                      </Text>
                                    ) : (
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={[
                                          styles.dueText,
                                          {
                                            fontWeight: AppWeights.interBold,
                                            fontFamily: AppFonts.interBold,
                                          },
                                        ]}
                                      >
                                        {AppStrings.taskCompleted}
                                      </Text>
                                    )}
                                    <Image
                                      source={require("../../../assets/images/rightarrow.png")}
                                      resizeMode="contain"
                                      style={styles.arrowImg}
                                    />
                                  </View>
                                </View>
                              </View>
                            </>
                          )}
                        </View>
                      </TouchableOpacity>
                      {/* Movement Item card */}
                      <TouchableOpacity
                        onPress={onGetMovingClose}
                        style={[
                          styles.card,
                          {
                            backgroundColor: AppColors.movementBG,
                            //height: scale(screenDimensions.height * 0.26),
                            marginTop: moderateScale(8),
                          },
                        ]}
                      >
                        <View style={styles.cardInnerContainer}>
                          <View style={styles.cardInnerHeader}>
                            <Text
                              maxFontSizeMultiplier={1.3}
                              style={[
                                GlobalStyles.textFieldText,
                                {
                                  fontWeight: AppWeights.interBold,
                                  fontFamily: AppFonts.interBold,
                                },
                              ]}
                            >
                              {AppStrings.movement}
                            </Text>
                            <Image
                              source={require("../../../assets/images/movementicon.png")}
                              resizeMode="contain"
                              style={styles.movementImageContainer}
                            />
                          </View>
                          {isMovementExpired ? (
                            <View style={styles.emptyContainer}>
                              <Text
                                maxFontSizeMultiplier={1.3}
                                style={[
                                  styles.dueDate,
                                  { marginTop: moderateScale(30) },
                                ]}
                              >
                                {AppStrings.trackMovementSeamlessly}
                              </Text>

                              <View style={[styles.noLog]}>
                                <Text
                                  maxFontSizeMultiplier={1.3}
                                  style={styles.dueText}
                                >
                                  {AppStrings.noLogs}
                                </Text>
                                <Image
                                  source={require("../../../assets/images/dashboardlock.png")}
                                  resizeMode="contain"
                                  style={styles.arrowImg}
                                />
                              </View>
                            </View>
                          ) : (
                            <>
                              {/* <View style={styles.movementDescContainer}>
                            <Text
                              maxFontSizeMultiplier={1.3}
                              style={styles.dueDate}>
                              View all your progress in one place
                            </Text>
                          </View> */}

                              <View
                                style={[
                                  styles.cardInnerBottomContainer,
                                  { marginTop: moderateScale(35) },
                                ]}
                              >
                                <View style={styles.dueDateContainer}>
                                  {mvMoreToGo > 0 && (
                                    <View style={styles.numberContainer}>
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={styles.numberText}
                                      >
                                        {mvMoreToGo}
                                      </Text>
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={styles.daysToGo}
                                      >
                                        {mvMoreToGo <= 1
                                          ? AppStrings.movementToGo
                                          : AppStrings.movementsToGo}
                                      </Text>
                                    </View>
                                  )}
                                  <View
                                    style={
                                      mvMoreToGo > 0
                                        ? styles.bottomCardSec
                                        : [
                                            styles.bottomCardSec,
                                            { marginTop: scale(40) },
                                          ]
                                    }
                                  >
                                    {mvMoreToGo > 0 ? (
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={styles.dueText}
                                      >
                                        Finish by{"\n"}
                                        {mvDueDate}
                                      </Text>
                                    ) : (
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={[
                                          styles.dueText,
                                          {
                                            fontWeight: AppWeights.interBold,
                                            fontFamily: AppFonts.interBold,
                                          },
                                        ]}
                                      >
                                        {AppStrings.taskCompleted}
                                      </Text>
                                    )}
                                    <Image
                                      source={require("../../../assets/images/rightarrow.png")}
                                      resizeMode="contain"
                                      style={styles.arrowImg}
                                    />
                                  </View>
                                </View>
                              </View>
                            </>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Activity and Survey Cards */}
                    <View style={[styles.column]}>
                      {/* Activity Card */}
                      <TouchableOpacity
                        onPress={onActivityPress}
                        style={[
                          styles.card,
                          {
                            backgroundColor: AppColors.lightPink,
                            //height: scale(screenDimensions.height * 0.18),
                          },
                        ]}
                      >
                        <View style={styles.cardInnerContainer}>
                          <View style={styles.cardInnerHeader}>
                            <Text
                              maxFontSizeMultiplier={1.3}
                              style={[
                                GlobalStyles.textFieldText,
                                {
                                  fontWeight: AppWeights.interBold,
                                  fontFamily: AppFonts.interBold,
                                },
                              ]}
                            >
                              {AppStrings.activity}
                            </Text>
                            <Image
                              source={require("../../../assets/images/watch.png")}
                              resizeMode="contain"
                              style={styles.activityImageContainer}
                            />
                          </View>
                          {isActivityExpired ? (
                            <View style={styles.emptyContainer}>
                              <Text
                                maxFontSizeMultiplier={1.3}
                                style={[
                                  styles.dueDate,
                                  { marginTop: moderateScale(30) },
                                ]}
                              >
                                {AppStrings.trackPhysicalActivitySeamlessly}
                              </Text>

                              <View style={[styles.noLog]}>
                                <Text
                                  maxFontSizeMultiplier={1.3}
                                  style={styles.dueText}
                                >
                                  {AppStrings.noLogs}
                                </Text>
                                <Image
                                  source={require("../../../assets/images/dashboardlock.png")}
                                  resizeMode="contain"
                                  style={styles.arrowImg}
                                />
                              </View>
                            </View>
                          ) : (
                            <>
                              <View style={styles.movementDescContainer}>
                                <Text
                                  maxFontSizeMultiplier={1.3}
                                  style={[
                                    styles.dueDate,
                                  ]}
                                >
                                  {devicesConnected}
                                </Text>
                              </View>

                              <View
                                style={[
                                  styles.cardInnerBottomContainer,
                                  { marginTop: moderateScale(30) },
                                ]}
                              >
                                <View style={styles.dueDateContainer}>
                                  <View style={styles.numberContainer}>
                                    {/* {actDaysToGo !== 0 && (
                                  <Text
                                    maxFontSizeMultiplier={1.3}
                                    style={styles.numberText}>
                                    {actDaysToGo}
                                  </Text>
                                )}
                                <Text
                                  maxFontSizeMultiplier={1.3}
                                  style={styles.daysToGo}>
                                  {actDaysToGo === 1
                                    ? AppStrings.dayToGo
                                    : actDaysToGo !== 0
                                    ? AppStrings.daysToGo
                                    : AppStrings.dueToday}
                                </Text> */}
                                  </View>
                                  <View style={styles.bottomCardSec}>
                                    <View
                                      style={
                                        noOfDeviceConnected >= 1 &&
                                        connectedDevices?.length >= 1
                                          ? styles.bottomCardSec
                                          : ""
                                      }
                                    >
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={styles.dueText}
                                      >
                                        Finish by{"\n"}
                                        {actDueDate}
                                      </Text>
                                      {noOfDeviceConnected >= 1 &&
                                        connectedDevices?.length >= 1 && (
                                          <Image
                                            source={require("../../../assets/images/rightarrow.png")}
                                            resizeMode="contain"
                                            style={styles.arrowImg}
                                          />
                                        )}
                                    </View>
                                    {noOfDeviceConnected == 0 &&
                                      connectedDevices?.length == 0 && (
                                        <Image
                                          source={require("../../../assets/images/rightarrow.png")}
                                          resizeMode="contain"
                                          style={styles.arrowImg}
                                        />
                                      )}
                                  </View>
                                </View>
                              </View>
                            </>
                          )}
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          if (!isSurveyExpired) {
                            navigate(NavigatorNames.surveyList, {
                              isFromTodaysTask: false,
                              isFromTodaysItem: {},
                            });
                          } else {
                            setAlertTitle("No order found for Survey");
                            setShowAlert(true);
                          }
                        }}
                        style={[
                          styles.card,
                          {
                            backgroundColor: AppColors.lightPurple,
                            //height: scale(screenDimensions.height * 0.10),
                            marginTop: moderateScale(8),
                            flex: 1,
                          },
                        ]}
                      >
                        <View style={styles.cardInnerContainer}>
                          <View style={styles.cardInnerHeader}>
                            <Text
                              maxFontSizeMultiplier={1.3}
                              style={[
                                GlobalStyles.textFieldText,
                                styles.surveyTextStyle,
                              ]}
                            >
                              {AppStrings.survey}
                            </Text>
                            <Image
                              source={require("../../../assets/images/survey.png")}
                              resizeMode="contain"
                              style={styles.appleImageContainer}
                            />
                          </View>
                          {isSurveyExpired ? (
                            <View style={[styles.emptyContainer]}>
                              <Text
                                maxFontSizeMultiplier={1.3}
                                style={[
                                  styles.dueDate,
                                  { marginTop: moderateScale(30) },
                                ]}
                              >
                                {AppStrings.trackSurveySeamlessly}
                              </Text>

                              <View style={[styles.noLog]}>
                                <Text
                                  maxFontSizeMultiplier={1.3}
                                  style={styles.dueText}
                                >
                                  {AppStrings.noLogs}
                                </Text>
                                <Image
                                  source={require("../../../assets/images/dashboardlock.png")}
                                  resizeMode="contain"
                                  style={styles.arrowImg}
                                />
                              </View>
                            </View>
                          ) : (
                            <>
                              <View style={styles.movementDescContainer}>
                                {surTotalStep <= 5 && (
                                  <CheckProgressBar
                                    currentStep={surCurrentStep}
                                    totalSteps={surTotalStep}
                                  />
                                )}
                              </View>
                              <View style={styles.cardInnerBottomContainer}>
                                <View style={styles.dueDateContainer}>
                                  {surMoreToGo > 0 && (
                                    <View style={styles.numberContainer}>
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={styles.numberText}
                                      >
                                        {surMoreToGo}
                                      </Text>

                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={styles.daysToGo}
                                      >
                                        {AppStrings.moreToGo}
                                      </Text>
                                    </View>
                                  )}
                                  <View style={styles.bottomCardSec}>
                                    {surMoreToGo > 0 ? (
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={styles.dueText}
                                      >
                                        Finish by{"\n"}
                                        {surDueDate}
                                      </Text>
                                    ) : (
                                      <Text
                                        maxFontSizeMultiplier={1.3}
                                        style={[
                                          styles.dueText,
                                          {
                                            fontWeight: AppWeights.interBold,
                                            fontFamily: AppFonts.interBold,
                                          },
                                        ]}
                                      >
                                        {AppStrings.taskCompleted}
                                      </Text>
                                    )}
                                    <Image
                                      source={require("../../../assets/images/rightarrow.png")}
                                      resizeMode="contain"
                                      style={styles.arrowImg}
                                    />
                                  </View>
                                </View>
                              </View>
                            </>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          ) : (
            <View style={styles.todayTasksContainer}>
              {(todayData.overdueTasks?.movements?.length > 0 ||
                todayData.todayTasks?.movements?.length > 0) &&
                (!isSkipEnabled || !isSkipEnabledRef.current) && (
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={[
                    styles.sectionTitle,
                    {
                      marginTop: moderateScale(16),
                      marginBottom: moderateScale(8),
                    },
                  ]}
                >
                  Get Started
                </Text>
              )}
              {(todayData.overdueTasks?.movements?.length > 0 ||
                todayData.todayTasks?.movements?.length > 0) &&
                (!isSkipEnabled || !isSkipEnabledRef.current) && (
                  <TouchableOpacity
                    style={[
                      styles.button,
                    ]}
                    onPress={async () =>{
                      // Get latest volume and ringer mode before checking
                    const { volume } = await VolumeManager.getVolume();
                    const mode = await VolumeManager.getRingerMode();
                    setCurrentVolume(volume);
                    setRingerMode(mode);
                    
                    const isRingerModeNormal = mode === RINGER_MODE.normal;
                    const isVolumeSufficient = volume >= 0.8;
                    
                    if (!isRingerModeNormal || !isVolumeSufficient) {
                      setTitle('Sound Check');
                      setMessage(
                        <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.message}>
                          Please turn up your volume and make sure your device is not in
                          silent mode.
                        </Text>
                      );
                      setAlertButtons &&
                        setAlertButtons([
                          {
                            text: 'Ok',
                            onPress: async () => {
                              if (Platform.OS === 'android') {
                              // Check volume and ringer mode again when user clicks Ok
                              const { volume: newVolume } = await VolumeManager.getVolume();
                              const newMode = await VolumeManager.getRingerMode();
                              setCurrentVolume(newVolume);
                              setRingerMode(newMode);
                              
                              if (newVolume >= 0.8 && newMode === RINGER_MODE.normal) {
                                setAlert(false);
                                navigate(NavigatorNames.setupVideoInstructions, {
                                  movement:
                                    movement !== null
                                      ? movement
                                      : overdueTasksList?.length > 0
                                      ? overdueTasksList[0]
                                      : todayTasksList[0],
                                  from: "home",
                                })
                              }
                            }
                            else{
                              setAlert(true);
                              navigate(NavigatorNames.setupVideoInstructions, {
                                movement:
                                  movement !== null
                                    ? movement
                                    : overdueTasksList?.length > 0
                                    ? overdueTasksList[0]
                                    : todayTasksList[0],
                                from: "home",
                              })
                            }
                            },
                          },
                        ]);
                      setAlert(true);
                    }
                    else {
                      navigate(NavigatorNames.setupVideoInstructions, {
                        movement:
                          movement !== null
                            ? movement
                            : overdueTasksList?.length > 0
                            ? overdueTasksList[0]
                            : todayTasksList[0],
                        from: "home",
                      })
                    }
                    }}
                    // onPress={() =>
                    //   navigate(NavigatorNames.setupVideoInstructions, {
                    //     movement:
                    //       movement !== null
                    //         ? movement
                    //         : overdueTasksList?.length > 0
                    //         ? overdueTasksList[0]
                    //         : todayTasksList[0],
                    //     from: "home",
                    //   })
                    // }
                  >
                    <View style={styles.addIconContainer}>
                      <Image
                        style={styles.actionImage}
                        source={require("../../../assets/images/stepplayicon.png")}
                      />
                    </View>

                    <Text
                      maxFontSizeMultiplier={1.4}
                      style={[
                        GlobalStyles.buttonText,
                        (isSkipEnabledRef.current || isSkipEnabled) &&
                          styles.againbuttontext,
                      ]}
                    >
                      Watch Movement Setup Video
                    </Text>
                  </TouchableOpacity>
                )}
              {overdueTasksList?.length > 0 || todayTasksList?.length > 0 ? (
                <ScrollView>
                  <View>
                    <FlatList
                      data={[
                        ...(overdueTasksList?.length > 0
                          ? [{ title: "Overdue", data: overdueTasksList }]
                          : []),
                        ...(todayTasksList?.length > 0
                          ? [{ title: "To-do Today", data: todayTasksList }]
                          : []),
                      ]}
                      keyExtractor={(item, index) => `section-${index}`}
                      renderItem={({ item }) => (
                        <View>
                          <Text
                            maxFontSizeMultiplier={1.3}
                            style={styles.sectionTitle}
                          >
                            {item.title}
                          </Text>
                          {item.data.map((task: any, index: number) => (
                            <View
                              key={`${task.assessmentId}-${index}`}
                              style={
                                (!isSkipEnabledRef.current || !isSkipEnabled) &&
                                (todayData.overdueTasks?.movements?.length >
                                  0 ||
                                  todayData.todayTasks?.movements?.length >
                                    0) &&
                                task.type === "movements" &&
                                styles.disableView
                              }
                            >
                              {renderTodayTaskItem({ item: task })}
                            </View>
                          ))}
                        </View>
                      )}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={() => (
                        <View style={styles.noText}>
                          <Text
                            maxFontSizeMultiplier={1.3}
                            style={styles.noTaskText}
                          >
                            No tasks available
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.noText}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.noTaskText}>
                    No tasks available
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      <AmeyaLoader
        visible={loading || isLoadingHealthKit}
        message={loaderMessage}
      />
      {/* {isSafetyModalVisible && (
        <SafetyFirst
          isSafetyModalVisible={isSafetyModalVisible}
          onPress={onMovementClose}
          onContinue={onMovementClick}
          onCall={() => ({})}
          screenType={1}
        />
      )} */}
      {/* Combined SafetyFirst and GetMoving to carousel view */}
      {isGetMovingModalVisible && (
        <GetMoving
          isGetMovingModalVisible={isGetMovingModalVisible}
          onPress={onGetMovingClose}
          onBegin={onGetMovingBegin}
        />
      )}
      {showAlert && (
        <AlertModal
          alertModalVisible={showAlert}
          title={alertTitle}
          onClose={() => {
            setShowAlert(false);
            setAlertTitle("");
          }}
        />
      )}
      {isGeneralInfoModalVisible && (
        <MovementGeneralInfo
          isGeneralInfoModalVisible={isGeneralInfoModalVisible}
          onPress={onGeneralInfoClose}
          onSkip={onBeginOpenTest}
          onInstruction={() => {
            setIsGeneralInfoModalVisible(false);
            // Replace with actual response
            navigate(NavigatorNames.videoInstructions, {
              from: "home",
            });
          }}
          isLoading={movementLoading}
        />
      )}
      {beginTestModalVisible && (
        <BeginTest
          beginTestModalVisible={beginTestModalVisible}
          onClose={onBeginCloseTest}
          onBegin={() => {
            setBeginTestModalVisible(false);
            updateTryAgianAsFalse();
            // if (Platform.OS === 'ios') {
            navigateToMocapView();
            // }
          }}
          reviewIns={() => {
            updateTryAgianAsFalse();
            setBeginTestModalVisible(false);
            navigate(NavigatorNames.videoInstructions, {
              from: "beginTestHome",
            });
          }}
          reviewSetup={() => {
            updateTryAgianAsFalse();
            setBeginTestModalVisible(false);
            navigate(NavigatorNames.setupVideoInstructions, {
              movement:
                movement !== null
                  ? movement
                  : overdueTasksList?.length > 0
                  ? overdueTasksList[0]
                  : todayTasksList[0],
              from: "beginTestHome",
            });
          }}
          from="beginTestHome"
        />
      )}
      {/* {shouldShowBottomSheet && (
        <RBSheet
          ref={bottomSheetRef}
          useNativeDriver={true}
          closeOnPressMask={true}
          customStyles={{
            wrapper: {
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
            container: {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: 'auto',
              paddingBottom: 34,
            },
            draggableIcon: {
              backgroundColor: '#E0E0E0',
              width: 40,
            },
          }}>
          <View style={styles.bottomSheetContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={hideBottomSheet}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <View style={styles.contentContainer}>
              <View style={styles.healthIconContainer}>
                <Image
                  source={require('../../../assets/images/applehealth.png')}
                  style={styles.healthIcon}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.bottomSheetTitle}>Connect Apple Health</Text>
              
              <Text style={styles.bottomSheetDescription}>
                Use your Apple Watch to automatically complete your daily activities without even thinking about it.{'\n\n'}
                Seamlessly link your Apple Watch to Apple Health and effortlessly monitor your daily activities, ensuring you stay on track with your fitness goals.{'\n\n'}
                Easily connect your Apple Watch to Apple Health to track your daily activities and fitness goals without any hassle.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectHealth}>
              <Text style={styles.connectButtonText}>Connect to Apple Health</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notNowButton}
              onPress={hideBottomSheet}>
              <Text style={styles.notNowText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </RBSheet>
      )} */}
      {showDevicePopup && (
        <AlertModalMultiple
          alertModalVisible={showDevicePopup}
          title={""}
          message={"To track activity, connect a device in your settings."}
          buttons={[
            {
              text: "Go to Settings",
              onPress: () => {
                setShowDevicePopup(false);
                navigate(NavigatorNames.devices, { isFromHome: true });
              },
            },
          ]}
          buttonsExtra={[
            {
              text: "Close",
              onPress: () => {
                setShowDevicePopup(false);
              },
            },
          ]}
          onClose={() => {
            setShowDevicePopup(false);
          }}
        />
      )}
      <AlertModal
              alertModalVisible={showSetupAlert}
              title={'Watch Movement Setup Video'}
              message={
                'Please watch the Movement Setup Video before beginning a movement test.'
              }
              onClose={() => {
                setSetupAlert(false);
              }}
            />
    </SafeAreaView>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: isTablet ? 16 : scale(8),
  },
  subContainer: {
    marginTop: isTablet ? 16 : scale(8),
    flexDirection: "column",
    paddingBottom: 1,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subHeader: {
    flex: 1,
    marginRight: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
  },
  textHeader: {
    flex: 1,
    flexDirection: "column",
    marginLeft: moderateScale(12),
    flexShrink: 1, // Allow text to shrink if needed
  },
  notificationButton: {
    padding: moderateScale(4),
    justifyContent: "center",
    alignItems: "center",
    minWidth: moderateScale(32),
  },
  appleImageContainer: {
    width: verticalScale(20),
    height: verticalScale(20),
    alignSelf: "center",
  },
  movementImageContainer: {
    width: verticalScale(20),
    height: verticalScale(20),
    alignSelf: "center",
  },
  activityImageContainer: {
    width: verticalScale(20),
    height: verticalScale(20),
    alignSelf: "center",
  },
  bellImageContainer: {
    width: verticalScale(24),
    height: verticalScale(24),
    alignSelf: "center",
  },
  greetingsContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: moderateScale(18),
  },
  greatContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starImg: {
    width: verticalScale(14),
    height: verticalScale(14),
    marginRight: moderateScale(5),
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: verticalScale(15),
    backgroundColor: AppColors.bgLightGrey,
    borderRadius: moderateScale(30),
  },
  activeTab: {
    flex: 1,
    backgroundColor: AppColors.buttonDarkBlue,
    padding: moderateScale(10),
    borderRadius: moderateScale(30),
    alignItems: "center",
    // iOS Shadow
    shadowColor: "#000", // Black shadow
    shadowOffset: {
      width: 0,
      height: verticalScale(5), // Offset shadow downwards
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
    alignItems: "center",
    alignSelf: "center",
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
  cardsContainer: {
    flex: 1, // Ensures full height coverage
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Distributes cards evenly
    alignContent: "stretch", // Expands items to fill rows
    paddingVertical: moderateScale(10),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between", // Even spacing between columns
    width: "100%", // Ensure it takes full width
    //flex: 1, // Allow the row to take up available height
    flexWrap: "wrap",
  },
  column: {
    flexDirection: "column",
    flex: 1, // Dynamic width per column
  },
  card: {
    flexGrow: 1,
    flexBasis: "48%", // Adjust based on content
    minWidth: moderateScale(160),
    maxWidth: "100%",
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
  },
  cardTitle: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interBold,
    fontFamily: AppFonts.interBold,
    color: "#333",
  },
  dueDate: {
    fontSize: AppFontSize.intersize14,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
  },
  arrowIcon: {
    position: "absolute",
    right: moderateScale(10),
    bottom: moderateScale(10),
  },
  lockIcon: {
    marginTop: moderateScale(10),
  },
  surveyProgress: {
    flexDirection: "row",
    marginTop: moderateScale(10),
  },
  progressCircle: {
    width: verticalScale(12),
    height: verticalScale(12),
    borderRadius: moderateScale(6),
    marginHorizontal: moderateScale(2),
  },
  checkedCircle: {
    backgroundColor: "#4B0082",
  },
  emptyCircle: {
    borderRadius: moderateScale(1),
    borderColor: AppColors.bgLightGrey,
  },
  cardInnerContainer: {
    flexDirection: "column",
    flex: 1,
    justifyContent: "space-between",
  },
  cardInnerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // height: scale(20),
  },
  progressContainer: {
    flexDirection: "column",
    marginRight: moderateScale(12),
    alignSelf: "flex-start",
    marginTop: moderateScale(5),
  },
  movementDescContainer: {
    flexDirection: "column",
    marginTop: moderateScale(15),
    // alignSelf: 'center',
  },
  completeText: {
    marginTop: moderateScale(8),
    marginBottom: moderateScale(8),
    fontSize: AppFontSize.intersize14,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  surveyTextStyle: {
    fontWeight: AppWeights.interBold,
    fontFamily: AppFonts.interBold,
  },
  cardInnerBottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  dueDateContainer: {
    flexDirection: "column",
  },
  numberContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  numberText: {
    fontSize: AppFontSize.intersize38,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
    marginRight: moderateScale(4),
  },
  bottomCardSec: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginTop: moderateScale(10),
  },
  dueText: {
    // marginTop: 10,
    fontSize: AppFontSize.intersize15,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    flex: 1,
    fontFamily: AppFonts.interMedium,
  },
  daysToGo: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
    flexShrink: 1, // Prevents text from forcing a new line
    width: "auto", // Allows text to fit dynamically
    minWidth: moderateScale(50), // Adjust based on content
  },
  arrowImg: {
    width: verticalScale(38),
    height: verticalScale(38),
    alignSelf: "flex-end",
  },
  arrowImgTodo: {
    width: verticalScale(27),
    height: verticalScale(27),
  },
  emptyContainer: {
    flexGrow: 1,
    flexBasis: "48%", // Adjust based on content
    minWidth: moderateScale(160),
    maxWidth: "100%",
    borderRadius: moderateScale(10),
    justifyContent: "space-between",
  },
  noLog: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 0,
    flex: 1,
    marginTop: moderateScale(30),
  },
  profileImageContainer: {
    backgroundColor: "#E0E0EB",
    height: verticalScale(60),
    width: verticalScale(60),
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },

  profileInitials: {
    fontFamily: AppFonts.interRegular,
    fontSize: AppFontSize.intersize20,
    color: AppColors.buttonDarkBlue,
    fontWeight: AppWeights.interMedium,
  },
  todayTasksContainer: {
    flex: 1,
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(5),
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    marginVertical: moderateScale(10),
    color: "#6E6E6E",
  },
  noText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noTaskText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    textAlign: "center",
    color: "#6E6E6E",
  },
  itemContainer: {
    padding: isTablet ? scale(8) : scale(16),
    marginVertical: isTablet ? scale(4) : scale(7.5),
    borderRadius: isTablet ? scale(8) : scale(10),
  },
  flatListText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    marginHorizontal: moderateScale(10),
    flex: 1,
    alignSelf: "center",
    color: "#333333",
  },
  normalText: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldHeading,
    textDecorationLine: "none",
    textAlign: "center",
  },
  boldText: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interSemibold,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textFieldHeading,
    textDecorationLine: "none",
  },
  underlineText: {
    fontSize: AppFontSize.intersize16,
    textDecorationLine: Platform.OS === "ios" ? "none" : "underline",
    color: AppColors.textFieldHeading,
    fontFamily: AppFonts.interSemibold,
    fontWeight: AppWeights.interSemibold,
  },
  boldUnderlineText: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interSemibold,
    textDecorationLine: "underline",
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textFieldHeading,
  },
  bottomSheetContainer: {
    padding: moderateScale(24),
    paddingTop: moderateScale(12),
  },
  cancelButton: {
    alignSelf: "flex-end",
    paddingLeft: moderateScale(12),
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(8),
  },
  cancelText: {
    color: AppColors.buttonTextBlue,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    //lineHeight: scale(20),
    fontFamily: AppFonts.interMedium,
  },
  healthIconContainer: {
    alignItems: "center",
    marginTop: moderateScale(24),
    // marginVertical: 24,
  },
  healthIcon: {
    width: verticalScale(150),
    height: verticalScale(150),
  },
  bottomSheetTitle: {
    fontSize: AppFontSize.intersize26,
    fontWeight: AppWeights.interBold,
    fontFamily: AppFonts.interSemibold,
    color: AppColors.textHeadingBlack,
    textAlign: "center",
    marginBottom: moderateScale(16),
  },
  bottomSheetDescription: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interRegular,
    color: AppColors.textFieldHeading,
    textAlign: "center",
    marginBottom: moderateScale(24),
    //lineHeight: scale(20),
    paddingHorizontal: moderateScale(8),
  },
  connectButton: {
    backgroundColor: AppColors.buttonDarkBlue,
    borderRadius: moderateScale(60),
    padding: moderateScale(16),
    alignItems: "center",
    marginBottom: moderateScale(12),
  },
  connectButtonText: {
    color: AppColors.white,
    fontSize: AppFontSize.intersize18,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interSemibold,
    //lineHeight: scale(20),
    textAlign: "center",
  },
  notNowButton: {
    padding: moderateScale(8),
    alignItems: "center",
  },
  notNowText: {
    color: AppColors.buttonDarkBlue,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interBold,
    fontFamily: AppFonts.interMedium,
    textAlign: "center",
    //lineHeight: scale(20),
  },
  contentContainer: {
    paddingTop: moderateScale(24),
    paddingBottom: moderateScale(24),
    gap: moderateScale(16),
  },
  button: {
    backgroundColor: AppColors.buttonBrightBlue,
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: moderateScale(8),
    height: verticalScale(60),
    display: 'flex',
    flexDirection: 'row',
  },
  addIconContainer: {
    marginRight: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  actionImage: {
    width: verticalScale(11.6),
    height: verticalScale(11.6),
    // objectFit: 'cover',
  },
  againbutton: {
    backgroundColor: AppColors.btnagainBg,
  },
  againbuttontext: {
    color: AppColors.checkBoxText,
  },
  disableView: {
    opacity: 0.5,
    //pointerEvents: "none",
  },
});

export default Home;
