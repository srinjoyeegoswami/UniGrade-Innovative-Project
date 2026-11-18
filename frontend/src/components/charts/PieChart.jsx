import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const MONO_SHADES = ['#171717', '#404040', '#666666', '#8C8C8C', '#B3B3B3', '#D9D9D9'];

export const PieChart = ({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  height = 260,
  innerRadius = 55,
  outerRadius = 80,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#171717',
              borderColor: '#242424',
              borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#555550' }}
          />
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={MONO_SHADES[index % MONO_SHADES.length]} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;

