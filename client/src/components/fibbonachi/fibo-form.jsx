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


  const handleGenerate = async () => {
    if (!position || isNaN(position) || position < 1) {
      toast.error("Please enter a valid position greater than 0.");
      return;
    }
  
    setLoading(true);
    toast.info("Generating Fibonacci series...");
  
    try {
      const response = await fetch("http://localhost:5000/generate-fibonacci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: parseInt(position) }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setFibSeries(data.series);
        setFibAtPosition(data.series[position - 1]);
        toast.success("Fibonacci series generated!");
      } else {
        toast.error(data.error || "Error generating Fibonacci.");
      }
    } catch {
      toast.error("Connection to backend failed.");
    }
  
    setLoading(false);
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
