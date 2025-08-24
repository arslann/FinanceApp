import * as SQLite from 'expo-sqlite';

let db;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('financeApp.db');
    
    // Create categories table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_turkish TEXT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        color TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create transactions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        description TEXT,
        category_id TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );
    `);

    // Create settings table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Categories operations
export const insertCategory = async (category) => {
  const database = getDatabase();
  try {
    const result = await database.runAsync(
      'INSERT INTO categories (id, name, name_turkish, type, color, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [category.id, category.name, category.nameTurkish, category.type, category.color, category.isDefault ? 1 : 0]
    );
    return result;
  } catch (error) {
    console.error('Error inserting category:', error);
    throw error;
  }
};

export const getAllCategories = async () => {
  const database = getDatabase();
  try {
    const result = await database.getAllAsync('SELECT * FROM categories ORDER BY is_default DESC, name ASC');
    return result.map(row => ({
      id: row.id,
      name: row.name,
      nameTurkish: row.name_turkish,
      type: row.type,
      color: row.color,
      isDefault: row.is_default === 1,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const updateCategory = async (category) => {
  const database = getDatabase();
  try {
    const result = await database.runAsync(
      'UPDATE categories SET name = ?, name_turkish = ?, type = ?, color = ? WHERE id = ? AND is_default = 0',
      [category.name, category.nameTurkish, category.type, category.color, category.id]
    );
    return result;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  const database = getDatabase();
  try {
    const result = await database.runAsync(
      'DELETE FROM categories WHERE id = ? AND is_default = 0',
      [categoryId]
    );
    return result;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Transactions operations
export const insertTransaction = async (transaction) => {
  const database = getDatabase();
  try {
    const result = await database.runAsync(
      'INSERT INTO transactions (id, amount, description, category_id, date, type) VALUES (?, ?, ?, ?, ?, ?)',
      [transaction.id, transaction.amount, transaction.description, transaction.categoryId, transaction.date, transaction.type]
    );
    return result;
  } catch (error) {
    console.error('Error inserting transaction:', error);
    throw error;
  }
};

export const getAllTransactions = async () => {
  const database = getDatabase();
  try {
    const result = await database.getAllAsync(`
      SELECT 
        t.*,
        c.name as category_name,
        c.name_turkish as category_name_turkish,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC, t.created_at DESC
    `);
    return result.map(row => ({
      id: row.id,
      amount: row.amount,
      description: row.description,
      categoryId: row.category_id,
      date: row.date,
      type: row.type,
      createdAt: row.created_at,
      category: {
        name: row.category_name,
        nameTurkish: row.category_name_turkish,
        color: row.category_color,
      },
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const updateTransaction = async (transaction) => {
  const database = getDatabase();
  try {
    const result = await database.runAsync(
      'UPDATE transactions SET amount = ?, description = ?, category_id = ?, date = ?, type = ? WHERE id = ?',
      [transaction.amount, transaction.description, transaction.categoryId, transaction.date, transaction.type, transaction.id]
    );
    return result;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId) => {
  const database = getDatabase();
  try {
    const result = await database.runAsync(
      'DELETE FROM transactions WHERE id = ?',
      [transactionId]
    );
    return result;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Settings operations
export const getSetting = async (key) => {
  const database = getDatabase();
  try {
    const result = await database.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]);
    return result?.value || null;
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
};

export const setSetting = async (key, value) => {
  const database = getDatabase();
  try {
    const result = await database.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
    return result;
  } catch (error) {
    console.error('Error setting setting:', error);
    throw error;
  }
};

// Seed default categories
export const seedDefaultCategories = async () => {
  const database = getDatabase();
  const existingCategories = await getAllCategories();
  
  if (existingCategories.length === 0) {
    const defaultCategories = [
      { id: 'salary', name: 'Salary', nameTurkish: 'Maaş', type: 'income', color: '#4CAF50', isDefault: true },
      { id: 'freelance', name: 'Freelance', nameTurkish: 'Serbest Çalışma', type: 'income', color: '#8BC34A', isDefault: true },
      { id: 'other-income', name: 'Other Income', nameTurkish: 'Diğer Gelir', type: 'income', color: '#CDDC39', isDefault: true },
      { id: 'rent', name: 'Rent', nameTurkish: 'Kira', type: 'expense', color: '#F44336', isDefault: true },
      { id: 'groceries', name: 'Groceries', nameTurkish: 'Market', type: 'expense', color: '#E91E63', isDefault: true },
      { id: 'transportation', name: 'Transportation', nameTurkish: 'Ulaşım', type: 'expense', color: '#9C27B0', isDefault: true },
      { id: 'utilities', name: 'Utilities', nameTurkish: 'Faturalar', type: 'expense', color: '#673AB7', isDefault: true },
      { id: 'entertainment', name: 'Entertainment', nameTurkish: 'Eğlence', type: 'expense', color: '#3F51B5', isDefault: true },
      { id: 'healthcare', name: 'Healthcare', nameTurkish: 'Sağlık', type: 'expense', color: '#2196F3', isDefault: true },
    ];

    for (const category of defaultCategories) {
      await insertCategory(category);
    }
    console.log('Default categories seeded successfully');
  }
};