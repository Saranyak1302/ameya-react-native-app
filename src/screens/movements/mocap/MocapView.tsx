import UnityView from '@azesmway/react-native-unity';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  SafeAreaView,
  Linking,
  Share,
} from 'react-native';
import {
  navigateBack,
  navigateBackMulripleScreen,
  navigateBackTwoScreens,
} from '../../../navigators/utils/Utils';
import {Alert} from 'react-native';
// import RNFS from 'react-native-fs';
import * as RNFS from 'react-native-fs';
import {
  fileUploaderApi,
  updateMovement,
  videoUploadApi,
} from '../../../services/movementService';
import {useSelector} from 'react-redux';
import {ProfileData} from '../../../models/ProfileModel';
import {
  formatDateToYYYYMMDD,
  isCheckDoctorOrPaatientStorageEmpty,
  getDoctorOrPatintById,
  saveDatainAsync,
  addOrUpdateDoctorPatintData,
  createZipFile,
  deleteDoctorPatientDataInAsync,
  getFileName,
  renameAndShareFile,
} from './MocapConstants';
import DeviceInfo from 'react-native-device-info';
import {
  setUploadTrue,
  // setUploadFalse,
} from '../../../store/slices/patientUploadSlice';
import {
  setTryAgainFalse,
  setTryAgainTrue,
} from '../../../store/slices/tryAgianSlice';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {AppContext} from '../../../context/AppContextProvider';
import {screenDimensions} from '../../../utils/ScreenDimensions';
import {AppColors} from '../../../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../../../theme/AppFonts';
import {CircularProgress} from '../../../components/CirclurProgress';
import AlertModalMultiple from '../../../components/AlertModalMutiple';
import {
  activateKeepAwake,
  deactivateKeepAwake,
} from '@sayem314/react-native-keep-awake';

interface IMessage {
  gameObject: string;
  methodName: string;
  message: string;
}

const MocapView = ({route, navigation}) => {
  const unityRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading,please wait...');
  const {width, height} = Dimensions.get('window');
  const isTablet = DeviceInfo.isTablet();
  const dispatch = useDispatch();

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

  const {messageToUnity, isDoctor, isFromSkip, movementName, movementId} =
    route.params;

  const message: IMessage = {
    gameObject: 'UnityBridge',
    methodName: 'Record',
    message: messageToUnity,
  };
  const profileData: ProfileData = useSelector(
    (state: any) => state?.profile?.data,
  );
  const movementDetails = useSelector((state: any) =>
    isDoctor ? state.doctormovement.movement : state.movement.movement,
  );
  const orderDetails = useSelector((state: any) =>
    isDoctor
      ? state.doctorOrder.orderResponse
      : state.order.orderResponse.order,
  );
  const doctorDetails = useSelector((state: any) =>
    isDoctor ? state.hcpOrg.data : null,
  );
  let videoCompletedVideoId = '';
  const [videoDetailsId, setVideoDetailsId] = useState('');
  const [csvPath, setCsvPath] = useState('');
  const [csvRequest, setCsvRequest] = useState(false);
  const [progress, setProgress] = useState(1);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showBackPopup, setShowBackPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  // const [movementName, setMovementName] = useState('');
  const [showRemindersPopup, setShowRemindersPopup] = useState(false);

  useEffect(() => {
    // setIsLoading(false);
    activateKeepAwake();
    setTimeout(() => {
      if (unityRef && unityRef.current && messageToUnity) {
        console.log(
          'unityRef.current.postMessage ===> ',
          message.gameObject,
          '>',
          message.methodName,
          '>',
          message.message,
        );
        // @ts-ignore
        unityRef.current.postMessage(
          message.gameObject,
          message.methodName,
          message.message,
        );
        // setIsLoading(true);
      }
    }, 1000);
    setTimeout(() => {
      if (Platform.OS === 'ios') {
        checkCameraPermission();
      }
    }, 2000);
    return () => {
      console.log('Unity useEffect cleanup');
      deactivateKeepAwake();
    };
  }, []);
  const checkCameraPermission = async () => {
    const permission = PERMISSIONS.IOS.CAMERA;

    const result = await check(permission);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        break;
      case RESULTS.DENIED:
        break;
      case RESULTS.BLOCKED:
        showPermissionAlert(true);
        break;

      case RESULTS.GRANTED:
        // Proceed with camera functionality
        if (movementId > 10) {
          checkMicroPhonePermission();
        }
        break;

      default:
    }
  };
  const checkMicroPhonePermission = async () => {
    const permission = PERMISSIONS.IOS.MICROPHONE;

    const result = await check(permission);
    switch (result) {
      case RESULTS.UNAVAILABLE:
        break;
      case RESULTS.DENIED:
        break;
      case RESULTS.BLOCKED:
        showPermissionAlert(false);
        break;

      case RESULTS.GRANTED:
        // Proceed with camera functionality
        break;

      default:
    }
  };

  const showPermissionAlert = (isCamera: Boolean) => {
    clearAlert();
    setTitle('Permission Required');
    setMessage(
      isCamera
        ? 'Allow camera access to continue. Please enable it in Settings to capture photos and videos.'
        : 'Microphone permission was not granted. Please enable it in app settings to continue.',
    );
    setButtons &&
      setButtons([
        {
          text: 'Cancel',
        },
        {
          text: 'Open Settings',
          onPress: openAppSettings,
        },
      ]);
    setAlert(true);
  };

  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      clearAlert();
      setTitle('Error');
      setMessage('Unable to open app settings.');
      setAlert(true);
    });
  };

  const uploadCsv = async (
    csvFilePath: string,
    zipFilePath: string,
    videofilePath: string,
    videoId: string,
    directory: string,
    videokey: string,
  ) => {
    try {
      console.log('csv upload called');
      const formData = new FormData();
      const fileName = await getFileName(true, movementName, movementId); //movementId > 10 ? `${movementName} 2D ${csvFileFormattedDate}.csv`:`${movementName} ${csvFileFormattedDate}.csv`;
      console.log('file Name is', fileName);
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${csvFilePath}` : csvFilePath, // File URI
        name: fileName, // File name
        type: 'text/csv', // MIME type
      });
      formData.append('directory', directory);
      const response = await fileUploaderApi(formData);
      if (response.data.key) {
        const data = {
          orderId: orderDetails.id.toString(),
          metadataId: movementDetails.metadataId.toString(),
          assessmentId: movementDetails.assessmentId.toString(),
          movementId: movementDetails.id.toString(),
          videoKey: videokey.toString(),
          csvKey: response.data.key.toString(),
          completedDate: moment().format('YYYY-MM-DD'),
        };

        const updateResponse = await updateMovement(data);
        setIsLoading(false);

        clearAlert();
        deleteFiles(csvFilePath, zipFilePath, videofilePath);
      }
    } catch (error) {
      setIsLoading(false);
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
  const handleGetVideoPath = async (uniqueID: string) => {
    try {
      const path = await getVideoPath(uniqueID);
      handleZipAndUpload(path, uniqueID);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const deleteFiles = async (
    csvJsonFilePath: string,
    zipFilePath: string,
    videofilePath: string,
  ) => {
    try {
      // Delete the CSV file
      await RNFS.unlink(csvJsonFilePath);

      // Delete the ZIP file
      await RNFS.unlink(zipFilePath);

      // Delete the video file
      await RNFS.unlink(videofilePath);

      await deleteDoctorPatientDataInAsync(
        isDoctor ? doctorDetails.ameyaId : profileData.ameyaId,
        videoDetailsId,
        isDoctor,
      );

      // Show success alert after deleting all files
      dispatch(setUploadTrue());
      dispatch(setTryAgainFalse());
      navigateBackHandled();
    } catch (error) {
      // Show error alert if any file deletion fails
    }
  };
  const deleteCsvAndLBZFiles = async (
    csvJsonFilePath: string,
    videofilePath: string,
  ) => {
    console.log('delete called 1', videofilePath);
    try {
      // Delete the CSV file
      await RNFS.unlink(csvJsonFilePath);

      // Delete the video file
      await RNFS.unlink(videofilePath);

      await deleteDoctorPatientDataInAsync(
        isDoctor ? doctorDetails.ameyaId : profileData.ameyaId,
        videoCompletedVideoId,
        isDoctor,
      );

      // Show success alert after deleting all files
      navigateBackHandled();
    } catch (error) {
      navigateBackHandled();
      // Show error alert if any file deletion fails
    }
  };
  const handleZipAndUpload = async (videoPath: string, videoId: string) => {
    try {
      console.log('video path ', videoPath);
      const cleanedPath = videoPath.replace(`${videoId}/.`, '');
      console.log('cleanedPath  ', cleanedPath);
      const zipFilePath = await createZipFile(cleanedPath); // Ensure this returns base64 data
      if (!zipFilePath) {
        return;
      }
      console.log('zip file path ', zipFilePath);

      const zipFilePathStat = await RNFS.stat(zipFilePath);
      const zipFilePathSize = zipFilePathStat.size; // Size in bytes
      console.log('zip file path size', zipFilePathSize);

      const exists = await RNFS.exists(zipFilePath);
      console.log('File exists:', exists);

      const fileName = await getFileName(false, movementName, movementId); //movementId > 10 ? `${movementName} 2D ${csvFileFormattedDate}.zip`:`${movementName} ${csvFileFormattedDate}.zip`;
      console.log('file Name is', fileName);

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${zipFilePath}` : zipFilePath, // Ensure URI starts with `file://`
        name: fileName, // Change to your desired file name
        type: 'application/zip', // MIME type for ZIP files
      });
      const directory = `movement/${profileData.ameyaId}/${formatDateToYYYYMMDD(
        orderDetails.startDate,
      )}_${formatDateToYYYYMMDD(orderDetails.endDate)}/${
        movementDetails.name
      }/${formatDateToYYYYMMDD(
        movementDetails.startDate,
      )}_${formatDateToYYYYMMDD(movementDetails.endDate)}`;
      formData.append('directory', directory);
      const response = await videoUploadApi(formData, setProgress);

      console.log('video uploaded', response.data);
      if (response.data.key) {
        setProgress(1);
        setLoadingText('Exporting and uploading CSV file...');
        console.log('upload video completed and csv starting');
        uploadCsv(
          csvPath,
          zipFilePath,
          videoPath,
          videoId,
          directory,
          response.data.key,
        );
      }
    } catch (error) {
      setIsLoading(false);
      clearAlert();
      navigateBackHandled();
    }
  };
  const navigateBackHandled = () => {
    console.log('navigateBAck called');
    if (isDoctor) {
      navigateBack();
    } else {
      if (isFromSkip) {
        navigateBack();
      } else {
        navigateBackMulripleScreen(2);
      }
    }
  };
  const saveVideoDetailsInAsyncStorage = async (videoId: string) => {
    const isEmpty = await isCheckDoctorOrPaatientStorageEmpty(isDoctor);
    if (isEmpty) {
      const data = [
        {
          doctorid: isDoctor ? doctorDetails.ameyaId : profileData.ameyaId,
          data: [
            {
              videoId: videoId,
              csvPath: csvPath,
              movementDetails: movementDetails,
              orderDetails: orderDetails,
            },
          ],
        },
      ];
      await saveDatainAsync(data, isDoctor);
      console.log('local added');
      if (isDoctor) {
        navigateBack();
      } else {
        setIsLoading(true);
        setLoadingText('Saving your assessment.');
        handleGetVideoPath(videoId);
      }
    } else {
      await getDoctorOrPatintById(
        isDoctor ? doctorDetails.ameyaId : profileData.ameyaId,
        isDoctor,
      ).then(async asyncData => {
        if (asyncData != null) {
          await addDatainAsync(videoId);
        } else {
          await addDatainAsync(videoId);
        }
      });
    }
  };
  const addDatainAsync = async (videoId: string) => {
    const data = {
      videoId: videoId,
      csvPath: csvPath,
      movementDetails: movementDetails,
      orderDetails: orderDetails,
    };
    await addOrUpdateDoctorPatintData(
      isDoctor ? doctorDetails.ameyaId : profileData.ameyaId,
      data,
      isDoctor,
    );
    console.log('local added');
    if (isDoctor) {
      navigateBack();
    } else {
      setIsLoading(true);
      setLoadingText('Exporting and uploading CSV file...');
      handleGetVideoPath(videoId);
    }
  };

  const callGetVideoAndCSVPathsAndDelete = async (videoId: string) => {
    const videoPath = await getVideoPath(videoId);
    // const csvJsonPath = await getCSVfilePath(videoId);
    deleteCsvAndLBZFiles(csvPath, videoPath);
  };

  const logMessage = () => {
    console.log(
      'unityRef.current.postMessage ===> ',
      message.gameObject,
      '>',
      message.methodName,
      '>',
      message.message,
    );
  };

  const handleUnityMessage = async (result: any) => {
    var json = JSON.parse(result.nativeEvent.message);
    console.log('json is', json);
    if (json && json.data) {
      var data = JSON.parse(json.data);
      console.log('data is', data);
      if (data.Back) {
        if (data.Back === 'Recording') {
          // navigateBackHandled();
          console.log('back recording');
          setShowBackPopup(true);
        } else if (data.Back === 'Playback') {
          setShowBackPopup(true);
        } else if (data.Back === 'RecordingWaiting') {
          console.log('back recordingWaiting');
          navigateBackHandled();
        } else {
        }
      } else if (data.Upload) {
        if (csvPath != '') {
          saveVideoDetailsInAsyncStorage(data.Upload);
        }
      } else if (data.CSV) {
        console.log('csv calles');
        if (csvRequest === true) {
          console.log('csv came 1');
          setCsvPath(data.CSV);
          console.log('csv path is', data.CSV);
          const zipFilePathStat = await RNFS.stat(data.CSV);
          const zipFilePathSize = zipFilePathStat.size; // Size in bytes
          console.log('csv file path size mocap', zipFilePathSize);
          setCsvRequest(false);
          if (!isDoctor) {
            setTimeout(() => {
              setShowVideoUpload(true);
            }, 500);
          }
        } else {
          console.log('csv came 2');
          console.log('import csv called for share', data.CSV);
          const fileName = await getFileName(true, movementName, movementId);
          renameAndShareFile(data.CSV, fileName);
        }
      } else if (data.VideoCompleted) {
        videoCompletedVideoId = data.VideoCompleted;
        setVideoDetailsId(data.VideoCompleted);
        let videoPath =
          Platform.OS === 'ios'
            ? RNFS.DocumentDirectoryPath + '/Videos/' + data.VideoCompleted
            : RNFS.ExternalDirectoryPath + '/Videos/' + data.VideoCompleted;
        console.log('video path is', videoPath);
        if (unityRef && unityRef.current) {
          setTimeout(() => {
            message.methodName = 'Csv';
            message.message = JSON.stringify({
              id: 6,
              data: JSON.stringify({videoPath: videoPath}),
            });
            logMessage();
            setCsvRequest(true);
            console.log('posting csv');
            // @ts-ignore
            unityRef.current.postMessage(
              message.gameObject,
              message.methodName,
              message.message,
            );
          }, 200);
        }
      }
    }
  };
  const styles = StyleSheet.create({
    loaderOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 20, // Adds some spacing at the top and bottom
    },
    centerContent: {
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      color: '#1034A6',
      fontSize: AppFontSize.intersize18,
      fontWeight: AppWeights.interSemibold,
      fontFamily: AppFonts.interSemibold,
      textAlign: 'center',
    },
    bottomText: {
      color: '#000000',
      fontSize: AppFontSize.intersize16,
      fontWeight: AppWeights.interRegular,
      fontFamily: AppFonts.interRegular,
      textAlign: 'center',
      paddingVertical: 25,
    },
    loaderView: {
      backgroundColor: AppColors.white,
      width: screenDimensions.width - 100,
      paddingVertical: 10,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <SafeAreaView style={{flex: 1}}>
      <UnityView
        // @ts-ignore
        ref={unityRef}
        style={{flex: 1}}
        onUnityMessage={handleUnityMessage}
      />
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <Text></Text>
          <View style={styles.centerContent}>
            {progress === 1 ? (
              <View style={styles.loaderView}>
                <ActivityIndicator size="large" color="#1034A6" />
                <Text maxFontSizeMultiplier={1.3} style={styles.loadingText}>
                  {loadingText}
                </Text>
                <Text maxFontSizeMultiplier={1.3} style={styles.bottomText}>
                  Please keep this screen open until the process is complete.
                  This may take up to 1 minute.
                </Text>
              </View>
            ) : (
              <View style={styles.loaderView}>
                <CircularProgress progress={progress} />
                <Text maxFontSizeMultiplier={1.3} style={styles.loadingText}>
                  {progress}%
                </Text>
                <Text maxFontSizeMultiplier={1.3} style={styles.bottomText}>
                  Please keep this screen open until the process is complete.
                  This may take up to 1 minute.
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              width: screenDimensions.width - 100,
              marginBottom: 100,
              borderRadius: 14,
            }}></View>
        </View>
      )}
      {showVideoUpload && (
        <AlertModalMultiple
          alertModalVisible={showVideoUpload}
          title={
            'Great job! You’ve completed the  ' + movementName + ' assessment!'
          }
          message={
            'Tap Save to keep your results or Try Again to repeat the assessment.'
          }
          buttons={[
            {
              text: 'Save',
              onPress: () => {
                setShowVideoUpload(false);
                setTimeout(() => {
                  setIsLoading(true);

                  saveVideoDetailsInAsyncStorage(videoDetailsId);
                }, 2000);
              },
            },
          ]}
          buttonsExtra={[
            {
              text: 'Try Again',
              onPress: () => {
                setShowVideoUpload(false);
                setShowRemindersPopup(true);
              },
            },
          ]}
          onClose={() => {
            setShowVideoUpload(false);
          }}
        />
      )}
      {showBackPopup && (
        <AlertModalMultiple
          alertModalVisible={showBackPopup}
          title={'Confirm Exit'}
          message={
            'If you exit now, your recorded data for this assessment will be lost. Are you sure you want to exit?'
          }
          buttons={[
            {
              text: 'Yes, exit now.',
              onPress: () => {
                setShowBackPopup(false);
                setShowConfirmPopup(true);
              },
            },
          ]}
          buttonsExtra={[
            {
              text: 'No, return to assessment.',
              onPress: () => {
                setShowBackPopup(false);
              },
            },
          ]}
          onClose={() => {
            setShowBackPopup(false);
          }}
        />
      )}
      {showConfirmPopup && (
        <AlertModalMultiple
          alertModalVisible={showConfirmPopup}
          title={''}
          message={
            'This will delete your current assessment. Do you want to continue?'
          }
          buttons={[
            {
              text: 'No',
              onPress: () => {
                setShowConfirmPopup(false);
              },
            },
          ]}
          buttonsExtra={[
            {
              text: 'Yes',
              onPress: () => {
                callGetVideoAndCSVPathsAndDelete(videoDetailsId);
                setShowConfirmPopup(false);
              },
            },
          ]}
          onClose={() => {
            setShowConfirmPopup(false);
          }}
        />
      )}
      {showRemindersPopup && (
        <AlertModalMultiple
          alertModalVisible={showRemindersPopup}
          title={''}
          message={
            'This will delete your current assessment. Do you want to continue?'
          }
          buttons={[
            {
              text: 'Delete & Retry',
              onPress: () => {
                setShowRemindersPopup(false);
                dispatch(setTryAgainTrue());
                navigateBack();
              },
            },
          ]}
          buttonsExtra={[
            {
              text: 'Cancel',
              onPress: () => {
                setShowRemindersPopup(false);
                setShowVideoUpload(true);
              },
            },
          ]}
          onClose={() => {
            setShowRemindersPopup(false);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default MocapView;
