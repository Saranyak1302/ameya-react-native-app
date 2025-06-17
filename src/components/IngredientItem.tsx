/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {
  PassioIconView,
  IconSize,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import {formatValue} from '../utils/Helper';
import {IngredientItemType} from '../models/IngredientModel';
import { moderateScale, verticalScale } from 'react-native-size-matters';

interface IngredientItemProps {
  item: IngredientItemType;
  isLastItem: boolean;
  // truncateText: (text: string) => string;
  actionBtnImage?: any;
  actionBtnNeed: boolean;
  clickHandler?: () => void;
  removeHandler?: () => void;
}

const IngredientItem: React.FC<IngredientItemProps> = ({
  item,
  isLastItem,
  // truncateText,
  actionBtnImage,
  actionBtnNeed,
  clickHandler,
  removeHandler,
}) => {
  return (
    <View style={[styles.receipeItem, isLastItem && {marginBottom: 0}]}>
      <TouchableOpacity style={[styles.buttonWrapper]} onPress={clickHandler}>
        <View style={styles.flexedRow}>
          {item.image && item.image.length > 1 ? (
            <Image style={styles.receipeItemImage} source={item.image} />
          ) : (
            <View style={styles.imgContainer}>
              <PassioIconView
                style={{
                  height: verticalScale(36),
                  width: verticalScale(36),
                  // alignSelf: 'center',
                }}
                config={{
                  passioID: item?.iconId,
                  iconSize: IconSize.PX180,
                }}
              />
            </View>
          )}

          <View style={styles.flex1}>
            <Text maxFontSizeMultiplier={1.4} style={styles.title}>
              {item.name}
            </Text>
            <Text maxFontSizeMultiplier={1.4} style={styles.description}>
              {formatValue(item.referenceNutrients?.calories?.value)}{' '}
              {item.referenceNutrients?.calories?.unit} |{' '}
              {item.amount.selectedQuantity} {item.amount.selectedUnit}
            </Text>
          </View>
        </View>
        {actionBtnNeed && (
          <TouchableOpacity style={styles.actionBtn} onPress={removeHandler}>
            <Image style={styles.actionImage} source={actionBtnImage} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  receipeItem: {
    display: 'flex',
    flexDirection: 'row',
    gap: moderateScale(12),
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },

  receipeItemImage: {
    width: verticalScale(36),
    height: verticalScale(36),
    objectFit: 'cover',
  },
  imgContainer: {
    marginLeft: 0,
    justifyContent: 'center',
    borderRadius: moderateScale(4), // Apply borderRadius to the wrapper View
    overflow: 'hidden', // Ensure the content is clipped within the border radius
    height: verticalScale(36), // Match the size of the PassioIconView
    width: verticalScale(36), // Match the size of the PassioIconView
  },

  actionImage: {
    width: verticalScale(34),
    height: verticalScale(34),
    // objectFit: 'cover',
  },
  flexedRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: moderateScale(12),
    alignItems: 'center',
    flex: 1,
  },

  title: {
    fontSize: AppFontSize.intersize18,
    color: AppColors.buttonDarkBlue,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    //lineHeight: scale(16),
    marginBottom: moderateScale(4),
    marginRight: moderateScale(20),
  },
  description: {
    fontSize: AppFontSize.intersize16,
    color: '#6E6E6E',
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    //lineHeight: scale(16),
  },
  actionBtn: {
    // width: 32,
    // height: 32,
  },
  buttonWrapper: {
    flex: 1,
    backgroundColor: AppColors.bgLightGrey,
    borderColor: '#EAEBF0',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(16),
    paddingLeft: moderateScale(12),
    paddingRight: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
});

export default IngredientItem;
