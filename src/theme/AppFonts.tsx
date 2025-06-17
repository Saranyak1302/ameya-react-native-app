import {Platform} from 'react-native';
import {moderateScale, scale} from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
const isIpad = DeviceInfo.isTablet();
export const AppFonts = {
  interBold: 'interbold',
  interExtraBold: 'interextrabold',
  interLight: 'interlight',
  interExtraLight: 'interextralight',
  interMedium: 'intermedium',
  interRegular: 'interregular',
  interSemibold: 'intersemibold',
  interThin: 'interthin',
};

export const AppWeights =
  Platform.OS === 'ios'
    ? {
        interBold: '700' as const,
        interExtraBold: '800' as const,
        interLight: '300' as const,
        interExtraLight: '200' as const,
        interMedium: '500' as const,
        interRegular: '400' as const,
        interSemibold: '600' as const,
        interThin: '100' as const,
      }
    : {
        interBold: undefined,
        interExtraBold: undefined,
        interLight: undefined,
        interExtraLight: undefined,
        interMedium: undefined,
        interRegular: undefined,
        interSemibold: undefined,
        interThin: undefined,
      };
// const adjustFontSize = size => {
//   console.log('isIpad', isIpad);
//   if (size > 18) {
//     return scale(isIpad ? size - scale(3.5) : size);
//   } else {
//     return scale(isIpad ? size - scale(2.8) : size);
//   }
// };
export const getModerateScaleSize = (size: number) => {
  return moderateScale(size, isIpad ? 0.2 : 1);
};

export const AppFontSize = {
  intersize11: getModerateScaleSize(11),
  intersize14: getModerateScaleSize(14),
  intersize15: getModerateScaleSize(15),
  intersize16: getModerateScaleSize(16),
  intersize17: getModerateScaleSize(17),
  intersize18: getModerateScaleSize(18),
  intersize19: getModerateScaleSize(19),
  intersize20: getModerateScaleSize(20),
  intersize22: getModerateScaleSize(22),
  intersize24: getModerateScaleSize(24),
  intersize26: getModerateScaleSize(26),
  intersize28: getModerateScaleSize(28),
  intersize32: getModerateScaleSize(32),
  intersize38: getModerateScaleSize(38),
  intersize52: getModerateScaleSize(52),
};

// export const AppFontSize = {
//   intersize11: scale(11),
//   intersize14: scale(14),
//   intersize15: scale(15),
//   intersize16: scale(16),
//   intersize17: scale(17),
//   intersize18: scale(18),
//   intersize19: scale(19),
//   intersize20: scale(20),
//   intersize22: scale(22),
//   intersize24: scale(24),
//   intersize26: scale(26),
//   intersize28: scale(28),
//   intersize32: scale(32),
//   intersize38: scale(38),
//   intersize52: scale(52),
// };
