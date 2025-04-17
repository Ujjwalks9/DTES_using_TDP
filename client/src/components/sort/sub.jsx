import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

const HugeListSorter = () => {
  const [file, setFile] = useState(null);
  const [sorted, setSorted] = useState([]);
  const [reversed, setReversed] = useState([]);

  const handleSort = async () => {
    if (!file) {
      toast.error("Please select a file!");
      return;
    }

    toast.info("Reading the file...");

    try {
      const text = await file.text();

      const numbers = text
        .replace(/,/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .map(Number);

      if (numbers.some(isNaN)) {
        toast.error("File contains invalid numbers.");
        return;
      }

      toast.info("Sending data to workers...");

      // Sending data to Flask Backend
      const response = await axios.post("http://localhost:5000/sort", {
        numbers,
      });

      // Toast to notify the user that it's being processed
      toast.info("Processing data on Flask servers...");

      const { ascending, descending } = response.data;

      // Once response is received from Flask backend, display result
      setSorted(ascending);
      setReversed(descending);

      toast.success("Sorting completed! Results ready.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Huge List Sorter</h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          type="file"
          accept=".txt,.csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="border rounded px-4 py-2 w-full md:w-auto"
        />
        <button
          onClick={handleSort}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Upload & Sort
        </button>
      </div>

      {sorted.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-mono">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-green-700">Sorted (Ascending)</h2>
            <div className="p-3 border rounded h-60 overflow-y-auto bg-gray-50">
              {sorted.join(", ")}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-red-700">Sorted (Descending)</h2>
            <div className="p-3 border rounded h-60 overflow-y-auto bg-gray-50">
              {reversed.join(", ")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HugeListSorter;
