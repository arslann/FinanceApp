import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { addCategory, deleteCategory, updateCategory } from '@/store/slices/categoriesSlice';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#10AC84', '#EE5A24', '#0ABDE3', '#C44569', '#FFC312',
  '#F79F1F', '#A3CB38', '#1289A7', '#D63031', '#74B9FF'
];

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const categories = useSelector(state => state.categories.categories);
  
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [categoryType, setCategoryType] = useState('expense');

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const resetForm = () => {
    setNewCategoryName('');
    setSelectedColor(COLORS[0]);
    setCategoryType('expense');
    setEditingCategory(null);
  };

  const openAddModal = (type) => {
    resetForm();
    setCategoryType(type);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setSelectedColor(category.color);
    setCategoryType(category.type);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!newCategoryName.trim()) {
      Alert.alert(t('common.error'), 'Please enter a category name');
      return;
    }

    if (editingCategory) {
      if (editingCategory.isDefault) {
        Alert.alert(t('common.error'), t('categories.cannotDeleteDefault'));
        return;
      }
      
      dispatch(updateCategory({
        id: editingCategory.id,
        name: newCategoryName.trim(),
        color: selectedColor,
        type: categoryType,
      }));
      
      Alert.alert(t('common.success'), t('categories.categoryUpdated'));
    } else {
      dispatch(addCategory({
        name: newCategoryName.trim(),
        color: selectedColor,
        type: categoryType,
      }));
      
      Alert.alert(t('common.success'), t('categories.categoryAdded'));
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (category) => {
    if (category.isDefault) {
      Alert.alert(t('common.error'), t('categories.cannotDeleteDefault'));
      return;
    }

    Alert.alert(
      t('categories.deleteCategory'),
      t('categories.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            dispatch(deleteCategory(category.id));
            Alert.alert(t('common.success'), t('categories.categoryDeleted'));
          }
        }
      ]
    );
  };

  const renderCategory = (category) => (
    <View key={category.id} style={styles.categoryItem}>
      <View style={styles.categoryLeft}>
        <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
        <View style={styles.categoryInfo}>
          <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
          {category.isDefault && (
            <ThemedText style={styles.defaultLabel}>Default</ThemedText>
          )}
        </View>
      </View>
      
      <View style={styles.categoryActions}>
        {!category.isDefault && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(category)}
            >
              <Ionicons name="create-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(category)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          {t('categories.title')}
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        {/* Income Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              {t('categories.incomeCategories')}
            </ThemedText>
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => openAddModal('income')}
            >
              <Ionicons name="add" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesList}>
            {incomeCategories.map(renderCategory)}
            {incomeCategories.length === 0 && (
              <ThemedText style={styles.emptyText}>No income categories</ThemedText>
            )}
          </View>
        </View>

        {/* Expense Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              {t('categories.expenseCategories')}
            </ThemedText>
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => openAddModal('expense')}
            >
              <Ionicons name="add" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesList}>
            {expenseCategories.map(renderCategory)}
            {expenseCategories.length === 0 && (
              <ThemedText style={styles.emptyText}>No expense categories</ThemedText>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Category Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <ThemedText style={styles.cancelText}>{t('common.cancel')}</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              {editingCategory ? t('categories.editCategory') : t('categories.addCategory')}
            </ThemedText>
            <TouchableOpacity onPress={handleSave}>
              <ThemedText style={styles.saveText}>{t('common.save')}</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Category Type */}
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>{t('common.type')}</ThemedText>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, categoryType === 'income' && styles.activeIncomeButton]}
                  onPress={() => setCategoryType('income')}
                >
                  <Ionicons 
                    name="add-circle" 
                    size={20} 
                    color={categoryType === 'income' ? 'white' : '#4CAF50'} 
                  />
                  <ThemedText style={[
                    styles.typeButtonText,
                    categoryType === 'income' && styles.activeTypeButtonText
                  ]}>
                    {t('transactions.income')}
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.typeButton, categoryType === 'expense' && styles.activeExpenseButton]}
                  onPress={() => setCategoryType('expense')}
                >
                  <Ionicons 
                    name="remove-circle" 
                    size={20} 
                    color={categoryType === 'expense' ? 'white' : '#F44336'} 
                  />
                  <ThemedText style={[
                    styles.typeButtonText,
                    categoryType === 'expense' && styles.activeTypeButtonText
                  ]}>
                    {t('transactions.expense')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Name */}
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>{t('categories.categoryName')}</ThemedText>
              <TextInput
                style={styles.nameInput}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Enter category name"
                placeholderTextColor="#8E8E93"
              />
            </View>

            {/* Color Selection */}
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>{t('categories.selectColor')}</ThemedText>
              <View style={styles.colorGrid}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  section: {
    margin: 20,
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  addCategoryButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  categoriesList: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  defaultLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 16,
    paddingVertical: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  saveText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
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
  activeIncomeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  activeExpenseButton: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
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
  nameInput: {
    fontSize: 16,
    color: '#1C1C1E',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
});