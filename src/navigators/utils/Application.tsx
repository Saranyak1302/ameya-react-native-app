import React, {useContext, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {navigate, navigateBack, navigationRef} from './Utils.tsx';
import {NavigatorNames} from '../tabs/NavigatorsNames.tsx';
import Splash from '../../screens/splash/Splash.tsx';
import AuthenticatedStack from './AuthenticatedStack.tsx';
import AuthStack from './AuthStack.tsx';
import {AppContext} from '../../context/AppContextProvider.tsx';
import {AppStrings} from '../../utils/Constants';
import HcpAuthenticatedStack from './HcpAuthenticatedStack';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import AlertModal from '../../components/AlertModal.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../utils/StorageKeys.ts';
import {logout} from '../../store/slices/authSlice.ts';

const AppStack: any = createStackNavigator();

const ApplicationNavigator = () => {
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error('AppContext must be used within an AppProvider');
  }

  const {isTryingLogin} = appContext;
  const userToken = useSelector((state: any) => state.auth.token);
  const role = useSelector((state: any) => state.auth.role);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isTryingLogin && userToken && role === AppStrings.participant) {
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (
            remoteMessage?.notification?.title?.includes('Survey') &&
            remoteMessage?.data?.link
          ) {
            setTimeout(() => {
              // navigate(NavigatorNames.surveyWebView, {
              //   surveyUrl: remoteMessage?.data?.link,
              // });
              navigate(NavigatorNames.surveyList, {
                isFromTodaysTask: false,
                isFromTodaysItem: {},
              });
            }, 500);
          }
        });
    }
  }, [isTryingLogin, userToken, role]);
  async function doLogOut() {
    try {
      await AsyncStorage.removeItem(StorageKeys.token);
      await AsyncStorage.removeItem(StorageKeys.role);
      setTimeout(() => {
        dispatch(logout());
      });
    } catch (error) {}
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isTryingLogin ? (
        <SplashStack />
      ) : userToken && role === AppStrings.participant ? (
        <AuthenticatedStack />
      ) : userToken &&
        role !== AppStrings.participant &&
        Platform.OS === 'android' ? (
        <AlertModal
          alertModalVisible={true}
          title={
            "You don't have admin access. Redirecting to the sign-in screen"
          }
          onClose={() => {
            doLogOut();
          }}
        />
      ) : userToken &&
        role !== AppStrings.participant &&
        Platform.OS !== 'android' ? (
        <HcpAuthenticatedStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export const SplashStack = () => {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name={NavigatorNames.splash}
        component={Splash}
        options={{headerShown: false}}
      />
    </AppStack.Navigator>
  );
};

export default ApplicationNavigator;
