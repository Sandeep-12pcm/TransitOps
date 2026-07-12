import React from 'react';
import { 
  FaChartLine, 
  FaTruck, 
  FaRoute, 
  FaWrench, 
  FaIdCard, 
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = ({ activeTab = 'vehicles' }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
    { id: 'vehicles', label: 'Vehicle Registry', icon: FaTruck },
    { id: 'trips', label: 'Trip Scheduler', icon: FaRoute },
    { id: 'maintenance', label: 'Maintenance Hub', icon: FaWrench },
    { id: 'drivers', label: 'Driver Directory', icon: FaIdCard },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-350 min-h-[calc(100vh-4rem)] flex flex-col justify-between shrink-0 shadow-inner">
      {/* Navigation Menu */}
      <div className="p-4">
        <div className="px-3 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Navigation</p>
        </div>
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            
            return (
              <button
                key={item.id}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-650 text-white shadow-md shadow-indigo-900/35' 
                    : 'hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`mr-3 text-lg transition-transform duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white group-hover:scale-105'
                }`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs font-semibold px-2 py-1 select-none">
          <div>
            <span className="text-slate-500 font-medium block">Environment</span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Local DB Connected</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-medium block">Version</span>
            <span className="text-slate-400">v1.2.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
