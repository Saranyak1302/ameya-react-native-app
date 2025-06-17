import React, {useEffect, useState, version} from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {screenDimensions} from '../../../utils/ScreenDimensions.tsx';
import {moderateScale, verticalScale, scale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

interface WaterJournalProps {
  totalCups: number;
  numberOfCupsDrinken: number;
  addCup: () => void;
  removeCup: () => void;
  isCompleted: boolean;
}

const WaterJournal: React.FC<WaterJournalProps> = ({
  // totalCups = 8,
  numberOfCupsDrinken,
  addCup,
  removeCup,
  isCompleted,
}): any => {
  const [totalCups, setTotalCups] = useState(1);
  useEffect(() => {
    setTotalCups(numberOfCupsDrinken + 1);
  }, [numberOfCupsDrinken]);
  const renderCup = (index: any) => {
    if (index < numberOfCupsDrinken) {
      // Filled Cup
      return (
        <TouchableOpacity
          key={index}
          style={styles.cup}
          disabled={isCompleted}
          onPress={() => removeCup()}>
          <Image
            source={require('../../../../assets/images/glassfilled.png')}
            style={isCompleted ? [styles.cupImage,{opacity: 0.5}] : styles.cupImage}
          />
        </TouchableOpacity>
      );
    } else if (index === numberOfCupsDrinken && !isCompleted) {
      // Add Button
      return (
        <TouchableOpacity
          key={index}
          style={styles.cup}
          onPress={() => addCup()}>
          <Image
            source={require('../../../../assets/images/glassadd.png')}
            style={isCompleted ? [styles.cupImage,{opacity: 0.5}] : styles.cupImage}
          />
        </TouchableOpacity>
      );
    } else {
      // Empty Cup
      return (
        <View style={styles.cup} key={index}>
          <Image
            source={require('../../../../assets/images/glassempty.png')}
            style={isCompleted ? [styles.cupImage,{opacity: 0.5}] : styles.cupImage}
          />
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({length: totalCups}, (_, index) => renderCup(index))}
      {/* <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={Array.from({length: totalCups}, (_, index) => index)}
        renderItem={({item: index}) => renderCup(index)}
        keyExtractor={item => item.toString()}
      /> */}
    </View>
  );
};

const isTablet = DeviceInfo.isTablet();

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: moderateScale(20),
    columnGap: moderateScale(20),
  },
  justify: {justifyContent: 'space-between'},
  cup: {
    // marginRight: 20,
    width: isTablet ? moderateScale(22) : moderateScale(25),
    height: isTablet ? verticalScale(27) : moderateScale(30),
  },
  cupImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default WaterJournal;
