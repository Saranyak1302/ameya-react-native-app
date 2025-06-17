import React from 'react';
import {StyleSheet, View, TouchableOpacity, Text, Image} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppStrings} from '../../utils/Constants';
import {AppColors} from '../../theme/AppColors';
import Header from '../../components/Header';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import WebView from 'react-native-webview';
import getCurrentEnvironment from '../../services/api/envConfig';
import {useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {NavigatorNames} from '../../navigators/tabs/NavigatorsNames.tsx';
import {navigate} from '../../navigators/utils/Utils';
import {AppFonts, AppFontSize, AppWeights} from '../../theme/AppFonts';
import {navigateBack} from '../../navigators/utils/Utils';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

const DevicesWebView = () => {
  const route = useRoute<any>();
  const {viewUrl, brand} = route.params;

  const navigation = useNavigation();
  const checkResponse = (url:any) => {
    fetch(url)
    .then(response => response.json() )
    .then(data => {
      if(data.status === 200 || data.status === 409) // Check code Success response and Already linked 
      {
        navigate(NavigatorNames.devices, {successPopup: 1, brand: brand});
      }
    })
    .catch(error => {});
    //return jsCode;
  }
  return (
    <SafeAreaView style={styles.container}>
        {/* <Header title={AppStrings.connectDevice} onBack={undefined} varient="TYPE3" /> */}
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

        <View style={styles.contentContainer}>
          <WebView
            onNavigationStateChange={(e) => {
              let resp: any = JSON.stringify(e, null, 2)
              //console.warn("current state is ", e, JSON.parse(resp));
              const firstPath = e.url.split('/')[2];
              if(firstPath.includes("ameya"))
              {
                checkResponse(e.url)
                //navigate(NavigatorNames.devices, {successPopup: 1, brand: brand});
              }
              /** put your condition here to close webview.
               Like if(e.url.indexOf("end_url") > -1)
               Then close webview
               */
            }}
            originWhitelist={['*']}
            source={{uri: viewUrl ?? ''}}
            style={styles.webView}
            javaScriptEnabled = {true}
            incognito={true}
          />
        </View>
    </SafeAreaView>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.greyWhite,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 24 : 12,
    borderTopRightRadius: isTablet ? 24 : 12,
    overflow: 'hidden',
  },
  topViewContainer: {
    height: verticalScale(80),
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
    fontSize: AppFontSize.intersize20,
    marginLeft: moderateScale(10),
  },
  webView: {
    flex: 1,
  },
});

export default DevicesWebView;
