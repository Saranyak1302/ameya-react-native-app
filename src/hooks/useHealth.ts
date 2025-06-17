import {useState, useEffect} from 'react';
import {Platform, NativeModules} from 'react-native';
import HealthService, { HealthData } from '../services/health/healthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundTaskManager from '../native_modules/ios/HealthSyncModule';

export const useHealth = () => {
  const [healthData, setHealthData] = useState({
    steps: [] as any[],
    sleep: [] as any[],
    restingHeartRate: [] as any[],
    // maxHeartRate: [] as any[],
    heartRateVariability: [] as any[],
    intensityMinutes: [] as any[],
    respiratoryRate: [] as any[],
    heartRate: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDeviceAndFetch = async () => {
      await fetchHealthData();
      if (Platform.OS === 'ios') {
        const isDeviceActive = await AsyncStorage.getItem('isDeviceActive');
        if (isDeviceActive === 'true') {
          BackgroundTaskManager.syncHealthData();
        }
      }
    };

    checkDeviceAndFetch();
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);

      // Get today's date at 12 AM and current time
      const endDate = new Date();
      let startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Set to today at 12:00 AM

      // Get last sync time and sync mode
      const lastSync = await AsyncStorage.getItem('lastSyncDateTime');
      const syncMode = await AsyncStorage.getItem('syncMode');
      const lastSyncDateTime = lastSync ? new Date(lastSync) : null;

      // if (syncMode === 'daily') {
      //   console.log('dailystart---',startDate)
      //   // Set start date to the start of yesterday
      //   startDate.setDate(startDate.getDate() - 1);
      // }

      if (lastSyncDateTime) {
        // If last sync was before the respective mode start date, use last sync time as start
        if (lastSyncDateTime < startDate) {
          startDate = lastSyncDateTime;
        }
      }

      const options =
        Platform.OS === 'ios'
          ? {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            }
          : {
              operator: 'between',
              startTime: startDate.toISOString(),
              endTime: endDate.toISOString(),
            };

      // Select the appropriate service based on platform
      const healthService = HealthService;

      // Fetch all health data using the selected service
      const [
        steps,
        sleep,
        restingHeartRate,
        // maxHeartRate,
        heartRateVariability,
        intensityMinutes,
        respiratoryRate,
        heartRate
      ] = await Promise.all([
        healthService.getSteps(options),
        healthService.getSleepData(options),
        healthService.getRestingHeartRate(options),
        // healthService.getMaxHeartRate(options),
        healthService.getHeartRateVariability(options),
        healthService.getIntensityMinutes(options),
        healthService.getRespiratoryRate(options),
        healthService.getHeartRateData(options)
      ]);

      setHealthData({
        steps: steps as any[],
        sleep: sleep as any[],
        restingHeartRate: restingHeartRate as any[],
        // maxHeartRate: maxHeartRate as any[],
        heartRateVariability: heartRateVariability as any[],
        intensityMinutes: intensityMinutes as any[],
        respiratoryRate: respiratoryRate as any[],
        heartRate: heartRate as any[],
      });
      const outData = {
        steps: steps as any[],
        sleep: sleep as any[],
        restingHeartRate: restingHeartRate as any[],
        // maxHeartRate: maxHeartRate as any[],
        heartRateVariability: heartRateVariability as any[],
        intensityMinutes: intensityMinutes as any[],
        respiratoryRate: respiratoryRate as any[],
        heartRate: heartRate as any[],
      };
      const payload: any = Object.values(outData).flat();

      //await healthService.postHealthData(payload);
      await AsyncStorage.setItem('healthData', JSON.stringify(payload));
      // if (Platform.OS === 'ios') {
      //   const normalizedData = await healthService.formatHealthData(
      //     payload,
      //     'Apple HealthKit',
      //   );
      //   const filteredData = normalizedData.filter(
      //     (item: HealthData | null) => item !== null,
      //   );
      //   if (filteredData.length > 0) {
      //     BackgroundTaskManager.saveHealthData(JSON.stringify(filteredData));
      //   }
      // }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    healthData,
    loading,
    error,
    refreshData: fetchHealthData,
  };
};
