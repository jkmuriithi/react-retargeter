/**
 * Implements an API which allows clients to retarget an image represented by
 * an ImageData object in real-time.
 */
abstract class Retargeter {
    /**
     * The current state of the retargeted image.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
     */
    public abstract imageData: ImageData;

    /**
     * Reduces the horizontal dimension of an image by n pixels, or, if no
     * argument is given, by one pixel.
     */
    public abstract shrinkHorizontal(n?: number): void;

    /**
     * Reduces the vertical dimension of an image by n pixels, or, if no
     * argument is given, by one pixel.
     */
    public abstract shrinkVertical(n?: number): void;

    /**
     * Increases the horizontal dimension of an image by n pixels, or, if no
     * argument is given, by one pixel.
     */
    public abstract growHorizontal(n?: number): void;

    /**
     * Increases the vertical dimension of an image by n pixels, or, if no
     * argument is given, by one pixel.
     */
    public abstract growVertical(n?: number): void;
}

export default Retargeter;
