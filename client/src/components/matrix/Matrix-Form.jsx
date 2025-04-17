import React, { useState } from "react";
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

  const handleParse = () => {
    const matrixA = parseMatrixInput(matrixAInput);
    const matrixB = parseMatrixInput(matrixBInput);

    if (!matrixA || !matrixB) {
      toast.error("Invalid matrix format!");
      return;
    }

    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;

    if (
      matrixA.some((row) => row.length !== colsA) ||
      matrixB.some((row) => row.length !== matrixB[0].length)
    ) {
      toast.error("Inconsistent row lengths in one of the matrices.");
      return;
    }

    if (colsA !== rowsB) {
      toast.error("Matrix A columns must match Matrix B rows.");
      return;
    }

    multiply(matrixA, matrixB);
  };

  const multiply = (a, b) => {
    const resultMatrix = Array.from({ length: a.length }, (_, i) =>
      Array.from({ length: b[0].length }, (_, j) =>
        a[i].reduce((sum, _, k) => sum + a[i][k] * b[k][j], 0)
      )
    );
    setResult(resultMatrix);
    toast.success("Matrix multiplied successfully!");
  };

  return (
    <div className="w-full px-4 mb-4">
      <h1 className="text-3xl font-bold mb-8">Matrix Multiplication</h1>

      <div className="flex flex-col gap-4 mb-4">
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
        <Button onClick={handleParse}>Multiply</Button>
      </div>

      {result.length > 0 && (
        <Card className="mt-8">
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
