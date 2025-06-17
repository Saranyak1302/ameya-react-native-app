import {createStackNavigator} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import TabsStack from '../tabs/TabStack';
import {NavigatorNames} from '../tabs/NavigatorsNames';
import FoodLog from '../../screens/nutrition_logs/food_log/FoodLog.tsx';
import AddFood from '../../screens/nutrition_logs/add_food/AddFood.tsx';
import Personal_Info from '../../screens/personal_info/Personal_Info.tsx';
import Archive from '../../screens/archive/Archive.tsx';
import Search_Archive from '../../screens/archive/Search_Archive.tsx';
import Devices from '../../screens/devices/Devices.tsx';
import PrivacyNotice from '../../screens/privacy_notice/Privacy_Notice.tsx';
import Terms from '../../screens/terms/Terms.tsx';
import AddIngredient from '../../screens/nutrition_logs/add_food/AddIngredient.tsx';
import IngredientDetails from '../../screens/nutrition_logs/add_food/IngredientDetails.tsx';
import FoodScan from '../../screens/nutrition_logs/food_scan/FoodScan';
import SearchFood from '../../screens/nutrition_logs/add_food/SearchFood';
import MovementList from '../../screens/movements/MovementList';
import SurveyList from '../../screens/survey/SurveyList.tsx';
import SurveyWebView from '../../screens/survey/SurveyWebView.tsx';
import VideoInstructions from '../../screens/movements/VideoInstructions.tsx';
import SetupVideoInstructions from '../../screens/movements/SetupVideoInstructions.tsx';
import MocapView from '../../screens/movements/mocap/MocapView';
import PatientList from '../../screens/doctor_screens/PatientList';
import UploadAllVideo from '../../screens/doctor_screens/UploadAllVideo';
import {HealthScreen} from '../../screens/health/HealthScreen.tsx';
import MocapPlayBack from '../../screens/movements/mocap/MocapPlayBack';
import Activity from '../../screens/activity/Activity';
import ReceipeCardNew from '../../screens/nutrition_logs/add_food/ReceipeCardNew';
import DevicesWebView from '../../screens/devices/DevicesWebView.tsx';
import Home from '../../screens/home/Home.tsx';
import {useFocusEffect} from '@react-navigation/native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

export type RootStackParamList = {
  [NavigatorNames.main]: undefined;
  [NavigatorNames.foodLog]: undefined;
  [NavigatorNames.addFood]: undefined;
  [NavigatorNames.personalInfo]: undefined;
  [NavigatorNames.archive]: undefined;
  [NavigatorNames.searchArchive]: undefined;
  [NavigatorNames.devices]: undefined;
  [NavigatorNames.privacyNotice]: undefined;
  [NavigatorNames.termsOfUse]: undefined;
  [NavigatorNames.addIngredient]: undefined;
  [NavigatorNames.ingredientDetails]: undefined;
  [NavigatorNames.foodScan]: undefined;
  [NavigatorNames.searchFood]: undefined;
  [NavigatorNames.movementList]: undefined;
  [NavigatorNames.surveyList]: undefined;
  [NavigatorNames.surveyWebView]: undefined;
  [NavigatorNames.videoInstructions]: undefined;
  [NavigatorNames.setupVideoInstructions]: undefined;
  [NavigatorNames.mocapView]: undefined;
  [NavigatorNames.patientList]: undefined;
  [NavigatorNames.uploadAllVideo]: undefined;
  [NavigatorNames.healthData]: undefined;
  [NavigatorNames.mocapPlayBack]: undefined;
  [NavigatorNames.connectedDevices]: undefined;
  [NavigatorNames.receipeCardNew]: undefined;
  [NavigatorNames.devicesWebView]: undefined;
};
const AppStack = createStackNavigator<RootStackParamList>();

const AuthenticatedStack = () => {
  useFocusEffect(
    useCallback(() => {
      // console.log('Authenticate use focus called');
      // SystemNavigationBar.leanBack();
    }, []),
  );
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name={NavigatorNames.main}
        component={TabsStack}
        options={{headerShown: false}}
      />

      <AppStack.Screen
        name={NavigatorNames.foodLog}
        component={FoodLog}
        options={{headerShown: false}}
      />

      <AppStack.Screen
        name={NavigatorNames.addFood}
        component={AddFood}
        options={{headerShown: false}}
      />

      <AppStack.Screen
        name={NavigatorNames.personalInfo}
        component={Personal_Info}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.archive}
        component={Archive}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.searchArchive}
        component={Search_Archive}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.devices}
        component={Devices}
        options={{headerShown: false}}
      />

      <AppStack.Screen
        name={NavigatorNames.healthData}
        component={HealthScreen}
        options={{headerShown: false}}
      />

      <AppStack.Screen
        name={NavigatorNames.privacyNotice}
        component={PrivacyNotice}
        options={{headerShown: false}}
      />

      <AppStack.Screen
        name={NavigatorNames.termsOfUse}
        component={Terms}
        options={{headerShown: false}}
      />

      <AppStack.Screen
        name={NavigatorNames.addIngredient}
        component={AddIngredient}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.ingredientDetails}
        component={IngredientDetails}
        options={{headerShown: false}}
      />

      <AppStack.Screen
        name={NavigatorNames.foodScan}
        component={FoodScan}
        options={{headerShown: false}}></AppStack.Screen>
      <AppStack.Screen
        name={NavigatorNames.searchFood}
        component={SearchFood}
        options={{headerShown: false}}></AppStack.Screen>
      <AppStack.Screen
        name={NavigatorNames.movementList}
        component={MovementList}
        options={{headerShown: false}}></AppStack.Screen>

      <AppStack.Screen
        name={NavigatorNames.surveyList}
        component={SurveyList}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.surveyWebView}
        component={SurveyWebView}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.videoInstructions}
        component={VideoInstructions}
        options={{headerShown: false, animationEnabled: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.setupVideoInstructions}
        component={SetupVideoInstructions}
        options={{headerShown: false, animationEnabled: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.patientList}
        component={PatientList}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.uploadAllVideo}
        component={UploadAllVideo}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.mocapView}
        component={MocapView}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.mocapPlayBack}
        component={MocapPlayBack}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.connectedDevices}
        component={Activity}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.receipeCardNew}
        component={ReceipeCardNew}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.devicesWebView}
        component={DevicesWebView}
        options={{headerShown: false}}
      />
    </AppStack.Navigator>
  );
};

export default AuthenticatedStack;
