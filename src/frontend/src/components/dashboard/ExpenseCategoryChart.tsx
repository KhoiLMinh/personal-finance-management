import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import type { CategoryExpense } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';

interface Props {
  data: CategoryExpense[];
}

const FALLBACK_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function ExpenseCategoryChart({ data }: Props) {

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        fill: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      })),
    [data]
  );

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 rounded-4 h-100 shadow-soft">
        <Card.Body className="d-flex align-items-center justify-content-center text-muted p-4">
          Chưa có dữ liệu chi tiêu để hiển thị.
        </Card.Body>
      </Card>
    );
  }

  const handleTooltipFormatter = (value: ValueType, name: NameType) => {
    const numericValue = Array.isArray(value) ? Number(value[0]) : Number(value);
    return [formatCurrency(Number.isFinite(numericValue) ? numericValue : 0), name];
  };

  return (
    <Card className="border-0 rounded-4 h-100 shadow-soft">
      <Card.Body className="p-4">
        <h6 className="fw-bold text-dark mb-3">Chi tiêu theo danh mục</h6>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="totalAmount"
              nameKey="categoryName"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            />
            <Tooltip formatter={handleTooltipFormatter} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}