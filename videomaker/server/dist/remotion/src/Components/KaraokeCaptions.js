import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useCurrentFrame, useVideoConfig } from "remotion";
export const KaraokeCaptions = ({ data }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;
    const fadeOutOpacity = Math.min(1, frame / 60);
    const renderKaraokeText = () => {
        return data.captions.map((caption, captionIndex) => {
            // Check if this specific caption is active
            const isCaptionActive = currentTimeMs >= caption.startMs && currentTimeMs <= caption.endMs;
            // If this caption is not active, return null
            if (!isCaptionActive)
                return null;
            // Split caption into words
            const words = caption.text.split(" ");
            // Calculate how many words to color based on current time
            const totalCaptionDuration = caption.endMs - caption.startMs;
            const wordsColorProgress = Math.floor(((currentTimeMs - caption.startMs) / totalCaptionDuration) *
                words.length);
            return (_jsx("div", { style: {
                    position: "absolute",
                    bottom: `${data.marginTop}px`,
                    left: `${data.marginLeft}px`,
                    width: "100%",
                    textAlign: "center",
                    zIndex: 10,
                }, children: _jsx("div", { style: {
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        width: "100%",
                        opacity: fadeOutOpacity,
                    }, children: words.map((word, wordIndex) => {
                        // Determine if this word should be colored
                        const isColored = wordIndex < wordsColorProgress;
                        return (_jsx("span", { style: {
                                color: isColored ? data.textColor : data.textOutline,
                                fontFamily: data.fontFamily,
                                fontWeight: "bold",
                                fontSize: `${data.fontSize}px`,
                                marginRight: `${data.marginRight}px`,
                                marginLeft: `${data.marginRight}px`,
                                textShadow: `1px 1px 0 ${data.strokeColor}, 
                                 -1px -1px 0 ${data.strokeColor}`,
                                opacity: fadeOutOpacity,
                            }, children: word }, wordIndex));
                    }) }) }, captionIndex));
        });
    };
    return _jsx(_Fragment, { children: renderKaraokeText() });
};
