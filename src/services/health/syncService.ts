import {Platform} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import healthService from './healthService';
import {AppState, AppStateStatus} from 'react-native';

const TASK_ID = 'com.transistorsoft.healthsync';
let foregroundTimer: NodeJS.Timeout | null = null;

export class SyncService {
  private static instance: SyncService;
  private appState: AppStateStatus = 'active';

  private constructor() {
    // Initialize AppState listener
    AppState.addEventListener('change', this.handleAppStateChange);
    
    // Set up native event listener
    // this.setupNativeEventListener();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (this.appState !== nextAppState) {
      this.appState = nextAppState;

      if (nextAppState === 'active') {
        // App came to foreground
        // await this.startForegroundSync();
      } else if (nextAppState === 'background') {
        // App went to background
        //this.stopForegroundSync();
      }
    }
  };

  async syncHealthData() {
    //const isAvailable = await healthService.isAvailable();
    //if (!isAvailable) return;

    // const endDate = new Date();
    // let startDate = new Date();
    // startDate.setHours(0, 0, 0, 0); // Default to today 12 AM

    // // Get last sync time and sync mode
    // const lastSync = await AsyncStorage.getItem('lastSyncDateTime');
    // const syncMode = await AsyncStorage.getItem('syncMode');
    // const lastSyncDateTime = lastSync ? new Date(lastSync) : null;

    // if (lastSyncDateTime) {
    //   if (syncMode === 'daily') {
    //     // If last sync was before today 12 AM, use last sync time as start
    //     if (lastSyncDateTime < startDate) {
    //       startDate = lastSyncDateTime;
    //     }
    //   } else if (syncMode === 'realtime') {
    //     const thirtyMinutesAgo = new Date(endDate.getTime() - 30 * 60 * 1000);
    //     // If last sync was within the last 30 minutes, use last sync time as start
    //     if (lastSyncDateTime > thirtyMinutesAgo) {
    //       startDate = lastSyncDateTime;
    //     }
    //   }
    // }

    // const options = Platform.OS === "ios"
    //   ? {
    //       startDate: startDate.toISOString(),
    //       endDate: endDate.toISOString(),
    //     }
    //   : {
    //       operator: 'between',
    //       startTime: startDate.toISOString(),
    //       endTime: endDate.toISOString(),
    //     };
    // await healthService.initialize()
    try {
      // healthService.initialize();
      //   const [
      //     steps,
      //     sleep,
      //     restingHeartRate,
      //     maxHeartRate,
      //     heartRateVariability,
      //     intensityMinutes,
      //     respiratoryRate,
      //   ] = await Promise.all([
      //     healthService.getSteps(options),
      //     healthService.getSleepData(options),
      //     healthService.getRestingHeartRate(options),
      //     healthService.getMaxHeartRate(options),
      //     healthService.getHeartRateVariability(options),
      //     healthService.getIntensityMinutes(options),
      //     healthService.getRespiratoryRate(options),
      //   ]);

      //   const healthData = {
      //     steps,
      //     sleep,
      //     restingHeartRate,
      //     maxHeartRate,
      //     heartRateVariability,
      //     intensityMinutes,
      //     respiratoryRate,
      //   };
      //   const payload = Object.values(healthData).flat();

      const gethealth: any = await AsyncStorage.getItem('healthData');
      const payload = JSON.parse(gethealth);

      await healthService.postHealthData(payload);
    } catch (error) {}
  }

  async configureBackgroundSync() {
    try {
      const status = await BackgroundFetch.configure(
        {
          minimumFetchInterval: 15,
          forceAlarmManager: true,
          stopOnTerminate: false,
          enableHeadless: true,
          startOnBoot: true,
          requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
          requiresCharging: false,
          requiresDeviceIdle: false,
          requiresBatteryNotLow: false,
        },
        async taskId => {
          // if (taskId === TASK_ID) {
          //
          //   await this.performSync();
          // }

          await this.performSync();
          //BackgroundFetch.finish(taskId);
        },
        async taskId => {
          // <---------------- Event timeout handler
          // The OS has signalled that your remaining background-time has expired.
          // You must immediately complete your work and signal #finish.
          //await AsyncStorage.setItem("backgroundStatus", "0")
          // [REQUIRED] Signal to the OS that your work is complete.
          //await AsyncStorage.setItem("backgroundStatus", "0")
          //BackgroundFetch.finish(taskId);
        },
      );
      BackgroundFetch.status(status => {
        switch (status) {
          case BackgroundFetch.STATUS_RESTRICTED:
            break;
          case BackgroundFetch.STATUS_DENIED:
            break;
          case BackgroundFetch.STATUS_AVAILABLE:
            break;
        }
      });
      BackgroundFetch.start();

      await AsyncStorage.setItem('backgroundStatus', status.toString());
    } catch (error) {}
  }

  async performSync() {
    try {
      const syncMode = await AsyncStorage.getItem('syncMode');
      const activeDevices = await AsyncStorage.getItem('activeDevices');

      if (!syncMode || !activeDevices) return;

      const now = new Date();
      const lastSync = await AsyncStorage.getItem('lastSyncDateTime');
      const lastSyncDateTime = lastSync ? new Date(lastSync) : null;

      const shouldSync = await this.shouldPerformSync(
        syncMode,
        lastSyncDateTime,
        now,
      );

      if (shouldSync) {
        await this.syncHealthData();
      }
    } catch (error) {}
  }

  private async shouldPerformSync(
    syncMode: string,
    lastSyncDateTime: Date | null,
    now: Date,
  ): Promise<boolean> {

    const isDeviceActive = await AsyncStorage.getItem('isDeviceActive');
    if (isDeviceActive === 'false') return false;

    if (!lastSyncDateTime) return true;

    if (syncMode === 'daily') {
      return (
        !lastSyncDateTime ||
        lastSyncDateTime.getDate() !== now.getDate() ||
        lastSyncDateTime.getMonth() !== now.getMonth() ||
        lastSyncDateTime.getFullYear() !== now.getFullYear()
      );
    } else if (syncMode === 'realtime') {
      return now.getTime() - lastSyncDateTime.getTime() >= 15 * 60 * 1000;
    }

    return false;
    //return true;
  }

  async startForegroundSync() {
    const syncMode = (await AsyncStorage.getItem('syncMode')) || 'daily';
    // if (!syncMode) return;

    // Clear any existing timer
    this.stopForegroundSync();

    // Perform initial sync
    // await this.performSync();

    // Set up recurring sync based on mode
    if (syncMode === 'realtime') {
      // Calculate time until next 30-minute mark
      const now = new Date();
      const minutes = now.getMinutes();
      const secondsToNext = (30 - (minutes % 30)) * 60 - now.getSeconds();

      // Initial delay to align with fixed intervals
      setTimeout(async () => {
        await this.performSync();
        // Set up recurring sync every 30 minutes
        foregroundTimer = setInterval(async () => {
          await this.performSync();
        }, 30 * 60 * 1000); // 30 minutes
      }, secondsToNext * 1000);
    } else if (syncMode === 'daily') {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const delay = midnight.getTime() - now.getTime();

      foregroundTimer = setTimeout(async () => {
        await this.performSync();
        // Set up daily recurring sync
        foregroundTimer = setInterval(async () => {
          await this.performSync();
        }, 24 * 60 * 60 * 1000); // 24 hours
      }, delay);
    }
  }

  stopForegroundSync() {
    if (foregroundTimer) {
      clearInterval(foregroundTimer);
      foregroundTimer = null;
    }
  }

  async updateSyncMode(mode: 'daily' | 'realtime') {
    await AsyncStorage.setItem('syncMode', mode);

    // Update background schedule
    //await BackgroundFetch.stop(TASK_ID);
    //await this.scheduleBackgroundTask(mode);

    // Update foreground sync
    if (this.appState === 'active') {
      //await this.startForegroundSync();
    }
  }

  storeLastSyncDateTime() {
    const now = new Date();
    AsyncStorage.setItem('lastSyncDateTime', now.toISOString());
  }

  private async scheduleBackgroundTask(syncMode: 'daily' | 'realtime') {
    try {
      if (syncMode === 'daily') {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const delay = midnight.getTime() - now.getTime();

        await BackgroundFetch.scheduleTask({
          taskId: TASK_ID,
          delay,
          periodic: true,
          forceAlarmManager: true,
        });
      } else {
        await BackgroundFetch.scheduleTask({
          taskId: TASK_ID,
          delay: 30 * 60 * 1000,
          periodic: true,
          forceAlarmManager: true,
        });
      }
    } catch (error) {}
  }
}

export const syncService = SyncService.getInstance();
