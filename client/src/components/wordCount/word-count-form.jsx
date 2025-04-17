import React, { useState, useRef } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import mammoth from "mammoth";

const WordCounter = () => {
  const [file, setFile] = useState(null);
  const [wordCount, setWordCount] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // for clearing the input field

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Please select a file!");
      return;
    }

    setLoading(true);
    toast.info("Reading and processing the file...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileType = file.type;

      let text = "";

      if (fileType === "text/plain") {
        text = new TextDecoder("utf-8").decode(arrayBuffer);
      } else if (
        fileType === "application/vnd.ms-excel" ||
        fileType === "text/csv"
      ) {
        const csvText = new TextDecoder("utf-8").decode(arrayBuffer);
        const result = Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
        });
        text = result.data.flat().join(" ");
      } else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        toast.error("Unsupported file type.");
        return;
      }

      if (!text) {
        toast.error("File contains no text.");
        return;
      }

      const wordFreq = countWordFrequency(text);
      setWordCount(wordFreq);
      toast.success("Word frequency calculation complete!");
    } catch (error) {
      console.error(error);
      toast.error("Error processing the file.");
    } finally {
      setLoading(false);
      setFile(null); // clear file from state
      if (fileInputRef.current) fileInputRef.current.value = ""; // clear the input
    }
  };

  const countWordFrequency = (text) => {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/);

    const wordFreq = {};
    for (const word of words) {
      if (word) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }
    return wordFreq;
  };

  return (
    <div className="max-full mx-auto bg-white p-4">
      <h1 className="text-3xl font-bold mb-6">Word Frequency Counter</h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          className="border rounded px-4 py-2 w-full md:w-auto"
        />
        <button
          onClick={handleFileUpload}
          disabled={loading}
          className={`bg-black text-white px-6 py-2 rounded ${
            loading ? "cursor-not-allowed" : "hover:bg-black"
          } transition`}
        >
          {loading ? "Processing..." : "Upload & Process"}
        </button>
      </div>

      {Object.keys(wordCount).length > 0 && (
        <div className="mt-6 text-sm font-mono">
          <h2 className="text-xl font-semibold mb-2 text-green-700">
            Word Frequency
          </h2>
          <div className="p-3 border rounded h-116 overflow-y-auto bg-gray-50">
            {Object.entries(wordCount).map(([word, count]) => (
              <div key={word} className="mb-1">
                <strong>{word}</strong>: {count}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordCounter;
