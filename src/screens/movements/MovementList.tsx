import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {
  useState,
  useCallback,
  useEffect,
  useContext,
  useRef,
} from 'react';
import {screenDimensions} from '../../utils/ScreenDimensions';
import {AppColors} from '../../theme/AppColors';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../../theme/AppFonts';
import {navigate, navigateBack} from '../../navigators/utils/Utils';
import SafetyFirst from '../../components/SafetyFirst';
import MovementGeneralInfo from '../../components/MovementGeneralInfoPopup';
import BeginTest from '../../components/BeginTest';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames';
import useTodoMovementList from '../../hooks/useTodoMovementList';
import useCompletedMovementList from '../../hooks/useCompletedMovementList';
import {MovementItem} from '../../types/MovementTypes';
import {formatDate} from '../../utils/Helper';
import {ScreenHeight} from 'react-native-elements/dist/helpers';
import {OrderResponseModel} from '../../models/OrderModel';
import {useSelector} from 'react-redux';
import {getMovementInfo} from '../../services/orderService';
import {useDispatch} from 'react-redux';
import {
  clearMovementResponse,
  setMovementResponse,
} from '../../store/slices/movementSlice';
import {MovementResponseModel} from '../../models/MovementModel';
import {
  movementJsonData,
  MovementTypes,
  getMovementId,
  unzipFile,
  downloadZipFile,
  getDoctorOrPatintById,
  isIdInAsyncStorage,
  getDataByMovementId,
  createZipFile,
  formatDateToYYYYMMDD,
  deleteDoctorPatientDataInAsync,
  findSide,
  requestAndroidPermissionsMocap,
  getFileName,
} from './mocap/MocapConstants';
import FlagForReviewModal from '../../components/FlagForReviewModal';
import {presignedurl} from '../../services/movementService';
import RNFS from 'react-native-fs';
import {ProfileData} from '../../models/ProfileModel';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {fileUploaderApi, updateMovement} from '../../services/movementService';
import {setUploadFalse} from '../../store/slices/patientUploadSlice';
import {setTryAgainFalse} from '../../store/slices/tryAgianSlice';
import moment from 'moment';
import {AppContext} from '../../context/AppContextProvider';
import {Error as ErrorType} from '../../types/CommonTypes';
import GlobalStyles from '../../styles/GlobalStyles';
import {Camera} from 'react-native-vision-camera';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {format, parseISO} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';
import {StorageKeys} from '../../utils/StorageKeys';
import {getData} from '../../utils/LocalStorage';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStrings } from '../../utils/Constants';
import AlertModal from '../../components/AlertModal';
import { VolumeManager, RINGER_MODE, RingerModeType } from 'react-native-volume-manager';

export default function MovementList({route}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const insets = useSafeAreaInsets();

  const orderResponse: OrderResponseModel | null = useSelector(
    (state: any) => state.order.orderResponse,
  );
  const movement: MovementResponseModel = useSelector(
    (state: any) => state.movement.movement,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Preparing video...');
  const {isFromTodaysTask, isFromTodaysItem, setupCompleted} = route.params;
  const [isSkipEnabled, setSkipEnabled] = useState(false);
  const {
    todoLoading,
    movementTodoList,
    refreshingTodo,
    overDueIndex,
    todoIndex,
    pedningIndex,
    refreshTodoList,
    loadMoreTodoList,
  } = useTodoMovementList(orderResponse?.order?.id, false);
  const {
    completeLoading,
    movementCompletedList,
    refreshingComplete,
    refreshCompletedList,
    loadMoreCompletedList,
    navigateToCompleteScreen,
    cTotalCount,
  } = useCompletedMovementList(orderResponse?.order?.id, false);

  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('AppContext must be used within an AppProvider');
  }

  const {
    setAlertTitle: setTitle,
    setAlertMessage: setMessage,
    setShowAlert: setAlert,
    clearAlert,
    setAlertButtons: setButtons,
  } = appContext;

  const [isSafetyModalVisible, setIsSafetyModalVisible] = useState(false);
  const [beginTestModalVisible, setBeginTestModalVisible] = useState(false);
  const [isGeneralInfoModalVisible, setIsGeneralInfoModalVisible] =
    useState(false);
  const [movementLoading, setMovementLoading] = useState(false);

  const dispatch = useDispatch();
  const [savedData, setSavedData] = useState([]);
  const [ringerMode, setRingerMode] = useState<RingerModeType | undefined>(undefined);
  const [currentVolume, setCurrentVolume] = useState<number | null>(null);
  const profileData: ProfileData = useSelector(
    (state: any) => state?.profile?.data,
  );
  const isVideoUploaded = useSelector(
    (state: any) => state.patientVideoUpload.is_Uploaded,
  );
  const [showSetupAlert, setSetupAlert] = useState(false);
  const isFromTryAgain = useSelector((state: any) => state.tryAgain.try_again);
  const isFocused = useIsFocused();
  const isFromTodayTaksViewed = useRef(false);
  const item: MovementResponseModel = useSelector(
    (state: any) => state.movement.movement,
  );
  const checkFirstVisit = async () => {
    if (item?.movementId && item?.assessmentId && item?.metadataId) {
      const visitedItems: any = await getData({
        key: StorageKeys.movSkipListSetup,
      });
      const visited = visitedItems ? JSON.parse(visitedItems) : {};
      if (visited === 'true') {
        setSkipEnabled(true);
      } else {
        setSkipEnabled(false);
      }
    }
  };
  useEffect(() => {
    checkFirstVisit();
  }, [item]);
  useEffect(() => {
    setupCompleted && setSkipEnabled(true);
  }, [setupCompleted]);
  useEffect(() => {
    item === null &&
      movementTodoList.length > 0 &&
      fetchMovementInfo(movementTodoList[0]);
  }, [movementTodoList]);
  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        getasyncStorageData();
        if (isFromTodaysTask && !isFromTodayTaksViewed.current) {
          isFromTodayTaksViewed.current = true;
          fetchMovementInfo(isFromTodaysItem);
          setIsGeneralInfoModalVisible(!isGeneralInfoModalVisible);
        }
      }
    }, []),
  );
  useEffect(() => {
    if (isVideoUploaded) {
      // setSelectedIndex(1);
      getasyncStorageData();
      setTimeout(() => {
        dispatch(setUploadFalse());
      }, 500);
    }
  }, [dispatch, isVideoUploaded]);
  useEffect(() => {
    console.log('isFromTryAgain called movement list', isFromTryAgain);
    if (isFromTryAgain) {
      setBeginTestModalVisible(true);
      // setTimeout(() => {
      //   dispatch(setTryAgainFalse());
      // }, 2000);
    } else {
      setBeginTestModalVisible(false);
    }
  }, [dispatch, isFromTryAgain]);

  const getasyncStorageData = async () => {
    console.log('async storage called', profileData.ameyaId);
    const doctorStorageData = await getDoctorOrPatintById(
      profileData.ameyaId,
      false,
    );
    console.log('Retrieved doctorStorage Data:', doctorStorageData?.data);
    if (doctorStorageData != null) {
      setSavedData(doctorStorageData.data);
    } else {
      setSavedData([]);
    }
  };
  const onRefresh = async () => {
    refreshTodoList();
    refreshCompletedList();
  };
  const backNavigation = () => {
    navigate(NavigatorNames.home);
  };

  const handleSegmentPress = (index: number) => {
    setSelectedIndex(index);
  };

  function onMovementClose() {
    setIsSafetyModalVisible(!isSafetyModalVisible);
  }

  function onMovementSafetyCall() {
    setIsSafetyModalVisible(!isSafetyModalVisible);
    Linking.openURL('tel:911');
  }

  const downloadAndUnzip = async (item, url: string, fileName: string) => {
    // const text = url;
    // const basePath = text.split('?')[0];
    // const result = basePath.split('/').pop().replace('.zip', '');
    // const fileName = `${result}.zip`; // File name
    const filePath =
      Platform.OS === 'ios'
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.ExternalDirectoryPath}/${fileName}`; // Full path to the file
    // const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`; // Full path to the file
    const movementId = await getMovementId(item.name, false);

    try {
      // Check if the file already exists
      const fileExists = await RNFS.exists(filePath);

      if (fileExists) {
        console.log('File already exists:', filePath);

        // If the file exists, proceed directly to unzipping or next steps
        const destinationPath =
          Platform.OS === 'ios'
            ? `${RNFS.DocumentDirectoryPath}/unzipped`
            : `${RNFS.ExternalDirectoryPath}/unzipped`;
        //const destinationPath = `${RNFS.DocumentDirectoryPath}/unzipped`;

        const videoPath = await unzipFile(filePath, destinationPath);

        console.log('File extracted:', videoPath);
        setIsLoading(false);
        navigate(NavigatorNames.mocapPlayBack, {
          methodName: 'Playback',
          data: {
            videoPath: videoPath,
            hideUserInterfaceElements: false,
            // uploaded: true,
            uploadData: {
              uploaded: true,
            },
          },
          isFromCompleted: true,
          zipFilePath: filePath,
          movementName: item.name,
          movementId: movementId,
        });
      } else {
        console.log('File does not exist, downloading...');

        // If the file does not exist, download and then unzip
        const zipFilePath = await downloadZipFile(url, fileName);
        if (zipFilePath) {
          const destinationPath =
            Platform.OS === 'ios'
              ? `${RNFS.DocumentDirectoryPath}/unzipped`
              : `${RNFS.ExternalDirectoryPath}/unzipped`;
          // const destinationPath = `${RNFS.DocumentDirectoryPath}/unzipped`;

          const videoPath = await unzipFile(zipFilePath, destinationPath);

          console.log('Download and extraction completed.', videoPath);
          setIsLoading(false);
          navigate(NavigatorNames.mocapPlayBack, {
            methodName: 'Playback',
            data: {
              videoPath: videoPath,
              hideUserInterfaceElements: false,
              // uploaded: true,
              uploadData: {
                uploaded: true,
              },
            },
            isFromCompleted: true,
            zipFilePath: zipFilePath,
            movementName: item.name,
            movementId: movementId,
          });
        }
      }
    } catch (error) {
      console.error('Error in downloadAndUnzip:', error);
      setIsLoading(false);
    }
  };
  async function extractDetails(inputString: string): Promise<string> {
    const parts = inputString.split('/');
    if (parts.length < 6) return ''; // Ensure valid input format

    const assessmentId = parts[1]; // Extract the assessment ID
    const dateRange = parts[2]; // Extract the date range (2025-01-09_2025-04-30)
    const movementName = parts[3].replace(/\s+/g, ''); // Remove spaces from movement name

    // Extract time from the last part
    const lastPart = parts[5];
    const timeMatch = lastPart.match(/\d{2}_\d{2}/); // Extract HH_MM format
    const time = timeMatch ? timeMatch[0].replace('_', ':') : 'NoTime';

    return `${assessmentId}_${dateRange}_${movementName}_${time}`;
  }
  async function onExerciseClick(item: MovementItem, index: number) {
    fetchMovementInfo(item);
    if (item.status === 'PENDING') {
      if (
        (savedData.length === 0 &&
          index === 0 &&
          moment().isSameOrAfter(item?.startDate)) ||
        (savedData.length > 0 &&
          index === savedData.length &&
          moment().isSameOrAfter(item?.startDate))
      ) {
        setIsGeneralInfoModalVisible(!isGeneralInfoModalVisible);
      } else if (isIdInAsyncStorage(savedData, item.id)) {
        setLoadingText('Preparing video.');
        navigateMocapPlayViewWithAsyncData(item);
      }
    } else {
      //handle Complete flow here
      navigateToCompleteScreen(item);
      console.log('item', item.videoKey);
      const data = {
        key: item.videoKey,
      };
      (async () => {
        const inputString = item.videoKey;
        const fileName = await extractDetails(inputString);
        setIsLoading(true);
        setLoadingText('Preparing video....');
        const response = await presignedurl(data);

        downloadAndUnzip(item, response.url, fileName);

        console.log('response.url', response.url);
      })();
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
  const navigateToMocapView = async () => {
    const movementId = await getMovementId(movement.name, false);
    const side = await findSide(movement.name);
    console.log('movemnet is', movementId, 'side', side);
    let frontDeviceIndex = 0;
    if (Platform.OS === 'android') {
      const result = await requestAndroidPermissionsMocap();
      if (!result) {
        console.warn('Permissions denied');
        return;
      }
      if (movementId > 10) {
        if (Platform.OS === 'android') {
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

  function onBeginCloseTest() {
    setBeginTestModalVisible(!beginTestModalVisible);
  }

  const fetchMovementInfo = async (item: MovementItem) => {
    try {
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
      setIsGeneralInfoModalVisible(false);
      //@ts-ignore

      clearAlert();
      setTitle('Failed');
      setMessage((e as ErrorType)?.message || 'Something went wrong');
      setAlert(true);
    } finally {
      setMovementLoading(false);
    }
  };
  const getVideoPath = async (uniqueID: String) => {
    // Get the application documents directory
    const persistentDataPath =
      Platform.OS === 'ios'
        ? RNFS.DocumentDirectoryPath
        : RNFS.ExternalDirectoryPath;
    const videosFolderPath = `${persistentDataPath}/Videos`;
    const videoPath = `${videosFolderPath}/${uniqueID}/`;
    try {
      // Check if the directory exists
      const directoryExists = await RNFS.exists(videoPath);

      if (!directoryExists) {
        return videoPath;
      }

      // List files in the directory
      const files = await RNFS.readDir(videoPath);

      for (const file of files) {
        if (file.isFile() && file.name.includes('timestamps.timestamps')) {
        }
      }
    } catch (error) {
      setIsLoading(false);
    }

    return videoPath;
  };

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-'; // Handle null/undefined values

    const utcDate = parseISO(dateString);
    const localDate = toZonedTime(utcDate, timeZone);

    // Extract day number
    const day = format(localDate, 'd'); // Single-digit day without leading zero

    return `${day} ${format(localDate, 'MMM yyyy')}`; // Example: "5 Mar 2024" or "15 Mar 2024"
  };

  const handleGetVideoPath = async (itemData: any) => {
    try {
      const path = await getVideoPath(itemData.videoId);
      console.log('video path is', path);
      handleZipAndUpload(path, itemData);
    } catch (error) {
      setIsLoading(false);
      console.error('Error while getting video path:', error); // Handle any errors
    }
  };
  const handleZipAndUpload = async (videoPath: string, itemData: any) => {
    try {
      const cleanedPath = videoPath.replace(`${itemData.videoId}/.`, '');
      console.log('Cleaned Path:', cleanedPath);
      const zipFilePath = await createZipFile(cleanedPath); // Ensure this returns base64 data
      if (!zipFilePath) {
        console.error('Failed to create ZIP file.');
        return;
      }

      const movementId = await getMovementId(
        itemData.movementDetails.name,
        false,
      );
      console.log('Movement ID:', movementId);
      const fileName = await getFileName(
        false,
        itemData.movementDetails.name,
        movementId,
      );
      const formData = new FormData();
      console.log('file name is', fileName);
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${zipFilePath}` : zipFilePath, // Ensure URI starts with `file://`
        name: fileName, // Change to your desired file name
        type: 'application/zip', // MIME type for ZIP files
      });
      const directory = `movement/${
        itemData.orderDetails.ameyaId
      }/${formatDateToYYYYMMDD(
        itemData.orderDetails.startDate,
      )}_${formatDateToYYYYMMDD(itemData.orderDetails.endDate)}/${
        itemData.movementDetails.name
      }/${formatDateToYYYYMMDD(
        itemData.movementDetails.startDate,
      )}_${formatDateToYYYYMMDD(itemData.movementDetails.endDate)}`;
      formData.append('directory', directory);
      // deletePath(videoPath);
      console.log('directory is', directory);
      const exists = await RNFS.exists(zipFilePath);
      console.log('zip is exits', exists);
      const response = await fileUploaderApi(formData);
      console.log('video uploaded and csv stated');
      if (response.data.key) {
        console.log('videoKey', response.data.key);
        const csvFilePath = itemData.csvPath; //await getCSVfilePath(itemData.videoId); // Ensure this returns a Promise
        console.log('CSV file path:', csvFilePath);
        // setLoadingText('CSV is Uploading...');
        uploadJsonAsCsv(
          csvFilePath,
          zipFilePath,
          videoPath,
          itemData,
          directory,
          response.data.key,
          movementId,
        );
      }
    } catch (error) {
      setIsLoading(false);
      clearAlert();
      setTitle('zip and upload Failed..');
      setAlert(true);
      console.error('Error handling zip and upload:', error.message);
    }
  };
  const uploadJsonAsCsv = async (
    csvFilePath: string,
    zipFilePath: string,
    videofilePath: string,
    itemData: any,
    directory: string,
    videokey: string,
    movementId: number,
  ) => {
    try {
      console.log('csv upload called');
      const fileName = await getFileName(
        true,
        itemData.movementDetails.name,
        movementId,
      ); //`${itemData.movementDetails.name} ${csvFileFormattedDate}.csv`;
      console.log('file name is', fileName);
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${csvFilePath}` : csvFilePath, // File URI
        name: fileName, // File name
        type: 'text/csv', // MIME type
      });
      formData.append('directory', directory);

      // Step 5: Upload the file
      const response = await fileUploaderApi(formData);

      if (response.data.key) {
        console.log('CSV uploaded successfully, key:', response.data.key);
        const data = {
          orderId: itemData.orderDetails.id.toString(),
          metadataId: itemData.movementDetails.metadataId.toString(),
          assessmentId: itemData.movementDetails.assessmentId.toString(),
          movementId: itemData.movementDetails.id.toString(),
          videoKey: videokey.toString(),
          csvKey: response.data.key.toString(),
          completedDate: moment().format('YYYY-MM-DD'),
        };
        console.log('update data is', data);
        const updateResponse = await updateMovement(data);
        setIsLoading(false);
        console.log('updateResponse', updateResponse);
        clearAlert();
        deleteFiles(csvFilePath, zipFilePath, videofilePath, itemData);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error uploading JSON as CSV:', error);
    }
  };
  const deleteFiles = async (
    csvJsonFilePath: string,
    zipFilePath: string,
    videofilePath: string,
    itemData: any,
  ) => {
    try {
      // Delete the CSV file
      await RNFS.unlink(csvJsonFilePath);
      console.log('CSV file deleted');

      // Delete the ZIP file
      await RNFS.unlink(zipFilePath);
      console.log('ZIP file deleted');

      // Delete the video file
      await RNFS.unlink(videofilePath);
      console.log('Video file deleted');

      await deleteDoctorPatientDataInAsync(
        profileData.ameyaId,
        itemData.videoId,
        false,
      );
      console.log('aync stoarge item deleted');
      setIsLoading(false);
      await getasyncStorageData();
      await onRefresh();
    } catch (error) {
      console.error('Error deleting files:', error);
      // Show error alert if any file deletion fails
    }
  };
  const navigateMocapPlayViewWithAsyncData = async (item: any) => {
    const findData = await getDataByMovementId(savedData, item.id);
    console.log('findData', findData.videoId);
    const videoPath = await getVideoPath(findData.videoId);
    console.log('videoPath', videoPath);
    const movementId = await getMovementId(item.name, false);

    navigate(NavigatorNames.mocapPlayBack, {
      methodName: 'Playback',
      data: {
        videoPath: videoPath,
        hideUserInterfaceElements: false,
        // uploaded: false,
        uploadData: {
          uploaded: true,
        },
      },
      isFromCompleted: false,
      zipFilePath: '',
      movementName: item.name,
      movementId: movementId,
    });
  };
  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText} maxFontSizeMultiplier={1.3}>
          {' '}
          No Movements available
        </Text>
      </View>
    );
  };
  const renderItem = ({item, index}: {item: any; index: number}) => {
    const isOverDue = new Date(item?.endDate) < new Date();
    return (
      <>
        {overDueIndex !== -1 &&
        overDueIndex === index &&
        item.status === 'PENDING' ? (
          <Text
            maxFontSizeMultiplier={1.3}
            style={[
              styles.subTitle,
              item?.name === 'To Do' && styles.subTitleTodo,
            ]}>
            Overdue
          </Text>
        ) : pedningIndex !== -1 &&
          pedningIndex === index &&
          item.status === 'PENDING' ? (
          <Text
            maxFontSizeMultiplier={1.3}
            style={[styles.subTitle, styles.subTitleTodo]}>
            Upload Pending
          </Text>
        ) : todoIndex !== -1 &&
          todoIndex === index &&
          item.status === 'PENDING' ? (
          <Text
            maxFontSizeMultiplier={1.3}
            style={[styles.subTitle, styles.subTitleTodo]}>
            To Do
          </Text>
        ) : null}
        <View style={styles.FlatListRenderContainer}>
          <TouchableOpacity onPress={() => {isSkipEnabled ? onExerciseClick(item, index) : setSetupAlert(true)}}>
            <View style={styles.itemBtnContainer}>
              <View style={styles.flex}>
                <View style={styles.itemTopSection}>
                  {item.status === 'PENDING' && isOverDue && (
                    <Image
                      source={require('../../../assets/images/overdue.png')}
                      style={styles.overDueImg}
                    />
                  )}
                  <Text
                    style={styles.movementNameText}
                    maxFontSizeMultiplier={1.3}>
                    {item.name}
                  </Text>
                </View>
                <Text style={styles.dueDateText} maxFontSizeMultiplier={1.3}>
                  {selectedIndex === 0
                    ? moment(item?.startDate).isSameOrBefore(moment())
                      ? `Due ${item?.endDate ? formatDate(item?.endDate) : '-'}`
                      : `Start ${
                          item?.startDate ? formatDate(item?.startDate) : '-'
                        }`
                    : `Completed ${
                        item?.completedDate
                          ? formatDateTime(item?.completedDate)
                          : formatDate(item?.endDate)
                      }`}
                </Text>
              </View>
              {isIdInAsyncStorage(savedData, item.id) === true &&
              item.status === 'PENDING' ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: AppColors.buttonDarkBlue,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 20,
                    alignContent: 'center',
                    height: verticalScale(30),
                    marginRight: 8,
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    setIsLoading(true);
                    const findData = getDataByMovementId(savedData, item.id);
                    console.log('findData', findData);
                    setLoadingText('Exporting and uploading CSV file...');
                    handleGetVideoPath(findData);
                  }}>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{
                      color: AppColors.white,
                      fontSize: AppFontSize.intersize14,
                      fontWeight: AppWeights.interMedium,
                      fontFamily: AppFonts.interMedium,
                      textAlign: 'center',
                      height: verticalScale(20),
                    }}>
                    Upload
                  </Text>
                </TouchableOpacity>
              ) : (
                <Image
                  source={require('../../../assets/images/arrowselect.png')}
                  resizeMode="contain"
                  tintColor={AppColors.buttonDarkBlue}
                  style={styles.arrowImg}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </>
    );
  };
  const updateTryAgianAsFalse = () => {
    dispatch(setTryAgainFalse());
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.topViewContainer}>
        <View style={styles.topView}>
          <View style={styles.topAndBackView}>
            <TouchableOpacity onPress={navigateBack}>
              <Image
                source={require('../../../assets/images/leftarrow.png')}
                resizeMode="contain"
                style={styles.backImg}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.titleText} maxFontSizeMultiplier={1.3}>
            Movement
          </Text>
          <TouchableOpacity onPress={onMovementClose}>
            <Image
              source={require('../../../assets/images/safetyicon.png')}
              resizeMode="contain"
              style={styles.safetyImg}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.TabViewcontainer}>
          <TouchableOpacity
            style={[
              styles.segment,
              selectedIndex === 0 && styles.selectedSegment,
            ]}
            onPress={() => handleSegmentPress(0)}>
            <Text
              maxFontSizeMultiplier={1.3}
              style={
                selectedIndex === 0
                  ? styles.selectedSegmentText
                  : styles.segmentText
              }>
              To Do
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              selectedIndex === 1 && styles.selectedSegment,
            ]}
            onPress={() => handleSegmentPress(1)}>
            <Text
              maxFontSizeMultiplier={1.3}
              style={
                selectedIndex === 1
                  ? styles.selectedSegmentText
                  : styles.segmentText
              }>
              {/* {'Completed(' + movementCompletedList.length + ')'}  */}
              Completed ({cTotalCount})
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          {
            !isSkipEnabled && selectedIndex === 0 ? (<Text
              maxFontSizeMultiplier={1.3}
              style={[
                styles.subTitle, {marginTop: moderateScale(16), marginBottom: moderateScale(0)}
              ]}>
              Get Started
            </Text>) : (<></>)
          }
          {movementTodoList.length > 0 && selectedIndex === 0 &&
          <TouchableOpacity
            style={!isSkipEnabled ? styles.buttonFirst : styles.button}
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
              setButtons &&
                setButtons([
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
                          movement: movement !== null ? movement : movementTodoList[0],
                        })
                      }
                    }
                    else{
                      setAlert(true);
                      navigate(NavigatorNames.setupVideoInstructions, {
                        movement: movement !== null ? movement : movementTodoList[0],
                      })
                    }
                    },
                  },
                ]);
              setAlert(true);
            }
            else {
              navigate(NavigatorNames.setupVideoInstructions, {
                movement: movement !== null ? movement : movementTodoList[0],
              })
            }
            }}>
            <View style={styles.addIconContainer}>
              <Image
                style={styles.actionImage}
                source={
                  isSkipEnabled
                    ? require('../../../assets/images/playicon.png')
                    : require('../../../assets/images/stepplayicon.png')
                }   
              />
            </View>

            <Text
              maxFontSizeMultiplier={1.4}
              style={[
                GlobalStyles.buttonText,
                isSkipEnabled && styles.againbuttontext,
              ]}>
              {isSkipEnabled ? 'Watch Setup Again' : 'Watch Movement Setup Video'}
            </Text>
          </TouchableOpacity>
          }
          {/* <CustomButton
                title={"Watch Step"}
                style={{
                  marginHorizontal: 15,
                  marginBottom: 10,
                  height: getModerateScaleSize(10)
                }}
                onPress={() => 
                  navigate(NavigatorNames.setupVideoInstructions, {
                    movement: movement,
                  })
                }
              /> */}
        </View>
        <View style={!isSkipEnabled && selectedIndex === 0 && styles.disableView}>
          {selectedIndex === 0 ? (
            <FlatList
              data={movementTodoList}
              renderItem={renderItem}
              keyExtractor={item =>
                item.id + item.assessmentId + item.metadataId
              }
              contentContainerStyle={isSkipEnabled ? { paddingBottom: insets.bottom + 30 } : { paddingBottom: insets.bottom + 30 + 20}}
              style={styles.compFlatList}
              //  contentContainerStyle={styles.listInContainer}
              refreshing={refreshingTodo}
              onRefresh={onRefresh}
              onEndReached={loadMoreTodoList}
              ListEmptyComponent={!todoLoading ? renderEmptyComponent : null}
              onEndReachedThreshold={0.001}
              ListFooterComponent={
                todoLoading && !refreshingTodo ? <ActivityIndicator /> : null
              }
            />
          ) : (
            <FlatList
              data={movementCompletedList}
              renderItem={renderItem}
              keyExtractor={item =>
                item.id + item.assessmentId + item.metadataId
              }
              contentContainerStyle={isSkipEnabled ? { paddingBottom: insets.bottom + 20} : { paddingBottom: insets.bottom + 20 + 20}}
              style={styles.compFlatList}
              refreshing={refreshingComplete}
              onRefresh={onRefresh}
              onEndReached={loadMoreCompletedList}
              onEndReachedThreshold={0.001}
              ListEmptyComponent={
                !completeLoading ? renderEmptyComponent : null
              }
              ListFooterComponent={
                completeLoading && !refreshingComplete ? (
                  <ActivityIndicator />
                ) : null
              }
            />
          )}
        </View>
      </View>
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
      {isSafetyModalVisible && (
        <SafetyFirst
          isSafetyModalVisible={isSafetyModalVisible}
          onPress={onMovementClose}
          onContinue={() => ({})}
          onCall={onMovementSafetyCall}
          screenType={2}
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
            navigate(NavigatorNames.videoInstructions);
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
              from: 'beginTest',
            });
          }}
          reviewSetup={() => {
            updateTryAgianAsFalse();
            setBeginTestModalVisible(false);
            navigate(NavigatorNames.setupVideoInstructions, {
              movement: movement !== null ? movement : movementTodoList[0],
              from: 'beginTest',
            });
          }}
        />
      )}
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text maxFontSizeMultiplier={1.3} style={styles.loadingText}>
            {loadingText}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: AppColors.lightBlue,
    flexDirection: 'column',
    flex: 1,
  },
  container: {
    backgroundColor: AppColors.white,
    flex: 1,
    borderTopLeftRadius: isTablet ? 35 : 25,
    borderTopRightRadius: isTablet ? 35 : 25,
  },
  topViewContainer: {
    height: verticalScale(70),
    width: screenDimensions.width,
    backgroundColor: AppColors.lightBlue,
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: moderateScale(20),
    marginTop: moderateScale(20),
  },
  topAndBackView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backImg: {
    height: verticalScale(25),
    width: verticalScale(25),
  },
  safetyImg: {
    height: verticalScale(38),
    width: verticalScale(38),
  },
  arrowImg: {
    height: verticalScale(25),
    width: verticalScale(25),
    alignSelf: 'center',
  },
  titleText: {
    color: AppColors.black,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize22,
    textAlign: 'center',
    alignSelf: 'center',
  },
  TabViewcontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(20),
    alignSelf: 'center',
    backgroundColor: AppColors.bgLightGrey,
    borderRadius: moderateScale(25), // Border radius for the entire control
    overflow: 'hidden', // Clip the content within border radius
    marginHorizontal: moderateScale(20),
  },
  segment: {
    flex: 1,
    paddingHorizontal: moderateScale(10),
    justifyContent: 'center', // Centers text vertically
    alignItems: 'center',
  },
  selectedSegment: {
    padding: moderateScale(10),
    backgroundColor: AppColors.buttonDarkBlue,
    borderRadius: moderateScale(25),
    alignSelf: 'center',
    shadowColor: '#000', // Black shadow
    shadowOffset: {
      width: 0,
      height: 5, // Offset shadow downwards
    },
    shadowOpacity: 0.5, // Transparency of shadow
    shadowRadius: 5, // Blur radius for shadow

    // Android Shadow
    elevation: 8,
  },
  segmentText: {
    textAlign: 'center',
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    color: AppColors.black,
  },
  selectedSegmentText: {
    textAlign: 'center',
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    color: AppColors.white,
  },
  FlatListRenderContainer: {
    backgroundColor: '#F4F4F6',
    padding: moderateScale(15),
    marginVertical: moderateScale(6),
    marginHorizontal: moderateScale(20),
    borderRadius: moderateScale(12),
  },
  movementNameText: {
    color: '#555555',
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
  },
  overDueImg: {
    width: verticalScale(16),
    height: verticalScale(16),
  },
  dueDateText: {
    color: '#333333',
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    textTransform: 'capitalize',
  },
  subTitle: {
    marginLeft: moderateScale(20),
    marginVertical: moderateScale(5),
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    color: '#6E6E6E',
    fontSize: AppFontSize.intersize16,
  },
  subTitleTodo: {marginTop: moderateScale(10)},
  emptyContainer: {
    marginTop: ScreenHeight / 2 - moderateScale(200),
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: AppFontSize.intersize16,
    color: 'black',
    fontFamily: AppFonts.interRegular,
  },
  compFlatList: {
    marginTop: moderateScale(15),
    marginBottom: verticalScale(100),
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: moderateScale(12),
  },
  bottomFlagSec: {flexDirection: 'row', alignItems: 'center', gap: 10},
  flagIcon: {width: verticalScale(12), height: verticalScale(12)},
  flagText: {
    color: '#333333',
    fontSize: AppFontSize.intersize14,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
  },
  notesText: {
    color: '#007AFF',
    fontSize: AppFontSize.intersize14,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
  },
  itemBtn: {
    paddingBottom: moderateScale(10),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#E6E6E6',
  },
  itemBtnContainer: {justifyContent: 'space-between', flexDirection: 'row'},
  flex: {flex: 1},
  itemTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    marginBottom: moderateScale(10),
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: moderateScale(10),
    color: '#fff',
    fontSize: AppFontSize.intersize18,
  },
  button: {
    borderRadius: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: moderateScale(20),
    marginTop: moderateScale(16),
    height: verticalScale(40),
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: AppColors.btnagainBg,
  },
  buttonFirst: {
    backgroundColor: AppColors.buttonBrightBlue,
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: moderateScale(20),
    marginTop: moderateScale(16),
    height: verticalScale(60),
    display: 'flex',
    flexDirection: 'row',
  },
  addIconContainer: {
    marginRight: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionImage: {
    width: verticalScale(11.6),
    height: verticalScale(11.6),
    // objectFit: 'cover',
  },
  videoImage: {
    width: verticalScale(17),
    height: verticalScale(17),
    // objectFit: 'cover',
  },
  againbuttontext: {
    color: AppColors.checkBoxText,
  },
  disableView: {
    opacity: 0.5,
    //pointerEvents: 'none',
  },
  videoSetupText: {
    color: AppColors.textFieldTextBlack,
    fontSize: AppFontSize.intersize14,
    fontFamily: AppFonts.interBold,
    fontWeight: AppWeights.interBold,
  },
});
