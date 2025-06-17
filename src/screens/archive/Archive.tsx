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
import {toTitleCase, truncateText} from '../../utils/Helper.tsx';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames.tsx';
import {useNavigation} from '@react-navigation/native';
import ReceipeItem from '../../components/ReceipeItem';
import { scale } from 'react-native-size-matters';

const Archive = () => {
  const [activeTab, setActiveTab] = useState(AppStrings.favorites);
  const navigation = useNavigation();

  const archiveDetails: any = {
    today: [
      {
        receipe: 'Oatmeal Raisin Cookie,...',
        calories: '125 Cal',
        date: 'Today',
        quantity: '1.0 cookie (28g)',
        image: require('../../../assets/images/food1.png'),
      },
      {
        receipe: 'Oatmeal-Mango Parfait',
        calories: '160 Cal',
        date: 'Wednesday',
        quantity: '1.0 cup',
        image: require('../../../assets/images/food1.png'),
      },
    ],
    wednesday: [
      {
        receipe: 'Oatmeal-Mango Parfait',
        calories: '160 Cal',
        date: 'Wednesday',
        quantity: '1.0 cup',
        image: require('../../../assets/images/food1.png'),
      },
      {
        receipe: 'Oatmeal Raisin Cookie,...',
        calories: '125 Cal',
        date: 'Today',
        quantity: '1.0 cookie (28g)',
        image: require('../../../assets/images/food1.png'),
      },
    ],
    lastWeek: [
      {
        receipe: 'Oatmeal Pancake, 6”',
        calories: '132 Cal',
        date: 'Last Week',
        quantity: '1.0 pancake',
        image: require('../../../assets/images/food1.png'),
      },
    ],
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppStrings.favorites:
        return Object.keys(archiveDetails).map(day => (
          <View key={day} style={styles.receipeOfDay}>
            <Text maxFontSizeMultiplier={1.4} style={styles.heading}>{toTitleCase(day)}</Text>
            {archiveDetails[day].map((item: any, index: number) => {
              const isLastItem = index === archiveDetails[day].length - 1;
              return (
                <ReceipeItem
                  key={index}
                  item={item}
                  isLastItem={isLastItem}
                  truncateText={truncateText}
                  actionBtnNeed={false}
                />
              );
            })}
          </View>
        ));
      case AppStrings.myRecipes:
        return Object.keys(archiveDetails).map(day => (
          <View key={day} style={styles.receipeOfDay}>
            <Text maxFontSizeMultiplier={1.4} style={styles.heading}>{toTitleCase(day)}</Text>
            {archiveDetails[day].map((item: any, index: number) => {
              const isLastItem = index === archiveDetails[day].length - 1;
              return (
                <ReceipeItem
                  key={index}
                  item={item}
                  isLastItem={isLastItem}
                  truncateText={truncateText}
                  actionBtnNeed={false}
                />
              );
            })}
          </View>
        ));
      case AppStrings.myFoods:
        return Object.keys(archiveDetails).map(day => (
          <View key={day} style={styles.receipeOfDay}>
            <Text maxFontSizeMultiplier={1.4} style={styles.heading}>{toTitleCase(day)}</Text>
            {archiveDetails[day].map((item: any, index: number) => {
              const isLastItem = index === archiveDetails[day].length - 1;
              return (
                <ReceipeItem
                  key={index}
                  item={item}
                  isLastItem={isLastItem}
                  truncateText={truncateText}
                  actionBtnNeed={false}
                />
              );
            })}
          </View>
        ));
      default:
        return null;
    }
  };

  const handleSearchBtnClick = () => {
    navigation.navigate(NavigatorNames.searchArchive as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}>
        <Header
          title={AppStrings.archive}
          onBack={undefined}
          varient="TYPE4"
          onActionBtnClick={handleSearchBtnClick}
        />

        <View style={styles.tabContainer}>
          {[AppStrings.favorites, AppStrings.myRecipes, AppStrings.myFoods].map(
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

// Need to add scale value to this file !!

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
    gap: 8,
    paddingTop: 16,
    justifyContent: 'center',
    paddingLeft: 16,
    paddingRight: 16,
  },
  tabButton: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 20,
    height: scale(36),
    // width: '33%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: AppColors.buttonDarkBlue,
  },
  activeTabButtonText: {
    color: AppColors.white,
    fontWeight: AppWeights.interSemibold,
    fontSize: AppFontSize.intersize16,
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
    paddingHorizontal: 16,
    paddingTop: 32,
  },

  heading: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
    marginBottom: 16,
  },
  receipeOfDay: {
    marginBottom: 32,
  },
});

export default Archive;
