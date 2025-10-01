import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';

export async function seedCategories(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);

  const categories = [
    { category_name: 'Prescription Medicines' },
    { category_name: 'Over-the-Counter (OTC)' },
    { category_name: 'Vitamins & Supplements' },
    { category_name: 'Personal Care' },
    { category_name: 'Medical Devices' },
    { category_name: 'Baby Care' },
    { category_name: 'First Aid' },
    { category_name: 'Health & Wellness' },
    { category_name: 'Beauty & Cosmetics' },
    { category_name: 'Home Health Care' },
  ];

  for (const categoryData of categories) {
    const existingCategory = await categoryRepository.findOne({
      where: { category_name: categoryData.category_name }
    });

    if (!existingCategory) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`Created category: ${categoryData.category_name}`);
    } else {
      console.log(`Category already exists: ${categoryData.category_name}`);
    }
  }
}
