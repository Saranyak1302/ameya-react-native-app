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
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

type FlagForReviewModalProps = {
  flagForReviewModalVisible: boolean;
  onClose: () => void;
  onFlagPress: (value) => void;
  type: 'todo' | 'completed';
  isShowUndo: boolean;
};
const FlagForReviewModal = ({
  flagForReviewModalVisible,
  onClose,
  onFlagPress,
  type,
  isShowUndo,
}: FlagForReviewModalProps) => {
  const todoFlagList = [
    'Completed on Another App',
    'Participant Declined Test',
    'App Crashed Post Testing',
  ];
  const todoFlagListUndo = [
    'Completed on Another App',
    'Participant Declined Test',
    'App Crashed Post Testing',
    'Redo Movement',
  ];
  const completeFlagList = [
    {
      title: 'Mocap Error',
      flags: ['Stopping Error', 'Rep Error', 'Angle Error'],
    },
    {title: 'App', flags: ['App Crash']},
    {title: 'Review Video', flags: ['Clothing', 'Setup', 'Other']},
  ];

  return (
    <Modal
      isVisible={flagForReviewModalVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      propagateSwipe={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text maxFontSizeMultiplier={1.3} style={styles.title}>
            Flag For Review
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Image
              source={require('../../assets/images/close.png')}
              style={styles.closeImg}
            />
          </TouchableOpacity>
        </View>
        {type === 'todo' &&
          !isShowUndo &&
          todoFlagList.map(item => (
            <TouchableOpacity
              style={styles.btnItemContainer}
              onPress={() => {
                onFlagPress(item);
              }}>
              <Image
                source={require('../../assets/images/redflag.png')}
                style={styles.flagImg}
              />
              <Text maxFontSizeMultiplier={1.3} style={styles.flagText}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        {type === 'todo' &&
          isShowUndo &&
          todoFlagListUndo.map(item => (
            <TouchableOpacity
              style={styles.btnItemContainer}
              onPress={() => {
                onFlagPress(item);
              }}>
              {item === 'Redo Movement' ? (
                <Image
                  source={require('../../assets/images/redo.png')}
                  style={styles.flagImg}
                />
              ) : (
                <Image
                  source={require('../../assets/images/redflag.png')}
                  style={styles.flagImg}
                />
              )}

              <Text maxFontSizeMultiplier={1.3} style={styles.flagText}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        {type === 'completed' && (
          <FlatList
            data={completeFlagList}
            ItemSeparatorComponent={() => <View style={styles.itemSeperator} />}
            renderItem={({item}) => (
              <View key={item.title}>
                <Text maxFontSizeMultiplier={1.3} style={styles.subTitle}>
                  {item.title}
                </Text>
                {item.flags.map(flag => (
                  <TouchableOpacity
                    key={flag}
                    style={styles.btnItemContainer}
                    onPress={() => {
                      onFlagPress(flag);
                    }}>
                    <Image
                      source={require('../../assets/images/redflag.png')}
                      style={styles.flagImg}
                    />
                    <Text maxFontSizeMultiplier={1.3} style={styles.flagText}>
                      {flag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        )}
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

export default FlagForReviewModal;
