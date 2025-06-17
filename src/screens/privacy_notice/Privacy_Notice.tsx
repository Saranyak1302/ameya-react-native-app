import React from 'react';
import {StyleSheet, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppStrings} from '../../utils/Constants';
import {AppColors} from '../../theme/AppColors';
import Header from '../../components/Header';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import WebView from 'react-native-webview';
import getCurrentEnvironment from '../../services/api/envConfig';
import DeviceInfo from 'react-native-device-info';

const PrivacyNotice = () => {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}>
        <Header title={AppStrings.privacyNotice} varient="TYPE3" />

        <View style={styles.contentContainer}>
          <WebView
            originWhitelist={['*']}
            source={{uri: getCurrentEnvironment?.privacyUrl ?? ''}}
            style={styles.webView}
          />
        </View>
      </KeyboardAwareScrollView>
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
  webView: {
    flex: 1,
  },
});

export default PrivacyNotice;
