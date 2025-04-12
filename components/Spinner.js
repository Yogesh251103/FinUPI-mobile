/**
 * Spinner Component
 * A reusable loading spinner with configurable size
 */
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

const Spinner = ({ size = "medium", style = {} }) => {
  // Map size names to React Native's size values
  const sizeMap = {
    small: "small",
    medium: "large", // React Native only has "small" and "large"
    large: "large",
  };

  // Additional styling for large spinners
  const containerStyle = size === "large" ? styles.largeContainer : {};
  
  return (
    <View style={[styles.container, containerStyle, style]}>
      <ActivityIndicator 
        size={sizeMap[size]} 
        color={Colors.light.tint} 
        style={size === "large" ? { transform: [{ scale: 1.5 }] } : {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeContainer: {
    padding: 10,
  }
});

export default Spinner; 