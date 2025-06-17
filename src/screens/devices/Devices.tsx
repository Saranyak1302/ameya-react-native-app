import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppStrings} from '../../utils/Constants';
import {AppColors} from '../../theme/AppColors';
import Header from '../../components/Header';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import {AppFonts, AppFontSize, AppWeights} from '../../theme/AppFonts.tsx';
import {FlatList} from 'react-native-gesture-handler';
import DeviceItem from '../../components/DeviceItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Menu, IconButton, PaperProvider} from 'react-native-paper';
// import {useHealth} from '../../hooks/useHealth.ts';
import {useFocusEffect} from '@react-navigation/native';
import {
  getHealthKitStatus,
  updateHealthKitSyncMode,
} from '../../services/devicesService.ts';
import {jwtDecode} from 'jwt-decode';
import {useSelector} from 'react-redux';
// import {syncService} from '../../services/health/syncService';
// import { foregroundSyncService } from '../../services/health/foregroundSyncService.ts';
import AlertModal from '../../components/AlertModal.tsx';
import {ProfileData} from '../../models/ProfileModel.ts';
import AlertModalMultiple from '../../components/AlertModalMutiple';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import BackgroundTaskManager from '../../native_modules/ios/HealthSyncModule';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import { navigateBack } from '../../navigators/utils/Utils.tsx';

type AlertButtons =
  | [{text: string; onPress?: () => void}]
  | [
      {text: string; onPress?: () => void},
      {text: string; onPress?: () => void},
    ];

  interface Device {
    serviceName: string;
    isActive: boolean;
  }

const Devices = () => {
  const route = useRoute<any>();
  const {
    successPopup = 0,
    brand,
    enableToggle = false,
    isFromHome = false,
  }: {
    successPopup: number;
    brand: string;
    enableToggle: Boolean;
    isFromHome: Boolean;
  } = route.params || {};
  // const {successPopup, brand} = route.params || {};
  const token = useSelector((state: any) => state?.auth?.token);
  const decodedToken = jwtDecode(token);
  const userID = decodedToken?.sub;
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState('daily');
  const [intevalTime, setIntevalTime] = useState(0);
  const [deviceResponse, setDeviceResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<AlertButtons>();
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteDeviceSel, setDeleteDevice] = useState('');
  //const {refreshData} = useHealth();
  const activeDevices = AsyncStorage.getItem('activeDevices');
  const profileData = useSelector((state: any) => state?.profile?.data);
  const [isFromHomeState, setIsFromHomeState] = useState(isFromHome);
  const getDeviceList = () => {
    const commonDevices = [
      {
        brand: 'Fitbit',
        deviceName: 'FITBIT',
        image: require('../../../assets/images/fitbiticon.png'),
      },
      {
        brand: 'Garmin',
        deviceName: 'GARMIN',
        image: require('../../../assets/images/garminicon.png'),
      },
      {
        brand: 'Apple',
        deviceName: 'APPLE',
        image: require('../../../assets/images/appleicon.png'),
      },
      {
        brand: 'Google',
        deviceName: 'GOOGLE',
        image: require('../../../assets/images/google.png'),
      }
    ];

    // Map over profileData.thirdParties and rename keys
    const thirdPartyDevices = profileData?.thirdParties
    ?.filter((device: Device) => {
      // Exclude Apple on Android and Google on iOS
      if (Platform.OS === 'ios' && device.serviceName === 'GOOGLE') return false;
      if (Platform.OS === 'android' && device.serviceName === 'APPLE') return false;
      return true;
    }).map((device: Device) => {
      // Find the matching device in the lookup array
      const matchingDevice = commonDevices.find(
        (d) => d.deviceName === device.serviceName
      );

      return {
        brand: matchingDevice?.brand, // Rename 'name' to 'brand'
        status: device.isActive ? 'Active' : 'Inactive', // Rename 'isActive' to 'status'
        deviceName: device.serviceName, // Keep 'serviceName' as 'deviceName'
        image: matchingDevice?.image || null, // Use the image from the lookup array or set to null
      };
    }) || [];
    return thirdPartyDevices;
  };
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          await getHealthKitStatuses();
          const lastSync = await AsyncStorage.getItem('lastSyncDateTime');
          //await fetchOrderData();
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      //syncService.performSync()
      fetchData();
    }, []),
  );

  useEffect(() => {
    const getSavedSyncMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('syncMode');
        if (savedMode) {
          setSelectedMode(savedMode);
        } else {
          setSelectedMode('daily');
        }
      } catch (error) {}
    };

    getSavedSyncMode();
  }, []);
  useEffect(() => {
    if (successPopup === 1) {
      let message = `${brand} connected successfully`;
      setAlertTitle(message);
      setShowAlert(true);
      setIsFromHomeState(true);
    }
  }, [route.params]);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleSyncModeChange = async (mode: string) => {
    const payload = {
      typeOfSync: mode.toUpperCase(),
    };

    try {
      await updateHealthKitSyncMode(payload);
      setSelectedMode(mode);
      await AsyncStorage.setItem('syncMode', mode);
      if (Platform.OS === 'ios') {
        BackgroundTaskManager.setSyncMode(mode);
        // foregroundSyncService.startSync(mode as 'realtime' | 'daily');
      }
      closeMenu();
    } catch (error) {}
  };

  const renderDeviceItem = ({item, index}: {item: any; index: number}) => (
    <DeviceItem
      item={item}
      isLastItem={index === getDeviceList().length - 1}
      deviceResponse={deviceResponse}
      setAlertTitle={setAlertTitle}
      setShowAlert={setShowAlert}
      setLoading={setLoading}
      setShowConfirmPopup={setShowConfirmPopup}
      deleteConfirm={deleteConfirm}
      setDeleteConfirm={setDeleteConfirm}
      deleteDeviceSel={deleteDeviceSel}
      setDeleteDevice={setDeleteDevice}
      enableToggle={enableToggle}
      activeDevices={activeDevices}
    />
  );
  // Get Health kit connection status
  const getHealthKitStatuses = async () => {
    try {
      const response = await getHealthKitStatus();
      setDeviceResponse(response);
      response.length > 0 &&
        handleSyncModeChange(
          response[0].typeOfSync === 'REALTIME' ? 'realtime' : 'daily',
        );
      //dispatch(addProfileData(response));
    } catch (error: any) {}
  };
  const updateHealthKitSync = async (mode: string) => {
    try {
      const data = {
        id: userID,
        //serviceName: Platform.OS === "android" ? "GOOGLECONNECT" : "APPLEHEALTHKIT",
        typeOfSync: mode.toUpperCase(),
        lastSyncDateTime: new Date(),
      };
      const response = await updateHealthKitSyncMode(data);
      //
      //response.length > 0 && handleSyncModeChange(response[0].typeOfSync === "REALTIME" ? "realtime" : "daily")
      //dispatch(addProfileData(response));
    } catch (error: any) {}
  };
  if (loading) {
    return (
      <SafeAreaView style={styles.loadContainer}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <PaperProvider>
        <View style={styles.scrollViewContent}>
          <Header
            title={AppStrings.devices}
            onBack={undefined}
            varient="TYPE9"
            rightComponent={
              <View style={styles.headerRight}>
                {/* <IconButton
                  icon="sync"
                  size={20}
                  iconColor={AppColors.buttonDarkBlue}
                  style={styles.syncIcon}
                /> */}
                <Text
                  style={styles.syncStyle}
                  maxFontSizeMultiplier={1.0}
                  numberOfLines={2}
                  adjustsFontSizeToFit>
                  Sync: {selectedMode === 'daily' ? 'Daily' : 'Real-time'}
                </Text>
                <Menu
                  visible={menuVisible}
                  onDismiss={closeMenu}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      size={moderateScale(24)}
                      onPress={openMenu}
                      iconColor={AppColors.buttonDarkBlue}
                      style={styles.menuIcon}
                    />
                  }>
                  <Menu.Item
                    onPress={() => handleSyncModeChange('daily')}
                    title="Daily"
                    leadingIcon={
                      selectedMode === 'daily'
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
                    }
                  />
                  <Menu.Item
                    onPress={() => handleSyncModeChange('realtime')}
                    title="Real-time"
                    leadingIcon={
                      selectedMode === 'realtime'
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
                    }
                  />
                </Menu>
              </View>
            }
          />
          <View style={styles.contentContainer}>
            <Text
              style={{
                marginBottom: verticalScale(20),
                marginHorizontal: 5,
                color: AppColors.textFieldTextBlack,
                fontSize: AppFontSize.intersize14,
                fontWeight: AppWeights.interMedium,
                fontFamily: AppFonts.interMedium,
              }}>
              This app requires access to data from your wearable device to
              provide personalized health insights. Your personal data is
              encrypted to ensure its security. We will only collect and process
              your information after obtaining your explicit consent, and you
              can manage or withdraw this consent at any time through the
              settings below.
            </Text>

            <Text
              style={{
                marginBottom: verticalScale(20),
                marginHorizontal: 5,
                color: AppColors.descriptionLightGrey,
                fontSize: AppFontSize.intersize14,
                fontWeight: AppWeights.interMedium,
                fontFamily: AppFonts.interMedium,
              }}>
              Devices
            </Text>
            <FlatList
              data={getDeviceList()}
              renderItem={renderDeviceItem}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={() => (
                <View style={styles.noText}>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={styles.noTaskText}>
                    No devices available
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </PaperProvider>
      {showAlert && (
        <AlertModal
          alertModalVisible={showAlert}
          title={alertTitle}
          message={alertMessage}
          buttons={
            alertButtons && alertButtons.length > 0 ? alertButtons : undefined
          }
          onClose={() => {
            setAlertTitle('');
            setAlertMessage('');
            setAlertButtons(undefined);
            setShowAlert(false);
            //navigation.navigate(NavigatorNames.profile as never);
            getHealthKitStatuses();
            if (isFromHomeState) {
              navigateBack();
            }
          }}
        />
      )}
      {showConfirmPopup && (
        <AlertModalMultiple
          alertModalVisible={showConfirmPopup}
          title={''}
          message={
            'Are you sure you want to disconnect the device?'
          }
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
                setLoading(true);
                setDeleteConfirm(true);
                setShowConfirmPopup(false);
              },
            },
          ]}
          onClose={() => {
            setShowConfirmPopup(false);
            setLoading(false);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  loadContainer: {
    flex: 1,
    backgroundColor: AppColors.greyWhite,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: AppColors.greyWhite,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  syncStyle: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    color: AppColors.buttonDarkBlue,
    width: moderateScale(100),
    flexWrap: 'wrap',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 24 : 12,
    borderTopRightRadius: isTablet ? 24 : 12,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(24),
  },

  personalInfoHeading: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonDarkBlue,
    paddingBottom: moderateScale(12),
    borderBottomColor: AppColors.textFieldBorderGrey,
    borderBottomWidth: moderateScale(1),
    fontFamily: AppFonts.interSemibold,
    marginBottom: moderateScale(24),
  },
  infoContainer: {
    marginBottom: moderateScale(32),
  },
  infoName: {
    fontSize: AppFontSize.intersize14,
    color: AppColors.textFieldHeading,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    marginBottom: moderateScale(10),
  },
  infoValue: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIcon: {
    margin: 0,
    marginRight: moderateScale(-8),
  },
  menuIcon: {
    margin: 0,
    padding: 0,
  },
  noText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTaskText: {
    fontSize: AppFontSize.intersize14,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    textAlign: 'center',
    color: '#6E6E6E',
  },
});

export default Devices;
