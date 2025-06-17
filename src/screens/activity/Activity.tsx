import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {AppColors} from '../../theme/AppColors';
import Header from '../../components/Header';
import {AppStrings} from '../../utils/Constants';
import {AppFonts, AppFontSize, AppWeights, getModerateScaleSize} from '../../theme/AppFonts';
import {RouteProp, useRoute} from '@react-navigation/native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

type RouteParams = {
  devices?: {id: string; serviceName: string; deviceName?: string}[];
};

type ServiceMappingType = {
  [key: string]: {
    style: any; // Adjust to your actual style type
    source: any; // Adjust to your actual image source type
    tintColor: string | undefined;
  };
};

type ActivityRouteProp = RouteProp<{params: RouteParams}, 'params'>;

const Activity = ({}) => {
  const {params} = useRoute<ActivityRouteProp>();
  const devices = params?.devices ?? [];

  const serviceMapping: ServiceMappingType = {
    apple: {
      style: styles.deviceImgApple,
      source: require('../../../assets/images/appleicon.png'),
      tintColor: undefined,
    },
    samsung: {
      style: styles.deviceImgSamsung,
      source: require('../../../assets/images/samsung.png'),
      tintColor: undefined,
    },
    fitbit: {
      style: styles.deviceImgApple,
      source: require('../../../assets/images/fitbit.png'),
      tintColor: undefined,
    },
    garmin: {
      style: styles.deviceImgApple,
      source: require('../../../assets/images/garmin.png'),
      tintColor: undefined,
    },
    default: {
      style: styles.deviceImg,
      source: require('../../../assets/images/watch.png'),
      tintColor: AppColors.buttonDarkBlue,
    },
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header varient="TYPE2" title={'Connected Devices'} />
      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.gapBottom,
          devices?.length === 0 && styles.centeredContainer,
        ]}>
        {devices?.length > 0 ? (
          devices?.map(item => {
            const serviceName = item.serviceName.trim().toLowerCase();
            const {style, source, tintColor} =
              serviceMapping[serviceName] || serviceMapping.default;

            return (
              <View key={item.id} style={styles.deviceSection}>
                <View style={styles.deviceImgContainer}>
                  <Image
                    resizeMode="contain"
                    style={style}
                    source={source}
                    tintColor={tintColor}
                  />
                </View>
                <View style={styles.deviceNameSection}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.deviceName}>
                    {item.serviceName}
                  </Text>
                  <Text maxFontSizeMultiplier={1.3} style={styles.deviceDesc}>
                    {item?.deviceName
                      ? item?.deviceName + ' Connected'
                      : AppStrings.connected}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text maxFontSizeMultiplier={1.3} style={styles.emptyText}>
              {AppStrings.noDevices}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Activity;

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.lightPink,
  },
  body: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 30 : 20,
    borderTopRightRadius: isTablet ? 30 : 20,
    marginTop: moderateScale(10),
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(24),
    paddingTop: moderateScale(14),
  },
  deviceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(20),
    paddingVertical: moderateScale(20),
  },
  deviceImgContainer: {
    width: verticalScale(40),
    height: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.bgLightGrey,
    borderRadius: moderateScale(10),
  },
  deviceImg: {
    width: moderateScale(11),
    height: moderateScale(16),
  },
  deviceImgApple: {
    width: verticalScale(24),
    height: verticalScale(24),
  },
  deviceImgSamsung: {
    width: moderateScale(27),
    height: moderateScale(16),
  },
  deviceNameSection: {},
  deviceName: {
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize18,
    color: AppColors.textHeadingBlack,
    textTransform: 'capitalize',
  },
  deviceDesc: {
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize18,
    color: AppColors.textFieldHeading,
    textTransform: 'capitalize',
  },
  gapBottom: {paddingBottom: moderateScale(40)},
  centeredContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize16,
    color: AppColors.textFieldHeading,
  },
});
