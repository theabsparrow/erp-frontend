import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Package,
  ShoppingCart,
  Users,
  Tag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { useGet } from "@/hooks/useGet";

import { DashboardSkeleton } from "./DashboardSkeleton";
import { StatCard } from "./StatCard";
import { ChartTooltip } from "./ChartTooltip";
import type { DashboardStats } from "@/types/stats.types";

const LOW_STOCK_THRESHOLD = 5;

export function HomeComponent() {
  const { data, isLoading, isError } = useGet<{data: DashboardStats}>(
    ["dashboard-stats"],
    "/dashboard/stats",
    { staleTime: 1000 * 60 * 2 },
  );

 const stats = data?.data as DashboardStats

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div className="bg-[#0f0f13] border border-red-500/20 rounded-2xl p-6 flex items-center gap-3">
        <AlertCircle size={20} className="text-red-400 shrink-0" />
        <p className="text-white text-sm">Failed to load dashboard stats</p>
      </div>
    );
  }

  const { overview, lowStockProducts, topSellingProducts, salesByDay } = stats;

  const chartData = salesByDay.map((d) => ({
    date: d._id.slice(5),
    Revenue: d.totalRevenue,
    Sales: d.totalSales,
  }));

  const topBarData = topSellingProducts.map((p) => ({
    name: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
    Sold: p.totalQuantitySold,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Business overview at a glance
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${overview.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          label="Total Orders"
          value={overview.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          color="bg-violet-500/15 text-violet-400"
          sub={`Avg $${overview.averageOrderValue}`}
        />
        <StatCard
          label="Total Products"
          value={overview.totalProducts.toLocaleString()}
          icon={Package}
          color="bg-sky-500/15 text-sky-400"
        />
        <StatCard
          label="Total Sales"
          value={overview.totalSales.toLocaleString()}
          icon={TrendingUp}
          color="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          label="Total Users"
          value={overview.totalUsers.toLocaleString()}
          icon={Users}
          color="bg-pink-500/15 text-pink-400"
        />
        <StatCard
          label="Categories"
          value={overview.totalCategories.toLocaleString()}
          icon={Tag}
          color="bg-indigo-500/15 text-indigo-400"
        />
        <StatCard
          label="Low Stock Items"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          color="bg-orange-500/15 text-orange-400"
          sub={`< ${LOW_STOCK_THRESHOLD} units`}
        />
        <StatCard
          label="Top Sellers"
          value={topSellingProducts.length}
          icon={Trophy}
          color="bg-yellow-500/15 text-yellow-400"
          sub="tracked products"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Area Chart */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Revenue — Last 7 Days
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily revenue trend
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
              $
              {overview.totalRevenue.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={55}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#10b981" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sales Bar Chart */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Sales Count — Last 7 Days
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Number of orders per day
              </p>
            </div>
            <span className="text-xs text-violet-400 font-medium bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-lg">
              {overview.totalSales} total
            </span>
          </div>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="Sales"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Sellers + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center shrink-0">
              <Trophy size={13} className="text-yellow-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Top Selling Products
            </h2>
          </div>

          {topSellingProducts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-600 text-sm gap-2">
              <Trophy size={24} />
              <span>No sales data yet</span>
            </div>
          ) : (
            <>
              <div className="px-5 pt-4">
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={topBarData} barSize={14} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      content={({ active, payload, label }) =>
                        active && payload?.length ? (
                          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
                            <p className="text-slate-400 mb-1">{label}</p>
                            <p className="text-yellow-400 font-medium">
                              {payload[0].value} units sold
                            </p>
                          </div>
                        ) : null
                      }
                    />
                    <Bar
                      dataKey="Sold"
                      fill="#eab308"
                      radius={[0, 4, 4, 0]}
                      fillOpacity={0.85}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-white/10 bg-white/2">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Sold
                      </th>
                      <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.map((p, i) => (
                      <tr
                        key={p._id}
                        className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 !== 0 ? "bg-white/2" : ""}`}
                      >
                        <td className="px-5 py-3">
                          <p className="text-sm text-white font-medium truncate max-w-40">
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            {p.sku}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            {p.totalQuantitySold}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-emerald-400 font-semibold text-sm">
                            ${p.totalRevenue.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={13} className="text-orange-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">
                Low Stock Alert
              </h2>
            </div>
            {lowStockProducts.length > 0 && (
              <span className="text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                {lowStockProducts.length} item
                {lowStockProducts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Package size={18} className="text-emerald-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium">
                All products well stocked
              </p>
              <p className="text-slate-600 text-xs">
                No items below {LOW_STOCK_THRESHOLD} units
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/2">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p, i) => {
                    const isOut = p.stockQuantity === 0;
                    return (
                      <tr
                        key={p._id}
                        className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 !== 0 ? "bg-white/2" : ""}`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package size={12} className="text-slate-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-white font-medium truncate max-w-40">
                                {p.name}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                {p.sku}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isOut
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full inline-block ${isOut ? "bg-red-400" : "bg-orange-400"}`}
                            />
                            {isOut ? "Out of stock" : `${p.stockQuantity} left`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
