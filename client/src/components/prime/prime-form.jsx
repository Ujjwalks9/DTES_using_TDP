import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrimeNumberCalculator = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [primes, setPrimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const isPrime = (num) => {
    if (num <= 1n) return false;
    if (num <= 3n) return true;
    if (num % 2n === 0n || num % 3n === 0n) return false;
    let i = 5n;
    while (i * i <= num) {
      if (num % i === 0n || num % (i + 2n) === 0n) return false;
      i += 6n;
    }
    return true;
  };

  const generatePrimes = (limit) => {
    const sieve = new Array(Number(limit) + 1).fill(true);
    sieve[0] = sieve[1] = false;

    for (let i = 2; i <= Math.sqrt(limit); i++) {
      if (sieve[i]) {
        for (let j = i * i; j <= limit; j += i) {
          sieve[j] = false;
        }
      }
    }

    const primesList = [];
    for (let i = 2; i <= limit; i++) {
      if (sieve[i]) primesList.push(i);
    }
    return primesList;
  };

  const handlePrimeCheck = () => {
    if (!number || isNaN(number) || Number(number) < 0) {
      toast.error("Please enter a non-negative number.");
      return;
    }

    const num = BigInt(number);
    setLoading(true);

    setTimeout(() => {
      try {
        const res = isPrime(num);
        setResult(res ? "Prime" : "Not Prime");
        toast.success(`The number is ${res ? "Prime" : "Not Prime"}`);
      } catch {
        toast.error("Error calculating prime.");
      }
      setLoading(false);
    }, 100);
  };

  const handlePrimeGeneration = () => {
    if (!number || isNaN(number) || Number(number) <= 1) {
      toast.error("Please enter a number greater than 1.");
      return;
    }

    const limit = BigInt(number);
    if (limit > 1000000n) {
      toast.warning("Generating primes for numbers this large might be slow!");
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const primesList = generatePrimes(Number(limit));
        setPrimes(primesList);
        toast.success("Prime numbers generated!");
      } catch {
        toast.error("Error generating prime numbers.");
      }
      setLoading(false);
    }, 100);
  };

  return (
    <div className="w-full px-6">
      <h1 className="text-3xl font-bold mb-8">Prime Number Checker / Generator</h1>

      <div className="mb-6 flex md:flex-row items-end gap-4">
        <div className="w-full md:w-80">
          <Label htmlFor="prime-number">Enter Number</Label>
          <Input
            id="prime-number"
            type="number"
            placeholder="e.g., 97 or 100000"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
        <Button onClick={handlePrimeCheck} disabled={loading} className="w-full md:w-auto">
          {loading ? "Checking..." : "Check if Prime"}
        </Button>
        <Button
          onClick={handlePrimeGeneration}
          disabled={loading}
          variant="outline"
          className="w-full md:w-auto"
        >
          {loading ? "Generating..." : "Generate Primes Up To"}
        </Button>
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
          <ScrollArea className="max-h-48 overflow-y-auto p-3 border rounded bg-gray-50 text-sm font-mono">
            {primes.join(", ")}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default PrimeNumberCalculator;
