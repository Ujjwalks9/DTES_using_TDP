import React, { useState } from "react";
import axios from "axios";
// import { toast } from "sonner"; // Shadcn toast
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

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
    <div className="w-full px-4 mb-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Matrix Multiplication</h1>

      <div className="flex flex-col gap-4 mb-4 max-w-4xl mx-auto">
        <div>
          <h2 className="text-lg font-semibold mb-2">Matrix A</h2>
          <Textarea
            rows={8}
            placeholder="Example: [[1 2] [3 4] [5 6]]"
            value={matrixAInput}
            onChange={(e) => setMatrixAInput(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Matrix B</h2>
          <Textarea
            rows={8}
            placeholder="Example: [[1 2 3] [4 5 6]]"
            value={matrixBInput}
            onChange={(e) => setMatrixBInput(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <Button onClick={handleMultiply} disabled={loading}>
          {loading ? "Calculating..." : "Multiply"}
        </Button>
      </div>

      {result.length > 0 && (
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Result Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <div className="space-y-2 font-mono text-sm">
                {result.map((row, i) => (
                  <div
                    key={i}
                    className="flex justify-center gap-4"
                  >
                    [ {row.map((val, j) => (
                      <span key={j} className="w-12 text-center">
                        {val}
                      </span>
                    ))} ]
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatrixInputByText;
