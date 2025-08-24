import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SectionList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { deleteTransaction } from '@/store/slices/transactionsSlice';

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const transactions = useSelector(state => state.transactions.transactions);
  const categories = useSelector(state => state.categories.categories);
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const groupTransactionsByDate = (transactions) => {
    const grouped = transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let sectionTitle;
      if (date.toDateString() === today.toDateString()) {
        sectionTitle = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        sectionTitle = 'Yesterday';
      } else {
        sectionTitle = date.toLocaleDateString();
      }
      
      if (!groups[sectionTitle]) {
        groups[sectionTitle] = [];
      }
      groups[sectionTitle].push(transaction);
      return groups;
    }, {});

    return Object.keys(grouped)
      .sort((a, b) => {
        if (a === 'Today') return -1;
        if (b === 'Today') return 1;
        if (a === 'Yesterday') return -1;
        if (b === 'Yesterday') return 1;
        return new Date(b) - new Date(a);
      })
      .map(date => ({
        title: date,
        data: grouped[date].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }));
  };

  const sectionedTransactions = useMemo(() => 
    groupTransactionsByDate(transactions), 
    [transactions]
  );

  const calculateDailyTotal = (transactions) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return income - expense;
  };

  const handleDeleteTransaction = (transaction) => {
    Alert.alert(
      t('transactions.deleteTransaction'),
      t('transactions.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            dispatch(deleteTransaction(transaction.id));
            Alert.alert(t('common.success'), t('transactions.transactionDeleted'));
          }
        }
      ]
    );
  };

  const renderTransaction = ({ item: transaction }) => {
    const category = categories.find(c => c.id === transaction.categoryId);
    const isIncome = transaction.type === 'income';

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: category?.color || '#999' }]} />
          <View style={styles.transactionInfo}>
            <ThemedText style={styles.transactionDescription}>
              {transaction.description || category?.name || 'Unknown'}
            </ThemedText>
            <ThemedText style={styles.transactionCategory}>
              {category?.name || 'Unknown Category'}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.transactionRight}>
          <ThemedText style={[
            styles.transactionAmount,
            { color: isIncome ? '#4CAF50' : '#F44336' }
          ]}>
            {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
          </ThemedText>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTransaction(transaction)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => {
    const dailyTotal = calculateDailyTotal(section.data);
    
    return (
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
        <ThemedText style={[
          styles.dailyTotal,
          { color: dailyTotal >= 0 ? '#4CAF50' : '#F44336' }
        ]}>
          {dailyTotal >= 0 ? '+' : ''}{formatCurrency(dailyTotal)}
        </ThemedText>
      </View>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, you might sync with server here
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          {t('transactions.title')}
        </ThemedText>
        <Link href="/add-transaction" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </Link>
      </ThemedView>

      {sectionedTransactions.length > 0 ? (
        <SectionList
          sections={sectionedTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          renderSectionHeader={renderSectionHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={80} color="#8E8E93" />
          <ThemedText style={styles.emptyTitle}>No Transactions</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Start tracking your finances by adding your first transaction
          </ThemedText>
          <Link href="/add-transaction" asChild>
            <TouchableOpacity style={styles.emptyActionButton}>
              <ThemedText style={styles.emptyActionText}>
                {t('transactions.addTransaction')}
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  listContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  dailyTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginVertical: 2,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#8E8E93',
  },
  transactionRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyActionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  emptyActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});