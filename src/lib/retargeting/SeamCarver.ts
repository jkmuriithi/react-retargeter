import Retargeter from "./Retargeter";

/**
 * An implmentation of the seam carving algorithm. Inspired by
 * {forthcoming COS226 citation}
 */
class SeamCarver extends Retargeter {
    /** The current state of the retargeted image. */
    public readonly imageData: ImageData;

    /**
     * energy[row][col] gives the value of the dual-gradient energy function for
     * the pixel at (row, col).
     */
    private energies: Uint8ClampedArray;

    /**
     * Creates a new SeamCarver object. A deep copy of the given ImageData is
     * created to prevent outside mutations.
     */
    constructor(imageData: ImageData) {
        super();

        const { width, height, data } = imageData;

        this.imageData = new ImageData(data.slice(), width, height);

        // Calculate initial pixel energies
        this.energies = new Uint8ClampedArray(new ArrayBuffer(width * height));

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                this.energies[i * width + j] = this.calculateEnergy(i, j);
            }
        }
    }

    /** An ImageData representation of the calculated pixel energies. */
    get energyImage(): ImageData {
        const { width, height } = this.imageData;

        const energyImage = new ImageData(
            new Uint8ClampedArray(new ArrayBuffer(width * height * 4)),
            width,
            height
        );

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const ener = this.getEnergyValue(i, j);
                energyImage.data.set(
                    [ener, ener, ener, 255],
                    i * width * 4 + j * 4
                );
            }
        }

        return energyImage;
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
     * Returns the color values for the pixel at (row, col) in RGBA order.
     * NOTE: Pixel coordinates are zero-indexed.
     */
    private getPixelValues(row: number, col: number): Uint8ClampedArray {
        const idx = row * this.imageData.width * 4 + col * 4;
        return this.imageData.data.subarray(idx, idx + 4);
    }

    /** Returns the dual-gradient energy value for the pixel at (row, col). */
    private getEnergyValue(row: number, col: number): number {
        if (!this.pixelCoordsAreValid(row, col))
            throw new RangeError(`Invalid pixel coordinates: (${row}, ${col})`);
        return this.energies[row * this.imageData.width + col];
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

    public shrinkHorizontal(n?: number): void {}

    public shrinkVertical(n?: number): void {}

    public growHorizontal(n?: number): void {}

    public growVertical(n?: number): void {}
}

export default SeamCarver;
