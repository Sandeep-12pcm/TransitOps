function KPICard({ title, value, icon, color, change }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

          <p className="text-green-600 font-semibold mt-3">
            {change} this week
          </p>

        </div>

        <div
          className={`${color} w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

export default KPICard;