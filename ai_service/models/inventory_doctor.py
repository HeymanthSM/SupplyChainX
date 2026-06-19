class InventoryDoctor:
    @staticmethod
    def diagnose_inventory(inventory_items):
        """
        inventory_items: list of dicts: {
            "id": str/int,
            "sku": str,
            "name": str,
            "quantity": int,
            "safetyStock": int,
            "reorderPoint": int,
            "unitCost": float,
            "days_since_last_sale": int, # default to 0 if recently sold
            "monthly_velocity": float   # average units sold per month
        }
        """
        diagnoses = []
        total_holding_cost = 0.0
        potential_savings = 0.0
        
        for item in inventory_items:
            stock = item.get("quantity", 0)
            safety = item.get("safetyStock", 50)
            reorder = item.get("reorderPoint", 100)
            unit_cost = item.get("unitCost", 10.0)
            last_sale = item.get("days_since_last_sale", 0)
            velocity = item.get("monthly_velocity", 10.0)
            
            # Holding cost estimation (~25% of unit cost per year -> ~2% per month)
            monthly_holding_cost = stock * unit_cost * 0.02
            total_holding_cost += monthly_holding_cost
            
            status = "HEALTHY"
            recommendation = "Maintain current stock levels. Monitor demand shifts."
            severity = "LOW"
            financial_impact = 0.0
            
            # Dead Stock: No sales in 90 days and has inventory
            if last_sale >= 90 and stock > 0:
                status = "DEAD_STOCK"
                severity = "HIGH"
                financial_impact = stock * unit_cost
                potential_savings += monthly_holding_cost
                recommendation = f"Zero sales in {last_sale} days. Liquidate or sell off at {item['name']} discount to recover ${financial_impact:.2f} of tied-up capital and stop holding fees."
                
            # Overstock: Stock is way above reorder point and coverage is high
            elif stock > reorder * 1.8 and velocity > 0:
                stock_coverage_months = stock / velocity
                if stock_coverage_months > 6: # >6 months of inventory
                    status = "OVERSTOCK"
                    severity = "MEDIUM"
                    excess_qty = int(stock - (reorder * 1.2))
                    financial_impact = excess_qty * unit_cost
                    potential_savings += excess_qty * unit_cost * 0.02
                    recommendation = f"Overstocked. Currently holding {stock_coverage_months:.1f} months of supply. Pause replenishment orders. Run promo campaigns to bleed off excess {excess_qty} units."
                    
            # Understock: Below safety stock
            elif stock < safety:
                status = "UNDERSTOCK"
                severity = "CRITICAL"
                # Stockout risk cost (potential loss of sales)
                financial_impact = (safety - stock) * unit_cost * 1.5
                recommendation = f"Severely understocked. High risk of stockouts. Order at least {int(reorder - stock)} units immediately. Consider air-freight/expedited logistics."
                
            # Slow-Moving: Velocity is positive but very small compared to stock
            elif velocity > 0 and (stock / velocity) > 3.0 and last_sale > 30:
                status = "SLOW_MOVING"
                severity = "LOW"
                recommendation = "Slow moving items. Adjust reorder parameters downward to match real-world demand profile."
                
            diagnoses.append({
                "productId": item.get("id"),
                "sku": item.get("sku"),
                "name": item.get("name"),
                "quantity": stock,
                "status": status,
                "severity": severity,
                "monthly_holding_cost": round(monthly_holding_cost, 2),
                "financial_impact": round(financial_impact, 2),
                "recommendation": recommendation
            })
            
        return {
            "diagnoses": diagnoses,
            "summary": {
                "total_products_checked": len(inventory_items),
                "healthy_count": len([d for d in diagnoses if d["status"] == "HEALTHY"]),
                "overstock_count": len([d for d in diagnoses if d["status"] == "OVERSTOCK"]),
                "understock_count": len([d for d in diagnoses if d["status"] == "UNDERSTOCK"]),
                "dead_stock_count": len([d for d in diagnoses if d["status"] == "DEAD_STOCK"]),
                "slow_moving_count": len([d for d in diagnoses if d["status"] == "SLOW_MOVING"]),
                "monthly_holding_cost_usd": round(total_holding_cost, 2),
                "estimated_monthly_savings_usd": round(potential_savings, 2)
            }
        }
