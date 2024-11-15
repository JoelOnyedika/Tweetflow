import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TIKTOK_WIDTH, TIKTOK_HEIGHT } from "./TemplateCreator";
import { useToast } from "@/components/customs/Toast";
import UploadDialog from "@/components/customs/UploadDialog";

const TemplatePreview = ({ templateSettings }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const { showToast, ToastContainer } = useToast();
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  
  const [mediaPreview, setMediaPreview] = useState({
    url: null,
    lastProcessedFile: null,
    lastProcessedUrl: null
  });

  const memoizedShowToast = useCallback((message) => showToast(message), [showToast]);

  const processMedia = useMemo(() => {
    const isValidUrl = (string) => {
      try {
        new URL(string);
        return true;
      } catch (err) {
        return false;
      }
    };

    const generateVideoThumbnail = async (videoSource) => {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = "anonymous"; // Enable CORS for remote videos
        
        if (videoSource instanceof File) {
          video.src = URL.createObjectURL(videoSource);
        } else {
          video.src = videoSource;
        }
        
        video.onloadedmetadata = () => {
          const seekTime = Math.min(1, video.duration / 2);
          video.currentTime = seekTime;
        };

        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const thumbnailUrl = canvas.toDataURL('image/jpeg');
          if (videoSource instanceof File) {
            URL.revokeObjectURL(video.src);
          }
          video.remove();
          resolve(thumbnailUrl);
        };

        video.onerror = () => {
          if (videoSource instanceof File) {
            URL.revokeObjectURL(video.src);
          }
          reject(new Error("Error generating video thumbnail"));
        };
      });
    };

    const loadImage = async (imageSource) => {
      return new Promise((resolve, reject) => {
        if (imageSource instanceof File) {
          resolve(URL.createObjectURL(imageSource));
        } else {
          // For URLs, we can use them directly
          resolve(imageSource);
        }
      });
    };

    return async (media) => {
      if (!media || 
          (media === mediaPreview.lastProcessedFile) || 
          (media === mediaPreview.lastProcessedUrl)) return;

      setIsFileUploading(true);
      setLoadingStatus('Preparing preview...');
      setLoadingProgress(0);

      try {
        let previewUrl;
        const isUrl = typeof media === 'string' && isValidUrl(media);
        const mediaSource = isUrl ? media : media;

        if (isUrl) {
          // Handle URL - check if it's a video or image by extension
          const isVideo = /\.(mp4|webm|ogg)$/i.test(media);
          previewUrl = isVideo ? 
            await generateVideoThumbnail(media) : 
            await loadImage(media);
        } else {
          // Handle File object
          if (media.type?.startsWith('video')) {
            previewUrl = await generateVideoThumbnail(media);
          } else if (media.type?.startsWith('image')) {
            previewUrl = await loadImage(media);
          }
        }

        setMediaPreview({
          url: previewUrl,
          lastProcessedFile: isUrl ? null : media,
          lastProcessedUrl: isUrl ? media : null
        });
        setLoadingProgress(100);
      } catch (error) {
        console.error('Error processing media:', error);
        showToast('Error preparing media preview', 'error');
      } finally {
        setIsFileUploading(false);
      }
    };
  }, [mediaPreview.lastProcessedFile, mediaPreview.lastProcessedUrl, showToast]);

  // Rest of your code remains exactly the same...
  useEffect(() => {
    if (templateSettings.media) {
      processMedia(templateSettings.media);
    } else {
      setMediaPreview({ url: null, lastProcessedFile: null, lastProcessedUrl: null });
    }
  }, [templateSettings.media]);

  // Canvas resize effect
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

  // Your existing drawConfig and canvas drawing effects remain the same...
  const drawConfig = useMemo(() => ({
    backgroundColor: templateSettings.backgroundColor || '#ffffff',
    text: templateSettings.text,
    fontSize: templateSettings.fontSize,
    fontFamily: templateSettings.fontFamily,
    textColor: templateSettings.textColor,
    textOutline: templateSettings.textOutline,
    marginLeft: templateSettings.marginLeft,
    marginTop: templateSettings.marginTop,
    lineHeight: templateSettings.lineHeight
  }), [
    templateSettings.backgroundColor,
    templateSettings.text,
    templateSettings.fontSize,
    templateSettings.fontFamily,
    templateSettings.textColor,
    templateSettings.textOutline,
    templateSettings.marginLeft,
    templateSettings.marginTop,
    templateSettings.lineHeight
  ]);

  useEffect(() => {
    if (!canvasRef.current || !canvasSize.width || !canvasSize.height) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const drawCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background or media
      if (mediaPreview.url) {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Enable CORS for remote images
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let drawWidth, drawHeight, offsetX, offsetY;

          if (aspectRatio > canvas.width / canvas.height) {
            drawHeight = canvas.height;
            drawWidth = drawHeight * aspectRatio;
            offsetY = 0;
            offsetX = (canvas.width - drawWidth) / 2;
          } else {
            drawWidth = canvas.width;
            drawHeight = drawWidth / aspectRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          drawText();
        };
        img.src = mediaPreview.url;
      } else {
        ctx.fillStyle = drawConfig.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawText();
      }
    };

    const drawText = () => {
      if (!drawConfig.text) return;

      ctx.font = `${drawConfig.fontSize}px ${drawConfig.fontFamily}`;
      ctx.fillStyle = drawConfig.textColor;
      ctx.strokeStyle = drawConfig.textOutline;
      ctx.lineWidth = 2;

      const scaleFactor = canvas.width / TIKTOK_WIDTH;
      const scaledMarginLeft = drawConfig.marginLeft * scaleFactor;
      const scaledMarginTop = drawConfig.marginTop * scaleFactor;
      const lineHeight = drawConfig.fontSize * drawConfig.lineHeight * scaleFactor;
      
      const maxWidth = canvas.width - (scaledMarginLeft * 2);
      const words = drawConfig.text.split(' ');
      let currentLine = '';
      let y = scaledMarginTop;

      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          ctx.strokeText(currentLine, scaledMarginLeft, y);
          ctx.fillText(currentLine, scaledMarginLeft, y);
          currentLine = word;
          y += lineHeight;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) {
        ctx.strokeText(currentLine, scaledMarginLeft, y);
        ctx.fillText(currentLine, scaledMarginLeft, y);
      }
    };

    drawCanvas();
  }, [mediaPreview.url, drawConfig, canvasSize]);

  return (
    <Card className="w-full">
      {isFileUploading && (
        <UploadDialog 
          text={loadingStatus}
          percentLoaded={loadingProgress}
          isFileUploading={isFileUploading}
        />
      )}
      <CardContent className="p-6" ref={containerRef}>
        <h2 className="text-2xl font-semibold mb-4">Template Preview</h2>
        <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="absolute top-0 left-0 w-full h-full border border-gray-300"
          />
        </div>
      </CardContent>
      <ToastContainer />
    </Card>
  );
};

export default TemplatePreview;