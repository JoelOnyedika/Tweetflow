import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { renderVideo } from "./remotion/videoRenderer";

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

app.post("/api/create-video", async (req: Request, res: Response) => {
  try {
    const videoSettings = req.body;

    // Validate video settings
    if (!videoSettings || typeof videoSettings !== "object") {
      return res.status(400).json({
        error: { message: "Invalid video settings provided." },
      });
    }

    const videoId = `video-${Date.now()}`;

    const videoPath = await renderVideo({
      videoId,
      data: videoSettings,
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
