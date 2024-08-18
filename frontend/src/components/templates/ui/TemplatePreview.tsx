import React, { useRef, useEffect } from "react";
import { Move } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TemplatePreview({ templateSettings, dragPosition, setDragPosition }) {
  const previewRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const resizePreview = () => {
      if (containerRef.current && previewRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const previewHeight = (containerWidth * 16) / 9;
        previewRef.current.style.height = `${previewHeight}px`;
      }
    };

    resizePreview();
    window.addEventListener('resize', resizePreview);

    return () => window.removeEventListener('resize', resizePreview);
  }, []);

  const handleDragStart = (e) => {
    e.preventDefault();
    const startX = e.clientX - dragPosition.x;
    const startY = e.clientY - dragPosition.y;

    const handleMouseMove = (e) => {
      setDragPosition({
        x: e.clientX - startX,
        y: e.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <Card>
      <CardContent className="p-6" ref={containerRef}>
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <div
          ref={previewRef}
          className="relative w-full bg-gray-200 overflow-hidden"
          style={{
            backgroundImage: templateSettings.image ? `url(${templateSettings.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {templateSettings.video && (
            <video
              src={templateSettings.video}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
            />
          )}
          <div
            className="absolute cursor-move"
            style={{
              top: `${dragPosition.y}px`,
              left: `${dragPosition.x}px`,
              padding: `${templateSettings.marginTop}px ${templateSettings.marginRight}px ${templateSettings.marginTop}px ${templateSettings.marginLeft}px`,
            }}
            onMouseDown={handleDragStart}
          >
            <div
              className="relative"
              style={{
                fontFamily: templateSettings.fontFamily,
                fontSize: `${templateSettings.fontSize}px`,
                lineHeight: templateSettings.lineHeight,
                color: templateSettings.textColor,
                WebkitTextStroke: `1px ${templateSettings.textOutline}`,
              }}
            >
              {templateSettings.text}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}