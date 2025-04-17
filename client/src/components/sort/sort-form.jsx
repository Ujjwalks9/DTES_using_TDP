import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "../ui/label";

const HugeListSorter = () => {
  const [file, setFile] = useState(null);
  const [sorted, setSorted] = useState([]);
  const [reversed, setReversed] = useState([]);

  const handleSort = async () => {
    if (!file) {
      toast.error("Please select a file!");
      return;
    }

    toast.info("Reading and sorting the file...");

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

      const sortedList = [...numbers].sort((a, b) => a - b);
      const reversedList = [...sortedList].reverse();

      setSorted(sortedList);
      setReversed(reversedList);

      toast.success("Sorting complete!");
    } catch (err) {
      console.error(err);
      toast.error("Error reading the file.");
    }
  };

  return (
    <div className="w-full px-4">
      <h1 className="text-3xl font-bold mb-8">Huge List Sorter</h1>

      <div className="flex md:flex-row items-end gap-4 mb-8">
        <div className="w-full md:w-80">
          <Label htmlFor="number" className="mb-2">
            Choose a file to sort the list
          </Label>
          <Input
            type="file"
            accept=".txt,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="md:w-auto"
          />
        </div>
        <Button onClick={handleSort}>Upload & Sort</Button>
      </div>

      {sorted.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-green-700">Sorted (Ascending)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60">
                <div className="text-sm font-mono whitespace-pre-wrap">
                  {sorted.join(", ")}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-red-700">Sorted (Descending)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60">
                <div className="text-sm font-mono whitespace-pre-wrap">
                  {reversed.join(", ")}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HugeListSorter;
