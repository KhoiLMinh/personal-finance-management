import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import type { TrendData } from '../../types/dashboard';
import { formatCurrency, formatMillions } from '../../utils/format';
import { EmptyState } from '../ui/PageState';

interface Props {
  data: TrendData[];
  title?: string;
}

// Buckets are discrete (Tuần 1–5, Tháng 1–12), so grouped bars read better than a line.
export default function TrendChart({ data, title = 'Thu chi theo thời gian' }: Props) {
  const hasValues = data.some((d) => d.income > 0 || d.expense > 0);
  return (
    <section className="panel h-100">
      <div className="panel-header">
        <h2 className="panel-title">{title}</h2>
        <span className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>Đơn vị: triệu đồng</span>
      </div>
      <div className="panel-body">
        {!hasValues ? (
          <EmptyState title="Chưa có giao dịch trong kỳ này" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} barGap={2} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} tickFormatter={(v) => formatMillions(Number(v)).replace(' tr', '')} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                cursor={{ fill: 'var(--canvas)' }}
                formatter={(value, name) => [formatCurrency(Number(value)), name]}
                contentStyle={{ borderRadius: 8, borderColor: 'var(--line)', fontSize: 13 }}
              />
              {/* Recharts sorts legend items by name by default; keep the bar order (income, then expense) */}
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }} itemSorter={(item) => (item.dataKey === 'income' ? 0 : 1)} />
              <Bar dataKey="income" name="Thu nhập" fill="var(--income)" radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" name="Chi tiêu" fill="var(--ink-muted)" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
