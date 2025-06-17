import React, {useState, useCallback, memo, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  NativeModules,
  Linking,
} from 'react-native';
import {Switch} from 'react-native-switch';
import {jwtDecode} from 'jwt-decode';
import {useSelector} from 'react-redux';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../theme/AppFonts';
import {useHealth} from '../hooks/useHealth';
import healthService from '../services/health/healthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {syncService} from '../services/health/syncService';
import {
  connectGarminFitbit,
  connectHealthKit,
  disConnectGarminFitbit,
  disConnectHealthKit,
  reConnectHealthKit,
} from '../services/devicesService.ts';
import {ProfileData} from '../models/ProfileModel.ts';
import {NavigatorNames} from '../navigators/tabs/NavigatorsNames';
import {navigate} from '../navigators/utils/Utils';
import AlertModal from '../components/AlertModal.tsx';
import BackgroundTaskManager from '../native_modules/ios/HealthSyncModule';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {revokeAllPermissions} from 'react-native-health-connect';
import { AppContext } from '../context/AppContextProvider.tsx';
import GlobalStyles from '../styles/GlobalStyles.tsx';

interface DeviceItemProps {
  item: {
    status: string;
    deviceName: string;
    brand: string;
    image: any;
  };
  isLastItem: boolean;
  deviceResponse: any;
  setAlertTitle: any;
  setShowAlert: any;
  setLoading: (loading: boolean) => void;
  setShowConfirmPopup: (show: boolean) => void;
  deleteConfirm: boolean;
  setDeleteConfirm: any;
  deleteDeviceSel: string;
  setDeleteDevice: any;
  enableToggle: Boolean;
  activeDevices: any;
}

type AlertButtons =
  | [{text: string; onPress?: () => void}]
  | [
      {text: string; onPress?: () => void},
      {text: string; onPress?: () => void},
    ];

const DeviceItem: React.FC<DeviceItemProps> = memo(
  ({
    item,
    isLastItem,
    deviceResponse,
    setAlertTitle,
    setShowAlert,
    setLoading,
    setShowConfirmPopup,
    deleteConfirm,
    setDeleteConfirm,
    deleteDeviceSel,
    setDeleteDevice,
    enableToggle,
    activeDevices,
  }) => {
    const profileData: ProfileData = useSelector(
      (state: any) => state?.profile?.data,
    );
    const token = useSelector((state: any) => state?.auth?.token);
    const [isSwitchOn, setIsSwitchOn] = useState(item.status === 'Active');
    const {HealthKitManager} = NativeModules;

    const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error("AppContext must be used within an AppProvider");
  }
  const {
    setAlertTitle: setTitle,
    setShowAlert: setAlert,
    setAlertMessage: setMessage,
    clearAlert,
    setAlertButtons: setAlertButtons,
  } = appContext;
    useEffect(() => {
      if (
        deviceResponse &&
        Array.isArray(deviceResponse) &&
        deviceResponse.length > 0
      ) {
        let out = deviceResponse.filter(
          (val: any) => val.serviceName === item.deviceName,
        );
        if (out.length > 0) {
          out[0].serviceName === item.deviceName &&
            setIsSwitchOn(out[0].active);
        } else {
          if (item.deviceName === 'FITBIT' || item.deviceName === 'GARMIN') {
            setIsSwitchOn(false);
          }
        }
        setLoading(false);
      }
      if (
        !deviceResponse ||
        !Array.isArray(deviceResponse) ||
        !deviceResponse.length
      ) {
        if (item.deviceName === 'FITBIT' || item.deviceName === 'GARMIN') {
          setIsSwitchOn(false);
        }

        setLoading(false);
      }
    }, [deviceResponse]);

    useEffect(() => {
      const deleteDevice = async () => {
        if (!deleteConfirm || deleteDeviceSel !== item.brand) return;

        // Safely get thirdPartyId from deviceResponse
        const thirdPartyId =
          deviceResponse && Array.isArray(deviceResponse)
            ? deviceResponse.find(
                (val: any) => val.serviceName === item.deviceName,
              )?.id || ''
            : '';

        try {
          setLoading(true);
          const disConnectstatus =
            deleteDeviceSel === 'Fitbit' || deleteDeviceSel === 'Garmin'
              ? await disConnectGarminFitbit(
                  profileData.ameyaId,
                  deleteDeviceSel,
                )
              : thirdPartyId
              ? await disConnectHealthKit(thirdPartyId, deleteDeviceSel, 'USER')
              : null;

          if (!disConnectstatus) {
            throw new Error('Invalid device configuration');
          }

          // Check both status codes since API returns 201 for success
          const isSuccess =
            disConnectstatus?.status === 200 ||
            disConnectstatus?.status === 201;
          // Get message from the response data
          const responseMessage =
            disConnectstatus?.data?.message || disConnectstatus?.message;
          if (isSuccess) {
            if (Platform.OS === 'android') {
              revokeAllPermissions();
            }
            await AsyncStorage.setItem('isDeviceActive', 'false');
            setAlertTitle(responseMessage);
            setDeleteDevice('');
          } else {
            setAlertTitle('Failed to disconnect device. Please try again.');
            setDeleteDevice('');
          }
          setShowAlert(true);
        } catch (error) {
          setAlertTitle('Failed to disconnect device. Please try again.');
          setShowAlert(true);
          setDeleteDevice('');
        }
        setLoading(false);
      };

      deleteDevice();
    }, [deleteConfirm]);

    useEffect(() => {
      const enableDevice = async () => {
        if (enableToggle) {
          item.brand === 'Apple' && setIsSwitchOn(true);
          //const activeDevices = await AsyncStorage.getItem('activeDevices');
          const syncMode = (await AsyncStorage.getItem('syncMode')) || 'daily';
          const decodedToken = jwtDecode(token);
          const userId = decodedToken?.sub;
          try {
            await connectHealthKit({
              id: userId,
              typeOfSync: syncMode.toUpperCase(),
              serviceName: 'APPLE',
            });
          } catch (error: any) {}
          await healthService.initialize();
          await syncService.updateSyncMode(syncMode as 'daily' | 'realtime');
          const currentDevices = activeDevices ? JSON.parse(activeDevices) : [];
          await AsyncStorage.setItem(
            'activeDevices',
            JSON.stringify([...currentDevices, 'Apple']),
          );
        }
      };
      enableDevice();
    }, [enableToggle]);

    useEffect(() => {
      const thirdPartyId =
        deviceResponse && Array.isArray(deviceResponse)
          ? deviceResponse.find(
              (val: any) => val.serviceName === item.deviceName,
            )?.id || null
          : null;

      const checkHealthKitError = async () => {
        const isHealthKitError = await AsyncStorage.getItem('isHealthKitError');
        const healthKitErrorReason = await AsyncStorage.getItem('HealthKitErrorReason');
        if (isHealthKitError === 'true' && thirdPartyId) {
          setIsSwitchOn(false);
          await disConnectHealthKit(
            thirdPartyId,
            Platform.OS === 'ios' ? 'APPLE' : 'GOOGLE',
            'UNINSTALL',
            healthKitErrorReason || undefined,
          );
        }
      };
      if (item.brand === 'Apple' || item.brand === 'Google') {
        checkHealthKitError();
      }
    }, []);

    const onSelectDevice = useCallback(
      async (value: boolean) => {
        // setLoading(true)
        try {
          // const activeDevices = await AsyncStorage.getItem('activeDevices');
          if (value) {
            setDeleteConfirm(false);
            if (item.brand === 'Fitbit' || item.brand === 'Garmin') {
              const payload = {
                ameyaId: profileData.ameyaId,
                email: profileData.email,
              };
              let viewUrl = await connectGarminFitbit(payload, item.brand);
              if (viewUrl.statusCode === 200) {
                navigate(NavigatorNames.devicesWebView, {
                  viewUrl: viewUrl?.data.url,
                  brand: item.brand,
                });
              } else {
                setAlertTitle(viewUrl.message);
                setShowAlert(true);
              }
              //
            } else {
              let authGranted = false;
              await AsyncStorage.setItem('isHealthKitError', 'false');
              const syncMode =
                (await AsyncStorage.getItem('syncMode')) || 'daily';
              const decodedToken = jwtDecode(token);
              const userId = decodedToken?.sub;
              try {
                await connectHealthKit({
                  id: userId,
                  typeOfSync: syncMode.toUpperCase(),
                  serviceName: item.brand.toUpperCase(),
                });
              } catch (error: any) {
                setIsSwitchOn(!value);
              }

              if (Platform.OS === 'ios') {
                try {
                  await HealthKitManager.requestAuthorization();
                  BackgroundTaskManager.syncHealthData();
                  setIsSwitchOn(true);
                  authGranted = true;
                  console.log('HealthKit authorization granted');
                  setAlertTitle('Apple device connected successfully!');
                  setShowAlert(true);
                  setDeleteDevice('');
                } catch (error) {
                  console.error('HealthKit authorization failed:', error);
                }
              } else {
                try{
                  const serviceAvailable = await healthService.isAvailable();
                  if(!serviceAvailable){
                    setIsSwitchOn(false);
                    setTitle('Health app is required!');
                    
                    setMessage(
                      <Text maxFontSizeMultiplier={1.3} style={GlobalStyles.message}>
                       Please install Health Connect app to continue.
                      </Text>
                    );
                    // Show custom alert with install button
                    setAlertButtons &&
                    setAlertButtons([
                      {
                        text: 'Install',
                        onPress: () => {
                          Linking.openURL('https://play.google.com/store/search?q=health+connect&c=apps');
                        }
                      },
                      {
                        text: 'Cancel',
                        onPress: () => {
                          setShowAlert(false);
                        }
                      },
                    ]);
                    setAlert(true);
                    return;
                  }
                } catch (error) {
                  console.error('HealthKit available failed:', error);
                }
                try {
                  const permresponse = await healthService.initialize();
                  console.log('permresponse', permresponse);
                  setIsSwitchOn(permresponse);
                  if(permresponse){
                    setAlertTitle('Google device connected successfully!');
                    setShowAlert(true);
                  }
                  authGranted = permresponse;
                } catch (error) {
                  console.error('HealthKit authorization failed:', error);
                }
              }

              try {
                const thirdPartyId =
                  deviceResponse && Array.isArray(deviceResponse)
                    ? deviceResponse.find(
                        (val: any) => val.serviceName === item.deviceName,
                      )?.id || null
                    : null;

                if (thirdPartyId && authGranted) {
                  const reConnectStatus = await reConnectHealthKit({
                    id: thirdPartyId,
                    serviceName: item.brand.toUpperCase(),
                  });

                  // if(reConnectStatus.status === 200) {
                  //   await AsyncStorage.setItem('isDeviceActive', 'true');
                  // }
                }
                await AsyncStorage.setItem('isDeviceActive', 'true');
                await AsyncStorage.setItem('isHealthKitError', 'false');
              } catch (error: any) {
                setIsSwitchOn(!value);
              }

              await syncService.updateSyncMode(
                syncMode as 'daily' | 'realtime',
              );
            }
            let currentDevices = [];

            if (activeDevices) {
              try {
                currentDevices = JSON.parse(activeDevices);
              } catch (error) {
                console.warn('Failed to parse activeDevices:', activeDevices);
                currentDevices = [];
              }
            }

            // console.log('activeDevices123', activeDevices);
            // const currentDevices = activeDevices
            //   ? JSON.parse(activeDevices)
            //   : [];
            //   console.log('currentDevices', currentDevices);
            await AsyncStorage.setItem(
              'activeDevices',
              JSON.stringify([...currentDevices, item.brand]),
            );
            setLoading(false);
          } else {
            //setDeleteConfirm(false);
            if (activeDevices) {
              setDeleteDevice(item.brand);
              setShowConfirmPopup(true);
              // if(item.brand === "Fitbit" || item.brand === "Garmin")
              // {
              //     setDeleteDevice(item.brand)
              //     setShowConfirmPopup(true)

              //     // const disConnectstatus = await disConnectGarminFitbit(profileData.ameyaId, item.brand);
              //     // if(disConnectstatus.status === 200)
              //     // {
              //     //   setAlertTitle(disConnectstatus.data.message);
              //     //   setShowAlert(true);
              //     // }
              //     // setAlertTitle('Meal deleted successfully.');
              //     // setShowAlert(true);
              // }
              // else{
              //   setIsSwitchOn(value);
              //   const devices = JSON.parse(activeDevices).filter(
              //     (d: string) => d !== item.brand,
              //   );
              //   await AsyncStorage.setItem(
              //     'activeDevices',
              //     JSON.stringify(devices),
              //   );
              // }
              setLoading(false);
            }
            syncService.stopForegroundSync();
          }
        } catch (error) {
          console.error('Error toggling health service:', error);
          //setIsSwitchOn(!value);
          setLoading(false);
        }
      },
      [item.brand],
    );

    // const getHealthData = async () => {
    //   const hasAccess = await healthService.isAvailable();
    //   if (hasAccess) {
    //     await refreshData();
    //   }
    // };

    // const fetchDataBasedOnSyncMode = (syncMode: string) => {
    //   if (syncMode === 'daily') {
    //     // Schedule daily sync at 12 AM
    //     const now = new Date();
    //     const nextMidnight = new Date(now);
    //     nextMidnight.setHours(24, 0, 0, 0);

    //     const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

    //     // Schedule first sync at next midnight
    //     setTimeout(async () => {
    //       await getHealthData();
    //       // Then schedule it to repeat every 24 hours
    //       setInterval(async () => {
    //         await getHealthData();
    //       }, 24 * 60 * 60 * 1000);
    //     }, timeUntilMidnight);
    //   } else if (syncMode === 'realtime') {
    //     // Schedule real-time sync every 30 minutes
    //     const THIRTY_MINUTES = 30 * 60 * 1000;

    //     // Perform initial sync
    //     getHealthData();

    //     // Set up recurring sync every 30 minutes
    //     const intervalId = setInterval(async () => {
    //       await getHealthData();
    //     }, THIRTY_MINUTES);

    //     // Store interval ID for cleanup
    //     setIntevalTime(intervalId as unknown as number);
    //   }
    // };
    const disConnectGarmin = async () => {
      const disConnectstatus = await disConnectGarminFitbit(
        profileData.ameyaId,
        item.brand,
      );
      if (disConnectstatus.status === 200) {
        setAlertTitle(disConnectstatus.data.message);
        setShowAlert(true);
      }
      setAlertTitle('Meal deleted successfully.');
      setShowAlert(true);
    };
    return (
      <View style={[styles.deviceItem, isLastItem && styles.noMargin]}>
        <View style={styles.flexedRow}>
          <Image style={styles.deviceItemImage} source={item.image} />
          <View>
            <Text maxFontSizeMultiplier={1.4} style={styles.title}>
              {item.brand}
            </Text>
            {item.status === 'Active' && (
              <Text maxFontSizeMultiplier={1.4} style={styles.description}>
                {item.deviceName}
              </Text>
            )}
          </View>
        </View>
        <Switch
          key={isSwitchOn ? 'on' : 'off'}
          backgroundActive={'#007AFF'}
          backgroundInactive={'#6E6E6E'}
          circleSize={getModerateScaleSize(23)}
          renderActiveText={false}
          renderInActiveText={false}
          circleBorderActiveColor={'#007AFF'}
          circleBorderInactiveColor={'#6E6E6E'}
          onValueChange={onSelectDevice}
          value={isSwitchOn}
          switchWidthMultiplier={2}
        />
      </View>
    );
  },
);

// Extract static styles
const baseStyles = {
  noMargin: {
    marginBottom: 0,
  },

  actionImage: {
    width: verticalScale(24),
    height: verticalScale(24),
    objectFit: 'cover',
  },
};

const styles = StyleSheet.create({
  ...baseStyles,
  deviceItem: {
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(10),
    backgroundColor: AppColors.white,
    borderRadius: moderateScale(8),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },

  deviceItemImage: {
    width: getModerateScaleSize(40),
    height: getModerateScaleSize(40),
    objectFit: 'cover',
  },

  flexedRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: moderateScale(20),
    alignItems: 'center',
  },

  title: {
    fontSize: AppFontSize.intersize18,
    color: AppColors.buttonDarkBlue,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    //lineHeight: scale(16),
    marginBottom: moderateScale(2),
  },
  description: {
    fontSize: AppFontSize.intersize14,
    color: AppColors.textFieldTextBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    //lineHeight: scale(16),
  },
});

export default DeviceItem;
