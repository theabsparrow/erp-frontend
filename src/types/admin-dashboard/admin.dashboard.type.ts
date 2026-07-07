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
