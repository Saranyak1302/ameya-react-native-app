/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  Dimensions,
  Image,
  View,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import {AppColors} from '../../theme/AppColors';
import {NavigatorNames} from './NavigatorsNames';
import Home from '../../screens/home/Home';
import Profile from '../../screens/profile/Profile';
import MyReports from '../../screens/my_reports/MyReports.tsx';
import Message from '../../screens/message/Message.tsx';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../../theme/AppFonts.tsx';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import DeviceInfo from 'react-native-device-info';

const {height} = Dimensions.get('screen');

const Tab = createBottomTabNavigator();

export default function TabsStack() {
  useFocusEffect(
    useCallback(() => {
      console.log('tab stack called');
      // SystemNavigationBar.leanBack();
    }, []),
  );
  return (
    <Tab.Navigator
      screenOptions={({route}): BottomTabNavigationOptions => ({
        tabBarStyle: {
          backgroundColor: AppColors.buttonDarkBlue,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          height: DeviceInfo.isTablet()
            ? getModerateScaleSize(80)
            : verticalScale(70),
        },
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        // tabBarLabelStyle: {
        //   marginBottom:
        //     Platform.OS === 'ios'
        //       ? 0
        //       : 18,
        //   fontFamily: AppFonts.interRegular,
        //   fontSize: 11,
        //   fontWeight: '600',
        // },
        tabBarLabel: ({focused, color}) => (
          <Text
            maxFontSizeMultiplier={1.3}
            style={{
              marginBottom: Platform.OS === 'ios' ? verticalScale(5) : 25,
              fontFamily: focused
                ? AppFonts.interSemibold
                : AppFonts.interMedium,
              fontSize: AppFontSize.intersize11,
              fontWeight: focused
                ? AppWeights.interSemibold
                : AppWeights.interMedium,
              color: color,
            }}>
            {route.name}
          </Text>
        ),
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? 2 : 4,
        },
        tabBarActiveTintColor: AppColors.white,
        tabBarInactiveTintColor: AppColors.violet,
        tabBarIcon: ({focused}) => {
          if (route.name === NavigatorNames.home) {
            return (
              <View style={styles.bottomIconView}>
                {focused ? (
                  <Image
                    source={require('../../../assets/images/homeselected.png')}
                    style={[
                      {height: moderateScale(20), width: moderateScale(20)},
                    ]}
                  />
                ) : (
                  <Image
                    source={require('../../../assets/images/homeunselected.png')}
                    style={[
                      {height: moderateScale(20), width: moderateScale(20)},
                    ]}
                  />
                )}
              </View>
            );
          } else if (route.name === NavigatorNames.profile) {
            return (
              <View style={styles.bottomIconView}>
                {focused ? (
                  <Image
                    source={require('../../../assets/images/profileselected.png')}
                    style={[
                      {height: moderateScale(20), width: moderateScale(20)},
                    ]}
                  />
                ) : (
                  <Image
                    source={require('../../../assets/images/profileunselected.png')}
                    style={[
                      {height: moderateScale(20), width: moderateScale(20)},
                    ]}
                  />
                )}
              </View>
            );
          } else if (route.name === NavigatorNames.myReports) {
            return (
              <View style={styles.bottomIconView}>
                {focused ? (
                  <Image
                    source={require('../../../assets/images/statsselected.png')}
                    style={[
                      {height: moderateScale(20), width: moderateScale(20)},
                    ]}
                  />
                ) : (
                  <Image
                    source={require('../../../assets/images/statsunselected.png')}
                    style={[
                      {height: moderateScale(20), width: moderateScale(20)},
                    ]}
                  />
                )}
              </View>
            );
          } else if (route.name === NavigatorNames.message) {
            return (
              <View style={styles.bottomIconView}>
                {focused ? (
                  <Image
                    source={require('../../../assets/images/messageselected.png')}
                    style={[
                      {height: moderateScale(20), width: moderateScale(20)},
                    ]}
                  />
                ) : (
                  <Image
                    source={require('../../../assets/images/messageunselected.png')}
                    style={[
                      {height: moderateScale(20), width: moderateScale(20)},
                    ]}
                  />
                )}
              </View>
            );
          }
          return null;
        },
      })}>
      <Tab.Screen
        name={NavigatorNames.home}
        options={{headerShown: false}}
        component={Home}
      />
      <Tab.Screen
        name={NavigatorNames.myReports}
        options={{headerShown: false}}
        component={MyReports}
      />
      {/* <Tab.Screen
        name={NavigatorNames.message}
        options={{headerShown: false}}
        component={Message}
      /> */}
      <Tab.Screen
        name={NavigatorNames.profile}
        options={{headerShown: false}}
        component={Profile}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bottomIconView: {
    // width: 20,
    // height: 20,
  },
});
