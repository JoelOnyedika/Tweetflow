import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Img } from "remotion";
// import {data} from "../utils/constants"
export const Media = ({ data }) => {
    const [media, setMedia] = useState(data.media);
    return (_jsx(Img, { src: data, style: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
        } }));
};
