import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner"; // Shadcn toast

const parseMatrixInput = (input) => {
  try {
    return input
      .trim()
      .replace(/\[/g, "")
      .split("]")
      .filter(Boolean)
      .map((row) =>
        row
          .trim()
          .split(/\s+/)
          .map(Number)
      );
  } catch {
    return null;
  }
};

const MatrixInputByText = () => {
  const [matrixAInput, setMatrixAInput] = useState("");
  const [matrixBInput, setMatrixBInput] = useState("");
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMultiply = async () => {
    const matrixA = parseMatrixInput(matrixAInput);
    const matrixB = parseMatrixInput(matrixBInput);

    if (!matrixA || !matrixB) {
      toast.error("Invalid matrix format. Please check your input.");
      return;
    }

    toast.info("Sending matrices to server...");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/multiply", {
        matrixA,
        matrixB,
      });

      toast.success("Multiplication successful!");
      setResult(res.data.result);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong while connecting to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Matrix Multiplication</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-lg font-semibold mb-2">Matrix A</label>
          <textarea
            rows="8"
            className="w-full border rounded-lg p-3 text-sm font-mono bg-gray-50"
            placeholder="Example: [[1 2] [3 4]]"
            value={matrixAInput}
            onChange={(e) => setMatrixAInput(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-lg font-semibold mb-2">Matrix B</label>
          <textarea
            rows="8"
            className="w-full border rounded-lg p-3 text-sm font-mono bg-gray-50"
            placeholder="Example: [[5 6] [7 8]]"
            value={matrixBInput}
            onChange={(e) => setMatrixBInput(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleMultiply}
          className="bg-blue-600 text-white font-medium px-6 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Multiply"}
        </button>
      </div>

      {result.length > 0 && (
        <div className="mt-4 text-center">
          <h2 className="text-lg font-semibold mb-3">Result Matrix</h2>
          <div className="inline-block border rounded-lg p-4 bg-gray-50 overflow-auto max-h-[400px]">
            {result.map((row, i) => (
              <div key={i} className="flex gap-4 text-sm font-mono justify-center">
                {row.map((val, j) => (
                  <span key={j} className="w-12 text-center">
                    {val}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrixInputByText;
