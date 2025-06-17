import {NativeModules} from 'react-native';

const {BackgroundTaskManager} = NativeModules;

interface IBackgroundTaskManager {
  setSyncMode: (syncMode: string) => void;
  // saveHealthData: (data: string) => void;
  saveToken: (token: string) => void;
  setLastSyncDateTime: (lastSyncDateTime: string) => void;
  setUserId: (userId: string) => void;
  syncHealthData: () => void;
}

export default BackgroundTaskManager as IBackgroundTaskManager;

// Usage
// try {
//     await HealthKitManager.requestAuthorization();
//     console.log('HealthKit authorization granted');
// } catch (error) {
//     console.error('HealthKit authorization failed:', error);
// }
