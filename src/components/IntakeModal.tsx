import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import Modal from 'react-native-modal';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {AppColors} from '../theme/AppColors';
import {CustomButton} from './CustomButton';
import AlertModal from './AlertModal';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useSelector} from 'react-redux';
import {FoodItemModel} from '../models/FoodJournalModel';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

type IntakeModalProps = {
  intakeModalVisible: boolean;
  onClose: () => void;
  onClear: () => void;
  onSave: (intake: string | number, type: string) => void;
};

const IntakeModal = ({
  intakeModalVisible,
  onClose,
  onClear,
  onSave,
}: IntakeModalProps) => {
  const [selectedIntakeTypeIndex, setSelectedIntakeTypeIndex] = useState(1);
  const [intakeTypeList, setIntakeTypeList] = useState<
    {id: number; type: string}[]
  >([]);
  const intakePortionlist = [
    {id: 1, name: '1/10', value: 10, desc: 'One Tenth'},
    {id: 2, name: '1/4', value: 25, desc: 'Quarter'},
    {id: 3, name: '1/2', value: 50, desc: 'Half'},
    {id: 4, name: '3/4', value: 75, desc: '3 Quarters'},
    {id: 5, name: '1', value: 100, desc: 'Whole'},
  ];
  const [intake, setIntake] = useState<string>();
  const [portionSize, setPortionSize] =
    useState<(typeof intakePortionlist)[0]>();
  const [intakeType, setIntakeType] = useState('Percentage');

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const selectedItem: FoodItemModel | null = useSelector(
    (state: any) => state.selectedFood.data,
  );

  useEffect(() => {
    if (selectedItem) {
      const list = [
        {
          id: 1,
          type: selectedItem?.foodData?.amount?.selectedUnit ?? '-',
        },
        {id: 2, type: 'Percentage'},
      ];
      setIntakeTypeList(list);
      setIntakeType(
        selectedItem?.intake?.unit === '%'
          ? 'Percentage'
          : selectedItem?.foodData?.amount?.selectedUnit,
      );
      const intakeAmount =
        selectedItem?.intake?.unit === '%'
          ? selectedItem?.intake?.intakeValue?.toString() === '0'
            ? '100'
            : selectedItem?.intake?.intakeValue?.toString()
          : selectedItem?.intake?.intakeValue?.toString();
      setIntake(intakeAmount);
      if (
        selectedItem?.intake?.unit?.toLowerCase().toString() === 'percentage' ||
        (selectedItem?.intake?.unit?.toLowerCase().toString() === '%' &&
          intakeAmount)
      ) {
        const portion = intakePortionlist.find(
          item => item.value === Number(intakeAmount),
        );
        setPortionSize(portion);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  useEffect(() => {
    if (intake !== '' && intakeType === 'Percentage') {
      const portion = intakePortionlist.find(
        item => item.value === Number(intake),
      );
      setPortionSize(portion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intake, intakeType]);

  const ITEM_HEIGHT = moderateScale(44);

  useEffect(() => {
    if (intakeModalVisible) {
      const ind = intakeTypeList?.findIndex(item => item.type === intakeType);
      if (ind !== -1) {
        setSelectedIntakeTypeIndex(ind);
      }
    }
  }, [intakeType, intakeModalVisible, intakeTypeList]);

  const toggleModal = () => {
    onClose();
  };

  const renderItem = ({item, index}: {item: any; index: number}) => {
    const isSelected = index === selectedIntakeTypeIndex;
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          setIntake('');
          setPortionSize(undefined);
          setSelectedIntakeTypeIndex(index);
          setIntakeType(item.type);
        }}
        style={[styles.itemContainer, {height: ITEM_HEIGHT}]}>
        <Text
          maxFontSizeMultiplier={1.3}
          style={[
            styles.itemText,
            isSelected ? styles.selectedItem : styles.unSelectedItem,
          ]}>
          {item?.type}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        isVisible={intakeModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal}
        propagateSwipe={true}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.modalParent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}>
          <View style={styles.headerBtnComponent}>
            <TouchableOpacity onPress={onClear} style={styles.cancelBtn}>
              <Text maxFontSizeMultiplier={1.2} style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.headerText} maxFontSizeMultiplier={1.3}>
              Amount
            </Text>
            <Text style={styles.descText} maxFontSizeMultiplier={1.3}>
              Please enter the how much of the recipe you consumed in this meal
              either in Portions or Quantity Consumed.
            </Text>
            <Text style={styles.inputLabelText} maxFontSizeMultiplier={1.3}>
              Portion
            </Text>
            <View
              style={[
                styles.portionContainer,
                intakeType !== 'Percentage' && styles.disabled,
              ]}>
              {intakePortionlist.map(item => {
                const disabled = intakeType !== 'Percentage';
                return (
                  <TouchableOpacity
                    disabled={disabled}
                    key={item.id}
                    onPress={() => {
                      setPortionSize(item);
                      setIntake(item.value.toString());
                    }}
                    style={[
                      styles.portionItem,
                      item.id === portionSize?.id &&
                        !disabled &&
                        styles.selectedPortion,
                    ]}>
                    <Text
                    maxFontSizeMultiplier={1.3}
                      style={[
                        styles.portionName,
                        item.id === portionSize?.id &&
                          !disabled && {color: AppColors.buttonDarkBlue},
                      ]}>
                      {item.name}
                    </Text>
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={[
                        styles.portionDesc,
                        item.id === portionSize?.id &&
                          !disabled && {color: AppColors.buttonDarkBlue},
                      ]}>
                      {item.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.inputLabelText} maxFontSizeMultiplier={1.3}>
              Amount
            </Text>
            <View style={styles.input}>
              <TextInput
                maxFontSizeMultiplier={1.3}
                style={styles.inputText}
                placeholder="0"
                value={intake?.toString()}
                keyboardType="decimal-pad"
                returnKeyType="done"
                placeholderTextColor={AppColors.placeHolderColor}
                onChangeText={text => {
                  setPortionSize(undefined);
                  // Remove any leading or trailing spaces and prevent empty string
                  const trimmedText = text.trim();
                  if (trimmedText === '' && text !== '') {
                    return; // If invalid, do nothing (ignore input)
                  }
                  setIntake(text);
                }}
              />
              <Text style={styles.typeText} maxFontSizeMultiplier={1.3}>
                {intakeType === 'Percentage'
                  ? '%'
                  : selectedItem?.foodData?.amount?.selectedUnit}
              </Text>
            </View>
            <View style={styles.servingListContainer}>
              {intakeTypeList.map((item, index) => renderItem({item, index}))}
            </View>
          </View>
        </KeyboardAwareScrollView>
        <View style={styles.nextBtnCon}>
          <CustomButton
            onPress={() => {
              Keyboard.dismiss();
              const trimmedText = intake?.toString().trim();
              const regex = /^[0-9]*\.?[0-9]*$/;
              if (
                trimmedText === '' ||
                !trimmedText ||
                trimmedText === '0' ||
                !regex.test(trimmedText) ||
                (trimmedText.match(/\./g) || []).length > 1
              ) {
                setAlertTitle('');
                setAlertMessage(
                  'The amount eaten must be greater than zero. Please enter how much you ate to the food log',
                );
                setShowAlert(true);
                return;
              } else if (
                intakeType !== 'Percentage' &&
                Number(trimmedText) >
                  Number(selectedItem?.foodData?.amount?.selectedQuantity)
              ) {
                setAlertTitle('');
                setAlertMessage(
                  `The amount eaten must be less than the total quantity of ${selectedItem?.foodData?.amount?.selectedQuantity}. Please enter how much you ate to the food log`,
                );
                setShowAlert(true);
                return;
              } else if (
                intakeType === 'Percentage' &&
                Number(trimmedText) > 100
              ) {
                setAlertTitle('');
                setAlertMessage(
                  'The amount eaten must be less than 100%. Please enter how much you ate in the food log.',
                );
                setShowAlert(true);
                return;
              } else if (trimmedText && intakeType) {
                onSave &&
                  onSave(
                    trimmedText,
                    intakeType === 'Percentage' ? '%' : intakeType,
                  );
              }
            }}
            title="Save"
            style={styles.nextBtn}
          />
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

const isTablet = DeviceInfo.isTablet();

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
    borderTopLeftRadius: isTablet ? 24 : 12,
    borderTopRightRadius: isTablet ? 24 : 12,
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: moderateScale(20),
    flex: 1,
  },
  cancelBtn: {paddingHorizontal: moderateScale(20), alignSelf: 'flex-end', paddingVertical: moderateScale(10)},
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
    marginTop: moderateScale(0),
  },
  descText: {
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    textAlign: 'center',
    color: AppColors.textHeadingBlack,
    marginTop: moderateScale(5),
  },
  descEgText: {
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    textAlign: 'center',
    color: AppColors.buttonDarkBlue,
  },
  inputLabelText: {
    color: AppColors.textFieldTextBlack,
    borderRadius: moderateScale(8),
    marginTop: moderateScale(20),
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
  },
  input: {
    borderColor: AppColors.borderGrey,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    marginTop: moderateScale(10),
    flexDirection: 'row',
    marginBottom: moderateScale(38),
    alignItems: 'center',
  },
  inputText: {
    color: AppColors.headingBlack,
    padding: moderateScale(12),
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize18,
    flex: 1,
    fontWeight: AppWeights.interMedium,
  },
  nextBtnCon: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: '100%',
    padding: moderateScale(20),
    backgroundColor: 'white',
  },
  typeText: {
    color: AppColors.buttonDarkBlue,
    fontFamily: AppFonts.interRegular,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interRegular,
    marginRight: moderateScale(12),
  },
  nextBtn: {
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
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  leftArrowImg: {
    width: verticalScale(20),
    height: verticalScale(24),
  },
  backBtn: {padding: moderateScale(20)},
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: moderateScale(10),
  },
  itemText: {
    borderRadius: moderateScale(8),
    width: '100%',
    textAlign: 'center',
  },
  servingListContainer: {
    flex: 1,
    paddingBottom: moderateScale(85),
    marginBottom: moderateScale(10),
  },
  selectedItem: {
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize20,
    color: AppColors.buttonDarkBlue,
    backgroundColor: AppColors.sliderBg,
    paddingVertical: moderateScale(2),
    fontWeight: AppWeights.interMedium,
  },
  unSelectedItem: {
    fontFamily: AppFonts.interRegular,
    fontSize: AppFontSize.intersize20,
    color: AppColors.placeHolderColor,
    backgroundColor: undefined,
    fontWeight: AppWeights.interRegular,
    paddingVertical: undefined,
  },
  portionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: moderateScale(4),
    marginTop: moderateScale(14),
  },
  disabled: {opacity: 0.6},
  selectedPortion: {
    borderColor: AppColors.buttonDarkBlue,
    backgroundColor: AppColors.portionBg,
  },
  portionItem: {
    alignItems: 'center',
    borderWidth: moderateScale(1),
    flex: 1,
    borderColor: AppColors.borderGrey,
    borderRadius: moderateScale(8),
    gap: isTablet ? moderateScale(8) : moderateScale(6),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(2),
    maxWidth: isTablet ? moderateScale(90) : moderateScale(60),
  },
  portionName: {
    fontSize: AppFontSize.intersize18,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    color: AppColors.headingBlack,
  },
  portionDesc: {
    fontSize: AppFontSize.intersize11,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    textAlign: 'center',
    color: AppColors.descriptionLightGrey,
  },
});

export default IntakeModal;
