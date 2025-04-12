/**
 * Dummy Authentication Module for Local Development
 * Simulates phone-based authentication flow without requiring real phone verification
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dummy users data store
const dummyUsers = {
  1234567890: { name: "Test User", uid: "dummy-uid-123" },
};

// Fixed OTP for any verification - always "123456"
const DUMMY_OTP = "123456";

// In-memory session storage for sign-in state
let currentUser = null;

// Keep track of auth state listeners
const authListeners = [];

// Notify all listeners of auth state changes
const notifyAuthStateChange = (user) => {
  console.log("Notifying all auth listeners of state change:", user);
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (error) {
      console.error("Error in auth state listener:", error);
    }
  });
};

// Simulates sending an OTP to a phone number
const sendOtpCode = async (phoneNumber) => {
  console.log(`[DUMMY AUTH] OTP sent to ${phoneNumber}`);

  // Return a fake confirmation result that will be used in verifyOtp
  return {
    verificationId: `dummy-verification-${phoneNumber}`,
    phoneNumber,
  };
};

// Verifies the provided OTP
const verifyOtp = async (verificationId, otpCode) => {
  // Extract phone number from the verification ID
  const phoneNumber = verificationId.split("-")[2];

  // Check if OTP matches our fixed dummy OTP
  if (otpCode !== DUMMY_OTP) {
    throw new Error("Invalid OTP code");
  }

  // Check if we have this user in our dummy database
  if (!dummyUsers[phoneNumber]) {
    // Create a new user if not exists
    dummyUsers[phoneNumber] = {
      name: "New User",
      uid: `dummy-uid-${Date.now()}`,
    };
  }

  // Set the current user
  currentUser = {
    uid: dummyUsers[phoneNumber].uid,
    phoneNumber,
    displayName: dummyUsers[phoneNumber].name,
    // Add more user fields as needed
  };

  console.log(`[DUMMY AUTH] User authenticated:`, currentUser);
  
  // Save to AsyncStorage instead of localStorage
  try {
    await AsyncStorage.setItem("user", JSON.stringify(currentUser));
  } catch (error) {
    console.error("Error saving user to AsyncStorage:", error);
  }

  // Notify listeners
  notifyAuthStateChange(currentUser);

  return { user: currentUser };
};

// Get the current authenticated user
const getCurrentUser = () => {
  return currentUser;
};

// Sign out the current user
const signOut = async () => {
  const prevUser = currentUser;
  currentUser = null;
  console.log("[DUMMY AUTH] User signed out");
  
  // Clear from AsyncStorage
  try {
    await AsyncStorage.removeItem("user");
  } catch (error) {
    console.error("Error removing user from AsyncStorage:", error);
  }

  // Notify listeners if there was a user
  if (prevUser) {
    notifyAuthStateChange(null);
  }
};

// Initialize auth state from AsyncStorage
const initAuthFromStorage = async () => {
  try {
    const savedUser = await AsyncStorage.getItem("user");
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      console.log("Restored user from AsyncStorage:", currentUser);
    }
  } catch (error) {
    console.error("Error loading user from AsyncStorage:", error);
    await AsyncStorage.removeItem("user"); // Clear corrupted data
  }
};

// Subscribe to auth state changes
const onAuthStateChanged = (callback) => {
  console.log("[DUMMY AUTH] Adding auth state listener");

  // Initialize from storage if not done yet
  if (!currentUser) {
    initAuthFromStorage().then(() => {
      // Initial callback with current auth state after init
      callback(currentUser);
    });
  } else {
    // Initial callback with current auth state
    setTimeout(() => callback(currentUser), 0);
  }

  // Add to listeners array
  authListeners.push(callback);

  // Return unsubscribe function
  return () => {
    const index = authListeners.indexOf(callback);
    if (index !== -1) {
      authListeners.splice(index, 1);
      console.log("[DUMMY AUTH] Removed auth state listener");
    }
  };
};

// Check if the user is authenticated by examining the user object in AsyncStorage
const isAuthenticated = async () => {
  try {
    const savedUser = await AsyncStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      return !!(userData && userData.phoneNumber);
    }
    return false;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
};

export {
  sendOtpCode,
  verifyOtp,
  getCurrentUser,
  signOut,
  onAuthStateChanged,
  initAuthFromStorage,
  isAuthenticated,
  DUMMY_OTP, // Export this so the UI can show the test code
}; 