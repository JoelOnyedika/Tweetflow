import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const renderVideo = async ({ videoId, data }) => {
  // Validate inputs
  if (!videoId) {
    throw new Error('Video ID is required');
  }
  if (!data) {
    throw new Error('Video data is required');
  }

  try {
    // Ensure generated-videos directory exists
    const outputDir = path.join(process.cwd(), 'generated-videos');
    fs.mkdirSync(outputDir, { recursive: true });

    const remotionProjectRoot = path.resolve('./remotion');
 
    const bundleLocation = await bundle(
      path.join(remotionProjectRoot, 'src/Root.tsx'),
      undefined,
      {
        webpackOverride: (config) => config,
      }
    );

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'Videomaker',
    });

    if (!composition) {
      throw new Error('Composition with ID "Videomaker" not found.');
    }

    const outputLocation = path.join(outputDir, `${videoId}.mp4`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      outputLocation,
      codec: 'h264',
      inputProps: {
        data,
      },
    });

    return `/generated-videos/${videoId}.mp4`;
  } catch (error) {
    console.error('Error while rendering video:', error);
    throw new Error(`Video rendering failed: ${error.message}`);
  }
};

export default renderVideo;