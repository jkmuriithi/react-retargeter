interface ImageSize {
    /** Width of the image. */
    readonly width: number;
    /** Height of the image. */
    readonly height: number;
}

type ScalingFunction = (size: ImageSize) => ImageSize;

/**
 * Takes in a URL path, Blob, or File object representing a local image file and
 * resolves to a corresponding ImageData object. Uses an optional scaling
 * function to resize the incoming image data. Depends on DOM manipulation.
 */
async function toImageData(
    localFile: string | Blob | File,
    scalingFn?: ScalingFunction
): Promise<ImageData> {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    if (typeof localFile === "string") {
        const image = document.createElement("img");
        image.src = localFile;

        // Wait for the image to be processed
        await image.decode();

        const { width, height } =
            scalingFn !== undefined
                ? scalingFn({
                      width: image.naturalWidth,
                      height: image.naturalHeight,
                  })
                : {
                      width: image.naturalWidth,
                      height: image.naturalHeight,
                  };

        canvas.width = width;
        canvas.height = height;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, width, height);

        image.remove();
    } else {
        const bitmap = await createImageBitmap(localFile);
        const { width, height } =
            scalingFn !== undefined ? scalingFn(bitmap) : bitmap;

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

/**
 * Returns a scaling function which forces the incoming image to fit within a
 * bounding box of size
 * (`window.innerWidth * widthScale`, `window.innerHeight * heightScale`)
 */
function windowFitScaling(
    widthScale: number = 1.0,
    heightScale: number = 1.0
): ScalingFunction {
    if (
        Math.min(widthScale, heightScale) < 0.0 ||
        Math.max(widthScale, heightScale) > 1.0
    ) {
        throw new RangeError("Invalid scale factor.");
    }

    return (size) => {
        const { width: orgWidth, height: orgHeight } = size;
        const fitWidth = Math.floor(window.innerWidth * widthScale);
        const fitHeight = Math.floor(window.innerHeight * heightScale);

        if (orgWidth > fitWidth || orgHeight > fitHeight) {
            if (fitWidth > fitHeight) {
                console.log("Scaled height");
                return {
                    width: fitHeight * (orgWidth / orgHeight),
                    height: fitHeight,
                };
            } else {
                console.log("Scaled width");
                return {
                    width: fitWidth,
                    height: fitWidth * (orgHeight / orgWidth),
                };
            }
        }

        return { width: orgWidth, height: orgHeight };
    };
}

export type { ImageSize, ScalingFunction };
export { toImageData, windowFitScaling };
