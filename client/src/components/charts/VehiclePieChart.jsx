import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Available", value: 85 },
  { name: "On Trip", value: 42 },
  { name: "Maintenance", value: 15 },
  { name: "Retired", value: 8 },
];

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
];

function VehiclePieChart() {
  return (
    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-bold mb-5">
        Vehicle Status
      </h2>

      <ResponsiveContainer width="100%" height={300}>

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            outerRadius={110}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

    </div>
  );
}

export default VehiclePieChart;