import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import KPICard from "../cards/KPICard";
import VehiclePieChart from "../charts/VehiclePieChart";
import TripBarChart from "../charts/TripBarChart";
import FleetLineChart from "../charts/FleetLineChart";
import FilterBar from "./FilterBar";
import { dashboardStats } from "../../data/dummyData";

function Dashboard() {
  return (
    <div className="flex bg-slate-100 min-h-screen">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-8">
    <FilterBar />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"></div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {dashboardStats.map((item) => (
              <KPICard
                key={item.title}
                {...item}
              />
            ))}

          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">

            <VehiclePieChart />

            <TripBarChart />

          </div>

          {/* Fleet Utilization */}
          <div className="mt-8">

            <FleetLineChart />

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;