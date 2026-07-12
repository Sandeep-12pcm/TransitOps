import React from 'react';
import { FaBell, FaUserCircle, FaTruck } from 'react-icons/fa';

const Navbar = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white h-16 flex items-center justify-between px-6 sticky top-0 z-50 shadow-md">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
          <FaTruck className="text-xl" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-slate-350 to-indigo-400 bg-clip-text text-transparent">
            TransitOps
          </span>
          <span className="text-[10px] block text-indigo-400 font-semibold tracking-widest uppercase">
            Fleet Intelligence
          </span>
        </div>
      </div>

      {/* Title / Info */}
      <div className="hidden md:flex items-center text-sm text-slate-400 font-medium">
        <span className="h-4 w-px bg-slate-800 mx-4"></span>
        <span>Real-time Operations Control Center</span>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <button className="relative p-2 text-slate-300 hover:text-white transition-colors hover:bg-slate-850 rounded-lg cursor-pointer">
          <FaBell className="text-lg" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-900"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-white">Harshal S.</p>
            <p className="text-xs text-indigo-400 font-medium">Fleet Admin</p>
          </div>
          <FaUserCircle className="text-3xl text-slate-400 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
