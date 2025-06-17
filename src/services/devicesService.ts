import {jwtDecode} from 'jwt-decode';
import {StorageKeys} from '../utils/StorageKeys.ts';
import apiService from './api/AppServices.ts';
import {EndPoints} from './api/EndPoints.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get profile details by ID
export const getHealthKitStatus = async () => {
  try {
    const token = await AsyncStorage.getItem(StorageKeys.token);
    if (!token) return;
    const decodedToken = jwtDecode(token);
    const userId = decodedToken?.sub;
    const response = await apiService.get(
      `${EndPoints.healthKitStatus}/${userId}`,
      {},
      false,
    );
    return response.data; // return the response data
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

interface HealthKitPostData {
  id?: string;
  [key: string]: any;
}

export const updateHealthKitSyncMode = async (postData: HealthKitPostData) => {
  try {
    const token = await AsyncStorage.getItem(StorageKeys.token);
    if (!token) throw new Error('No token found');
    const decodedToken = jwtDecode(token);
    const userId = decodedToken?.sub;
    const healthKitStatus = await getHealthKitStatus();
    postData.id = healthKitStatus[0]?.id;
    const response = await apiService.patch(
      EndPoints.healthKitSyncMode,
      postData,
    );
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};
export const connectHealthKit = async (postData: object) => {
  try {
    const response = await apiService.post(
      EndPoints.connectHealthKit,
      postData,
      false,
    );
    return response.data; // return the response data
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const reConnectHealthKit = async (postData: object) => {
  try {
    const response = await apiService.post(
      EndPoints.reConnectHealthKit,
      postData,
      false,
    );
    return response.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status
    return error.response.data
  }
}


export const connectGarminFitbit = async (postData: object, type: string) => {
  let baseUrl =
    type === 'Fitbit' ? EndPoints.connectFitbit : EndPoints.connectGarmin;
  try {
    const response = await apiService.post(baseUrl, postData, false);
    return {data: response.data, statusCode: 200}; // return the response data
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status
    // Throw a structured error
    return error.response.data
    //throw {message: errorMessage, code: errorCode};
  }
};
export const disConnectGarminFitbit = async (postId: string, type: string) => {
  let baseUrl =
    type === 'Fitbit'
      ? `${EndPoints.disConnectFitbit}/${postId}`
      : `${EndPoints.disConnectGarmin}/${postId}`;
  try {
    const response = await apiService.delete(
      baseUrl,
      {},
      false,
    );
    return response; // return the response data
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status
    return error.response.data
    // Throw a structured error
    //throw {message: errorMessage, code: errorCode};
  }
};

export const disConnectHealthKit = async (thirdPartyId: string, serviceName: string, typeOfDeactivation: string, healthKitErrorReason?: string) => {
  try {
    const response = await apiService.post(
      EndPoints.disConnectHealthKit,
      {
        id: thirdPartyId,
        serviceName: serviceName.toUpperCase(),
        typeOfDeactivation: typeOfDeactivation,
        reason: healthKitErrorReason? healthKitErrorReason : ''
      },
      false,
    );
    console.log('response---', response);
    return response; // return the response data
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status
    return error.response.data
    // Throw a structured error
    //throw {message: errorMessage, code: errorCode};
  }
} 