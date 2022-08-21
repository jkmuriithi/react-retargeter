/**
 * Draws ImageData to a canvas, automatically resizing the canvas and any given
 * containing element.
 */
function drawToCanvas(
    image: ImageData,
    canvas: HTMLCanvasElement | null,
    container?: HTMLElement | null
) {
    if (canvas === null || container === null) {
        throw new Error("Received null element.");
    }

    const { width, height } = image;

    if (container !== undefined) {
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.putImageData(image, 0, 0);
}

export { drawToCanvas };
