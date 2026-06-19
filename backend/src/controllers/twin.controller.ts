import { Request, Response, NextFunction } from 'express';

export const simulateScenario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { scenarioId } = req.body; // 'supplier_unavailable', 'demand_surge_200', 'warehouse_closure', 'transit_delay'
    
    let label = '';
    let description = '';
    let impactAnalysis = '';
    let riskScore = 0;
    let alternatives: string[] = [];
    let metrics: any = {};

    switch(scenarioId) {
      case 'supplier_unavailable':
        label = 'Scenario 1: Primary Lithium Supplier Unavailable';
        description = 'Simulates a total shutdown of the main supplier (Apex Parts) for 14 days.';
        impactAnalysis = 'Lithium-Ion battery assembly lines will stall in 6 days. Safety stock levels will deplete completely, leading to a 34% drop in order fulfillment capacity across US hubs.';
        riskScore = 85;
        metrics = {
          fill_rate_impact: '-34%',
          stockout_risk: 'CRITICAL (92%)',
          capital_at_risk: '$45,000'
        };
        alternatives = [
          'Divert production requests to Precision Castings & Alloys (Cleveland hub).',
          'Expedite raw material purchases from secondary domestic providers.',
          'Postpone non-critical customer contracts by 10 days.'
        ];
        break;
      case 'demand_surge_200':
        label = 'Scenario 2: Seasonal Demand Surge of 200%';
        description = 'Simulates a sudden 3x demand spike for Semiconductor Microchips over the next month.';
        impactAnalysis = 'All current warehouse inventories will stock out in 11 days. Lead times will skyrocket from 4 days to 28 days as production struggles to scale.';
        riskScore = 78;
        metrics = {
          fill_rate_impact: '-20%',
          stockout_risk: 'HIGH (80%)',
          capital_at_risk: '$120,000'
        };
        alternatives = [
          'Activate automated threshold updates to bump reorder points by 150%.',
          'Deploy double shifts at manufacturing center to increase weekly output.',
          'Implement queue prioritizing high-margin customer delivery schedules.'
        ];
        break;
      case 'warehouse_closure':
        label = 'Scenario 3: Chicago Logistics Center Warehouse Closure';
        description = 'Simulates an unplanned facility shutdown (due to weather or strike) at Chicago DC.';
        impactAnalysis = 'Midwest distribution channels will halt. 450 active orders will be stranded in-transit. Holding costs at adjacent depots will surge due to redirecting volume.';
        riskScore = 90;
        metrics = {
          fill_rate_impact: '-45%',
          stockout_risk: 'CRITICAL (95%)',
          capital_at_risk: '$180,000'
        };
        alternatives = [
          'Reroute inbound shipments immediately to New York Transit Depot.',
          'Rent temporary cross-docking space in Indianapolis hub.',
          'Notify regional distributors of standard 72-hour delay notices.'
        ];
        break;
      case 'transit_delay':
        label = 'Scenario 4: Major Logistics Highway Disruptions';
        description = 'Simulates heavy logistics delays (+48 hours) on interstate shipment routes.';
        impactAnalysis = 'Minor downstream impacts. Total delivery success rate drops by 8%. Fuel cost efficiency decreases by 12% due to idling and rerouting.';
        riskScore = 48;
        metrics = {
          fill_rate_impact: '-8%',
          stockout_risk: 'MEDIUM (42%)',
          capital_at_risk: '$12,500'
        };
        alternatives = [
          'Authorize Route Optimization Engine to utilize toll routes and regional bypasses.',
          'Extend driver delivery shifts to allow longer rest intervals outside core grids.',
          'Consolidate multiple small shipments into single heavy-cargo truckloads.'
        ];
        break;
      default:
        return res.status(400).json({ error: 'Invalid scenario ID. Choose supplier_unavailable, demand_surge_200, warehouse_closure, or transit_delay.' });
    }

    res.json({
      scenarioId,
      label,
      description,
      impactAnalysis,
      riskScore,
      metrics,
      alternatives,
      simulatedAt: new Date()
    });

  } catch (error) {
    next(error);
  }
};
