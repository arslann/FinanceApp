import { initDatabase, seedDefaultCategories } from '../database/database';

export const initializeApp = async () => {
  try {
    console.log('Initializing app...');
    
    // Initialize database
    await initDatabase();
    console.log('Database initialized');
    
    // Seed default categories
    await seedDefaultCategories();
    console.log('Default categories seeded');
    
    console.log('App initialization complete');
    return true;
  } catch (error) {
    console.error('Error initializing app:', error);
    return false;
  }
};