"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type StatusPoint = { label: string; count: number; color: string };

function StatusTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: StatusPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-sm font-semibold text-foreground">
        {point.count} order{point.count === 1 ? "" : "s"}
      </p>
      <p className="text-xs text-muted-foreground">{point.label}</p>
    </div>
  );
}

export function OrderStatusChart({ data }: { data: StatusPoint[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      className="h-56 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: -28, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          />
          <YAxis hide allowDecimals={false} />
          <Tooltip content={<StatusTooltip />} cursor={{ fill: "var(--color-surface)" }} />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((point) => (
              <Cell key={point.label} fill={point.color} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              fill="var(--color-muted-foreground)"
              fontSize={11}
              formatter={(value?: React.ReactNode) => (Number(value) > 0 ? String(value) : "")}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
