import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { AbsoluteFill } from "remotion";
import { Media } from "./Components/Media";
import { KaraokeCaptions } from "./Components/KaraokeCaptions";
export const myCompSchema = z.object({
    titleText: z.string(),
    titleColor: zColor(),
    logoColor1: zColor(),
    logoColor2: zColor(),
});
export const VideoMaker = ({ data }) => {
    // const lastCaption = data.captions[data.captions.length - 1];
    // durationInFrames(Math.ceil((lastCaption.endMs / 1000) * data.fps));
    return (_jsxs(AbsoluteFill, { children: [_jsx(Media, { data: data }), _jsx(AbsoluteFill, { style: {
                    justifyContent: "center",
                    alignItems: "flex-end",
                    paddingBottom: "100px",
                }, children: _jsx(KaraokeCaptions, { data: data }) })] }));
};
