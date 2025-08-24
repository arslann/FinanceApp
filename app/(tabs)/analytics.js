import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { PieChart, LineChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width: screenWidth } = Dimensions.get('window');

const PERIOD_OPTIONS = [
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'thisYear', label: 'This Year' },
];

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const transactions = useSelector(state => state.transactions.transactions);
  const categories = useSelector(state => state.categories.categories);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  const getFilteredTransactions = (period) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();

      switch (period) {
        case 'thisMonth':
          return transactionMonth === currentMonth && transactionYear === currentYear;
        case 'lastMonth':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return transactionMonth === lastMonth && transactionYear === lastMonthYear;
        case 'thisYear':
          return transactionYear === currentYear;
        default:
          return true;
      }
    });
  };

  const filteredTransactions = useMemo(() => 
    getFilteredTransactions(selectedPeriod), 
    [transactions, selectedPeriod]
  );

  const expensesByCategory = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const categoryTotals = {};

    expenses.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      const categoryName = category?.name || 'Unknown';
      const categoryColor = category?.color || '#999999';
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          total: 0,
          color: categoryColor,
          legendFontColor: '#7F7F7F',
          legendFontSize: 12,
        };
      }
      categoryTotals[categoryName].total += transaction.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, data]) => ({
        name,
        population: data.total,
        color: data.color,
        legendFontColor: data.legendFontColor,
        legendFontSize: data.legendFontSize,
      }))
      .sort((a, b) => b.population - a.population)
      .slice(0, 8); // Top 8 categories
  }, [filteredTransactions, categories]);

  const monthlyTrendData = useMemo(() => {
    const monthlyData = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyData[key] = { income: 0, expense: 0 };
    }

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (monthlyData[key]) {
        if (transaction.type === 'income') {
          monthlyData[key].income += transaction.amount;
        } else {
          monthlyData[key].expense += transaction.amount;
        }
      }
    });

    const labels = Object.keys(monthlyData).map(key => {
      const [year, month] = key.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en', { month: 'short' });
    });

    return {
      labels,
      datasets: [
        {
          data: Object.values(monthlyData).map(d => d.income),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: Object.values(monthlyData).map(d => d.expense),
          color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
          strokeWidth: 3,
        }
      ],
      legend: ['Income', 'Expenses']
    };
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          {t('analytics.title')}
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {PERIOD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.periodButton,
                selectedPeriod === option.key && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(option.key)}
            >
              <ThemedText style={[
                styles.periodButtonText,
                selectedPeriod === option.key && styles.activePeriodButtonText
              ]}>
                {t(`analytics.${option.key}`)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <ThemedText style={styles.summaryLabel}>Total Income</ThemedText>
            <ThemedText style={[styles.summaryAmount, styles.incomeText]}>
              {formatCurrency(totalIncome)}
            </ThemedText>
          </View>
          
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <ThemedText style={styles.summaryLabel}>Total Expenses</ThemedText>
            <ThemedText style={[styles.summaryAmount, styles.expenseText]}>
              {formatCurrency(totalExpenses)}
            </ThemedText>
          </View>
          
          <View style={[styles.summaryCard, styles.netCard]}>
            <ThemedText style={styles.summaryLabel}>Net Income</ThemedText>
            <ThemedText style={[
              styles.summaryAmount,
              { color: netIncome >= 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {formatCurrency(netIncome)}
            </ThemedText>
          </View>
        </View>

        {/* Expenses by Category Chart */}
        {expensesByCategory.length > 0 ? (
          <View style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>
              {t('analytics.expensesByCategory')}
            </ThemedText>
            <PieChart
              data={expensesByCategory}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              absolute
            />
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>
              {t('analytics.expensesByCategory')}
            </ThemedText>
            <View style={styles.noDataContainer}>
              <ThemedText style={styles.noDataText}>
                {t('analytics.noData')}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Monthly Trend Chart */}
        {monthlyTrendData.datasets[0].data.some(val => val > 0) || 
         monthlyTrendData.datasets[1].data.some(val => val > 0) ? (
          <View style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>
              {t('analytics.monthlyTrend')}
            </ThemedText>
            <LineChart
              data={monthlyTrendData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={false}
              withInnerLines={false}
              withOuterLines={true}
            />
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>
              {t('analytics.monthlyTrend')}
            </ThemedText>
            <View style={styles.noDataContainer}>
              <ThemedText style={styles.noDataText}>
                {t('analytics.noData')}
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activePeriodButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  chartContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});