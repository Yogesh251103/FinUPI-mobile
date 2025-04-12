import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import Spinner from '@/components/Spinner';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          if (user && user.phoneNumber) {
            console.log('User found in storage, redirecting to dashboard');
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" />
      </View>
    );
  }
  
  // Redirect based on authentication status
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/login"} />;
} 