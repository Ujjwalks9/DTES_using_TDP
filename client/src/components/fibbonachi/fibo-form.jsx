import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const FibonacciGenerator = () => {
  const [position, setPosition] = useState("");
  const [fibSeries, setFibSeries] = useState([]);
  const [fibAtPosition, setFibAtPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateFibonacci = (n) => {
    let fibArr = [0, 1];
    for (let i = 2; i <= n; i++) {
      fibArr.push(fibArr[i - 1] + fibArr[i - 2]);
    }
    return fibArr;
  };

  const handleGenerate = () => {
    if (!position || isNaN(position) || position < 1) {
      toast.error("Please enter a valid position greater than 0.");
      return;
    }

    setLoading(true);
    toast.info("Generating Fibonacci series...");

    setTimeout(() => {
      const fibSeriesData = generateFibonacci(Number(position));
      setFibSeries(fibSeriesData);
      setFibAtPosition(fibSeriesData[position - 1]);
      toast.success("Fibonacci series generated!");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="w-full px-4">
      <h1 className="text-3xl font-bold mb-6">Fibonacci Series Generator</h1>

      <div className="flex md:flex-row items-end gap-4 mb-6">
        <div className="w-full md:w-80">
          <Label htmlFor="position" className="mb-2">Fibonacci Position</Label>
          <Input
            id="position"
            type="number"
            placeholder="Enter position (e.g., 1000)"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="mt-2 md:mt-6">
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      {fibSeries.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-green-700">
            Fibonacci Series (Up to {position})
          </h2>
          <ScrollArea className="h-48 p-3 border rounded bg-gray-50 text-sm font-mono">
            {fibSeries.join(", ")}
          </ScrollArea>
        </div>
      )}

      {fibAtPosition !== null && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-red-700">
            Fibonacci at Position {position}
          </h2>
          <div className="p-3 border rounded bg-gray-50 text-sm font-mono">
            {fibAtPosition}
          </div>
        </div>
      )}
    </div>
  );
};

export default FibonacciGenerator;
