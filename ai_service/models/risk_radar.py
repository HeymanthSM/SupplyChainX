class RiskRadar:
    @staticmethod
    def assess_risks(inventory_items, suppliers, shipments, demand_forecasts):
        """
        Calculates supply chain risk vectors and aggregates warnings.
        """
        alerts = []
        
        # 1. Inventory Shortage Check
        for item in inventory_items:
            stock = item.get('quantity', 0)
            safety = item.get('safetyStock', 50)
            reorder = item.get('reorderPoint', 100)
            sku = item.get('sku', '')
            name = item.get('name', 'Product')
            
            if stock <= safety * 0.5:
                prob = 90
                impact = 80
                level = "CRITICAL"
                msg = f"Critical Inventory Shortage: {name} ({sku}) is at {stock} units (Safety threshold: {safety})."
                rec = "Trigger emergency stock transfer or run expedited order from nearest local supplier."
            elif stock <= safety:
                prob = 75
                impact = 70
                level = "HIGH"
                msg = f"Low Inventory Danger: {name} ({sku}) has dipped below safety levels to {stock} units."
                rec = "Reorder immediately. Contact top-ranked supplier for priority fulfillment."
            elif stock <= reorder:
                prob = 50
                impact = 50
                level = "MEDIUM"
                msg = f"Reorder threshold breached: {name} ({sku}) is at {stock} units."
                rec = "Verify automated replenishment order has been sent to supplier."
            else:
                continue
                
            alerts.append({
                "category": "INVENTORY",
                "source": sku,
                "message": msg,
                "probability": prob,
                "impact": impact,
                "risk_score": (prob * impact) / 100,
                "risk_level": level,
                "recommendation": rec
            })

        # 2. Supplier Delay Check
        for s in suppliers:
            reliability = s.get('reliability_pct', 100)
            defect_rate = s.get('defect_rate_pct', 0)
            name = s.get('name', 'Supplier')
            
            if reliability < 80 or defect_rate > 5:
                prob = 80
                impact = 75
                level = "HIGH"
                msg = f"Supplier Risk Detected: {name} reliability has dropped to {reliability}% with defect rate of {defect_rate}%."
                rec = "Place secondary supplier on hot-standby. Restructure SLAs."
                
                alerts.append({
                    "category": "SUPPLIER",
                    "source": name,
                    "message": msg,
                    "probability": prob,
                    "impact": impact,
                    "risk_score": (prob * impact) / 100,
                    "risk_level": level,
                    "recommendation": rec
                })
                
        # 3. Logistics Bottlenecks (Shipments)
        for ship in shipments:
            status = ship.get('status', '')
            eta_delay = ship.get('delay_hours', 0)
            ship_id = ship.get('id', '')
            origin = ship.get('origin', 'Origin')
            destination = ship.get('destination', 'Destination')
            
            if status == "IN_TRANSIT" and eta_delay > 24:
                prob = 95
                impact = 65
                level = "HIGH"
                msg = f"Logistics Delay: Shipment {ship_id} from {origin} to {destination} is delayed by {eta_delay} hours."
                rec = "Coordinate with customs agent or carrier. Reroute via premium lane if critical."
                
                alerts.append({
                    "category": "LOGISTICS",
                    "source": f"Shipment {ship_id}",
                    "message": msg,
                    "probability": prob,
                    "impact": impact,
                    "risk_score": (prob * impact) / 100,
                    "risk_level": level,
                    "recommendation": rec
                })

        # 4. Demand Spikes
        for fc in demand_forecasts:
            historical_avg = fc.get('historical_average', 100)
            forecasted = fc.get('forecasted_demand', 100)
            sku = fc.get('sku', '')
            
            if forecasted >= historical_avg * 1.5:
                # 50%+ spike
                prob = 70
                impact = 60
                level = "MEDIUM" if forecasted < historical_avg * 2.0 else "HIGH"
                msg = f"Demand Spike Anticipated: {sku} demand forecast ({forecasted} units) represents a {(forecasted/historical_avg*100)-100:.1f}% spike."
                rec = "Increase safety stock thresholds. Adjust manufacturing schedule."
                
                alerts.append({
                    "category": "DEMAND",
                    "source": sku,
                    "message": msg,
                    "probability": prob,
                    "impact": impact,
                    "risk_score": (prob * impact) / 100,
                    "risk_level": level,
                    "recommendation": rec
                })
                
        # Sort alerts by risk score descending
        alerts = sorted(alerts, key=lambda x: x["risk_score"], reverse=True)
        
        # Calculate summary metrics
        total_risk_score = sum([a["risk_score"] for a in alerts])
        avg_risk_score = total_risk_score / len(alerts) if alerts else 10.0
        
        overall_level = "LOW"
        if avg_risk_score >= 70 or any(a["risk_level"] == "CRITICAL" for a in alerts):
            overall_level = "CRITICAL"
        elif avg_risk_score >= 50 or any(a["risk_level"] == "HIGH" for a in alerts):
            overall_level = "HIGH"
        elif avg_risk_score >= 25:
            overall_level = "MEDIUM"
            
        return {
            "alerts": alerts,
            "metrics": {
                "total_active_risks": len(alerts),
                "average_risk_score": round(avg_risk_score, 2),
                "overall_risk_level": overall_level
            }
        }
