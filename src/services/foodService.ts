// foodService.ts (you can create this file for food-specific APIs)
import {timeZone} from '../navigators/utils/Utils.tsx';
import apiService from './api/AppServices.ts';
import {EndPoints} from './api/EndPoints';
import {PassioFoodItem} from '@passiolife/nutritionai-react-native-sdk-v3';

// getFood  Function
export const getFoodByDate = async (
  orderId: string,
  date: String,
  metadataId: string,
  nutritionAnalysisId: string,
) => {
  try {
    const response = await apiService.get(
      `${EndPoints.orderLogByDateandId}${orderId}?date=${date}&metadataId=${metadataId}&nutritionAnalysisId=${nutritionAnalysisId}`,
      {},
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

export const updateWaterLog = async (
  id: string,
  date: string,
  metadataId: string,
  nutritionAnalysisId: string,
  action: 'add' | 'remove',
) => {
  try {
    // Construct the URL with the query parameter
    const url = `${EndPoints.updateWaterLog}${id}?date=${encodeURIComponent(
      date,
    )}&metadataId=${metadataId}&nutritionAnalysisId=${nutritionAnalysisId}&action=${action}`;

    // Make the PATCH request
    const response = await apiService.patch(url, {}, {}, false); // Pass an empty object as body if not needed

    return response.data; // Adjust the return based on your API response structure
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const deleteNutritionMeal = async (
  id: string,
  date: string,
  meal: string,
  foodId: string,
  metadataId: string,
  nutritionAnalysisId: string,
) => {
  try {
    // Construct the URL with the query parameters
    const url = `${
      EndPoints.deleteNutritionMeal
    }?id=${id}&date=${encodeURIComponent(date)}&meal=${encodeURIComponent(
      meal,
    )}&foodId=${encodeURIComponent(
      foodId,
    )}&metadataId=${metadataId}&nutritionAnalysisId=${nutritionAnalysisId}`;

    // Make the DELETE request
    const response = await apiService.delete(url, {}, false); // Pass an empty object as body if not needed

    return response.data; // Adjust the return based on your API response structure
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const getNutritionMeaList = async () => {
  try {
    const response = await apiService.get(
      EndPoints.getNutritionMeaList,
      {},
      false,
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
export const getRecentMeaList = async () => {
  try {
    const response = await apiService.get(EndPoints.recentMealList, {}, false);
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};
export const getFavouriteMealList = async (page: number, limit: number) => {
  try {
    const url = `${EndPoints.favouriteMealList}?page=${page}&limit=${limit}`;
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
export const getFoodorReceipeMealList = async (
  page: number,
  limit: number,
  type: string,
) => {
  try {
    const url = `${
      EndPoints.getFoodAndReceipeMealList
    }?page=${page}&limit=${limit}&type=${type}&search=${''}`;
    const response = await apiService.get(url, {}, false);
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const updateNutritionMealFavorite = async (
  id: string,
  isDirectLog: boolean,
) => {
  try {
    const response = await apiService.patch(
      `${EndPoints.updateNutritionFavorite}/${id}?isDirectLog=${isDirectLog}`,
      {},
      {},
      false,
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

export const removeNutritionMeal = async (id: string) => {
  try {
    const response = await apiService.delete(
      `${EndPoints.removeNutritionMeal}/${id}`,
      {},
      false,
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

export const getFoodImageURL = async (name: String) => {
  try {
    const response = await apiService.get(
      `${EndPoints.foodImageURL}/${name}`,
      {},
      false,
    );
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    throw {message: errorMessage, code: errorCode};
  }
};

export const postFoodData = async (foodData: object) => {
  try {
    const response = await apiService.post(
      EndPoints.postFoodData,
      foodData,
      false,
    );

    return response;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const postFoodDataUpdate = async (foodData: object) => {
  try {
    const response = await apiService.put(
      EndPoints.postFoodDataUpdate,
      foodData,
      false,
    );
    return response;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const postCompleteDayLog = async (
  date: String,
  orderId: String,
  metadataId: string,
  nutritionAnalysisId: string,
) => {
  try {
    const response = await apiService.patch(
      `${EndPoints.completeDayLog}${orderId}?date=${date}&metadataId=${metadataId}&nutritionAnalysisId=${nutritionAnalysisId}`,
      {},
      {},
      false,
    );
    return response.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const postFoodDataSpecificMeal = async (
  foodData: object,
  orderId: string,
  metadataId: string,
  nutritionAnalysisId: string,
  date: string,
  meal: string,
) => {
  try {
    const response = await apiService.post(
      `${EndPoints.postFoodDataSpecificMeal}?OrderId=${orderId}&date=${date}&meal=${meal}&metadataId=${metadataId}&nutritionAnalysisId=${nutritionAnalysisId}`,
      foodData,
      false,
    );
    return response;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};
export const getMovementList = async (
  page: number,
  limit: number,
  orderId: string,
  status: 'PENDING' | 'COMPLETED',
  params: object
) => {
  try {
    console.log('params is ',params);
    const url = `${EndPoints.movementList}${orderId}?page=${page}&limit=${limit}&status=${status}&timezone=${timeZone}`;
    const response = await apiService.get(url, params, false);
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.message?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const getSurveyList = async (
  page: number,
  limit: number,
  orderId: string,
  status: 'PENDING' | 'COMPLETED',
) => {
  try {
    const url = `${EndPoints.surveyList}/${orderId}/?page=${page}&limit=${limit}&status=${status}`;
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

export const getNutritionDaysStatus = async (orderId: String) => {
  try {
    const response = await apiService.get(
      `${EndPoints.getDaysStatus}${orderId}`,
      {timezone: timeZone},
      false,
    );
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    throw {message: errorMessage, code: errorCode};
  }
};

export const getRecentIngredientList = async () => {
  try {
    const response = await apiService.get(EndPoints.recentIngredientList, {}, false);
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};
