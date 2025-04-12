import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LineChart } from 'react-native-chart-kit';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import Spinner from '@/components/Spinner';
import axios from 'axios';

// Import Redux hooks
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { updateCreditInfo, setCreditScore, setMaxLoanAmount, setMaxLoanDuration, setScoreCategory } from '../redux/slices/creditSlice';

// API endpoint base URL
const API_BASE_URL = "http://localhost:5000";

// Define interfaces
interface CreditScoreData {
  score: number;
  score_components: {
    payment_history: number;
    credit_utilization: number;
    credit_age: number;
    upi_activity: number;
    transaction_patterns: number;
  };
  score_history: {
    date: string;
    score: number;
  }[];
  financial_summary: {
    avg_monthly_inflow: number;
    avg_monthly_outflow: number;
    avg_balance: number;
    savings_trend: string;
  };
  loan_eligibility: {
    max_amount: number;
    suggested_term: number;
    interest_rate: number;
  };
}

export default function CreditScoreScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [creditScore, setCreditScoreLocal] = useState<CreditScoreData | null>(null);
  const [error, setError] = useState<string>('');
  
  // Redux
  const dispatch = useAppDispatch();
  const reduxCreditScore = useAppSelector(state => state.credit.creditScore);
  const reduxMaxLoan = useAppSelector(state => state.credit.maxLoanAmount);

  useEffect(() => {
    fetchCreditScore();
  }, []);

  const fetchCreditScore = async () => {
    setLoading(true);
    setError('');

    try {
      // Try to get real data from API first
      try {
        const response = await fetch('http://localhost:5000/get_credit_score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "user_id": 8754512892
          })
        });

        if (response.ok) {
          const apiData = await response.json();
          console.log('Credit score API response:', apiData);
          
          // If we have valid API data
          if (apiData && apiData.credit_score) {
            // Create a formatted data structure
            const apiScoreData = {
              score: apiData.credit_score,
              score_components: {
                payment_history: apiData.component_scores?.financial_discipline || 75,
                credit_utilization: apiData.component_scores?.expense_management || 75,
                credit_age: 70, // Default value
                upi_activity: apiData.component_scores?.transaction_history || 90,
                transaction_patterns: apiData.component_scores?.income_stability || 80
              },
              score_history: [
                // Generate some mock history based on current score
                { date: '2024-01', score: Math.max(600, apiData.credit_score - 40) },
                { date: '2024-02', score: Math.max(600, apiData.credit_score - 30) },
                { date: '2024-03', score: Math.max(600, apiData.credit_score - 20) },
                { date: '2024-04', score: Math.max(600, apiData.credit_score - 10) },
                { date: '2024-05', score: Math.max(600, apiData.credit_score - 5) },
                { date: '2024-06', score: apiData.credit_score }
              ],
              financial_summary: {
                avg_monthly_inflow: 45000,
                avg_monthly_outflow: 35000,
                avg_balance: 12000,
                savings_trend: 'Positive'
              },
              loan_eligibility: {
                max_amount: apiData.loan_eligibility?.max_loan_amount || 5000,
                suggested_term: apiData.loan_eligibility?.max_duration_months || 12,
                interest_rate: apiData.loan_eligibility?.interest_rate || 14
              }
            };
            
            setCreditScoreLocal(apiScoreData);
            
            // Update Redux store with API data
            dispatch(updateCreditInfo({
              creditScore: apiScoreData.score,
              maxLoanAmount: apiScoreData.loan_eligibility.max_amount, 
              maxLoanDuration: apiScoreData.loan_eligibility.suggested_term,
              scoreCategory: getScoreLevel(apiScoreData.score)
            }));
            
            setLoading(false);
            return; // Exit early since we got API data
          }
        }
      } catch (apiError) {
        console.log('Error fetching from API, falling back to mock data:', apiError);
        // Continue to mock data if API fails
      }
      
      // For this demo, we'll use mock data as fallback
      setTimeout(() => {
        const scoreData = {
          score: 745,
          score_components: {
            payment_history: 85,
            credit_utilization: 75,
            credit_age: 70,
            upi_activity: 90,
            transaction_patterns: 80
          },
          score_history: [
            { date: '2024-01', score: 700 },
            { date: '2024-02', score: 710 },
            { date: '2024-03', score: 705 },
            { date: '2024-04', score: 725 },
            { date: '2024-05', score: 735 },
            { date: '2024-06', score: 745 }
          ],
          financial_summary: {
            avg_monthly_inflow: 45000,
            avg_monthly_outflow: 35000,
            avg_balance: 12000,
            savings_trend: 'Positive'
          },
          loan_eligibility: {
            max_amount: 50000,
            suggested_term: 12,
            interest_rate: 14
          }
        };
        
        setCreditScoreLocal(scoreData);
        
        // Update Redux store
        dispatch(updateCreditInfo({
          creditScore: scoreData.score,
          maxLoanAmount: scoreData.loan_eligibility.max_amount, 
          maxLoanDuration: scoreData.loan_eligibility.suggested_term,
          scoreCategory: getScoreLevel(scoreData.score)
        }));
        
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error("Error fetching trust score:", err);
      setError('Failed to fetch trust score. Please try again later.');
      setLoading(false);
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 800) return "Excellent";
    if (score >= 740) return "Very Good";
    if (score >= 670) return "Good";
    if (score >= 580) return "Fair";
    return "Poor";
  };

  const calculateLoanLimit = (score: number) => {
    return creditScore?.loan_eligibility.max_amount || 0;
  };

  const getScoreMessageAndColor = (score: number) => {
    if (score >= 800) {
      return {
        message: "You have an excellent trust score! You qualify for the best loan rates.",
        color: "#2ecc71" // Green
      };
    } else if (score >= 740) {
      return {
        message: "You have a very good trust score and qualify for favorable loan terms.",
        color: "#27ae60" // Dark Green
      };
    } else if (score >= 670) {
      return {
        message: "You have a good trust score. Most lenders will approve your applications.",
        color: "#f39c12" // Orange
      };
    } else if (score >= 580) {
      return {
        message: "Your trust score is fair. You may face higher interest rates.",
        color: "#e67e22" // Dark Orange
      };
    } else {
      return {
        message: "Your trust score needs improvement. Focus on the suggestions below.",
        color: "#e74c3c" // Red
      };
    }
  };

  const getImprovementSuggestions = (score: number) => {
    const suggestions: string[] = [];

    if (!creditScore) return suggestions;

    const { score_components } = creditScore;

    if (score_components.payment_history < 80) {
      suggestions.push("Make all payments on time to improve your payment history score.");
    }

    if (score_components.credit_utilization < 80) {
      suggestions.push("Keep your trust utilization low by not maxing out your trust cards.");
    }

    if (score_components.credit_age < 70) {
      suggestions.push("Maintain your oldest trust accounts to improve trust age.");
    }

    if (score_components.upi_activity < 80) {
      suggestions.push("Increase your regular UPI transactions to show consistent activity.");
    }

    if (score_components.transaction_patterns < 80) {
      suggestions.push("Maintain consistent transaction patterns and avoid frequent large withdrawals.");
    }

    // Add general suggestions if score is below 700
    if (score < 700) {
      suggestions.push("Pay down existing debts to improve your overall trust score.");
      suggestions.push("Avoid applying for multiple new trust in a short time period.");
    }

    return suggestions.length > 0 ? suggestions : ["Your score is good! Continue maintaining your current financial habits."];
  };

  // Chart configuration for historical score
  const chartData = {
    labels: creditScore?.score_history.map(item => item.date.substring(5)) || [],
    datasets: [
      {
        data: creditScore?.score_history.map(item => item.score) || [],
        color: (opacity = 1) => `rgba(59, 89, 152, ${opacity})`, // Facebook blue color
        strokeWidth: 2
      }
    ],
    legend: ["Trust Score History"]
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(59, 89, 152, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#3b5998"
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Spinner size="large" />
        <Text style={styles.loadingText}>Analyzing your financial data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCreditScore}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!creditScore) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>No credit score data available</Text>
      </SafeAreaView>
    );
  }

  const scoreLevel = getScoreLevel(creditScore.score);
  const loanLimit = calculateLoanLimit(creditScore.score);
  const { message, color } = getScoreMessageAndColor(creditScore.score);
  const suggestions = getImprovementSuggestions(creditScore.score);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Credit Score</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Main Score Card */}
        <View style={styles.scoreCard}>
          <View style={[styles.scoreCircle, { borderColor: color }]}>
            <Text style={[styles.scoreValue, { color }]}>{creditScore.score}</Text>
            <Text style={styles.scoreLabel}>{scoreLevel}</Text>
          </View>
          
          <Text style={styles.scoreMessage}>{message}</Text>
          
          <View style={styles.loanInfo}>
            <Text style={styles.loanInfoText}>
              Maximum Loan Amount: ₹{loanLimit.toLocaleString()}
            </Text>
            <Text style={styles.loanInfoText}>
              Recommended Term: {creditScore.loan_eligibility.suggested_term} months
            </Text>
            <Text style={styles.loanInfoText}>
              Estimated Interest Rate: {creditScore.loan_eligibility.interest_rate}%
            </Text>
          </View>
        </View>
        
        {/* Score History Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score History</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
        
        {/* Score Components */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score Components</Text>
          
          <View style={styles.componentItem}>
            <Text style={styles.componentLabel}>Payment History</Text>
            <View style={styles.componentBarContainer}>
              <View 
                style={[
                  styles.componentBar, 
                  { width: `${creditScore.score_components.payment_history}%`, backgroundColor: "#3498db" }
                ]} 
              />
            </View>
            <Text style={styles.componentValue}>{creditScore.score_components.payment_history}%</Text>
          </View>
          
          <View style={styles.componentItem}>
            <Text style={styles.componentLabel}>Trust Utilization</Text>
            <View style={styles.componentBarContainer}>
              <View 
                style={[
                  styles.componentBar, 
                  { width: `${creditScore.score_components.credit_utilization}%`, backgroundColor: "#2ecc71" }
                ]} 
              />
            </View>
            <Text style={styles.componentValue}>{creditScore.score_components.credit_utilization}%</Text>
          </View>
          
          <View style={styles.componentItem}>
            <Text style={styles.componentLabel}>Trust Age</Text>
            <View style={styles.componentBarContainer}>
              <View 
                style={[
                  styles.componentBar, 
                  { width: `${creditScore.score_components.credit_age}%`, backgroundColor: "#f39c12" }
                ]} 
              />
            </View>
            <Text style={styles.componentValue}>{creditScore.score_components.credit_age}%</Text>
          </View>
          
          <View style={styles.componentItem}>
            <Text style={styles.componentLabel}>UPI Activity</Text>
            <View style={styles.componentBarContainer}>
              <View 
                style={[
                  styles.componentBar, 
                  { width: `${creditScore.score_components.upi_activity}%`, backgroundColor: "#9b59b6" }
                ]} 
              />
            </View>
            <Text style={styles.componentValue}>{creditScore.score_components.upi_activity}%</Text>
          </View>
          
          <View style={styles.componentItem}>
            <Text style={styles.componentLabel}>Transaction Patterns</Text>
            <View style={styles.componentBarContainer}>
              <View 
                style={[
                  styles.componentBar, 
                  { width: `${creditScore.score_components.transaction_patterns}%`, backgroundColor: "#e74c3c" }
                ]} 
              />
            </View>
            <Text style={styles.componentValue}>{creditScore.score_components.transaction_patterns}%</Text>
          </View>
        </View>
        
        {/* Financial Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Financial Summary</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Monthly Income:</Text>
            <Text style={styles.summaryValue}>₹{creditScore.financial_summary.avg_monthly_inflow.toLocaleString()}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Monthly Spending:</Text>
            <Text style={styles.summaryValue}>₹{creditScore.financial_summary.avg_monthly_outflow.toLocaleString()}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Balance:</Text>
            <Text style={styles.summaryValue}>₹{creditScore.financial_summary.avg_balance.toLocaleString()}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Savings Trend:</Text>
            <Text style={[
              styles.summaryValue, 
              {color: creditScore.financial_summary.savings_trend === 'Positive' ? '#2ecc71' : '#e74c3c'}
            ]}>
              {creditScore.financial_summary.savings_trend}
            </Text>
          </View>
        </View>
        
        {/* Improvement Suggestions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Improve Your Score</Text>
          
          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <IconSymbol name="lightbulb.fill" size={20} color="#f39c12" />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b5998',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    marginVertical: 15,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  scoreMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
    color: '#555',
    lineHeight: 22,
  },
  loanInfo: {
    marginTop: 10,
    width: '100%',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
  },
  loanInfoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  componentLabel: {
    flex: 2.5,
    fontSize: 14,
    color: '#555',
  },
  componentBarContainer: {
    flex: 5,
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  componentBar: {
    height: '100%',
    borderRadius: 5,
  },
  componentValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  suggestionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
}); 