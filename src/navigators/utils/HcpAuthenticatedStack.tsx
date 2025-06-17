import {createStackNavigator} from '@react-navigation/stack';
import HcpMovementList from '../../screens/doctor_screens/HcpMovementList';
import HcpProfile from '../../screens/doctor_screens/HcpProfile';
import PatientList from '../../screens/doctor_screens/PatientList';
import UploadAllVideo from '../../screens/doctor_screens/UploadAllVideo';
import MocapView from '../../screens/movements/mocap/MocapView';
import {NavigatorNames} from '../tabs/NavigatorsNames';
import MocapPlayBack from '../../screens/movements/mocap/MocapPlayBack';
export type RootStackParamList = {
  [NavigatorNames.mocapView]: undefined;
  [NavigatorNames.patientList]: undefined;
  [NavigatorNames.uploadAllVideo]: undefined;
  [NavigatorNames.hcpMovementList]: undefined;
  [NavigatorNames.hcpProfile]: undefined;
  [NavigatorNames.mocapPlayBack]: undefined;
};

const AppStack = createStackNavigator<RootStackParamList>();

const HcpAuthenticatedStack = () => {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name={NavigatorNames.patientList}
        component={PatientList}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.hcpMovementList}
        component={HcpMovementList}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name={NavigatorNames.hcpProfile}
        component={HcpProfile}
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
    </AppStack.Navigator>
  );
};

export default HcpAuthenticatedStack;
