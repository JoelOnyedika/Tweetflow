import { OffthreadVideo, Img } from "remotion";

export const Media = ({ data }) => {
  return (
    <Img
      src={data.media}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
      }}
    />
  );
};
