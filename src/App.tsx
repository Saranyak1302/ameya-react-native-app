import React, {useEffect, useCallback, useState, useRef} from 'react';
import {AppProvider} from './context/AppContextProvider.tsx';
import ApplicationNavigator from './navigators/utils/Application.tsx';
import {Provider} from 'react-redux';
import {
  Platform,
  AppState,
  AppStateStatus,
  PermissionsAndroid,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import {store} from './store/Store.ts';
import {usePassioConfig} from './screens/passioAuth/usePassioAuthConfig';
import {jwtDecode} from 'jwt-decode';
import crashlytics from '@react-native-firebase/crashlytics';
import firebase from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {syncService} from './services/health/syncService';
import {getHealthKitStatus} from './services/devicesService.ts';
import {StorageKeys} from './utils/StorageKeys.ts';
import {getData} from './utils/LocalStorage.tsx';
import healthService from './services/health/healthService.ts';
// import {useHealth} from './hooks/useHealth';
import {useFocusEffect} from '@react-navigation/native';
import BackgroundFetch from 'react-native-background-fetch';
import {getGrantedPermissions} from 'react-native-health-connect';
import messaging from '@react-native-firebase/messaging';
import NoInternet from './components/NoInternet.tsx';
import {refresh, useNetInfoInstance} from '@react-native-community/netinfo';
// import {foregroundSyncService} from './services/health/foregroundSyncService';
import AlertModal from './components/AlertModal.tsx';
import {AlertButtons} from './types/CommonTypes.tsx';
import {navigate} from './navigators/utils/Utils.tsx';
import {NavigatorNames} from './navigators/tabs/NavigatorsNames.tsx';
import BackgroundTaskManager from './native_modules/ios/HealthSyncModule';
import HealthSyncEventEmitter from './native_modules/ios/HealthSyncEventEmitter.ts';

function App() {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  // AlertModal
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<AlertButtons>();
  const [isOffline, setOffline] = useState(false);
  const isActive = useRef(true);
  // const {refreshData} = useHealth();
  const {
    netInfo: {isInternetReachable},
  } = useNetInfoInstance();

  // TO fix bug related No Internet popup when app is resumed from background
  useEffect(() => {
    if (isInternetReachable === false) {
      if (isActive.current) {
        setTimeout(() => {
          refresh().then(state => {
            if (state?.isInternetReachable === false) {
              setOffline(true);
            }
          });
          isActive.current = false;
        }, 5000);
      } else {
        setOffline(true);
      }
    } else {
      setOffline(false);
    }
  }, [isInternetReachable]);

  // const dispatch = useDispatch();
  const {isReady, error} = usePassioConfig({
    key: 'dJDgDJX2yieYjpZdhFNYQFd4InQe0igSqvu4LVVE',
  });

  const firebaseConfig = {
    apiKey: 'AIzaSyA7MtseBaMOZG168x6nFe16yjLyqMeJePs',
    authDomain: 'ameya-62ed5.firebaseapp.com',
    projectId: 'ameya-62ed5',
    appId: '1:568522284612:ios:83ae860ab491fccf2d6611',
  };

  const requestUserPermission = async () => {
    try {
      let authStatus = messaging.AuthorizationStatus.NOT_DETERMINED;
      if (Platform.OS === 'ios') {
        authStatus = await messaging().requestPermission();
      } else if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          authStatus =
            granted === PermissionsAndroid.RESULTS.GRANTED
              ? messaging.AuthorizationStatus.AUTHORIZED
              : messaging.AuthorizationStatus.DENIED;
        } else {
          // For Android < 13, notifications are enabled by default
          authStatus = messaging.AuthorizationStatus.AUTHORIZED;
        }
      }

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          await AsyncStorage.setItem('fcmToken', fcmToken);
        } else {
          // Failed to get FCM token
        }
      } else {
        // Notification permission not granted
      }
    } catch (e) {
      // Error requesting notification permissions
    }
  };

  const handleForegroundNotifications = () => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      setAlertTitle(remoteMessage?.notification?.title || 'New Notification');
      setAlertMessage(
        remoteMessage?.notification?.body || 'You have a new message.',
      );
      setAlertButtons([
        {
          text: 'Ok',
          onPress: () => {
            if (
              remoteMessage?.notification?.title?.includes('Survey') &&
              remoteMessage?.data?.link
            ) {
              // navigate(NavigatorNames.surveyWebView, {
              //   surveyUrl: remoteMessage?.data?.link,
              // });
              navigate(NavigatorNames.surveyList,{isFromTodaysTask: false,isFromTodaysItem: {}});
            }
          },
        },
      ]);
      setShowAlert(true);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const initializeMessaging = async () => {
      await requestUserPermission();
      const unsubscribeOnMessage = handleForegroundNotifications();

      messaging().setBackgroundMessageHandler(async remoteMessage => {});

      return unsubscribeOnMessage;
    };
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (
        remoteMessage?.notification?.title?.includes('Survey') &&
        remoteMessage?.data?.link
      ) {
        // navigate(NavigatorNames.surveyWebView, {
        //   surveyUrl: remoteMessage?.data?.link,
        // });
        navigate(NavigatorNames.surveyList,{isFromTodaysTask: false,isFromTodaysItem: {}});
      }
    });

    initializeMessaging();

    return () => {
      messaging().onTokenRefresh(async newToken => {
        await AsyncStorage.setItem('fcmToken', newToken);
      });
    };
  }, []);

  // const initializeSync = async () => {
  //   const syncMode = (await AsyncStorage.getItem('syncMode')) || 'daily';
  //   if (Platform.OS === 'ios') {
  //     syncService.performSync();
  //     foregroundSyncService.startSync(syncMode as 'realtime' | 'daily');
  //   }
  // };

  useEffect(() => {
    initializeApp();
    // initializeSync();

    // return () => {
    //   if (Platform.OS === 'ios') {
    //     foregroundSyncService.stopSync();
    //   }
    // };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const eventEmitter = new NativeEventEmitter(HealthSyncEventEmitter);
      
      const subscription = eventEmitter.addListener(
        'HealthKitErrorNotification',
        (error) => {
          AsyncStorage.setItem('isHealthKitError', 'true');
          AsyncStorage.setItem('HealthKitErrorReason', JSON.stringify(error));
        }
      );
      
      return () => {
        subscription.remove();
      };
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log("App mounted")
        if (Platform.OS === 'ios') {
          let isDeviceActive = await AsyncStorage.getItem('isDeviceActive');
          if (isDeviceActive === 'true') {
            BackgroundTaskManager.syncHealthData();
          }
        }
        // initializeSync();
      } else if (
        nextAppState.match(/inactive|background/) &&
        Platform.OS === 'ios'
      ) {
        // foregroundSyncService.stopSync();
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const initializeApp = async () => {
    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      crashlytics().log('App mounted.');
    } else {
      firebase.app();
    }

    // Add this section to get and save token
    if (Platform.OS === 'ios') {
      const token = await AsyncStorage.getItem(StorageKeys.token);
      if (token) {
        BackgroundTaskManager.saveToken(token);
        console.log("App mounted token", token)
      }
    }

    // const activeDevices = await AsyncStorage.getItem('activeDevices');
    // if (activeDevices) {
    //   const isDeviceSelected =
    //     Platform.OS === 'ios'
    //       ? JSON.parse(activeDevices).includes('Apple')
    //       : JSON.parse(activeDevices).includes('Google');
    //   const isHealthKitActive = await healthService.isAvailable();
    //   if (isDeviceSelected && isHealthKitActive) {
    //     // await healthService.initialize();
    //     if (Platform.OS === 'android') {
    //       const permissions = await readGrantedPermissions();
    //       console.log('permissions', permissions);
    //       if (!permissions?.length) {
    //         await AsyncStorage.setItem('isHealthKitError', 'true');
    //       } else {
    //         await refreshData();
    //       }
    //     }
    //   }
    // };

    // let bgStatus = await AsyncStorage.getItem('backgroundStatus');
    //bgStatus !== "2" &&
    if (Platform.OS === 'android') {
      syncService.configureBackgroundSync();
    }
  };

  return (
    <Provider store={store}>
      <AppProvider>
        <ApplicationNavigator />
      </AppProvider>
      {/* Modal to show No Internet popup which blocks whole app */}
      {isOffline && <NoInternet />}
      {showAlert && (
        <AlertModal
          alertModalVisible={showAlert}
          title={alertTitle}
          message={alertMessage}
          buttons={alertButtons}
          column
          onClose={() => {
            setShowAlert(false);
            setAlertTitle('');
          }}
        />
      )}
    </Provider>
  );
}

export default App;
