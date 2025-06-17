import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import GlobalStyles from '../styles/GlobalStyles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

const TimePicker = ({
  isShowTimePickerVisible,
  onPress,
  onTimeChange,
  time,
  setTime,
  onSetTime,
}) => {
  //const [show, setShow] = useState(false);

  const onChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    //setShow(Platform.OS === 'ios'); // For iOS, keep the picker open
    setTime(currentTime); // Update time
    onTimeChange(currentTime);
  };

  return (
    <View style={styles.container}>
      <Modal
        isVisible={isShowTimePickerVisible}
        onBackdropPress={onPress}
        style={styles.modal}
        swipeDirection="down"
        onSwipeComplete={onPress}>
        <View style={styles.ServeContainer}>
          <View style={styles.headerContainer}>
            <Text maxFontSizeMultiplier={1.4} style={styles.title}>
              Time
            </Text>

            <TouchableOpacity style={styles.closeButton} onPress={onPress}>
              <Text maxFontSizeMultiplier={1.4} style={styles.closeText}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
          <View style={isTablet ? { transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] } : {}}>
          <DateTimePicker
            value={time}
            mode="time"
            display="spinner" // You can also use 'default', 'clock', or 'compact' depending on the look you prefer
            is24Hour={false}
            onChange={onChange}
            textColor={AppColors.buttonDarkBlue}
          />
          </View>
          <TouchableOpacity style={styles.button} onPress={onSetTime}>
            <Text maxFontSizeMultiplier={1.4} style={GlobalStyles.buttonText}>
              Set Time
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  modal: {
    justifyContent: 'flex-end', // Align modal to bottom
    margin: 0,
  },
  ServeContainer: {
    justifyContent: 'space-between',
    backgroundColor: AppColors.white,
    borderTopLeftRadius: isTablet ? 30 : 20,
    borderTopRightRadius: isTablet ? 30 : 20,
    marginTop: moderateScale(24),
    padding: moderateScale(24),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(40),
  },
  button: {
    backgroundColor: AppColors.buttonDarkBlue,
    height: verticalScale(45),
    borderRadius: moderateScale(60),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(15),
    marginTop: moderateScale(35),
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeText: {
    fontSize: AppFontSize.intersize16,
    fontWeight: AppWeights.interSemibold,
    color: AppColors.buttonTextBlue,
    fontFamily: AppFonts.interSemibold,
    textAlign: 'right',
  },
  title: {
    fontSize: AppFontSize.intersize20,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
});

export default TimePicker;
