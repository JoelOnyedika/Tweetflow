import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { AbsoluteFill } from "remotion";
import { Media } from "./Components/Media";
import { KaraokeCaptions } from "./Components/KaraokeCaptions";
import { RollingTextCaptions } from "./Components/RollingTextCaptions";

export const VideoMaker = ({ data }) => {
  // const lastCaption = data.captions[data.captions.length - 1];
  // durationInFrames(Math.ceil((lastCaption.endMs / 1000) * data.fps));

  return (
    <AbsoluteFill>
      <Media data={data} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-end",
          paddingBottom: "100px",
        }}
      >
        <KaraokeCaptions data={data} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
