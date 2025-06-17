import React, {useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  AppState,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import {useHealth} from '../../hooks/useHealth';
import {AppStrings} from '../../utils/Constants';
import Header from '../../components/Header';
import {AppColors} from '../../theme/AppColors';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import {AppFonts, AppFontSize, AppWeights} from '../../theme/AppFonts.tsx';
import {format, compareAsc} from 'date-fns';
import {useFocusEffect} from '@react-navigation/native';
import healthService from '../../services/health/healthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { syncService } from '../../services/health/syncService';

export const HealthScreen = () => {
  const {healthData, loading, error, refreshData} = useHealth();
  const [lastSync, setLastSync] = React.useState<string | null>(null);
  const [hasActiveDevices, setHasActiveDevices] = React.useState<boolean>(true);
  const [isDeviceActive, setIsDeviceActive] = React.useState<boolean>(true);


  React.useEffect(() => {
    const getInitialData = async () => {
      try {
        const [syncTime, activeDevices, isDeviceActive] = await Promise.all([
          AsyncStorage.getItem('lastSyncDateTime'),
          AsyncStorage.getItem('activeDevices'),
          AsyncStorage.getItem('isDeviceActive'),
        ]);

        setLastSync(syncTime);
        setHasActiveDevices(JSON.parse(activeDevices || '[]').length > 0);
        setIsDeviceActive(isDeviceActive === 'true');
      } catch (error) {}
    };
    getInitialData();
  }, []);

  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (nextAppState === 'active') {
          const activeDevices = await AsyncStorage.getItem('activeDevices');
          setHasActiveDevices(JSON.parse(activeDevices || '[]').length > 0);
          if (activeDevices) {
            refreshData();
          }
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // React.useEffect(() => {
  //   let subscription: any;
    
  //   if (Platform.OS === 'ios') {
  //     const eventEmitter = new NativeEventEmitter(NativeModules.BackgroundTaskManager);
  //     subscription = eventEmitter.addListener('LastSyncDateTime', (event) => {
  //       if (event.lastSyncDateTime) {
  //         setLastSync(event.lastSyncDateTime);
  //         AsyncStorage.setItem('lastSyncDateTime', event.lastSyncDateTime);
  //       }
  //     });
  //   }

  //   return () => {
  //     subscription?.remove();
  //   };
  // }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     const healthInitialize = async () => {
  //       try {
  //         await healthService.initialize();
  //       } catch (error) {}
  //     };
  //     healthInitialize();
  //   }, []),
  // );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadContainer}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }
  if (!hasActiveDevices || !isDeviceActive) {
    let deviceType = Platform.OS === 'ios' ? 'Apple' : 'Google';
    return (
      <SafeAreaView style={styles.loadContainer}>
        <Header
          title={AppStrings.healthData}
          onBack={undefined}
          varient="TYPE3"
        />
        <View style={styles.noDevicesContainer}>
          <Text maxFontSizeMultiplier={1.3} style={styles.noDevicesText}>
            Please enable the {deviceType} toggle button in Devices to access
            Health Data.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollViewContent}>
        <Header
          title={AppStrings.healthData}
          onBack={undefined}
          varient="TYPE3"
        />
        {lastSync && (
          <View style={styles.lastSyncContainer}>
            <Text maxFontSizeMultiplier={1.3} style={styles.lastSyncText}>
              Last synced: {format(new Date(lastSync), 'dd/MM/yyyy h:mm:ss a')}
            </Text>
          </View>
        )}
        <ScrollView>
          <View style={styles.section}>
            <Text maxFontSizeMultiplier={1.3} style={styles.personalInfoHeading}>Steps</Text>
            {healthData.steps && healthData.steps.length > 0 ? (
              healthData.steps.map((step: any, index: number) => (
                <View style={styles.subsection} key={index}>
                  <Text style={styles.infoValue}>
                    {step.result?.COUNT_TOTAL || 'No'} steps
                  </Text>
                  <Text style={styles.timestamp}>
                    Start: {format(new Date(step.startTime), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                  <Text style={styles.timestamp}>
                    End: {format(new Date(step.endTime), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoValue}>No steps data</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.personalInfoHeading}>Heart Rate</Text>
            <Text style={styles.subtitle}>Heart Rate</Text>
            {healthData.heartRate && healthData.heartRate.length > 0 ? (
              healthData.heartRate.map((hr: any, index: number) => (
                <View key={index} style={styles.dataRow}>
                  <Text style={styles.infoValue}>
                    Min: {hr.result?.BPM_MIN || 'N/A'} BPM {'\n'}
                    Max: {hr.result?.BPM_MAX || 'N/A'} BPM {'\n'}
                    Avg: {hr.result?.BPM_AVG || 'N/A'} BPM
                  </Text>
                  <Text style={styles.timestamp}>
                    Start: {format(new Date(hr.startTime), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                  <Text style={styles.timestamp}>
                    End: {format(new Date(hr.endTime), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoValue}>No heart rate data</Text>
            )}

            <Text style={styles.subtitle}>Heart Rate Variability</Text>
            {healthData.heartRateVariability && healthData.heartRateVariability.length > 0 ? (
              healthData.heartRateVariability.map((hrv: any, index: number) => (
                <View key={index} style={styles.dataRow}>
                  <Text style={styles.infoValue}>
                    {hrv.result?.value || 'N/A'} ms
                  </Text>
                  <Text style={styles.timestamp}>
                    Start: {format(new Date(hrv.startTime), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                  <Text style={styles.timestamp}>
                    End: {format(new Date(hrv.endTime), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoValue}>No heart rate variability data</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.personalInfoHeading}>Activity</Text>
            <Text style={styles.subtitle}>Exercise Minutes</Text>
            {healthData.intensityMinutes && healthData.intensityMinutes.length > 0 ? (
              healthData.intensityMinutes.map((im: any, index: number) => (
                <View key={index} style={styles.dataRow}>
                  <Text style={styles.infoValue}>
                    {Math.round(im.result?.EXERCISE_DURATION_TOTAL?.inSeconds / 60) || 0} minutes
                  </Text>
                  <Text style={styles.timestamp}>
                    Start: {format(new Date(im.startTime), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                  <Text style={styles.timestamp}>
                    End: {format(new Date(im.endTime), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoValue}>No exercise minutes data</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.personalInfoHeading}>Respiratory Rate</Text>
            {healthData.respiratoryRate && healthData.respiratoryRate.length > 0 ? (
              healthData.respiratoryRate.map((rr: any, index: number) => (
                <View key={index} style={styles.dataRow}>
                  <Text style={styles.infoValue}>
                    {rr.rate || 'N/A'} breaths/min
                  </Text>
                  <Text style={styles.timestamp}>
                    Time: {format(new Date(rr.time), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoValue}>No respiratory rate data</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.personalInfoHeading}>Sleep</Text>
            {healthData.sleep && healthData.sleep.length > 0 ? (
              healthData.sleep.map((sleep: any, index: number) => (
                <View key={index} style={styles.dataRow}>
                  <Text style={styles.infoValue}>
                    Duration: {Math.round(sleep.result?.SLEEP_DURATION_TOTAL / 3600)} hours
                  </Text>
                  <Text style={styles.timestamp}>
                    Start: {format(new Date(sleep.startTime), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                  <Text style={styles.timestamp}>
                    End: {format(new Date(sleep.endTime), 'dd/MM/yyyy h:mm:ss a')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoValue}>No sleep data</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadContainer: {
    flex: 1,
    backgroundColor: AppColors.greyWhite,
  },
  container: {
    flex: 1,
    backgroundColor: AppColors.greyWhite,
  },
  scrollViewContent: {
    height: '100%',
    // paddingBottom: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subsection: {
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: AppFontSize.intersize22,
    fontWeight: AppWeights.interBold,
    fontFamily: AppFonts.interBold,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    marginTop: 10,
    marginBottom: 5,
    color: AppColors.textFieldHeading,
  },
  value: {
    fontSize: AppFontSize.intersize26,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    color: '#2196F3',
  },
  dataRow: {
    marginTop: 10,
  },
  timestamp: {
    fontSize: AppFontSize.intersize14,
    color: '#999',
    marginTop: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoName: {
    fontSize: AppFontSize.intersize14,
    color: AppColors.textFieldHeading,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    marginBottom: 10,
  },
  infoValue: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
  },
  personalInfoHeading: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonDarkBlue,
    paddingBottom: 12,
    borderBottomColor: AppColors.textFieldBorderGrey,
    borderBottomWidth: 1,
    fontFamily: AppFonts.interSemibold,
    marginBottom: 2,
  },
  lastSyncContainer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: AppColors.greyWhite,
  },
  lastSyncText: {
    fontSize: AppFontSize.intersize14,
    color: AppColors.textFieldHeading,
    fontFamily: AppFonts.interRegular,
  },
  noDevicesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDevicesText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    paddingHorizontal: 40,
    textAlign: 'center',
    fontFamily: AppFonts.interSemibold,
    color: AppColors.textHeadingBlack,
  },
});
