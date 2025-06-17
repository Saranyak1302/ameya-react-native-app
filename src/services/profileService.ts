import apiService from './api/AppServices.ts';
import {EndPoints} from './api/EndPoints.tsx';

// Get profile details by ID
export const getProfileDetailsByID = async (id: string) => {
  try {
    const response = await apiService.get(
      `${EndPoints.participant}/${id}`,
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
