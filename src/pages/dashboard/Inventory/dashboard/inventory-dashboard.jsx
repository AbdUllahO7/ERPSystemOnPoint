import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getInventoryKpiCards, 
  getInventoryCategoryDistribution, 
  getInventoryStockMovement, 
  getInventoryTopTrendingProducts, 
  getInventoryStockAlerts 
} from '@/lib/api';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { 
  ImageOff, DollarSign, BoxSelect, Pause, Layers, Play, StopCircle, CalendarPlus, 
  ArrowUp, ArrowDown
} from 'lucide-react';
import { useI18n } from '@/context/translate-api';
import { translateErp } from '@/lib/erp-i18n';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF2', '#F28C8C', '#8CF2A5'];

export default function InventoryDashboard() {
  const { locale, t } = useI18n();
  const isAr = locale === "ar";

  const { data: kpiDataRes, isLoading: kpiLoading } = useQuery({
    queryKey: ['inventoryKpiCards'],
    queryFn: getInventoryKpiCards,
  });

  const { data: categoryDistRes, isLoading: categoryDistLoading } = useQuery({
    queryKey: ['inventoryCategoryDistribution'],
    queryFn: getInventoryCategoryDistribution,
  });

  const { data: stockMovementRes, isLoading: stockMovementLoading } = useQuery({
    queryKey: ['inventoryStockMovement'],
    queryFn: getInventoryStockMovement,
  });

  const { data: topTrendingRes, isLoading: topTrendingLoading } = useQuery({
    queryKey: ['inventoryTopTrendingProducts'],
    queryFn: () => getInventoryTopTrendingProducts({ PageNumber: 1, PageSize: 10 }),
  });

  const { data: stockAlertsRes, isLoading: stockAlertsLoading } = useQuery({
    queryKey: ['inventoryStockAlerts'],
    queryFn: () => getInventoryStockAlerts({ PageNumber: 1, PageSize: 10 }),
  });

  const kpiData = kpiDataRes?.data || {};
  const categoryDist = categoryDistRes?.data || [];
  const stockMovement = stockMovementRes?.data || [];
  const topTrending = topTrendingRes?.data?.items || [];
  const stockAlerts = stockAlertsRes?.data?.items || [];

  const renderPercentage = (value) => {
    if (value === undefined || value === null) return null;
    const isPositive = value > 0;
    const isZero = value === 0;
    return (
      <span className={`text-xs font-bold ${isAr ? 'mr-2' : 'ml-2'} ${isPositive ? 'text-green-500' : isZero ? 'text-slate-400' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{value}%
      </span>
    );
  };

  const CardSkeleton = () => (
    <div className="bg-white p-4 rounded-xl border shadow-sm animate-pulse h-24"></div>
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen pb-20">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {t("inventory.dashboard.title")}
        </h1>
        <div className="w-5 h-5 bg-slate-300 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">i</div>
      </div>

      {/* Product Intelligence Dashboard */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-3">
          {t("inventory.dashboard.productIntelligence")}
        </h2>
        
        {kpiLoading ? <CardSkeleton /> : (
          <div className="bg-white rounded-xl p-4 border shadow-sm flex items-center justify-center mb-4">
            <span className={`text-slate-600 font-semibold ${isAr ? 'ml-4' : 'mr-4'}`}>
              {t("inventory.dashboard.productDataAccuracy")}
            </span>
            <span className="text-xl font-bold">{kpiData.productDataAccuracyPercentage || 0}%</span>
            <ArrowUp className={`w-5 h-5 text-green-500 ${isAr ? 'mr-2' : 'ml-2'}`} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <ImageOff className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 font-medium">
                {t("inventory.dashboard.productsWithoutImages")}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-slate-800">0</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 font-medium">
                {t("inventory.dashboard.productsWithoutPrice")}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-slate-800">{kpiData.productsWithoutPrice?.totalCount || 0}</span>
                {renderPercentage(kpiData.productsWithoutPrice?.percentageChange)}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white">
              <BoxSelect className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 font-medium">
                {t("inventory.dashboard.uncategorizedProducts")}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-slate-800">{kpiData.uncategorizedProducts?.totalCount || 0}</span>
                {renderPercentage(kpiData.uncategorizedProducts?.percentageChange)}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm border-red-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white">
              <Pause className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 font-medium">
                {t("inventory.dashboard.inactiveProducts")}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-slate-800">{kpiData.inactiveProducts?.totalCount || 0}</span>
                {renderPercentage(kpiData.inactiveProducts?.percentageChange)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Insights */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-700 mb-3">
          {t("inventory.dashboard.productInsights")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 font-medium">
                {t("inventory.dashboard.totalProducts")}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-slate-800">{kpiData.totalProducts?.totalCount || 0}</span>
                {renderPercentage(kpiData.totalProducts?.percentageChange)}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
              <Play className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 font-medium">
                {t("inventory.dashboard.activeProducts")}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-slate-800">{kpiData.activeProducts?.totalCount || 0}</span>
                {renderPercentage(kpiData.activeProducts?.percentageChange)}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <StopCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 font-medium">
                {t("inventory.dashboard.discontinuedProducts")}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-slate-800">{kpiData.discontinuedProducts?.totalCount || 0}</span>
                {renderPercentage(kpiData.discontinuedProducts?.percentageChange)}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <CalendarPlus className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 font-medium">
                {t("inventory.dashboard.productsAddedThisMonth")}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-slate-800">{kpiData.productsAddedThisMonth?.totalCount || 0}</span>
                {renderPercentage(kpiData.productsAddedThisMonth?.percentageChange)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Product Distribution By Category */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-3">
            {t("inventory.dashboard.distributionByCategory")}
          </h2>
          <div className="bg-white p-6 rounded-xl border shadow-sm h-[350px] flex items-center">
            {categoryDistLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-100 rounded-lg"></div>
            ) : categoryDist.length === 0 ? (
              <div className="w-full text-center text-slate-400">
                {t("inventory.dashboard.noData")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="percentage"
                    nameKey="label"
                  >
                    {categoryDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value, name, props) => [`${value}%`, props.payload.label]} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Latest Activities */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-3">
            {t("inventory.dashboard.latestActivities")}
          </h2>
          <div className="bg-white p-6 rounded-xl border shadow-sm h-[350px] overflow-y-auto space-y-4 flex items-center justify-center">
             <div className="text-sm text-slate-500 italic text-center py-10">
               {t("inventory.dashboard.noRecentActivities")}
             </div>
          </div>
        </div>
      </div>

      {/* Inbound vs outbound by category */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-700 mb-3">
          {t("inventory.dashboard.inboundVsOutbound")}
        </h2>
        <div className="bg-white p-6 rounded-xl border shadow-sm h-[400px]">
          {stockMovementLoading ? (
            <div className="w-full h-full animate-pulse bg-slate-100 rounded-lg"></div>
          ) : stockMovement.length === 0 ? (
             <div className="w-full h-full flex items-center justify-center text-slate-400">
               {t("inventory.dashboard.noData")}
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stockMovement}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="categoryName" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="inbound" name={t("inventory.dashboard.inbound")} fill="#0070F3" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="outbound" name={t("inventory.dashboard.outbound")} fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        {/* Top 10 Best Sellers */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-3">
            {t("inventory.dashboard.topSellers")}
          </h2>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${isAr ? 'text-right' : 'text-left'}`}>
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="py-4 px-6 w-16">#</th>
                    <th className="py-4 px-6">{t("inventory.dashboard.product")}</th>
                    <th className="py-4 px-6">{t("inventory.dashboard.sold")}</th>
                    <th className="py-4 px-6">{t("inventory.dashboard.revenue")}</th>
                    <th className="py-4 px-6 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topTrendingLoading ? (
                    <tr><td colSpan="5" className="py-8 text-center text-slate-400">{t("inventory.dashboard.loading")}</td></tr>
                  ) : topTrending.length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-slate-400">{t("inventory.dashboard.noData")}</td></tr>
                  ) : (
                    topTrending.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-4 px-6 text-slate-500">{idx + 1}</td>
                        <td className="py-4 px-6 font-medium">{item.material_Name}</td>
                        <td className="py-4 px-6">{item.sold_Qty}</td>
                        <td className="py-4 px-6 font-medium text-emerald-600">{item.revenue}</td>
                        <td className="py-4 px-6">
                          {item.trend_Is_Up ? 
                            <ArrowUp className="w-4 h-4 text-green-500" /> : 
                            <ArrowDown className="w-4 h-4 text-red-500" />
                          }
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Critical Stock Levels */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-3">
            {t("inventory.dashboard.criticalStock")}
          </h2>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${isAr ? 'text-right' : 'text-left'}`}>
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="py-4 px-6 w-16">#</th>
                    <th className="py-4 px-6">{t("inventory.dashboard.product")}</th>
                    <th className="py-4 px-6 text-center">{t("inventory.dashboard.stock")}</th>
                    <th className="py-4 px-6 text-center">{t("inventory.dashboard.min")}</th>
                    <th className="py-4 px-6 w-16 text-center">{t("inventory.dashboard.deficiency")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stockAlertsLoading ? (
                    <tr><td colSpan="5" className="py-8 text-center text-slate-400">{t("inventory.dashboard.loading")}</td></tr>
                  ) : stockAlerts.length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-slate-400">{t("inventory.dashboard.noStockAlerts")}</td></tr>
                  ) : (
                    stockAlerts.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-4 px-6 text-slate-500">{idx + 1}</td>
                        <td className="py-4 px-6 font-medium">{item.material_Name}</td>
                        <td className="py-4 px-6 text-center font-bold text-red-500">{item.current_Quantity}</td>
                        <td className="py-4 px-6 text-center">{item.minimum_Inventory}</td>
                        <td className="py-4 px-6 text-center font-bold text-orange-500">{item.deficiency}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
