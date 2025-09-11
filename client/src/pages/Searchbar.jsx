export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search by filename or user..."
      className="mb-6 p-2 border rounded w-full text-gray-900"
      value={value}
      onChange={onChange}
    />
  );
}