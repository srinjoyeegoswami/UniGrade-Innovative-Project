import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AreaChart = ({
  data = [],
  xKey = 'name',
  yKey = 'value',
  height = 260,
  strokeColor = '#171717',
  fillColor = '#EAEAE7',
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EAEAE7" vertical={false} />
          <XAxis dataKey={xKey} stroke="#858580" fontSize={11} tickLine={false} />
          <YAxis stroke="#858580" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#171717',
              borderColor: '#242424',
              borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '12px',
            }}
          />
          <Area type="monotone" dataKey={yKey} stroke={strokeColor} fill="url(#areaGradient)" strokeWidth={2} />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;

