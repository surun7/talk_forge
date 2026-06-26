"use client";

import { useCallback, useState, useRef } from "react";

interface UseResumePDFOptions {
  fileName?: string;
}

export function useResumePDF({ fileName }: UseResumePDFOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(false);
  const generatingRef = useRef(false);

  const downloadPDF = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setIsGenerating(true);
    setProgress(0);
    abortRef.current = false;

    try {
      const [html2canvasMod, jsPDFMod] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasMod.default;
      const { jsPDF } = jsPDFMod;

      // Grab all page containers, then filter to outer ones by height
      const raw = document.querySelectorAll<HTMLElement>(
        '[data-page-index]'
      );

      const pages = Array.from(raw).filter((p) => {
        const h = p.getBoundingClientRect().height;
        return h > 700;
      });

      const total = pages.length;
      if (total === 0) {
        generatingRef.current = false;
        setIsGenerating(false);
        return;
      }

      // Wait for images with 3s timeout
      for (const page of pages) {
        if (abortRef.current) break;
        const imgs = page.querySelectorAll("img");
        await Promise.all(
          Array.from(imgs).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) return resolve();
                const t = setTimeout(() => resolve(), 3000);
                img.onload = () => { clearTimeout(t); resolve(); };
                img.onerror = () => { clearTimeout(t); resolve(); };
              })
          )
        );
      }

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      for (let i = 0; i < total; i++) {
        if (abortRef.current) break;

        await new Promise((r) => setTimeout(r, 50));

        const canvas = await html2canvas(pages[i]!, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

        canvas.width = 0;
        canvas.height = 0;

        setProgress(Math.round(((i + 1) / total) * 100));
      }

      if (!abortRef.current) {
        const name = (fileName || "").trim();
        pdf.save(`${name || "resume"}.pdf`);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      generatingRef.current = false;
      setIsGenerating(false);
      setProgress(0);
    }
  }, [fileName]);

  const cancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { downloadPDF, cancel, isGenerating, progress };
}
