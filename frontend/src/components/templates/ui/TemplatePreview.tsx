import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TIKTOK_WIDTH, TIKTOK_HEIGHT } from "./TemplateCreator";

const TemplatePreview = ({ templateSettings }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && canvasRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const canvasWidth = Math.min(containerWidth, 540); // Max width of 540px
        const canvasHeight = (canvasWidth * 16) / 9; // Maintain 9:16 aspect ratio
        setCanvasSize({ width: canvasWidth, height: canvasHeight });
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let img;
    let animationFrameId;

    function drawContent(source) {
      const canvasAspectRatio = canvas.width / canvas.height;
      const contentWidth = source.width || source.videoWidth;
      const contentHeight = source.height || source.videoHeight;
      const contentAspectRatio = contentWidth / contentHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (contentAspectRatio > canvasAspectRatio) {
        // Content is wider than canvas
        drawHeight = canvas.height;
        drawWidth = drawHeight * contentAspectRatio;
        offsetY = 0;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        // Content is taller than canvas
        drawWidth = canvas.width;
        drawHeight = drawWidth / contentAspectRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      ctx.drawImage(source, offsetX, offsetY, drawWidth, drawHeight);
    }

    function drawText() {
      ctx.font = `${templateSettings.fontSize}px ${templateSettings.fontFamily}`;
      ctx.fillStyle = templateSettings.textColor;
      ctx.strokeStyle = templateSettings.textOutline;
      ctx.lineWidth = 2;
      const lines = templateSettings.text.split('\n');
      const lineHeight = templateSettings.fontSize * templateSettings.lineHeight;

      const scaleFactor = canvas.width / TIKTOK_WIDTH;
      const scaledMarginLeft = templateSettings.marginLeft * scaleFactor;
      const scaledMarginTop = templateSettings.marginTop * scaleFactor;
      const scaledFontSize = templateSettings.fontSize * scaleFactor;

      lines.forEach((line, index) => {
        const x = scaledMarginLeft;
        const y = scaledMarginTop + (index * lineHeight * scaleFactor);
        ctx.strokeText(line, x, y);
        ctx.fillText(line, x, y);
      });
    }

    function drawFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (templateSettings.video) {
        if (videoRef.current) {
          drawContent(videoRef.current);
        }
      } else if (templateSettings.image && img) {
        drawContent(img);
      } else {
        ctx.fillStyle = templateSettings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      drawText();
      animationFrameId = requestAnimationFrame(drawFrame);
    }

    if (templateSettings.image) {
      img = new Image();
      img.src = templateSettings.image;
      img.onload = () => {
        drawFrame();
      };
    } else {
      drawFrame();
    }

    return () => {
      if (img) {
        img.onload = null;
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [templateSettings, canvasSize]);

  return (
    <Card className="w-full">
      <CardContent className="p-6" ref={containerRef}>
        <h2 className="text-2xl font-semibold mb-4">Preview</h2>
        <div className="relative w-full" style={{ paddingBottom: '177.78%' }}> {/* 16:9 aspect ratio */}
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="absolute top-0 left-0 w-full h-full border border-gray-300"
          />
        </div>
        {templateSettings.video && (
          <video
            ref={videoRef}
            src={templateSettings.video}
            style={{ display: 'none' }}
            autoPlay
            loop
            muted
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TemplatePreview;