import { DataSource } from 'typeorm';
import { seedCategories } from './category.seed';
import { seedSampleData } from './sample-data.seed';

export async function runSeeds(dataSource: DataSource) {
  try {
    console.log('Starting database seeding...');
    
    // Run category seeds first
    await seedCategories(dataSource);
    
    // Run sample data seeds
    await seedSampleData(dataSource);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}
