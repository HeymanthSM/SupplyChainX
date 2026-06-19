import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const mockSuppliers = [
  { id: 's-1', name: 'Apex Industrial Parts Inc.', contactEmail: 'supply@apexparts.com', contactPhone: '+1-555-0199', address: 'Detroit, MI', rating: 4.8, deliverySpeedDays: 3.2, unitCostUsd: 110.0, reliabilityPct: 98.2, defectRatePct: 0.4 },
  { id: 's-2', name: 'Global Tech Components Ltd.', contactEmail: 'sales@globaltech.co', contactPhone: '+44-20-7946-0958', address: 'London, UK', rating: 4.5, deliverySpeedDays: 6.5, unitCostUsd: 98.0, reliabilityPct: 91.5, defectRatePct: 1.2 },
  { id: 's-3', name: 'Prime Logistics Materials Corp.', contactEmail: 'info@primelogistics.com', contactPhone: '+1-800-555-0144', address: 'Houston, TX', rating: 3.9, deliverySpeedDays: 8.0, unitCostUsd: 85.0, reliabilityPct: 88.0, defectRatePct: 2.5 },
  { id: 's-4', name: 'Precision Castings & Alloys', contactEmail: 'contact@precisioncastings.com', contactPhone: '+1-734-555-3211', address: 'Cleveland, OH', rating: 4.9, deliverySpeedDays: 4.5, unitCostUsd: 105.0, reliabilityPct: 99.5, defectRatePct: 0.1 }
];

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbSuppliers = await prisma.supplier.findMany();
    if (dbSuppliers.length === 0) {
      return res.json(mockSuppliers);
    }
    res.json(dbSuppliers);
  } catch (error) {
    res.json(mockSuppliers);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, contactEmail, contactPhone, address, rating, deliverySpeedDays, unitCostUsd, reliabilityPct, defectRatePct } = req.body;
    
    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactEmail,
        contactPhone,
        address,
        rating: parseFloat(rating),
        deliverySpeedDays: parseFloat(deliverySpeedDays),
        unitCostUsd: parseFloat(unitCostUsd),
        reliabilityPct: parseFloat(reliabilityPct),
        defectRatePct: parseFloat(defectRatePct)
      }
    });
    
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const getSupplierLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbSuppliers = await prisma.supplier.findMany();
    const suppliers = dbSuppliers.length === 0 ? mockSuppliers : dbSuppliers;
    
    // Call Python AI Service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/supplier-rank`, {
      suppliers: suppliers.map(s => ({
        id: s.id,
        name: s.name,
        delivery_speed_days: s.deliverySpeedDays,
        unit_cost_usd: s.unitCostUsd,
        reliability_pct: s.reliabilityPct,
        defect_rate_pct: s.defectRatePct
      }))
    });
    
    res.json(aiResponse.data);
  } catch (error: any) {
    // Fallback ranking calculation if AI server is unreachable
    const fallbacks = mockSuppliers.map((s, idx) => {
      const overall = (s.reliabilityPct * 0.3) + (100 - s.defectRatePct*10)*0.3 + (100 - s.deliverySpeedDays*5)*0.2 + (100 - s.unitCostUsd*0.2)*0.2;
      const risk = 100 - overall;
      return {
        ...s,
        score: Math.round(overall * 100) / 100,
        risk_score: Math.round(risk * 100) / 100,
        risk_level: risk < 15 ? 'LOW' : risk < 35 ? 'MEDIUM' : 'HIGH',
        rank: idx + 1,
        metrics: {
          speed_score: 90,
          cost_score: 85,
          reliability_score: s.reliabilityPct,
          quality_score: 95
        }
      };
    }).sort((a,b) => b.score - a.score);
    
    res.json(fallbacks);
  }
};
