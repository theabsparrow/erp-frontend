// ── Dashboard Stats ───────────────────────────────────────────────────────────
export interface StatsOverview {
  totalProducts: number;
  totalSales: number;
  totalUsers: number;
  totalCategories: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  image?: string;
}

export interface TopSellingProduct {
  _id: string;
  name: string;
  sku: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface SalesByDay {
  _id: string; // "YYYY-MM-DD"
  totalSales: number;
  totalRevenue: number;
}

export interface DashboardStats {
  overview: StatsOverview;
  lowStockProducts: LowStockProduct[];
  topSellingProducts: TopSellingProduct[];
  salesByDay: SalesByDay[];
}

// ── Legacy / Other ────────────────────────────────────────────────────────────
export interface RevenueDataResponse {
  totalRevenue: number;
  data: { month: string; revenue: number; year?: string }[];
}

export interface ConversionData {
  date: string;
  conversionRate: number;
}

export interface OrderStatusItem {
  displayName: string;
  percentage: number;
  count: number;
  color: string;
  status: string;
}

export interface OrderStatusData {
  data: OrderStatusItem[];
}
