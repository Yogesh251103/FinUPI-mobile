import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Import Redux hooks
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { updateCreditInfo, setCreditScore, setMaxLoanAmount, setScoreCategory } from '../redux/slices/creditSlice';

// Import same mock data as web version
import { 
  mockTransactions, 
  mockCreditScore, 
  mockLoanOffers,
  calculateCreditScore 
} from '../../mockData';

interface TransactionStats {
  totalSent: number;
  totalReceived: number;
  totalFailedOrPending: number;
  recentTransactions: any[];
}

// API response interface
interface CreditScoreResponse {
  credit_score: number;
  score_category: string;
  component_scores: {
    expense_management: number;
    financial_discipline: number;
    income_stability: number;
    transaction_history: number;
  };
  improvement_recommendations: string[];
  last_5_transactions: any[];
  loan_eligibility: {
    eligible: boolean;
    max_loan_amount: number;
    max_duration_months: number;
    interest_rate: number;
    monthly_emi: number;
    disposable_income: number;
  };
}

// Sample transaction data for API request
const sampleTransactionData = {
    "transactions": [
        {
            "Timestamp": "2025-01-01T09:00:00",
            "Sender UPI ID": "user@upi",
            "Receiver UPI ID": "alice@upi",
            "Amount (INR)": 1000,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-01T10:00:00",
            "Sender UPI ID": "alice@upi",
            "Receiver UPI ID": "bob@upi",
            "Amount (INR)": 500,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-01T11:00:00",
            "Sender UPI ID": "bob@upi",
            "Receiver UPI ID": "charlie@upi",
            "Amount (INR)": 300,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-01T11:15:00",
            "Sender UPI ID": "charlie@upi",
            "Receiver UPI ID": "user@upi",
            "Amount (INR)": 100,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-02T09:30:00",
            "Sender UPI ID": "user@upi",
            "Receiver UPI ID": "merchant@upi",
            "Amount (INR)": 250,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2M"
        },
        {
            "Timestamp": "2025-01-02T12:00:00",
            "Sender UPI ID": "user@upi",
            "Receiver UPI ID": "alice@upi",
            "Amount (INR)": 300,
            "Status": "FAILED",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-02T14:00:00",
            "Sender UPI ID": "alice@upi",
            "Receiver UPI ID": "user@upi",
            "Amount (INR)": 300,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-03T08:00:00",
            "Sender UPI ID": "bob@upi",
            "Receiver UPI ID": "alice@upi",
            "Amount (INR)": 200,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-03T08:10:00",
            "Sender UPI ID": "alice@upi",
            "Receiver UPI ID": "bob@upi",
            "Amount (INR)": 150,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-03T09:30:00",
            "Sender UPI ID": "charlie@upi",
            "Receiver UPI ID": "merchant@upi",
            "Amount (INR)": 500,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2M"
        },
        {
            "Timestamp": "2025-01-03T10:00:00",
            "Sender UPI ID": "merchant@upi",
            "Receiver UPI ID": "bob@upi",
            "Amount (INR)": 100,
            "Status": "SUCCESS",
            "Type": "Refund",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-04T11:00:00",
            "Sender UPI ID": "user@upi",
            "Receiver UPI ID": "alice@upi",
            "Amount (INR)": 700,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-04T12:00:00",
            "Sender UPI ID": "alice@upi",
            "Receiver UPI ID": "user@upi",
            "Amount (INR)": 700,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-05T08:00:00",
            "Sender UPI ID": "charlie@upi",
            "Receiver UPI ID": "user@upi",
            "Amount (INR)": 400,
            "Status": "SUCCESS",
            "Type": "Received",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-05T10:30:00",
            "Sender UPI ID": "bob@upi",
            "Receiver UPI ID": "merchant@upi",
            "Amount (INR)": 150,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2M"
        },
        {
            "Timestamp": "2025-01-06T09:15:00",
            "Sender UPI ID": "user@upi",
            "Receiver UPI ID": "david@upi",
            "Amount (INR)": 600,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-06T10:00:00",
            "Sender UPI ID": "david@upi",
            "Receiver UPI ID": "user@upi",
            "Amount (INR)": 250,
            "Status": "SUCCESS",
            "Type": "Received",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-06T10:45:00",
            "Sender UPI ID": "user@upi",
            "Receiver UPI ID": "charlie@upi",
            "Amount (INR)": 100,
            "Status": "PENDING",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-07T09:00:00",
            "Sender UPI ID": "user@upi",
            "Receiver UPI ID": "bob@upi",
            "Amount (INR)": 120,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-07T10:30:00",
            "Sender UPI ID": "bob@upi",
            "Receiver UPI ID": "user@upi",
            "Amount (INR)": 80,
            "Status": "SUCCESS",
            "Type": "Received",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-08T09:00:00",
            "Sender UPI ID": "user@upi",
            "Receiver UPI ID": "merchant@upi",
            "Amount (INR)": 999,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2M"
        },
        {
            "Timestamp": "2025-01-08T11:00:00",
            "Sender UPI ID": "merchant@upi",
            "Receiver UPI ID": "user@upi",
            "Amount (INR)": 200,
            "Status": "SUCCESS",
            "Type": "Refund",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-09T08:00:00",
            "Sender UPI ID": "david@upi",
            "Receiver UPI ID": "charlie@upi",
            "Amount (INR)": 350,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-09T09:30:00",
            "Sender UPI ID": "charlie@upi",
            "Receiver UPI ID": "david@upi",
            "Amount (INR)": 100,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-10T10:00:00",
            "Sender UPI ID": "user@upi",
            "Receiver UPI ID": "user@upi",
            "Amount (INR)": 0,
            "Status": "SUCCESS",
            "Type": "Self-Transfer",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-10T11:00:00",
            "Sender UPI ID": "charlie@upi",
            "Receiver UPI ID": "bob@upi",
            "Amount (INR)": 100,
            "Status": "FAILED",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-11T09:00:00",
            "Sender UPI ID": "alice@upi",
            "Receiver UPI ID": "charlie@upi",
            "Amount (INR)": 350,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-11T10:00:00",
            "Sender UPI ID": "charlie@upi",
            "Receiver UPI ID": "alice@upi",
            "Amount (INR)": 250,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-12T09:15:00",
            "Sender UPI ID": "merchant@upi",
            "Receiver UPI ID": "david@upi",
            "Amount (INR)": 500,
            "Status": "SUCCESS",
            "Type": "Incentive",
            "To Type": "P2P"
        },
        {
            "Timestamp": "2025-01-12T10:30:00",
            "Sender UPI ID": "david@upi",
            "Receiver UPI ID": "user@upi",
            "Amount (INR)": 450,
            "Status": "SUCCESS",
            "Type": "Sent",
            "To Type": "P2P"
        }
    ]
}

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [creditScore, setCreditScoreLocal] = useState(mockCreditScore);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [loanOffers, setLoanOffers] = useState(mockLoanOffers);
  const [transactionStats, setTransactionStats] = useState<TransactionStats>({
    totalSent: 0,
    totalReceived: 0,
    totalFailedOrPending: 0,
    recentTransactions: []
  });
  const [apiCreditScore, setApiCreditScore] = useState<CreditScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  
  // Redux dispatch and selector
  const dispatch = useAppDispatch();
  const reduxCreditScore = useAppSelector(state => state.credit.creditScore);
  const reduxMaxLoan = useAppSelector(state => state.credit.maxLoanAmount);
  const reduxScoreCategory = useAppSelector(state => state.credit.scoreCategory);

  // Calculate the credit score using the same algorithm as web version
  useEffect(() => {
    const calculatedScore = calculateCreditScore(transactions);
    setCreditScoreLocal({
      ...mockCreditScore,
      score: calculatedScore
    });
    
    // Update Redux with calculated score
    dispatch(setCreditScore(calculatedScore));
  }, [transactions, dispatch]);

  useEffect(() => {
    processTransactionData();
    fetchCreditScore();
  }, [transactions]);
  
  // Add a new useEffect to process data when API credit score changes
  useEffect(() => {
    if (apiCreditScore) {
      processTransactionData();
    }
  }, [apiCreditScore]);

  // Only fetch credit score if API is available
  const fetchCreditScore = async () => {
    // if (apiStatus !== 'available') {
    //   console.log('API server is not available. Using mock data instead.');
    //   return;
    // }
    
    setIsLoading(true);
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

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data)
      setApiCreditScore(data);
      
      // Update the credit score if API call is successful
      if (data.credit_score) {
        setCreditScoreLocal({
          ...mockCreditScore,
          score: data.credit_score,
          level: data.score_category || mockCreditScore.level,
          message: data.score_category ? `Your trust score is ${data.score_category}` : mockCreditScore.message,
          loanLimit: data.loan_eligibility?.max_loan_amount || mockCreditScore.loanLimit
        });
        
        // Store credit score data in Redux
        dispatch(updateCreditInfo({
          creditScore: data.credit_score,
          maxLoanAmount: data.loan_eligibility?.max_loan_amount || 0,
          maxLoanDuration: data.loan_eligibility?.max_duration_months || 36,
          scoreCategory: data.score_category || 'Unknown'
        }));
        
        // If we receive loan eligibility data, update loan offers
        if (data.loan_eligibility && data.loan_eligibility.eligible) {
          const apiLoanOffer = {
            id: 'api-loan-1',
            name: 'API Recommended Loan',
            minAmount: 1000,
            maxAmount: data.loan_eligibility.max_loan_amount,
            minDuration: 30,
            maxDuration: data.loan_eligibility.max_duration_months * 30,
            interestRate: data.loan_eligibility.interest_rate,
            processingFee: 2.5, // Adding default processing fee
            features: ['API sourced', 'Personalized offer'] // Adding default features
          };
          setLoanOffers([apiLoanOffer, ...mockLoanOffers.slice(0, 2)]);
        }
      }
    } catch (error) {
      console.error('Error fetching credit score:', error);
      Alert.alert(
        'API Error',
        'Could not fetch credit score. Using calculated score instead.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const processTransactionData = () => {
    // Process transactions to match the web app's calculation
    let sent = 0;
    let received = 0;
    let failedOrPending = 0;

    // If we have API data, use it instead of mock data
    if (apiCreditScore && apiCreditScore.last_5_transactions && apiCreditScore.last_5_transactions.length > 0) {
      // Use all transactions from the API response
      const apiTransactions = apiCreditScore.last_5_transactions;
      
      apiTransactions.forEach(tx => {
        // Consider "Sent" as debit/outgoing
        if (tx.Type === "Sent") {
          sent += tx.amount;
        }
        // Consider "Received" and "Incentive" as credit/incoming
        else if (tx.Type === "Received" || tx.Type === "Incentive") {
          received += tx.amount;
        }
        
        // Count failed or pending transactions
        if (tx.Status === "FAILED" || tx.Status === "PENDING") {
          failedOrPending += 1;
        }
      });
    } else {
      // Use the mock data if API data is not available
      transactions.forEach(tx => {
        if (tx.type === "debit") {
          sent += tx.amount;
        } else if (tx.type === "credit") {
          received += tx.amount;
        }
        
        // In the web version, this checks for FAILED or PENDING status
        // For our mock data, we don't have these fields, so we'll mock it
        if (tx.id === "tx9") {
          failedOrPending += 1;
        }
      });
    }

    // Use API transactions for recent transactions if available, otherwise use mock data
    const recentTransactions = apiCreditScore && apiCreditScore.last_5_transactions ? 
      apiCreditScore.last_5_transactions.map(tx => ({
        // Map API transaction to match expected format
        id: tx.transaction_ref,
        merchant: tx.merchant || (tx.Type === "Sent" ? tx.receiver_upi_id : tx.sender_upi_id),
        date: tx.transaction_date,
        amount: tx.amount,
        type: tx.Type === "Sent" ? "debit" : "credit",
        status: tx.Status
      })) : 
      [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    setTransactionStats({
      totalSent: sent,
      totalReceived: received,
      totalFailedOrPending: failedOrPending,
      recentTransactions
    });
  };

  // Use same function to handle refresh but don't fetch API if unavailable
  const onRefresh = () => {
    setRefreshing(true);
    
    // Only fetch from API if it's available
    if (apiStatus === 'available') {
      fetchCreditScore();
    }
    
    // Simulate API call with timeout for other data
    setTimeout(() => {
      processTransactionData();
      setRefreshing(false);
    }, 1500);
  };

  // Format date string - same as web version
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };

  // Determine color for transaction type
  const getTransactionColor = (type: string) => {
    return type === "debit" ? "#e74c3c" : "#2ecc71";
  };

  const getTransactionIcon = (type: string) => {
    if (type === "debit") {
      return <IconSymbol name="arrow.up" size={20} color="#e74c3c" />;
    } else {
      return <IconSymbol name="arrow.down" size={20} color="#2ecc71" />;
    }
  };

  // Primary colors from web version
  const primaryColor = '#3b5998';
  const backgroundColor = '#f5f5f5';
  const cardBackgroundColor = '#ffffff';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            colors={[primaryColor]}
          />
        }
      >
        {/* Credit Score Card - matches web version's card */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: cardBackgroundColor }]} 
          onPress={() => router.push('/(tabs)/credit-score')}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: '#333' }]}>Trust Score</Text>
          </View>
          
          <View style={styles.creditScoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: primaryColor }]}>
              <Text style={[styles.scoreValue, { color: primaryColor }]}>{creditScore.score}</Text>
              <Text style={styles.scoreLabel}>{creditScore.level}</Text>
            </View>
            
            <View style={styles.scoreDetails}>
              <Text style={styles.scoreInfoLabel}>
                {creditScore.message}
              </Text>
              <Text style={styles.scoreInfoValue}>
                Max Loan Amount: ₹{creditScore.loanLimit.toLocaleString()}
              </Text>
              <Text style={styles.scoreInfoValue}>
                Last Updated: {creditScore.lastUpdated}
              </Text>
            </View>
          </View>
          
          {/* Improvements from API */}
          {apiCreditScore && apiCreditScore.improvement_recommendations && apiCreditScore.improvement_recommendations.length > 0 && (
            <View style={styles.improvementsContainer}>
              <Text style={styles.improvementsTitle}>Improvement Tips:</Text>
              {apiCreditScore.improvement_recommendations.map((tip, index) => (
                <Text key={index} style={styles.improvementItem}>• {tip}</Text>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Transaction Summary Card - matches web version */}
        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: '#333' }]}>Transaction Summary</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#e74c3c' }]}>₹{transactionStats.totalSent.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Sent</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#2ecc71' }]}>₹{transactionStats.totalReceived.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Received</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#f39c12' }]}>{transactionStats.totalFailedOrPending}</Text>
              <Text style={styles.statLabel}>Failed/Pending</Text>
            </View>
          </View>
          
          <View style={styles.transactionChart}>
            <PieChart
              data={[
                {
                  name: 'Sent',
                  population: transactionStats.totalSent,
                  color: '#e74c3c',
                  legendFontColor: '#333',
                  legendFontSize: 12,
                },
                {
                  name: 'Received',
                  population: transactionStats.totalReceived,
                  color: '#2ecc71',
                  legendFontColor: '#333',
                  legendFontSize: 12,
                },
              ]}
              width={Dimensions.get('window').width - 60}
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>

        {/* Recent Transactions Card - matches web version */}
        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: '#333' }]}>Recent Transactions</Text>
          </View>
          
          {/* Display API transactions if available, otherwise show mock data */}
          {apiCreditScore && apiCreditScore.last_5_transactions && apiCreditScore.last_5_transactions.length > 0 ? (
            <>
              {apiCreditScore.last_5_transactions.map((tx, index) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionIconContainer}>
                    <IconSymbol 
                      name={tx.Type === "Sent" ? "arrow.up" : "arrow.down"} 
                      size={20} 
                      color={tx.Type === "Sent" ? "#e74c3c" : "#2ecc71"} 
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionParty}>
                      {tx.merchant || (tx.Type === "Sent" ? tx.receiver_upi_id : tx.sender_upi_id)}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(tx.transaction_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <Text 
                    style={[
                      styles.transactionAmount, 
                      {color: tx.Type === "Sent" ? "#e74c3c" : "#2ecc71"}
                    ]}
                  >
                    {tx.Type === "Sent" ? "-" : "+"}₹{tx.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            // Display mock transactions as fallback
            transactionStats.recentTransactions.map((transaction, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionIconContainer}>
                  {getTransactionIcon(transaction.type)}
                </View>
                
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionParty}>
                    {transaction.merchant}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
                
                <Text 
                  style={[
                    styles.transactionAmount, 
                    {color: getTransactionColor(transaction.type)}
                  ]}
                >
                  {transaction.type === "debit" ? "-" : "+"}₹{transaction.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewMore: {
    fontSize: 14,
  },
  creditScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  scoreDetails: {
    flex: 1,
    marginLeft: 15,
  },
  scoreInfoLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  scoreInfoValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  transactionChart: {
    alignItems: 'center',
    marginTop: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionParty: {
    fontSize: 16,
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  apiScoreContainer: {
    marginTop: 10,
  },
  improvementsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  improvementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  improvementItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  loanOfferContainer: {
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  offerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  offerDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  offerRate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  apiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  apiStatusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 5,
  },
  apiStatusText: {
    fontSize: 14,
    color: '#666',
  },
});
