import React from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import type { TrendData } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';

interface Props {
  data: TrendData[];
}
//FR-12
export default function TrendChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 rounded-4 h-100 shadow-soft">
        <Card.Body className="d-flex align-items-center justify-content-center text-muted p-4">
          Chưa có dữ liệu xu hướng để hiển thị.
        </Card.Body>
      </Card>
    );
  }

  const handleTooltipFormatter = (value: ValueType, name: NameType) => {
    const numericValue = Array.isArray(value) ? Number(value[0]) : Number(value);
    return [formatCurrency(Number.isFinite(numericValue) ? numericValue : 0), name];
  };

  const handleYAxisFormatter = (value: number | string) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? `${numericValue / 1000000}tr` : String(value);
  };

  return (
    <Card className="border-0 rounded-4 h-100 shadow-soft">
      <Card.Body className="p-4">
        <h6 className="fw-bold text-dark mb-3">Xu hướng thu chi</h6>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={handleYAxisFormatter} />
            <Tooltip formatter={handleTooltipFormatter} />
            <Legend />
            <Line type="monotone" dataKey="income" name="Thu nhập" stroke="#16a34a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="expense" name="Chi tiêu" stroke="#dc2626" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}