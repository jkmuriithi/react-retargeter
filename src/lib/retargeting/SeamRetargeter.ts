import Retargeter from "./Retargeter";

/**
 * Implements seam carving and seam insertion.
 * Inspired by a Princeton COS226 assignment developed by Josh Hug,
 * Maia Ginsburg, and Kevin Wayne.
 * @see {@link https://www.cs.princeton.edu/courses/archive/spring20/cos226/assignments/seam/specification.php}
 */
class SeamRetargeter extends Retargeter {
    /** The current state of the retargeted image. */
    public readonly imageData: ImageData;

    /**
     * energies[row][col] gives the value of the dual-gradient energy function
     * for the pixel at (row, col).
     */
    private energies: number[][];

    /**  */

    /**
     * Creates a new SeamCarver object. A deep copy of the given ImageData is
     * created to prevent outside mutations.
     */
    constructor(imageData: ImageData) {
        super();

        const { width, height, data } = imageData;

        this.imageData = new ImageData(data.slice(), width, height);

        // Calculate initial pixel energies
        this.energies = [];
        for (let i = 0; i < height; i++) {
            this.energies[i] = [];
            for (let j = 0; j < width; j++) {
                this.energies[i][j] = this.calculateEnergy(i, j);
            }
        }
    }

    public shrinkHorizontal(n: number = 1): void {
        console.log(`shrinkHorizontal: ${n}`);
    }

    public shrinkVertical(n: number = 1): void {
        console.log(`shrinkVertical: ${n}`);
    }

    public growHorizontal(n: number = 1): void {
        console.log(`growHorizontal: ${n}`);
    }

    public growVertical(n: number = 1): void {
        console.log(`growVertical: ${n}`);
    }

    /**
     * Returns the color values for the pixel at (row, col) in RGBA order.
     * NOTE: Pixel coordinates are zero-indexed.
     */
    private getPixelValues(row: number, col: number): Uint8ClampedArray {
        const idx = row * this.imageData.width * 4 + col * 4;
        return this.imageData.data.subarray(idx, idx + 4);
    }

    /** Validates pixel coordinate range. */
    private pixelCoordsAreValid(row: number, col: number): boolean {
        return (
            row >= 0 &&
            col >= 0 &&
            row < this.imageData.height &&
            col < this.imageData.width
        );
    }

    /**
     * Calculates the dual gradient energy function for the pixel at (row, col).
     */
    private calculateEnergy(row: number, col: number): number {
        if (!this.pixelCoordsAreValid(row, col))
            throw new RangeError(`Invalid pixel coordinates: (${row}, ${col})`);

        // The pixel above
        const above =
            row > 0
                ? this.getPixelValues(row - 1, col)
                : this.getPixelValues(this.imageData.height - 1, col);

        // The pixel below
        const below =
            row < this.imageData.height - 1
                ? this.getPixelValues(row + 1, col)
                : this.getPixelValues(0, col);

        // y gradient
        const yGrad =
            (above[0] - below[0]) * (above[0] - below[0]) +
            (above[1] - below[1]) * (above[1] - below[1]) +
            (above[2] - below[2]) * (above[2] - below[2]);

        // Pixel to the left
        const left =
            col > 0
                ? this.getPixelValues(row, col - 1)
                : this.getPixelValues(row, this.imageData.width - 1);

        // Pixel to the right
        const right =
            col < this.imageData.width - 1
                ? this.getPixelValues(row, col + 1)
                : this.getPixelValues(row, 0);

        // x gradient
        const xGrad =
            (left[0] - right[0]) * (left[0] - right[0]) +
            (left[1] - right[1]) * (left[1] - right[1]) +
            (left[2] - right[2]) * (left[2] - right[2]);

        return Math.sqrt(yGrad + xGrad);
    }

    /** ImageData representation of the calculated pixel energies. */
    get energyImage(): ImageData {
        const { width, height } = this.imageData;

        const energyImage = new ImageData(
            new Uint8ClampedArray(new ArrayBuffer(width * height * 4)),
            width,
            height
        );

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const ener = this.energies[i][j];
                energyImage.data.set(
                    [ener, ener, ener, 255],
                    i * width * 4 + j * 4
                );
            }
        }

        return energyImage;
    }

    /**
     * Returns an array seam[] of length equal to the current width, for which
     * seam[i] is the row of the pixel to be removed from column i.
     */
    private findHorizontalSeam(): number[] {
        return [];
    }

    /**
     * Returns an array seam[] of length equal to the current height, for which
     * seam[i] is the column of the pixel to be removed from row i.
     */
    private findVerticalSeam(): number[] {
        return [];
    }

    private removeHorizontalSeam(seam: number[]): void {}

    private removeVerticalSeam(seam: number[]): void {}

    private insertHorizontalSeam(seam: number[]): void {}

    private insertVerticalSeam(seam: number[]): void {}
}

export default SeamRetargeter;
