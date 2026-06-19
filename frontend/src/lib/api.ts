const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.warn(`API call failed for ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  login: (credentials: any) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (user: any) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(user) }),
  getMe: () => fetchAPI('/auth/me'),

  // Inventory Management
  getInventory: () => fetchAPI('/inventory'),
  createProduct: (p: any) => fetchAPI('/inventory/products', { method: 'POST', body: JSON.stringify(p) }),
  updateStock: (s: any) => fetchAPI('/inventory/stock', { method: 'PUT', body: JSON.stringify(s) }),
  getWarehouses: () => fetchAPI('/inventory/warehouses'),
  getLowStockAlerts: () => fetchAPI('/inventory/alerts'),
  getInventoryDoctor: () => fetchAPI('/inventory/ai-predict'),

  // Demand Forecasting
  getForecast: (productId?: string, days = 30) => fetchAPI(`/forecast?days=${days}${productId ? `&productId=${productId}` : ''}`),

  // Supplier Intelligence
  getSuppliers: () => fetchAPI('/suppliers'),
  createSupplier: (s: any) => fetchAPI('/suppliers/create', { method: 'POST', body: JSON.stringify(s) }),
  getSupplierLeaderboard: () => fetchAPI('/suppliers/leaderboard'),

  // Risk Radar
  getRisks: () => fetchAPI('/risks'),

  // Route Optimization
  optimizeRoute: (payload: any) => fetchAPI('/route-optimize', { method: 'POST', body: JSON.stringify(payload) }),

  // Digital Twin Simulator
  simulateTwin: (scenarioId: string) => fetchAPI('/twin/simulate', { method: 'POST', body: JSON.stringify({ scenarioId }) }),

  // AI Copilot
  askCopilot: (question: string) => fetchAPI('/copilot/ask', { method: 'POST', body: JSON.stringify({ question }) }),

  // Analytics & Scorecards
  getKPIs: () => fetchAPI('/analytics/kpis'),
  getLeakage: () => fetchAPI('/analytics/leakage'),
  getGreenMetrics: () => fetchAPI('/analytics/green'),

  // Reports
  exportReport: (payload: any) => fetchAPI('/reports/export', { method: 'POST', body: JSON.stringify(payload) }),
};
