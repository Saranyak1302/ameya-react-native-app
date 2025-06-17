import {Platform} from 'react-native';
import apiService from '../api/AppServices';
import {EndPoints} from '../api/EndPoints';
import {StorageKeys} from '../../utils/StorageKeys';
import {getData} from '../../utils/LocalStorage';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import getCurrentEnvironment from '../api/envConfig.ts';
import BackgroundTaskManager from '../../native_modules/ios/HealthSyncModule.ts';
// import {updateHealthKitSyncTime} from '../devicesService.ts';
export interface HealthData {
  userId: string;
  source: string;
  activityType: string;
  startDate: string;
  endDate: string;
  rate?: number;
  value?: number;
  metadata: {
    sourceId: string;
    sourceName: string;
    HKWasUserEntered: number;
  };
}

export interface IHealthService {
  source: string;
  initialize(): Promise<boolean>;
  isAvailable(): Promise<boolean>;
  getSteps(options: any): Promise<any>;
  getSleepData(options: any): Promise<any>;
  getHeartRateData(options: any): Promise<any>;
  getRestingHeartRate(options: any): Promise<any>;
  getMaxHeartRate(options: any): Promise<any>;
  getHeartRateVariability(options: any): Promise<any>;
  getIntensityMinutes(options: any): Promise<any>;
  getRespiratoryRate(options: any): Promise<any>;
  postHealthData(data: HealthData[]): Promise<any>;
  formatHealthData(
    userId: string,
    activityType: string,
    startTime: string,
    endDate: string,
    rate?: number,
    value?: number,
    metadata?: any,
  ): HealthData;
}

class HealthService {
  private service: IHealthService;

  constructor(platform: 'ios' | 'android') {
    // Dynamically import the appropriate service
    // this.service =
    //   platform === 'ios'
    //     ? require('./healthkitService').default
    //     : require('./googleHealthService').default;

    this.service = require('./googleHealthService').default;
  }

  async initialize(): Promise<boolean> {
    return this.service.initialize();
  }

  async isAvailable(): Promise<boolean> {
    return this.service.isAvailable();
  }

  async getSteps(options: any) {
    return this.service.getSteps(options);
  }

  async getSleepData(options: any) {
    return this.service.getSleepData(options);
  }

  async getHeartRateData(options: any) {
    return this.service.getHeartRateData(options);
  }

  async getRestingHeartRate(options: any) {
    return this.service.getRestingHeartRate(options);
  }

  async getMaxHeartRate(options: any) {
    return this.service.getMaxHeartRate(options);
  }

  async getHeartRateVariability(options: any) {
    return this.service.getHeartRateVariability(options);
  }

  async getIntensityMinutes(options: any) {
    return this.service.getIntensityMinutes(options);
  }

  async getRespiratoryRate(options: any) {
    return this.service.getRespiratoryRate(options);
  }

  async postHealthData(data: any[]) {
    const postData = await AsyncStorage.getItem('healthData');
    if (!postData) return;

    try {
      // const normalizedData = await this.formatHealthData(data, this.service.source);
      // const filteredData = normalizedData.filter((item: HealthData | null) => item !== null);
      const token = await AsyncStorage.getItem(StorageKeys.token);

      if (!token) throw new Error('No token found');

      // const response = await axios.post(
      //   `${getCurrentEnvironment.baseURL}${EndPoints.healthKitIntegration}`,
      //   postData,
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       device: 'mobile',
      //       platform: Platform.OS,
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      const response = await apiService.post(
        EndPoints.healthKitIntegration,
        postData,
        false,
      );

      if (response.status !== 201) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('healthService post response', response.data);

      await Promise.all([
        AsyncStorage.setItem('lastSyncDateTime', new Date().toISOString()),
        AsyncStorage.setItem('healthData', '')
      ]);
      if (Platform.OS === 'ios') {
        BackgroundTaskManager.setLastSyncDateTime(new Date().toISOString());
      }

      return response.data;
    } catch (error) {
      console.log('Error posting health data:', error);
    }
  }
  // async updateSyncTime () {
  //   try {
  //     const token = await getData({key: StorageKeys.token});
  //   if (!token) throw new Error('No token found');
  //   const decodedToken = jwtDecode(token);
  //     const data = {
  //       id: decodedToken.sub,
  //       lastSyncDateTime: new Date()
  //     };
  //     const response = await updateHealthKitSyncTime(data);
  //     //dispatch(addProfileData(response));
  //   } catch (error: any) {
  //
  //   }
  // };
  async formatHealthData(inputData: any, sourceType: string) {
    const token = await getData({key: StorageKeys.token});
    if (!token) throw new Error('No token found');
    const decodedToken = jwtDecode(token);
    return inputData.map((entry: any) => {
      if (!Object.keys(entry).length) return null;
      if (entry.value === 0) return null;

      if (sourceType === 'Google Health') {
        const {metadata, ...restEntry} = entry;
        return {
          ...restEntry,
          userId: decodedToken.sub,
          source: sourceType,
          metadata: {
            sourceId: metadata.dataOrigin,
            sourceName: metadata.device,
            HKWasUserEntered: metadata.recordingMethod,
          },
        };
      } else if (sourceType === 'Apple HealthKit') {
        const {startDate, endDate, sourceId, sourceName, ...restEntry} = entry;
        const metadata = {
          ...(entry.metadata || {}),
          ...(sourceId && {sourceId}),
          ...(sourceName && {sourceName}),
        };

        return {
          ...restEntry,
          startTime: startDate,
          endTime: endDate,
          metadata,
          source: sourceType,
          userId: decodedToken.sub,
        };
      } else {
        throw new Error('Unknown source type');
      }
    });
  }
}

export default new HealthService(Platform.OS as 'ios' | 'android');
