import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-elements';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppStrings} from '../../utils/Constants';
import {AppColors} from '../../theme/AppColors';
import Header from '../../components/Header';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import {AppFonts, AppFontSize, AppWeights} from '../../theme/AppFonts.tsx';
import {useSelector} from 'react-redux';
import {ProfileData} from '../../models/ProfileModel.ts';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
const Personal_Info = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [dobHidden, setDobHidden] = useState(true);
  const profileData: ProfileData = useSelector(
    (state: any) => state?.profile?.data,
  );

  // Format phone number to (XXX)-XXX-XXXX
  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-numeric characters
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    // Match the cleaned number with the desired format
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]})-${match[2]}-${match[3]}`;
    }
    return phoneNumber;
  };

  // Format date to MM-DD-YYYY
  const formatDate = (dateString: string): string => {
    // Return a default value if dateString is empty
    if (!dateString || dateString.trim() === '') {
      return '---';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      // Return a default value instead of throwing an error
      return '---';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      day: '2-digit',
      month: 'short', // 'short' gives "Feb" instead of "February"
    });
  };

  const formattedPhoneNumber = profileData
    ? formatPhoneNumber(profileData.phoneNumber)
    : '---';

  const formattedDateOfBirth = profileData
    ? formatDate(profileData.dob)
    : '---';

  const displayDob = dobHidden
    ? formattedDateOfBirth.replace(/^\w{3} \d{2}/, 'XXX XX')
    : formattedDateOfBirth;

  const renderContent = () => {
    switch (activeTab) {
      case AppStrings.general:
        return (
          <View>
            <Text
              maxFontSizeMultiplier={1.5}
              style={styles.personalInfoHeading}>
              {AppStrings.basicDetails}
            </Text>
            <View style={styles.infoContainer}>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoName}>
                {AppStrings.fullName}
              </Text>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoValue}>
                {profileData
                  ? profileData?.firstName + ' ' + profileData?.lastName
                  : '---'}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoName}>
                {AppStrings.dateOfBirth}
              </Text>
              <View style={[styles.infoFlexed, styles.flexBetween]}>
                <Text maxFontSizeMultiplier={1.5} style={styles.infoValue}>
                  {displayDob}
                </Text>
                <TouchableOpacity onPress={() => setDobHidden(!dobHidden)}>
                  <Text
                    maxFontSizeMultiplier={1.5}
                    style={styles.infoActionBtn}>
                    {dobHidden ? 'View' : 'Hide'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.infoContainer}>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoName}>
                {AppStrings.address}
              </Text>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoValue}>
                {profileData
                  ? (() => {
                      const city = profileData?.city?.trim() || '';
                      const state = profileData?.state?.trim() || '';
                      const country = profileData?.country?.trim() || '';

                      if (!city && !state && !country) return '---';

                      let address = '';

                      if (city || state) {
                        address += city;
                        if (city && state) address += ', ';
                        address += state;
                        if (country) address += ' - ';
                      }

                      address += country;

                      return address || '---';
                    })()
                  : '---'}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoName}>
                {AppStrings.contact}
              </Text>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoValue}>
                {formattedPhoneNumber}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text maxFontSizeMultiplier={1.5} style={styles.updateInfoText}>
                {AppStrings.toUpdateInformation}
              </Text>
            </View>
          </View>
        );
      case AppStrings.health:
        return (
          <View>
            <Text
              maxFontSizeMultiplier={1.5}
              style={styles.personalInfoHeading}>
              {AppStrings.careProvierInfo}
            </Text>
            <View style={styles.infoContainer}>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoName}>
                {AppStrings.organization}
              </Text>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoValue}>
                {profileData?.organization?.name}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoName}>
                {AppStrings.clinic}
              </Text>
              <Text maxFontSizeMultiplier={1.5} style={styles.infoValue}>
                {profileData?.cohort?.name}
              </Text>
            </View>
            {profileData?.cohort?.email && (
              <View style={styles.infoContainer}>
                <Text maxFontSizeMultiplier={1.5} style={styles.infoName}>
                  {AppStrings.email}
                </Text>
                <Text maxFontSizeMultiplier={1.5} style={styles.infoValue}>
                  {profileData?.cohort.email}
                </Text>
              </View>
            )}
            {profileData?.cohort?.phoneNumber && (
              <View style={styles.infoContainer}>
                <Text maxFontSizeMultiplier={1.5} style={styles.infoName}>
                  {AppStrings.contact}
                </Text>
                <Text maxFontSizeMultiplier={1.5} style={styles.infoValue}>
                  {profileData.cohort.phoneNumber}
                </Text>
              </View>
            )}
          </View>
        );
      case AppStrings.account:
        return (
          <View style={styles.containerFlexed}>
            <View style={styles.f1}>
              <Text
                maxFontSizeMultiplier={1.5}
                style={styles.personalInfoHeading}>
                {AppStrings.accountInformation}
              </Text>
              <View style={styles.infoContainer}>
                <Text maxFontSizeMultiplier={1.5} style={styles.infoName}>
                  {AppStrings.emailId}
                </Text>
                <Text maxFontSizeMultiplier={1.5} style={styles.infoValue}>
                  {profileData ? profileData?.email : '---'}
                </Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}>
        <Header
          title={AppStrings.personalInfo}
          onBack={undefined}
          varient="TYPE2"
        />

        <View style={styles.tabContainer}>
          {[AppStrings.general, AppStrings.health, AppStrings.account].map(
            tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab(tab)}>
                <Text
                  maxFontSizeMultiplier={1.1}
                  style={[
                    activeTab === tab
                      ? styles.activeTabButtonText
                      : styles.unActiveTabButtonText,
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        <View style={styles.contentContainer}>{renderContent()}</View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

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
  tabContainer: {
    flexDirection: 'row',
    gap: moderateScale(8),
    paddingTop: moderateScale(16),
    justifyContent: 'center',
    paddingHorizontal: moderateScale(10),
  },
  tabButton: {
    paddingTop: moderateScale(5),
    paddingBottom: moderateScale(5),
    paddingLeft: 0,
    paddingRight: 0,
    borderTopLeftRadius: isTablet ? 20 : 10,
    borderTopRightRadius: isTablet ? 20 : 10,
    height: verticalScale(36),
    width: '33%',
    display: 'flex',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: AppColors.buttonDarkBlue,
  },
  activeTabButtonText: {
    color: AppColors.white,
    fontWeight: AppWeights.interSemibold,
    fontSize: AppFontSize.intersize14,
    fontFamily: AppFonts.interSemibold,
  },
  unActiveTabButtonText: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.textFieldTextBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 24 : 12,
    borderTopRightRadius: isTablet ? 24 : 12,
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(32),
  },

  personalInfoHeading: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonDarkBlue,
    paddingBottom: moderateScale(12),
    borderBottomColor: AppColors.textFieldBorderGrey,
    borderBottomWidth: moderateScale(1),
    fontFamily: AppFonts.interSemibold,
    marginBottom: moderateScale(24),
  },
  infoContainer: {
    marginBottom: moderateScale(30),
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
  infoFlexed: {
    display: 'flex',
    flexDirection: 'row',
  },
  infoActionBtn: {
    fontSize: AppFontSize.intersize16,
    color: AppColors.hyperLinkTextColor,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
  },
  flexBetween: {
    justifyContent: 'space-between',
  },
  w50: {
    width: '50%',
  },
  updateInfoText: {
    marginTop: moderateScale(40),
    fontSize: AppFontSize.intersize16,
    color: AppColors.buttonDarkBlue,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    width: '60%',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
    //lineHeight: scale(20),
  },
  f1: {
    flex: 1,
  },
  containerFlexed: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  buttonContainer: {
    paddingBottom: moderateScale(16),
  },
});

export default Personal_Info;
