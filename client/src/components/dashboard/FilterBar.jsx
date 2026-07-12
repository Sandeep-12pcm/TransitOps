function FilterBar() {
  return (
    <div className="bg-white rounded-2xl shadow p-5 mb-8">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <select className="border rounded-lg p-3">
          <option>All Vehicle Types</option>
          <option>Truck</option>
          <option>Van</option>
          <option>Bus</option>
        </select>

        <select className="border rounded-lg p-3">
          <option>All Status</option>
          <option>Available</option>
          <option>On Trip</option>
          <option>Maintenance</option>
        </select>

        <select className="border rounded-lg p-3">
          <option>All Regions</option>
          <option>North</option>
          <option>South</option>
          <option>East</option>
          <option>West</option>
        </select>

      </div>

    </div>
  );
}

export default FilterBar;