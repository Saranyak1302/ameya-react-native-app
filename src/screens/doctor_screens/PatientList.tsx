import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';
import React, {useState, useCallback, useEffect} from 'react';
import {screenDimensions} from '../../utils/ScreenDimensions';
import {AppColors} from '../../theme/AppColors';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../../theme/AppFonts';
import {navigate, navigateBack} from '../../navigators/utils/Utils';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AmeyaLoader from '../../components/AmeyaLoader';
import {TextInput} from 'react-native-gesture-handler';
import {AppStrings} from '../../utils/Constants';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames';
import {
  getOrganizationDetailsByID,
  getParticipantsList,
} from '../../services/hcpService';
import {getData} from '../../utils/LocalStorage';
import {StorageKeys} from '../../utils/StorageKeys';
import {fetchHcpOrgSuccess} from '../../store/slices/hcpOrgSlice';
import {HcpOrgInfo} from '../../models/HcpOrgModel';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@reduxjs/toolkit/dist/query';
import {
  getDoctorOrPatintById,
  checkIsIpad,
} from '../movements/mocap/MocapConstants';
import {pushNotification} from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import {logout} from '../../store/slices/authSlice';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import AlertModal from '../../components/AlertModal.tsx';

export default function PatientList() {
  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState(
    'We are authenticating...',
  );

  const hcpData: HcpOrgInfo | null = useSelector(
    (state: RootState) => state.hcpOrg.data,
  );

  const [clinicOpen, setClinicOpen] = useState(false);
  const [cohortWarn, setCohortWarn] = useState(false);
  const [clinicValue, setClinicValue] = useState('');
  const [clinicItems, setClinicItems] = useState([]);

  const [cohortOpen, setCohortOpen] = useState(false);
  const [cohortValue, setCohortValue] = useState('');
  const [cohortId, setCohortId] = useState('');
  const doctorDetails: HcpOrgInfo = useSelector(
    (state: any) => state.hcpOrg.data,
  );
  const [videosCount, setVideosCount] = useState(0);
  type CohortItem = {
    id: string;
    label: string;
    canListOrder: boolean;
  };

  type Participant = {
    id: string;
    ameyaId: string;
    startDate: string;
    endDate: string;
    participant: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };

  const [cohortItems, setCohortItems] = useState<CohortItem[]>([]);

  const [searchText, setSearchText] = useState('');

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState(1);
  const [filterItems, setFilterItems] = useState([
    {label: 'All', id: 1},
    {label: 'To Do', id: 2},
    {label: 'Completed', id: 3},
    // {label: 'Partially Completed', id: 4},
  ]);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const isIpad = checkIsIpad();
  const filteredParticipants = participants
    ? participants.filter(patient =>
        `${patient.participant.firstName} ${patient.participant.lastName}`
          .toLowerCase()
          .includes(searchText.toLowerCase()),
      )
    : participants;
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        fetchOrgData();
        setSearchText('');
      }
    }, []),
  );

  const fetchOrgData = async () => {
    setLoading(true);
    try {
      const userId = await getData({key: StorageKeys.lastSignedUser});

      setLoading(false);
      if (userId) {
        const response = await getOrganizationDetailsByID(userId);

        // send fcm
        try {
          const ameyaId = response?.ameyaId;
          const fcmToken = await AsyncStorage.getItem('fcmToken');
          if (ameyaId && fcmToken) {
            const data = {
              ameyaId: response.ameyaId,
              token: fcmToken,
            };
            pushNotification(data);
          }
        } catch (e) {}

        // Dispatching success action
        dispatch(fetchHcpOrgSuccess(response));
        getDoctorOrPatintById(response.ameyaId, true).then(
          doctorStorageData => {
            if (
              doctorStorageData != null &&
              doctorStorageData.data.length > 0
            ) {
              setVideosCount(doctorStorageData.data.length);
            } else {
              setVideosCount(0);
            }
          },
        );
        const organizationArray = response.userRoles.map(item => ({
          orderId: item.id,
          id: item.organization.id,
          label: item.organization.name,
        }));

        setClinicItems(organizationArray);
      }
    } catch (error) {
      doLogOut();
      setLoading(false);
    }
  };
  async function doLogOut() {
    try {
      await AsyncStorage.removeItem(StorageKeys.token);
      await AsyncStorage.removeItem(StorageKeys.role);
      setTimeout(() => {
        dispatch(logout());
      });
    } catch (error) {}
  }
  const handleClinicModal = () => {
    setClinicOpen(!clinicOpen);
  };

  const handleClinicSelection = (item: any) => {
    setClinicValue(item.id);
    setClinicOpen(false);
    if (hcpData) {
      const organizationArray = hcpData.userRoles.map(org => {
        if (org.id === item.orderId) {
          const cohortsArray = org.cohortPermissions.map(obj => ({
            id: obj.cohort.id,
            label: obj.cohort.name,
            canListOrder: obj.canListOrder,
          }));
          setCohortItems(cohortsArray);
        }
      });
      setCohortWarn(true);
      setCohortValue('');
      setParticipants([]);
    }
  };

  const handleCohortModal = () => {
    setCohortOpen(!cohortOpen);
  };

  const handleCohortSelection = (item: any) => {
    setCohortValue(item.id);
    setCohortOpen(false);
    setCohortWarn(false);
    setCohortId(item.id);
    if (item.canListOrder) {
      fetchParticipantList(item.id, '');
    } else {
      setParticipants([]);
    }
  };

  const fetchParticipantList = async (cohortId: string, status: string) => {
    try {
      const userId = await getData({key: StorageKeys.lastSignedUser});
      if (userId) {
        const response = await getParticipantsList(
          clinicValue,
          cohortId,
          userId,
          status,
        );
        setParticipants(response.data);
      }
    } catch (error) {}
  };

  const toTitleCase = str => {
    return str.replace(
      /\w\S*/g,
      word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );
  };

  const handleFilterModal = () => {
    setFilterOpen(!filterOpen);
  };
  const findFilterStatusName = async (id: number) => {
    let name = '';
    if (id === 1) {
      name = '';
    } else if (id === 2) {
      name = 'PENDING';
    } else if (id === 3) {
      name = 'COMPLETED';
    }
    return name;
  };
  const handleFilterSelection = async (item: any) => {
    setFilterValue(item.id);
    setFilterOpen(false);
    const status = await findFilterStatusName(item.id);
    fetchParticipantList(cohortId, status);
  };

  const selectedClinicLabel =
    clinicItems.find(item => item.id === clinicValue)?.label || 'Organization';

  // Find the selected cohort's label
  const selectedCohortLabel =
    cohortItems.find(item => item.id === cohortValue)?.label || 'Cohort';
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: AppColors.lightBlue,
      flexDirection: 'column',
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      backgroundColor: AppColors.white,
      flex: 1,
      marginTop: moderateScale(15),
      borderTopLeftRadius: moderateScale(15),
      borderTopRightRadius: moderateScale(15),
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between', // This ensures the image is horizontally centered
      alignItems: 'center', // This vertically centers both items
      height: verticalScale(25), // Set a height for the header if necessary
      position: 'relative',
      marginTop: moderateScale(15),
    },
    backIconWrapper: {
      width: getModerateScaleSize(35),
      height: getModerateScaleSize(25),
      marginLeft: moderateScale(20),
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    imageContainer: {
      height: verticalScale(25),
      width: moderateScale(90),
    },
    backIcon: {
      width: verticalScale(28),
      height: verticalScale(28),
      objectFit: 'contain',
    },
    titleText: {
      fontSize: AppFontSize.intersize19,
      fontWeight: AppWeights.interMedium,
      color: AppColors.textHeadingBlack,
      fontFamily: AppFonts.interMedium,
      marginTop: moderateScale(15),
      marginLeft: moderateScale(20),
      textTransform: 'capitalize',
    },
    dropDownContainer: {
      flexDirection: 'row',
      justifyContent: 'center', // Ensures equal spacing between dropdowns
      alignItems: 'center', // Vertically centers the items
      marginTop: moderateScale(8),
    },

    valueContainer: {
      backgroundColor: AppColors.white,
      borderRadius: moderateScale(8),
      borderColor: AppColors.borderGrey,
      borderWidth: moderateScale(1),
      flexDirection: 'row',
      // justifyContent: 'space-between', // Ensures content is horizontally centered
      alignItems: 'center', // Ensures content is vertically centered
      height: verticalScale(35),
      //  flex: 1,
      width: screenDimensions.width / 2 - moderateScale(20),
      marginRight: moderateScale(20),
      marginLeft: moderateScale(20),
      // padding: 8,
      justifyContent: 'center',
    },
    arrowContainer: {
      height: moderateScale(15),
      width: moderateScale(15),
      marginRight: moderateScale(10)
    },
    dropDownText: {
      fontSize: AppFontSize.intersize18,
      fontWeight: AppWeights.interMedium,
      color: AppColors.textFieldTextBlack,
      fontFamily: AppFonts.interMedium,
      // height: scale(50),
      paddingTop: verticalScale(15),
      // marginRight: 70,
      marginLeft: scale(10),
      // justifyContent: 'center',
      // backgroundColor: AppColors.black,
    },

    modalOverlay: {
      // flex: 1,
      justifyContent: 'center', // Align content to the top
      alignItems: 'center', // Center the content horizontally
      textAlign: 'center',
      backgroundColor: 'rgba(1,1,1,0.5)',
      paddingVertical: screenDimensions.height / 4,
    },
    modalContent: {
      overflow: 'scroll',
      backgroundColor: AppColors.white,
      borderRadius: moderateScale(8),
      minWidth: '60%',
      maxHeight: moderateScale(500),
      // alignItems: 'center',
      // justifyContent: 'center',
      // flex: 1,
      padding: moderateScale(10),
      // height: 'auto',
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      // Shadow for Android
    },
    option: {
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(16),
      borderBottomWidth: moderateScale(1),
      borderBottomColor: AppColors.bgLightGrey,
    },
    optionText: {
      fontSize: AppFontSize.intersize18,
      fontWeight: AppWeights.interMedium,
      color: AppColors.textFieldTextBlack,
      fontFamily: AppFonts.interMedium,
    },
    awaitingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: moderateScale(15),
      backgroundColor: AppColors.white,
      borderRadius: moderateScale(8),
      marginHorizontal: moderateScale(15),
    },
    awaitingLabel: {
      fontSize: AppFontSize.intersize19,
      fontWeight: AppWeights.interSemibold,
      color: AppColors.textHeadingBlack,
      fontFamily: AppFonts.interSemibold,
      width: screenDimensions.width / 2 + moderateScale(30),
    },
    awaitingButton: {
      backgroundColor: AppColors.buttonDarkBlue,
      paddingHorizontal: moderateScale(15),
      paddingVertical: moderateScale(7),
      borderRadius: moderateScale(20),
      marginLeft: moderateScale(8),
    },
    awaitingButtonText: {
      color: AppColors.white,
      fontSize: AppFontSize.intersize15,
      fontFamily: AppFonts.interMedium,
      fontWeight: AppWeights.interMedium,
    },
    bgSearchContainer: {
      flex: 1,
      paddingHorizontal: moderateScale(15),
      backgroundColor: AppColors.white,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(10),
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: AppColors.white,
      borderRadius: moderateScale(8),
      borderColor: AppColors.borderGrey,
      borderWidth: moderateScale(1),
      paddingHorizontal: moderateScale(10),
      height: getModerateScaleSize(50),
    },
    searchInput: {
      flex: 1,
      marginLeft: moderateScale(5),
      fontSize: AppFontSize.intersize18,
      paddingVertical: 0,
      fontWeight: AppWeights.interMedium,
      color: AppColors.textFieldTextBlack,
      fontFamily: AppFonts.interMedium,
    },
    filterButton: {
      marginLeft: 10,
      backgroundColor: AppColors.white,
      borderRadius: 8,
      padding: 10,
      borderColor: AppColors.borderGrey,
      borderWidth: 1,
    },
    participantCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: AppColors.bgLightGrey,
      padding: moderateScale(10),
      borderRadius: moderateScale(8),
      marginBottom: moderateScale(5),
    },
    participantInfo: {
      flex: 1,
    },
    participantName: {
      //fontSize: AppFontSize.intersize16,
      fontWeight: AppWeights.interMedium,
      color: AppColors.textFieldTextBlack,
      fontFamily: AppFonts.interMedium,
      marginBottom: moderateScale(2),
    },
    participantEmail: {
      //fontSize: AppFontSize.intersize16,
      fontWeight: AppWeights.interSemibold,
      color: AppColors.textHeadingBlack,
      fontFamily: AppFonts.interSemibold,
    },
    selectFilterText: {
      fontSize: AppFontSize.intersize20,
      fontWeight: AppWeights.interMedium,
      color: AppColors.textHeadingBlack,
      fontFamily: AppFonts.interMedium,
      padding: moderateScale(12),
    },
    filterCloseIcon: {
      width: 24,
      height: 24,
      objectFit: 'contain',
      padding: moderateScale(12),
      alignSelf: 'center',
    },
    emptyContainer: {
      marginTop: screenDimensions.height / 2 - 300,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
    },
    emptyText: {
      fontSize: AppFontSize.intersize16,
      color: 'black',
      fontFamily: AppFonts.interRegular,
    },
    imgIcon: {
      width: verticalScale(15),
      height: verticalScale(15),
      objectFit: 'contain',
    },
  });

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.participantCard}
      onPress={() => {
        navigate(NavigatorNames.hcpMovementList, {orderData: item});
      }}>
      <View style={styles.participantInfo}>
        <Text
          maxFontSizeMultiplier={1.3}
          style={[
            styles.participantName,
            {
              fontSize: isIpad
                ? AppFontSize.intersize16
                : AppFontSize.intersize17,
            },
          ]}>
          {toTitleCase(
            item.participant.firstName + ' ' + item.participant.lastName,
          )}
        </Text>
        <Text
          maxFontSizeMultiplier={1.3}
          style={[
            styles.participantEmail,
            {
              fontSize: isIpad
                ? AppFontSize.intersize16
                : AppFontSize.intersize17,
            },
          ]}>
          {item.participant.email.toLowerCase()}
        </Text>
      </View>
      <Image
        tintColor={AppColors.buttonDarkBlue}
        source={require('../../../assets/images/rightarrowtransparent.png')}
        style={styles.imgIcon}
      />
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText} maxFontSizeMultiplier={1.3}>
          {' '}
          {cohortWarn ? 'Please select a cohort to continue.' : 'No Participants available'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            navigate(NavigatorNames.hcpProfile);
          }}
          style={styles.backIconWrapper}>
          <Image
            source={require('../../../assets/images/profilecircle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/ameyalogo.png')}
          resizeMode="contain"
          style={styles.imageContainer}
        />
        <View style={{width: moderateScale(30)}} />
      </View>
      <Text maxFontSizeMultiplier={1.4} style={styles.titleText}>
        Good Morning,{' '}
        {hcpData ? hcpData?.firstName + ' ' + hcpData?.lastName : '---'}
      </Text>
      <View style={styles.dropDownContainer}>
        <TouchableOpacity
          style={[styles.valueContainer, {marginRight: moderateScale(3)}]}
          onPress={handleClinicModal}>
          <View
            style={{
              flex: 1,
              marginLeft: 0,
              marginRight: moderateScale(2),
              height: verticalScale(45),
            }}>
            <Text maxFontSizeMultiplier={1.4} style={styles.dropDownText}>
              {selectedClinicLabel}
            </Text>
          </View>
          <Image
            source={require('../../../assets/images/downarrowsmall.png')}
            style={styles.arrowContainer}
            tintColor={AppColors.buttonDarkBlue}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.valueContainer, {marginLeft: moderateScale(3)}]}
          onPress={handleCohortModal}>
          <View
            style={{
              flex: 1,
              height: verticalScale(45),
              marginLeft: 0,
              marginRight: moderateScale(2),
            }}>
            <Text maxFontSizeMultiplier={1.4} style={styles.dropDownText}>
              {selectedCohortLabel}
            </Text>
          </View>
          <Image
            source={require('../../../assets/images/downarrowsmall.png')}
            style={styles.arrowContainer}
            tintColor={AppColors.buttonDarkBlue}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.scrollViewContent}>
        <View style={styles.awaitingContainer}>
          <Text
            maxFontSizeMultiplier={1.3}
            style={[
              styles.awaitingLabel,
              {
                width:
                  videosCount === 0
                    ? screenDimensions.width - moderateScale(30)
                    : screenDimensions.width / 2 + moderateScale(30),
              },
            ]}>
            Videos awaiting upload:{' '}
            <Text maxFontSizeMultiplier={1.3} style={styles.awaitingLabel}>
              {videosCount}
            </Text>
          </Text>
          {videosCount > 0 && (
            <TouchableOpacity
              style={styles.awaitingButton}
              onPress={() => {
                navigate(NavigatorNames.uploadAllVideo);
              }}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={styles.awaitingButtonText}>
                All Videos
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.bgSearchContainer}>
          {/* Search and Filter Section */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Image
                source={require('../../../assets/images/searchglass.png')}
                style={styles.imgIcon}
              />
              <TextInput
                maxFontSizeMultiplier={1.3}
                style={styles.searchInput}
                placeholder="Search Participants"
                placeholderTextColor={AppColors.textFieldHeading}
                value={searchText}
                onChangeText={text => setSearchText(text)}
              />
            </View>
            {/* <TouchableOpacity
              style={styles.filterButton}
              onPress={handleFilterModal}>
              {filterValue === 1 ? (
                <Image
                  source={require('../../../assets/images/filtericon.png')}
                  tintColor={AppColors.buttonDarkBlue}
                  style={styles.imgIcon}
                />
              ) : (
                <Image
                  source={require('../../../assets/images/filtered.png')}
                  tintColor={AppColors.buttonDarkBlue}
                  style={styles.imgIcon}
                />
              )}
            </TouchableOpacity> */}
          </View>

          {/* Participants List */}
          <FlatList
            style={{backgroundColor: AppColors.white}}
            data={filteredParticipants}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={!loading ? renderEmptyComponent : null
            }
          />
        </View>
      </View>

      <AmeyaLoader visible={loading} message={loaderMessage} />

      {clinicOpen && (
        <Modal
          isVisible={clinicOpen}
          onBackdropPress={handleClinicModal}
          propagateSwipe={true}
          onDismiss={() => {
            handleClinicModal();
          }}
          animationIn={'fadeIn'}
          animationOut={'fadeOut'}>
          <View style={styles.modalContent}>
            <ScrollView>
              {clinicItems.map((item, index) => {
                const isLastItem = index === clinicItems.length - 1;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.option,
                      isLastItem && {borderBottomWidth: 0},
                    ]}
                    onPress={() => {
                      handleClinicSelection(item);
                    }}>
                    <Text maxFontSizeMultiplier={1.4} style={styles.optionText}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      )}

      {cohortOpen && (
        <Modal
          isVisible={cohortOpen}
          onBackdropPress={handleCohortModal}
          propagateSwipe={true}
          onDismiss={() => {
            handleCohortModal();
          }}
          animationIn={'fadeIn'}
          animationOut={'fadeOut'}>
          {cohortItems.length > 0 ? (
            <View style={styles.modalContent}>
              <ScrollView>
                {cohortItems.map((item, index) => {
                  const isLastItem = index === cohortItems.length - 1;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.option,
                        isLastItem && {borderBottomWidth: 0},
                      ]}
                      onPress={() => {
                        handleCohortSelection(item);
                      }}>
                      <Text
                        maxFontSizeMultiplier={1.4}
                        style={styles.optionText}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View
              style={[
                styles.modalContent,
                {
                  height: isIpad ? 50 : scale(50),
                  width: isIpad
                    ? screenDimensions.width - 60
                    : screenDimensions.width - scale(60),
                  alignItems: 'center',
                },
              ]}>
              <Text maxFontSizeMultiplier={1.4} style={styles.optionText}>
                Please select an organization
              </Text>
            </View>
          )}
        </Modal>
      )}
      {/* {cohortWarn &&
       <AlertModal
      {cohortWarn && (
        <AlertModal
          alertModalVisible={cohortWarn}
          title={'Please select a cohort to continue.'}
          onClose={() => {
            setCohortWarn(false);
          }}
        />
    } */}
      {filterOpen && (
        <Modal
          isVisible={filterOpen}
          onBackdropPress={handleFilterModal}
          propagateSwipe={true}
          onDismiss={() => {
            handleFilterModal();
          }}
          animationIn={'fadeIn'}
          animationOut={'fadeOut'}>
          <View style={styles.modalContent}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text maxFontSizeMultiplier={1.3} style={styles.selectFilterText}>
                Select Filter
              </Text>
              <TouchableOpacity onPress={handleFilterModal}>
                <Image
                  source={require('../../../assets/images/close.png')}
                  style={styles.filterCloseIcon}
                />
              </TouchableOpacity>
            </View>
            {filterItems.map((item, index) => {
              const isLastItem = index === filterItems.length - 1;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.option, isLastItem && {borderBottomWidth: 0}]}
                  onPress={() => {
                    handleFilterSelection(item);
                  }}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.optionText}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
