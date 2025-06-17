import apiService from './api/AppServices';
import { EndPoints } from './api/EndPoints';
import axios from 'axios';
export const videoUploadApi = async (
  formData: FormData, // Explicitly type as FormData
  setProgress: (progress: number) => void, // Function to update progress
) => {
  try {
    const response = await apiService.posMultipartVideo(
      EndPoints.upload,
      formData,
      {
        'Content-Type': 'multipart/form-data',
      },
      progressEvent => {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        setProgress(percentage); // Update progress percentage
      },
    );

    return response;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;

    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status
    throw { message: errorMessage, code: errorCode };
  }
};
export const fileUploaderApi = async formData => {
  try {
    const response = await apiService.posMultipart(EndPoints.upload, formData, {
      'Content-Type': 'multipart/form-data',
    });

    return response;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;

    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status
    throw { message: errorMessage, code: errorCode };
  }
};
export const updateMovement = async (data: object) => {
  try {
    const response = await apiService.patch(
      EndPoints.updateMovement,
      data,
      {},
      false,
    );

    return response;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;

    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status
    throw { message: errorMessage, code: errorCode };
  }
};
export const presignedurl = async (data: any) => {
  try {
    const url = EndPoints.upload;
    const response = await apiService.get(url, data, false);
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.message?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw { message: errorMessage, code: errorCode };
  }
};
