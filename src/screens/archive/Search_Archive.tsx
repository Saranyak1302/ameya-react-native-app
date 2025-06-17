import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppStrings} from '../../utils/Constants.tsx';
import {AppColors} from '../../theme/AppColors.tsx';
import Header from '../../components/Header.tsx';
import {screenDimensions} from '../../utils/ScreenDimensions.tsx';
import {AppFonts, AppFontSize, AppWeights} from '../../theme/AppFonts.tsx';
import {truncateText} from '../../utils/Helper.tsx';
import ReceipeItem from '../../components/ReceipeItem.tsx';
import SearchBar from '../../components/SearchBar.tsx';
import {PassioSDK} from '@passiolife/nutritionai-react-native-sdk-v3';
import {ActivityIndicator} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';

const Search_Archive = () => {
  const [searchText, setSearchText] = useState('');
  const [recording, setRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [detectedCandidates, setDetectedCandidates] = useState([]);

  const getArchiveItemsForText = async (text: string) => {
    try {
      const passioFoodItem: any = await PassioSDK?.searchForFoodSemantic(text);

      setIsSearching(false);

      if (passioFoodItem?.results != null) {
        setDetectedCandidates(passioFoodItem?.results);
      } else {
        setDetectedCandidates([]);
      }
    } catch (error) {
      setIsSearching(false);
      setDetectedCandidates([]);
    }
  };

  const renderSearchResultsContent = () => {
    const listToRender =
      detectedCandidates.length > 0 ? detectedCandidates : [];
    return listToRender.map((item: any, index: number) => {
      const customizedItem = {
        ...item,
        id: item?.resultId,
        receipe: item?.foodName,
        calories: item?.nutritionPreview?.calories,
        quantity: `${item?.nutritionPreview?.servingQuantity} ${item?.nutritionPreview?.servingUnit}`,
        image: item?.iconID,
      };
      return (
        <ReceipeItem
          type="search"
          key={index}
          item={customizedItem}
          isLastItem={false}
          truncateText={truncateText}
          actionBtnNeed={true}
          actionBtnImageTint={AppColors.buttonDarkBlue}
          actionBtnImage={require('../../../assets/images/heartsmall.png')}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={AppStrings.archive}
        onBack={undefined}
        varient="TYPE5"
        searchComponent={
          <SearchBar
            placeholder="Search"
            searchText={searchText}
            setSearchText={setSearchText}
            recording={recording}
            setRecording={setRecording}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            detectedCandidates={detectedCandidates}
            setDetectedCandidates={setDetectedCandidates}
            resultHandler={getArchiveItemsForText}
          />
        }
      />

      <View style={styles.tabContainer}>
        <View>
          <Text maxFontSizeMultiplier={1.4} style={styles.heading}>
            {searchText ? 'Search Results' : 'Recent Search Results'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.contentContainer}>
        {isSearching ? (
          <ActivityIndicator size="small" color={AppColors.darktBlue} />
        ) : (
          renderSearchResultsContent()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Need to add scale value to this file !!

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.greyWhite,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  tabContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  heading: {
    fontSize: AppFontSize.intersize18,
    fontWeight: AppWeights.interMedium,
    color: AppColors.textHeadingBlack,
    fontFamily: AppFonts.interMedium,
  },
});

export default Search_Archive;
