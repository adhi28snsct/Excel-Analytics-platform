import { Link } from "react-router-dom";

export default function FileCard({ file, onDelete }) {
  const formattedDate = new Date(file.uploadedAt).toLocaleString();

  const fileSize =
    file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(2)} KB`;

  const fileType =
    file.mimetype?.includes("spreadsheet") || file.mimetype?.includes("excel")
      ? "Excel Spreadsheet"
      : file.mimetype || "Unknown";

  return (
    <div className="p-4 rounded-lg shadow-md border bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      {/* ✅ Corrected Filename */}
      <h2 className="text-lg font-bold">{file.filename || "Unnamed File"}</h2>

      <p className="text-sm mb-1">
        Type: {fileType} <br />
        Uploaded: {formattedDate} <br />
        Size: {fileSize}
      </p>

      <div className="flex gap-4 mt-2">
        <Link
          to={`/dashboard/analytics/${file._id}`}
          className="text-white underline hover:text-yellow-200 transition duration-200"
        >
          View Analysis →
        </Link>

        <button
          onClick={() => {
            const confirmed = window.confirm("Are you sure you want to delete this file?");
            if (confirmed) {
              onDelete(file._id);
            }
          }}
          className="text-red-200 hover:text-red-300 underline transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}