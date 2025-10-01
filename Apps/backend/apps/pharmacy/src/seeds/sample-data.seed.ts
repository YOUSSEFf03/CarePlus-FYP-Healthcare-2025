import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Item } from '../entities/item.entity';
import { Medicine } from '../entities/medicine.entity';
import { User } from '../entities/user.entity';
import { Pharmacy } from '../entities/pharmacy.entity';
import { PharmacyBranch } from '../entities/pharmacy-branch.entity';
import { PharmacyBranchStock } from '../entities/pharmacy-branch-stock.entity';

export async function seedSampleData(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);
  const itemRepository = dataSource.getRepository(Item);
  const medicineRepository = dataSource.getRepository(Medicine);
  const userRepository = dataSource.getRepository(User);
  const pharmacyRepository = dataSource.getRepository(Pharmacy);
  const branchRepository = dataSource.getRepository(PharmacyBranch);
  const stockRepository = dataSource.getRepository(PharmacyBranchStock);

  // Get categories
  const prescriptionCategory = await categoryRepository.findOne({
    where: { category_name: 'Prescription Medicines' }
  });
  const otcCategory = await categoryRepository.findOne({
    where: { category_name: 'Over-the-Counter (OTC)' }
  });
  const vitaminsCategory = await categoryRepository.findOne({
    where: { category_name: 'Vitamins & Supplements' }
  });

  if (!prescriptionCategory || !otcCategory || !vitaminsCategory) {
    console.log('Categories not found. Please run category seed first.');
    return;
  }

  // Sample items
  const sampleItems = [
    {
      category_id: prescriptionCategory.category_id,
      name: 'Paracetamol 500mg',
      manufacturer: 'PharmaCorp',
      description: 'Pain relief and fever reducer',
      image_url: 'https://example.com/paracetamol.jpg'
    },
    {
      category_id: prescriptionCategory.category_id,
      name: 'Amoxicillin 250mg',
      manufacturer: 'MediLife',
      description: 'Antibiotic for bacterial infections',
      image_url: 'https://example.com/amoxicillin.jpg'
    },
    {
      category_id: otcCategory.category_id,
      name: 'Ibuprofen 200mg',
      manufacturer: 'HealthPlus',
      description: 'Anti-inflammatory pain reliever',
      image_url: 'https://example.com/ibuprofen.jpg'
    },
    {
      category_id: vitaminsCategory.category_id,
      name: 'Vitamin C 1000mg',
      manufacturer: 'NutriLife',
      description: 'Immune system support',
      image_url: 'https://example.com/vitamin-c.jpg'
    },
    {
      category_id: otcCategory.category_id,
      name: 'Cough Syrup',
      manufacturer: 'RespiraCorp',
      description: 'Relieves cough and throat irritation',
      image_url: 'https://example.com/cough-syrup.jpg'
    }
  ];

  // Create items
  const createdItems = [];
  for (const itemData of sampleItems) {
    const existingItem = await itemRepository.findOne({
      where: { name: itemData.name }
    });

    if (!existingItem) {
      const item = itemRepository.create(itemData);
      const savedItem = await itemRepository.save(item);
      createdItems.push(savedItem);
      console.log(`Created item: ${itemData.name}`);
    } else {
      createdItems.push(existingItem);
      console.log(`Item already exists: ${itemData.name}`);
    }
  }

  // Create medicines for prescription items
  const prescriptionItems = createdItems.filter(item => 
    item.category_id === prescriptionCategory.category_id
  );

  for (const item of prescriptionItems) {
    const existingMedicine = await medicineRepository.findOne({
      where: { item_id: item.item_id }
    });

    if (!existingMedicine) {
      const medicineData = {
        item_id: item.item_id,
        prescription_required: true,
        requires_approval: true,
        type: 'Tablet',
        dosage: item.name.includes('500mg') ? '500mg' : '250mg'
      };

      const medicine = medicineRepository.create(medicineData);
      await medicineRepository.save(medicine);
      console.log(`Created medicine for: ${item.name}`);
    }
  }

  // Create sample pharmacy and branch
  const existingPharmacy = await pharmacyRepository.findOne({
    where: { pharmacy_name: 'Sample Pharmacy' }
  });

  let pharmacy;
  if (!existingPharmacy) {
    // Create a sample user first
    const sampleUser = userRepository.create({
      name: 'John Pharmacy Owner',
      email: 'pharmacy@example.com',
      phone: '+1234567890',
      role: 'pharmacy'
    });
    const savedUser = await userRepository.save(sampleUser);

    pharmacy = pharmacyRepository.create({
      user_id: savedUser.user_id,
      pharmacy_name: 'Sample Pharmacy',
      pharmacy_owner: 'John Pharmacy Owner'
    });
    pharmacy = await pharmacyRepository.save(pharmacy);
    console.log('Created sample pharmacy');
  } else {
    pharmacy = existingPharmacy;
  }

  // Create pharmacy branch
  const existingBranch = await branchRepository.findOne({
    where: { pharmacy_id: pharmacy.pharmacy_id }
  });

  let branch;
  if (!existingBranch) {
    branch = branchRepository.create({
      pharmacy_id: pharmacy.pharmacy_id,
      branch_name: 'Main Branch',
      address: '123 Main Street, City, State',
      phone: '+1234567890',
      is_active: true
    });
    branch = await branchRepository.save(branch);
    console.log('Created pharmacy branch');
  } else {
    branch = existingBranch;
  }

  // Create stock for items
  for (const item of createdItems) {
    const existingStock = await stockRepository.findOne({
      where: {
        pharmacy_branch_id: branch.branch_id,
        item_id: item.item_id
      }
    });

    if (!existingStock) {
      const stockData = {
        pharmacy_branch_id: branch.branch_id,
        item_id: item.item_id,
        quantity: Math.floor(Math.random() * 100) + 10, // Random quantity 10-110
        initial_price: Math.floor(Math.random() * 50) + 5, // Random price 5-55
        sold_price: Math.floor(Math.random() * 60) + 10, // Random price 10-70
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      };

      const stock = stockRepository.create(stockData);
      await stockRepository.save(stock);
      console.log(`Created stock for: ${item.name}`);
    }
  }

  console.log('Sample data seeding completed!');
}
