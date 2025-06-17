import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {navigateBack} from '../../navigators/utils/Utils';
import {AppColors} from '../../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights, getModerateScaleSize} from '../../theme/AppFonts';
import {screenDimensions} from '../../utils/ScreenDimensions';
import WebView from 'react-native-webview';
import {useRoute} from '@react-navigation/native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const SurveyWebView = () => {
  const route = useRoute<any>();
  const {surveyUrl} = route.params;

  // const handleNavigationChange = (navState: any) => {
  //   const {url} = navState;
  // };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.topViewContainer}>
        <View style={styles.topView}>
        <TouchableOpacity onPress={navigateBack}>
          <View style={styles.topAndBackView}>
              <Image
                source={require('../../../assets/images/leftarrow.png')}
                resizeMode="contain"
                style={styles.backImg}
              />
            
            <Text style={styles.titleText} maxFontSizeMultiplier={1.3}>
              Back
            </Text>
          </View>
        </TouchableOpacity>
        </View>
      </View>
      <View style={styles.subContainer}>
        {surveyUrl && (
          <WebView
            // onNavigationStateChange={handleNavigationChange}
            originWhitelist={['*']}
            source={{uri: surveyUrl}}
            style={styles.webView}
            // onMessage={event => {
            //   const message = event.nativeEvent;
            // }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SurveyWebView;

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: AppColors.lightBlue,
    flexDirection: 'column',
    flex: 1,
  },
  subContainer: {
    backgroundColor: AppColors.white,
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backImg: {
    height: verticalScale(25),
    width: verticalScale(25),
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
    marginLeft: moderateScale(10),
  },
  webView: {flex: 1},
});
