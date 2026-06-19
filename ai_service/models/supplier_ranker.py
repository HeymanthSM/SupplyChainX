class SupplierRanker:
    @staticmethod
    def rank_suppliers(suppliers):
        """
        suppliers: list of dicts: {
            "id": int/str,
            "name": str,
            "delivery_speed_days": float, # average days to deliver, lower is better
            "unit_cost_usd": float,       # average unit cost, lower is better
            "reliability_pct": float,     # order success rate 0-100
            "defect_rate_pct": float,     # quality defect rate 0-100, lower is better
        }
        """
        if not suppliers:
            return []
            
        # Extract min and max values to normalize speed and cost
        speeds = [s["delivery_speed_days"] for s in suppliers]
        costs = [s["unit_cost_usd"] for s in suppliers]
        
        min_speed, max_speed = min(speeds), max(speeds)
        min_cost, max_cost = min(costs), max(costs)
        
        ranked_suppliers = []
        for s in suppliers:
            # Normalize Speed: 100 for fastest, 50 for slowest (if speed is same, default to 100)
            if max_speed != min_speed:
                speed_score = 100 - ((s["delivery_speed_days"] - min_speed) / (max_speed - min_speed) * 50)
            else:
                speed_score = 100.0
                
            # Normalize Cost: 100 for cheapest, 50 for most expensive
            if max_cost != min_cost:
                cost_score = 100 - ((s["unit_cost_usd"] - min_cost) / (max_cost - min_cost) * 50)
            else:
                cost_score = 100.0
                
            reliability_score = s["reliability_pct"]
            
            # Quality: 100 - defect_rate * 10
            quality_score = max(0.0, 100.0 - (s["defect_rate_pct"] * 10.0))
            
            # Weighted average:
            # 30% Reliability, 30% Quality, 20% Delivery Speed, 20% Cost Efficiency
            overall_score = (
                0.30 * reliability_score +
                0.30 * quality_score +
                0.20 * speed_score +
                0.20 * cost_score
            )
            
            # Risk Score: inverse of overall score plus defect padding
            risk_score = max(0, min(100, 100.0 - overall_score + (s["defect_rate_pct"] * 2.0)))
            
            if risk_score < 25:
                risk_level = "LOW"
            elif risk_score < 50:
                risk_level = "MEDIUM"
            elif risk_score < 75:
                risk_level = "HIGH"
            else:
                risk_level = "CRITICAL"
                
            ranked_suppliers.append({
                **s,
                "metrics": {
                    "speed_score": round(speed_score, 2),
                    "cost_score": round(cost_score, 2),
                    "reliability_score": round(reliability_score, 2),
                    "quality_score": round(quality_score, 2)
                },
                "score": round(overall_score, 2),
                "risk_score": round(risk_score, 2),
                "risk_level": risk_level
            })
            
        # Sort by overall score descending
        ranked_suppliers = sorted(ranked_suppliers, key=lambda x: x["score"], reverse=True)
        
        # Add rank index
        for i, s in enumerate(ranked_suppliers):
            s["rank"] = i + 1
            
        return ranked_suppliers
