import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TIKTOK_WIDTH, TIKTOK_HEIGHT } from "./TemplateCreator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/customs/Toast";
import io from 'socket.io-client';

const TemplatePreview = ({ templateSettings }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const socket = io(import.meta.env.VITE_CONVERTER_SERVER_URL);


  useEffect(() => {
    const videoElement = videoRef.current;

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsVideoReady(true);
      console.log(templateSettings.media)
    };

    if (videoElement) {
      videoElement.addEventListener('canplay', handleCanPlay);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, [templateSettings]);

  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && canvasRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const canvasWidth = Math.min(containerWidth, 540);
        const canvasHeight = (canvasWidth * 16) / 9;
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
        drawHeight = canvas.height;
        drawWidth = drawHeight * contentAspectRatio;
        offsetY = 0;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
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
    
      if (templateSettings.media) {
        if (isVideo(templateSettings.media) && videoRef.current) {
          drawContent(videoRef.current);
        } else if (isImage(templateSettings.media) && img) {
          drawContent(img);
        }
      } else {
        ctx.fillStyle = templateSettings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    
      drawText();
    
      animationFrameId = requestAnimationFrame(drawFrame);
    }
    
    function isImage(media) {
      return media && media.startsWith('data:image/');
    }
    
    function isVideo(media) {
      return media && media.startsWith('data:video/');
    }
    
    if (templateSettings.media && isImage(templateSettings.media)) {
      img = new Image();
      img.src = templateSettings.media;
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

  const handlePreviewClick = () => {
    if (!videoRef.current || !isVideoReady) {
      console.warn("Video is not ready yet");
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch((error) => {
        console.error("Error playing video:", error);
        setIsLoading(false);
      });
    }
  };

  async function handleGeneratePreview() {
    const response = await fetch(`${import.meta.env.VITE_CONVERTER_SERVER_URL}/api/create-template`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(templateSettings)
    })

    setIsGenerating(true)
    const data = await response.json()
    socket.on('video_progress', (data) => {
      setProgress(data.progress);
    });

    // Cleanup the socket connection
    return () => socket.disconnect();
    console.log(data)
    if (data.error) {
      console.log(data.error)
      showToast(data.error.message, 'error')
    }
  }

  const isVideo = templateSettings.media && templateSettings.media.startsWith('data:video/');

  return (
    <Card className="w-full">
      <CardContent className="p-6" ref={containerRef}>
        <h2 className="text-2xl font-semibold mb-4">
          {isLoading ? "Loading Preview" : "Preview"}
        </h2>
        <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="absolute top-0 left-0 w-full h-full border border-gray-300"
          />
        </div>
        {isVideo && (
          <video
            ref={videoRef}
            src={templateSettings.media}
            style={{ display: 'none' }}
            loop
            muted
            autoPlay={true}
          />
        )}
        <div className="flex space-y-3 flex-col">
          <Button 
            className="w-full" 
            onClick={handlePreviewClick}
            disabled={isLoading || (isVideo && !isVideoReady)}
          >
            {isLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
          </Button>
          <Button 
            className="w-full" 
            onClick={handleGeneratePreview}
          >
            {isGenerating ? `Video Processing Progress: ${Math.round(progress)}%` : "Generate Sample Preview"}
          </Button>
        </div>
      </CardContent>
      <ToastContainer />
    </Card>
  );
};

export default TemplatePreview;