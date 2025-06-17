import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const ServingGuide = ({onPress}) => {
  // Replace these with your actual images
  const iconImages = {
    tsp: require('../../assets/images/tsp.png'),
    tbsp: require('../../assets/images/tbsp.png'),
    oz: require('../../assets/images/oz.png'),
    palm: require('../../assets/images/palm.png'),
    cup: require('../../assets/images/cup.png'),
    fist: require('../../assets/images/fist.png'),
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text maxFontSizeMultiplier={1.4} style={styles.headerText}>
          Serving Guide
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onPress}>
          <Image
            source={require('../../assets/images/close.png')}
            style={styles.closeIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={styles.item}>
          <Image source={iconImages.tsp} style={styles.icon} />
        </View>
        <View style={styles.item}>
          <Image source={iconImages.tbsp} style={styles.icon} />
        </View>
        <View style={styles.item}>
          <Image source={iconImages.oz} style={styles.icon} />
        </View>
        <View style={styles.item}>
          <Image source={iconImages.palm} style={styles.icon} />
        </View>
        <View style={styles.item}>
          <Image source={iconImages.cup} style={styles.icon} />
        </View>
        <View style={styles.item}>
          <Image source={iconImages.fist} style={styles.icon} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    width: '90%',
    alignSelf: 'center',
    shadowColor: AppColors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  headerText: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
  closeButton: {
    width: verticalScale(24),
    height: verticalScale(24),
  },
  closeIcon: {
    width: verticalScale(24),
    height: verticalScale(24),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    marginBottom: moderateScale(20),
    width: '30%',
  },
  icon: {
    width: verticalScale(100),
    height: verticalScale(126),
    marginBottom: 8,
  },
});

export default ServingGuide;
