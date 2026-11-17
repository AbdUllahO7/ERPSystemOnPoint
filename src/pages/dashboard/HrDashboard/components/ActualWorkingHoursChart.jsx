import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from '@/context/translate-api';
import { translateErp } from '@/lib/erp-i18n';

export default function ActualWorkingHoursChart({ data }) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  if (!data) return null;

  const chartData = isAr
    ? data.map((item) => ({
        ...item,
        monthName: translateErp(item.monthName, locale),
      }))
    : data;

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{fill: '#a0aec0', fontSize: 10}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#a0aec0', fontSize: 12}} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
          <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#22c55e' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
