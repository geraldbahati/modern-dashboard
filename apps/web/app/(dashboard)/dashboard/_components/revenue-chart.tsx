"use client";

import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";

const data = [
  { name: "Product", value: 20000 },
  { name: "Services", value: 25000 },
  { name: "Consulting", value: 45000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-card rounded-3xl p-6 border border-white/5 mb-6">
      <h3 className="font-semibold mb-1">Revenue Analytics</h3>
      <p className="text-xs text-gray-500 mb-6">
        Revenue breakdown by category
      </p>

      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorVal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
        <div>
          <div className="text-lg font-bold">$193,390</div>
          <div className="text-xs text-gray-500">Total Revenue</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-400">+13.9%</div>
          <div className="text-xs text-gray-500">Avg Growth</div>
        </div>
      </div>
    </div>
  );
}
