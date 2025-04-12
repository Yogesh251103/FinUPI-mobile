// Mock UPI Transactions
export const mockTransactions = [
  {
    id: "tx1",
    date: "2023-07-05",
    merchant: "Swiggy",
    amount: 450,
    type: "debit",
  },
  {
    id: "tx2",
    date: "2023-07-04",
    merchant: "Amazon Pay",
    amount: 1299,
    type: "debit",
  },
  {
    id: "tx3",
    date: "2023-07-03",
    merchant: "Uber",
    amount: 230,
    type: "debit",
  },
  {
    id: "tx4",
    date: "2023-07-02",
    merchant: "Big Basket",
    amount: 890,
    type: "debit",
  },
  {
    id: "tx5",
    date: "2023-07-01",
    merchant: "Phone Recharge",
    amount: 299,
    type: "debit",
  },
  {
    id: "tx6",
    date: "2023-06-30",
    merchant: "Electricity Bill",
    amount: 1250,
    type: "debit",
  },
  {
    id: "tx7",
    date: "2023-06-29",
    merchant: "Flipkart",
    amount: 1899,
    type: "debit",
  },
  {
    id: "tx8",
    date: "2023-06-28",
    merchant: "Movie Tickets",
    amount: 600,
    type: "debit",
  },
  {
    id: "tx9",
    date: "2023-06-27",
    merchant: "DTH Recharge",
    amount: 450,
    type: "debit",
  },
  {
    id: "tx10",
    date: "2023-06-25",
    merchant: "Salary Credit",
    amount: 25000,
    type: "credit",
  },
];

// Mock Credit Score
export const mockCreditScore = {
  score: 78,
  level: "Good",
  message: "You have a good credit score with room for improvement.",
  lastUpdated: "2023-07-05",
  loanLimit: 25000,
  factors: {
    transactionFrequency: 85,
    paymentHistory: 92,
    transactionAmount: 78,
    merchantDiversity: 65,
    accountAge: 45,
  },
};

// Mock Loan Offers
export const mockLoanOffers = [
  {
    id: "offer1",
    name: "Quick Cash",
    minAmount: 1000,
    maxAmount: 5000,
    minDuration: 1,
    maxDuration: 7,
    interestRate: 2.5,
    processingFee: 0,
    features: ["Instant approval", "No paperwork needed", "Repay anytime"],
  },
  {
    id: "offer2",
    name: "Flexible Loan",
    minAmount: 5000,
    maxAmount: 20000,
    minDuration: 7,
    maxDuration: 14,
    interestRate: 2.0,
    processingFee: 1,
    features: [
      "Approval in 5 minutes",
      "Lower interest rate",
      "Flexible repayment options",
    ],
  },
  {
    id: "offer3",
    name: "Premium Loan",
    minAmount: 20000,
    maxAmount: 50000,
    minDuration: 14,
    maxDuration: 30,
    interestRate: 1.5,
    processingFee: 0.5,
    features: [
      "Best interest rates",
      "Longer repayment terms",
      "Premium customer service",
    ],
  },
];

// Mock Active Loans
export const mockActiveLoans = [
  {
    id: "loan1",
    amount: 5000,
    interestAmount: 125,
    totalAmount: 5125,
    duration: 7,
    startDate: "2023-06-28",
    dueDate: "2023-07-05",
    status: "active",
    repaid: 3844,
    remainingAmount: 1281,
  },
];

// Calculate AI Credit Score
export const calculateCreditScore = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return 50; // Default score
  }

  // Simple scoring algorithm for hackathon
  // 1. Transaction Frequency: More transactions = higher score
  const txFrequency = Math.min(100, (transactions.length / 30) * 100);

  // 2. Transaction Amount: Higher amounts = higher score (capped)
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const avgAmount = totalAmount / transactions.length;
  const txAmount = Math.min(100, (avgAmount / 1000) * 100);

  // 3. Credit vs Debit ratio
  const creditTxs = transactions.filter((tx) => tx.type === "credit");
  const debitTxs = transactions.filter((tx) => tx.type === "debit");
  const creditAmount = creditTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const debitAmount = debitTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const balanceRatio = Math.min(100, (creditAmount / (debitAmount || 1)) * 50);

  // 4. Merchant diversity (unique merchants)
  const uniqueMerchants = new Set(transactions.map((tx) => tx.merchant)).size;
  const merchantDiversity = Math.min(100, (uniqueMerchants / 10) * 100);

  // Weighted average of factors
  const score =
    txFrequency * 0.3 +
    txAmount * 0.3 +
    balanceRatio * 0.2 +
    merchantDiversity * 0.2;

  return Math.round(score);
}; 