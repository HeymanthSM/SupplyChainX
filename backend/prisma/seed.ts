import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records to avoid duplicate key errors
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.traceabilityLog.deleteMany();
  await prisma.riskAlert.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const analystHash = await bcrypt.hash('analyst123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'admin@supplychainx.com',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'analyst@supplychainx.com',
      password: analystHash,
      role: Role.ANALYST,
    },
  });

  console.log('👤 Seeded users:', { admin: admin.email, analyst: analyst.email });

  // 3. Create Warehouses
  const wh1 = await prisma.warehouse.create({
    data: { name: 'Chicago Distribution Center', location: 'Chicago, IL', capacity: 15000 },
  });
  const wh2 = await prisma.warehouse.create({
    data: { name: 'Los Angeles Logistics Hub', location: 'Los Angeles, CA', capacity: 25000 },
  });
  const wh3 = await prisma.warehouse.create({
    data: { name: 'New York Transit Depot', location: 'New York, NY', capacity: 10000 },
  });

  console.log('🏢 Seeded warehouses.');

  // 4. Create Products
  const p1 = await prisma.product.create({
    data: { name: 'Lithium-Ion Battery Pack', sku: 'LI-BATT-001', category: 'Energy Storage', price: 120.0, safetyStock: 80, reorderPoint: 150 },
  });
  const p2 = await prisma.product.create({
    data: { name: 'Semiconductor Microchip A9', sku: 'SEMI-CHIP-A9', category: 'Electronics', price: 45.0, safetyStock: 200, reorderPoint: 400 },
  });
  const p3 = await prisma.product.create({
    data: { name: 'High-Tensile Steel Rods', sku: 'STEEL-ROD-HT', category: 'Raw Materials', price: 18.5, safetyStock: 500, reorderPoint: 1000 },
  });
  const p4 = await prisma.product.create({
    data: { name: 'Hydraulic Valve Unit', sku: 'HYDR-VALVE-04', category: 'Mechanical Components', price: 85.0, safetyStock: 100, reorderPoint: 200 },
  });
  const p5 = await prisma.product.create({
    data: { name: 'Brushless DC Motor', sku: 'BLDC-MOTOR-12', category: 'Mechanical Components', price: 95.0, safetyStock: 120, reorderPoint: 240 },
  });
  const p6 = await prisma.product.create({
    data: { name: 'Carbon Fiber Composites', sku: 'CF-COMP-24', category: 'Raw Materials', price: 250.0, safetyStock: 50, reorderPoint: 100 },
  });

  console.log('📦 Seeded products.');

  // 5. Create Inventory stocks
  await prisma.inventory.createMany({
    data: [
      { productId: p1.id, warehouseId: wh1.id, quantity: 45, batchNumber: 'BAT-B23' }, // Understock
      { productId: p2.id, warehouseId: wh1.id, quantity: 380, batchNumber: 'SEMI-B44' },
      { productId: p2.id, warehouseId: wh2.id, quantity: 1200, batchNumber: 'SEMI-B45' }, // Overstock
      { productId: p3.id, warehouseId: wh2.id, quantity: 950, batchNumber: 'STL-B01' },
      { productId: p4.id, warehouseId: wh3.id, quantity: 210, batchNumber: 'HYD-B99' },
      { productId: p5.id, warehouseId: wh1.id, quantity: 80, batchNumber: 'MOT-B12' },
      { productId: p6.id, warehouseId: wh3.id, quantity: 150, batchNumber: 'CFB-B24' },
    ],
  });

  console.log('📊 Seeded inventory logs.');

  // 6. Create Suppliers
  const s1 = await prisma.supplier.create({
    data: { name: 'Apex Industrial Parts Inc.', contactEmail: 'supply@apexparts.com', rating: 4.8, deliverySpeedDays: 3.2, unitCostUsd: 110.0, reliabilityPct: 98.2, defectRatePct: 0.4 },
  });
  const s2 = await prisma.supplier.create({
    data: { name: 'Global Tech Components Ltd.', contactEmail: 'sales@globaltech.co', rating: 4.5, deliverySpeedDays: 6.5, unitCostUsd: 98.0, reliabilityPct: 91.5, defectRatePct: 1.2 },
  });
  const s3 = await prisma.supplier.create({
    data: { name: 'Prime Logistics Materials Corp.', contactEmail: 'info@primelogistics.com', rating: 3.9, deliverySpeedDays: 8.0, unitCostUsd: 85.0, reliabilityPct: 74.5, defectRatePct: 4.8 },
  });
  const s4 = await prisma.supplier.create({
    data: { name: 'Precision Castings & Alloys', contactEmail: 'contact@precisioncastings.com', rating: 4.9, deliverySpeedDays: 4.5, unitCostUsd: 105.0, reliabilityPct: 99.5, defectRatePct: 0.1 },
  });

  console.log('🤝 Seeded suppliers.');

  // 7. Seed sample orders and shipments
  const today = new Date();
  const products = [p1, p2, p3, p4, p5, p6];
  const suppliersList = [s1, s2, s3, s4];
  const historicalOrdersData = [];

  for (const prod of products) {
    for (let i = 20; i > 0; i -= 2) {
      const orderDate = new Date();
      orderDate.setDate(today.getDate() - i);
      const supplier = suppliersList[Math.floor(Math.random() * suppliersList.length)];
      const qty = Math.floor(40 + Math.random() * 80);
      historicalOrdersData.push({
        supplierId: supplier.id,
        productId: prod.id,
        quantity: qty,
        cost: qty * prod.price,
        status: 'DELIVERED' as any,
        orderDate: orderDate,
      });
    }
  }

  await prisma.order.createMany({
    data: historicalOrdersData
  });

  const order1 = await prisma.order.create({
    data: { supplierId: s3.id, productId: p1.id, quantity: 100, cost: 8500.0, status: 'PENDING' }
  });

  await prisma.shipment.create({
    data: { orderId: order1.id, status: 'PENDING', fuelConsumed: 0, carbonEmissions: 0 }
  });

  console.log('🚚 Seeded orders and shipments.');

  // 8. Seed sample traceability stages
  await prisma.traceabilityLog.createMany({
    data: [
      { productId: p1.id, locationName: 'Apex Supplier (Detroit)', stage: 'SUPPLIER', details: 'Cells manufactured, batch approved.' },
      { productId: p1.id, locationName: 'Factory Assembly (Cleveland)', stage: 'FACTORY', details: 'Packed and encapsulated. Sealed.' },
      { productId: p1.id, locationName: 'Chicago Warehouse DC', stage: 'WAREHOUSE', details: 'Stocked in Section B, Row 4.' },
    ]
  });

  console.log('🔍 Seeded traceability journey stages.');

  // 9. Seed sample forecasts in the Forecast table for all products
  const forecastDataList = [];
  for (const prod of products) {
    for (let i = 1; i <= 30; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(today.getDate() + i);
      forecastDataList.push({
        productId: prod.id,
        forecastDate: forecastDate,
        forecastedDemand: Math.round(135 + Math.sin(i / 2) * 20 + Math.random() * 10),
        forecastType: 'DAILY',
        accuracy: 91.5
      });
    }
  }

  await prisma.forecast.createMany({
    data: forecastDataList
  });

  console.log('📈 Seeded forecasts.');
  console.log('✅ Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
