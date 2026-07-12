import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { status: "Pending", trips: 10 },
  { status: "Running", trips: 42 },
  { status: "Completed", trips: 85 },
  { status: "Cancelled", trips: 6 },
];

function TripBarChart() {
  return (
    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-bold mb-5">

        Trip Status

      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <BarChart data={data}>

          <XAxis dataKey="status" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="trips"
            fill="#2563eb"
            radius={[8,8,0,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default TripBarChart;