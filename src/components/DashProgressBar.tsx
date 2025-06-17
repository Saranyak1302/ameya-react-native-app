import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppColors} from '../theme/AppColors.tsx';
import { moderateScale, verticalScale } from 'react-native-size-matters';

// @ts-ignore
const DashProgressBar = ({currentStep, totalSteps}) => {
  // Calculate the available width for each step
  const stepMargin = 2; // Space between steps
  const stepWidth = moderateScale(totalSteps < 5 ? 140 / 5 - stepMargin / totalSteps : 140 / totalSteps - stepMargin / totalSteps); // Calculate percentage width for each step
  // Function to render each step
  const renderSteps = () => {
    let steps = [];

    for (let i = 1; i <= totalSteps; i++) {
      steps.push(
        <View
          key={i}
          style={[
            styles.step,
            {width: stepWidth}, // Dynamic width applied here
            i <= currentStep ? styles.activeStep : styles.inactiveStep,
          ]}
        />,
      );
    }

    return steps;
  };

  return <View style={[
    styles.progressBar, 
    {justifyContent: totalSteps < 5 ? 'flex-start' : 'space-between'},
    {gap: totalSteps < 5 ? moderateScale(5) : 'none'}]}>{renderSteps()}</View>;
};

const styles = StyleSheet.create({
  progressBar: {
    flexDirection: 'row',
    width: '100%',
    // backgroundColor: 'red',
  },
  step: {
    height: verticalScale(8),
    borderRadius: moderateScale(4),
    borderWidth: moderateScale(1),
    // marginHorizontal: 2,
  },
  activeStep: {
    backgroundColor: AppColors.darkGreen, // Active fill color
    borderColor: AppColors.darkGreen, // Active border color
  },
  inactiveStep: {
    backgroundColor: AppColors.white, // Inactive fill color
    borderColor: AppColors.darkGreen, // Inactive border color
  },
});

export default DashProgressBar;
