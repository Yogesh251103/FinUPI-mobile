# FinUPI Mobile App

This is the React Native Expo mobile version of the FinUPI application, which provides UPI transaction analytics and financial services.

## Features

- **Dashboard**: View transaction summaries, recent transactions, and quick access to all features
- **Credit Score**: Check your credit score with detailed breakdown and improvement suggestions
- **Apply Loan**: Apply for loans with customizable amount and terms
- **Loan Offers**: Browse available loan offers based on your credit score
- **Repayments**: Track and manage your loan repayments
- **Profile**: View and edit your profile information

## Tech Stack

- React Native
- Expo
- React Navigation
- Redux Toolkit
- Firebase Authentication & Firestore
- Axios for API calls
- React Native Chart Kit for visualizations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio / Xcode (for emulator) or Expo Go app on your physical device

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/FinUPI_spectrum.git
   ```

2. Install dependencies
   ```
   cd FinUPI-mobile
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Run on your preferred platform
   ```
   npm run android    # For Android
   npm run ios        # For iOS (requires macOS)
   npm run web        # For web
   ```

## Backend Connection

The app connects to the FinServer backend for API services. Make sure the backend server is running for full functionality.

## Demo Credentials

For testing purposes, you can use:
- Phone: 1234567890
- OTP: 123456

## Notes

This mobile app maintains feature parity with the web version, but adapts the UI for mobile interaction patterns. The app uses a combination of real and mock data for demonstration purposes.
