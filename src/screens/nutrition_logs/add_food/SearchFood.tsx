/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  FlatList,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Permission,
} from 'react-native';
import {AppColors} from '../../../theme/AppColors';
import {Icon} from 'react-native-elements';
import GlobalStyles from '../../../styles/GlobalStyles';
import {AppStrings} from '../../../utils/Constants';
import React, {useState, useEffect, useRef} from 'react';
import {screenDimensions} from '../../../utils/ScreenDimensions';
import {navigateBack, navigate} from '../../../navigators/utils/Utils';
import {AppFonts, AppFontSize, AppWeights} from '../../../theme/AppFonts';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import App from '../../../App';
import {NavigatorNames} from '../../../navigators/tabs/NavigatorsNames';
import {
  PassioSDK,
  PassioIconView,
  IconSize,
  PassioSearchResult,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import Voice from '@react-native-voice/voice';
import LottieView from 'lottie-react-native';
import { scale } from 'react-native-size-matters';

export default function SearchFood() {
  const [searchText, setSearchText] = useState('');
  const [detectedCandidates, setDetectedCandidates] = useState([]);
  const [recording, setRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // requestAudioPermission();
      requestMicrophonePermission();
    }
    Voice.onSpeechResults = onSpeechResultsHandler;
    Voice.onSpeechError = onSpeechErrorHandler;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  // const requestAudioPermission = async () => {
  //   try {
  //     const grants = await PermissionsAndroid.requestMultiple([
  //       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  //       PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  //       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  //     ]);

  //

  //     if (
  //       grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
  //         PermissionsAndroid.RESULTS.GRANTED &&
  //       grants['android.permission.READ_EXTERNAL_STORAGE'] ===
  //         PermissionsAndroid.RESULTS.GRANTED &&
  //       grants['android.permission.RECORD_AUDIO'] ===
  //         PermissionsAndroid.RESULTS.GRANTED
  //     ) {
  //
  //     } else {
  //
  //       return;
  //     }
  //   } catch (err) {
  //     return;
  //   }
  // };
  const requestMicrophonePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'This app needs access to your microphone to recognize speech.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      } else {
      }
    } catch (err) {}
  };

  const onSpeechResultsHandler = event => {
    const text = event.value[0];
    onStopRecord(text);
  };

  const onSpeechErrorHandler = event => {
    //
  };

  // Start recording and speech recognition
  const onStartRecord = async () => {
    setRecording(true);
    try {
      await Voice.start('en-US');
    } catch (error) {}
  };

  const onStopRecord = async (text: string) => {
    setRecording(false);
    try {
      await Voice.stop();
      getFoodItemsForText(text);
      setSearchText(text);
    } catch (error) {}
  };

  const RenderItem = ({item}) => (
    <View
      style={{
        paddingVertical: 5,
        paddingHorizontal: 20,
      }}>
      <TouchableOpacity onPress={() => {}}>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 20,
            backgroundColor: 'white',
            borderRadius: 8,
          }}>
          <View
            style={{
              height: scale(36),
              width: scale(36),
              paddingHorizontal: 40,
              justifyContent: 'center',
              borderRadius: 0,
            }}>
            <PassioIconView
              style={{
                height: scale(36),
                width: scale(36),
                alignSelf: 'center',
                borderRadius: 40,
              }}
              config={{
                passioID: item.iconID,
                iconSize: IconSize.PX180,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              marginRight: 50,
            }}>
            <Text maxFontSizeMultiplier={1.4} style={styles.flatListTitle}>
              {item.foodName}
            </Text>
            {/* <Text maxFontSizeMultiplier={1.5} style={styles.flatListSubText}>
              {Math.round(Number(item.nutritionPreview.calories) ?? 0) +
                ' Cal | ' +
                item.nutritionPreview.servingQuantity +
                ' ' +
                item.nutritionPreview.servingUnit}
            </Text> */}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const getFoodItemsForText = async (text: string) => {
    try {
      const passioFoodItem = await PassioSDK.searchForFoodSemantic(text);

      setIsSearching(false);
      if (passioFoodItem.results != null) {
        setDetectedCandidates(passioFoodItem.results);
      } else {
        setDetectedCandidates([]);
      }
    } catch (error) {
      setIsSearching(false);
      setDetectedCandidates([]);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: AppColors.lightGreen,
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'flex-start',
    },
    headerContainer: {
      flexDirection: 'row',
      marginTop: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    subContainer: {
      marginTop: 16,
      flexDirection: 'column',
      // paddingHorizontal: 0,
    },
    back: {
      color: AppColors.textHeadingBlack,
    },
    HeaderTitleText: {
      fontSize: AppFontSize.intersize18,
      fontWeight: AppWeights.interMedium,
      color: AppColors.textHeadingBlack,
      fontFamily: AppFonts.interMedium,
    },

    //dropdown
    dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center', // Align content to the top
      alignItems: 'center', // Center the content horizontally
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add some transparency for the backdrop
    },
    modalContent: {
      backgroundColor: AppColors.white,
      borderRadius: 8,
      padding: 10,
      width: scale(200),
      height: scale(212),
      justifyContent: 'center',
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      // Shadow for Android
      elevation: 5,
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: AppColors.bgLightGrey,
    },
    optionText: {
      fontSize: AppFontSize.intersize16,
      fontWeight: AppWeights.interMedium,
      color: AppColors.textHeadingBlack,
      fontFamily: AppFonts.interMedium,
    },
    dropImage: {
      width: scale(16),
      height: scale(8),
      marginLeft: 8,
    },
    searchContainer: {
      backgroundColor: AppColors.white,
      borderRadius: 10,
      // width: '100%',
      height: scale(40),
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginLeft: 16,
      marginRight: searchText.length > 0 ? 75 : 16,
    },
    searchIcon: {
      width: scale(15.5),
      height: scale(15.5),
    },
    //   micIcon: {
    //     width: 15.5,
    //     height: 15.5,
    //     marginRight: 10,
    //   },
    searchTextFieldText: {
      fontSize: AppFontSize.intersize17,
      color: AppColors.textFieldTextBlack,
      fontWeight: AppWeights.interMedium,
      fontFamily: AppFonts.interMedium,
      paddingLeft: 6,
      width: 283,
      height: '100%',
    },
    searchStartView: {
      flexDirection: 'row',
      paddingLeft: 10,
      paddingHorizontal: 16,
      alignContent: 'center',
    },
    newFoodConatiner: {
      flexDirection: 'row',
      marginTop: 16,
    },

    addFoodItemBG: {
      backgroundColor: AppColors.lightGreenItem,
      borderRadius: 8,
      width: scale(120),
      height: scale(84),
      marginRight: 8,
      justifyContent: 'center',
    },
    itemContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    imageContainerFood: {
      width: scale(24),
      height: scale(24),
    },
    itemText: {
      fontSize: AppFontSize.intersize16,
      color: AppColors.textHeadingBlack,
      fontWeight: AppWeights.interMedium,
      fontFamily: AppFonts.interMedium,
      marginTop: 12,
    },
    myFoodContainer: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: AppColors.bgLightGrey,
      marginTop: 20,
    },
    activeTabText: {
      fontSize: AppFontSize.intersize16,
      color: AppColors.buttonDarkBlue,
      fontWeight: AppWeights.interSemibold,
      fontFamily: AppFonts.interSemibold,
      marginBottom: 14,
    },
    InActiveTabText: {
      fontSize: AppFontSize.intersize16,
      color: AppColors.textFieldHeading,
      fontWeight: AppWeights.interMedium,
      fontFamily: AppFonts.interMedium,
      marginBottom: 14,
    },
    textTabView: {
      paddingHorizontal: 13.5,
      marginRight: 8,
      flexDirection: 'column',
      alignItems: 'center',
    },
    divider: {
      width: scale(75),
      backgroundColor: AppColors.buttonDarkBlue,
      height: scale(2),
    },
    cancelText: {
      color: '#007AFF',
      fontFamily: AppFonts.interMedium,
      fontSize: AppFontSize.intersize16,
      fontWeight: AppWeights.interMedium,
    },
    flatListSubText: {
      fontFamily: AppFonts.interMedium,
      fontSize: AppFontSize.intersize16,
      fontWeight: AppWeights.interMedium,
      marginRight: 20,
      color: '#6E6E6E',
    },
    flatListTitle: {
      fontFamily: AppFonts.interMedium,
      fontSize: AppFontSize.intersize18,
      fontWeight: AppWeights.interMedium,
      marginRight: 20,
      color: AppColors.buttonDarkBlue,
    },
    noRecordsText: {
      fontSize: AppFontSize.intersize16,
      color: AppColors.textHeadingBlack,
      fontFamily: AppFonts.interRegular,
      textAlign: 'center',
    },
    backIcon: {
      width: scale(20),
      height: scale(20),
      objectFit: 'contain',
    },
    backIconWrapper: {
      width: scale(30),
      height: scale(30),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    recording: {
      width: scale(35),
      height: scale(35),
      marginRight: 10,
    },
    mic: {
      width: scale(15.5),
      height: scale(15.5),
      marginRight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={navigateBack}
            style={styles.backIconWrapper}>
            <Image
              source={require('../../../../assets/images/leftarrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <Text maxFontSizeMultiplier={1.4} style={styles.HeaderTitleText}>
            {AppStrings.done}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchStartView}>
            <Image
              resizeMode={'contain'}
              source={require('../../../../assets/images/searchglass.png')}
              style={styles.searchIcon}
            />

            <TextInput
              maxFontSizeMultiplier={1.4}
              style={styles.searchTextFieldText}
              placeholder="Search Our Database"
              placeholderTextColor={AppColors.lightGrey}
              value={searchText}
              onChangeText={item => {
                setSearchText(item);

                if (item.length > 0 && !isSearching) {
                  setIsSearching(true);
                  getFoodItemsForText(item);
                } else {
                  setDetectedCandidates([]);
                }
              }}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              recording ? onStopRecord('') : onStartRecord();
            }}
            style={{
              width: scale(50),
              height: scale(50),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {recording ? (
              <LottieView
                source={require('../../../../assets/lottie/micloading.json')} // Update path to your Lottie file
                style={styles.recording}
                autoPlay
                speed={1}
                loop
              />
            ) : (
              <Image
                resizeMode={'contain'}
                source={require('../../../../assets/images/mic.png')}
                style={styles.mic}
              />
            )}
          </TouchableOpacity>

          {searchText.length > 0 && (
            <View
              style={{
                alignItems: 'flex-end',
                marginLeft: -15,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setSearchText('');
                  setDetectedCandidates([]);
                }}>
                <Text maxFontSizeMultiplier={1.4} style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {detectedCandidates.length > 0 ? (
          <FlatList
            data={detectedCandidates}
            renderItem={({item}) => <RenderItem item={item} />}
            keyExtractor={item => item?.resultId}
            style={{
              marginTop: 10,
              backgroundColor: '#F4F4F6',
              marginHorizontal: 0,
            }}
          />
        ) : (
          <Text maxFontSizeMultiplier={1.4} style={styles.noRecordsText}>
            No records found
          </Text>
        )}
      </View>
      {isSearching && <ActivityIndicator size="large" color="black" />}
    </SafeAreaView>
  );
}
