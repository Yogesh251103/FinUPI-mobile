import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Updated interface to match the API response structure
interface ContentData {
  heading: string;
  explanation: string;
  quiz: {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  };
}

export default function DailyUpskilling() {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchFinancialContent();
  }, []);

  const fetchFinancialContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/financial_literacy_content');
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      console.log(data);
      setContent(data);
    } catch (err) {
      console.error('Error fetching financial content:', err);
      setError('Failed to load content. Please try again later.');
      
      // Use mock data as fallback with the correct structure
      setContent({
        heading: "The 4% Rule",
        explanation: "The 4% rule suggests you can withdraw 4% of your retirement savings annually with minimal risk of running out of money during a 30-year retirement.",
        quiz: {
          question: "According to the 4% rule, how much would you need saved to withdraw ₹40,000 monthly in retirement?",
          options: [
            "₹1.2 crore",
            "₹48 lakh",
            "₹24 lakh",
            "₹96 lakh"
          ],
          correct_index: 0,
          explanation: "₹40,000 monthly = ₹4.8 lakh annually. Using the 4% rule, you would need 25 times this amount (₹1.2 crore)."
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setShowQuiz(false);
    setSelectedOption(null);
    setSubmitted(false);
  };

  const renderContentPage = () => {
    if (!content) return null;
    
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.heading}>{content.heading}</Text>
        <Text style={styles.explanation}>{content.explanation}</Text>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => setShowQuiz(true)}
        >
          <Text style={styles.nextButtonText}>Next - Take Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuizPage = () => {
    if (!content) return null;
    
    const { quiz } = content;
    const isCorrect = selectedOption === quiz.correct_index;
    
    return (
      <View style={styles.quizContainer}>
        <Text style={styles.quizQuestion}>{quiz.question}</Text>
        
        <View style={styles.optionsContainer}>
          {quiz.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === index && styles.selectedOption,
                submitted && index === quiz.correct_index && styles.correctOption,
                submitted && selectedOption === index && selectedOption !== quiz.correct_index && styles.incorrectOption
              ]}
              onPress={() => !submitted && handleOptionSelect(index)}
              disabled={submitted}
            >
              <Text 
                style={[
                  styles.optionText,
                  submitted && index === quiz.correct_index && styles.correctOptionText,
                  submitted && selectedOption === index && selectedOption !== quiz.correct_index && styles.incorrectOptionText
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {!submitted ? (
          <TouchableOpacity 
            style={[styles.submitButton, selectedOption === null && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={selectedOption === null}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={[styles.resultText, isCorrect ? styles.correctResultText : styles.incorrectResultText]}>
              {isCorrect ? '🎉 Congratulations! That\'s correct!' : '😊 Not quite right, but keep learning!'}
            </Text>
            <Text style={styles.explanationText}>{quiz.explanation}</Text>
            
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Back to Content</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b5998" />
        <Text style={styles.loadingText}>Loading today's financial lesson...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchFinancialContent}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Daily Upskilling</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {!showQuiz ? renderContentPage() : renderQuizPage()}
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b5998',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  explanation: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 30,
  },
  nextButton: {
    backgroundColor: '#3b5998',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quizContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#e3e9f8',
    borderColor: '#3b5998',
  },
  correctOption: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  incorrectOption: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  correctOptionText: {
    color: '#155724',
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: '#721c24',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b5998',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#b3b7bf',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  correctResultText: {
    color: '#155724',
  },
  incorrectResultText: {
    color: '#721c24',
  },
  explanationText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  resetButton: {
    backgroundColor: '#3b5998',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
