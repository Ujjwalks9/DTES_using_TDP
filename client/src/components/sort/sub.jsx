import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
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

    toast.info("Reading the file...");

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

      toast.info("Sending data to workers...");

      // Sending data to Flask Backend
      const response = await axios.post("http://localhost:5000/sort", {
        numbers,
      });

      // Toast to notify the user that it's being processed
      toast.info("Processing data on Flask servers...");

      const { ascending, descending } = response.data;

      // Once response is received from Flask backend, display result
      setSorted(ascending);
      setReversed(descending);

      toast.success("Sorting completed! Results ready.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Huge List Sorter</h1>

      <div className="flex flex-col md:flex-row items-end gap-4 mb-8 max-w-3xl mx-auto">
        <div className="w-full md:w-80">
          <Label htmlFor="file" className="mb-2 block">
            Choose a file to sort the list
          </Label>
          <Input
            id="file"
            type="file"
            accept=".txt,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button onClick={handleSort} className="w-full md:w-auto">
          Upload & Sort
        </Button>
      </div>

      {sorted.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
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
