import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import Modal from 'react-native-modal';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {CustomButton} from './CustomButton';
import {ServingSize} from '../models/FoodJournalModel';
import {SERVINGS} from '../utils/Constants';
import AlertModal from './AlertModal';
import { moderateScale, verticalScale } from 'react-native-size-matters';

type TotalQuantityModalProps = {
  totalQuantityModalVisible: boolean;
  onClose: () => void;
  onBack: () => void;
  onClear: () => void;
  onNext: (servingSize: ServingSize) => void;
  totalQuantity: string;
  setTotalQuantity: any;
  servingSizes: ServingSize[];
  servingSize: string;
  save?: boolean;
  dataChanged: (value: boolean) => void;
};

const TotalQuantityModal = ({
  totalQuantityModalVisible,
  onClose,
  onBack,
  onClear,
  onNext,
  totalQuantity,
  setTotalQuantity,
  servingSizes,
  servingSize,
  save,
  dataChanged,
}: TotalQuantityModalProps) => {
  const [selectedServingIndex, setSelectedServingIndex] = useState(0);
  const [servingList, setServingList] = useState<ServingSize[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const [gap, setGap] = useState(1);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const ITEM_HEIGHT = moderateScale(44);
  let ind = Number();

  useEffect(() => {
    const data =
      servingSizes &&
      servingSizes?.length > 0 &&
      servingSizes[0].unitName !== 'string'
        ? servingSizes
        : SERVINGS["singular"];
    setServingList(data);
  }, [servingSizes]);

  useEffect(() => {
    if(parseFloat(totalQuantity) > 1) {
      setServingList(SERVINGS["plural"]);
    }
    else{
      setServingList(SERVINGS["singular"]);
    }
  }, [totalQuantity])

  useEffect(() => {
    if (totalQuantityModalVisible && flatListRef.current) {
      ind = servingList?.findIndex(item => item.unitName === servingSize);
      if (ind !== -1 && selectedServingIndex === 0) {
        flatListRef.current.scrollToIndex({
          index: ind,
          animated: true,
        });
        setSelectedServingIndex(ind);
      }
    }
  }, [servingList, servingSize, totalQuantityModalVisible]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y - 10;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setSelectedServingIndex(index);
  };

  const calculateOpacity = (index: number) => {
    const distance = Math.abs(index - selectedServingIndex);
    if (distance === 0) {
      return 1;
    }
    if (distance === 1) {
      return 0.8;
    }
    if (distance === 2) {
      return 0.5;
    }
    if (distance === 3) {
      return 0.3;
    }
    return 0.1;
  };

  useEffect(() => {
    const backAction = () => {
      if (totalQuantityModalVisible) {
        onBack && onBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleModal = () => {
    dataChanged(false);
    onClose();
  };
  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const renderItem = ({item, index}: {item: ServingSize; index: number}) => {
    const opacity = calculateOpacity(index);
    return (
      <View style={[styles.itemContainer, {height: ITEM_HEIGHT}]}>
        <Text
        maxFontSizeMultiplier={1.3}
          onPress={() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({
                index: index,
                animated: true,
              });
              setSelectedServingIndex(index);
              if (index !== ind) {
                dataChanged(true);
              }
            }
          }}
          style={[
            styles.itemText,
            {
              fontFamily:
                opacity === 1 ? AppFonts.interMedium : AppFonts.interRegular,
              fontWeight: opacity === 1 ? '500' : '400',
              fontSize: opacity >= 0.8 ? AppFontSize.intersize20 : AppFontSize.intersize18,
              color:
                opacity === 1
                  ? AppColors.buttonDarkBlue
                  : opacity >= 0.8
                  ? AppColors.placeHolderColor
                  : opacity >= 0.5
                  ? AppColors.secondLight
                  : opacity >= 0.3
                  ? AppColors.thirdLight
                  : AppColors.fourthLight,
              backgroundColor: opacity === 1 ? AppColors.sliderBg : undefined,
              paddingVertical: opacity === 1 ? 2 : undefined,
            },
          ]}>
          {item?.unitName}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        isVisible={totalQuantityModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal}
        propagateSwipe={true}>
        <View style={styles.modalParent}>
        <KeyboardAvoidingView
            behavior='padding'
            style={{flex: 1}}>
         
          <View style={styles.headerBtnComponent}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                dataChanged(false);
                onBack();
              }}>
              <Image
                style={styles.leftArrowImg}
                resizeMode="contain"
                source={require('../../assets/images/leftarrow.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                dataChanged(false) 
                onClear();
              }}
              style={styles.cancelBtn}>
              <Text maxFontSizeMultiplier={1.2} style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
          {/* <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled" // Helps to move content up
        > */}
            <Text style={styles.headerText} maxFontSizeMultiplier={1.3}>
              Total Quantity
            </Text>
            <Text style={styles.descText} maxFontSizeMultiplier={1.3}>
              Tell us how many servings your recipe makes
              <Text style={styles.descEgText} maxFontSizeMultiplier={1.3}>
                {' '}
                e.g. Cookie recipe makes 20 pieces
              </Text>
            </Text>
            <View style={styles.quantityHeader}>
              <Text style={styles.inputLabelText} maxFontSizeMultiplier={1.3}>
                Total Quantity
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setAlertTitle('Total Quantity');
                  setAlertMessage(
                    'Enter the total number of servings or portions the recipe makes.',
                  );
                  setShowAlert(true);
                }}>
                <Image
                  source={require('../../assets/images/info.png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <TextInput
              maxFontSizeMultiplier={1.3}
              style={styles.input}
              placeholder="Quantity"
              value={totalQuantity}
              keyboardType="decimal-pad"
              returnKeyType="done"
              placeholderTextColor={AppColors.placeHolderColor}
              onChangeText={text => {
                // Remove any leading or trailing spaces and prevent empty string
                const trimmedText = text.trim();
                if (trimmedText === '' && text !== '') {
                  return; // If invalid, do nothing (ignore input)
                }
                setTotalQuantity(text);
                dataChanged(true);
              }}
            />
           {/* </ScrollView> */}
            <View
              onLayout={event => setGap(event.nativeEvent.layout.height)}
              style={styles.servingListContainer}>
              <FlatList
                data={servingList}
                ref={flatListRef}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                keyExtractor={(_, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                scrollEnabled
                onScroll={handleScroll}
                contentContainerStyle={{
                  paddingTop: (gap - 100) / 2,
                  paddingBottom: (gap - 100) / 2,
                }}
              />
            </View>
            <CustomButton
              onPress={() => {
                const trimmedText = totalQuantity.trim();
                const regex = /^[0-9a-zA-Z\s.]+$/;
                if (
                  trimmedText === '' ||
                  trimmedText === '0' ||
                  !regex.test(trimmedText) ||
                  (trimmedText.match(/\./g) || []).length > 1
                ) {
                  setAlertTitle('Invalid Quantity');
                  setAlertMessage(
                    'Please check the quantity and ensure it is a valid number.',
                  );
                  setShowAlert(true);
                  return;
                } else if (selectedServingIndex >= servingList.length) {
                  setAlertTitle('Invalid Serving Unit');
                  setAlertMessage(
                    'Please select a serving unit.',
                  );
                  setShowAlert(true);
                  return;
                }
                onNext && onNext(servingList[selectedServingIndex]);
              }}
              title={save ? 'Save Changes' : 'Next'}
              style={styles.nextBtn}
            />
          </View>
          </KeyboardAvoidingView>
        </View>
        {showAlert && (
          <AlertModal
            alertModalVisible={showAlert}
            title={alertTitle}
            message={alertMessage}
            onClose={() => {
              setShowAlert(false);
              setAlertTitle('');
              setAlertMessage('');
            }}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modal: {
    justifyContent: 'flex-start',
    margin: 0,
    marginTop: '10%',
  },
  modalParent: {
    backgroundColor: '#fff',
    height: '100%',
    borderTopLeftRadius: moderateScale(12),
    borderTopRightRadius: moderateScale(12),
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: moderateScale(20),
    flex: 1,
  },
  cancelBtn: {padding: moderateScale(20)},
  cancelText: {
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    textAlign: 'right',
    color: AppColors.hyperLinkTextColor,
  },
  headerText: {
    fontFamily: AppFonts.interBold,
    fontSize: AppFontSize.intersize26,
    fontWeight: AppWeights.interBold,
    textAlign: 'center',
    color: AppColors.textHeadingBlack,
    marginTop: moderateScale(12),
  },
  descText: {
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    textAlign: 'center',
    color: AppColors.textHeadingBlack,
    marginTop: moderateScale(24),
  },
  descEgText: {
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    textAlign: 'center',
    color: AppColors.buttonDarkBlue,
  },
  quantityHeader: {
    flexDirection: 'row',
    gap: moderateScale(4),
    marginTop: moderateScale(48),
    alignItems: 'center',
  },
  inputLabelText: {
    color: AppColors.textFieldTextBlack,
    borderRadius: moderateScale(8),
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
  },
  infoIcon: {width: verticalScale(15), height: verticalScale(15), alignSelf: 'center', padding: moderateScale(2)},
  input: {
    borderColor: AppColors.borderGrey,
    borderWidth: moderateScale(1),
    color: AppColors.headingBlack,
    borderRadius: moderateScale(8),
    marginTop: moderateScale(10),
    marginBottom: moderateScale(38),
    padding: moderateScale(12),
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
  },
  nextBtn: {
    position: 'absolute',
    bottom: moderateScale(15),
    alignSelf: 'center',
    width: '100%',
  },
  ingredientHeadContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: moderateScale(40),
  },
  ingredientHeader: {gap: moderateScale(2)},
  ingredientHeadText: {
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.textHeadingBlack,
  },
  ingredientDescText: {
    fontFamily: AppFonts.interRegular,
    fontSize: AppFontSize.intersize14,
    fontWeight: AppWeights.interRegular,
    color: AppColors.descColor,
  },
  addBtn: {
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    borderWidth: moderateScale(1),
    backgroundColor: AppColors.lightBack,
    borderColor: AppColors.lightBorder,
    height: verticalScale(34),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    color: AppColors.buttonDarkBlue,
  },
  receipeItemImage: {
    width: verticalScale(36),
    height: verticalScale(36),
    borderRadius: moderateScale(4),
    objectFit: 'cover',
  },
  imgContainer: {
    justifyContent: 'center',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  actionImage: {
    width: verticalScale(36),
    height: verticalScale(36),
  },
  headerBtnComponent: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  leftArrowImg: {
    width: moderateScale(20),
    height: verticalScale(24),
  },
  backBtn: {padding: moderateScale(20)},
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  itemText: {
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
  },
  servingListContainer: {
    flex: 1,
    paddingBottom: 85,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
});

export default TotalQuantityModal;
