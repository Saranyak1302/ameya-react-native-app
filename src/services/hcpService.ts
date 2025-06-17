import apiService from './api/AppServices';
import {EndPoints} from './api/EndPoints';

export const getOrganizationDetailsByID = async (id: string) => {
  try {
    const response = await apiService.get(
      `${EndPoints.hcpOrgDetail}/${id}?onlyAdmin=true`,
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

export const getParticipantsList = async (
  orgId: string,
  cohortId: string,
  userId: string,
  status: string,
) => {
  try {
    const response = await apiService.get(
      `${EndPoints.hcpParticipantList}?userId=${userId}&organizationId=${orgId}&cohortId=${cohortId}&status=${status}`,
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

export const updateFlag = async (data: object) => {
  try {
    const response = await apiService.patch(EndPoints.flag, data, false);
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};

export const updateRedo = async (data: object) => {
  try {
    const response = await apiService.patch(EndPoints.redo, data, false);
    return response?.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.message;
    const errorMessage = errorDetails?.message || 'An unknown error occurred';
    const errorCode = error.response?.status || 500; // Default to 500 if no status

    // Throw a structured error
    throw {message: errorMessage, code: errorCode};
  }
};
