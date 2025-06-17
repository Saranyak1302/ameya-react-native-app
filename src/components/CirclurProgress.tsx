import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Circle} from 'react-native-svg';

// Circular Loader Component
export const CircularProgress = ({progress}: {progress: number}) => {
  const radius = 20; // Radius of the circle
  const strokeWidth = 5; // Width of the stroke
  const circumference = 2 * Math.PI * radius; // Total circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference; // Offset for the red stroke

  return (
    <Svg width={radius * 2} height={radius * 2}>
      {/* Background Circle */}
      <Circle
        cx={radius}
        cy={radius}
        r={radius - strokeWidth / 2}
        stroke="rgba(16, 52, 166, 0.25)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress Circle */}
      <Circle
        cx={radius}
        cy={radius}
        r={radius - strokeWidth / 2}
        stroke="#1034A6"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        rotation="-90"
        origin={`${radius}, ${radius}`}
      />
    </Svg>
  );
};
