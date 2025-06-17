/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Platform} from 'react-native';
import {AppColors} from '../../theme/AppColors.tsx';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import Header from '../../components/Header.tsx';
import {AppStrings} from '../../utils/Constants.tsx';
import GlobalStyles from '../../styles/GlobalStyles.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../utils/StorageKeys.ts';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../../store/slices/authSlice.ts';
import ProfileItemsList from '../../components/ProfileItemsList';
import {useNavigation} from '@react-navigation/native';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames.tsx';
import {
  AppFonts,
  AppFontSize,
  getModerateScaleSize,
} from '../../theme/AppFonts.tsx';
import {getFirstCharacter} from '../../utils/Helper.tsx';
import AlertModalMultiple from '../../components/AlertModalMutiple';
import {logoutApi} from '../../services/authService.ts';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

function Profile() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const profileData = useSelector((state: any) => state?.profile?.data);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const postLogout = async () => {
    try {
      const response = await logoutApi(profileData?.ameyaId);
      console.log('logout api response', response);
      // doLogOut();
      await AsyncStorage.removeItem(StorageKeys.token);
      await AsyncStorage.removeItem(StorageKeys.role);
      await AsyncStorage.removeItem(StorageKeys.hasShownHealthKitBottomSheet);
      // @ts-ignore
      dispatch(logout());
    } catch (err: any) {
      console.log('logout api failed', err);
    }
  };

  const handleProfileItemAction = (title: string) => {
    switch (title) {
      case 'Personal Info':
        navigation.navigate(NavigatorNames.personalInfo as never);
        break;
      // case 'Archive':
      //navigation.navigate(NavigatorNames.archive as never);
      // break;
      case 'Devices':
        navigation.navigate(NavigatorNames.devices as never);
        break;
      case 'Health Data':
        navigation.navigate(NavigatorNames.healthData as never);
        break;
      case 'Privacy Notice':
        navigation.navigate(NavigatorNames.privacyNotice as never);
        break;
      case 'Terms of Service':
        navigation.navigate(NavigatorNames.termsOfUse as never);
        break;
      case 'Logout':
        setShowConfirmPopup(true);
        break;
      default:
    }
  };

  const profileItems: any = [
    {
      icon: require('../../../assets/images/usericon.png'),
      title: 'Personal Info',
      action: () => handleProfileItemAction('Personal Info'),
    },
    // {
    //   icon: require('../../../assets/images/saveicon.png'),
    //   title: 'Archive',
    //   action: () => handleProfileItemAction('Archive'),
    // },
    {
      icon: require('../../../assets/images/activityicon.png'),
      title: 'Devices',
      action: () => handleProfileItemAction('Devices'),
    },
    // ...(Platform.OS === 'android' ? [{
    //   icon: require('../../../assets/images/activityicon.png'),
    //   title: 'Health Data',
    //   action: () => handleProfileItemAction('Health Data'),
    // }] : []),
    {
      icon: require('../../../assets/images/lockicon.png'),
      title: 'Privacy Notice',
      action: () => handleProfileItemAction('Privacy Notice'),
    },
    {
      icon: require('../../../assets/images/termsicon.png'),
      title: 'Terms of Service',
      action: () => handleProfileItemAction('Terms of Service'),
    },
    {
      icon: require('../../../assets/images/logouticon.png'),
      title: 'Logout',
      action: () => handleProfileItemAction('Logout'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollViewContent}>
        <View style={{alignSelf: 'center'}}>
          <Header
            title={AppStrings.profileSettings}
            onBack={undefined}
            showBackButton={false}
            varient="TYPE1"
          />
        </View>
        {/* Profile Details  */}
        <View style={styles.profileDetailsContainer}>
          <View style={styles.profileImageContainer}>
            <Text maxFontSizeMultiplier={1.3} style={styles.profileInitials}>
              {getFirstCharacter(profileData?.firstName) +
                getFirstCharacter(profileData?.lastName)}
            </Text>
          </View>
          <Text
            maxFontSizeMultiplier={1.4}
            style={[GlobalStyles.titleHeadingText, {marginBottom: 6}]}>
            {profileData
              ? profileData?.firstName + ' ' + profileData?.lastName
              : '---'}
          </Text>
          <Text maxFontSizeMultiplier={1.4} style={GlobalStyles.textFieldText}>
            {profileData ? profileData?.email : '---'}
          </Text>
        </View>

        {/* Profile Item List  */}
        <View style={styles.subContainer}>
          <ProfileItemsList items={profileItems} />
        </View>
      </View>
      {showConfirmPopup && (
        <AlertModalMultiple
          alertModalVisible={showConfirmPopup}
          title={''}
          message={'Are you sure you want to logout? '}
          buttons={[
            {
              text: 'No',
              onPress: () => {
                setShowConfirmPopup(false);
              },
            },
          ]}
          buttonsExtra={[
            {
              text: 'Yes',
              onPress: async () => {
                // doLogOut();
                postLogout();
                setShowConfirmPopup(false);
              },
            },
          ]}
          onClose={() => {
            setShowConfirmPopup(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.greyWhite,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  subContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 24 : 12,
    borderTopRightRadius: isTablet ? 24 : 12,
    marginTop: moderateScale(18),
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(16),
  },

  profileDetailsContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: moderateScale(0),
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(10),
    // backgroundColor: AppColors.white,
  },
  profileImageContainer: {
    backgroundColor: '#E0E0EB',
    height: verticalScale(120),
    width: verticalScale(120),
    borderRadius: moderateScale(100),
    borderWidth: moderateScale(2),
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: moderateScale(16),
  },

  profileInitials: {
    fontFamily: AppFonts.interRegular,
    fontSize: AppFontSize.intersize52,
    color: AppColors.buttonDarkBlue,
  },

  uploadIcon: {
    height: verticalScale(20),
    width: verticalScale(20),
  },
});

export default Profile;
