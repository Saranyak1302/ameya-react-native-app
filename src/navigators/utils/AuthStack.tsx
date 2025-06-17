import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {NavigatorNames} from '../tabs/NavigatorsNames.tsx';
import OtpAuth from '../../screens/otp_auth/OtpAuth.tsx';
import AccountCreated from '../../screens/otp_auth/AccountCreated.tsx';
import Authentication from '../../screens/auth/Authentication.tsx';
import PrivacyNotice from '../../screens/privacy_notice/Privacy_Notice.tsx';
import Terms from '../../screens/terms/Terms.tsx';

const AppStack: any = createStackNavigator();

const AuthStack = () => {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name={NavigatorNames.authentication}
        component={Authentication}
        options={{headerShown: false}}></AppStack.Screen>
      <AppStack.Screen
        name={NavigatorNames.otpAuth}
        component={OtpAuth}
        options={{headerShown: false}}></AppStack.Screen>
      <AppStack.Screen
        name={NavigatorNames.accountCreated}
        component={AccountCreated}
        options={{headerShown: false}}></AppStack.Screen>
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
    </AppStack.Navigator>
  );
};

export default AuthStack;
