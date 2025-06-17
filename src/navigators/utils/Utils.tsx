import {
  CommonActions,
  createNavigationContainerRef,
  StackActions,
  NavigationAction,
  ParamListBase,
} from '@react-navigation/native';

// Define the navigation reference
export const navigationRef = createNavigationContainerRef<ParamListBase>();

// Function to navigate to a specific route with optional parameters
export const navigate = (name: string, params?: object) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};

// Function to replace the current route with a new one, optionally passing parameters
export const navigateReplace = (name: string, params?: object) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
};

// Function to navigate back to the previous screen
export const navigateBack = () => {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
};

// Function to navigate back by two screens
export const navigateBackTwoScreens = () => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.pop(2));
  }
};
export const navigateBackMulripleScreen = (count: number) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.pop(count));
  }
};

// Function to reset the navigation stack and navigate to specific routes
export const navigateAndReset = (routes: any, index = 0) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes,
      }),
    );
  }
};

// Function to reset the navigation stack and navigate to a single route
export const navigateAndSimpleReset = (name: string, index = 0) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes: [{name}],
      }),
    );
  }
};

// Function to reset the navigation stack and navigate to a single route with parameters
export const navigateAndSimpleResetWithParam = (
  name: string,
  params: object,
  index = 0,
) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes: [{name, params}],
      }),
    );
  }
};
// To fix timezone related issue on dashboard
export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Round off numbers limiting to 2 decimals
export const formatToTwoDecimals = (value: string | number) => {
  const num = Number(value);
  if (!isNaN(num)) {
    const formattedValue = num.toFixed(2);
    if (formattedValue.endsWith('.00')) {
      return num.toFixed(0);
    }
    return parseFloat(formattedValue).toString();
  }

  return value;
};

export default formatToTwoDecimals;
