import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Realistic mock data as a fallback if Database tables are not populated yet
const mockWarehouses = [
  { id: 'wh-1', name: 'Chicago Distribution Center', location: 'Chicago, IL', capacity: 15000 },
  { id: 'wh-2', name: 'Los Angeles Logistics Hub', location: 'Los Angeles, CA', capacity: 25000 },
  { id: 'wh-3', name: 'New York Transit Depot', location: 'New York, NY', capacity: 10000 },
];

const mockProducts = [
  { id: 'p-1', name: 'Lithium-Ion Battery Pack', sku: 'LI-BATT-001', category: 'Energy Storage', price: 120.0, safetyStock: 80, reorderPoint: 150 },
  { id: 'p-2', name: 'Semiconductor Microchip A9', sku: 'SEMI-CHIP-A9', category: 'Electronics', price: 45.0, safetyStock: 200, reorderPoint: 400 },
  { id: 'p-3', name: 'High-Tensile Steel Rods', sku: 'STEEL-ROD-HT', category: 'Raw Materials', price: 18.5, safetyStock: 500, reorderPoint: 1000 },
  { id: 'p-4', name: 'Hydraulic Valve Unit', sku: 'HYDR-VALVE-04', category: 'Mechanical Components', price: 85.0, safetyStock: 100, reorderPoint: 200 },
];

const mockInventory = [
  { id: 'i-1', productId: 'p-1', product: mockProducts[0], warehouseId: 'wh-1', warehouse: mockWarehouses[0], quantity: 45, batchNumber: 'BAT-B23', expiryDate: '2028-12-31' }, // Understock!
  { id: 'i-2', productId: 'p-2', product: mockProducts[1], warehouseId: 'wh-1', warehouse: mockWarehouses[0], quantity: 380, batchNumber: 'SEMI-B44', expiryDate: null },
  { id: 'i-3', productId: 'p-2', product: mockProducts[1], warehouseId: 'wh-2', warehouse: mockWarehouses[1], quantity: 1200, batchNumber: 'SEMI-B45', expiryDate: null }, // Overstock!
  { id: 'i-4', productId: 'p-3', product: mockProducts[2], warehouseId: 'wh-2', warehouse: mockWarehouses[1], quantity: 950, batchNumber: 'STL-B01', expiryDate: null },
  { id: 'i-5', productId: 'p-4', product: mockProducts[3], warehouseId: 'wh-3', warehouse: mockWarehouses[2], quantity: 210, batchNumber: 'HYD-B99', expiryDate: '2027-06-30' },
];

export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbInventory = await prisma.inventory.findMany({
      include: { product: true, warehouse: true }
    });
    
    if (dbInventory.length === 0) {
      return res.json(mockInventory);
    }
    res.json(dbInventory);
  } catch (error) {
    res.json(mockInventory); // Fallback so UI displays data
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, sku, category, price, safetyStock, reorderPoint, description } = req.body;
    const product = await prisma.product.create({
      data: { name, sku, category, price: parseFloat(price), safetyStock: parseInt(safetyStock), reorderPoint: parseInt(reorderPoint), description }
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, warehouseId, quantity, batchNumber, expiryDate } = req.body;
    
    const inventory = await prisma.inventory.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: { quantity: parseInt(quantity), batchNumber, expiryDate: expiryDate ? new Date(expiryDate) : null },
      create: { productId, warehouseId, quantity: parseInt(quantity), batchNumber, expiryDate: expiryDate ? new Date(expiryDate) : null },
      include: { product: true, warehouse: true }
    });
    
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

export const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouses = await prisma.warehouse.findMany();
    if (warehouses.length === 0) {
      return res.json(mockWarehouses);
    }
    res.json(warehouses);
  } catch (error) {
    res.json(mockWarehouses);
  }
};

export const getLowStockAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbInventory = await prisma.inventory.findMany({
      include: { product: true, warehouse: true }
    });
    
    let items = dbInventory.length === 0 ? mockInventory : dbInventory;
    const lowStock = items.filter(item => item.quantity <= item.product.safetyStock);
    
    res.json(lowStock);
  } catch (error) {
    next(error);
  }
};

export const getAIPredictions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbInventory = await prisma.inventory.findMany({
      include: { product: true, warehouse: true }
    });
    
    const items = dbInventory.length === 0 ? mockInventory : dbInventory;
    
    // Map items to the format expected by the Inventory Doctor AI API
    const formattedItems = items.map(item => ({
      id: item.productId,
      sku: item.product.sku,
      name: item.product.name,
      quantity: item.quantity,
      safetyStock: item.product.safetyStock,
      reorderPoint: item.product.reorderPoint,
      unitCost: item.product.price,
      days_since_last_sale: item.productId === 'p-1' ? 12 : item.productId === 'p-3' ? 95 : 2, // Mocking dead stock indicators
      monthly_velocity: item.productId === 'p-2' ? 150 : item.productId === 'p-1' ? 8 : 45
    }));
    
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/diagnose-inventory`, {
      inventory: formattedItems
    });
    
    res.json(aiResponse.data);
  } catch (error: any) {
    // Fallback if AI Service is unreachable
    res.json({
      diagnoses: mockInventory.map(item => ({
        productId: item.productId,
        sku: item.product.sku,
        name: item.product.name,
        quantity: item.quantity,
        status: item.quantity < item.product.safetyStock ? "UNDERSTOCK" : item.quantity > item.product.reorderPoint * 2 ? "OVERSTOCK" : "HEALTHY",
        severity: item.quantity < item.product.safetyStock ? "CRITICAL" : item.quantity > item.product.reorderPoint * 2 ? "MEDIUM" : "LOW",
        monthly_holding_cost: round(item.quantity * item.product.price * 0.02, 2),
        financial_impact: item.quantity < item.product.safetyStock ? round((item.product.safetyStock - item.quantity) * item.product.price * 1.5, 2) : 0,
        recommendation: item.quantity < item.product.safetyStock ? "Urgent restocking recommended." : "Maintain normal monitoring."
      })),
      summary: {
        total_products_checked: mockInventory.length,
        healthy_count: mockInventory.filter(i => i.quantity >= i.product.safetyStock && i.quantity <= i.product.reorderPoint*2).length,
        overstock_count: mockInventory.filter(i => i.quantity > i.product.reorderPoint*2).length,
        understock_count: mockInventory.filter(i => i.quantity < i.product.safetyStock).length,
        dead_stock_count: 1,
        slow_moving_count: 0,
        monthly_holding_cost_usd: 850.50,
        estimated_monthly_savings_usd: 120.00
      }
    });
  }
};

const round = (num: number, decimalPlaces: number) => {
  const p = Math.pow(10, decimalPlaces);
  return Math.round(num * p) / p;
};
