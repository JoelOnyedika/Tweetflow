import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { data } from "../utils/constants";

export const KaraokeCaptions = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;
  const fadeOutOpacity = Math.min(1, frame / 60);

  const renderKaraokeText = () => {
    return data.captions.map((caption, captionIndex) => {
      // Check if this specific caption is active
      const isCaptionActive =
        currentTimeMs >= caption.startMs && currentTimeMs <= caption.endMs;

      // If this caption is not active, return null
      if (!isCaptionActive) return null;

      // Split caption into words
      const words = caption.text.split(" ");

      // Calculate how many words to color based on current time
      const totalCaptionDuration = caption.endMs - caption.startMs;
      const wordsColorProgress = Math.floor(
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
              opacity: fadeOutOpacity,
            }}
          >
            {words.map((word, wordIndex) => {
              // Determine if this word should be colored
              const isColored = wordIndex < wordsColorProgress;

              return (
                <span
                  key={wordIndex}
                  style={{
                    color: isColored ? data.textColor : data.textOutline,
                    fontFamily: data.fontFamily,
                    fontWeight: "bold",
                    fontSize: `${(data.fontSize / 300) * width}px`,
                    marginRight: `${data.marginRight}px`,
                    marginLeft: `${data.marginRight}px`,
                    textShadow: `1px 1px 0 ${data.strokeColor}, 
                                 -1px -1px 0 ${data.strokeColor}`,
                    opacity: fadeOutOpacity,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return <>{renderKaraokeText()}</>;
};

// Calculate total video duration based on data.captions
