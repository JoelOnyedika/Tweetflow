import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
// import { data } from "../utils/constants";

const captions = [
  {
    text: "Welcome to my Awesome TikTok Style Rolling Caption",
    startMs: 0,
    endMs: 3000,
  },
  {
    text: "This is a second caption with a cool rolling effect",
    startMs: 3000,
    endMs: 6000,
  },
  {
    text: "Watch how the text smoothly appears word by word",
    startMs: 6000,
    endMs: 9000,
  },
];

export const RollingTextCaptions = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;

  const renderRollingText = () => {
    return captions.map((caption, captionIndex) => {
      // Check if this specific caption is active
      const isCaptionActive =
        currentTimeMs >= caption.startMs && currentTimeMs <= caption.endMs;

      // If this caption is not active, return null
      if (!isCaptionActive) return null;

      // Split caption into words
      const words = caption.text.split(" ");

      // Calculate how many words to show based on current time
      const totalCaptionDuration = caption.endMs - caption.startMs;
      const wordsToShow = Math.floor(
        ((currentTimeMs - caption.startMs) / totalCaptionDuration) *
          words.length,
      );

      return (
        <div
          key={captionIndex}
          style={{
            position: "absolute",
            bottom: `${data.marginTop}px`,
            left: `${data.marginLeft}px`,
            width: "100%",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {words.slice(0, wordsToShow).map((word, wordIndex) => (
              <span
                key={wordIndex}
                style={{
                  color: data.textColor,
                  fontFamily: data.fontFamily,
                  fontWeight: "bold",
                  fontSize: `${data.fontSize}px`,
                  marginRight: `${data.marginRight}px`,
                  marginLeft: `${data.marginRight}px`,
                  textShadow: `1px 1px 0 ${data.strokeColor}, 
                               -1px -1px 0 ${data.strokeColor}`,
                  opacity: 1,
                  animation: "fadeIn 0.5s ease-in-out",
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      {renderRollingText()}
    </>
  );
};

// Calculate total video duration based on captions
export const calculateVideoDuration = (fps) => {
  const lastCaption = captions[captions.length - 1];
  return Math.ceil((lastCaption.endMs / 1000) * fps);
};
