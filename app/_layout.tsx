import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { useColorScheme } from '@/hooks/useColorScheme';
import Spinner from '@/components/Spinner';
import { initAuthFromStorage, onAuthStateChanged } from '@/utils/dummyAuth';
import { store } from './redux/store';

// Define User type based on usage in the app
type User = {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  [key: string]: any;
} | null;

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a user in AsyncStorage
        const savedUserJson = await AsyncStorage.getItem('user');
        if (savedUserJson) {
          const savedUser = JSON.parse(savedUserJson);
          // If we have a phoneNumber, the user is considered logged in
          if (savedUser && savedUser.phoneNumber) {
            console.log("User found in storage, auto-logging in:", savedUser);
            setUser(savedUser);
          }
        }
        
        // Set up auth state listener
        const unsubscribe = onAuthStateChanged((authUser: User) => {
          console.log("Auth state changed:", authUser);
          setUser(authUser);
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <Spinner size="large" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" redirect={user !== null} />
          <Stack.Screen name="login" />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
            redirect={user === null}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}
