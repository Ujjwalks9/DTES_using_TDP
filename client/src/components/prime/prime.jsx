import React, { useState } from "react";
import { toast } from "sonner";

const PrimeNumberCalculator = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [primes, setPrimes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Prime Check request to backend
  const handlePrimeCheck = async () => {
    if (!number || isNaN(number) || Number(number) < 0) {
      toast.error("Please enter a non-negative number.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/check_prime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ number }),
      });

      const data = await response.json();

      if (data.result !== undefined) {
        setResult(data.result ? "Prime" : "Not Prime");
        toast.success(`The number is ${data.result ? "Prime" : "Not Prime"}`);
      } else {
        toast.error(data.error || "Error calculating prime.");
      }
    } catch (error) {
      toast.error("Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  // Generate Primes request to backend
  const handlePrimeGeneration = async () => {
    if (!number || isNaN(number) || Number(number) <= 1) {
      toast.error("Please enter a number greater than 1.");
      return;
    }

    const limit = BigInt(number);
    if (limit > 1000000n) {
      toast.warning("Generating primes for numbers this large might be slow!");
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/generate_primes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit: number }),
      });

      const data = await response.json();

      if (data.primes) {
        setPrimes(data.primes);
        toast.success("Prime numbers generated!");
      } else {
        toast.error(data.error || "Error generating prime numbers.");
      }
    } catch (error) {
      toast.error("Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto bg-white p-4">
      <h1 className="text-3xl font-bold mb-8">Prime Number Checker / Generator</h1>

      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-80"
          placeholder="Enter a number"
        />
        <button
          onClick={handlePrimeCheck}
          disabled={loading}
          className={`bg-black text-white px-6 py-2 rounded ${loading ? "cursor-not-allowed" : "hover:bg-black"} transition`}
        >
          {loading ? "Checking..." : "Check if Prime"}
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <button
          onClick={handlePrimeGeneration}
          disabled={loading}
          className={`bg-blue-500 text-white px-6 py-2 rounded ${loading ? "cursor-not-allowed" : "hover:bg-blue-500"} transition`}
        >
          {loading ? "Generating..." : "Generate Primes Up To"}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Prime Check Result</h2>
          <div className="p-3 border rounded bg-gray-50 text-sm font-mono">{result}</div>
        </div>
      )}

      {primes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-blue-700">Generated Primes</h2>
          <div className="p-3 border rounded bg-gray-50 text-sm font-mono overflow-y-auto">
            {primes.join(", ")}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrimeNumberCalculator;
