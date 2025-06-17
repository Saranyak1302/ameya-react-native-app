import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {zip, unzip} from 'react-native-zip-archive';
import {Platform, PermissionsAndroid, Alert, Share} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

export const MovementTypes = [
  {id: 0, name: 'None', side: 0},
  {id: 1, name: 'Sit To Stand', side: 2},
  {id: 2, name: 'Active Shoulder Flexion', side: 0},
  {id: 3, name: 'Single Leg Balance', side: 2},
  {id: 4, name: 'Two Minute Step', side: 2},
  {id: 5, name: 'Gait Speed', side: 0},
  {id: 6, name: 'Side-by-Side Stand', side: 0},
  {id: 7, name: 'Semi-Tandem Stand', side: 0},
  {id: 8, name: 'Tandem Stand', side: 0},
  {id: 9, name: 'Timed Up and Go', side: 0},
  {id: 10, name: 'SPPB - Chair Stand', side: 2},
  {id: 11, name: 'Posture All 2D', side: 0},
  {id: 12, name: 'Posture Front 2D', side: 0},
  {id: 13, name: 'Posture Side 2D', side: 0},
  {id: 14, name: 'Sit To Stand 2D', side: 2},
  {id: 15, name: 'SPPB - Chair Stand 2D', side: 2},
  {id: 16, name: 'Two Minute Step 2D', side: 2},
  {id: 17, name: 'Single Leg Balance 2D', side: 0},
];
// Function to get name by ID
export const getNameById = (id: number) => {
  const movement = MovementTypes.find(item => item.id === id);
  return movement ? movement.name : 'Not Found';
};
export const movementJsonData = [
  {
    MovementType: 'None',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.0,
    Maximum: 0.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 30,
    UseInitialTimer: false,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
  },
  {
    MovementType: 'SitToStand',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.1,
    Maximum: 0.2,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 30,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
  },
  {
    MovementType: 'ActiveShoulderFlexion',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 70.0,
    Maximum: 90.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 30,
    UseInitialTimer: false,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
  },
  {
    MovementType: 'OneLegStance',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.15,
    Maximum: 0.2,
    StoppingConditionsDisabledAtStart: 5,
    VideoDuration: 45,
    UseInitialTimer: false,
    UseEnhancedDepth: false,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
  },
  {
    MovementType: 'TwoMinuteStep',
    SmoothingType: 'Dynamic',
    MovementSide: 'Right',
    Smoothing: 0.3,
    Minimum: 35.0,
    Maximum: 65.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 120,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
  },
  {
    MovementType: 'GaitSpeed',
    SmoothingType: 'Legacy',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.0,
    Maximum: 0.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 30,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: true,
  },
  {
    MovementType: 'SPPBSideBySide',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.0,
    Maximum: 0.0,
    StoppingConditionsDisabledAtStart: 2,
    VideoDuration: 10,
    UseInitialTimer: false,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
  },
  {
    MovementType: 'SPPBSemiTandem',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.0,
    Maximum: 0.0,
    StoppingConditionsDisabledAtStart: 2,
    VideoDuration: 10,
    UseInitialTimer: false,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
  },
  {
    MovementType: 'SPPBTandem',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.0,
    Maximum: 0.0,
    StoppingConditionsDisabledAtStart: 2,
    VideoDuration: 10,
    UseInitialTimer: false,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
  },
  {
    MovementType: 'TimedUpAndGo',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.0,
    Maximum: 0.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 45,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
  },
  {
    MovementType: 'SPPBChairStand',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.1,
    Maximum: 0.2,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 60,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
  },
  {
    MovementType: 'PostureAll2D',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.0,
    Maximum: 0.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 2,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
    UseVoiceCommands: true,
  },
  {
    MovementType: 'PostureFront2D',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.0,
    Maximum: 0.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 2,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
    UseVoiceCommands: true,
  },
  {
    MovementType: 'PostureSide2D',
    SmoothingType: 'Dynamic',
    MovementSide: 'Right',
    Smoothing: 0.3,
    Minimum: 0.0,
    Maximum: 0.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 2,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
    UseVoiceCommands: true,
  },
  {
    MovementType: 'SitToStand2D',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 40.0,
    Maximum: 100.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 30,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
    UseVoiceCommands: true,
  },
  {
    MovementType: 'SPPBChairStand2D',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 40.0,
    Maximum: 100.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 60,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
    UseVoiceCommands: true,
  },
  {
    MovementType: 'TwoMinuteStep2D',
    SmoothingType: 'Dynamic',
    MovementSide: 'Right',
    Smoothing: 0.3,
    Minimum: 35.0,
    Maximum: 65.0,
    StoppingConditionsDisabledAtStart: 0,
    VideoDuration: 120,
    UseInitialTimer: true,
    UseEnhancedDepth: true,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
    UseVoiceCommands: true,
  },
  {
    MovementType: 'OneLegStance2D',
    SmoothingType: 'Dynamic',
    MovementSide: 'None',
    Smoothing: 0.3,
    Minimum: 0.15,
    Maximum: 0.2,
    StoppingConditionsDisabledAtStart: 5,
    VideoDuration: 30,
    UseInitialTimer: true,
    UseEnhancedDepth: false,
    IsCheckPostureFailCondition: false,
    UseShouldersGait: false,
    UseVoiceCommands: true,
  },
];

export const MovementTypes3D = MovementTypes.filter(
  movement => !movement.name.includes('2D'),
);
export const MovementTypes2D = MovementTypes.filter(movement =>
  movement.name.includes('2D'),
);
export const getMovementId = async (name: string, isDoctor: boolean) => {
  let id = 0;
  if (name.includes('Sit to Stand')) {
    id = isDoctor && name.includes('3D') ? 1 : 14;
  } else if (name.includes('Shoulder Flexion RoM')) {
    id = 2;
  } else if (name.includes('Single Leg Balance')) {
    id = isDoctor && name.includes('3D') ? 3 : 17;
  } else if (name.includes('Two Minute Step')) {
    id = isDoctor && name.includes('3D') ? 4 : 16;
  } else if (name.includes('Three Meter Gait')) {
    id = 5;
  } else if (name.includes('Side-by-Side Stance')) {
    id = 6;
  } else if (name.includes('Semi-Tandem Stance')) {
    id = 7;
  } else if (name.includes('Tandem Stance')) {
    id = 8;
  } else if (name.includes('Timed Up and Go')) {
    id = 9;
  } else if (name.includes('5 Chair Stand')) {
    id = isDoctor && name.includes('3D') ? 10 : 15;
  } else if (name.includes('Posture Front')) {
    id = 12;
  } else if (name.includes('Posture Side')) {
    id = 13;
  }
  return id;
};

export const findSide = async (name: string) => {
  let side = 0;
  if (name.includes('Left')) {
    side = 1;
  } else if (
    name.includes('Right') ||
    name.includes('Two Minute Step') ||
    name.includes('Posture Side')
  ) {
    side = 2;
  } else {
    side = 0;
  }
  return side;
};
export function formatDateToYYYYMMDD(dateString: string) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}
// export const convertJsonToCsv = jsonData => {
//   const array = Array.isArray(jsonData) ? jsonData : [jsonData];
//   const keys = Object.keys(array[0]);
//   const csv = [
//     keys.join(','), // Header row
//     ...array.map(obj => keys.map(key => obj[key]).join(',')), // Data rows
//   ].join('\n');
//   return csv;
// };
export const saveDatainAsync = async (doctorArray: any, isDoctor: boolean) => {
  try {
    const doctorData = JSON.stringify(doctorArray);
    await AsyncStorage.setItem(isDoctor ? 'doctor' : 'patient', doctorData);
  } catch (error) {}
};
export const isCheckDoctorOrPaatientStorageEmpty = async (
  isDoctor: boolean,
) => {
  try {
    const doctorData = await AsyncStorage.getItem(
      isDoctor ? 'doctor' : 'patient',
    );
    const doctors = doctorData ? JSON.parse(doctorData) : [];

    // Check if the storage is empty
    if (doctors.length === 0) {
      return true; // Return true if empty
    } else {
      return false; // Return false if not empty
    }
  } catch (error) {
    return true; // Assume empty in case of an error
  }
};
export const getDoctorOrPatintById = async (
  doctorid: string,
  isDoctor: boolean,
) => {
  try {
    const doctorData = await AsyncStorage.getItem(
      isDoctor ? 'doctor' : 'patient',
    );
    if (doctorData) {
      const parsedData = JSON.parse(doctorData);
      const doctor = parsedData.find(doc => doc.doctorid === doctorid);
      if (doctor) {
        return doctor;
      }
    }

    return null; // Explicitly return null when no data is found
  } catch (error) {
    return null; // Return null in case of an error
  }
};
export const addOrUpdateDoctorPatintData = async (
  doctorid: string,
  newData: any,
  isDoctor: boolean,
) => {
  try {
    const doctorData = await AsyncStorage.getItem(
      isDoctor ? 'doctor' : 'patient',
    );
    let doctors = doctorData ? JSON.parse(doctorData) : [];

    // Find the doctor with the given doctorid
    const doctorIndex = doctors.findIndex(doc => doc.doctorid === doctorid);

    if (doctorIndex !== -1) {
      // Add to the data array of the specific doctor
      doctors[doctorIndex].data.push(newData);
    } else {
      // If doctorid doesn't exist, add a new doctor entry
      doctors.push({doctorid, data: [newData]});
    }

    // Save updated data back to AsyncStorage
    await AsyncStorage.setItem(
      isDoctor ? 'doctor' : 'patient',
      JSON.stringify(doctors),
    );
  } catch (error) {}
};
export const deleteDoctorPatientDataInAsync = async (
  doctorid: string,
  videoId: string,
  isDoctor: boolean,
) => {
  try {
    const doctorData = await AsyncStorage.getItem(
      isDoctor ? 'doctor' : 'patient',
    );
    let doctors = doctorData ? JSON.parse(doctorData) : [];

    // Find the doctor with the given doctorid
    const doctorIndex = doctors.findIndex(doc => doc.doctorid === doctorid);

    if (doctorIndex !== -1) {
      // Find the video entry within the data array by videoId
      const videoIndex = doctors[doctorIndex].data.findIndex(
        video => video.videoId === videoId,
      );

      if (videoIndex !== -1) {
        // Remove the video entry at the specified index
        doctors[doctorIndex].data.splice(videoIndex, 1);

        // If the doctor's data array is empty, you can optionally remove the doctor entry
        if (doctors[doctorIndex].data.length === 0) {
          doctors.splice(doctorIndex, 1);
        }

        // Save updated data back to AsyncStorage
        await AsyncStorage.setItem(
          isDoctor ? 'doctor' : 'patient',
          JSON.stringify(doctors),
        );
      } else {
      }
    } else {
    }
  } catch (error) {}
};
export function isIdInAsyncStorage(dataArray: any, idToCheck: string) {
  return dataArray.some(
    (item: {movementDetails: {id: string}}) =>
      item.movementDetails?.id === idToCheck,
  );
}
export function isIdInAsyncDoctorStorage(
  dataArray: any[],
  movementIdToCheck: string,
  orderIdToCheck: string,
) {
  return dataArray.some(
    (item: {movementDetails: {id: string}; orderDetails: {id: string}}) =>
      item.movementDetails?.id === movementIdToCheck &&
      item.orderDetails?.id === orderIdToCheck,
  );
}

export function getDataByMovementId(dataArray: any, idToFind: string) {
  return (
    dataArray.find(
      (item: {movementDetails: {id: string}}) =>
        item.movementDetails?.id === idToFind,
    ) || null
  );
}
export function getDataByMovementAssessmentId(
  dataArray: any[],
  idToFind: string,
  name: string,
) {
  return (
    dataArray.find(
      (item: {movementDetails?: {assessmentId: string; name: string}}) =>
        item.movementDetails?.assessmentId === idToFind &&
        item.movementDetails?.name === name,
    ) || null
  );
}

export const createZipFile = async directoryPath => {
  try {
    // Check if the directory exists
    const directoryExists = await RNFS.exists(directoryPath);
    console.log('directory path exits', directoryExists);
    if (!directoryExists) {
      return null;
    }

    // Define ZIP file output path
    const documentsDir =
      Platform.OS === 'android'
        ? RNFS.ExternalDirectoryPath
        : RNFS.DocumentDirectoryPath;
    // Define the directory for storing the ZIP file
    const zipOutputPath = `${documentsDir}/video.zip`;

    // Check if ZIP file already exists
    const zipExists = await RNFS.exists(zipOutputPath);
    if (zipExists) {
      console.log('ZIP file already exists at:', zipOutputPath);
      return zipOutputPath; // Return existing ZIP file path
    }

    console.log('ZIP file does not exist, creating a new one.');

    // Create the ZIP file
    console.log('Zip file creation started.');
    const zipResult = await zip(directoryPath, zipOutputPath);
    console.log('Zip file created at:', zipResult);

    // Return the path of the ZIP file
    return zipResult;
  } catch (error) {
    console.log('zip creating erroe', error);
    return null;
  }
};

export const downloadZipFile = async (url: string, fileName: string) => {
  try {
    // Define the download path
    const downloadPath =
      Platform.OS === 'ios'
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.ExternalDirectoryPath}/${fileName}`;
    // const downloadPath =  `${RNFS.DocumentDirectoryPath}/${fileName}`;

    // Start downloading
    const downloadResult = await RNFS.downloadFile({
      fromUrl: url,
      toFile: downloadPath,
    }).promise;

    if (downloadResult.statusCode === 200) {
      return downloadPath;
    } else {
      throw new Error(
        `Download failed with status code ${downloadResult.statusCode}`,
      );
    }
  } catch (error) {}
};
export const unzipFile = async (
  zipFilePath: string,
  destinationPath: string,
) => {
  try {
    const extractedPath = await unzip(zipFilePath, destinationPath);

    return extractedPath;
  } catch (error) {}
};
export const csvFileFormattedDate = new Date()
  .toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  .replace(',', '')
  .replace(/:/g, '_'); // Replace colons with underscores

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/ /g, '_') // Replace spaces with underscores
    .replace(/:/g, '-') // Replace colons with dashes
    .replace(/@/g, '') // Remove @ symbols
    .replace(/[^a-zA-Z0-9._-]/g, ''); // Remove any unsupported characters
};

export const getFileName = async (
  isCSv: boolean,
  movementName: string,
  movementId: number,
) => {
  let fileName = '';
  if (isCSv) {
    if (Platform.OS === 'android') {
      fileName = sanitizeFileName(
        `${movementName} 2D ${csvFileFormattedDate}.csv`,
      );
    } else {
      fileName =
        movementId > 10
          ? `${movementName} 2D ${csvFileFormattedDate}.csv`
          : `${movementName} ${csvFileFormattedDate}.csv`;
    }
  } else {
    if (Platform.OS === 'android') {
      fileName = sanitizeFileName(
        `${movementName} 2D ${csvFileFormattedDate}.zip`,
      );
    } else {
      fileName =
        movementId > 10
          ? `${movementName} 2D ${csvFileFormattedDate}.zip`
          : `${movementName} ${csvFileFormattedDate}.zip`;
    }
  }
  return fileName;
};
export const requestAndroidPermissionsMocap = async () => {
  if (Platform.OS === 'android') {
    try {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      return (
        result['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  } else {
    return true; // iOS doesn't need explicit permissions for these
  }
};

export const checkIsIpad = () => {
  return DeviceInfo.isTablet();
};
export const renameAndShareFile = async (
  oldFilePath: string,
  newFileName: string,
) => {
  try {
    const newFilePath = `${RNFS.DocumentDirectoryPath}/${newFileName}`;
    const alreadyExists = await RNFS.exists(newFilePath);
    // Copy (copy) the file
    if (alreadyExists) {
      console.log('File already exists, deleting the old file.');
      await RNFS.unlink(newFilePath);
    }
    await RNFS.copyFile(oldFilePath, newFilePath);

    // Ensure the new file exists before sharing
    const fileExists = await RNFS.exists(newFilePath);
    if (!fileExists) {
      console.error('File renaming failed, new file not found.');
      return;
    }
    // Share the renamed file
    await Share.share({
      title: 'CSV File',
      message: 'Here is the CSV file',
      url: `file://${newFilePath}`, // Ensure "file://" prefix
    });

    console.log('File shared successfully:', newFilePath);
  } catch (error) {
    console.error('Error renaming or sharing file:', error);
  }
};
