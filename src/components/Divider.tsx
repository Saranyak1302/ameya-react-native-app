// Divider.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {AppColors} from "../theme/AppColors.tsx";
import { moderateScale, verticalScale } from 'react-native-size-matters';

const Divider = ({ color = AppColors.textFieldBorderGrey, thickness = 1, marginVertical = 10 }) => {
    return (
        <View
            style={[
                styles.divider,
                { backgroundColor: color, height: verticalScale(thickness), marginVertical: moderateScale(marginVertical) }
            ]}
        />
    );
};

const styles = StyleSheet.create({
    divider: {
        width: '100%',
    },
});

export default Divider;
