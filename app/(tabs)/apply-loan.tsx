import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import Spinner from '@/components/Spinner';

// Import Redux hooks
import { useAppDispatch, useAppSelector } from '../redux/hooks';

interface LoanFormData {
  loanAmount: number;
  loanTerm: number;
  purpose: string;
}

// Simple custom slider component
const SimpleSlider: React.FC<{
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
}> = ({ value, minimumValue, maximumValue, step, onValueChange }) => {
  // Ensure we have valid values to work with
  const validValue = isNaN(value) ? minimumValue : value;
  const validStep = isNaN(step) || step <= 0 ? 1 : step;
  
  // Formatted values for display
  const formattedValue = isNaN(validValue) ? 'Error' : validValue.toLocaleString();
  
  // Increment function with bounds checking
  const increment = () => {
    const newValue = Math.min(maximumValue, validValue + validStep);
    if (newValue !== validValue) {
      onValueChange(newValue);
    }
  };
  
  // Decrement function with bounds checking
  const decrement = () => {
    const newValue = Math.max(minimumValue, validValue - validStep);
    if (newValue !== validValue) {
      onValueChange(newValue);
    }
  };
  
  return (
    <View style={styles.sliderContainer}>
      <TouchableOpacity 
        style={styles.sliderButton}
        onPress={decrement}
        disabled={validValue <= minimumValue}
      >
        <Text style={styles.sliderButtonText}>-</Text>
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>
          {formattedValue}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.sliderButton}
        onPress={increment}
        disabled={validValue >= maximumValue}
      >
        <Text style={styles.sliderButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function ApplyLoanScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  
  // Get data from Redux first so we can use it for initial state
  const creditScore = useAppSelector(state => state.credit.creditScore);
  const maxLoanAmount = useAppSelector(state => state.credit.maxLoanAmount) || 50000;
  const maxLoanDuration = useAppSelector(state => state.credit.maxLoanDuration) || 36;
  
  // Log the Redux state values
  console.log('Redux max loan amount:', maxLoanAmount);
  
  // Set initial loan amount to 50% of max (or 25000 if that would be too small)
  const initialLoanAmount = Math.min(
    Math.max(25000, Math.floor((maxLoanAmount || 50000) * 0.5 / 1000) * 1000), 
    maxLoanAmount || 50000
  );
  
  const [formData, setFormData] = useState<LoanFormData>({
    loanAmount: initialLoanAmount,
    loanTerm: 12,
    purpose: '',
  });
  
  // Adjust loan amount if it exceeds max loan amount
  useEffect(() => {
    if (formData.loanAmount > maxLoanAmount && maxLoanAmount > 0) {
      setFormData(prev => ({
        ...prev,
        loanAmount: maxLoanAmount
      }));
    }
  }, [maxLoanAmount]);

  const [interestRate, setInterestRate] = useState<number>(1.08);
  const [emi, setEmi] = useState<number>(0);

  // Purposes for loan dropdown
  const loanPurposes = [
    'Medical Expenses',
    'Education',
    'Home Renovation',
    'Debt Consolidation',
    'Wedding',
    'Travel',
    'Electronics Purchase',
    'Vehicle Purchase',
    'Business',
    'Other'
  ];

  useEffect(() => {
    // Calculate EMI whenever loan amount or term changes
    calculateEmi();
  }, [formData.loanAmount, formData.loanTerm]);

  const calculateEmi = () => {
    try {
      const p = formData.loanAmount;
      const r = interestRate / 12 / 100; // Monthly interest rate
      const n = formData.loanTerm; // Loan term in months
      
      // Check for valid inputs
      if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || n <= 0) {
        setEmi(0);
        return;
      }
      
      // EMI formula: [P x R x (1+R)^N]/[(1+R)^N-1]
      const emiValue = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      
      // Prevent NaN or infinity
      setEmi(!isFinite(emiValue) ? 0 : emiValue);
    } catch (error) {
      console.error("Error calculating EMI:", error);
      setEmi(0);
    }
  };

  const validateForm = (): boolean => {
    if (formData.loanAmount < 1000 || formData.loanAmount > maxLoanAmount) {
      Alert.alert('Error', `Loan amount should be between ₹1,000 and ₹${maxLoanAmount.toLocaleString()}`);
      return false;
    }
    
    if (formData.loanTerm < 3 || formData.loanTerm > maxLoanDuration) {
      Alert.alert('Error', `Loan term should be between 3 and ${maxLoanDuration} months`);
      return false;
    }
    
    if (!formData.purpose) {
      Alert.alert('Error', 'Please select a loan purpose');
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Application Submitted', 
        'Your loan application has been submitted successfully. You will be redirected to loan offers.',
        [
          { 
            text: 'OK', 
            onPress: () => router.push('/(tabs)/loan-offers' as any)
          }
        ]
      );
    }, 2000);
  };

  const handlePurposeSelect = (purpose: string) => {
    setFormData(prevState => ({
      ...prevState,
      purpose
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Apply for Loan</Text>
            <View style={styles.creditScoreContainer}>
              <Text style={styles.creditScoreLabel}>Your Credit Score:</Text>
              <Text style={styles.creditScoreValue}>{creditScore}</Text>
            </View>
          </View>
          
          <View style={styles.formContainer}>
            {/* Loan Amount Slider */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Loan Amount (₹)</Text>
              <Text style={styles.valueDisplay}>
                {!isNaN(formData.loanAmount) ? 
                  `₹${formData.loanAmount.toLocaleString()}` : 
                  'Please select an amount'}
              </Text>
              <SimpleSlider
                minimumValue={1000}
                maximumValue={maxLoanAmount || 50000}
                step={maxLoanAmount > 100000 ? 5000 : (maxLoanAmount > 20000 ? 1000 : 500)}
                value={formData.loanAmount}
                onValueChange={(value: number) => setFormData(prev => ({ ...prev, loanAmount: value }))}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>₹1,000</Text>
                <Text style={styles.sliderLabel}>₹{(maxLoanAmount || 50000).toLocaleString()}</Text>
              </View>
            </View>
            
            {/* Loan Term Slider */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Loan Term (Months)</Text>
              <Text style={styles.valueDisplay}>
                {!isNaN(formData.loanTerm) ? 
                  `${formData.loanTerm} months` : 
                  'Please select a term'}
              </Text>
              <SimpleSlider
                minimumValue={3}
                maximumValue={maxLoanDuration || 36}
                step={1}
                value={formData.loanTerm}
                onValueChange={(value: number) => setFormData(prev => ({ ...prev, loanTerm: value }))}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>3 months</Text>
                <Text style={styles.sliderLabel}>{maxLoanDuration} months</Text>
              </View>
            </View>
            
            {/* Loan Purpose Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Loan Purpose</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.purposeContainer}>
                {loanPurposes.map(purpose => (
                  <TouchableOpacity
                    key={purpose}
                    style={[
                      styles.purposeButton,
                      formData.purpose === purpose && styles.selectedPurposeButton
                    ]}
                    onPress={() => handlePurposeSelect(purpose)}
                  >
                    <Text 
                      style={[
                        styles.purposeButtonText,
                        formData.purpose === purpose && styles.selectedPurposeButtonText
                      ]}
                    >
                      {purpose}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* EMI Calculation */}
            <View style={styles.emiContainer}>
              <Text style={styles.emiTitle}>Your Estimated EMI</Text>
              <Text style={styles.emiValue}>
                {isFinite(emi) && emi > 0 ? 
                  `₹${Math.round(emi).toLocaleString()}` : '₹0'} 
                <Text style={styles.emiPeriod}>per month</Text>
              </Text>
              <Text style={styles.emiDetails}>
                Interest Rate: {interestRate}% | Total Repayment: 
                {isFinite(emi) && emi > 0 ? 
                  ` ₹${Math.round(emi * formData.loanTerm).toLocaleString()}` : ' ₹0'}
              </Text>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <Spinner size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Apply Now</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.disclaimer}>
              By applying, you agree to our terms and conditions. 
              This is a preliminary application and final terms depend on verification.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.tint,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  creditScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditScoreLabel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  creditScoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  formContainer: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  valueDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 10,
  },
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderTrackContainer: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
    marginHorizontal: 10,
    position: 'relative',
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  sliderFill: {
    height: 6,
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.tint,
    position: 'absolute',
    top: 5,
    marginLeft: -10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
  },
  purposeContainer: {
    padding: 10,
    flexDirection: 'row',
  },
  purposeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedPurposeButton: {
    backgroundColor: Colors.light.tint,
  },
  purposeButtonText: {
    color: '#333',
  },
  selectedPurposeButtonText: {
    color: 'white',
  },
  emiContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 15,
  },
  emiTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginVertical: 5,
  },
  emiPeriod: {
    fontSize: 14,
    color: '#666',
  },
  emiDetails: {
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  sliderButton: {
    width: 30,
    height: 30,
    backgroundColor: Colors.light.tint,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.tint,
    textAlign: 'center',
  },
}); 