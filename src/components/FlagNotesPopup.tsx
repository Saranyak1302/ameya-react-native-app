import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {AppColors} from '../theme/AppColors';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {screenDimensions} from '../utils/ScreenDimensions';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

const AddNotesPopup = ({visible, onClose, onSave}) => {
  const [note, setNote] = useState('');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.popupContainer}>
              {/* Title */}
              <Text maxFontSizeMultiplier={1.3} style={styles.title}>
                Add Notes for Completed on Another App
              </Text>

              {/* Text Input */}
              <TextInput
                maxFontSizeMultiplier={1.3}
                style={styles.input}
                placeholder="Enter your note here (Optional)"
                value={note}
                multiline={true}
                onChangeText={setNote}
                returnKeyType="next"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              <View
                style={{
                  height: verticalScale(1),
                  width: '100%',
                  backgroundColor: AppColors.borderGrey,
                }}></View>
              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <View
                  style={{
                    width: moderateScale(1),
                    backgroundColor: AppColors.borderGrey,
                  }}></View>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    onSave(note);
                    setNote('');
                  }}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.cancelText}>{note ? "Save" : "Skip & Save"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '80%',
    backgroundColor: AppColors.halfWhite,
    borderRadius: moderateScale(10),
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    color: AppColors.black,
    fontWeight: AppWeights.interSemibold,
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize19,
    textAlign: 'center',
    margin: moderateScale(20),
    marginBottom: moderateScale(16),
  },
  input: {
    width: '90%',
    height: verticalScale(100),
    borderWidth: moderateScale(1),
    borderColor: AppColors.borderGrey,
    borderRadius: moderateScale(5),
    padding: moderateScale(8),
    marginBottom: moderateScale(20),
    backgroundColor: AppColors.white,
    color: AppColors.textHeadingBlack,
    fontWeight: AppWeights.interRegular,
    fontFamily: AppFonts.interRegular,
    fontSize: AppFontSize.intersize15,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    marginRight: moderateScale(8),
    padding: moderateScale(14),
    alignItems: 'center',
  },
  cancelText: {
    color: AppColors.buttonTextBlue,
    fontWeight: AppWeights.interRegular,
    fontFamily: AppFonts.interRegular,
    fontSize: AppFontSize.intersize19,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center'
  },
});

export default AddNotesPopup;
