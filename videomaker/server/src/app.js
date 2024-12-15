import express from "express";
import cors from "cors";
import helmet from "helmet";
import renderVideo from "./remotion/videoRenderer.js";

const app = express();
app.use(cors());
app.use(express.json());
// app.use(helmet());

// const allowedOrigins = [`${process.env.BACKEND_SERVER_URL}`];
// const API_KEY = process.env.API_KEY;

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin))
//         return callback(null, true);
//       callback(new Error("Not allowed by CORS"));
//     },
//   })
// );

// app.use((req, res, next) => {
//   const clientApiKey = req.header("x-api-key");
//   if (clientApiKey && clientApiKey === API_KEY) {
//     next();
//   } else {
//     res.status(403).json({ error: { message: "Forbidden: Invalid API key" } });
//   }
// });

app.get("/api/test", async (req, res) => {
  res.send("Done")
})

app.post("/api/create-video", async (req, res) => {
  try {
    const videoSettings = req.body;
    console.log(videoSettings)

    // Validate video settings
    if (!videoSettings || typeof videoSettings !== "object") {
      return res.status(400).json({
        error: { message: "Invalid video settings provided." },
      });
    }

    const videoId = `video-${Date.now()}`;

    const videoPath = await renderVideo({
      videoId,
      inputProps: videoSettings,
    });

    res.json({ data: { videoPath: videoPath, videoId: videoId } });
  } catch (error) {
    console.log(error);
    return res.json({
      error: { message: "Whoops something went wrong while convertiong video" },
    });
  }
});

const PORT = 5054;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
