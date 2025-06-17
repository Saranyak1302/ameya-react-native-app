import React, {FC} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Image} from 'react-native-elements';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {navigateBack} from '../navigators/utils/Utils';
import GlobalStyles from '../styles/GlobalStyles';
import {useNavigation} from '@react-navigation/native';
import {
  AppFonts,
  AppFontSize,
  AppWeights,
  getModerateScaleSize,
} from '../theme/AppFonts';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void | null | undefined;
  textCenter?: boolean;
  showDummyContent?: boolean;
  showSearchBtn?: boolean;
  onActionBtnClick?: () => void;
  fullSearch?: boolean;
  searchComponent?: React.ReactNode;
  actionBtnText?: string;
  middleComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  varient:
    | 'TYPE1'
    | 'TYPE2'
    | 'TYPE3'
    | 'TYPE4'
    | 'TYPE5'
    | 'TYPE6'
    | 'TYPE7'
    | 'TYPE8'
    | 'TYPE9';
}

const Header: FC<HeaderProps> = ({
  varient,
  title,
  onBack,
  onActionBtnClick,
  searchComponent,
  actionBtnText,
  rightComponent,
  middleComponent,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBack) {
      onBack();
      navigateBack();
    } else {
      navigation.goBack(); // Fallback to default navigation
    }
  };

  // @ts-ignore
  return (
    <View style={[styles.headerContainer]}>
      {varient === 'TYPE1' ? (
        <View>
          <Text maxFontSizeMultiplier={1.4} style={GlobalStyles.inAppHeading}>
            {title}
          </Text>
        </View>
      ) : varient === 'TYPE2' ? (
        <View style={styles.flexedBetween2}>
          <View style={styles.iconLeft}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={[styles.backIconWrapper]}>
              <Image
                source={require('../../assets/images/leftarrow.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={{position: 'absolute'}}>
            <Text
              maxFontSizeMultiplier={1.4}
              style={[GlobalStyles.inAppHeading, styles.centeredTitle]}>
              {title}
            </Text>
          </View>
        </View>
      ) : varient === 'TYPE3' ? (
        <View style={styles.flexedGap3}>
          <View style={styles.iconLeft}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={[styles.backIconWrapper]}>
              <Image
                source={require('../../assets/images/leftarrow.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={{position: 'absolute'}}>
            <Text
              maxFontSizeMultiplier={1.4}
              style={[GlobalStyles.inAppHeading, styles.centeredTitle]}>
              {title}
            </Text>
          </View>
        </View>
      ) : varient === 'TYPE4' ? (
        <View style={styles.flexedBetween}>
          <View style={styles.flexedGap14}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backIconWrapper}>
              <Image
                source={require('../../assets/images/leftarrow.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text
              maxFontSizeMultiplier={1.4}
              style={[GlobalStyles.inAppHeading, styles.centeredTitle]}>
              {title}
            </Text>
          </View>
          <TouchableOpacity onPress={onActionBtnClick}>
            <Image
              style={styles.searchIcon}
              source={require('../../assets/images/searchglass.png')}
            />
          </TouchableOpacity>
        </View>
      ) : varient === 'TYPE5' ? (
        <View style={styles.flexedGap14}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backIconWrapper}>
            <Image
              source={require('../../assets/images/leftarrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          {searchComponent}
        </View>
      ) : varient === 'TYPE6' ? (
        <View style={styles.flexedBetween}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backIconWrapper}>
            <Image
              source={require('../../assets/images/leftarrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text maxFontSizeMultiplier={1.4} style={GlobalStyles.inAppHeading}>
            {title}
          </Text>

          <TouchableOpacity onPress={onActionBtnClick}>
            <Text maxFontSizeMultiplier={1.4} style={styles.actionBtnText}>
              {actionBtnText}
            </Text>
          </TouchableOpacity>
        </View>
      ) : varient === 'TYPE7' ? (
        <View style={styles.flexedBetween}>
          <View style={styles.flexedGap14}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backIconWrapper}>
              <Image
                source={require('../../assets/images/leftarrow.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text
              maxFontSizeMultiplier={1.4}
              style={[GlobalStyles.inAppHeading, styles.centeredTitle]}>
              {title}
            </Text>
          </View>
          {rightComponent}
        </View>
      ) : varient === 'TYPE8' ? (
        <View style={styles.flexedBetween}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backIconWrapper}>
            <Image
              source={require('../../assets/images/leftarrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          {middleComponent}

          <TouchableOpacity onPress={onActionBtnClick}>
            <Text maxFontSizeMultiplier={1.4} style={styles.actionBtnText}>
              {actionBtnText}
            </Text>
          </TouchableOpacity>
        </View>
      ) : varient === 'TYPE9' ? (
        <View style={styles.flexedBetween}>
          <View style={styles.flexedGap14}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backIconWrapper}>
              <Image
                source={require('../../assets/images/leftarrow.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text
              maxFontSizeMultiplier={1.4}
              style={[GlobalStyles.inAppHeading]}>
              {title}
            </Text>
          </View>
          {rightComponent}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginHorizontal: moderateScale(16),
    height: moderateScale(64),
  },
  searchIcon: {
    width: verticalScale(20),
    height: verticalScale(20),
  },
  flexedBetween: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  flexedBetween2: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  flexedGap14: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: moderateScale(14),
  },
  flexedGap3: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: moderateScale(14),
  },
  actionBtnText: {
    fontSize: AppFontSize.intersize18,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
  },
  backIconWrapper: {
    width: moderateScale(30),
    height: moderateScale(30),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    objectFit: 'contain',
  },
  centeredTitle: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconLeft: {flex: 1, textAlign: 'left'},
});

export default Header;
