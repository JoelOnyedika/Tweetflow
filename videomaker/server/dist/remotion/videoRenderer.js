import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
export const renderVideo = async ({ videoId, data }) => {
    try {
        // Path to your Remotion project's root
        const remotionProjectRoot = path.resolve('./remotion');
        // Bundle the Remotion project
        const bundleLocation = await bundle(path.join(remotionProjectRoot, 'src/Root.tsx'), undefined, {
            webpackOverride: (config) => config, // If you have webpack customizations
        });
        // Select the composition
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'Videomaker',
        });
        // Validate composition
        if (!composition) {
            throw new Error('Composition with ID "Videomaker" not found.');
        }
        // Output path for the video
        const outputLocation = path.join(process.cwd(), 'generated-videos', `${videoId}.mp4`);
        // Render the video with settings
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            outputLocation,
            codec: 'h264',
            inputProps: {
                data, // Pass the data correctly here
            },
        });
        // Return relative path or URL to the video
        return `/generated-videos/${videoId}.mp4`;
    }
    catch (error) {
        console.error('Error while rendering video:', error);
        return 'Failed to render video';
    }
};
