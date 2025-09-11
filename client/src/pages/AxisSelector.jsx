export default function AxisSelector({ columns, xAxis, yAxis, setXAxis, setYAxis }) {
  return (
    <div className="flex space-x-4 mt-4">
      <div>
        <label className="block mb-1">X Axis</label>
        <select className="border p-2" value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
          {columns.map(col => <option key={col}>{col}</option>)}
        </select>
      </div>
      <div>
        <label className="block mb-1">Y Axis</label>
        <select className="border p-2" value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
          {columns.map(col => <option key={col}>{col}</option>)}
        </select>
      </div>
    </div>
  );
}