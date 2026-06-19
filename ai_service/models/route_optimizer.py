import numpy as np

class RouteOptimizer:
    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        """
        Calculate distance between two coordinates in kilometers
        """
        R = 6371.0 # Earth radius in km
        
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        
        a = np.sin(dlat / 2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        
        return R * c

    @staticmethod
    def optimize_route(locations, cost_per_liter=1.5, fuel_efficiency=0.35, speed_kmh=70):
        """
        locations: list of dicts: {"name": str, "lat": float, "lng": float}
        fuel_efficiency: liters per km (heavy duty diesel truck ~ 0.35 L/km)
        cost_per_liter: cost of fuel in USD
        speed_kmh: average speed in km/h
        """
        if len(locations) < 2:
            return {
                "route": locations,
                "metrics": {
                    "total_distance_km": 0,
                    "eta_hours": 0,
                    "fuel_consumed_liters": 0,
                    "fuel_cost_usd": 0,
                    "carbon_emissions_kg_co2": 0
                },
                "savings": {"cost_saved_usd": 0, "carbon_saved_kg": 0}
            }

        # Greedy nearest neighbor TSP solver
        unvisited = list(range(1, len(locations)))
        current_idx = 0
        optimized_indices = [0]
        
        total_distance = 0.0
        
        while unvisited:
            curr_loc = locations[current_idx]
            nearest_dist = float('inf')
            nearest_idx = -1
            
            for next_idx in unvisited:
                next_loc = locations[next_idx]
                dist = RouteOptimizer.haversine_distance(
                    curr_loc['lat'], curr_loc['lng'],
                    next_loc['lat'], next_loc['lng']
                )
                if dist < nearest_dist:
                    nearest_dist = dist
                    nearest_idx = next_idx
                    
            unvisited.remove(nearest_idx)
            optimized_indices.append(nearest_idx)
            total_distance += nearest_dist
            current_idx = nearest_idx
            
        # Return to start location (depot)
        depot_dist = RouteOptimizer.haversine_distance(
            locations[current_idx]['lat'], locations[current_idx]['lng'],
            locations[0]['lat'], locations[0]['lng']
        )
        total_distance += depot_dist
        optimized_indices.append(0)
        
        # Build optimized route list
        optimized_route = [locations[idx] for idx in optimized_indices]
        
        # Standard default route (as inputted in sequence) for comparison
        default_distance = 0.0
        for i in range(len(locations) - 1):
            default_distance += RouteOptimizer.haversine_distance(
                locations[i]['lat'], locations[i]['lng'],
                locations[i+1]['lat'], locations[i+1]['lng']
            )
        default_distance += RouteOptimizer.haversine_distance(
            locations[-1]['lat'], locations[-1]['lng'],
            locations[0]['lat'], locations[0]['lng']
        )
        
        # Metrics calculations
        fuel_consumed = total_distance * fuel_efficiency
        fuel_cost = fuel_consumed * cost_per_liter
        # 1 liter of diesel emits ~2.68 kg CO2
        co2_emitted = fuel_consumed * 2.68
        eta = (total_distance / speed_kmh) + (len(locations) * 0.75) # 45 mins loading time per stop
        
        # Compare with unoptimized (default) route
        default_fuel = default_distance * fuel_efficiency
        default_cost = default_fuel * cost_per_liter
        default_co2 = default_fuel * 2.68
        
        cost_saved = max(0.0, default_cost - fuel_cost)
        co2_saved = max(0.0, default_co2 - co2_emitted)
        dist_saved = max(0.0, default_distance - total_distance)
        
        return {
            "optimized_order": optimized_indices,
            "route": optimized_route,
            "metrics": {
                "total_distance_km": round(total_distance, 2),
                "eta_hours": round(eta, 2),
                "fuel_consumed_liters": round(fuel_consumed, 2),
                "fuel_cost_usd": round(fuel_cost, 2),
                "carbon_emissions_kg_co2": round(co2_emitted, 2)
            },
            "unoptimized_metrics": {
                "total_distance_km": round(default_distance, 2),
                "fuel_cost_usd": round(default_cost, 2),
                "carbon_emissions_kg_co2": round(default_co2, 2)
            },
            "savings": {
                "distance_saved_km": round(dist_saved, 2),
                "cost_saved_usd": round(cost_saved, 2),
                "carbon_saved_kg": round(co2_saved, 2),
                "efficiency_gain_pct": round((dist_saved / default_distance * 100) if default_distance > 0 else 0, 2)
            }
        }
