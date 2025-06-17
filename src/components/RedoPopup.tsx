import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import {AppFonts, AppFontSize, AppWeights} from '../theme/AppFonts';
import {AppColors} from '../theme/AppColors';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

type RedoModalProps = {
  redoModalVisible: boolean;
  onClose: () => void;
  onOptionPress: (value) => void;
};
const RedoPopup = ({
  redoModalVisible,
  onClose,
  onOptionPress,
}: RedoModalProps) => {
  return (
    <Modal
      isVisible={redoModalVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      propagateSwipe={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text maxFontSizeMultiplier={1.3} style={styles.title}>
            More Items
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Image
              source={require('../../assets/images/close.png')}
              style={styles.closeImg}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.btnItemContainer}
          onPress={() => {
            onOptionPress('Set Flagging');
          }}>
          <Image
            source={require('../../assets/images/redflag.png')}
            style={styles.flagImg}
          />
          <Text maxFontSizeMultiplier={1.3} style={styles.flagText}>
            {'Set Flagging'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnItemContainer}
          onPress={() => {
            onOptionPress('Redo Movement');
          }}>
          <Image
            source={require('../../assets/images/redo.png')}
            tintColor={AppColors.buttonDarkBlue}
            style={styles.flagImg}
          />
          <Text maxFontSizeMultiplier={1.3} style={styles.flagText}>
            {'Redo Movement'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 0,
    marginHorizontal: moderateScale(20),
  },
  container: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: moderateScale(12),
    padding: moderateScale(24),
  },
  title: {
    fontFamily: AppFonts.interSemibold,
    fontWeight: AppWeights.interSemibold,
    color: '#333333',
    textAlign: 'center',
    fontSize: AppFontSize.intersize20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(20),
  },
  btnItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    paddingVertical: moderateScale(8),
  },
  closeImg: {width: verticalScale(20), height: verticalScale(20)},
  flagImg: {width: verticalScale(10), height: verticalScale(10)},
  flagText: {
    fontFamily: AppFonts.interMedium,
    fontWeight: AppWeights.interMedium,
    color: '#555555',
    fontSize: AppFontSize.intersize18,
  },
  subTitle: {
    fontFamily: AppFonts.interSemibold,
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interSemibold,
    color: '#222222',
    marginBottom: moderateScale(10),
  },
  itemSeperator: {
    height: verticalScale(1),
    width: '100%',
    backgroundColor: '#E5E5E6',
    marginTop: moderateScale(8),
    marginBottom: moderateScale(18),
  },
});

export default RedoPopup;
