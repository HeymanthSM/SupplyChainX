import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { getInventory, createProduct, updateStock, getWarehouses, getLowStockAlerts, getAIPredictions } from '../controllers/inventory.controller';
import { getSuppliers, createSupplier, getSupplierLeaderboard } from '../controllers/supplier.controller';
import { getForecast } from '../controllers/forecast.controller';
import { getRisks } from '../controllers/risk.controller';
import { optimizeDeliveryRoute } from '../controllers/route.controller';
import { simulateScenario } from '../controllers/twin.controller';
import { askCopilot } from '../controllers/copilot.controller';
import { getCostLeakages, getGreenMetrics, getAnalyticsKPIs, exportReport } from '../controllers/report.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateJWT, getMe);

// Inventory Routes (Readable by all, writable by ADMIN and WAREHOUSE_MANAGER)
router.get('/inventory', getInventory);
router.post('/inventory/products', authenticateJWT, requireRoles(['ADMIN', 'MANAGER', 'WAREHOUSE_MANAGER']), createProduct);
router.put('/inventory/stock', authenticateJWT, requireRoles(['ADMIN', 'MANAGER', 'WAREHOUSE_MANAGER']), updateStock);
router.get('/inventory/warehouses', getWarehouses);
router.get('/inventory/alerts', getLowStockAlerts);
router.get('/inventory/ai-predict', getAIPredictions);

// Supplier Routes
router.get('/suppliers', getSuppliers);
router.post('/suppliers/create', authenticateJWT, requireRoles(['ADMIN', 'MANAGER']), createSupplier);
router.get('/suppliers/leaderboard', getSupplierLeaderboard);

// Forecast Routes
router.get('/forecast', getForecast);

// Risk Radar Routes
router.get('/risks', getRisks);

// Route Optimizer Routes
router.post('/route-optimize', optimizeDeliveryRoute);

// Digital Twin Simulator
router.post('/twin/simulate', simulateScenario);

// AI Copilot
router.post('/copilot/ask', askCopilot);

// Analytics & Reports
router.get('/analytics/kpis', getAnalyticsKPIs);
router.get('/analytics/leakage', getCostLeakages);
router.get('/analytics/green', getGreenMetrics);
router.post('/reports/export', exportReport);

export default router;
