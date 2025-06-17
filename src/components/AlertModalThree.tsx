import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View, Image} from 'react-native';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {screenDimensions} from '../utils/ScreenDimensions';
import {BlurView} from '@react-native-community/blur';
import DeviceInfo from 'react-native-device-info';

import {AppColors} from '../theme/AppColors';
import { moderateScale, verticalScale } from 'react-native-size-matters';

type AlertModalProps = {
  alertModalVisible: boolean;
  title: string | React.ReactNode; // Title is required
  message?: string | React.ReactNode; // Message is optional
  buttons?:
    | [{text: string; onPress?: () => void}]
    | [
        {text: string; onPress?: () => void},
        {text: string; onPress?: () => void},
      ];
  buttonsExtra?:
    | [{text: string; onPress?: () => void}]
    | [
        {text: string; onPress?: () => void},
        {text: string; onPress?: () => void},
      ];
  buttonsExtraa?:
    | [{text: string; onPress?: () => void}]
    | [
        {text: string; onPress?: () => void},
        {text: string; onPress?: () => void},
      ];
  onClose: () => void;
  closeIcon?: boolean;
};

const AlertModalThree = ({
  alertModalVisible,
  title,
  message,
  buttons = [{text: 'OK'}],
  buttonsExtra = [{text: 'Cancel'}],
  buttonsExtraa = [{text: ''}], // Default button
  onClose,
  closeIcon = false
}: AlertModalProps) => {
  const handlePress = (button: {text: string; onPress?: () => void}) => {
    button.onPress?.();
    onClose();
  };

  const handleExtraPress = (button: {text: string; onPress?: () => void}) => {
    button.onPress?.();
    onClose();
  };

  return (
    alertModalVisible && (
      <View style={[StyleSheet.absoluteFillObject, styles.modal]}>
        {/* <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="dark"
          blurAmount={1}
          reducedTransparencyFallbackColor="black"
        /> */}
        <View style={styles.alertBox}>
        {closeIcon && (
            <TouchableOpacity onPress={onClose} style={styles.closeView}>
            <Image
              source={require('../../assets/images/close.png')}
              style={styles.closeImg}
            />
          </TouchableOpacity>
          )}
          {title && (
            <View style={styles.titleContainer}>
              {typeof title === 'string' ? (
                <Text maxFontSizeMultiplier={1.3} style={styles.title}>
                  {title}
                </Text>
              ) : (
                title
              )}
            </View>
          )}
          {message && (
            <View
              style={[styles.messageContainer, !title && styles.msgNonTitle]}>
              {typeof message === 'string' ? (
                <Text maxFontSizeMultiplier={1.3} style={styles.message}>
                  {message}
                </Text>
              ) : (
                message
              )}
            </View>
          )}
          <View
            style={[
              styles.buttonContainer,
              buttons.length === 1 && styles.singleButton,
            ]}>
            {buttons.map((button, index) => (
              <React.Fragment key={index}>
                {index === 1 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={[
                    styles.button,
                    index === 0 ? styles.leftButton : styles.rightButton,
                  ]}
                  onPress={() => {
                    handlePress(button);
                  }}>
                  <Text style={styles.buttonText} maxFontSizeMultiplier={1.3}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
          <View
            style={[
              styles.buttonContainer,
              buttonsExtra.length === 1 && styles.singleButton,
            ]}>
            {buttonsExtra.map((button, index) => (
              <React.Fragment key={index}>
                {index === 1 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={[
                    styles.button,
                    index === 0 ? styles.leftButton : styles.rightButton,
                  ]}
                  onPress={() => {
                    handleExtraPress(button);
                  }}>
                  <Text style={styles.buttonText} maxFontSizeMultiplier={1.3}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
          {buttonsExtraa ? <View
            style={[
              styles.buttonContainer,
              buttonsExtraa.length === 1 && styles.singleButton,
            ]}>
            {buttonsExtraa.map((button, index) => (
              <React.Fragment key={index}>
                {index === 1 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={[
                    styles.button,
                    index === 0 ? styles.leftButton : styles.rightButton,
                  ]}
                  onPress={() => {
                    handleExtraPress(button);
                  }}>
                  <Text style={styles.buttonText} maxFontSizeMultiplier={1.3}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View> : <></>}
        </View>
      </View>
    )
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 0,
    marginHorizontal: 0,
    zIndex: 1000,
    backgroundColor: '#00000050',
  },
  alertBox: {
    alignSelf: 'center',
    // backgroundColor: '#f5f5f5',
    backgroundColor: AppColors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: moderateScale(10),
    width: isTablet ? '60%' : '85%',
  },
  titleContainer: {
    paddingHorizontal: moderateScale(16),
    textAlign: 'center',
  },
  title: {
    fontSize: AppFontSize.intersize19,
    fontFamily: AppFonts.interSemibold,
    fontWeight: AppWeights.interSemibold,
    color: '#000000',
    marginBottom: moderateScale(10),
    textAlign: 'center',
  },
  messageContainer: {
    paddingHorizontal: moderateScale(36),
    textAlign: 'center',
  },
  msgNonTitle: {paddingTop: moderateScale(16)},
  message: {
    fontSize: AppFontSize.intersize16,
    fontFamily: AppFonts.interRegular,
    marginBottom: moderateScale(20),
    fontWeight: AppWeights.interRegular,
    color: '#000000',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: moderateScale(0.5),
    borderTopColor: '#bfbfc1',
  },
  singleButton: {
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: moderateScale(21),
    borderRadius: moderateScale(5),
    alignItems: 'center',
  },
  leftButton: {},
  rightButton: {},
  buttonText: {
    color: '#007AFF',
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    fontSize: AppFontSize.intersize19,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  btnWrapper: {flexDirection: 'row'},
  divider: {height: '100%', width: moderateScale(0.5), backgroundColor: '#bfbfc1'},
  closeImg: {width: verticalScale(24), height: verticalScale(24)},
  closeView: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    paddingRight: moderateScale(10),
  }
});

export default AlertModalThree;
