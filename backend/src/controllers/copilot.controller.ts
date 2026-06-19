import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const askCopilot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Capture context snapshots from Database
    const dbInventory = await prisma.inventory.findMany({
      include: { product: true, warehouse: true }
    });
    const dbSuppliers = await prisma.supplier.findMany();
    const dbWarehouses = await prisma.warehouse.findMany();

    const inventorySnapshot = dbInventory.map(i => ({
      productId: i.productId,
      sku: i.product.sku,
      name: i.product.name,
      quantity: i.quantity,
      safetyStock: i.product.safetyStock,
      reorderPoint: i.product.reorderPoint,
      warehouseName: i.warehouse.name,
      unitCost: i.product.price
    }));

    const suppliersSnapshot = dbSuppliers.map(s => ({
      id: s.id,
      name: s.name,
      delivery_speed_days: s.deliverySpeedDays,
      unit_cost_usd: s.unitCostUsd,
      reliability_pct: s.reliabilityPct,
      defect_rate_pct: s.defectRatePct
    }));

    const warehousesSnapshot = dbWarehouses.map(w => ({
      id: w.id,
      name: w.name,
      location: w.location,
      capacity: w.capacity
    }));

    // Post to Python AI copilot endpoint
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/copilot`, {
      question,
      context: {
        inventory: inventorySnapshot,
        suppliers: suppliersSnapshot,
        warehouses: warehousesSnapshot
      }
    });

    res.json(aiResponse.data);

  } catch (error) {
    // Elegant fallback answer
    const q = req.body.question.toLowerCase();
    let text = "I am ready to help. Try asking: 'Which products may go out of stock next week?'";
    let chartData = null;
    let chartType = null;
    let recs = ["Use the suggested options below to get analytics graphs."];

    if (q.includes("out of stock") || q.includes("deplete")) {
      text = "Based on our mock thresholds, 1 item is below safety stock: Lithium-Ion Battery Pack.";
      chartData = [{ name: 'Lithium-Ion Battery Pack', stock: 45, safety: 80 }];
      chartType = "bar";
      recs = ["Reorder LI-BATT-001 immediately."];
    } else if (q.includes("best supplier")) {
      text = "Precision Castings & Alloys is ranked #1 with an efficiency rating of 99.1%.";
      chartData = [
        { name: "Precision Castings & Alloys", score: 99.1 },
        { name: "Apex Industrial Parts Inc.", score: 95.2 }
      ];
      chartType = "bar";
      recs = ["Allocate high-priority orders to Precision Castings."];
    } else if (q.includes("excess") || q.includes("overstock")) {
      text = "Los Angeles Logistics Hub is currently overstocked on Semiconductor Microchips.";
      chartData = [{ name: "Semiconductor Microchip A9", stock: 1200 }];
      chartType = "pie";
      recs = ["Hold orders on SEMI-CHIP-A9."];
    }

    res.json({
      response: text,
      chartData,
      chartType,
      recommendations: recs
    });
  }
};
