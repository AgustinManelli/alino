"use client"

import { useState, RefObject } from "react";
import { toPng } from "html-to-image";

export function useImageDownload(
  ref: RefObject<HTMLElement>,
  filename: string
) {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadImage = async () => {
    if (!ref.current) return;
    
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(ref.current, { 
        quality: 1, 
        pixelRatio: 3,
        style: { transform: 'scale(1)', margin: '0' } 
      });
      
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error al generar la imagen:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return { downloadImage, isGenerating };
}