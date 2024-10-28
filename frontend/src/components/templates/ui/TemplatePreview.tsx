import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TIKTOK_WIDTH, TIKTOK_HEIGHT } from "./TemplateCreator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/customs/Toast";
import {v4 as uuidV4} from 'uuid'

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
  const [videoSource, setVideoSource] = useState(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);


  useEffect(() => {
    // console.log(templateSettings)
    const videoElement = videoRef.current;
    console.log(videoElement)

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
  return () => {
    if (videoSource instanceof File && videoRef.current?.src) {
      URL.revokeObjectURL(videoRef.current.src);
    }
  };
}, [videoSource]);

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

      const scaleFactor = canvas.width / TIKTOK_WIDTH;
      const scaledMarginLeft = templateSettings.marginLeft * scaleFactor;
      const scaledMarginTop = templateSettings.marginTop * scaleFactor;
      const scaledFontSize = templateSettings.fontSize * scaleFactor;
      const maxLineWidth = canvas.width - scaledMarginLeft * 2; // Available width for text

      const lineHeight = scaledFontSize * templateSettings.lineHeight;

      // Function to split text into lines that fit within the border
      function wrapText(text, maxWidth) {
        const words = text.split(' ');
        let line = '';
        const lines = [];

        words.forEach(word => {
          const testLine = line + word + ' ';
          const testWidth = ctx.measureText(testLine).width;

          if (testWidth > maxWidth && line !== '') {
            lines.push(line);
            line = word + ' '; // Start a new line with the current word
          } else {
            line = testLine;
          }
        });

        lines.push(line.trim()); // Push the last line
        return lines;
      }

      // Split text into multiple lines, considering newlines and word wrapping
      const inputLines = templateSettings.text.split('\n');
      const wrappedLines = inputLines.flatMap(line => wrapText(line, maxLineWidth));

      wrappedLines.forEach((line, index) => {
        const x = scaledMarginLeft;
        const y = scaledMarginTop + (index * lineHeight);

        ctx.strokeText(line, x, y);
        ctx.fillText(line, x, y);
      });
    }

    const isURL = (str) => {
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    };

    // Helper function to detect media type from URL or data URL
    const detectMediaType = (mediaSource) => {
      if (!mediaSource) return null;
      
      // If it's already an object with type, return that
      if (mediaSource.type) return mediaSource.type;
      
      // Handle data URLs
      if (mediaSource.startsWith('data:')) {
        if (mediaSource.startsWith('data:video/')) return 'video';
        if (mediaSource.startsWith('data:image/')) return 'image';
        return null;
      }

      if (mediaSource instanceof File) {
        return mediaSource.type.startsWith('video/') ? 'video' : 
        mediaSource.type.startsWith('image/') ? 'image' : null;
      }

      
      // Handle regular URLs by checking common extensions
      const url = mediaSource.toLowerCase();
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/)) return 'image';
      if (url.match(/\.(mp4|webm|mov|avi|mkv)($|\?)/)) return 'video';
      
      return null;
    };

    const loadVideo = (source) => {
      if (!videoRef.current) return;
      
      setIsVideoLoaded(false);
      
      if (source instanceof File) {
        videoRef.current.src = URL.createObjectURL(source);
      } else if (typeof source === 'string') {
        videoRef.current.src = source;
      }
    };

    // Update your existing isVideo check
    const isVideo = templateSettings.media && (
      (templateSettings.media instanceof File && templateSettings.media.type.startsWith('video/')) ||
      (typeof templateSettings.media === 'object' && templateSettings.media.type === 'video') ||
      (typeof templateSettings.media === 'string' && 
        (templateSettings.media.startsWith('data:video/') || 
         templateSettings.media.match(/\.(mp4|webm|mov|avi|mkv)($|\?)/i)))
    );

    // Update your existing isImage check
    const isImage = templateSettings.media && (
      (typeof templateSettings.media === 'object' && templateSettings.media.type === 'image') ||
      (typeof templateSettings.media === 'string' && 
        (templateSettings.media.startsWith('data:image/') || 
         templateSettings.media.match(/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i)))
    );


    function drawFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (templateSettings.media) {
        const mediaSource = templateSettings.media;
        
        if (isVideo) {
          if (!videoSource || videoSource !== mediaSource) {
            setVideoSource(mediaSource);
            loadVideo(mediaSource);
          }
          
          if (videoRef.current) {
            drawContent(videoRef.current);
          }
        } else if (isImage && img) {
          drawContent(img);
        }
      } else {
        ctx.fillStyle = templateSettings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      drawText();
      animationFrameId = requestAnimationFrame(drawFrame);
    }
    
    if (templateSettings.media && isImage) {
      img = new Image();
      img.src = typeof templateSettings.media === 'object' ? 
        templateSettings.media.url : templateSettings.media;
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

  const isVideo = templateSettings.media && templateSettings.media.type === 'video';
  console.log(templateSettings.media)
  
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
            style={{ display: 'none' }}
            loop
            muted
            autoPlay={true}
            onLoadedData={() => setIsVideoLoaded(true)}
            onError={() => {
              console.error('Error loading video');
              setIsVideoLoaded(false);
            }}
          />
        )}
        <div className="flex space-y-3 flex-col">
        {isVideo && (
          <Button 
            className="w-full" 
            onClick={handlePreviewClick}
            disabled={isLoading || (isVideo && !isVideoReady)}
          >
            {isLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
          </Button>
        )}
        </div>
      </CardContent>
      <ToastContainer />
    </Card>
  );
};

export default TemplatePreview;