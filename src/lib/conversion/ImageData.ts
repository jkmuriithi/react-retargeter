/**
 * Rescales the given width and height to fit the window at the same aspect
 * ratio.
 */
function getScaledDimensions(dimObject: { width: number; height: number }): {
    width: number;
    height: number;
} {
    const WINDOW_SCALING_FACTOR = 0.7;
    const { width: orgWidth, height: orgHeight } = dimObject;

    if (orgWidth > orgHeight) {
        const width = Math.min(
            orgWidth,
            window.innerWidth * WINDOW_SCALING_FACTOR
        );
        return { width, height: width * (orgHeight / orgWidth) };
    } else {
        const height = Math.min(
            orgHeight,
            window.innerHeight * WINDOW_SCALING_FACTOR
        );
        return { width: height * (orgWidth / orgHeight), height };
    }
}

/**
 * Takes in a URL path, Blob, or File object representing a local image file and
 * resolves to a corresponding ImageData object. Depends on DOM manipulation.
 */
async function toImageData(
    localFile: string | Blob | File
): Promise<ImageData> {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    if (typeof localFile === "string") {
        const image = document.createElement("img");
        image.src = localFile;

        // Wait for the image to be processed
        await image.decode();

        const { width, height } = getScaledDimensions({
            width: image.naturalWidth,
            height: image.naturalHeight,
        });

        canvas.width = width;
        canvas.height = height;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, width, height);

        image.remove();
    } else {
        const bitmap = await createImageBitmap(localFile);
        const { width, height } = getScaledDimensions(bitmap);

        canvas.width = width;
        canvas.height = height;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(bitmap, 0, 0, width, height);
    }

    const data = context.getImageData(0, 0, canvas.width, canvas.height);
    canvas.remove();

    return data;
}

export { toImageData };
