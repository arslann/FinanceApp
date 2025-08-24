import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { t } = useTranslation();
  const transactions = useSelector(state => state.transactions.transactions);
  const categories = useSelector(state => state.categories.categories);
  
  // Calculate totals
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });
  
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalBalance = monthlyIncome - monthlyExpenses;
  
  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            {t('dashboard.title')}
          </ThemedText>
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </Link>
        </ThemedView>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.balanceCard]}>
            <ThemedText style={styles.summaryLabel}>
              {t('dashboard.totalBalance')}
            </ThemedText>
            <ThemedText style={[styles.summaryAmount, { color: totalBalance >= 0 ? '#4CAF50' : '#F44336' }]}>
              {formatCurrency(totalBalance)}
            </ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.incomeCard]}>
              <ThemedText style={styles.summaryLabel}>
                {t('dashboard.monthlyIncome')}
              </ThemedText>
              <ThemedText style={[styles.summaryAmount, styles.incomeText]}>
                {formatCurrency(monthlyIncome)}
              </ThemedText>
            </View>
            
            <View style={[styles.summaryCard, styles.expenseCard]}>
              <ThemedText style={styles.summaryLabel}>
                {t('dashboard.monthlyExpenses')}
              </ThemedText>
              <ThemedText style={[styles.summaryAmount, styles.expenseText]}>
                {formatCurrency(monthlyExpenses)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('dashboard.recentTransactions')}
            </ThemedText>
            <Link href="/(tabs)/transactions" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.viewAllText}>
                  {t('dashboard.viewAll')}
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>

          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.categoryId);
              return (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={[styles.categoryIcon, { backgroundColor: category?.color || '#999' }]} />
                  <View style={styles.transactionInfo}>
                    <ThemedText style={styles.transactionDescription}>
                      {transaction.description || category?.name || 'Unknown'}
                    </ThemedText>
                    <ThemedText style={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText 
                    style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </ThemedText>
                </View>
              );
            })
          ) : (
            <ThemedText style={styles.noDataText}>
              {t('dashboard.noTransactions')}
            </ThemedText>
          )}
        </ThemedView>

        {/* Extra padding at bottom for floating button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Add Transaction Button */}
      <Link href="/add-transaction" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  settingsButton: {
    padding: 8,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceCard: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  incomeCard: {
    flex: 1,
  },
  expenseCard: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  incomeText: {
    color: '#4CAF50',
  },
  expenseText: {
    color: '#F44336',
  },
  section: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 16,
    paddingVertical: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});