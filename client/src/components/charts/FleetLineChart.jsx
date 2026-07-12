import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", value: 60 },
  { day: "Tue", value: 65 },
  { day: "Wed", value: 72 },
  { day: "Thu", value: 70 },
  { day: "Fri", value: 78 },
  { day: "Sat", value: 82 },
  { day: "Sun", value: 80 },
];

function FleetLineChart() {
  return (
    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-bold mb-5">

        Fleet Utilization

      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <LineChart data={data}>

          <XAxis dataKey="day"/>

          <YAxis/>

          <Tooltip/>

          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={4}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default FleetLineChart;