import {
  FaTruck,
  FaChartPie,
  FaCar,
  FaUsers,
  FaRoute,
  FaTools,
  FaGasPump,
  FaChartLine,
} from "react-icons/fa";

const menuItems = [
  {
    name: "Dashboard",
    icon: <FaChartPie />,
    active: true,
  },
  {
    name: "Vehicles",
    icon: <FaCar />,
  },
  {
    name: "Drivers",
    icon: <FaUsers />,
  },
  {
    name: "Trips",
    icon: <FaRoute />,
  },
  {
    name: "Maintenance",
    icon: <FaTools />,
  },
  {
    name: "Fuel & Expenses",
    icon: <FaGasPump />,
  },
  {
    name: "Reports",
    icon: <FaChartLine />,
  },
];

function Sidebar() {
  return (
    <aside className="w-72 bg-slate-900 text-white min-h-screen flex flex-col">

      <div className="flex items-center gap-3 px-6 py-7 border-b border-slate-700">

        <FaTruck className="text-3xl text-blue-400" />

        <div>

          <h1 className="text-2xl font-bold">
            TransitOps
          </h1>

          <p className="text-xs text-gray-400">
            Fleet Management
          </p>

        </div>

      </div>

      <nav className="flex-1 px-4 py-6">

        {menuItems.map((item) => (

          <div
            key={item.name}
            className={`flex items-center gap-4 rounded-xl px-4 py-3 mb-3 cursor-pointer transition

            ${
              item.active
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            }`}

          >

            <span className="text-lg">

              {item.icon}

            </span>

            <span>

              {item.name}

            </span>

          </div>

        ))}

      </nav>

    </aside>
  );
}

export default Sidebar;