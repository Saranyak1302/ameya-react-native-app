/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {
  IconSize,
  PassioIconView,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import { toTitleCase } from '../utils/Helper';

interface ReceipeItemProps {
  rawItem?: any;
  type?: string;
  item: {
    id: string;
    isfavorite: boolean;
    receipe: string;
    calories: string;
    quantity: string;
    image: any;
    brandName: string;
  };
  isLastItem: boolean;
  truncateText: (text: string) => string;
  actionBtnImage?: any;
  actionBtnImageTint?: any;
  actionBtnNeed: boolean;
  actionBtnClickHandler?: (id: string, status: boolean) => void;
  clickHandler?: (item: any) => void;
}

const ReceipeItem: React.FC<ReceipeItemProps> = ({
  type,
  item,
  isLastItem,
  truncateText,
  actionBtnImage,
  actionBtnNeed,
  actionBtnClickHandler,
  clickHandler,
  rawItem,
  actionBtnImageTint,
}) => {
  return clickHandler ? (
    <View
      style={[
        styles.receipeItem,
        isLastItem && {marginBottom: verticalScale(120)},
      ]}>
      <TouchableOpacity
        onPress={() => {
          clickHandler(rawItem as any);
        }}
        style={{
          width: actionBtnNeed ? '85%' : '100%',
          paddingTop: moderateScale(21),
          paddingBottom: moderateScale(21),
          paddingLeft: moderateScale(16),
        }}>
        <View style={styles.flexedRow}>
          {type === 'search' ? (
            <PassioIconView
              style={styles.receipeItemImage}
              config={{
                passioID: item.image,
                iconSize: IconSize.PX180,
              }}
            />
          ) : item.image === '' ? (
            <PassioIconView
              style={styles.receipeItemImage}
              config={{
                passioID: item?.metadata?.data?.foodData?.iconId,
                iconSize: IconSize.PX180,
              }}
            />
          ) : (
            <Image
              style={styles.receipeItemImage}
              source={
                typeof item.image === 'string' ? {uri: item.image} : item.image
              }
            />
          )}
          <View style={{paddingRight: moderateScale(54)}}>
            <Text
              maxFontSizeMultiplier={1.4}
              style={styles.title}
              numberOfLines={2}>
              {/* {truncateText(item.receipe)} */}
              {item.receipe}
            </Text>
            <Text
              maxFontSizeMultiplier={1.4}
              style={styles.description}
              numberOfLines={2}>
              {/* {truncateText(item.receipe)} */}
              {item.brandName ? toTitleCase(item.brandName) : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {actionBtnNeed && (
        <TouchableOpacity
          style={{
            width: '15%',
            marginLeft: 'auto',
            marginRight: moderateScale(16),
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
          onPress={() => actionBtnClickHandler(item?.id, item?.isfavorite)}>
          <Image
            style={styles.actionImage}
            tintColor={actionBtnImageTint}
            source={actionBtnImage}
          />
        </TouchableOpacity>
      )}
    </View>
  ) : (
    <View style={[styles.receipeItem, isLastItem && {marginBottom: 0}]}>
      <View
        style={{
          width: actionBtnNeed ? '85%' : '100%',
          paddingTop: moderateScale(21),
          paddingBottom: moderateScale(21),
          paddingLeft: moderateScale(16),
        }}>
        <View style={styles.flexedRow}>
          {type === 'search' ? (
            <PassioIconView
              style={styles.receipeItemImage}
              config={{
                passioID: item.image,
                iconSize: IconSize.PX180,
              }}
            />
          ) : item.image === '' ? (
            <PassioIconView
              style={styles.receipeItemImage}
              config={{
                passioID: item?.metadata?.data?.foodData?.iconId,
                iconSize: IconSize.PX180,
              }}
            />
          ) : (
            <Image
              style={styles.receipeItemImage}
              source={
                typeof item.image === 'string' ? {uri: item.image} : item.image
              }
            />
          )}
          <View>
            <Text maxFontSizeMultiplier={1.4} style={styles.title}>
              {truncateText(item.receipe)}
            </Text>
            {/*  <Text maxFontSizeMultiplier={1.5} style={styles.description}>
              {Math.round(Number(item?.calories) ?? 0)} Cal | {item.quantity}
            </Text> */}
            <Text
              maxFontSizeMultiplier={1.4}
              style={styles.description}
              numberOfLines={2}>
              {/* {truncateText(item.receipe)} */}
              {toTitleCase(item.brandName)}
            </Text>
          </View>
        </View>
      </View>

      {actionBtnNeed && (
        <TouchableOpacity
          style={{
            width: '15%',
            marginLeft: 'auto',
            marginRight: moderateScale(16),
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
          onPress={() => actionBtnClickHandler(item?.id, item?.isfavorite)}>
          <Image
            style={styles.actionImage}
            tintColor={actionBtnImageTint}
            source={actionBtnImage}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  receipeItem: {
    backgroundColor: AppColors.white,
    borderRadius: moderateScale(8),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },

  receipeItemImage: {
    width: verticalScale(36),
    height: verticalScale(36),
    objectFit: 'cover',
  },

  actionImage: {
    width: verticalScale(24),
    height: verticalScale(24),
    objectFit: 'cover',
  },
  flexedRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: moderateScale(12),
    alignItems: 'center',
  },

  title: {
    fontSize: AppFontSize.intersize18,
    color: AppColors.titleColorOne,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    //lineHeight: scale(16),
    marginBottom: moderateScale(4),
    marginRight: moderateScale(4),
  },
  description: {
    fontSize: AppFontSize.intersize14,
    color: AppColors.textFieldTextBlack,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    //lineHeight: scale(16),
  },
});

export default ReceipeItem;
