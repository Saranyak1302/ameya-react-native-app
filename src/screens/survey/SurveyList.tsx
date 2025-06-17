import {
  ActivityIndicator,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import React, {useEffect, useState,useCallback, useRef} from 'react';
import {navigateBack} from '../../navigators/utils/Utils';
import {AppColors} from '../../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights, getModerateScaleSize} from '../../theme/AppFonts';
import {screenDimensions} from '../../utils/ScreenDimensions';
import {SurveyItem as SurveyItemType} from '../../types/SurveyTypes';
import useTodoSurveyList from '../../hooks/useTodoSurveyList';
import useCompletedSurveyList from '../../hooks/useCompletedSurveyList';
import SurveyItem from '../../components/SurveyItem';
import Header from '../../components/Header';
import {ScreenHeight} from 'react-native-elements/dist/helpers';
import moment from 'moment';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const SurveyList = ({route}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {
    todoLoading,
    surveyTodoList,
    refreshingTodo,
    overDueIndex,
    todoIndex,
    refreshTodoList,
    loadMoreTodoList,
    navigateToSurvey,
  } = useTodoSurveyList();
  const {
    completeLoading,
    surveyCompletedList,
    refreshingComplete,
    refreshCompletedList,
    loadMoreCompletedList,
  } = useCompletedSurveyList();

  const onRefresh = () => {
    refreshTodoList();
    refreshCompletedList();
  };

  const handleSegmentPress = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedIndex(index);
  };
  const {isFromTodaysTask,isFromTodaysItem} = route.params;
  const isFocused = useIsFocused();
  const isFromTodayTaksViewed = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (isFocused && isFromTodaysTask && !isFromTodayTaksViewed.current) {
          isFromTodayTaksViewed.current = true;
        navigateToSurvey(isFromTodaysItem);
      }
    }, []),
  );
  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText} maxFontSizeMultiplier={1.3}>
          No Surveys available
        </Text>
      </View>
    );
  };

  const renderItem = ({item, index}: {item: SurveyItemType; index: number}) => {
    return (
      <SurveyItem
        item={item}
        overDueIndex={overDueIndex}
        todoIndex={todoIndex}
        index={index}
        hide={moment().isSameOrAfter(item?.startDate)}
        onPress={() => {
          navigateToSurvey(item);
        }}
        
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.topViewContainer}>
        {/* <View style={styles.topView}>
          <View style={styles.topAndBackView}>
            <TouchableOpacity onPress={navigateBack}>
              <Image
                source={require('../../../assets/images/leftarrow.png')}
                resizeMode="contain"
                style={styles.backImg}
              />
            </TouchableOpacity>
            <Text style={styles.titleText} maxFontSizeMultiplier={1.3}>
              Survey
            </Text>
          </View>
        </View> */}
         <Header
          title={"Survey"}
          onBack={navigateBack}
          varient="TYPE3"
        />
      </View>
      <View style={styles.subContainer}>
        <View style={styles.tabViewcontainer}>
          <TouchableOpacity
            style={[
              styles.segment,
              selectedIndex === 0 && styles.selectedSegment,
            ]}
            onPress={() => handleSegmentPress(0)}>
            <Text
              maxFontSizeMultiplier={1.4}
              style={
                selectedIndex === 0
                  ? styles.selectedSegmentText
                  : styles.segmentText
              }>
              To Do
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              selectedIndex === 1 && styles.selectedSegment,
            ]}
            onPress={() => handleSegmentPress(1)}>
            <Text
              maxFontSizeMultiplier={1.4}
              style={
                selectedIndex === 1
                  ? styles.selectedSegmentText
                  : styles.segmentText
              }>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
        {selectedIndex === 0 ? (
          <FlatList
            data={surveyTodoList}
            renderItem={renderItem}
            keyExtractor={item => item.id + item.assessmentId + item.metadataId}
            style={styles.listContainer}
            contentContainerStyle={styles.listInContainer}
            refreshing={refreshingTodo}
            onRefresh={onRefresh}
            onEndReached={loadMoreTodoList}
            onEndReachedThreshold={0.001}
            ListEmptyComponent={!todoLoading ? renderEmptyComponent : null}
            ListFooterComponent={
              todoLoading && !refreshingTodo ? <ActivityIndicator /> : null
            }
          />
        ) : (
          <FlatList
            data={surveyCompletedList}
            renderItem={renderItem}
            keyExtractor={item => item.id + item.assessmentId + item.metadataId}
            style={styles.listContainer}
            refreshing={refreshingComplete}
            onRefresh={onRefresh}
            onEndReached={loadMoreCompletedList}
            onEndReachedThreshold={0.001}
            ListEmptyComponent={!completeLoading ? renderEmptyComponent : null}
            ListFooterComponent={
              completeLoading && !refreshingComplete ? (
                <ActivityIndicator />
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SurveyList;

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: AppColors.lightBlue,
    flexDirection: 'column',
    flex: 1,
  },
  subContainer: {
    backgroundColor: AppColors.white,
    flex: 1,
    borderTopLeftRadius: isTablet ? 35 : 25,
    borderTopRightRadius: isTablet ? 35 : 25,
  },
  topViewContainer: {
    height: verticalScale(60),
    width: screenDimensions.width,
    backgroundColor: AppColors.lightBlue,
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: moderateScale(20),
    marginTop: moderateScale(20),
  },
  topAndBackView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    // flexDirection: 'row',
    // alignItems: 'center',
  },
  backImg: {
    height: verticalScale(25),
    width: verticalScale(25),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute'
  },
  arrowImg: {
    height: verticalScale(25),
    width: verticalScale(25),
  },
  titleText: {
    color: AppColors.black,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize22,
    marginLeft: moderateScale(20),
    flex: 1,
    textAlign: 'center'
  },
  tabViewcontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(20),
    // height: 45,
    alignSelf: 'center',
    backgroundColor: '#F4F4F6',
    borderRadius: moderateScale(25), // Border radius for the entire control
    overflow: 'hidden', // Clip the content within border radius
    marginHorizontal: moderateScale(20),
  },
  segment: {
    flex: 1,
    padding: moderateScale(10),
    // height: RFValue(45, screenDimensions.height),
    justifyContent: 'center', // Centers text vertically
    alignItems: 'center',
  },
  selectedSegment: {
    backgroundColor: AppColors.buttonDarkBlue,
    borderRadius: moderateScale(25),
    alignSelf: 'center',
    shadowColor: '#000', // Black shadow
    shadowOffset: {
      width: 0,
      height: 5, // Offset shadow downwards
    },
    shadowOpacity: 0.5, // Transparency of shadow
    shadowRadius: 5, // Blur radius for shadow

    // Android Shadow
    elevation: 8,
  },
  segmentText: {
    textAlign: 'center',
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    color: AppColors.black,
  },
  selectedSegmentText: {
    textAlign: 'center',
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
    fontFamily: AppFonts.interMedium,
    color: AppColors.white,
  },
  flatListRenderContainer: {
    backgroundColor: '#F4F4F6',
    padding: moderateScale(12),
    marginVertical: moderateScale(8),
    marginHorizontal: moderateScale(20),
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movementNameText: {
    color: '#555555',
    fontFamily: AppFonts.interMedium,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interMedium,
  },
  dueDateText: {
    color: '#333333',
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
  },
  btnViewContainer: {justifyContent: 'space-between', flexDirection: 'row'},
  listContainer: {marginTop: moderateScale(30)},
  listInContainer: {paddingBottom: moderateScale(30)},
  emptyContainer: {
    marginTop: ScreenHeight / 2 - moderateScale(200),
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  emptyText: {
    fontSize: AppFontSize.intersize16,
    color: 'black',
    fontFamily: AppFonts.interRegular,
  },
  
});
