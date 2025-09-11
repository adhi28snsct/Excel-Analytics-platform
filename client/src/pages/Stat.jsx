export default function StatCard({ label, value }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded shadow text-center">
      <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}