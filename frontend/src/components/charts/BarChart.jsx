import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const BarChart = ({
  data = [],
  xKey = 'name',
  yKey = 'value',
  height = 260,
  barColor = '#171717',
  secondaryKey = null,
  secondaryColor = '#858580',
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            itemStyle={{ color: '#FFFFFF' }}
          />
          {secondaryKey && <Legend wrapperStyle={{ fontSize: '11px', color: '#555550' }} />}
          <Bar dataKey={yKey} fill={barColor} radius={[4, 4, 0, 0]} />
          {secondaryKey && <Bar dataKey={secondaryKey} fill={secondaryColor} radius={[4, 4, 0, 0]} />}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;

