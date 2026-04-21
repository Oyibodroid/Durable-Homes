'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'

// ── Revenue Line Chart ────────────────────────────────────────────────────────

interface RevenueDataPoint {
  date: string
  revenue: number
}

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
          labelStyle={{ color: '#111827', fontWeight: 600 }}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#C9A84C"
          strokeWidth={2.5}
          dot={{ fill: '#C9A84C', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Orders by Status Donut Chart ──────────────────────────────────────────────

interface StatusDataPoint {
  name: string
  value: number
  color: string
}

export function OrderStatusChart({ data }: { data: StatusDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [value, name]}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Top Products Bar Chart ────────────────────────────────────────────────────

interface ProductDataPoint {
  name: string
  revenue: number
}

export function TopProductsChart({ data }: { data: ProductDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          formatter={(value: number) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Bar dataKey="revenue" fill="#1a1208" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}