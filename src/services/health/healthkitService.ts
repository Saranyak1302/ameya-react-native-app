import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import {Alert, Linking} from 'react-native';

/* Permission options */
const PERMISSIONS = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.AppleExerciseTime,
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
    ],
    write: [],
  },
} as HealthKitPermissions;

interface HealthAuthStatus {
  permissions: {
    read: number[];
    write: number[];
  };
}

class HealthkitService {
  source = 'Apple HealthKit';

  isAvailable = async () => {
    return new Promise(resolve => {
      AppleHealthKit.isAvailable((err: Object, available: boolean) => {
        resolve(available);
      });
    });
  };

  checkPermissions = async () => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getAuthStatus(
        PERMISSIONS,
        (error: string, result: any) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        },
      );
    });
  };

  showPermissionAlert = () => {
    return new Promise(resolve => {
      Alert.alert(
        'Health Access Required',
        'Please allow access to your health data to use this feature',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Allow',
            onPress: async () => {
              const supported = await Linking.canOpenURL('x-apple-health://');

              if (supported) {
                await Linking.openURL('x-apple-health://');
              } else {
                Alert.alert('Error', 'Unable to open the Health app.');
              }
              resolve(true);
            },
          },
        ],
        {cancelable: false},
      );
    });
  };

  initialize = async () => {
    try {
      // const authStatus = await this.checkPermissions() as HealthAuthStatus;
      //
      // // Check if any read permission is denied (0)
      // const hasDeclinedPermissions = authStatus.permissions.write.every(permission => permission === 1);

      // if (hasDeclinedPermissions) {
      //   const userResponse = await this.showPermissionAlert();
      //   if (!userResponse) {
      //     throw new Error('Health permissions denied');
      //   }
      //   return false;
      // }

      return new Promise((resolve, reject) => {
        AppleHealthKit.initHealthKit(PERMISSIONS, (error: string) => {
          if (error) {
            reject(error);
            resolve(false);
            return;
          }
          resolve(true);
        });
      });
    } catch (error) {
      throw error;
    }
  };

  getSteps = async (options: HealthInputOptions) => {
    try {
      const authStatus = (await this.checkPermissions()) as HealthAuthStatus;
      if (!authStatus.permissions) {
        await this.showPermissionAlert();
        return null;
      }

      return new Promise((resolve, reject) => {
        AppleHealthKit.getDailyStepCountSamples(
          options,
          (error: string, results: HealthValue[]) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(results.map(result => ({
              ...result,
              activityType: 'STEPS',
              metadata: result.metadata?.[0] || result.metadata?.['0'] || result.metadata
            })));
          },
        );
      });
    } catch (error) {
      throw error;
    }
  };

  getSleepData = async (options: HealthInputOptions) => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getSleepSamples(
        options,
        (error: string, results: HealthValue[]) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(results.map(result => ({...result, activityType: 'SLEEP'})));
        },
      );
    });
  };

  getHeartRateData = async (options: HealthInputOptions) => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getHeartRateSamples(
        options,
        (error: string, results: HealthValue[]) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(
            results.map(result => ({...result, activityType: 'HEART_RATE'})),
          );
        },
      );
    });
  };

  getRestingHeartRate = async (options: HealthInputOptions) => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getRestingHeartRateSamples(
        options,
        (error: string, results: HealthValue[]) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(
            results.map(result => ({
              ...result,
              activityType: 'RESTING_HEART_RATE',
            })),
          );
        },
      );
    });
  };

  getMaxHeartRate = async (options: HealthInputOptions) => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getHeartRateSamples(
        options,
        (error: string, results: HealthValue[]) => {
          if (error) {
            reject(error);
            return;
          }
          const maxHRResult = results.reduce((maxResult, current) => {
            return current.value > maxResult.value ? current : maxResult;
          }, results[0] || null);

          if (!maxHRResult) {
            resolve([]);
            return;
          }

          resolve([{
            ...maxHRResult,
            activityType: 'MAX_HEART_RATE'
          }]);
        },
      );
    });
  };

  getHeartRateVariability = async (options: HealthInputOptions) => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getHeartRateVariabilitySamples(
        options,
        (error: string, results: HealthValue[]) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(
            results.map(result => ({
              ...result,
              activityType: 'HEART_RATE_VARIABILITY',
            })),
          );
        },
      );
    });
  };

  getIntensityMinutes = async (options: HealthInputOptions) => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getAppleExerciseTime(
        options,
        (error: string, results: HealthValue[]) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(
            results.map(result => ({
              ...result,
              activityType: 'EXERCISE_MINUTES',
            })),
          );
        },
      );
    });
  };

  getRespiratoryRate = async (options: HealthInputOptions) => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getRespiratoryRateSamples(
        options,
        (error: string, results: HealthValue[]) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(
            results.map(result => ({
              ...result,
              activityType: 'RESPIRATORY_RATE',
            })),
          );
        },
      );
    });
  };
}

export default new HealthkitService();
