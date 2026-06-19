import { Request, Response, NextFunction } from 'express';

export const getCostLeakages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      leakages: [
        {
          id: "lk-1",
          category: "EXCESS_STORAGE",
          source: "Los Angeles Warehouse",
          description: "Holding 1,200 Semiconductor chips which exceeds regional demand safety lines by 800 units.",
          monthlyLossUsd: 1600.0,
          recommendation: "Hold restocking cycles. Run discount promos to clear capacity.",
          savingsPotentialUsd: 1200.0
        },
        {
          id: "lk-2",
          category: "SUPPLIER_INEFFICIENCY",
          source: "Prime Logistics Materials Corp.",
          description: "High defect rates (2.5%) led to re-ordering fees and delayed assembly line setups.",
          monthlyLossUsd: 2800.0,
          recommendation: "Chargeback defect costs or re-assign 20% order volume to Apex Parts.",
          savingsPotentialUsd: 2000.0
        },
        {
          id: "lk-3",
          category: "DELIVERY_LOSS",
          source: "Shipment Lane US-MIDWEST",
          description: "Highway congestions led to average idling times of 36 hours for 3 weekly shipments.",
          monthlyLossUsd: 950.0,
          recommendation: "Implement Route Optimization and reschedule departures to off-peak slots.",
          savingsPotentialUsd: 650.0
        }
      ],
      summary: {
        totalMonthlyLossUsd: 5350.0,
        attainableSavingsUsd: 3850.0,
        efficiencyScore: 89.2
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getGreenMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      emissionsTrend: [
        { month: 'Jan', co2_kg: 4200, fuel_l: 1560 },
        { month: 'Feb', co2_kg: 3900, fuel_l: 1450 },
        { month: 'Mar', co2_kg: 3500, fuel_l: 1300 },
        { month: 'Apr', co2_kg: 3200, fuel_l: 1190 },
        { month: 'May', co2_kg: 2800, fuel_l: 1040 },
        { month: 'Jun', co2_kg: 2450, fuel_l: 910 }
      ],
      supplierRatings: [
        { name: "Precision Castings & Alloys", rating: "A+", co2_saved_kg: 850 },
        { name: "Apex Industrial Parts Inc.", rating: "A", co2_saved_kg: 620 },
        { name: "Global Tech Components Ltd.", rating: "B", co2_saved_kg: 210 },
        { name: "Prime Logistics Materials Corp.", rating: "D", co2_saved_kg: -120 }
      ],
      metrics: {
        totalEmissionsCo2Kg: 2450.0,
        fuelConsumptionLiters: 910.0,
        greenTransportationIndex: "84.5%",
        offsetCreditsPurchased: 450
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsKPIs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      kpis: {
        inventoryTurnover: 6.2,        // Target: 6-8 times/year
        fillRate: 94.8,               // Target: 95%+
        stockoutRate: 2.1,            // Target: <3%
        supplierPerformance: 91.5,    // Average supplier rating score
        demandAccuracy: 89.4,         // Forecast vs actuals
        deliverySuccessRate: 97.2     // On-time shipment rate
      },
      charts: {
        inventoryVelocity: [
          { month: 'Jan', in: 450, out: 420 },
          { month: 'Feb', in: 520, out: 510 },
          { month: 'Mar', in: 610, out: 590 },
          { month: 'Apr', in: 480, out: 495 },
          { month: 'May', in: 410, out: 430 },
          { month: 'Jun', in: 380, out: 415 }
        ],
        fillRateTrend: [
          { month: 'Jan', rate: 91.2 },
          { month: 'Feb', rate: 92.5 },
          { month: 'Mar', rate: 93.8 },
          { month: 'Apr', rate: 94.0 },
          { month: 'May', rate: 94.8 },
          { month: 'Jun', rate: 96.1 }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, format } = req.body; // type: INVENTORY, FORECAST, SUPPLIER, RISK. format: PDF, EXCEL, CSV
    
    const cleanType = String(type).toUpperCase();
    const cleanFormat = String(format).toUpperCase();

    // Set appropriate headers and send back simulated binary stream
    if (cleanFormat === 'CSV') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=SupplyChainX_${cleanType}_Report.csv`);
      const csvData = `ID,SKU/Source,Name/Description,Quantity/Cost,Status/Score\n1,LI-BATT-001,Lithium-Ion Battery Pack,45,UNDERSTOCK\n2,SEMI-CHIP-A9,Semiconductor Microchip A9,1200,OVERSTOCK\n3,sh-101,Shipment Delay,36 hours,HIGH_RISK\n`;
      return res.send(csvData);
    }

    // PDF / EXCEL Mock representation
    res.setHeader('Content-Type', 'application/json');
    res.json({
      message: `Successfully generated ${cleanType} report in ${cleanFormat} format.`,
      fileName: `SupplyChainX_${cleanType}_Report_${new Date().toISOString().split('T')[0]}.${cleanFormat.toLowerCase()}`,
      downloadUrl: `/downloads/mock_${cleanType.toLowerCase()}.${cleanFormat.toLowerCase()}`,
      fileSize: "145 KB",
      createdAt: new Date()
    });
  } catch (error) {
    next(error);
  }
};
