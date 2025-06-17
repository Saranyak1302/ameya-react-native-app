import {
  Image,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {useState} from 'react';
import {SurveyItem as SurveyItemType} from '../types/SurveyTypes';
import {CustomButton} from './CustomButton';
import {formatDate} from '../utils/Helper';
import {AppFonts, AppFontSize, AppWeights, getModerateScaleSize} from '../theme/AppFonts';
import {AppColors} from '../theme/AppColors';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const SurveyItem = ({
  item,
  overDueIndex,
  todoIndex,
  index,
  onPress,
  hide,
}: {
  item: SurveyItemType;
  overDueIndex: number;
  todoIndex: number;
  index: number;
  hide: boolean;
  onPress: (value?: any) => void;
}) => {
  const isOverDue = new Date(item?.endDate) < new Date();
  const dueDate = item?.endDate ? formatDate(item?.endDate) : '-';
  const startDate = item?.startDate ? formatDate(item?.startDate) : '-';
  const completedDate = item?.completedDate
    ? formatDate(item?.completedDate)
    : '';
  const [expand, setExpand] = useState(false);

  return (
    <>
      {overDueIndex !== -1 &&
      overDueIndex === index &&
      item.status === 'PENDING' ? (
        <Text
        maxFontSizeMultiplier={1.3}
          style={[
            styles.subTitle,
            item?.name === 'To Do' && styles.subTitleTodo,
          ]}>
          Overdue
        </Text>
      ) : (
        todoIndex !== -1 &&
        todoIndex === index &&
        item.status === 'PENDING' && (
          <Text maxFontSizeMultiplier={1.3} style={[styles.subTitle, styles.subTitleTodo]}>To Do</Text>
        )
      )}

      <TouchableOpacity
        style={styles.flatListRenderContainer}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Smooth spring effect
          setExpand(pre => !pre);
        }}>
        <View style={styles.leftContainer}>
          <View style={styles.surveySection}>
            {item.status === 'PENDING' && isOverDue && (
              <Image
                source={require('../../assets/images/overdue.png')}
                style={styles.overDueImg}
              />
            )}
            <Text maxFontSizeMultiplier={1.3} style={styles.surveyName} numberOfLines={expand ? 2 : 1}>
              {item.name}
            </Text>
          </View>
          <Text maxFontSizeMultiplier={1.3} style={styles.dueDate}>
            {item.status === 'PENDING'
              ? hide ? `Due ${dueDate}` : `Start ${startDate}`
              : item.status === 'COMPLETED'
              ? `Completed ${completedDate}`
              : `${item.status} ${dueDate}`}
          </Text>
        </View>
        {item.status === 'PENDING' && (
          <CustomButton
            onPress={() => {
              if (hide) {
                onPress && onPress();
              }
            }}
            btnStyle={styles.startText}
            style={
              [
                styles.startBtn,
                !hide ? {backgroundColor: AppColors.buttonDisable} : {},
              ] as ViewStyle
            }
            title={'Start'}
          />
        )}
      </TouchableOpacity>
    </>
  );
};

export default SurveyItem;

const styles = StyleSheet.create({
  subTitle: {
    marginLeft: moderateScale(20),
    marginVertical: moderateScale(5),
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    color: '#6E6E6E',
    fontSize: AppFontSize.intersize16,
  },
  subTitleTodo: {marginTop: moderateScale(10)},
  flatListRenderContainer: {
    backgroundColor: '#F4F4F6',
    padding: moderateScale(13),
    marginVertical: moderateScale(8),
    marginHorizontal: moderateScale(20),
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftContainer: {flex: 1, gap: 6},
  surveySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  overDueImg: {width: scale(16), height: scale(16)},
  surveyName: {
    flex: 1,
    marginRight: moderateScale(15),
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    color: '#555555',
    fontSize: AppFontSize.intersize16,
  },
  dueDate: {
    fontFamily: AppFonts.interSemibold,
    fontWeight: AppWeights.interSemibold,
    color: '#333333',
    fontSize: AppFontSize.intersize16,
    textTransform: 'capitalize',
  },
  startText: {
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    color: '#FFFFFF',
    fontSize: AppFontSize.intersize18,
    letterSpacing: moderateScale(-0.2),
  },
  startBtn: {width: moderateScale(90), height: moderateScale(35)},
});
