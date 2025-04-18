import React, { useState } from "react";
import { toast } from "sonner";

const FactorialCalculator = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!number || isNaN(number) || Number(number) < 0) {
      toast.error("Please enter a non-negative number.");
      return;
    }

    setLoading(true);
    toast.info("Calculating factorial...");

    try {
      const response = await fetch("http://localhost:5000/calculate-factorial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ number: parseInt(number) }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.factorial);
        toast.success("Factorial calculated successfully!");
      } else {
        toast.error(data.error || "Error calculating factorial.");
      }
    } catch (err) {
      toast.error("Error connecting to the server.");
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto bg-white p-4">
      <h1 className="text-3xl font-bold mb-8">Factorial Calculator (Large Numbers)</h1>

      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-80"
          placeholder="Enter a number (e.g., 1000 or 100000)"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`bg-black text-white px-6 py-2 rounded ${
            loading ? "cursor-not-allowed" : "hover:bg-black"
          } transition`}
        >
          {loading ? "Calculating..." : "Calculate Factorial"}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-green-700">
            Factorial of {number}
          </h2>
          <div className="p-3 border rounded bg-gray-50 text-sm font-mono overflow-y-auto">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default FactorialCalculator;
