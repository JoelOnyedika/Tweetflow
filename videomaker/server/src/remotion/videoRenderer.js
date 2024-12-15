import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renderVideo = async ({ videoId, inputProps }) => {
  // Validate inputs
  if (!videoId) {
    throw new Error('Video ID is required');
  }
  if (!inputProps) {
    throw new Error('Video inputProps is required');
  }

  try {
    // Ensure generated-videos directory exists
    const outputDir = path.join(process.cwd(), 'generated-videos');
    fs.mkdirSync(outputDir, { recursive: true });

    // Use __dirname to resolve the correct path to the entry point
    const bundleLocation = await bundle({
      entryPoint: path.resolve(__dirname, './src/index.js'),
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'Videomaker',
      inputProps,
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
      inputProps,
    });

    console.log('render done')

    return `/generated-videos/${videoId}.mp4`;
  } catch (error) {
    console.error('Error while rendering video:', error);
    throw new Error(`Video rendering failed: ${error.message}`);
  }
};

export default renderVideo;