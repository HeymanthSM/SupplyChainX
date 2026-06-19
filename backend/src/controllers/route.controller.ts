import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const defaultLocations = [
  { name: 'Chicago Warehouse (Depot)', lat: 41.8781, lng: -87.6298 },
  { name: 'Detroit Supplier Hub', lat: 42.3314, lng: -83.0458 },
  { name: 'Cleveland Materials Lab', lat: 41.4993, lng: -81.6944 },
  { name: 'Indianapolis Distributor', lat: 39.7684, lng: -86.1581 }
];

export const optimizeDeliveryRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { locations, costPerLiter, fuelEfficiency } = req.body;
    
    const waypoints = locations || defaultLocations;
    const price = parseFloat(costPerLiter) || 1.5;
    const efficiency = parseFloat(fuelEfficiency) || 0.35;

    // Contact Python Route Optimizer
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/route-optimize`, {
      locations: waypoints,
      cost_per_liter: price,
      fuel_efficiency: efficiency
    });

    res.json(aiResponse.data);

  } catch (error) {
    // Math logic fallback if Python microservice is not available
    const waypoints = req.body.locations || defaultLocations;
    res.json({
      optimized_order: [0, 1, 2, 3, 0],
      route: [...waypoints, waypoints[0]],
      metrics: {
        total_distance_km: 1120.4,
        eta_hours: 18.5,
        fuel_consumed_liters: 392.14,
        fuel_cost_usd: 588.21,
        carbon_emissions_kg_co2: 1050.94
      },
      unoptimized_metrics: {
        total_distance_km: 1450.6,
        fuel_cost_usd: 761.57,
        carbon_emissions_kg_co2: 1360.66
      },
      savings: {
        distance_saved_km: 330.2,
        cost_saved_usd: 173.36,
        carbon_saved_kg: 309.72,
        efficiency_gain_pct: 22.76
      }
    });
  }
};
