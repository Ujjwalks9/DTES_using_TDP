import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const FactorialCalculator = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateFactorial = (n) => {
    let fact = BigInt(1);
    for (let i = BigInt(2); i <= n; i++) {
      fact *= i;
    }
    return fact.toString();
  };

  const handleSubmit = () => {
    if (!number || isNaN(number) || Number(number) < 0) {
      toast.error("Please enter a non-negative number.");
      return;
    }

    const num = BigInt(number);

    if (num > 100000n) {
      toast.warning(
        "This might be slow in browser. Use backend for numbers > 100000."
      );
    }

    setLoading(true);
    toast.info("Calculating factorial...");

    setTimeout(() => {
      try {
        const fact = calculateFactorial(num);
        setResult(fact);
        toast.success("Factorial calculated successfully!");
      } catch (err) {
        toast.error("Error calculating factorial.");
      }
      setLoading(false);
    }, 100);
  };

  return (
    <div className="w-full px-6">
      <h1 className="text-3xl font-bold mb-6">
        Factorial Calculator (Large Numbers)
      </h1>

      <div className="flex md:flex-row items-end gap-4 mb-6">
        <div className="w-full md:w-80">
          <Label htmlFor="number" className="mb-2">
            Enter Number
          </Label>
          <Input
            id="number"
            type="number"
            placeholder="e.g., 1000 or 100000"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-2 md:mt-6"
        >
          {loading ? "Calculating..." : "Calculate Factorial"}
        </Button>
      </div>

      {result && (
        <div className="mb-6 w-full">
          <h2 className="text-lg font-semibold mb-2 text-green-700">
            Factorial of {number}
          </h2>
          <ScrollArea className="max-h-48 overflow-y-auto p-3 border rounded bg-gray-50 text-sm font-mono w-full">
            {result}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default FactorialCalculator;
