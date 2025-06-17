import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  Alert,
  Animated,
  Linking,
  Easing,
} from 'react-native';
import {useEffect, useState, useCallback, useRef, useContext} from 'react';
import {
  PassioSDK,
  DetectionCameraView,
  FoodDetectionConfig,
  FoodDetectionEvent,
  PassioFoodItem,
  PassioIconView,
  IconSize,
  DetectedCandidate,
  BarcodeCandidate,
  PassioFoodDataInfo,
  PassioAdvisorFoodInfo,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import {navigate, navigateBack} from '../../../navigators/utils/Utils';
import {AppColors} from '../../../theme/AppColors';
import {Icon} from 'react-native-elements';
import GlobalStyles from '../../../styles/GlobalStyles';
import {AppStrings} from '../../../utils/Constants';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../../../theme/AppFonts';
import {launchImageLibrary} from 'react-native-image-picker';
import {NavigatorNames} from '../../../navigators/tabs/NavigatorsNames';
import {useDispatch, useSelector} from 'react-redux';
import {addSelectedFoodItem} from '../../../store/slices/selectedFoodSlice';
import {FoodItemModel} from '../../../models/FoodJournalModel';
import {NutrientsModel} from '../../../models/FoodJournalModel';
import {screenDimensions} from '../../../utils/ScreenDimensions';
import {AppContext} from '../../../context/AppContextProvider';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

export default function FoodScan({route}) {
  const [loadingState, setLoadingState] = useState('');
  const [isCameraAuthorized, setCameraAuthorized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSplshOn, setIsSplshOn] = useState(false);
  const {width, height} = Dimensions.get('window');
  const [detectedCandidates, setDetectedCandidates] = useState([]);
  const boxSize = moderateScale(260);
  const [imageUri, setImageUri] = useState(null);
  const lineAnimation = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false); // Control animation state
  const animationRef = useRef(null);
  const [isphotoScanning, setIsphotoScanning] = useState(false);

  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('AppContext must be used within an AppProvider');
  }

  const {
    setAlertTitle: setTitle,
    setAlertMessage: setMessage,
    setShowAlert: setAlert,
    setAlertButtons: setButtons,
    clearAlert,
  } = appContext;

  const dispatch = useDispatch();
  const {isFrom, mealType, date} = route.params; // 1. Barcode Scan // 2. Food Scan
  useEffect(() => {
    PassioSDK.requestCameraAuthorization().then(cameraAuthorized => {
      if (!cameraAuthorized) {
        showPermissionAlert();
      }
      setCameraAuthorized(cameraAuthorized);
    });
  }, []);
  const showPermissionAlert = () => {
    clearAlert();
    setTitle('Permission Required');
    setMessage(
      'Allow camera access to continue. Please enable it in Settings to capture photos and videos.',
    );
    setButtons &&
      setButtons([
        {
          text: 'Cancel',
        },
        {
          text: 'Open Settings',
          onPress: openAppSettings,
        },
      ]);
    setAlert(true);
  };

  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      clearAlert();
      setTitle('Error');
      setMessage('Unable to open app settings.');
      setAlert(true);
    });
  };
  useEffect(() => {
    if (isAnimating) {
      startAnimation();
    } else if (animationRef.current) {
      animationRef.current.stop();
    }
  }, [isAnimating]);

  const startAnimation = () => {
    animationRef.current = Animated.loop(
      Animated.timing(lineAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animationRef.current.start();
  };

  useEffect(() => {
    // if (!isReady) {
    //   return;
    // }
    setIsAnimating(true);
    const config: FoodDetectionConfig = {
      detectBarcodes: isFrom === 1,
      detectPackagedFood: isFrom === 2,
    };

    const subscription = PassioSDK.startFoodDetection(
      config,
      async (detection: FoodDetectionEvent) => {
        const {candidates} = detection;
        if (candidates?.barcodeCandidates?.length) {
          const barcode = candidates.barcodeCandidates[0];
          if (isFrom === 1) {
            const barcode = candidates.barcodeCandidates[0];

            getFoodItemsForBarCodesList(candidates?.barcodeCandidates);
          }
        } else if (candidates?.packagedFoodCode?.length) {
        } else if (candidates?.detectedCandidates?.length) {
          if (isFrom === 2) {
            getFoodItemsForPassioIDLists(candidates?.detectedCandidates);
            console.log(
              'detected candidatres3',
              candidates?.detectedCandidates[0],
            );
          }
        }
      },
    );
    return () => {
      subscription.remove();
      // subscription1.remove();
    };
  }, []);
  const handleBackPress = () => {
    navigateBack();
  };
  const lineTranslateY = lineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });
  const onScanImage = useCallback(async () => {
    try {
      const {assets} = await launchImageLibrary({mediaType: 'photo'});
      if (assets) {
        setImageUri(assets?.[0].uri);
        setIsAnimating(true);
        setDetectedCandidates([]);
        setIsphotoScanning(true);
        PassioSDK.recognizeImageRemote(
          assets?.[0].uri?.replace('file://', '') ?? '',
        )
          .then(async candidates => {
            setIsAnimating(false);
            setIsphotoScanning(false);
            if (candidates.length > 0) {
              getFoodItemsForBarCodesDataInfoList(candidates);
            } else {
              clearAlert();
              setTitle('Alert');
              setMessage('Unable to recognized this image');
              setButtons &&
                setButtons([
                  {
                    text: 'OK',
                    onPress: () => setImageUri(null),
                  },
                ]);
              setAlert(true);
            }
          })
          .catch(() => {
            setIsphotoScanning(false);
            clearAlert();
            setTitle('Alert');
            setMessage('Unable to recognized this image');
            setAlert(true);
          })
          .finally(() => {
            // setLoading(false)
          });
      }
    } catch (err) {}
  }, []);
  const getFoodItemsForBarCodesDataInfoList = async (
    detectedCandidates: PassioAdvisorFoodInfo[],
  ) => {
    try {
      // Array to store all the passioFoodItems
      const passioFoodItems = await Promise.all(
        detectedCandidates.map(async candidate => {
          const passioFoodItem = await PassioSDK.fetchFoodItemForDataInfo(
            candidate.foodDataInfo,
          );
          return passioFoodItem;
        }),
      );
      setIsAnimating(false);
      const updatedFoodItem = addIdsToItems(passioFoodItems);
      setDetectedCandidates(updatedFoodItem);
      // setDetectedCandidates(passioFoodItems);
    } catch (error) {}
  };

  const getFoodItemsForPassioIDLists = async (
    detectedCandidates: DetectedCandidate[],
  ) => {
    try {
      // Array to store all the passioFoodItems
      const passioFoodItems = await Promise.all(
        detectedCandidates.map(async candidate => {
          const passioFoodItem = await PassioSDK.fetchFoodItemForPassioID(
            candidate.passioID,
          );
          return passioFoodItem;
        }),
      );

      const updatedFoodItem = addIdsToItems(passioFoodItems);
      console.log('updatedFoodItem details', updatedFoodItem[0].details);
      setDetectedCandidates(updatedFoodItem);
    } catch (error) {}
  };
  const getFoodItemsForBarCodesList = async (
    detectedCandidates: BarcodeCandidate[],
  ) => {
    try {
      // Array to store all the passioFoodItems
      const passioFoodItems = await Promise.all(
        detectedCandidates.map(async candidate => {
          const passioFoodItem = await PassioSDK.fetchFoodItemForProductCode(
            candidate.barcode,
          );
          return passioFoodItem;
        }),
      );
      // setIsAnimating(false);

      const updatedFoodItem = addIdsToItems(passioFoodItems);
      console.log('detected candidatres', detectedCandidates);
      setDetectedCandidates(updatedFoodItem);
    } catch (error) {}
  };
  const addIdsToItems = data => {
    return data.map((item, index) => ({
      ...item,
      id: item.id || `item-${index + 1}`, // If 'id' exists, keep it. Otherwise, generate a new id.
    }));
  };

  const getNutritionsForSelectedWeight = async (
    passioFoodItem: PassioFoodItem,
  ) => {
    try {
      const passioFoodItemNutrionsForSelectedSize =
        await PassioSDK.getNutrientsOfPassioFoodItem(passioFoodItem, {
          value: passioFoodItem.amount.weight.value,
          unit: passioFoodItem.amount.weight.unit,
        });

      const nutrientsValue: NutrientsModel = {
        weight: passioFoodItemNutrionsForSelectedSize.weight,
        vitaminA: passioFoodItemNutrionsForSelectedSize.vitaminA,
        calcium: passioFoodItemNutrionsForSelectedSize.calcium,
        calories: passioFoodItemNutrionsForSelectedSize.calories,
        carbs: passioFoodItemNutrionsForSelectedSize.carbs,
        cholesterol: passioFoodItemNutrionsForSelectedSize.cholesterol,
        fat: passioFoodItemNutrionsForSelectedSize.fat,
        fibers: passioFoodItemNutrionsForSelectedSize.fibers,
        iron: passioFoodItemNutrionsForSelectedSize.iron,
        polyunsaturatedFat:
          passioFoodItemNutrionsForSelectedSize.polyunsaturatedFat,
        potassium: passioFoodItemNutrionsForSelectedSize.potassium,
        protein: passioFoodItemNutrionsForSelectedSize.protein,
        satFat: passioFoodItemNutrionsForSelectedSize.satFat,
        sodium: passioFoodItemNutrionsForSelectedSize.sodium,
        sugars: passioFoodItemNutrionsForSelectedSize.sugars,
        transFat: passioFoodItemNutrionsForSelectedSize.transFat,
        vitaminC: passioFoodItemNutrionsForSelectedSize.vitaminC,
        vitaminD: passioFoodItemNutrionsForSelectedSize.vitaminD,
      };
      const data: FoodItemModel = {
        foodData: passioFoodItem,
        nutritions: nutrientsValue,
        toppings: null,
        image: '',
      };
      dispatch(addSelectedFoodItem(data));
      navigate(NavigatorNames.receipeCardNew, {
        isFrom: 3,
        isFromRecent: false,
        mealType: mealType,
        date: date,
        isFavorite: false,
        type: 'FOOD',
        portionType: 1,
        notes: '',
        mealId: '',
        dateLogged: '',
        isScanned: true,
        isFromCameraScan: true,
        isFromFoodJournal: false,
        isDirectLog: true,
      });
    } catch (error) {}
  };

  const styles = StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: AppColors.lightGreen,
    },
    backIcon: {
      width: verticalScale(20),
      height: verticalScale(20),
      objectFit: 'contain',
    },
    backIconWrapper: {
      width: verticalScale(30),
      height: verticalScale(30),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlayContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // White with transparency
    },
    transparentBox: {
      width: moderateScale(260),
      height: moderateScale(260),
      backgroundColor: 'transparent', // Clear center
      position: 'relative', // Ensure the borders are placed inside the box
      overflow: 'hidden',
    },
    scanningLine: {
      position: 'absolute',
      top: 0,
      left: (width - moderateScale(260)) / 2,
      // right: 0,
      height: scale(2), // Thickness of the red line
      backgroundColor: 'red', // Color of the scanning line
      width: moderateScale(260),
      alignItems: 'center',
      justifyContent: 'center',
    },
    topLeftCorner: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: verticalScale(40),
      height: verticalScale(40),
      borderLeftWidth: moderateScale(4),
      borderTopWidth: moderateScale(4),
      borderColor: 'white',
    },
    // L-shaped border for top-right corner
    topRightCorner: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: verticalScale(40),
      height: verticalScale(40),
      borderRightWidth: moderateScale(4),
      borderTopWidth: moderateScale(4),
      borderColor: 'white',
    },
    // L-shaped border for bottom-left corner
    bottomLeftCorner: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: verticalScale(40),
      height: verticalScale(40),
      borderLeftWidth: moderateScale(4),
      borderBottomWidth: moderateScale(4),
      borderColor: 'white',
    },
    // L-shaped border for bottom-right corner
    bottomRightCorner: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: verticalScale(40),
      height: verticalScale(40),
      borderRightWidth: moderateScale(4),
      borderBottomWidth: moderateScale(4),
      borderColor: 'white',
    },
    buttonContainer: {
      position: 'absolute',
      top: moderateScale(40),
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center', // Distribute buttons evenly
      zIndex: 1, // Ensure buttons are on top of the camera view
    },
    button: {
      backgroundColor: AppColors.white,
      paddingHorizontal: moderateScale(15),
      paddingVertical: moderateScale(10),
      borderRadius: moderateScale(20),
      marginHorizontal: moderateScale(10),
      flexDirection: 'row',
      // width: scale(140),
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: AppColors.black,
      fontFamily: AppFonts.interMedium,
      fontSize: AppFontSize.intersize16,
      fontWeight: AppWeights.interMedium,
      marginLeft: moderateScale(10),
    },
    bottomView: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      backgroundColor: 'rgba(60, 48, 38, 0.4)',
      flexDirection: 'column',
      justifyContent: 'space-around',
      padding: 10,
      borderRadius: 20,
      alignSelf: 'center',
      height: screenDimensions.height / 3.5, //screenDimensions.height/3.5,
    },
    scanningView: {
      position: 'absolute',
      bottom: verticalScale(60),
      width: '90%',
      backgroundColor: 'rgba(60, 48, 38, 0.4)',
      justifyContent: 'space-around',
      borderRadius: 20,
      alignSelf: 'center',
      height: verticalScale(50),
      borderWidth: 1,
      borderColor: 'rgba(234, 235, 240, 0.15)',
    },
    scanningText: {
      alignSelf: 'center',
      color: '#FFFFFF',
      fontFamily: AppFonts.interSemibold,
      fontWeight: AppWeights.interSemibold,
      fontSize: AppFontSize.intersize18,
    },
    resultTitle: {
      color: 'rgba(255, 255, 255, 1)',
      alignSelf: 'center',
      fontFamily: AppFonts.interSemibold,
      fontSize: AppFontSize.intersize18,
      fontWeight: AppWeights.interSemibold,
    },
    centeredTitle: {
      flex: 1,
      textAlign: 'center',
      position: 'absolute',
    },
    iconLeft: {textAlign: 'left'},
  });
  const RenderItem = ({item}) => (
    <View
      style={{
        backgroundColor: 'rgba(234, 235, 240, 0.15)',
        marginVertical: moderateScale(5),
        marginHorizontal: moderateScale(5),
        borderRadius: moderateScale(20),
        borderWidth: moderateScale(2),
        borderColor: 'rgba(234, 235, 240, 0.15)',
      }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
        }}
        onPress={() => {
          getNutritionsForSelectedWeight(item);
        }}>
        <View
          style={{
            height: verticalScale(50),
            width: verticalScale(50),
            marginLeft: moderateScale(20),
            justifyContent: 'center',
          }}>
          <PassioIconView
            style={{
              height: verticalScale(40),
              width: verticalScale(40),
              alignSelf: 'center',
            }}
            config={{
              passioID: item.iconId,
              iconSize: IconSize.PX180,
            }}
          />
        </View>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text
            maxFontSizeMultiplier={1.4}
            style={{
              color: AppColors.white,
              marginHorizontal: moderateScale(10),
              fontFamily: AppFonts.interSemibold,
              fontSize: AppFontSize.intersize18,
              fontWeight: AppWeights.interSemibold,
              // marginTop: 0,
              marginRight: moderateScale(50),
            }}>
            {item.name}
          </Text>
          <Text
            maxFontSizeMultiplier={1.4}
            style={{
              color: AppColors.white,
              marginHorizontal: moderateScale(10),
              fontFamily: AppFonts.interMedium,
              fontSize: AppFontSize.intersize14,
              fontWeight: AppWeights.interMedium,
              // marginTop: 0,
              marginRight: moderateScale(50),
            }}>
            {item.details}
          </Text>
          {/* <Text
            maxFontSizeMultiplier={1.5}
            style={{
              color: '#D9D9D9',
              marginHorizontal: 10,
              fontFamily: AppFonts.interMedium,
              fontSize: AppFontSize.inter14,,
               fontWeight: AppWeights.interMedium,
              marginTop: 10,
              //  paddingBottom: 10,
            }}>
            {item.ingredients[0].referenceNutrients.calories.value +
              ' cal | ' +
              item.ingredients[0].amount.selectedQuantity +
              ' ' +
              item.ingredients[0].amount.selectedUnit}
          </Text> */}
        </View>
      </TouchableOpacity>
    </View>
  );
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View
        style={{
          backgroundColor: AppColors.lightGreen,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: moderateScale(20),
          marginTop: verticalScale(10),
        }}>
        <View style={styles.iconLeft}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backIconWrapper}>
            <Image
              source={require('../../../../assets/images/leftarrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            maxFontSizeMultiplier={1.4}
            style={[GlobalStyles.inAppHeading, styles.centeredTitle]}>
            {isFrom === 1 ? AppStrings.scanBarcode : AppStrings.scanFood}
          </Text>
        </View>
        <TouchableOpacity
          style={{width: verticalScale(40), height: verticalScale(40)}}
          onPress={() => {
            PassioSDK.enableFlashlight(!isSplshOn);
            setIsSplshOn(!isSplshOn);
          }}>
          {isSplshOn ? (
            <Image
              source={require('../../../../assets/images/splashon.png')}
              // resizeMode="contain"
              style={GlobalStyles.splashLight}
            />
          ) : (
            <Image
              source={require('../../../../assets/images/splashlight.png')}
              // resizeMode="contain"
              style={GlobalStyles.splashLight}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={{flex: 1, marginTop: moderateScale(10)}}>
        {imageUri !== null ? (
          <Image source={{uri: imageUri}} style={{flex: 1, width: '100%'}} />
        ) : (
          <DetectionCameraView style={{flex: 1, width: '100%'}} />
        )}

        {/* White Layer with Transparent Center */}
        <View style={styles.overlayContainer}>
          {/* Top Overlay */}
          <View
            style={[
              styles.overlay,
              {
                //  height: (height - boxSize) / 2 - verticalScale(50),
                //  backgroundColor: AppColors.black,
                width,
                flex: 1,
              },
            ]}
          />
          {/* Middle Section */}
          <View style={{flexDirection: 'row'}}>
            {/* Left Overlay */}
            <View
              style={[
                styles.overlay,
                {
                  width: (width - boxSize) / 2,
                  height: boxSize,
                  // backgroundColor: AppColors.black,
                },
              ]}
            />
            {isAnimating && (
              <Animated.View
                style={[
                  styles.scanningLine,
                  {
                    transform: [{translateY: lineTranslateY}], // Move line up and down
                  },
                ]}
              />
            )}

            {/* Transparent Center */}
            <View style={styles.transparentBox}>
              <View style={styles.topLeftCorner} />
              <View style={styles.topRightCorner} />
              <View style={styles.bottomLeftCorner} />
              <View style={styles.bottomRightCorner} />
            </View>
            {/* Right Overlay */}
            <View
              style={[
                styles.overlay,
                {width: (width - boxSize) / 2, height: boxSize},
              ]}
            />
          </View>
          {/* Bottom Overlay */}
          <View
            style={[styles.overlay, {height: (height - boxSize) / 2, width}]}
          />
        </View>
        <View style={styles.buttonContainer}>
          {/* <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigate(NavigatorNames.addFood, {
                mealType: mealType,
                date: date,
                isFromScanNewFood: true,
              })
            }>
            <Image
              source={require('../../../../assets/images/addfoodblack.png')}
              style={{width: 33, height: 22, marginLeft: 10}}
            />
            <Text maxFontSizeMultiplier={1.3} style={styles.buttonText}>
              New food
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.button} onPress={() => onScanImage()}>
            <Image
              source={require('../../../../assets/images/galleyblack.png')}
              style={{width: moderateScale(24), height: verticalScale(22)}}
            />
            <Text maxFontSizeMultiplier={1.3} style={styles.buttonText}>
              Gallery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {detectedCandidates !== undefined && detectedCandidates.length > 0 ? (
        <View style={styles.bottomView}>
          <Text maxFontSizeMultiplier={1.3} style={styles.resultTitle}>
            {detectedCandidates.length}{' '}
            {detectedCandidates.length === 1 ? 'Result found' : 'Results found'}
          </Text>

          <FlatList
            data={detectedCandidates}
            renderItem={({item}) => <RenderItem item={item} />}
            keyExtractor={item => item.id}
            style={{marginTop: 10}}
          />
        </View>
      ) : (
        <View style={styles.scanningView}>
          <Text maxFontSizeMultiplier={1.4} style={styles.scanningText}>
            {isphotoScanning ? 'Analyzing photo...' : 'Scanning...'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
