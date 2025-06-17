import React, {useContext, useEffect} from 'react';
import {
  Alert,
  Appearance,
  Image,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppContext} from '../../context/AppContextProvider';
import {AppColors, themes} from '../../theme/AppColors';
import {StorageKeys} from '../../utils/StorageKeys.ts';
import {signUpToken} from '../../store/slices/authSlice';
import {screenDimensions} from '../../utils/ScreenDimensions';
import LinearGradient from 'react-native-linear-gradient';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {checkIsIpad} from '../movements/mocap/MocapConstants.tsx';
import {getModerateScaleSize} from '../../theme/AppFonts.tsx';

// TypeScript interfaces for response data and Redux state
interface ProfileResponse {
  data: {
    result: boolean;
    msg: string;
    data: any;
  };
}

interface RootState {
  onBoard: {
    value: {
      hidden: boolean;
    };
  };
}

interface AppContextProps {
  isTryingLogin: boolean;
  setIsTryingLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Splash() {
  const dispatch = useDispatch();
  const appContext = useContext(AppContext);
  const isIpad = checkIsIpad();

  if (!appContext) {
    throw new Error('AppContext must be used within an AppProvider');
  }
  const {isTryingLogin, setIsTryingLogin} = appContext;

  // Function to get user profile
  // async function getProfile(token: string) {
  //     try {
  //         const response: ProfileResponse = await getProfileData(token);
  //         if (response.data.result) {
  //             dispatch(addUserData(response.data.data));
  //         } else {
  //         }
  //     } catch (error: any) {
  //         throw error;
  //     }
  // }

  useEffect(() => {
    // Function to fetch token
    async function fetchToken() {
      try {
        const token = await AsyncStorage.getItem(StorageKeys.token);
        const role = await AsyncStorage.getItem(StorageKeys.role);
        if (token) {
          // await getProfile(token);
        }

        setTimeout(() => {
          dispatch(signUpToken({token: token, role: role}));
          setIsTryingLogin(false);
        }, 5000);
      } catch (e) {
        setTimeout(() => {
          setIsTryingLogin(false);
        }, 5000);
      }
    }

    fetchToken();

    // const interval = setInterval(() => {
    //   setIsTryingLogin(false);
    // }, 1000);

    // return () => clearInterval(interval); // Clear interval on unmount
  }, [dispatch, setIsTryingLogin]);

  // Theme and styles
  const colorScheme = useColorScheme();
  const appColor =
    colorScheme === 'dark' ? themes.DarkTheme : themes.LightTheme;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: {
      width: getModerateScaleSize(213),
      height: getModerateScaleSize(80),
    },
  });

  return (
    <LinearGradient colors={['#3125A7', '#1F1769']} style={styles.container}>
      <Image
        source={require('../../../assets/images/logowhite.png')}
        resizeMode="contain"
        style={styles.imageContainer}
      />
    </LinearGradient>
  );
}
