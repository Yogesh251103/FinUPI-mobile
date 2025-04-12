import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { signOut } from '@/utils/dummyAuth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  // Navigation matches web app's Navbar component
  const handleLogout = async () => {
    try {
      // Sign out user
      await signOut();
      // Redirect to login
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Helper function for consistent tab options
  const getTabOptions = (title: string, label: string, iconName: any) => ({
    title,
    tabBarLabel: label,
    tabBarIcon: ({ color }: { color: string }) => (
      <IconSymbol size={18} name={iconName} color={color} />
    ),
    tabBarShowLabel: true,
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: '#888888',
        headerShown: false,
        tabBarShowLabel: true,
        tabBarAllowFontScaling: false,
        tabBarButton: props => <HapticTab {...props} />,
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 4,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: 3,
        },
        tabBarStyle: {
          height: 58,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={18} name="house.fill" color={color} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="credit-score"
        options={{
          title: 'Credit Score',
          tabBarIcon: ({ color }) => <IconSymbol size={18} name="chart.bar.fill" color={color} />,
          tabBarLabel: 'Score',
        }}
      />
      <Tabs.Screen
        name="apply-loan"
        options={{
          title: 'Apply Loan',
          tabBarIcon: ({ color }) => <IconSymbol size={18} name="banknote.fill" color={color} />,
          tabBarLabel: 'Apply',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Daily Upskilling',
          tabBarIcon: ({ color }) => <IconSymbol size={18} name="book.fill" color={color} />,
          tabBarLabel: 'Learn',
        }}
      />
      <Tabs.Screen
        name="loan-offers"
        options={{
          title: 'Loan Offers',
          tabBarIcon: ({ color }) => <IconSymbol size={18} name="gift.fill" color={color} />,
          tabBarLabel: 'Offers',
        }}
      />
      <Tabs.Screen
        name="repayments"
        options={{
          title: 'Repayments',
          tabBarIcon: ({ color }) => <IconSymbol size={18} name="arrow.clockwise" color={color} />,
          tabBarLabel: 'Repay',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={18} name="person.fill" color={color} />,
          tabBarLabel: 'Profile',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: {
    color: '#3b5998',
    fontWeight: '600',
  },
});
