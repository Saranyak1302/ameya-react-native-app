import React, {ReactElement, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import Modal from 'react-native-modal';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {CustomButton} from './CustomButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import IngredientItem from './IngredientItem';
import {
  PassioIconView,
  IconSize,
  PassioIngredient,
  PassioSDK,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import {NavigatorNames} from '../navigators/tabs/NavigatorsNames';
import {navigate} from '../navigators/utils/Utils';
import AlertModal from './AlertModal';
import { AlertButtons } from '../types/CommonTypes';
import { moderateScale, verticalScale } from 'react-native-size-matters';

type CustomRecipeModalProps = {
  customRecipeModalVisible: boolean;
  onClose: () => void;
  onClear: () => void;
  onNext: () => void;
  onAddIngredient: () => void;
  ingredientList: PassioIngredient[];
  recipeName: string;
  setRecipeName: any;
  dataChanged: (value: boolean) => void;
  onDeleteIngredient: (value: number) => void;
  onEditIngredient: (value: number) => void;
};

const CustomRecipeModal = ({
  customRecipeModalVisible,
  onClose,
  onClear,
  onNext,
  onAddIngredient,
  ingredientList,
  recipeName,
  setRecipeName,
  dataChanged,
  onDeleteIngredient,
  onEditIngredient,
}: CustomRecipeModalProps) => {
  const toggleModal = () => {
    dataChanged(false);
    onClose();
  };
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | ReactElement>('');
  const [alertButtons, setAlertButtons] = useState<AlertButtons>();
  const clearAlert = () => {
    setShowAlert(false);
    setAlertTitle('');
    setAlertMessage('');
    setAlertButtons(undefined);
  };
  return (
    <View style={styles.container}>
      <Modal
        isVisible={customRecipeModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal}
        propagateSwipe={true}>
          <KeyboardAvoidingView
        behavior='padding'
        style={{flex: 1}}>
          <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled" // Helps to move content up
        >
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClear}>
            <Text maxFontSizeMultiplier={1.2} style={styles.cancelText}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerText} maxFontSizeMultiplier={1.3}>
            Custom Recipe Name
          </Text>
          <Text style={styles.descText} maxFontSizeMultiplier={1.3}>
            Give your custom recipe a name that’s distinct.
            <Text style={styles.descEgText} maxFontSizeMultiplier={1.3}>
              {' '}
              e.g. Mom’s chocolate chip cookies
            </Text>
          </Text>

          <TextInput
            maxFontSizeMultiplier={1.3}
            style={styles.input}
            placeholder="Custom Recipe Name"
            value={recipeName}
            placeholderTextColor={AppColors.placeHolderColor}
            onChangeText={text => {
              setRecipeName(text);
              dataChanged(true);
            }}
          />
          <View style={styles.ingredientHeadContainer}>
            <View style={styles.ingredientHeader}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={styles.ingredientHeadText}>
                Ingredients
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={styles.ingredientDescText}>
                Add all the ingredients of your recipe.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                onAddIngredient && onAddIngredient();
              }}>
              <Text maxFontSizeMultiplier={1.3} style={styles.addText}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={{
              gap: moderateScale(12),
              marginTop: moderateScale(32),
              paddingBottom: moderateScale(100),
            }}>
            {ingredientList?.map((item, index) => (
              <TouchableOpacity key={item.id || `ingredient-${index}`} onPress={()=>{
                onEditIngredient(index);
              }}>
              <View
                key={item.id}
                style={{
                  borderColor: '#EAEBF0',
                  backgroundColor: '#F4F4F6',
                  borderWidth: moderateScale(1),
                  paddingVertical: moderateScale(10),
                  paddingHorizontal: moderateScale(12),
                  borderRadius: moderateScale(8),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: moderateScale(12),
                    flex: 1,
                  }}>
                  {item?.image && item.image?.length > 1 ? (
                    <Image
                      style={styles.receipeItemImage}
                      source={item?.image}
                    />
                  ) : (
                    <View style={styles.imgContainer}>
                      <PassioIconView
                        style={styles.receipeItemImage}
                        config={{
                          passioID: item?.iconId,
                          iconSize: IconSize.PX180,
                        }}
                      />
                    </View>
                  )}
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{
                      fontFamily: AppFonts.interMedium,
                      fontWeight: AppWeights.interMedium,
                      fontSize: AppFontSize.intersize18,
                      flex: 1,
                      color: AppColors.textHeadingBlack,
                    }}>
                    {item.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    
                    const buttons: AlertButtons = [
                      {text: 'Cancel', onPress: () => {}},
                      {
                        text: 'Continue',
                        onPress: () => {
                          onDeleteIngredient(index);
                        },
                      },
                    ];
                    setAlertButtons(buttons);
                    setAlertTitle('Remove Ingredient');
                    setAlertMessage(
                      'Are you sure you want to remove the ingredient? This action cannot be reversed.',
                    );
                    setShowAlert(true);
                  }}>
                  <Image
                    source={require('../../assets/images/delete.png')}
                    style={{
                      width: verticalScale(32),
                      height: verticalScale(32),
                      objectFit: 'cover',
                    }}
                  />
                </TouchableOpacity>
                
              </View>
              </TouchableOpacity>
              // <IngredientItem
              //   item={item}
              //   isLastItem={false}
              //   actionBtnNeed={true}
              //   actionBtnImage={require('../../assets/images/delete.png')}
              // />
            ))}
          </ScrollView>

          <CustomButton onPress={onNext} title="Next" style={styles.nextBtn} />
          {showAlert && (
             <AlertModal
              alertModalVisible={showAlert}
             title={alertTitle}
             message={alertMessage}
             buttons={
              alertButtons && alertButtons.length > 0 ? alertButtons : undefined
             }
             onClose={clearAlert}
           />
        )}
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modal: {
    justifyContent: 'flex-start',
    margin: 0,
    marginTop: '10%',
    backgroundColor: 'white'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: moderateScale(20),
    height: '100%',
    borderTopLeftRadius: moderateScale(12),
    borderTopRightRadius: moderateScale(12),
  },
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
    marginTop: moderateScale(32),
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
  input: {
    borderColor: AppColors.borderGrey,
    borderWidth: moderateScale(1),
    color: AppColors.headingBlack,
    borderRadius: moderateScale(8),
    marginTop: moderateScale(32),
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
  ingredientHeader: {gap: moderateScale(2), width: screenDimensions.width - moderateScale(110)},
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
    color: AppColors.descColor
  },
  addBtn: {
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(24),
    borderWidth: moderateScale(1),
    backgroundColor: AppColors.lightBack,
    borderColor: AppColors.lightBorder,
    height: verticalScale(36),
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
    // objectFit: 'cover',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
});

export default CustomRecipeModal;
