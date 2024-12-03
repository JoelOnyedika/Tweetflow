import "./tailwind.css";
import { Composition, getInputProps } from "remotion";
import { VideoMaker } from "./VideoMaker";
import { useState } from "react";
// import { data } from "./utils/constants";

export const RemotionRoot: React.FC = () => {

  const inputProps = getInputProps();

  return (
    <>
      <Composition
        id="Videomaker"
        component={VideoMaker}
        durationInFrames={inputProps?.data.duration_in_frames ?? 500}
        fps={inputProps?.data.fps ?? 30}
        width={1080}
        height={1920}
        defaultProps={{
          data: [],
        }}
      />
    </>
  );
};
