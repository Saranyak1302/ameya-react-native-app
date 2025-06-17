import React from 'react';
import {StyleSheet, View} from 'react-native';
import Header from '../../components/Header';
import {AppStrings} from '../../utils/Constants';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppColors} from '../../theme/AppColors';
import {screenDimensions} from '../../utils/ScreenDimensions';
import ComingSoon from '../../components/ComingSoon';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

function MyReports() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollViewContent}>
        <View style={{alignSelf: 'center'}}>
          <Header
            title={AppStrings.myReports}
            onBack={undefined}
            showBackButton={false}
            varient="TYPE1"
          />
        </View>
        <ComingSoon />
      </View>
    </SafeAreaView>
  );
}

export default MyReports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.greyWhite,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  messageDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonImg: {
    width: moderateScale(400),
    height: verticalScale(311),
    objectFit: 'contain',
  },
});
