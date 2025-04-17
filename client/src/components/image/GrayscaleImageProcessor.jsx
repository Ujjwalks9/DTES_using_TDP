import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const GrayscaleImageProcessor = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [grayImage, setGrayImage] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.match(/image\/(png|jpeg|jpg)/)) {
      toast.error("Please upload a valid image file (PNG, JPG, or JPEG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageDataUrl(event.target.result);
      setOriginalImage(event.target.result);
      setGrayImage(null);
    };
    reader.readAsDataURL(file);
  };

  const convertToGrayscale = () => {
    if (!imageDataUrl) {
      toast.error("Please upload an image first.");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);
      const graySrc = canvas.toDataURL("image/png");
      setGrayImage(graySrc);
      toast.success("Grayscale conversion complete!");
    };
    img.src = imageDataUrl;
  };

  return (
    <div className="w-full px-4 space-y-6">
      <h1 className="text-2xl font-bold">Image to Grayscale Converter</h1>

      <div className="flex items-end justify-center gap-4 max-w-3/4">
        <div className="w-full flex flex-col items-start">
          <Label htmlFor="image-upload" className="mb-2">Upload Image</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleImageUpload}
          />
        </div>
        <Button onClick={convertToGrayscale} className="mt-6 md:mt-0">
          Convert to Grayscale
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-8 items-center mt-6">
        {originalImage && (
          <div>
            <h2 className="mb-2 font-medium">Original Image</h2>
            <img src={originalImage} alt="Original" className="max-w-xs rounded shadow" />
          </div>
        )}

        {grayImage && (
          <div>
            <h2 className="mb-2 font-medium">Grayscale Image</h2>
            <img src={grayImage} alt="Grayscale" className="max-w-xs rounded shadow" />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {grayImage && (
        <Button
          variant="outline"
          onClick={() => {
            const link = document.createElement("a");
            link.href = grayImage;
            link.download = "grayscale.png";
            link.click();
          }}
          className=""
        >
          Download Grayscale Image
        </Button>
      )}
    </div>
  );
};

export default GrayscaleImageProcessor;
