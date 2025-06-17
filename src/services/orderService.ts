import {timeZone} from '../navigators/utils/Utils.tsx';
import apiService from './api/AppServices.ts';
import {EndPoints} from './api/EndPoints';

// Email auth Function
export const getOrders = async () => {
  try {
    const response = await apiService.get(
      EndPoints.orders,
      {timezone: timeZone},
      false,
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

export const getMovementInfo = async (movementId: string) => {
  try {
    const url = `${EndPoints.movementInfo}${movementId}`;
    const response = await apiService.get(url, {}, false);
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.message?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const getTodayOrders = async (id: string) => {
  try {
    const response = await apiService.get(
      `${EndPoints.todayOrders}/${id}`,
      {timezone: timeZone},
      false,
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
