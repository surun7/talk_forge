"use client";

import { useRef, useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Upload, Check } from "lucide-react";

interface Props {
 open: boolean;
 onClose: () => void;
 onSave: (dataUrl: string) => void;
}

// Resume photo aspect ratio: w-24 h-28 → 6:7
const RATIO_W = 6;
const RATIO_H = 7;
const CANVAS_W = 300;
const CANVAS_H = 350;

export default function PhotoUploadModal({ open, onClose, onSave }: Props) {
 const [image, setImage] = useState<HTMLImageElement | null>(null);
 const [zoom, setZoom] = useState(1);
 const [offsetX, setOffsetX] = useState(0);
 const [offsetY, setOffsetY] = useState(0);
 const [dragging, setDragging] = useState(false);
 const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
 const fileRef = useRef<HTMLInputElement>(null);
 const canvasRef = useRef<HTMLCanvasElement>(null);

 useEffect(() => {
 if (!image) return;
 const canvas = canvasRef.current;
 if (!canvas) return;
 const ctx = canvas.getContext("2d");
 if (!ctx) return;

 canvas.width = CANVAS_W;
 canvas.height = CANVAS_H;

 ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

 // Rectangle clip matching photo area
 ctx.save();
 const margin = 2;
 ctx.beginPath();
 ctx.rect(margin, margin, CANVAS_W - margin * 2, CANVAS_H - margin * 2);
 ctx.clip();

 // Dark background
 ctx.fillStyle = "#1a1a2e";
 ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

 // Draw image centered with zoom
 const iw = image.naturalWidth * zoom;
 const ih = image.naturalHeight * zoom;
 const cx = CANVAS_W / 2 + offsetX;
 const cy = CANVAS_H / 2 + offsetY;

 // Fit image to cover the rectangle
 const scaleW = CANVAS_W / image.naturalWidth;
 const scaleH = CANVAS_H / image.naturalHeight;
 const defaultScale = Math.max(scaleW, scaleH);
 const sw = image.naturalWidth * defaultScale * zoom;
 const sh = image.naturalHeight * defaultScale * zoom;

 ctx.drawImage(image, cx - sw / 2, cy - sh / 2, sw, sh);

 ctx.restore();

 // Border
 ctx.strokeStyle = "#8b5cf6";
 ctx.lineWidth = 2;
 ctx.strokeRect(
 margin,
 margin,
 CANVAS_W - margin * 2,
 CANVAS_H - margin * 2,
 );

 // Dim outside area
 ctx.fillStyle = "rgba(0,0,0,0.4)";
 ctx.fillRect(0, 0, CANVAS_W, margin);
 ctx.fillRect(0, CANVAS_H - margin, CANVAS_W, margin);
 ctx.fillRect(0, margin, margin, CANVAS_H - margin * 2);
 ctx.fillRect(CANVAS_W - margin, margin, margin, CANVAS_H - margin * 2);
 }, [image, zoom, offsetX, offsetY]);

 function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
 const file = e.target.files?.[0];
 if (!file) return;

 const reader = new FileReader();
 reader.onload = () => {
 const img = new Image();
 img.onload = () => {
 setImage(img);
 setZoom(1);
 setOffsetX(0);
 setOffsetY(0);
 };
 img.src = reader.result as string;
 };
 reader.readAsDataURL(file);
 }

 function handleSave() {
 const canvas = canvasRef.current;
 if (!canvas) return;

 // Render at 2x resolution
 const out = document.createElement("canvas");
 out.width = RATIO_W * 64;
 out.height = RATIO_H * 64;
 const ctx = out.getContext("2d")!;

 const m = 2;
 ctx.drawImage(
 canvas,
 m,
 m,
 CANVAS_W - m * 2,
 CANVAS_H - m * 2,
 0,
 0,
 out.width,
 out.height,
 );

 onSave(out.toDataURL("image/jpeg", 0.9));
 onClose();
 }

 function handleMouseDown(e: React.MouseEvent) {
 setDragging(true);
 setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
 }

 function handleMouseMove(e: React.MouseEvent) {
 if (!dragging) return;
 setOffsetX(e.clientX - dragStart.x);
 setOffsetY(e.clientY - dragStart.y);
 }

 function handleMouseUp() {
 setDragging(false);
 }

 function handleWheel(e: React.WheelEvent) {
 e.preventDefault();
 setZoom((z) => Math.max(0.3, Math.min(3, z - e.deltaY * 0.002)));
 }

 if (!open) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={onClose}
 />

 <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl shadow-[0_0_0_1px_#e5e5e5] dark:shadow-[0_0_0_1px_#404040] w-full max-w-sm p-5">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
 Upload Photo
 </h3>
 <button
 onClick={onClose}
 className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <div className="flex justify-center mb-4">
 {image ? (
 <div
 className="relative cursor-grab active:cursor-grabbing"
 onMouseDown={handleMouseDown}
 onMouseMove={handleMouseMove}
 onMouseUp={handleMouseUp}
 onMouseLeave={handleMouseUp}
 onWheel={handleWheel}
 >
 <canvas
 ref={canvasRef}
 width={CANVAS_W}
 height={CANVAS_H}
 className="block rounded-lg overflow-hidden"
 />
 </div>
 ) : (
 <button
 onClick={() => fileRef.current?.click()}
 className="w-[300px] h-[350px] rounded-lg flex flex-col items-center justify-center gap-2 transition-colors group shadow-[0_0_0_2px_#d4d4d4] dark:shadow-[0_0_0_2px_#525252] hover:shadow-[0_0_0_2px_#818cf8]"
 >
 <Upload className="w-8 h-8 text-neutral-300 dark:text-neutral-600 group-hover:text-indigo-400" />
 <span className="text-xs text-neutral-400 group-hover:text-indigo-500">
 Click to select photo
 </span>
 </button>
 )}
 </div>

 {image && (
 <div className="space-y-3 mb-4">
 <div className="flex items-center gap-2">
 <ZoomOut className="w-3.5 h-3.5 text-neutral-400" />
 <input
 type="range"
 min="30"
 max="300"
 value={Math.round(zoom * 100)}
 onChange={(e) => setZoom(Number(e.target.value) / 100)}
 className="flex-1 accent-indigo-600 h-1.5"
 />
 <ZoomIn className="w-3.5 h-3.5 text-neutral-400" />
 <span className="text-[10px] text-neutral-500 w-8 text-right">
 {Math.round(zoom * 100)}%
 </span>
 </div>
 <p className="text-[10px] text-neutral-400 text-center">
 Drag to reposition &bull; Scroll or slider to zoom
 </p>
 </div>
 )}

 <div className="flex gap-2">
 <input
 ref={fileRef}
 type="file"
 accept="image/*"
 onChange={handleFile}
 className="hidden"
 />
 <button
 onClick={() => fileRef.current?.click()}
 className="flex-1 px-4 py-2 text-xs rounded-lg shadow-[0_0_0_1px_#d4d4d4] dark:shadow-[0_0_0_1px_#525252] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
 >
 {image ? "Change Photo" : "Select Photo"}
 </button>
 <button
 onClick={handleSave}
 disabled={!image}
 className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold hover:from-indigo-600 hover:to-pink-600 disabled:opacity-40 transition-all"
 >
 <Check className="w-3.5 h-3.5" />
 Apply
 </button>
 </div>
 </div>
 </div>
 );
}
