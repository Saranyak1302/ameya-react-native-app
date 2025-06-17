import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import {screenDimensions} from '../../utils/ScreenDimensions';
import {AppColors} from '../../theme/AppColors';
import {navigate, navigateBack} from '../../navigators/utils/Utils';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../../theme/AppFonts';
import {RFC_2822} from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../utils/StorageKeys';
import {HcpOrgInfo} from '../../models/HcpOrgModel';
import {RootState} from '@reduxjs/toolkit/dist/query';
import {useDispatch, useSelector} from 'react-redux';
import {toTitleCase} from '../../utils/Helper';
import {logout} from '../../store/slices/authSlice';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

export default function HcpProfile() {
  const dispatch = useDispatch();

  const hcpData: HcpOrgInfo | null = useSelector(
    (state: RootState) => state.hcpOrg.data,
  );
  const isFocused = useIsFocused();
  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        setTimeout(() => {
          if (hcpData === null) {
            doLogOut();
          }
        }, 200);

        return () => {};
      }
    }, []),
  );
  async function doLogOut() {
    try {
      await AsyncStorage.removeItem(StorageKeys.token);
      await AsyncStorage.removeItem(StorageKeys.role);
      // @ts-ignore
      dispatch(logout());
    } catch (error) {}
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: AppColors.lightBlue,
        flexDirection: 'column',
        flex: 1,
      }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            navigateBack();
          }}
          style={styles.backIconWrapper}>
          <Image
            source={require('../../../assets/images/leftarrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.titleText} maxFontSizeMultiplier={1.3}>
          Profile
        </Text>
        <TouchableOpacity
          onPress={() => {
            doLogOut();
          }}
          style={styles.logoutIconWrapper}>
          <Image
            source={require('../../../assets/images/hcplogout.png')}
            style={styles.logoutIcon}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          backgroundColor: AppColors.white,
          flex: 1,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}>
        <View style={styles.container}>
          {/* Circular Profile Icon */}
          <Image
            source={require('../../../assets/images/profilecircle.png')}
            style={styles.profileIcon}
          />

          {/* Name and Title */}
          <View style={styles.textContainer}>
            <Text maxFontSizeMultiplier={1.3} style={styles.name}>
              {toTitleCase(
                (hcpData ? hcpData.firstName : '') +
                  ' ' +
                  (hcpData ? hcpData.lastName : ''),
              )}
            </Text>
            {/* <Text style={styles.subtitle}>Healthcare Professional</Text> */}
          </View>
        </View>

        <View style={styles.listContainer}>
          {/* Title */}
          <Text maxFontSizeMultiplier={1.3} style={styles.title}>
            Details
          </Text>
          <View style={styles.separator} />

          {/* Detail Items */}
          <View style={styles.detailItem}>
            <Text maxFontSizeMultiplier={1.3} style={styles.label}>
              Ameya ID
            </Text>
            <Text maxFontSizeMultiplier={1.3} style={styles.value}>
              {hcpData ? hcpData.ameyaId : ''}
            </Text>
          </View>
          {/* <View style={styles.detailItem}>
        <Text style={styles.label}>Sex & Pronouns</Text>
        <Text style={styles.value}>She/Her</Text>
      </View> */}
          <View style={styles.detailItem}>
            <Text maxFontSizeMultiplier={1.3} style={styles.label}>
              Phone Number
            </Text>
            <Text maxFontSizeMultiplier={1.3} style={styles.value}>
              {hcpData ? hcpData.phoneNumber : ''}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text maxFontSizeMultiplier={1.3} style={styles.label}>
              Email
            </Text>
            <Text maxFontSizeMultiplier={1.3} style={styles.value}>
              {hcpData ? hcpData.email.toLowerCase() : ''}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // This ensures the image is horizontally centered
    alignItems: 'center', // This vertically centers both items
    height: verticalScale(50), // Set a height for the header if necessary
    position: 'relative',
  },
  backIconWrapper: {
    width: verticalScale(30),
    height: verticalScale(30),
    marginLeft: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    width: verticalScale(20),
    height: verticalScale(20),
    objectFit: 'contain',
  },
  titleText: {
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize22,
    textAlign: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row', // Horizontal layout
    alignItems: 'center', // Align items vertically centered
    padding: moderateScale(20),
    paddingTop: moderateScale(25), // Add padding around the container
    backgroundColor: 'transparent', // Background color
  },
  profileIcon: {
    width: verticalScale(48),
    height: verticalScale(48),
    borderRadius: moderateScale(25), // Makes it circular
    //backgroundColor: '#4a4a8a', // Circle color
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff', // White text for the placeholder icon
    fontSize: AppFontSize.intersize22, // Icon size
  },
  textContainer: {
    marginLeft: moderateScale(16), // Space between icon and text
  },
  name: {
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize22,
    marginBottom: moderateScale(3),
  },
  subtitle: {
    color: AppColors.lightGrey,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize18,
  },
  listContainer: {
    padding: moderateScale(20),
    backgroundColor: '#fff', // Background color
  },
  title: {
    color: AppColors.buttonDarkBlue,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize18,
    marginBottom: moderateScale(16),
  },
  separator: {
    height: verticalScale(1),
    backgroundColor: AppColors.borderGrey, // Light gray separator
    marginBottom: moderateScale(16),
  },
  detailItem: {
    marginBottom: moderateScale(16), // Spacing between items
  },
  label: {
    color: AppColors.textFieldHeading,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize14, // Gray color for the label
    marginBottom: moderateScale(4),
  },
  value: {
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize16,
  },
  logoutIconWrapper: {
    width: verticalScale(30),
    height: verticalScale(30),
    marginRight: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  logoutIcon: {
    width: verticalScale(30),
    height: verticalScale(30),
    objectFit: 'contain',
  },
});
