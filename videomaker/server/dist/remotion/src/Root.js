import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import "./tailwind.css";
import { Composition, getInputProps } from "remotion";
import { VideoMaker } from "./VideoMaker";
// import { data } from "./utils/constants";
export const RemotionRoot = () => {
    const inputProps = getInputProps();
    return (_jsx(_Fragment, { children: _jsx(Composition, { id: "Videomaker", component: VideoMaker, durationInFrames: inputProps?.data.duration_in_frames ?? 500, fps: inputProps?.data.fps ?? 30, width: 1080, height: 1920, defaultProps: {
                data: [],
            } }) }));
};
