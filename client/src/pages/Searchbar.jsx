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
}import React, { useState, useEffect } from 'react';

/**
 * A debounced search bar component.
 * It delays the `onSearch` callback until the user stops typing for a specified time.
 * @param {object} props
 * @param {string} props.placeholder - The placeholder text for the input.
 * @param {function} props.onSearch - The callback function to be called with the debounced search term.
 * @param {number} [props.delay=500] - The delay in milliseconds before the search is executed.
 */
export default function SearchBar({ placeholder = "Search...", onSearch, delay = 500 }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Use a debouncing effect to delay the onSearch callback.
  useEffect(() => {
    // Set a timeout to call the onSearch function.
    const timerId = setTimeout(() => {
      onSearch(searchTerm);
    }, delay);

    // Cleanup function to clear the previous timeout.
    // This runs on every re-render and component unmount.
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, delay, onSearch]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex items-center w-full max-w-lg mx-auto bg-white rounded-full shadow-lg p-2 transition-all duration-300 hover:shadow-xl">
      <div className="p-2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
}
