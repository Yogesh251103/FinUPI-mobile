import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Spinner from '../components/Spinner';
import { DUMMY_OTP, sendOtpCode, verifyOtp } from '../utils/dummyAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For now, we'll use dummy authentication only
const isDummyMode = true;
const isDevelopment = process.env.NODE_ENV === 'development';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          if (userData && userData.phoneNumber) {
            console.log('User already logged in, redirecting to dashboard');
            router.replace('/(tabs)');
            return; // No need to set checkingAuth to false as we're redirecting
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
      setCheckingAuth(false);
    };
    
    checkExistingUser();
  }, []);

  // Auto-fill OTP in development mode with dummy auth
  useEffect(() => {
    if (showOtpInput && isDummyMode && isDevelopment) {
      setOtp(DUMMY_OTP);
    }
  }, [showOtpInput]);

  const validatePhoneNumber = (number) => {
    // Simple validation - can be enhanced for better checks
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length < 10) return false;
    return true;
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    try {
      // Format phone number to ensure it has country code
      let formattedNumber = phoneNumber.trim();
      if (!formattedNumber.startsWith('+')) {
        // If it's a 10-digit Indian number
        if (/^\d{10}$/.test(formattedNumber)) {
          formattedNumber = `+91${formattedNumber}`;
        } else if (formattedNumber.startsWith('0')) {
          // If it starts with 0, replace with +91
          formattedNumber = `+91${formattedNumber.substring(1)}`;
        } else {
          formattedNumber = `+91${formattedNumber}`;
        }
      }

      console.log('Sending OTP to:', formattedNumber);

      // For now, we're only using dummy authentication
      const confirmation = await sendOtpCode(formattedNumber);
      
      console.log('OTP sent successfully, confirmation result:', confirmation);
      
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      setLoading(false);

      // Auto-fill OTP in development mode with dummy auth
      if (isDummyMode && isDevelopment) {
        setOtp(DUMMY_OTP);
      }
    } catch (err) {
      console.error('OTP Error:', err);
      let errorMessage = 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify OTP
      const result = await verifyOtp(confirmationResult.verificationId, otp);
      console.log('OTP verified successfully:', result);
      
      // Save user data to AsyncStorage with enhanced information
      try {
        // Format phone number for consistency
        const formattedPhone = phoneNumber.trim().replace(/\D/g, '');
        const lastFourDigits = formattedPhone.slice(-4);
        
        const userData = {
          phoneNumber: formattedPhone,
          uid: result.user?.uid || `user-${formattedPhone}`,
          displayName: result.user?.displayName || `User ${lastFourDigits}`,
          lastLogin: new Date().toISOString(),
          isAuthenticated: true
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log('Enhanced user data saved to AsyncStorage:', userData);
      } catch (storageError) {
        console.error('Error saving user to AsyncStorage:', storageError);
      }
      
      // Navigate to dashboard on successful verification
      router.replace('/(tabs)');
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setShowOtpInput(false);
    setConfirmationResult(null);
    setOtp('');
    setError('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      {checkingAuth ? (
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
          <Text style={styles.loadingText}>Checking login status...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollView}>
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.header}
            >
              <Text style={styles.title}>FinUPI</Text>
              <Text style={styles.subtitle}>UPI Payment Analytics</Text>
            </LinearGradient>

            <View style={styles.formContainer}>
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {!showOtpInput ? (
                // Phone Number Input
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={loading ? styles.buttonDisabled : styles.button}
                    onPress={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                // OTP Input
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter 6-digit OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={loading ? styles.buttonDisabled : styles.button}
                    onPress={handleVerifyOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.textButton}
                    onPress={handleTryAgain}
                    disabled={loading}
                  >
                    <Text style={styles.textButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isDevelopment && (
                <View style={styles.devInfo}>
                  <Text style={styles.devText}>Development Mode</Text>
                  {isDummyMode && (
                    <Text style={styles.devText}>Dummy OTP: {DUMMY_OTP}</Text>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 180,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b5998',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9caac4',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  textButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#3b5998',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  devInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ffe8cc',
    borderRadius: 8,
    alignItems: 'center',
  },
  devText: {
    color: '#cc7000',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#333',
    fontSize: 18,
    marginTop: 20,
  },
}); 