import React, {useState, useCallback, useEffect, useContext} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import {HcpOrgInfo} from '../../models/HcpOrgModel';
import {navigateBack} from '../../navigators/utils/Utils';
import {AppColors} from '../../theme/AppColors';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../../theme/AppFonts';
import {screenDimensions} from '../../utils/ScreenDimensions';
import {
  getDoctorOrPatintById,
  checkIsIpad,
} from '../movements/mocap/MocapConstants';
import RNFS from 'react-native-fs';
import {fileUploaderApi, updateMovement} from '../../services/movementService';
import {
  formatDateToYYYYMMDD,
  createZipFile,
  deleteDoctorPatientDataInAsync,
  getFileName,
  getMovementId,
} from '../movements/mocap/MocapConstants';
import moment from 'moment';
import {AppContext} from '../../context/AppContextProvider';
import {scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

export default function UploadAllVideo() {
  const [savedData, setSavedData] = useState([]);
  const doctorDetails: HcpOrgInfo = useSelector(
    (state: any) => state.hcpOrg.data,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Uploading');
  const isIpad = checkIsIpad();
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

  useEffect(() => {
    getasyncStorageData();
  }, []);

  const getasyncStorageData = () => {
    getDoctorOrPatintById(doctorDetails.ameyaId, true).then(
      doctorStorageData => {
        if (doctorStorageData != null) {
          setSavedData(doctorStorageData.data);
        } else {
          setSavedData([]);
          navigateBack();
        }
      },
    );
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
  const handleGetVideoPath = async (itemData: any, isBulkUpload: boolean) => {
    try {
      const path = await getVideoPath(itemData.videoId);
      handleZipAndUpload(path, itemData, isBulkUpload);
    } catch (error) {
      setIsLoading(false);
    }
  };
  const handleZipAndUpload = async (
    videoPath: string,
    itemData: any,
    isBulkUpload: boolean,
  ) => {
    try {
      const cleanedPath = videoPath.replace(`${itemData.videoId}/.`, '');

      const zipFilePath = await createZipFile(cleanedPath); // Ensure this returns base64 data
      if (!zipFilePath) {
        return;
      }
      const movementId = await getMovementId(
        itemData.movementDetails.name,
        true,
      );
      const fileName = await getFileName(
        false,
        itemData.movementDetails.name,
        movementId,
      );
      // const fileName = `${itemData.movementDetails.name} ${csvFileFormattedDate}.zip`;
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
      // deletePath(videoPath);
      const exists = await RNFS.exists(zipFilePath);
      console.log('video upload called');
      const response = await fileUploaderApi(formData);

      if (response.data.key) {
        const csvFilePath = itemData.csvPath; //await getCSVfilePath(itemData.videoId); // Ensure this returns a Promise
        console.log('video upload completed and csv started', itemData.videoId);
        // setLoadingText('CSV is Uploading...');
        uploadJsonAsCsv(
          csvFilePath,
          zipFilePath,
          videoPath,
          itemData,
          directory,
          response.data.key,
          isBulkUpload,
          movementId,
        );
      }
    } catch (error) {
      setIsLoading(false);
      clearAlert();
      setTitle(
        'Bulk upload has failed due to an unexpected issue. Please check your files and try again.',
      );
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
    isBulkUpload: boolean,
    movementId: number,
  ) => {
    console.log('csv called', csvFilePath);

    try {
      const csvExits = await RNFS.exists(csvFilePath);
      const fileName = await getFileName(
        true,
        itemData.movementDetails.name,
        movementId,
      );
      // const fileName = `${itemData.movementDetails.name} ${csvFileFormattedDate}.csv`;
      const formData = new FormData();
      formData.append('file', {
        uri: csvFilePath, // File URI
        name: fileName, // File name
        type: 'text/csv', // MIME type
      });
      formData.append('directory', directory);
      if (csvExits) {
        console.log('csv upload api called');
        const response = await fileUploaderApi(formData);
        console.log('csv upload api completed', response);
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

          if (isBulkUpload) {
            deleteFiles(
              csvFilePath,
              zipFilePath,
              videofilePath,
              itemData,
              isBulkUpload,
            );
          } else {
            clearAlert();
            setTitle('Video Uploaded');
            setMessage('Your video has been successfully saved!');
            setButtons &&
              setButtons([
                {
                  text: 'Continue',
                  onPress: () =>
                    deleteFiles(
                      csvFilePath,
                      zipFilePath,
                      videofilePath,
                      itemData,
                      isBulkUpload,
                    ),
                },
              ]);
            setAlert(true);
          }
        }
      } else {
        setIsLoading(false);
        setTitle('CSV File Not Found');
        setMessage('Csv file not available you can record this movement again');
        // setButtons &&
        //   setButtons([
        //     {
        //       text: 'Continue',
        //       onPress: () =>
        //         deleteFiles(
        //           csvFilePath,
        //           zipFilePath,
        //           videofilePath,
        //           itemData,
        //           isBulkUpload,
        //         ),
        //       // console.log('csv file not found'),
        //     },
        //   ]);
        setAlert(true);
      }
    } catch (error) {
      console.log('csv upload api called', error);
      setIsLoading(false);
    }
  };
  const deleteFiles = async (
    csvJsonFilePath: string,
    zipFilePath: string,
    videofilePath: string,
    itemData: any,
    isBulkUpload: boolean,
  ) => {
    try {
      // // Delete the CSV file
      // await RNFS.unlink(csvJsonFilePath);

      // Delete the ZIP file
      await RNFS.unlink(zipFilePath);

      // Delete the video file
      await RNFS.unlink(videofilePath);

      await deleteDoctorPatientDataInAsync(
        doctorDetails.ameyaId,
        itemData.videoId,
        true,
      );

      if (!isBulkUpload) {
        setIsLoading(false);
        getasyncStorageData();
      } else {
        await getDoctorOrPatintById(doctorDetails.ameyaId, true).then(
          doctorStorageData => {
            if (
              doctorStorageData &&
              doctorStorageData.data &&
              doctorStorageData.data.length > 0
            ) {
              setIsLoading(true);
              setLoadingText(
                doctorStorageData.data[0].movementDetails.name +
                  '(' +
                  doctorStorageData.data[0].orderDetails.ameyaId +
                  ')' +
                  ' is uploading...',
              );
              handleGetVideoPath(doctorStorageData.data[0], true);
            } else {
              setIsLoading(false);
              setSavedData([]);
              // getasyncStorageData();
              clearAlert();
              setTitle('Video Uploaded');
              setMessage(
                'Your video has been successfully saved! You’ll now return to the movement screen.',
              );
              setButtons &&
                setButtons([
                  {
                    text: 'Continue',
                    onPress: () => {
                      navigateBack();
                    },
                  },
                ]);
              setAlert(true);
            }
          },
        );
      }
    } catch (error) {
      // Show error alert if any file deletion fails
    }
  };

  const renderItem = ({item, index}) => (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text
          maxFontSizeMultiplier={1.3}
          style={[
            styles.nameText,
            {
              fontSize: isIpad
                ? AppFontSize.intersize16
                : AppFontSize.intersize17,
            },
          ]}>
          {item.orderDetails.firstName +
            ' ' +
            item.orderDetails.lastName +
            '(' +
            item.orderDetails.ameyaId +
            ')'}
        </Text>
        <Text
          maxFontSizeMultiplier={1.3}
          style={[
            styles.taskText,
            {
              fontSize: isIpad
                ? AppFontSize.intersize16
                : AppFontSize.intersize17,
            },
          ]}>
          {item.movementDetails.name}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setIsLoading(true);
          setLoadingText(
            item.movementDetails.name +
              '(' +
              item.orderDetails.ameyaId +
              ')' +
              ' is uploading...',
          );
          handleGetVideoPath(item, false);
        }}>
        <Text maxFontSizeMultiplier={1.3} style={styles.buttonText}>
          Upload
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={navigateBack} style={styles.backIconWrapper}>
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
      <View style={styles.scrollViewContent}>
        <View style={styles.awaitingContainer}>
          <Text maxFontSizeMultiplier={1.3} style={styles.awaitingLabel}>
            Videos awaiting upload:{' '}
            <Text maxFontSizeMultiplier={1.3} style={styles.awaitingLabel}>
              {savedData.length}
            </Text>
          </Text>
          <TouchableOpacity
            style={styles.awaitingButton}
            onPress={async () => {
              setIsLoading(true);
              setLoadingText(
                savedData[0].movementDetails.name +
                  '(' +
                  savedData[0].orderDetails.ameyaId +
                  ')' +
                  ' is uploading...',
              );
              handleGetVideoPath(savedData[0], true);
              // deleteDoctorDataInAsync(
              //   doctorDetails.ameyaId,
              //   savedData[0].videoId,
              // );
            }}>
            <Text maxFontSizeMultiplier={1.3} style={styles.awaitingButtonText}>
              Upload All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Participants List */}
        <FlatList
          data={savedData}
          renderItem={renderItem}
          keyExtractor={item => item.movementDetails.id.toString()}
          showsVerticalScrollIndicator={false}
          style={{marginTop: verticalScale(10)}}
        />
      </View>
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.lightBlue,
    flexDirection: 'column',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // This ensures the image is horizontally centered
    alignItems: 'center', // This vertically centers both items
    height: verticalScale(30), // Set a height for the header if necessary
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
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    backgroundColor: AppColors.white,
    flex: 1,
    marginTop: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  awaitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    backgroundColor: AppColors.white,
    borderRadius: 8,
    marginHorizontal: scale(15),
  },
  awaitingLabel: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
    width: screenDimensions.width / 2 + 40,
  },
  awaitingButton: {
    backgroundColor: AppColors.buttonDarkBlue,
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 8,
  },
  awaitingButtonText: {
    color: AppColors.white,
    fontSize: AppFontSize.intersize14,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.bgLightGrey,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: scale(16),
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    //fontSize: AppFontSize.intersize17,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textFieldTextBlack,
    fontFamily: AppFonts.interMedium,
    marginBottom: 6,
  },
  taskText: {
    // fontSize: AppFontSize.intersize17,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interSemibold,
  },
  button: {
    backgroundColor: AppColors.buttonDarkBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: AppFontSize.intersize14,
    fontWeight: AppWeights.interMedium,
    color: AppColors.white,
    fontFamily: AppFonts.interMedium,
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
