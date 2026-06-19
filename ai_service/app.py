from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Import models
from models.demand_forecaster import DemandForecaster
from models.route_optimizer import RouteOptimizer
from models.supplier_ranker import SupplierRanker
from models.risk_radar import RiskRadar
from models.inventory_doctor import InventoryDoctor

app = FastAPI(title="SupplyChainX AI Service", version="1.0.0")

# Request Schemas
class ForecastRequest(BaseModel):
    history: List[Dict[str, Any]]
    days: Optional[int] = 30

class RouteLocation(BaseModel):
    name: str
    lat: float
    lng: float

class RouteRequest(BaseModel):
    locations: List[RouteLocation]
    cost_per_liter: Optional[float] = 1.5
    fuel_efficiency: Optional[float] = 0.35
    speed_kmh: Optional[int] = 70

class SupplierItem(BaseModel):
    id: str
    name: str
    delivery_speed_days: float
    unit_cost_usd: float
    reliability_pct: float
    defect_rate_pct: float

class SupplierRankRequest(BaseModel):
    suppliers: List[SupplierItem]

class RiskAssessRequest(BaseModel):
    inventory: List[Dict[str, Any]]
    suppliers: List[Dict[str, Any]]
    shipments: List[Dict[str, Any]]
    forecasts: List[Dict[str, Any]]

class DiagnoseRequest(BaseModel):
    inventory: List[Dict[str, Any]]

class CopilotRequest(BaseModel):
    question: str
    context: Dict[str, Any] # snapshots of database: inventory, suppliers, warehouses, etc.

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "SupplyChainX AI/ML Service"}

@app.post("/api/forecast")
def run_forecast(req: ForecastRequest):
    try:
        res = DemandForecaster.forecast(req.history, req.days)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/route-optimize")
def run_route_optimize(req: RouteRequest):
    try:
        locs = [loc.model_dump() for loc in req.locations]
        res = RouteOptimizer.optimize_route(
            locs, 
            req.cost_per_liter, 
            req.fuel_efficiency, 
            req.speed_kmh
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/supplier-rank")
def run_supplier_rank(req: SupplierRankRequest):
    try:
        sups = [sup.model_dump() for sup in req.suppliers]
        res = SupplierRanker.rank_suppliers(sups)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/risk-assess")
def run_risk_assess(req: RiskAssessRequest):
    try:
        res = RiskRadar.assess_risks(
            req.inventory,
            req.suppliers,
            req.shipments,
            req.forecasts
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/diagnose-inventory")
def run_diagnose_inventory(req: DiagnoseRequest):
    try:
        res = InventoryDoctor.diagnose_inventory(req.inventory)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/copilot")
def run_copilot(req: CopilotRequest):
    """
    Intelligent search and question answering using structured rules, regex patterns,
    and mathematical aggregations on the provided DB snapshot context.
    """
    question = req.question.lower().strip()
    ctx = req.context
    
    inventory = ctx.get("inventory", [])
    suppliers = ctx.get("suppliers", [])
    warehouses = ctx.get("warehouses", [])
    
    response_text = ""
    chart_data = None
    chart_type = None # "bar", "pie", "line"
    recommendations = []
    
    # Question 1: "Which products may go out of stock next week?"
    if "out of stock" in question or "stockout" in question or "deplete" in question:
        critical_items = []
        for item in inventory:
            qty = item.get("quantity", 0)
            safety = item.get("safetyStock", 50)
            reorder = item.get("reorderPoint", 100)
            if qty < safety:
                critical_items.append(item)
                
        if critical_items:
            response_text = f"Based on current stock counts, we have {len(critical_items)} items tracking below safety levels that are at extreme risk of stockout next week."
            chart_data = [{"name": item.get("name", ""), "stock": item.get("quantity", 0), "safety": item.get("safetyStock", 50)} for item in critical_items]
            chart_type = "bar"
            recommendations = [f"Expedite replenishment for {item['name']} ({item['sku']})." for item in critical_items[:3]]
        else:
            response_text = "Good news! All inventory products are currently sitting comfortably above their safety thresholds. No immediate out-of-stock threats detected for next week."
            recommendations = ["Continue monitoring sales velocity trends."]
            
    # Question 2: "Who is the best supplier this month?"
    elif "best supplier" in question or "supplier leaderboard" in question or "rank supplier" in question:
        if suppliers:
            # Let's score them quickly
            scored_suppliers = SupplierRanker.rank_suppliers(suppliers)
            best = scored_suppliers[0]
            response_text = f"The top performing supplier this month is **{best['name']}** with an efficiency score of {best['score']}/100 and a Reliability rating of {best['reliability_pct']}%."
            chart_data = [{"name": s["name"], "score": s["score"]} for s in scored_suppliers]
            chart_type = "bar"
            recommendations = [
                f"Allocate more volume to {best['name']} given their high reliability.",
                "Review SLAs for low-scoring suppliers in the dashboard leaderboard."
            ]
        else:
            response_text = "No supplier records are available in the current context to perform ranking evaluation."
            
    # Question 3: "Which warehouse has excess inventory?"
    elif "excess inventory" in question or "overstock" in question or "warehouse" in question:
        warehouse_totals = {}
        for item in inventory:
            w_name = item.get("warehouseName", "Global Depot")
            qty = item.get("quantity", 0)
            warehouse_totals[w_name] = warehouse_totals.get(w_name, 0) + qty
            
        overstocked_items = []
        for item in inventory:
            qty = item.get("quantity", 0)
            reorder = item.get("reorderPoint", 100)
            if qty > reorder * 1.8:
                overstocked_items.append(item)
                
        if overstocked_items:
            response_text = f"We have identified overstock locations. Warehouses are holding excess stock for {len(overstocked_items)} products."
            chart_data = [{"name": item.get("name"), "stock": item.get("quantity")} for item in overstocked_items[:5]]
            chart_type = "pie"
            recommendations = [
                "Pause replenishment runs for " + ", ".join([i['name'] for i in overstocked_items[:2]]),
                "Establish inter-warehouse transfers to offset stockout spots without purchasing new units."
            ]
        else:
            response_text = "Warehouse storage capacities are well-balanced. No critical overstocks or excess capital-lockups detected."
            
    # Fallback response
    else:
        # Standard summary fallback
        response_text = "I can assist you with supply chain analysis. Try asking one of these questions:\n" \
                        "1. *'Which products may go out of stock next week?'*\n" \
                        "2. *'Who is the best supplier this month?'*\n" \
                        "3. *'Which warehouse has excess inventory?'*"
        recommendations = ["Click one of the suggested query chips in the chat widget to test live response generation."]
        
    return {
        "response": response_text,
        "chartData": chart_data,
        "chartType": chart_type,
        "recommendations": recommendations
    }
