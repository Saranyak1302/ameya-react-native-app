import {
  initialize as initializeHealthConnect,
  requestPermission,
  readRecords,
  getGrantedPermissions,
  getSdkStatus,
  revokeAllPermissions,
  SdkAvailabilityStatus,
  aggregateRecord,
  aggregateGroupByPeriod,
  RecordType,
  AggregateResult,
  aggregateGroupByDuration,
} from 'react-native-health-connect';
import { getData } from '../../utils/LocalStorage';
import { StorageKeys } from '../../utils/StorageKeys';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

class GoogleHealthService {
  source = 'Google Health';

  initialize = async () => {
    await initializeHealthConnect();
    const readGrantedPermissions = async () => {
      let grandedData = await getGrantedPermissions().then(permissions => {
        return permissions;
      });
      return grandedData;
    };
    let getPermission = await readGrantedPermissions();
    if (getPermission.length === 0) {
      try {
        const permissions = await requestPermission([
          {accessType: 'read', recordType: 'ExerciseSession'},
          {accessType: 'read', recordType: 'Steps'},
          {accessType: 'read', recordType: 'HeartRate'},
          {accessType: 'read', recordType: 'RestingHeartRate'},
          {accessType: 'read', recordType: 'RespiratoryRate'},
          {accessType: 'read', recordType: 'SleepSession'},
          {accessType: 'read', recordType: 'HeartRateVariabilityRmssd'},
        ]);        
        const hasPermissions = permissions.length > 0;
        await AsyncStorage.setItem('isHealthKitError', hasPermissions ? 'false' : 'true');
        
        if (!hasPermissions) {
          try {
            revokeAllPermissions();
          } catch (error) {}
        }
        return hasPermissions;
      } catch (error) {
        await AsyncStorage.setItem('isHealthKitError', 'true');
        return false;
      }
    } else if (getPermission.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  isAvailable = async () => {
    const status = await getSdkStatus();
    return status === SdkAvailabilityStatus.SDK_AVAILABLE;
  };

  checkPermissions = async (recordType: RecordType) => {
    const grantedPermissions = await getGrantedPermissions().then(
      (permissions: any) => {
        return permissions.some((perm: any) => perm.recordType === recordType);
      },
    );
    if(grantedPermissions === false) {
      await AsyncStorage.setItem('isHealthKitError', 'true');
    }
    return grantedPermissions;
  };

  showPermissionAlert = async () => {
    return 'Health connect permission ';
    // await new Promise(async (resolve, reject) => {
    //   await requestPermission([
    //     {accessType: 'read', recordType: 'ExerciseSession'},
    //     {accessType: 'read', recordType: 'Steps'},
    //     {accessType: 'read', recordType: 'HeartRate'},
    //     {accessType: 'read', recordType: 'RestingHeartRate'},
    //     {accessType: 'read', recordType: 'RespiratoryRate'},
    //     {accessType: 'read', recordType: 'SleepSession'},
    //   ])
    //     .then(permissions => {
    //
    //       if(permissions.length > 0) {
    //         resolve(permissions.length > 0);
    //       }
    //       else{
    //         reject();
    //       }

    //     })
    //     .catch(e => {
    //       reject(Error(e.message));
    //     });
    // });

    // await requestPermission([
    //   { accessType: 'read', recordType: 'ExerciseSession' },
    //   { accessType: 'read', recordType: 'Steps' },
    //   { accessType: 'read', recordType: 'HeartRate' },
    //   { accessType: 'read', recordType: 'RestingHeartRate' },
    //   { accessType: 'read', recordType: 'RespiratoryRate' },
    //   { accessType: 'read', recordType: 'SleepSession' },
    // ])

    // return false;
  };

  private async getUserId() {
    const token = await getData({key: StorageKeys.token});
    if (!token) throw new Error('No token found');
    const decodedToken = jwtDecode(token);
    return decodedToken.sub;
  }

  getAggregates = async (recordType: RecordType, options: any) => {
    try {
      const userId = await this.getUserId();
     
      // Map record types to activity types
      const activityTypeMap: { [key: string]: string } = {
        'Steps': 'STEPS',
        'SleepSession': 'SLEEP',
        'RestingHeartRate': 'RESTING_HEART_RATE',
        'RespiratoryRate': 'RESPIRATORY_RATE',
        'ExerciseSession': 'EXERCISE_MINUTES',
        'HeartRate': 'HEART_RATE',
        'HeartRateVariabilityRmssd': 'HEART_RATE_VARIABILITY'
      };

      const result = await aggregateGroupByDuration({
        recordType,
        timeRangeFilter: {
          operator: 'between',
          ...options,
        },
        timeRangeSlicer: {
          duration: 'DAYS',
          length: 1,
        },
      });
    
      return { 
        aggregates: result.map(item => ({
          ...item,
          source: "Google Health",
          sourceId: item.result?.dataOrigins?.[0] || 'com.google.android.apps.fitness',
          userId,
          activityType: activityTypeMap[recordType] || recordType
        }))
      };
    } catch (error) {
      console.log(`error ${recordType}`, error);
      throw error;
    }
  };

  getSteps = async (options: any) => {
    try {
      const authStatus = await this.checkPermissions('Steps' as RecordType);
      if (!authStatus) {
        await this.showPermissionAlert();
        return false;
      }

      const { aggregates } = await this.getAggregates('Steps' as RecordType, options);
      return aggregates
      // return aggregates.map((group) => {
      //   console.log('getSteps group', group);
      //   const { startTime, endTime, result } = group;
      //   return {
      //     value: result?.COUNT_TOTAL || 0,
      //     activityType: 'STEPS',
      //     time: new Date(startTime),
      //     startDate: new Date(startTime),
      //     endDate: new Date(endTime),
      //     metadata: [],
      //     sourceId: result?.dataOrigins[0],
      //     sourceName: "Google Health",
      //   };
      // });
    } catch (error) {
      throw error;
    }
  };

  getSleepData = async (options: any) => {
    try {
      const authStatus = await this.checkPermissions('SleepSession' as RecordType);
      if (!authStatus) {
        await this.showPermissionAlert();
        return null;
      }

      const { aggregates } = await this.getAggregates('SleepSession' as RecordType, options);
      return aggregates;
      // return aggregates.map((group) => {
      //   console.log('getSleepData group', group);
      //   const { startTime, endTime, result } = group;
      //   const sleepMinutes = result?.SLEEP_SESSION_DURATION_TOTAL?.inSeconds 
      //     ? result.SLEEP_SESSION_DURATION_TOTAL.inSeconds / 60 
      //     : 0;

      //   return {
      //     value: sleepMinutes,
      //     activityType: 'SLEEP',
      //     time: new Date(startTime),
      //     startDate: new Date(startTime),
      //     endDate: new Date(endTime),
      //     metadata: [],
      //     sourceId: result?.dataOrigins[0],
      //     sourceName: "Google Health",
      //   };
      // });
    } catch (error) {
      throw error;
    }
  };

  getRestingHeartRate = async (options: any) => {
    try {
      const authStatus = await this.checkPermissions('RestingHeartRate' as RecordType);
      if (!authStatus) {
        await this.showPermissionAlert();
        return null;
      }

      const { aggregates } = await this.getAggregates('RestingHeartRate' as RecordType, options);
      return aggregates;
      // return aggregates.map((group) => {
      //   console.log('getRestingHeartRate group', group);
      //   const { startTime, endTime, result } = group;
      //   return {
      //     value: result?.BPM_AVG || 0,
      //     activityType: 'RESTING_HEART_RATE',
      //     time: new Date(startTime),
      //     startDate: new Date(startTime),
      //     endDate: new Date(endTime),
      //     metadata: [],
      //     sourceId: result?.dataOrigins[0],
      //     sourceName: "Google Health",
      //   };
      // });
    } catch (error) {
      throw error;
    }
  };

  getRespiratoryRate = async (options: any) => {
    try {
      const userId = await this.getUserId();
      const authStatus = await this.checkPermissions('RespiratoryRate');
      if (!authStatus) {
        await this.showPermissionAlert();
        return null;
      }
      return new Promise((resolve, reject) => {
        readRecords('RespiratoryRate', {
          timeRangeFilter: options,
          ascendingOrder: false,
        }).then(({records}) => {
          resolve(
            records.map(record => ({
              ...record,
              source: "Google Health",
              sourceId: 'com.google.android.apps.fitness',
              activityType: 'RESPIRATORY_RATE',
              userId
            })),
          );
        });
      });
    } catch (error) {
      throw error;
    }
  };

  getIntensityMinutes = async (options: any) => {
    try {
      const authStatus = await this.checkPermissions('ExerciseSession' as RecordType);
      if (!authStatus) {
        await this.showPermissionAlert();
        return null;
      }

      const { aggregates } = await this.getAggregates('ExerciseSession' as RecordType, options);
      return aggregates;
      // return aggregates.map((group) => {
      //   console.log('getIntensityMinutes group', group);
      //   const { startTime, endTime, result } = group;
      //   const minutes = result?.EXERCISE_DURATION_TOTAL?.inSeconds 
      //     ? result.EXERCISE_DURATION_TOTAL.inSeconds / 60 
      //     : 0;

      //   return {
      //     value: minutes,
      //     activityType: 'EXERCISE_MINUTES',
      //     time: new Date(startTime),
      //     startDate: new Date(startTime),
      //     endDate: new Date(endTime),
      //     metadata: [],
      //     sourceId: result?.dataOrigins[0],
      //     sourceName: "Google Health",
      //   };
      // });
    } catch (error) {
      throw error;
    }
  };

  // getMaxHeartRate = async (options: any) => {
  //   try {
  //     const authStatus = await this.checkPermissions('HeartRate' as RecordType);
  //     if (!authStatus) {
  //       await this.showPermissionAlert();
  //       return null;
  //     }

  //     const { aggregates } = await this.getAggregates('HeartRate' as RecordType, options);
  //     return aggregates;
  //     // return aggregates.map((group) => {
  //     //   console.log('getMaxHeartRate group', group);
  //     //   const { startTime, endTime, result } = group;
  //     //   return {
  //     //     value: result?.BPM_MAX || 0,
  //     //     activityType: 'MAX_HEART_RATE',
  //     //     time: new Date(startTime),
  //     //     startDate: new Date(startTime),
  //     //     endDate: new Date(endTime),
  //     //     metadata: [],
  //     //     sourceId: result?.dataOrigins[0],
  //     //     sourceName: "Google Health",
  //     //   };
  //     // });
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  getHeartRateData = async (options: any) => {
    try {
      const authStatus = await this.checkPermissions('HeartRate');
      if (!authStatus) {
        await this.showPermissionAlert();
        return null;
      }

      const { aggregates } = await this.getAggregates('HeartRate' as RecordType, options);
      return aggregates;
      // return aggregates.map((group) => {
      //   console.log('getHeartRateData group', group);
      //   const { startTime, endTime, result } = group;
      //   return {
      //     avgBPM: result?.BPM_AVG || 0,
      //     maxBPM: result?.BPM_MAX || 0,
      //     minBPM: result?.BPM_MIN || 0,
      //     activityType: 'HEART_RATE',
      //     time: new Date(startTime),
      //     startDate: new Date(startTime),
      //     endDate: new Date(endTime),
      //     metadata: [],
      //     sourceId: result?.dataOrigins[0],
      //     sourceName: "Google Health",
      //   };
      // });
    } catch (error) {
      throw error;
    }
  };

  getHeartRateVariability = async (options: any) => {
    try {
      const userId = await this.getUserId();
      const authStatus = await this.checkPermissions('HeartRateVariabilityRmssd');
      if (!authStatus) {
        await this.showPermissionAlert();
        return false;
      }
      return new Promise((resolve, reject) => {
        readRecords('HeartRateVariabilityRmssd', {
          timeRangeFilter: options,
        }).then(({records}) => {
          resolve(
            records.map(record => ({
              ...record,
              source: "Google Health",
              sourceId: 'com.google.android.apps.fitness',
              activityType: 'HEART_RATE_VARIABILITY',
              userId
            })),
          );
        });
      });
    } catch (error) {
      throw error;
    }
  };
}
export default new GoogleHealthService();
