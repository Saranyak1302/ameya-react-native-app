import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {Image} from 'react-native-elements';
import GlobalStyles from '../styles/GlobalStyles';
import {screenDimensions} from '../utils/ScreenDimensions';
import {AppColors} from '../theme/AppColors';
import {AppFontSize, AppWeights, getModerateScaleSize} from '../theme/AppFonts';
import {moderateScale, verticalScale} from 'react-native-size-matters';

interface ProfileItem {
  icon: string | any;
  title: string;
  action: () => void;
}

interface ProfileItemsProps {
  items: ProfileItem[];
}

const ProfileItemsList: React.FC<ProfileItemsProps> = props => {
  const {items} = props;

  const renderItem = ({item}: {item: ProfileItem}) => (
    <View key={item.title} style={{}}>
      <TouchableOpacity style={styles.imageContainer} onPress={item?.action}>
        <View style={styles.itemFlexed}>
          <Image source={item.icon} style={styles.imageIcon} />
          <Text
            maxFontSizeMultiplier={1.5}
            style={[GlobalStyles.labelText, styles.iconText]}>
            {item.title}
          </Text>
        </View>
        {item.title !== 'Logout' && (
          <Image
            tintColor={AppColors.buttonDarkBlue}
            source={require('../../assets/images/rightarrowtransparent.png')}
            style={styles.arrowIcon}
          />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.title}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  imageIcon: {
    height: verticalScale(40),
    width: verticalScale(40),
  },
  imageContainer: {
    height: verticalScale(64),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconText: {
    paddingLeft: moderateScale(16),
    fontSize: AppFontSize.intersize16,
    textAlign: 'center',
    fontWeight: AppWeights.interMedium,
  },
  arrowIcon: {
    height: verticalScale(20),
    width: moderateScale(24),
  },
  itemFlexed: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ProfileItemsList;
