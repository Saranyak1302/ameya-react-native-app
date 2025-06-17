// authService.ts (you can create this file for auth-specific APIs)
import apiService from './api/AppServices.ts';
import {EndPoints} from './api/EndPoints.tsx';

// Email auth Function
export const doAuthenticate = async (email: string) => {
  try {
    const response = await apiService.post(
      EndPoints.authGenerate,
      {email},
      true,
    );
    return response.data; // Adjust the return based on your API response structure
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

// Verification code Validation Function
export const validateOtp = async (email: string, code: string) => {
  try {
    const response = await apiService.post(
      EndPoints.validateOtp,
      {email, code},
      true,
    );

    return response.data; // Adjust the return based on your API response structure
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const pushNotification = async (data: any) => {
  try {
    const url = EndPoints.pushNotificationFcm;
    const response = await apiService.post(url, data, false);
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.message?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};
export const logoutApi = async (ameyaId: string) => {
  try {
    const url = `${EndPoints.logout}${ameyaId}`;
    const response = await apiService.post(
      url,
      {},
      true,
    );
    return response.data; // Adjust the return based on your API response structure
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};