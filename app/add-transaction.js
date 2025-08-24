import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { addTransaction } from '@/store/slices/transactionsSlice';

export default function AddTransactionScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const categories = useSelector(state => state.categories.categories);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [transactionType, setTransactionType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  const handleSave = () => {
    if (!amount || !selectedCategory) {
      Alert.alert(t('common.error'), 'Please fill in all required fields');
      return;
    }

    const transaction = {
      amount: parseFloat(amount),
      description,
      categoryId: selectedCategory.id,
      date,
      type: transactionType,
    };

    dispatch(addTransaction(transaction));
    Alert.alert(t('common.success'), t('transactions.transactionAdded'), [
      { text: t('common.confirm'), onPress: () => router.back() }
    ]);
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: t('transactions.addTransaction'),
          presentation: 'modal',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <ThemedText style={styles.saveButtonText}>{t('common.save')}</ThemedText>
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.container}>
        {/* Transaction Type Selector */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('common.type')}</ThemedText>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, transactionType === 'expense' && styles.activeTypeButton]}
              onPress={() => {
                setTransactionType('expense');
                setSelectedCategory(null);
              }}
            >
              <Ionicons 
                name="remove-circle" 
                size={20} 
                color={transactionType === 'expense' ? 'white' : '#F44336'} 
              />
              <ThemedText style={[
                styles.typeButtonText,
                transactionType === 'expense' && styles.activeTypeButtonText
              ]}>
                {t('transactions.expense')}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.typeButton, transactionType === 'income' && styles.activeTypeButton]}
              onPress={() => {
                setTransactionType('income');
                setSelectedCategory(null);
              }}
            >
              <Ionicons 
                name="add-circle" 
                size={20} 
                color={transactionType === 'income' ? 'white' : '#4CAF50'} 
              />
              <ThemedText style={[
                styles.typeButtonText,
                transactionType === 'income' && styles.activeTypeButtonText
              ]}>
                {t('transactions.income')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('common.amount')} *</ThemedText>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor="#8E8E93"
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('common.category')} *</ThemedText>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            {selectedCategory ? (
              <View style={styles.selectedCategory}>
                <View style={[styles.categoryColor, { backgroundColor: selectedCategory.color }]} />
                <ThemedText style={styles.categoryText}>{selectedCategory.name}</ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.placeholderText}>
                Select a category
              </ThemedText>
            )}
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('common.description')}</ThemedText>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
            placeholderTextColor="#8E8E93"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Date Input */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('common.date')}</ThemedText>
          <TextInput
            style={styles.textInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#8E8E93"
          />
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <ThemedText style={styles.cancelText}>{t('common.cancel')}</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Select Category</ThemedText>
            <View style={{ width: 60 }} />
          </View>
          
          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => {
                  setSelectedCategory(item);
                  setShowCategoryModal(false);
                }}
              >
                <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                <ThemedText style={styles.categoryText}>{item.name}</ThemedText>
                {selectedCategory?.id === item.id && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: 'white',
  },
  activeTypeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  activeTypeButtonText: {
    color: 'white',
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#1C1C1E',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    minHeight: 50,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  placeholderText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
});