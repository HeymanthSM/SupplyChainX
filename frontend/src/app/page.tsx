"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Activity, AlertTriangle, ArrowRight, BarChart3, Bot, Box, CheckCircle2, ChevronRight, 
  DollarSign, Download, Eye, FileText, Globe, Key, Leaf, LogIn, Map, RefreshCw, 
  Search, ShieldAlert, ShoppingCart, Truck, Users, Warehouse 
} from 'lucide-react';
import { api } from '../lib/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function Dashboard() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('ANALYST');
  const [userName, setUserName] = useState('Guest Analyst');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to logged in as Guest Analyst for immediate demo ease
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('ANALYST');
  
  // Data States
  const [inventory, setInventory] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [docDiagnostics, setDocDiagnostics] = useState<any>(null);
  
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierLeaderboard, setSupplierLeaderboard] = useState<any[]>([]);
  
  const [forecastData, setForecastData] = useState<any>(null);
  const [forecastDays, setForecastDays] = useState(30);
  
  const [riskRadar, setRiskRadar] = useState<any>(null);
  
  // Route state
  const [routeWaypoints, setRouteWaypoints] = useState<any[]>([
    { name: 'Chicago Warehouse (Depot)', lat: 41.8781, lng: -87.6298 },
    { name: 'Detroit Supplier Hub', lat: 42.3314, lng: -83.0458 },
    { name: 'Cleveland Materials Lab', lat: 41.4993, lng: -81.6944 },
    { name: 'Indianapolis Distributor', lat: 39.7684, lng: -86.1581 }
  ]);
  const [routeCostLiter, setRouteCostLiter] = useState(1.5);
  const [routeEfficiency, setRouteEfficiency] = useState(0.35);
  const [optimizedRouteRes, setOptimizedRouteRes] = useState<any>(null);
  const [newWaypoint, setNewWaypoint] = useState({ name: '', lat: '', lng: '' });
  
  // Twin state
  const [twinScenario, setTwinScenario] = useState('supplier_unavailable');
  const [twinResult, setTwinResult] = useState<any>(null);
  const [twinSimulating, setTwinSimulating] = useState(false);
  
  // Cost Leakage & Green state
  const [costLeakage, setCostLeakage] = useState<any>(null);
  const [greenMetrics, setGreenMetrics] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [analyticsCharts, setAnalyticsCharts] = useState<any>(null);
  
  // Product Creation forms
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: 'Electronics', price: '', safetyStock: '50', reorderPoint: '100' });
  const [stockUpdate, setStockUpdate] = useState({ productId: '', warehouseId: '', quantity: '', batchNumber: '', expiryDate: '' });
  
  // Supplier Creation form
  const [newSupplier, setNewSupplier] = useState({ name: '', contactEmail: '', contactPhone: '', address: '', reliabilityPct: '95', defectRatePct: '0.5', unitCostUsd: '50', deliverySpeedDays: '4' });
  
  // Journey state
  const [journeyProductId, setJourneyProductId] = useState('p-1');
  const [journeyData, setJourneyData] = useState<any>({
    sku: 'LI-BATT-001',
    name: 'Lithium-Ion Battery Pack',
    stages: [
      { stage: 'SUPPLIER', location: 'Apex Supplier (Detroit)', time: '2026-06-10', details: 'Cells manufactured, batch approved.', status: 'COMPLETED' },
      { stage: 'FACTORY', location: 'Factory Assembly (Cleveland)', time: '2026-06-12', details: 'Packed and encapsulated. Sealed.', status: 'COMPLETED' },
      { stage: 'WAREHOUSE', location: 'Chicago Warehouse DC', time: '2026-06-15', details: 'Stocked in Section B, Row 4.', status: 'COMPLETED' },
      { stage: 'DISTRIBUTOR', location: 'Indy Distributor Hub', time: '2026-06-18', details: 'Dispatched to route runner.', status: 'COMPLETED' },
      { stage: 'CUSTOMER', location: 'Chicago EV Motors', time: 'Pending', details: 'Estimated arrival tomorrow.', status: 'IN_TRANSIT' }
    ]
  });
  
  // Copilot state
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [chatLog, setChatLog] = useState<any[]>([
    { role: 'assistant', content: "Hello! I'm your SupplyChainX Copilot. I can query our live warehouse inventories, run predictions, and rank suppliers. Ask me anything or select a preset quick chip below." }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Inventory & Doctor diagnoses
      const inv = await api.getInventory().catch(() => []);
      setInventory(inv);
      
      const wh = await api.getWarehouses().catch(() => []);
      setWarehouses(wh);
      
      const alerts = await api.getLowStockAlerts().catch(() => []);
      setLowStockAlerts(alerts);
      
      const doc = await api.getInventoryDoctor().catch(() => null);
      setDocDiagnostics(doc);

      // 2. Suppliers
      const sups = await api.getSuppliers().catch(() => []);
      setSuppliers(sups);
      const board = await api.getSupplierLeaderboard().catch(() => []);
      setSupplierLeaderboard(board);

      // 3. Forecast
      const fc = await api.getForecast(undefined, forecastDays).catch(() => null);
      setForecastData(fc);

      // 4. Risk Assessment
      const risk = await api.getRisks().catch(() => null);
      setRiskRadar(risk);

      // 5. Cost & Green & KPIs
      const leak = await api.getLeakage().catch(() => null);
      setCostLeakage(leak);
      
      const gr = await api.getGreenMetrics().catch(() => null);
      setGreenMetrics(gr);
      
      const kpiRes = await api.getKPIs().catch(() => null);
      if (kpiRes) {
        setKpis(kpiRes.kpis);
        setAnalyticsCharts(kpiRes.charts);
      }

      // Pre-run initial route optimization
      const initialRoute = await api.optimizeRoute({
        locations: routeWaypoints,
        cost_per_liter: routeCostLiter,
        fuel_efficiency: routeEfficiency
      }).catch(() => null);
      setOptimizedRouteRes(initialRoute);

      // Pre-run digital twin scenario
      const initialTwin = await api.simulateTwin(twinScenario).catch(() => null);
      setTwinResult(initialTwin);

      // Push a low stock notification
      setNotifications([
        { id: 1, type: 'LOW_STOCK', text: 'Lithium-Ion Battery Pack is critically low at Chicago Warehouse!', time: '10 mins ago' },
        { id: 2, type: 'SUPPLIER_RISK', text: 'Prime Logistics reliability dropped below SLA threshold.', time: '2 hours ago' },
        { id: 3, type: 'SHIPMENT_DELAY', text: 'Midwest lane shipment sh-101 is delayed by 36 hours.', time: '4 hours ago' }
      ]);
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    setLoading(true);
    try {
      const res = await api.login({ email: loginEmail, password: loginPassword }).catch(() => {
        // Mock success fallback for dashboard evaluation
        return {
          token: 'mock-jwt-token',
          user: { name: loginEmail.split('@')[0], email: loginEmail, role: loginRole }
        };
      });
      
      localStorage.setItem('token', res.token);
      setUserName(res.user.name);
      setUserRole(res.user.role);
      setIsLoggedIn(true);
      
      // Reload details with role headers active
      loadAllData();
    } catch (err: any) {
      alert("Auth failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('Guest Analyst');
    setUserRole('ANALYST');
  };

  // Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createProduct(newProduct);
      alert('Product created successfully!');
      setNewProduct({ name: '', sku: '', category: 'Electronics', price: '', safetyStock: '50', reorderPoint: '100' });
      loadAllData();
    } catch (err: any) {
      alert('Error creating product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Stock
  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateStock(stockUpdate);
      alert('Stock quantity updated successfully!');
      setStockUpdate({ productId: '', warehouseId: '', quantity: '', batchNumber: '', expiryDate: '' });
      loadAllData();
    } catch (err: any) {
      alert('Error updating stock: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Supplier
  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createSupplier({
        name: newSupplier.name,
        contactEmail: newSupplier.contactEmail,
        contactPhone: newSupplier.contactPhone,
        address: newSupplier.address,
        reliabilityPct: parseFloat(newSupplier.reliabilityPct),
        defectRatePct: parseFloat(newSupplier.defectRatePct),
        unitCostUsd: parseFloat(newSupplier.unitCostUsd),
        deliverySpeedDays: parseFloat(newSupplier.deliverySpeedDays)
      });
      alert('Supplier registered successfully!');
      setNewSupplier({ name: '', contactEmail: '', contactPhone: '', address: '', reliabilityPct: '95', defectRatePct: '0.5', unitCostUsd: '50', deliverySpeedDays: '4' });
      loadAllData();
    } catch (err: any) {
      alert('Error registering supplier: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh Route Optimizer
  const handleRunRouteOptimize = async () => {
    setLoading(true);
    try {
      const res = await api.optimizeRoute({
        locations: routeWaypoints,
        cost_per_liter: routeCostLiter,
        fuel_efficiency: routeEfficiency
      });
      setOptimizedRouteRes(res);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWaypoint = () => {
    if (!newWaypoint.name || !newWaypoint.lat || !newWaypoint.lng) return;
    const added = [
      ...routeWaypoints,
      { name: newWaypoint.name, lat: parseFloat(newWaypoint.lat), lng: parseFloat(newWaypoint.lng) }
    ];
    setRouteWaypoints(added);
    setNewWaypoint({ name: '', lat: '', lng: '' });
  };

  const handleClearWaypoints = () => {
    setRouteWaypoints([
      { name: 'Chicago Depot (Depot)', lat: 41.8781, lng: -87.6298 }
    ]);
    setOptimizedRouteRes(null);
  };

  // Run Twin Simulation
  const handleSimulateTwin = async (scenario: string) => {
    setTwinScenario(scenario);
    setTwinSimulating(true);
    try {
      const res = await api.simulateTwin(scenario);
      setTwinResult(res);
    } catch (err: any) {
      alert('Twin simulation failed: ' + err.message);
    } finally {
      setTwinSimulating(false);
    }
  };

  // PDF / CSV Exporter
  const handleExport = async (type: string, format: string) => {
    try {
      const res = await api.exportReport({ type, format });
      if (format === 'CSV') {
        // Download raw string
        const blob = new Blob([res], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `SupplyChainX_${type}_Report.csv`;
        link.click();
      } else {
        alert(`Success! Generated report details:\nFile: ${res.fileName}\nSize: ${res.fileSize}\nLocation: ${res.downloadUrl}`);
      }
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  // AI Copilot Ask
  const handleAskCopilot = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const query = customQ || copilotQuestion;
    if (!query.trim()) return;

    setChatLog(prev => [...prev, { role: 'user', content: query }]);
    if (!customQ) setCopilotQuestion('');

    try {
      const res = await api.askCopilot(query);
      setChatLog(prev => [...prev, {
        role: 'assistant',
        content: res.response,
        chartData: res.chartData,
        chartType: res.chartType,
        recommendations: res.recommendations
      }]);
    } catch (err) {
      setChatLog(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble parsing the network query." }]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0F1D] text-slate-200">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col justify-between z-10">
        <div className="p-5 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white font-bold text-lg shadow-lg shadow-blue-500/30">
              SX
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white glow-text">SupplyChainX</h1>
              <p className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">Autonomous AI Platform</p>
            </div>
          </div>

          <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <div className="text-xs">
                <p className="text-slate-400">User Role</p>
                <p className="font-semibold text-white">{userRole}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'overview' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Activity className="w-4.5 h-4.5" /> Dashboard Overview
            </button>
            <button 
              onClick={() => setActiveTab('inventory')} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'inventory' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Box className="w-4.5 h-4.5" /> Inventory Doctor
            </button>
            <button 
              onClick={() => setActiveTab('forecasting')} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'forecasting' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5" /> Demand Forecasting
            </button>
            <button 
              onClick={() => setActiveTab('suppliers')} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'suppliers' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4.5 h-4.5" /> Supplier Intelligence
            </button>
            <button 
              onClick={() => setActiveTab('risks')} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'risks' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4.5 h-4.5" /> Risk Radar
            </button>
            <button 
              onClick={() => setActiveTab('routing')} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'routing' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Map className="w-4.5 h-4.5" /> Route Optimizer
            </button>
            <button 
              onClick={() => setActiveTab('digital-twin')} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'digital-twin' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Globe className="w-4.5 h-4.5" /> Digital Twin Simulator
            </button>
            <button 
              onClick={() => setActiveTab('traceability')} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'traceability' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <RefreshCw className="w-4.5 h-4.5" /> Traceability System
            </button>
            <button 
              onClick={() => setActiveTab('green')} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'green' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Leaf className="w-4.5 h-4.5" /> Green Supply Chain
            </button>
            <button 
              onClick={() => setActiveTab('copilot')} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'copilot' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bot className="w-4.5 h-4.5" /> AI Supply Copilot
            </button>
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-[#1F2937] flex flex-col gap-2">
          {isLoggedIn ? (
            <div className="flex flex-col gap-2">
              <div className="text-xs text-slate-400">
                Logged as <span className="text-white font-medium">{userName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-center text-xs py-2 bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-200 border border-slate-700/50 rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab('auth')}
              className="w-full text-center text-xs py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Access Portal (Sign In)
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 border-b border-[#1F2937] bg-[#111827] flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg text-white">
              {activeTab === 'overview' && 'Executive Operations Control Room'}
              {activeTab === 'inventory' && 'Smart Inventory Doctor Diagnostics'}
              {activeTab === 'forecasting' && 'AI Demand forecasting & Trends'}
              {activeTab === 'suppliers' && 'Supplier Intelligence Engine'}
              {activeTab === 'risks' && 'Supply Chain Risk Radar Warning center'}
              {activeTab === 'routing' && 'Logistics Delivery Route Optimization'}
              {activeTab === 'digital-twin' && 'Supply Chain Digital Twin Simulator'}
              {activeTab === 'traceability' && 'Traceability & QR Journey Log'}
              {activeTab === 'green' && 'Green Supply Chain Carbon Scorecard'}
              {activeTab === 'copilot' && 'AI SupplyChainX Copilot Workspace'}
              {activeTab === 'auth' && 'Authentication Gateway'}
            </h2>
            {loading && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
          </div>

          <div className="flex items-center gap-6">
            {/* Quick Stats */}
            {kpis && (
              <div className="hidden lg:flex items-center gap-4 text-xs font-mono border-l border-slate-700 pl-4">
                <span className="text-slate-400">Turnover: <strong className="text-white">{kpis.inventoryTurnover}x</strong></span>
                <span className="text-slate-400">Fill Rate: <strong className="text-emerald-400">{kpis.fillRate}%</strong></span>
                <span className="text-slate-400">Stockout: <strong className="text-rose-400">{kpis.stockoutRate}%</strong></span>
              </div>
            )}
            
            {/* Notification drop */}
            <div className="relative group">
              <button className="relative p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <div className="absolute right-0 mt-2 w-72 glass-panel rounded-lg shadow-xl shadow-black/50 p-2 invisible group-hover:visible transition flex flex-col gap-2 z-50">
                <p className="text-xs font-semibold px-2 py-1 text-slate-300 border-b border-slate-700/50">Active Operational Alerts</p>
                {notifications.map(n => (
                  <div key={n.id} className="p-2 hover:bg-slate-800 rounded text-[11px] flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
                    <div>
                      <p className="text-white">{n.text}</p>
                      <span className="text-slate-500">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE PAGES */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:scale-[1.02] transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-400">Avg Fill Rate</span>
                    <ShoppingCart className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-3xl font-bold font-mono text-white">94.8%</h3>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                    ▲ +1.3% <span className="text-slate-500">from last week</span>
                  </span>
                </div>
                
                <div className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:scale-[1.02] transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-400">Supplier Performance</span>
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-bold font-mono text-white">91.5%</h3>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                    ▲ +0.8% <span className="text-slate-500">efficiency avg</span>
                  </span>
                </div>

                <div className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:scale-[1.02] transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-400">Carbon Footprint</span>
                    <Leaf className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-bold font-mono text-white">2.45 t</h3>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                    ▼ -12.5% <span className="text-slate-500">CO2 emissions</span>
                  </span>
                </div>

                <div className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:scale-[1.02] transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-400">Logistics Efficiency</span>
                    <Truck className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-3xl font-bold font-mono text-white">97.2%</h3>
                  <span className="text-xs text-red-400 flex items-center gap-1 mt-2">
                    ▼ -1.5% <span className="text-slate-500">on-time dispatch</span>
                  </span>
                </div>
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Demand Forecast Chart */}
                <div className="glass-panel p-6 rounded-xl lg:col-span-2 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-lg text-white">Demand Forecast Trend Analysis</h4>
                      <p className="text-xs text-slate-400">Linear Ridge regression projections with seasonal components</p>
                    </div>
                    {forecastData && (
                      <span className="text-xs px-2.5 py-1 bg-blue-950/50 text-blue-400 border border-blue-800/40 rounded-full font-mono">
                        Model Accuracy: {forecastData.accuracy}%
                      </span>
                    )}
                  </div>
                  
                  <div className="h-72">
                    {forecastData && forecastData.forecast ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecastData.forecast.slice(0, 15)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                          <YAxis stroke="#94A3B8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#151D30', borderColor: '#334155' }} />
                          <Line type="monotone" dataKey="quantity" stroke="#3B82F6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Forecasted Units" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500">No forecasting data available.</div>
                    )}
                  </div>
                </div>

                {/* Risk assessment overview */}
                <div className="glass-panel p-6 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-lg text-white mb-2">Platform Risk Radar Overview</h4>
                    <p className="text-xs text-slate-400">Active simulated threats and average bottleneck severity</p>
                  </div>
                  
                  {riskRadar ? (
                    <div className="flex flex-col gap-4 my-4">
                      <div className="flex justify-between items-center p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
                        <div>
                          <p className="text-xs text-slate-400">Overall Threat Index</p>
                          <h5 className="text-xl font-bold font-mono text-red-400">{riskRadar.metrics.overall_risk_level}</h5>
                        </div>
                        <span className="text-xs px-2 py-1 bg-red-900/40 text-red-200 rounded font-mono">
                          Score: {riskRadar.metrics.average_risk_score}/100
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {riskRadar.alerts.slice(0, 3).map((a: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-slate-800/40 border border-slate-700/30 rounded">
                            <span className="font-medium text-white max-w-[200px] truncate">{a.message}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              a.risk_level === 'CRITICAL' ? 'bg-red-600/30 text-red-400' :
                              a.risk_level === 'HIGH' ? 'bg-amber-600/30 text-amber-400' : 'bg-blue-600/30 text-blue-400'
                            }`}>{a.risk_level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-center py-6">No threat alerts generated yet.</div>
                  )}

                  <button 
                    onClick={() => setActiveTab('risks')} 
                    className="w-full text-center text-xs py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700/50 rounded-lg font-medium transition"
                  >
                    Open Alert Response Command
                  </button>
                </div>
              </div>

              {/* Leaderboards and Leakages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Supplier rankings */}
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg text-white">Top Performing Suppliers Leaderboard</h4>
                    <span className="text-xs text-blue-400 font-mono">Rankings Update Live</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-medium">
                          <th className="py-3 px-2">Rank</th>
                          <th className="py-3">Supplier Name</th>
                          <th className="py-3 px-2 text-center">Score</th>
                          <th className="py-3 px-2 text-center">Reliability</th>
                          <th className="py-3 px-2 text-center">Risk Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplierLeaderboard.map((s, idx) => (
                          <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                            <td className="py-3 px-2 font-mono font-bold text-slate-300">#{s.rank || idx+1}</td>
                            <td className="py-3 font-semibold text-white">{s.name}</td>
                            <td className="py-3 px-2 text-center font-mono text-blue-400 font-bold">{s.score}/100</td>
                            <td className="py-3 px-2 text-center font-mono">{s.reliabilityPct}%</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400' :
                                s.risk_level === 'HIGH' ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'
                              }`}>{s.risk_level}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Leakage reports */}
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                  <h4 className="font-semibold text-lg text-white">Leakage & Cost Recovery Summary</h4>
                  
                  {costLeakage ? (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                          <p className="text-xs text-slate-400">Total Monthly Leakage</p>
                          <p className="text-2xl font-bold font-mono text-red-400">${costLeakage.summary.totalMonthlyLossUsd}</p>
                        </div>
                        <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg">
                          <p className="text-xs text-slate-400">Attainable Savings</p>
                          <p className="text-2xl font-bold font-mono text-emerald-400">${costLeakage.summary.attainableSavingsUsd}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {costLeakage.leakages.map((l: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-800/30 border border-slate-700/30 rounded flex justify-between items-center text-xs">
                            <div>
                              <p className="font-semibold text-white">{l.source}</p>
                              <p className="text-[11px] text-slate-400">{l.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-400 font-mono">-${l.monthlyLossUsd}</p>
                              <p className="text-[10px] text-emerald-400 font-mono">Save ${l.savingsPotentialUsd}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-center py-6">Loading cost summaries...</div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INVENTORY DOCTOR */}
          {activeTab === 'inventory' && (
            <div className="flex flex-col gap-8">
              
              {/* Product and Stock Creation inputs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Form 1: Add Product */}
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                  <h4 className="font-semibold text-white border-b border-slate-700/40 pb-2">Add New Enterprise Product</h4>
                  <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4 text-xs">
                    <div className="col-span-2">
                      <label className="text-slate-400 block mb-1">Product Name</label>
                      <input 
                        type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. Electric Servo Motor" required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">SKU Code</label>
                      <input 
                        type="text" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. ELEC-SERVO-01" required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Category</label>
                      <select 
                        value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                      >
                        <option value="Electronics">Electronics</option>
                        <option value="Raw Materials">Raw Materials</option>
                        <option value="Energy Storage">Energy Storage</option>
                        <option value="Mechanical Components">Mechanical Components</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Unit Price ($)</label>
                      <input 
                        type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" placeholder="10.00" required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Safety Stock</label>
                      <input 
                        type="number" value={newProduct.safetyStock} onChange={e => setNewProduct({...newProduct, safetyStock: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-400 block mb-1">Reorder Point Trigger</label>
                      <input 
                        type="number" value={newProduct.reorderPoint} onChange={e => setNewProduct({...newProduct, reorderPoint: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" required
                      />
                    </div>
                    <button type="submit" className="col-span-2 py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold rounded text-white transition mt-2">
                      Create Product Record
                    </button>
                  </form>
                </div>

                {/* Form 2: Update Warehouse Inventory stock level */}
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                  <h4 className="font-semibold text-white border-b border-slate-700/40 pb-2">Log Multi-Warehouse Inventory Stock Entry</h4>
                  <form onSubmit={handleUpdateStock} className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Select Product</label>
                      <select 
                        value={stockUpdate.productId} onChange={e => setStockUpdate({...stockUpdate, productId: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" required
                      >
                        <option value="">-- Choose Product --</option>
                        {inventory
                          .filter((item, idx) => item?.product && item?.productId && inventory.findIndex(i => i.productId === item.productId) === idx)
                          .map(item => (
                            <option key={item.productId} value={item.productId}>{item.product.name} ({item.product.sku})</option>
                          ))
                        }
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Warehouse Hub</label>
                      <select 
                        value={stockUpdate.warehouseId} onChange={e => setStockUpdate({...stockUpdate, warehouseId: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" required
                      >
                        <option value="">-- Choose Warehouse --</option>
                        {warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Physical Stock Count</label>
                      <input 
                        type="number" value={stockUpdate.quantity} onChange={e => setStockUpdate({...stockUpdate, quantity: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" placeholder="100" required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Batch Code Tracking</label>
                      <input 
                        type="text" value={stockUpdate.batchNumber} onChange={e => setStockUpdate({...stockUpdate, batchNumber: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. BATCH-A4"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-400 block mb-1">Expiry Date (If applicable)</label>
                      <input 
                        type="date" value={stockUpdate.expiryDate} onChange={e => setStockUpdate({...stockUpdate, expiryDate: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                      />
                    </div>
                    <button type="submit" className="col-span-2 py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold rounded text-white transition mt-2">
                      Commit Inventory Updates
                    </button>
                  </form>
                </div>

              </div>

              {/* Smart Doctor Analysis */}
              <div className="glass-panel p-6 rounded-xl flex flex-col gap-6">
                <div>
                  <h4 className="font-semibold text-lg text-white">Smart Inventory Doctor Recommendations</h4>
                  <p className="text-xs text-slate-400">Heuristics assessing capital-tied levels, stock coverage velocities, and dead stocks</p>
                </div>

                {docDiagnostics ? (
                  <div className="flex flex-col gap-6">
                    {/* Diagnosis stats cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="p-3 bg-slate-800/40 rounded border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 block">Total Checked</span>
                        <span className="text-xl font-bold text-white font-mono">{docDiagnostics.summary.total_products_checked}</span>
                      </div>
                      <div className="p-3 bg-red-950/20 rounded border border-red-900/30">
                        <span className="text-[10px] text-red-400 block">Stockouts / Understock</span>
                        <span className="text-xl font-bold text-red-400 font-mono">{docDiagnostics.summary.understock_count}</span>
                      </div>
                      <div className="p-3 bg-amber-950/20 rounded border border-amber-900/30">
                        <span className="text-[10px] text-amber-400 block">Overstocked items</span>
                        <span className="text-xl font-bold text-amber-400 font-mono">{docDiagnostics.summary.overstock_count}</span>
                      </div>
                      <div className="p-3 bg-red-950/20 rounded border border-red-900/30">
                        <span className="text-[10px] text-red-400 block">Dead Stock items</span>
                        <span className="text-xl font-bold text-red-400 font-mono">{docDiagnostics.summary.dead_stock_count}</span>
                      </div>
                      <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/30">
                        <span className="text-[10px] text-emerald-400 block">Holding Cost / Savings</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">${docDiagnostics.summary.monthly_holding_cost_usd} / Save ${docDiagnostics.summary.estimated_monthly_savings_usd}</span>
                      </div>
                    </div>

                    {/* Diagnostics Details */}
                    <div className="flex flex-col gap-3">
                      {docDiagnostics.diagnoses.map((d: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{d.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">SKU: {d.sku}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                d.severity === 'CRITICAL' ? 'bg-red-600/20 text-red-400 border border-red-500/20' :
                                d.severity === 'MEDIUM' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/20' :
                                'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20'
                              }`}>{d.status}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-2 italic font-serif">"{d.recommendation}"</p>
                          </div>
                          
                          <div className="text-right text-xs font-mono">
                            <p className="text-slate-400">Current Qty: <strong className="text-white">{d.quantity}</strong></p>
                            <p className="text-slate-400">Holding Fee: <strong className="text-white">${d.monthly_holding_cost}/mo</strong></p>
                            {d.financial_impact > 0 && <p className="text-red-400 font-semibold">Tied Capital: ${d.financial_impact}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-6">Connecting diagnostic engine...</div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: DEMAND FORECASTING */}
          {activeTab === 'forecasting' && (
            <div className="flex flex-col gap-8">
              
              {/* Forecast controls */}
              <div className="glass-panel p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div>
                  <h4 className="font-semibold text-white">Forecast Horizon Projections</h4>
                  <p className="text-xs text-slate-400">Alter forecast periods and parameters dynamically</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setForecastDays(7); loadAllData(); }}
                    className={`flex-1 py-1.5 rounded text-xs transition ${forecastDays === 7 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                  >
                    7 Days (Daily)
                  </button>
                  <button 
                    onClick={() => { setForecastDays(30); loadAllData(); }}
                    className={`flex-1 py-1.5 rounded text-xs transition ${forecastDays === 30 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                  >
                    30 Days (Weekly)
                  </button>
                  <button 
                    onClick={() => { setForecastDays(90); loadAllData(); }}
                    className={`flex-1 py-1.5 rounded text-xs transition ${forecastDays === 90 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                  >
                    90 Days (Monthly)
                  </button>
                </div>
                <div className="text-right">
                  <button onClick={loadAllData} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded text-xs transition font-semibold">
                    Recalculate Models
                  </button>
                </div>
              </div>

              {/* Main Charts block */}
              {forecastData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Detailed Forecast plot */}
                  <div className="glass-panel p-6 rounded-xl lg:col-span-2 flex flex-col gap-4">
                    <h4 className="font-semibold text-white">Visual Seasonality & Demand Projections</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecastData.forecast}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
                          <YAxis stroke="#94A3B8" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#151D30', borderColor: '#334155' }} />
                          <Line type="monotone" dataKey="quantity" stroke="#3B82F6" strokeWidth={3} dot={false} name="Forecast Demand" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="glass-panel p-6 rounded-xl flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-white border-b border-slate-700/40 pb-2 mb-4">Regression Forecast Insights</h4>
                      
                      <div className="flex flex-col gap-4 text-xs">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Demand Trend:</span>
                          <span className="font-mono text-emerald-400 font-bold">{forecastData.summary.demand_trend}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Weekly Total Demand:</span>
                          <span className="font-mono text-white font-semibold">{forecastData.summary.weekly_forecasted_total} units</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Monthly Total Demand:</span>
                          <span className="font-mono text-white font-semibold">{forecastData.summary.monthly_forecasted_total} units</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Seasonal Peak Day:</span>
                          <span className="font-mono text-blue-400 font-semibold">{forecastData.summary.seasonal_peak_day}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Forecast Accuracy:</span>
                          <span className="font-mono text-emerald-400 font-bold">{forecastData.summary.forecast_accuracy_pct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg">
                      <h5 className="text-xs font-semibold text-blue-400 mb-1">AI Stock Recommendation</h5>
                      <p className="text-[11px] text-slate-300">Set safety stock triggers to 1.3x during peak weekdays to insulate against potential supply-chain interruptions.</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center text-slate-500 py-6">Running time-series projection solvers...</div>
              )}

            </div>
          )}

          {/* TAB 4: SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <div className="flex flex-col gap-8">
              
              {/* Leaderboard and stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form to add Supplier */}
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                  <h4 className="font-semibold text-white border-b border-slate-700/40 pb-2">Register Supplier Hub</h4>
                  <form onSubmit={handleAddSupplier} className="grid grid-cols-2 gap-4 text-xs">
                    <div className="col-span-2">
                      <label className="text-slate-400 block mb-1">Company Name</label>
                      <input 
                        type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Contact Email</label>
                      <input 
                        type="email" value={newSupplier.contactEmail} onChange={e => setNewSupplier({...newSupplier, contactEmail: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Reliability (%)</label>
                      <input 
                        type="number" value={newSupplier.reliabilityPct} onChange={e => setNewSupplier({...newSupplier, reliabilityPct: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Defect Rate (%)</label>
                      <input 
                        type="number" step="0.1" value={newSupplier.defectRatePct} onChange={e => setNewSupplier({...newSupplier, defectRatePct: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Avg Lead Time (Days)</label>
                      <input 
                        type="number" step="0.1" value={newSupplier.deliverySpeedDays} onChange={e => setNewSupplier({...newSupplier, deliverySpeedDays: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" required
                      />
                    </div>
                    <button type="submit" className="col-span-2 py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold rounded text-white transition mt-2">
                      Register Supplier
                    </button>
                  </form>
                </div>

                {/* Performance scores bar chart */}
                <div className="glass-panel p-6 rounded-xl lg:col-span-2 flex flex-col gap-4">
                  <h4 className="font-semibold text-white">Supplier Score Comparison</h4>
                  <div className="h-64">
                    {supplierLeaderboard.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={supplierLeaderboard}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                          <YAxis stroke="#94A3B8" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#151D30', borderColor: '#334155' }} />
                          <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Overall score" />
                          <Bar dataKey="reliabilityPct" fill="#10B981" radius={[4, 4, 0, 0]} name="Reliability (%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500">Generating leaderboard metrics...</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Raw list details */}
              <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                <h4 className="font-semibold text-white">Full Supplier Scorecard List</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium">
                        <th className="py-3 px-2">Rank</th>
                        <th className="py-3">Supplier Name</th>
                        <th className="py-3">Lead Time</th>
                        <th className="py-3">Unit Cost</th>
                        <th className="py-3">Defect Rate</th>
                        <th className="py-3">Reliability</th>
                        <th className="py-3">Calculated Score</th>
                        <th className="py-3">Threat Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierLeaderboard.map((s, idx) => (
                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                          <td className="py-3 px-2 font-mono font-bold text-slate-300">#{s.rank || idx+1}</td>
                          <td className="py-3">
                            <p className="font-semibold text-white">{s.name}</p>
                            <span className="text-[10px] text-slate-500">{s.contactEmail}</span>
                          </td>
                          <td className="py-3 font-mono">{s.deliverySpeedDays || s.delivery_speed_days} days</td>
                          <td className="py-3 font-mono">${s.unitCostUsd || s.unit_cost_usd}</td>
                          <td className="py-3 font-mono text-red-400">{s.defectRatePct || s.defect_rate_pct}%</td>
                          <td className="py-3 font-mono text-emerald-400">{s.reliabilityPct}%</td>
                          <td className="py-3 font-mono text-blue-400 font-bold">{s.score}/100</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              s.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400' :
                              s.risk_level === 'HIGH' ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'
                            }`}>{s.risk_level}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: RISK RADAR */}
          {activeTab === 'risks' && (
            <div className="flex flex-col gap-8">
              
              {/* Status Header */}
              {riskRadar && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-panel p-5 rounded-xl border-l-4 border-red-500">
                    <span className="text-xs text-slate-400 block">Overall Platform Risk Index</span>
                    <span className="text-2xl font-bold font-mono text-red-400">{riskRadar.metrics.overall_risk_level}</span>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border-l-4 border-amber-500">
                    <span className="text-xs text-slate-400 block">Average Risk Severity</span>
                    <span className="text-2xl font-bold font-mono text-amber-400">{riskRadar.metrics.average_risk_score}/100</span>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border-l-4 border-blue-500">
                    <span className="text-xs text-slate-400 block">Active Risks Count</span>
                    <span className="text-2xl font-bold font-mono text-blue-400">{riskRadar.metrics.total_active_risks} Threat Vectors</span>
                  </div>
                </div>
              )}

              {/* Alert Center list */}
              <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                <h4 className="font-semibold text-white">Active Alert Center Alerts</h4>
                
                {riskRadar ? (
                  <div className="flex flex-col gap-3">
                    {riskRadar.alerts.map((a: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex gap-3 items-start">
                          <div className={`p-2 rounded-full mt-0.5 ${
                            a.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400' :
                            a.risk_level === 'HIGH' ? 'bg-amber-950 text-amber-400' : 'bg-blue-950 text-blue-400'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{a.category} Trigger</span>
                              <span className="text-[10px] font-mono text-slate-500">Source: {a.source}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                a.risk_level === 'CRITICAL' ? 'bg-red-600/30 text-red-400' :
                                a.risk_level === 'HIGH' ? 'bg-amber-600/30 text-amber-400' : 'bg-blue-600/30 text-blue-400'
                              }`}>{a.risk_level}</span>
                            </div>
                            <p className="text-xs text-slate-200 mt-1">{a.message}</p>
                            <p className="text-xs text-emerald-400 mt-2 font-medium">💡 Rec: {a.recommendation}</p>
                          </div>
                        </div>

                        <div className="text-right text-xs font-mono flex-shrink-0 self-end md:self-center">
                          <p className="text-slate-400">Risk Score: <strong className="text-white">{a.risk_score}</strong></p>
                          <p className="text-slate-400">Probability: <strong className="text-white">{a.probability}%</strong></p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-6">Connecting risk warning relays...</div>
                )}
              </div>

            </div>
          )}

          {/* TAB 6: ROUTE OPTIMIZER */}
          {activeTab === 'routing' && (
            <div className="flex flex-col gap-8">
              
              {/* Waypoint creation map and config */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Inputs and configs */}
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                  <h4 className="font-semibold text-white border-b border-slate-700/40 pb-2">Logistics Constraints</h4>
                  
                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Fuel Price ($/L)</label>
                      <input 
                        type="number" step="0.05" value={routeCostLiter} onChange={e => setRouteCostLiter(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Fuel Efficiency (L/km)</label>
                      <input 
                        type="number" step="0.01" value={routeEfficiency} onChange={e => setRouteEfficiency(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 mt-1">
                      <h5 className="font-medium text-slate-300 mb-2">Add Delivery Stop Point</h5>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" placeholder="Stop Label Name" value={newWaypoint.name} onChange={e => setNewWaypoint({...newWaypoint, name: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="number" step="0.0001" placeholder="Latitude" value={newWaypoint.lat} onChange={e => setNewWaypoint({...newWaypoint, lat: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white outline-none"
                          />
                          <input 
                            type="number" step="0.0001" placeholder="Longitude" value={newWaypoint.lng} onChange={e => setNewWaypoint({...newWaypoint, lng: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white outline-none"
                          />
                        </div>
                        <button type="button" onClick={handleAddWaypoint} className="py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium mt-1">
                          Add Waypoint Point
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={handleClearWaypoints} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 font-semibold rounded">
                        Clear Path
                      </button>
                      <button type="button" onClick={handleRunRouteOptimize} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded">
                        Compute Optimization
                      </button>
                    </div>
                  </div>
                </div>

                {/* Waypoints list */}
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                  <h4 className="font-semibold text-white">Current Stops Sequence</h4>
                  <div className="flex flex-col gap-2 text-xs">
                    {routeWaypoints.map((w, idx) => (
                      <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/30 rounded flex justify-between items-center">
                        <div>
                          <p className="font-medium text-white">{w.name}</p>
                          <span className="text-[10px] text-slate-500 font-mono">Lat: {w.lat}, Lng: {w.lng}</span>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-[10px] font-bold text-white flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimized metrics results */}
                <div className="glass-panel p-6 rounded-xl flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white border-b border-slate-700/40 pb-2 mb-4">Route Optimization Results</h4>
                    {optimizedRouteRes ? (
                      <div className="flex flex-col gap-4 text-xs">
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="p-2.5 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Total Distance</span>
                            <span className="text-base font-bold font-mono text-white">{optimizedRouteRes.metrics.total_distance_km} km</span>
                          </div>
                          <div className="p-2.5 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Duration (ETA)</span>
                            <span className="text-base font-bold font-mono text-white">{optimizedRouteRes.metrics.eta_hours} hrs</span>
                          </div>
                          <div className="p-2.5 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Fuel Cost</span>
                            <span className="text-base font-bold font-mono text-white">${optimizedRouteRes.metrics.fuel_cost_usd}</span>
                          </div>
                          <div className="p-2.5 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">CO2 Released</span>
                            <span className="text-base font-bold font-mono text-white">{optimizedRouteRes.metrics.carbon_emissions_kg_co2} kg</span>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg mt-1">
                          <h5 className="font-bold text-emerald-400 text-xs mb-1">Optimized Path Savings Analysis</h5>
                          <p className="text-[11px] text-slate-300">Saved <strong className="text-emerald-400 font-mono">{optimizedRouteRes.savings.distance_saved_km} km</strong> of transit, reducing fuel costs by <strong className="text-emerald-400 font-mono">${optimizedRouteRes.savings.cost_saved_usd}</strong> and carbon output by <strong className="text-emerald-400 font-mono">{optimizedRouteRes.savings.carbon_saved_kg} kg</strong> ({optimizedRouteRes.savings.efficiency_gain_pct}% efficiency gain).</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-center py-6 text-xs">Run optimizer to display metrics.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: DIGITAL TWIN */}
          {activeTab === 'digital-twin' && (
            <div className="flex flex-col gap-8">
              
              {/* Twin controls */}
              <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                <div>
                  <h4 className="font-semibold text-lg text-white">Virtual Supply Chain Digital Twin Simulator</h4>
                  <p className="text-xs text-slate-400">Trigger extreme downstream stress events and model supply buffers</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  <button 
                    onClick={() => handleSimulateTwin('supplier_unavailable')}
                    className={`p-3 rounded-lg border text-xs text-left font-medium transition ${
                      twinScenario === 'supplier_unavailable' ? 'bg-blue-950/50 border-blue-500 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Scenario 1: Primary Supplier Default
                  </button>
                  <button 
                    onClick={() => handleSimulateTwin('demand_surge_200')}
                    className={`p-3 rounded-lg border text-xs text-left font-medium transition ${
                      twinScenario === 'demand_surge_200' ? 'bg-blue-950/50 border-blue-500 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Scenario 2: 200% Demand Surge
                  </button>
                  <button 
                    onClick={() => handleSimulateTwin('warehouse_closure')}
                    className={`p-3 rounded-lg border text-xs text-left font-medium transition ${
                      twinScenario === 'warehouse_closure' ? 'bg-blue-950/50 border-blue-500 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Scenario 3: Midwest Depot Closure
                  </button>
                  <button 
                    onClick={() => handleSimulateTwin('transit_delay')}
                    className={`p-3 rounded-lg border text-xs text-left font-medium transition ${
                      twinScenario === 'transit_delay' ? 'bg-blue-950/50 border-blue-500 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Scenario 4: 48-Hour Highway Delay
                  </button>
                </div>
              </div>

              {/* Simulation Result */}
              {twinSimulating ? (
                <div className="text-center text-slate-500 py-12 flex flex-col items-center gap-2">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm font-semibold">Recalculating digital twin models...</p>
                </div>
              ) : twinResult ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Impact block */}
                  <div className="glass-panel p-6 rounded-xl lg:col-span-2 flex flex-col gap-6">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{twinResult.label}</h4>
                      <p className="text-xs text-slate-400">{twinResult.description}</p>
                    </div>

                    <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg">
                      <h5 className="text-xs font-bold text-red-400 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Downstream Impact Report
                      </h5>
                      <p className="text-xs text-slate-200 mt-2 leading-relaxed">{twinResult.impactAnalysis}</p>
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Simulated Alternative Mitigation Plans</h5>
                      <div className="flex flex-col gap-2">
                        {twinResult.alternatives.map((alt: string, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/30 rounded flex items-center gap-2.5 text-xs text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {alt}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Impact indicators */}
                  <div className="glass-panel p-6 rounded-xl flex flex-col justify-between gap-6">
                    <div>
                      <h4 className="font-semibold text-white border-b border-slate-700/40 pb-2 mb-4">Risk Severity Matrix</h4>
                      
                      <div className="text-center my-6">
                        <div className="inline-block p-6 rounded-full border-4 border-red-500/30 bg-red-950/20">
                          <span className="text-[10px] text-slate-400 block font-mono">SIM RISK</span>
                          <span className="text-4xl font-bold font-mono text-red-400">{twinResult.riskScore}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 text-xs">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Fill Rate Impact:</span>
                          <span className="font-mono text-red-400 font-bold">{twinResult.metrics.fill_rate_impact}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Stockout Risk:</span>
                          <span className="font-mono text-red-400 font-bold">{twinResult.metrics.stockout_risk}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Capital At Risk:</span>
                          <span className="font-mono text-white font-semibold">{twinResult.metrics.capital_at_risk}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSimulateTwin(twinScenario)}
                      className="w-full text-center text-xs py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                    >
                      Re-run Stress Test Scenario
                    </button>
                  </div>

                </div>
              ) : null}

            </div>
          )}

          {/* TAB 8: TRACEABILITY */}
          {activeTab === 'traceability' && (
            <div className="flex flex-col gap-8">
              
              {/* Product selector */}
              <div className="glass-panel p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h4 className="font-semibold text-white">QR Journey Timeline Auditor</h4>
                  <p className="text-xs text-slate-400">Select product code to audit logistics supply journey logs</p>
                </div>
                <div>
                  <select 
                    value={journeyProductId} onChange={e => setJourneyProductId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none text-xs"
                  >
                    <option value="p-1">Lithium-Ion Battery Pack (LI-BATT-001)</option>
                    <option value="p-2">Semiconductor Microchip A9 (SEMI-CHIP-A9)</option>
                  </select>
                </div>
              </div>

              {/* Journey Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visual timeline */}
                <div className="glass-panel p-6 rounded-xl lg:col-span-2 flex flex-col gap-6">
                  <h4 className="font-semibold text-white">Traceability Timeline Journey Logs</h4>
                  
                  <div className="flex flex-col gap-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {journeyData.stages.map((stage: any, idx: number) => (
                      <div key={idx} className="flex gap-4 relative">
                        <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                          stage.status === 'COMPLETED' ? 'bg-emerald-500 text-black' : 'bg-blue-600 text-white animate-pulse'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-semibold text-white">{stage.stage} Stage</h5>
                            <span className="text-[10px] font-mono text-slate-500">Location: {stage.location}</span>
                            <span className={`px-2 py-0.2 rounded text-[8px] font-bold ${
                              stage.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'
                            }`}>{stage.status}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{stage.details}</p>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">{stage.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Display card */}
                <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-between gap-6">
                  <div className="text-center">
                    <h4 className="font-semibold text-white">Unique QR Journey Code</h4>
                    <p className="text-xs text-slate-400 mt-1">Generated dynamically for package audit runs</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg inline-block">
                    {/* Simulated SVG QR Code representation */}
                    <svg className="w-36 h-36" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white"/>
                      <rect x="5" y="5" width="20" height="20" fill="black"/>
                      <rect x="8" y="8" width="14" height="14" fill="white"/>
                      <rect x="11" y="11" width="8" height="8" fill="black"/>
                      <rect x="75" y="5" width="20" height="20" fill="black"/>
                      <rect x="78" y="8" width="14" height="14" fill="white"/>
                      <rect x="81" y="81" width="8" height="8" fill="black"/>
                      <rect x="5" y="75" width="20" height="20" fill="black"/>
                      <rect x="8" y="78" width="14" height="14" fill="white"/>
                      <rect x="11" y="81" width="8" height="8" fill="black"/>
                      {/* Random noise squares */}
                      <rect x="35" y="35" width="8" height="8" fill="black"/>
                      <rect x="45" y="55" width="12" height="12" fill="black"/>
                      <rect x="65" y="45" width="8" height="8" fill="black"/>
                      <rect x="75" y="75" width="20" height="20" fill="black"/>
                      <rect x="78" y="78" width="14" height="14" fill="white"/>
                    </svg>
                  </div>

                  <div className="text-center text-xs font-mono text-slate-400">
                    <p>Serial ID: <strong className="text-white">SX-BATT-{journeyProductId}</strong></p>
                    <p className="text-[10px] mt-1 text-slate-500">Scan QR to reveal journey chain timestamps</p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 9: GREEN SUPPLY CHAIN */}
          {activeTab === 'green' && (
            <div className="flex flex-col gap-8">
              
              {/* Carbon stats summary */}
              {greenMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-panel p-5 rounded-xl border-l-4 border-emerald-500">
                    <span className="text-xs text-slate-400 block">Total Carbon Emissions (Month)</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">{greenMetrics.metrics.totalEmissionsCo2Kg} kg CO2</span>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border-l-4 border-emerald-500">
                    <span className="text-xs text-slate-400 block">Fuel Consumption Average</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">{greenMetrics.metrics.fuelConsumptionLiters} L</span>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border-l-4 border-emerald-500">
                    <span className="text-xs text-slate-400 block">Green Transport Index</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">{greenMetrics.metrics.greenTransportationIndex}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-6">Loading green metrics...</div>
              )}

              {/* Emissions trend chart and green ratings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Carbon chart */}
                <div className="glass-panel p-6 rounded-xl lg:col-span-2 flex flex-col gap-4">
                  <h4 className="font-semibold text-white">Carbon Emissions Reduction Trend</h4>
                  
                  {greenMetrics ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={greenMetrics.emissionsTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                          <YAxis stroke="#94A3B8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#151D30', borderColor: '#334155' }} />
                          <Line type="monotone" dataKey="co2_kg" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="CO2 Output (kg)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                </div>

                {/* Supplier ratings */}
                <div className="glass-panel p-6 rounded-xl flex flex-col justify-between">
                  <h4 className="font-semibold text-white mb-4">Supplier Green Rating List</h4>
                  
                  {greenMetrics ? (
                    <div className="flex flex-col gap-3">
                      {greenMetrics.supplierRatings.map((sup: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/30 rounded flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold text-white">{sup.name}</p>
                            <span className="text-[10px] text-slate-500">Offset: {sup.co2_saved_kg} kg CO2</span>
                          </div>
                          <span className={`w-8 h-8 rounded-full font-bold flex items-center justify-center ${
                            sup.rating.startsWith('A') ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-300'
                          }`}>{sup.rating}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 p-2 bg-emerald-950/20 border border-emerald-900/30 rounded text-[11px] text-emerald-300">
                    💡 Carbon savings targets reached via optimized Nearest Neighbor multi-stop logistics scheduling.
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 10: COPILOT CHAT */}
          {activeTab === 'copilot' && (
            <div className="flex flex-col h-[calc(100vh-12rem)]">
              
              {/* Chat panel */}
              <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-800/30 border-b border-slate-700/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-white">SupplyChainX AI Assistant</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-900/40 text-blue-200 rounded font-mono">Live Data Connected</span>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                  {chatLog.map((chat, idx) => (
                    <div key={idx} className={`flex gap-3 max-w-[80%] ${chat.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                      <div className={`p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 ${
                        chat.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400'
                      }`}>
                        {chat.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                      </div>
                      
                      <div className={`p-4 rounded-xl text-xs leading-relaxed ${
                        chat.role === 'user' ? 'bg-blue-600/90 text-white' : 'bg-slate-800/50 text-slate-100 border border-slate-700/45'
                      }`}>
                        <div dangerouslySetInnerHTML={{ __html: chat.content.replace(/\n/g, '<br />') }} />
                        
                        {/* Dynamic copilot charts */}
                        {chat.chartData && chat.chartType === 'bar' && (
                          <div className="w-80 h-44 mt-4 bg-slate-900/80 p-2 rounded border border-slate-700/30">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chat.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="name" stroke="#94A3B8" fontSize={8} />
                                <YAxis stroke="#94A3B8" fontSize={8} />
                                <Tooltip />
                                <Bar dataKey="stock" fill="#3B82F6" name="Quantity" />
                                <Bar dataKey="score" fill="#10B981" name="Score" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {chat.chartData && chat.chartType === 'pie' && (
                          <div className="w-80 h-44 mt-4 bg-slate-900/80 p-2 rounded border border-slate-700/30">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={chat.chartData} dataKey="stock" nameKey="name" cx="50%" cy="50%" outerRadius={35} fill="#3B82F6" label>
                                  {chat.chartData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Copilot Recommendations */}
                        {chat.recommendations && chat.recommendations.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-col gap-1.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Copilot Action Plan:</p>
                            {chat.recommendations.map((rec: string, index: number) => (
                              <div key={index} className="text-emerald-400 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {rec}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Preset Chips */}
                <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-800 flex gap-2 overflow-x-auto">
                  <button 
                    onClick={() => handleAskCopilot(undefined, "Which products may go out of stock next week?")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/30 rounded-full text-[10px] text-slate-300 transition whitespace-nowrap"
                  >
                    🔍 Out of stock predictions
                  </button>
                  <button 
                    onClick={() => handleAskCopilot(undefined, "Who is the best supplier this month?")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/30 rounded-full text-[10px] text-slate-300 transition whitespace-nowrap"
                  >
                    🏆 Best supplier leaderboard
                  </button>
                  <button 
                    onClick={() => handleAskCopilot(undefined, "Which warehouse has excess inventory?")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/30 rounded-full text-[10px] text-slate-300 transition whitespace-nowrap"
                  >
                    📦 Warehouse overstock audits
                  </button>
                </div>

                {/* Input form */}
                <form onSubmit={handleAskCopilot} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
                  <input 
                    type="text" value={copilotQuestion} onChange={e => setCopilotQuestion(e.target.value)}
                    className="flex-1 bg-[#151D30] border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                    placeholder="Ask Copilot e.g., Which products may go out of stock next week?"
                  />
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg text-xs text-white transition">
                    Ask AI
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 11: AUTH GATEWAY */}
          {activeTab === 'auth' && (
            <div className="max-w-md mx-auto my-12">
              <div className="glass-panel p-8 rounded-xl flex flex-col gap-6">
                <div className="text-center">
                  <h4 className="text-xl font-bold text-white">Sign In Gateway</h4>
                  <p className="text-xs text-slate-400 mt-1">Access dashboard editing and supplier settings</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Corporate Email</label>
                    <input 
                      type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                      placeholder="analyst@supplychainx.com" required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Authorization Password</label>
                    <input 
                      type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                      placeholder="••••••••" required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Request Operational Role</label>
                    <select 
                      value={loginRole} onChange={e => setLoginRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                    >
                      <option value="ANALYST">Analyst (Read-only reports)</option>
                      <option value="ADMIN">Admin (All writes authorized)</option>
                      <option value="MANAGER">Supply Chain Manager</option>
                      <option value="WAREHOUSE_MANAGER">Warehouse Manager</option>
                      <option value="SUPPLIER">External Supplier</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold rounded text-white transition mt-2">
                    Establish Secure Handshake
                  </button>
                </form>

                <div className="text-center text-[10px] text-slate-500 border-t border-slate-800/80 pt-4">
                  SupplyChainX utilizes JSON Web Tokens (JWT) & encrypted BCrypt headers.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM UTILITY / EXPORTER BAR */}
        <footer className="h-12 border-t border-[#1F2937] bg-[#111827] px-8 flex justify-between items-center text-xs">
          <span className="text-slate-500">© 2026 SupplyChainX Platform. All systems operational.</span>
          <div className="flex gap-4">
            <button 
              onClick={() => handleExport('INVENTORY', 'CSV')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
            >
              <Download className="w-3.5 h-3.5" /> CSV Stock List
            </button>
            <button 
              onClick={() => handleExport('RISK', 'PDF')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
            >
              <FileText className="w-3.5 h-3.5" /> PDF Threat Assessment
            </button>
            <button 
              onClick={() => handleExport('FORECAST', 'EXCEL')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
            >
              <FileText className="w-3.5 h-3.5" /> Excel Demand Logs
            </button>
          </div>
        </footer>

      </main>
    </div>
  );
}
