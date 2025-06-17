import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import React, {ReactNode, useCallback, useContext, useState} from 'react';
import {screenDimensions} from '../../utils/ScreenDimensions';
import {AppColors} from '../../theme/AppColors';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../../theme/AppFonts';
import {navigate, navigateBack} from '../../navigators/utils/Utils';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames';
import useTodoMovementList from '../../hooks/useTodoMovementList';
import useCompletedMovementList from '../../hooks/useCompletedMovementList';
import {MovementItem} from '../../types/MovementTypes';
import {formatDate} from '../../utils/Helper';
import {ScreenHeight} from 'react-native-elements/dist/helpers';
import {useDispatch, useSelector} from 'react-redux';
import {
  setDoctorMovementResponse,
  clearDoctorMovementResponse,
} from '../../store/slices/doctorMovementSlice';
import {
  setDoctorOrderResponse,
  clearDoctorOrderResponse,
} from '../../store/slices/doctorOrderSlice';

import {
  movementJsonData,
  getMovementId,
  getDoctorOrPatintById,
  formatDateToYYYYMMDD,
  createZipFile,
  deleteDoctorPatientDataInAsync,
  unzipFile,
  downloadZipFile,
  isIdInAsyncDoctorStorage,
  getDataByMovementId,
  findSide,
  getFileName,
  checkIsIpad,
  getDataByMovementAssessmentId,
} from '../movements/mocap/MocapConstants';
import {
  fileUploaderApi,
  presignedurl,
  updateMovement,
} from '../../services/movementService';
import {HcpOrgInfo} from '../../models/HcpOrgModel';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import RNFS from 'react-native-fs';
import {zip} from 'react-native-zip-archive';
import FlagForReviewModal from '../../components/FlagForReviewModal';
import {updateFlag, updateRedo} from '../../services/hcpService';
import AddNotesPopup from '../../components/FlagNotesPopup';
import RedoPopup from '../../components/RedoPopup';
import {Item} from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import moment from 'moment';
import AlertModal from '../../components/AlertModal';
import {AlertButtons} from '../../types/CommonTypes';
import GlobalStyles from '../../styles/GlobalStyles';
import {AppContext} from '../../context/AppContextProvider';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import {format, parseISO} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';
export default function HcpMovementList({route}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [showFlagPopup, setShowFlagPopup] = useState(false);
  const [flagType, setFlagType] = useState<'todo' | 'completed'>('todo');

  const {orderData} = route.params;
  const dispatch = useDispatch();
  const [savedData, setSavedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Uploading');
  const {
    todoLoading,
    movementTodoList,
    refreshingTodo,
    overDueIndex,
    todoIndex,
    refreshTodoList,
    loadMoreTodoList,
  } = useTodoMovementList(orderData.id, true);
  const {
    completeLoading,
    movementCompletedList,
    refreshingComplete,
    refreshCompletedList,
    loadMoreCompletedList,
    navigateToCompleteScreen,
  } = useCompletedMovementList(orderData.id,true);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState<ReactNode | string>('');
  const [alertButtons, setAlertButtons] = useState<AlertButtons>();
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('AppContext must be used within an AppProvider');
  }

  const {
    setAlertTitle: setTitle,
    setAlertMessage: setMessage,
    setShowAlert: setAlert,
    clearAlert,
  } = appContext;

  const [isGeneralInfoModalVisible, setIsGeneralInfoModalVisible] =
    useState(false);
  const [selectedMovItem, setSelectedMovItem] = useState<MovementItem>();
  const [selectedFlagItem, setSelectedFlagItem] = useState<MovementItem>();
  const [isNotesPopupVisible, setNotesPopupVisible] = useState(false);
  const [isRedoPopupVisible, setRedoPopupVisible] = useState(false);
  const [flagTag, setFlagTag] = useState('');
  const [flagNotes, setFlagNotes] = useState('');
  const doctorDetails: HcpOrgInfo = useSelector(
    (state: any) => state.hcpOrg.data,
  );

  const isFocused = useIsFocused();
  const isIpad = checkIsIpad();
  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        setTimeout(() => {
          getasyncStorageData();
        }, 200);

        return () => {};
      }
    }, []),
  );

  const getasyncStorageData = async () => {
    await getDoctorOrPatintById(doctorDetails.ameyaId, true).then(
      doctorStorageData => {
        if (doctorStorageData != null) {
          setSavedData(doctorStorageData.data);
        } else {
          setSavedData([]);
        }
      },
    );
  };
  const onRefresh = () => {
    refreshTodoList();
    refreshCompletedList();
  };

  const handleSegmentPress = (index: number) => {
    setSelectedIndex(index);
  };
  const getVideoPath = async (uniqueID: String) => {
    // Get the application documents directory
    const persistentDataPath = RNFS.DocumentDirectoryPath;
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

  const downloadAndUnzip = async (
    item: {
      assessmentId?: string;
      csvKey?: string;
      endDate?: string;
      id: any;
      metadataId?: string;
      name?: string;
      startDate?: string;
      status?: 'PENDING' | 'COMPLETED';
      videoKey?: string;
      flagTag?: string;
      flagNotes?: string;
      isFlagged?: boolean;
    },
    url: string,
    fileName: string,
  ) => {
    // const text = url;
    // const basePath = text.split('?')[0];
    // const result = basePath.split('/').pop().replace('.zip', '');

    // console.log('result', result);
    // const fileName = `${result}.zip`; // File name
    const movementId = await getMovementId(item.name ?? '', true);
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`; // Full path to the file

    try {
      // Check if the file already exists
      const fileExists = await RNFS.exists(filePath);
      console.log('fileExists', fileExists);
      if (fileExists) {
        // If the file exists, proceed directly to unzipping or next steps
        const destinationPath = `${RNFS.DocumentDirectoryPath}/unzipped`;
        const videoPath = await unzipFile(filePath, destinationPath);

        setIsLoading(false);
        navigate(NavigatorNames.mocapPlayBack, {
          methodName: 'Playback',
          data: {
            videoPath: videoPath,
            hideUserInterfaceElements: false,
            uploaded: true,
            uploadData: {
              uploaded: true,
              // text: 'Upload',
            },
          },
          isFromCompleted: true,
          zipFilePath: filePath,
          movementName: item.name,
          movementId: movementId,
        });
      } else {
        // If the file does not exist, download and then unzip
        const zipFilePath = await downloadZipFile(url, fileName);
        if (zipFilePath) {
          const destinationPath = `${RNFS.DocumentDirectoryPath}/unzipped`;
          const videoPath = await unzipFile(zipFilePath, destinationPath);

          setIsLoading(false);
          navigate(NavigatorNames.mocapPlayBack, {
            methodName: 'Playback',
            data: {
              videoPath: videoPath,
              hideUserInterfaceElements: false,
              uploaded: true,
              uploadData: {
                uploaded: true,
                // text: 'Upload',
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
      setIsLoading(false);
    }
  };
  const onExerciseClick = async (item: MovementItem) => {
    if (item.status === 'PENDING') {
      if (item.isFlagged) {
        setShowAlert(true);
        setAlertTitle('Flag will be removed');
        setAlertMessage(
          <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.message}>
            Clicking{' '}
            <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.messageBold}>
              Continue
            </Text>{' '}
            will remove the flag. Are you sure you want to proceed?
          </Text>,
        );
        setAlertButtons([
          {text: 'Cancel', onPress: () => {}},
          {
            text: 'Continue',
            onPress: async () => {
              setIsGeneralInfoModalVisible(!isGeneralInfoModalVisible);
              setSelectedMovItem(item);
              if (isIdInAsyncDoctorStorage(savedData, item.id, orderData.id)) {
                navigateMocapPlayView(item);
              } else {
                // Clear existing data

                dispatch(clearDoctorMovementResponse());
                dispatch(clearDoctorOrderResponse());

                const movementData = {
                  assessmentId: item.assessmentId,
                  metadataId: item.metadataId,
                  name: item.name,
                  startDate: item.startDate,
                  endDate: item.endDate,
                  id: item.id,
                };

                const orderDataList = {
                  ameyaId: orderData.ameyaId,
                  startDate: orderData.startDate,
                  endDate: orderData.endDate,
                  id: orderData.id,
                  firstName: orderData.participant.firstName,
                  lastName: orderData.participant.lastName,
                };

                try {
                  // Await both Redux actions
                  await Promise.all([
                    dispatch(setDoctorMovementResponse(movementData)),
                    dispatch(setDoctorOrderResponse(orderDataList)),
                  ]);

                  // Navigate after Redux updates
                  navigateToMocapRecordView(item);
                } catch (error) {}
              }
            },
          },
        ]);
      } else {
        setIsGeneralInfoModalVisible(!isGeneralInfoModalVisible);
        setSelectedMovItem(item);
        if (isIdInAsyncDoctorStorage(savedData, item.id, orderData.id)) {
          navigateMocapPlayView(item);
        } else {
          // Clear existing data

          dispatch(clearDoctorMovementResponse());
          dispatch(clearDoctorOrderResponse());

          const movementData = {
            assessmentId: item.assessmentId,
            metadataId: item.metadataId,
            name: item.name,
            startDate: item.startDate,
            endDate: item.endDate,
            id: item.id,
          };

          const orderDataList = {
            ameyaId: orderData.ameyaId,
            startDate: orderData.startDate,
            endDate: orderData.endDate,
            id: orderData.id,
            firstName: orderData.participant.firstName,
            lastName: orderData.participant.lastName,
          };

          try {
            // Await both Redux actions
            await Promise.all([
              dispatch(setDoctorMovementResponse(movementData)),
              dispatch(setDoctorOrderResponse(orderDataList)),
            ]);

            // Navigate after Redux updates
            navigateToMocapRecordView(item);
          } catch (error) {}
        }
      }
    } else {
      // // Handle Complete flow here
      navigateToCompleteScreen(item);

      const data = {
        key: item.videoKey,
      };
      (async () => {
        const inputString = item.videoKey;
        console.log('inputString', inputString);
        const fileName = await extractDetails(inputString);
        console.log('fileName', fileName);
        // Output: "NIEJIHZXEXSide-by-SideStance"
        setIsLoading(true);
        setLoadingText('Preparing video....');
        const response = await presignedurl(data);

        downloadAndUnzip(item, response.url, fileName);

        console.log('response.url', response.url);
      })();
    }
  };
  const navigateMocapPlayView = async (item: any) => {
    const findData = await getDataByMovementAssessmentId(
      savedData,
      item.assessmentId,
      item.name,
    );
    console.log('find data ', findData);
    const videoPath = await getVideoPath(findData.videoId);
    const movementId = await getMovementId(item.name, true);

    navigate(NavigatorNames.mocapPlayBack, {
      methodName: 'Playback',
      data: {
        videoPath: videoPath,
        hideUserInterfaceElements: false,
        // uploaded: false,
        uploadData: {
          uploaded: true,
          // text: 'Upload',
        },
      },
      isFromCompleted: false,
      zipFilePath: '',
      movementName: item.name,
      movementId: movementId,
    });
  };
  const navigateToMocapRecordView = async (movement: {
    assessmentId?: string;
    csvKey?: string;
    endDate?: string;
    id?: string;
    metadataId?: string;
    name: any;
    startDate?: string;
    status?: 'PENDING' | 'COMPLETED';
    videoKey?: string;
    flagTag?: string;
    flagNotes?: string;
    isFlagged?: boolean;
  }) => {
    const movementId = await getMovementId(movement.name, true);
    const side = await findSide(movement.name);
    navigate(NavigatorNames.mocapView, {
      messageToUnity: JSON.stringify({
        id: movementId,
        data: JSON.stringify({
          movement: movementId,
          minimum: movementJsonData[movementId].Minimum,
          maximum: movementJsonData[movementId].Maximum,
          side: side,
          sensor: movementId > 10 ? 0 : 3,
          deviceIndex: 0,
          // recordDepthData: false,
          videoDuration: movementJsonData[movementId].VideoDuration,
          showRemainingDuration: false,
          smoothing: 0.3,
          brightness: 0.5,
          flipViewHorizontally: false,
          showBoundingBox: false,
          hideFaces: true,
          useInitialTimer: movementJsonData[movementId].UseInitialTimer,
          useEnhancedDepth: movementJsonData[movementId].UseEnhancedDepth,
          isCheckPostureFailCondition: false,
          useShouldersGait: movementJsonData[movementId].UseShouldersGait,
          smoothingType: movementJsonData[movementId].SmoothingType,
          videoName: new Date().toISOString(),
          hideUserInterfaceElements: false,
          uploadData: {
            uploaded: false,
            text: 'Save',
          },
        }),
      }),
      isDoctor: true,
      isFromSkip: true,
      movementName: movement.name,
      movementId: movementId,
    });
  };
  const handleGetVideoPath = async (itemData: any) => {
    try {
      const path = await getVideoPath(itemData.videoId);
      handleZipAndUpload(path, itemData);
    } catch (error) {
      setIsLoading(false);
    }
  };
  const handleZipAndUpload = async (videoPath: string, itemData: any) => {
    try {
      // Clean up the video path if needed
      const cleanedPath = videoPath.replace(`${itemData.videoId}/.`, '');

      const zipFilePath = await createZipFile(cleanedPath); // Ensure this returns base64 data
      if (!zipFilePath) {
        return;
      }

      // const zipFilePathStat = await RNFS.stat(zipFilePath);
      // const zipFilePathSize = zipFilePathStat.size; // Size in bytes
      // const fileName = `${itemData.movementDetails.name} ${csvFileFormattedDate}.zip`;
      const movementId = await getMovementId(
        itemData.movementDetails.name,
        true,
      );
      const fileName = await getFileName(
        false,
        itemData.movementDetails.name,
        movementId,
      );
      const formData = new FormData();
      formData.append('file', {
        uri: zipFilePath, // Ensure URI starts with `file://`
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

      // Upload the ZIP file using your API method

      const response = await fileUploaderApi(formData);

      // Handle the response
      if (response.data?.key) {
        // If additional uploads are required, process them
        const csvFilePath = itemData.csvPath; //await getCSVfilePath(itemData.videoId); // Generate CSV file path

        uploadJsonAsCsv(
          csvFilePath,
          zipFilePath,
          videoPath,
          itemData,
          directory,
          response.data.key,
          movementId,
        );
      } else {
        setIsLoading(false);
        setTitle('zip and upload Failed..');
        setAlert(true);
      }
    } catch (error) {
      setIsLoading(false);
      setTitle('zip and upload Failed');
      setAlert(true);
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
      // const fileName = `${itemData.movementDetails.name} ${csvFileFormattedDate}.csv`;
      const fileName = await getFileName(
        true,
        itemData.movementDetails.name,
        movementId,
      );
      const formData = new FormData();
      formData.append('file', {
        uri: csvFilePath, // File URI
        name: fileName, // File name
        type: 'text/csv', // MIME type
      });
      formData.append('directory', directory);

      const response = await fileUploaderApi(formData);

      if (response.data.key) {
        const data = {
          orderId: itemData.orderDetails.id.toString(),
          metadataId: itemData.movementDetails.metadataId.toString(),
          assessmentId: itemData.movementDetails.assessmentId.toString(),
          movementId: itemData.movementDetails.id.toString(),
          videoKey: videokey.toString(),
          csvKey: response.data.key.toString(),
          completedDate: moment().format('YYYY-MM-DD'),
        };

        const updateResponse = await updateMovement(data);
        setIsLoading(false);

        onClear();
        setAlertTitle('Video Uploaded');
        setAlertMessage('Your video has been successfully saved!');
        setAlertButtons([
          {
            text: 'Continue',
            onPress: () =>
              deleteFiles(csvFilePath, zipFilePath, videofilePath, itemData),
          },
        ]);
        setShowAlert(true);
      }
    } catch (error) {
      setIsLoading(false);
      clearAlert();
      setTitle('Error');
      setMessage(error?.toString() ?? 'Error uploading JSON as CSV');
      setAlert(true);
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
      // await RNFS.unlink(csvJsonFilePath);
      console.log('csvJsonFilePath DELETED', csvJsonFilePath);
      // Delete the ZIP file
      await RNFS.unlink(zipFilePath);

      // Delete the video file
      await RNFS.unlink(videofilePath);

      await deleteDoctorPatientDataInAsync(
        doctorDetails.ameyaId,
        itemData.videoId,
        true,
      );

      setIsLoading(false);
      getasyncStorageData();
      onRefresh();
    } catch (error) {
      // Show error alert if any file deletion fails
    }
  };

  const deleteVideoPathAndAsync = async (
    videofilePath: string,
    itemData: any,
    zipPath: string,
  ) => {
    try {
      // Delete the video file
      await RNFS.unlink(videofilePath);

      if (zipPath != '') {
        await RNFS.unlink(zipPath);
      }

      await deleteDoctorPatientDataInAsync(
        doctorDetails.ameyaId,
        itemData.videoId,
        true,
      );
      setIsLoading(false);
      getasyncStorageData();
      onRefresh();
    } catch (error) {
      // Show error alert if any file deletion fails
    }
  };

  const handleFlagNotes = note => {
    setFlagNotes(note);
    setNotesPopupVisible(false);
    updateFlagForMovment(note);
  };

  const handleFlagTag = item => {
    if (item === 'Redo Movement') {
      onClear();
      setAlertTitle('Data will be deleted');
      setAlertMessage(
        'Redoing this movement will erase all previously saved participant data for this movement. Are you sure you want to continue?',
      );
      setAlertButtons([
        {text: 'Cancel'},
        {
          text: 'Continue',
          onPress: async () => {
            // updateRedoMovment(selectedFlagItem);
            const findData = await getDataByMovementAssessmentId(
              savedData,
              selectedFlagItem?.assessmentId,
              selectedFlagItem?.name,
            );
            console.log('findData', findData);
            const path = await getVideoPath(findData.videoId);

            deleteVideoPathAndAsync(path, findData, '');
          },
        },
      ]);
      setShowAlert(true);
    } else {
      setFlagTag(item);
      setNotesPopupVisible(true);
    }
  };

  const onClear = () => {
    setAlertTitle('');
    setAlertMessage('');
    setAlertButtons(undefined);
    setShowAlert(false);
  };

  const handleRedo = item => {
    if (item === 'Set Flagging') {
      setShowFlagPopup(true);
      setFlagType('completed');
    } else if (item === 'Redo Movement') {
      onClear();
      setAlertTitle('Data will be deleted');
      setAlertMessage(
        'Redoing this movement will erase all previously saved participant data for this movement. Are you sure you want to continue?',
      );
      setAlertButtons([
        {text: 'Cancel'},
        {
          text: 'Continue',
          onPress: async () => {
            console.log('1redo clicked');
            updateRedoMovment(selectedFlagItem);
          },
        },
      ]);
      setShowAlert(true);
    }
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

  const updateRedoMovment = async item => {
    const data = {
      orderId: orderData.id,
      metadataId: selectedFlagItem?.metadataId
        ? selectedFlagItem?.metadataId
        : item.metadataId,
      assessmentId: selectedFlagItem?.assessmentId
        ? selectedFlagItem?.assessmentId
        : item.assessmentId,
      movementId: selectedFlagItem?.id ? selectedFlagItem?.id : item.id,
    };
    try {
      setLoadingText('');
      setIsLoading(true);
      await updateRedo(data);
      onRefresh();
      setIsLoading(false);
      console.log('videoKey', item.videoKey);
      const fileName = await extractDetails(item.videoKey);
      const zipPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.unlink(zipPath);
      console.log('delted zip path');
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const updateFlagForMovment = async (note: any) => {
    setLoadingText('');
    setIsLoading(true);
    const data = {
      orderId: orderData.id,
      metadataId: selectedFlagItem?.metadataId,
      assessmentId: selectedFlagItem?.assessmentId,
      movementId: selectedFlagItem?.id,
      flagTag: flagTag,
      flagNotes: note,
      isFlagged: true,
    };

    try {
      await updateFlag(data);
      onRefresh();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
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
  const renderItem = ({item, index}: {item: any; index: number}) => (
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
      ) : (
        todoIndex !== -1 &&
        todoIndex === index &&
        item.status === 'PENDING' && (
          <Text
            maxFontSizeMultiplier={1.3}
            style={[styles.subTitle, styles.subTitleTodo]}>
            To Do
          </Text>
        )
      )}
      <View style={styles.FlatListRenderContainer}>
        <TouchableOpacity
          style={item.isFlagged === true && styles.itemBtn}
          onPress={() => onExerciseClick(item)}>
          <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text
                style={[
                  styles.movementNameText,
                  {
                    fontSize: isIpad
                      ? AppFontSize.intersize16
                      : AppFontSize.intersize17,
                  },
                ]}
                maxFontSizeMultiplier={1.3}>
                {/* {item.metadata.data.foodData.name} */}
                {item.name}
              </Text>
              <Text
                style={[
                  styles.dueDateText,
                  {
                    fontSize: isIpad
                      ? AppFontSize.intersize16
                      : AppFontSize.intersize17,
                  },
                ]}
                maxFontSizeMultiplier={1.3}>
                {selectedIndex === 0
                  ? `Due ${item?.endDate ? formatDate(item?.endDate) : '-'}`
                  : `Completed ${
                      item?.completedDate
                        ? formatDateTime(item?.completedDate)
                        : formatDate(item?.endDate)
                    }`}
              </Text>
            </View>
            {isIdInAsyncDoctorStorage(savedData, item.id, orderData.id) ===
              true && item.status === 'PENDING' ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: AppColors.buttonDarkBlue,
                    paddingVertical: 2,
                    paddingHorizontal: 20,
                    borderRadius: 20,
                    alignContent: 'center',
                    justifyContent: 'center',
                    height: moderateScale(27),
                    marginRight: moderateScale(25),
                  }}
                  onPress={() => {
                    setIsLoading(true);
                    // try {
                    const findData = getDataByMovementAssessmentId(
                      savedData,
                      item.assessmentId,
                      item.name,
                    );
                    console.log('saved data', savedData);
                    console.log('findData', findData);
                    // console.log('item', item);

                    setLoadingText('Exporting and uploading CSV file...');
                    handleGetVideoPath(findData);
                    // }catch(error){

                    // }
                  }}>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{
                      color: AppColors.white,
                      fontSize: AppFontSize.intersize14,
                      fontWeight: AppWeights.interMedium,
                      fontFamily: AppFonts.interMedium,
                      textAlign: 'center',
                    }}>
                    Upload
                  </Text>
                </TouchableOpacity>
                {!item.isFlagged && (
                  <TouchableOpacity
                    style={[styles.arrowImgCon, {paddingRight: 20}]}
                    onPress={() => {
                      setShowFlagPopup(true);
                      setFlagType('todo');
                      setSelectedFlagItem(item);
                    }}>
                    <Image
                      source={require('../../../assets/images/flagunfilled.png')}
                      resizeMode="contain"
                      style={styles.arrowImg}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : item.status === 'PENDING' && !item.isFlagged ? (
              <TouchableOpacity
                style={[styles.arrowImgCon, {paddingRight: 20}]}
                onPress={() => {
                  setShowFlagPopup(true);
                  setFlagType('todo');
                  setSelectedFlagItem(item);
                }}>
                <Image
                  source={require('../../../assets/images/flagunfilled.png')}
                  resizeMode="contain"
                  style={styles.arrowImg}
                />
              </TouchableOpacity>
            ) : !item.isFlagged && item.status != 'PENDING' ? (
              <TouchableOpacity
                style={[styles.arrowImgCon, {paddingRight: 20}]}
                onPress={() => {
                  setRedoPopupVisible(true);
                  setSelectedFlagItem(item);
                }}>
                <Image
                  source={require('../../../assets/images/redodot.png')}
                  resizeMode="contain"
                  style={styles.arrowImg}
                />
              </TouchableOpacity>
            ) : item.isFlagged && item.status != 'PENDING' ? (
              <TouchableOpacity
                style={{
                  backgroundColor: AppColors.buttonDarkBlue,
                  paddingVertical: moderateScale(10),
                  paddingHorizontal: moderateScale(20),
                  borderRadius: moderateScale(20),
                  alignContent: 'center',
                  justifyContent: 'center',
                  height: verticalScale(30),
                  marginRight: moderateScale(8),
                }}
                onPress={() => {
                  setSelectedFlagItem(item);
                  onClear();
                  setAlertTitle('Data will be deleted');
                  setAlertMessage(
                    'Redoing this movement will erase all previously saved participant data for this movement. Are you sure you want to continue?',
                  );
                  setAlertButtons([
                    {text: 'Cancel'},
                    {
                      text: 'Continue',
                      onPress: async () => {
                        console.log('2redo clicked');
                        updateRedoMovment(item);
                      },
                    },
                  ]);
                  setShowAlert(true);
                }}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{
                    color: AppColors.white,
                    fontSize: AppFontSize.intersize14,
                    fontWeight: AppWeights.interMedium,
                    fontFamily: AppFonts.interMedium,
                    textAlign: 'center',
                  }}>
                  Redo
                </Text>
              </TouchableOpacity>
            ) : (
              <></>
            )}
          </View>
        </TouchableOpacity>
        {item.isFlagged && (
          <View style={styles.bottomContainer}>
            <View style={styles.bottomFlagSec}>
              <Image
                source={require('../../../assets/images/redflag.png')}
                resizeMode="contain"
                style={styles.flagIcon}
              />
              <Text style={styles.flagText} maxFontSizeMultiplier={1.3}>
                {item.flagTag}
              </Text>
            </View>
            {item.flagNotes && (
              <TouchableOpacity
                onPress={() => {
                  clearAlert();
                  setTitle(`Notes for ${item.flagTag}`);
                  setMessage(`${item.flagNotes}`);
                  setAlert(true);
                }}>
                <Text style={styles.notesText} maxFontSizeMultiplier={1.3}>
                  Notes
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView
      style={{
        backgroundColor: AppColors.lightBlue,
        flexDirection: 'column',
        flex: 1,
      }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            navigateBack();
          }}
          style={styles.backIconWrapper}>
          <Image
            source={require('../../../assets/images/leftarrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/ameyalogo.png')}
          resizeMode="contain"
          style={styles.imageContainer}
        />
        <View style={{width: 30}} />
      </View>
      <View
        style={{
          backgroundColor: AppColors.white,
          flex: 1,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}>
        <View style={styles.TabViewcontainer}>
          <TouchableOpacity
            style={[
              styles.segment,
              selectedIndex === 0 && styles.selectedSegment,
            ]}
            onPress={() => handleSegmentPress(0)}>
            <Text
              maxFontSizeMultiplier={1.4}
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
              maxFontSizeMultiplier={1.4}
              style={
                selectedIndex === 1
                  ? styles.selectedSegmentText
                  : styles.segmentText
              }>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
        {selectedIndex === 0 ? (
          <FlatList
            data={movementTodoList}
            renderItem={renderItem}
            keyExtractor={item => item.id + item.assessmentId + item.metadataId}
            style={{marginTop: 30}}
            // contentContainerStyle={styles.listInContainer}
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
            keyExtractor={item => item.id + item.assessmentId + item.metadataId}
            style={{marginTop: 30}}
            refreshing={refreshingComplete}
            onRefresh={onRefresh}
            onEndReached={loadMoreCompletedList}
            onEndReachedThreshold={0.001}
            ListEmptyComponent={!completeLoading ? renderEmptyComponent : null}
            ListFooterComponent={
              completeLoading && !refreshingComplete ? (
                <ActivityIndicator />
              ) : null
            }
          />
        )}
      </View>
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text maxFontSizeMultiplier={1.3} style={styles.loadingText}>
            {loadingText}
          </Text>
        </View>
      )}
      {/* move this flag items to doctors list */}
      {showFlagPopup && (
        <FlagForReviewModal
          flagForReviewModalVisible={showFlagPopup}
          onClose={() => {
            setShowFlagPopup(false);
          }}
          onFlagPress={item => {
            setShowFlagPopup(false);
            handleFlagTag(item);
          }}
          type={flagType}
          isShowUndo={isIdInAsyncDoctorStorage(
            savedData,
            selectedFlagItem.id,
            orderData.id,
          )}
          // isShowUndo={true}
        />
      )}
      {isNotesPopupVisible && (
        <AddNotesPopup
          visible={isNotesPopupVisible}
          onClose={() => setNotesPopupVisible(false)}
          onSave={handleFlagNotes}
        />
      )}
      {isRedoPopupVisible && (
        <RedoPopup
          redoModalVisible={isRedoPopupVisible}
          onClose={() => {
            setRedoPopupVisible(false);
          }}
          onOptionPress={item => {
            setRedoPopupVisible(false);
            handleRedo(item);
          }}
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
          column
          onClose={onClear}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topViewContainer: {
    height: getModerateScaleSize(80),
    width: screenDimensions.width,
    backgroundColor: AppColors.lightBlue,
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
  },
  topAndBackView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backImg: {
    height: getModerateScaleSize(25),
    width: getModerateScaleSize(25),
  },
  safetyImg: {
    height: getModerateScaleSize(34),
    width: getModerateScaleSize(34),
  },
  arrowImgCon: {
    height: getModerateScaleSize(25),
    width: getModerateScaleSize(25),
    alignSelf: 'center',
    justifyContent: 'center',
  },
  arrowImg: {
    height: getModerateScaleSize(25),
    width: getModerateScaleSize(25),
    alignSelf: 'center',
  },
  titleText: {
    color: AppColors.black,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize22,
    marginLeft: 20,
  },
  TabViewcontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: AppColors.bgLightGrey,
    borderRadius: 30, // Border radius for the entire control
    overflow: 'hidden', // Clip the content within border radius
    marginHorizontal: 20,
  },
  segment: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center', // Centers text vertically
    alignItems: 'center',
  },
  selectedSegment: {
    padding: 15,
    backgroundColor: AppColors.buttonDarkBlue,
    borderRadius: 30,
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
    padding: 15,
    paddingRight: 5,
    marginVertical: 8,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  movementNameText: {
    color: '#555555',
    fontFamily: AppFonts.interMedium,
    //fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    marginBottom: 10,
  },
  dueDateText: {
    color: '#333333',
    fontFamily: AppFonts.interSemibold,
    //fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
  },
  subTitle: {
    marginLeft: 20,
    marginVertical: 5,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    color: '#6E6E6E',
    fontSize: AppFontSize.intersize17,
  },
  subTitleTodo: {marginTop: 10},
  emptyContainer: {
    marginTop: ScreenHeight / 2 - 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  emptyText: {
    fontSize: AppFontSize.intersize16,
    color: 'black',
    fontFamily: AppFonts.interRegular,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // This ensures the image is horizontally centered
    alignItems: 'center', // This vertically centers both items
    height: verticalScale(50), // Set a height for the header if necessary
    position: 'relative',
  },
  backIconWrapper: {
    width: getModerateScaleSize(30),
    height: getModerateScaleSize(30),
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  imageContainer: {
    height: getModerateScaleSize(30),
    width: getModerateScaleSize(100),
  },
  backIcon: {
    width: getModerateScaleSize(20),
    height: getModerateScaleSize(20),
    objectFit: 'contain',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  bottomFlagSec: {flexDirection: 'row', alignItems: 'center', gap: 10},
  flagIcon: {
    width: getModerateScaleSize(12),
    height: getModerateScaleSize(12),
  },
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
    marginRight: 10,
  },
  itemBtn: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
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
    marginTop: 10,
    color: '#fff',
    fontSize: AppFontSize.intersize18,
  },
});
