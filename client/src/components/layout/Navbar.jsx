import {
  FaBell,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";

function Navbar() {
  return (
    <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8">

      <div>

        <h2 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h2>

        <p className="text-gray-500">
          Smart Transport Operations Platform
        </p>

      </div>

      <div className="flex items-center gap-6">

        <div className="relative">

          <FaSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border w-72 outline-none focus:border-blue-500"
          />

        </div>

        <FaBell
          className="text-2xl text-gray-600 cursor-pointer"
        />

        <FaUserCircle
          className="text-4xl text-blue-600 cursor-pointer"
        />

      </div>

    </header>
  );
}

export default Navbar;