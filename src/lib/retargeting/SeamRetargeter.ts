import Retargeter from "./Retargeter";

/**
 * Implements seam carving and seam insertion.
 * Inspired by a Princeton COS226 assignment developed by Josh Hug,
 * Maia Ginsburg, and Kevin Wayne.
 * @see {@link https://www.cs.princeton.edu/courses/archive/spring20/cos226/assignments/seam/specification.php}
 */
class SeamRetargeter extends Retargeter {
    /** The current state of the retargeted image. */
    public imageData: ImageData;

    /**
     * energies[row][col] gives the value of the dual-gradient energy function
     * for the pixel at (row, col).
     */
    private energies: number[][];

    /**
     * Creates a new SeamCarver object. A deep copy of the given ImageData is
     * created to prevent outside mutations.
     */
    constructor(imageData: ImageData) {
        super();

        const { width, height, data } = imageData;

        this.imageData = new ImageData(data.slice(), width, height);

        // Calculate initial pixel energies
        this.energies = Array.from({ length: height }, () =>
            new Array(width).fill(0)
        );
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                this.calculateEnergy(i, j);
            }
        }
    }

    public shrinkHorizontal(n: number = 1): void {
        for (let _ = 0; _ < n; _++) {
            const { width, height } = this.imageData;
            console.time(`Horizontal - width: ${width}, height: ${height}`);
            this.removeVerticalSeam(this.findVerticalSeam());
            console.timeEnd(`Horizontal - width: ${width}, height: ${height}`);
        }
    }

    public shrinkVertical(n: number = 1): void {
        for (let _ = 0; _ < n; _++) {
            const { width, height } = this.imageData;
            console.time(`Vertical - width: ${width}, height: ${height}`);
            this.removeHorizontalSeam(this.findHorizontalSeam());
            console.timeEnd(`Vertical - width: ${width}, height: ${height}`);
        }
    }

    public growHorizontal(n: number = 1): void {
        console.log(`growHorizontal: ${n}`);
    }

    public growVertical(n: number = 1): void {
        console.log(`growVertical: ${n}`);
        this.insertHorizontalSeam(Array(this.imageData.width).fill(100));
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
     * Draws the return value of findHorizontalSeam() on the current image in
     * red.
     */
    public drawHorizontalSeam(): void {
        this.findHorizontalSeam().forEach((val, idx) => {
            this.setPixelValues(val, idx, [255, 0, 0, 255]);
        });
    }

    /**
     * Draws the return value of findVerticalSeam() on the current image in
     * red.
     */
    public drawVerticalSeam(): void {
        this.findVerticalSeam().forEach((val, idx) => {
            this.setPixelValues(idx, val, [255, 0, 0, 255]);
        });
    }

    /**
     * Returns the color values for the pixel at (row, col) in RGBA order.
     * NOTE: Pixel coordinates are zero-indexed.
     */
    private getPixelValues(
        row: number,
        col: number,
        imgData: ImageData = this.imageData
    ): Uint8ClampedArray {
        const idx = row * imgData.width * 4 + col * 4;
        return imgData.data.subarray(idx, idx + 4);
    }

    /**
     * Sets the color values for the pixel at (row, col).
     * NOTE: Pixel coordinates are zero-indexed.
     */
    private setPixelValues(
        row: number,
        col: number,
        values: ArrayLike<number>,
        imgData: ImageData = this.imageData
    ): void {
        return imgData.data.set(values, row * imgData.width * 4 + col * 4);
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
     * Sets energies[row][col] to the current value of the dual gradient energy
     * function for the pixel at (row, col)
     */
    private calculateEnergy(row: number, col: number): void {
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

        this.energies[row][col] = Math.sqrt(yGrad + xGrad);
    }

    private recalculateEnergy(row: number, col: number) {}

    /**
     * Returns an array seam[] of length equal to the current width, for which
     * seam[i] is the row of the pixel to be removed from column i, going from
     * left to right
     */
    private findHorizontalSeam(): number[] {
        const { width, height } = this.imageData;

        /**
         * distTo[row][col] = energy of the minimum path from pixel (row, col)
         * to the left edge of the image.
         */
        const distTo: number[][] = Array.from({ length: height }, () =>
            new Array(width).fill(Number.POSITIVE_INFINITY)
        );

        /**
         * edgeTo[row][col] = row of the pixel immediately before pixel
         * (row, col) in the minimum energy path to the left edge of the image.
         */
        const edgeTo: number[][] = Array.from({ length: height }, () =>
            new Array(width).fill(0)
        );

        // Let the distance values of the leftmost column of pixels be their
        // energy values
        for (let i = 0; i < height; i++) distTo[i][0] = this.energies[i][0];

        for (let col = 1; col < width; col++) {
            for (let row = 0; row < height; row++) {
                // Upper pixel in the prior column
                const upper =
                    row > 0
                        ? distTo[row - 1][col - 1]
                        : Number.POSITIVE_INFINITY;

                // Middle pixel in the prior column
                const middle = distTo[row][col - 1];

                // Lower pixel in the prior column
                const lower =
                    row < height - 1
                        ? distTo[row + 1][col - 1]
                        : Number.POSITIVE_INFINITY;

                const min = Math.min(upper, middle, lower);

                if (min === upper) edgeTo[row][col] = row - 1;
                else if (min === middle) edgeTo[row][col] = row;
                else if (min === lower) edgeTo[row][col] = row + 1;

                distTo[row][col] = min + this.energies[row][col];
            }
        }

        // Find minimum dist in the rightmost column
        let minDist = Number.POSITIVE_INFINITY;
        let min = Number.POSITIVE_INFINITY;
        for (let i = 0; i < height; i++) {
            const curr = distTo[i][width - 1];
            if (curr < minDist) {
                min = i;
                minDist = curr;
            }
        }

        // Backtrack to build seam
        const seam: number[] = Array(width).fill(0);
        seam[width - 1] = min;
        for (let i = width - 2; i >= 0; i--)
            seam[i] = edgeTo[seam[i + 1]][i + 1];

        return seam;
    }

    /**
     * Returns an array seam[] of length equal to the current height, for which
     * seam[i] is the column of the pixel to be removed from row i.
     */
    private findVerticalSeam(): number[] {
        const { width, height } = this.imageData;

        /**
         * distTo[row][col] = energy of the minimum path from pixel (row, col)
         * to the top edge of the image.
         */
        const distTo: number[][] = Array.from({ length: height }, () =>
            new Array(width).fill(Number.POSITIVE_INFINITY)
        );

        /**
         * edgeTo[row][col] = col of the pixel immediately before pixel
         * (row, col) in the minimum energy path to the top edge of the image.
         */
        const edgeTo: number[][] = Array.from({ length: height }, () =>
            new Array(width).fill(0)
        );

        // Let the distance values of the topmost row of pixels be their
        // energy values
        for (let j = 0; j < width; j++) distTo[0][j] = this.energies[0][j];

        for (let row = 1; row < height; row++) {
            for (let col = 0; col < width; col++) {
                // Left pixel in the prior  row
                const left =
                    col > 0
                        ? distTo[row - 1][col - 1]
                        : Number.POSITIVE_INFINITY;

                // Middle pixel in the prior row
                const middle = distTo[row - 1][col];

                // Right pixel in the prior row
                const right =
                    col < width - 1
                        ? distTo[row - 1][col + 1]
                        : Number.POSITIVE_INFINITY;

                const min = Math.min(left, middle, right);

                if (min === left) edgeTo[row][col] = col - 1;
                else if (min === middle) edgeTo[row][col] = col;
                else if (min === right) edgeTo[row][col] = col + 1;

                distTo[row][col] = min + this.energies[row][col];
            }
        }

        // Find minimum dist in the botton row
        let minDist = Number.POSITIVE_INFINITY;
        let min = Number.POSITIVE_INFINITY;
        for (let j = 0; j < width; j++) {
            const curr = distTo[height - 1][j];
            if (curr < minDist) {
                min = j;
                minDist = curr;
            }
        }

        // Backtrack to build seam
        const seam = Array(height).fill(0);
        seam[height - 1] = min;
        for (let i = height - 2; i >= 0; i--)
            seam[i] = edgeTo[i + 1][seam[i + 1]];

        return seam;
    }

    /**
     * Removes a horizontal seam from the current image, resizes the image, and
     * recalculates the appropriate energies.
     */
    private removeHorizontalSeam(seam: number[]): void {
        const { width, height } = this.imageData;

        if (seam.length != width) throw new RangeError("Invalid seam length.");

        // Populate new ImageData
        const newData = new ImageData(
            new Uint8ClampedArray(new ArrayBuffer(width * (height - 1) * 4)),
            width,
            height - 1
        );

        for (let row = 0; row < height - 1; row++) {
            for (let col = 0; col < width; col++) {
                if (row < seam[col]) {
                    this.setPixelValues(
                        row,
                        col,
                        this.getPixelValues(row, col),
                        newData
                    );
                } else {
                    this.setPixelValues(
                        row,
                        col,
                        this.getPixelValues(row + 1, col),
                        newData
                    );

                    this.energies[row][col] = this.energies[row + 1][col];
                }
            }
        }

        this.imageData = newData;

        // Remove invalid energies
        this.energies.pop();

        // Recalculate energies

        // To the left of the leftmost entry
        if (seam[0] > 0) this.recalculateEnergy(seam[0] - 1, width - 1);
        if (seam[0] < height - 1) this.recalculateEnergy(seam[0], width - 1);
        if (seam[0] < height - 2)
            this.recalculateEnergy(seam[0] + 1, width - 1);

        // To the right of the rightmost entry
        if (seam[width - 1] > 0) this.recalculateEnergy(seam[width - 1] - 1, 0);
        if (seam[width - 1] < height - 1)
            this.recalculateEnergy(seam[width - 1], 0);
        if (seam[width - 1] < height - 2)
            this.recalculateEnergy(seam[width - 1] + 1, 0);

        // Along the seam
        for (let col = 0; col < width; col++) {
            if (seam[col] > 0) this.calculateEnergy(seam[col] - 1, col);
            if (seam[col] < height - 1) this.calculateEnergy(seam[col], col);
        }
    }

    /**
     * Removes a vertical seam from the current image, resizes the image, and
     * recalculates the appropriate energies.
     */
    private removeVerticalSeam(seam: number[]): void {
        const { width, height } = this.imageData;

        if (seam.length != height) throw new RangeError("Invalid seam length.");

        // Populate new ImageData
        const newData = new ImageData(
            new Uint8ClampedArray(new ArrayBuffer((width - 1) * height * 4)),
            width - 1,
            height
        );

        for (let col = 0; col < width - 1; col++) {
            for (let row = 0; row < height; row++) {
                if (col < seam[row]) {
                    this.setPixelValues(
                        row,
                        col,
                        this.getPixelValues(row, col),
                        newData
                    );
                } else {
                    this.setPixelValues(
                        row,
                        col,
                        this.getPixelValues(row, col + 1),
                        newData
                    );
                }
            }
        }

        this.imageData = newData;

        // Remove invalid energies
        for (let row = 0; row < height; row++)
            this.energies[row].splice(seam[row], 1);

        // Recalculate energies

        // Above the top entry
        if (seam[0] > 0) this.calculateEnergy(height - 1, seam[0] - 1);
        if (seam[0] < width - 1) this.calculateEnergy(height - 1, seam[0]);
        if (seam[0] < width - 2) this.calculateEnergy(height - 1, seam[0] + 1);

        // Below the bottom entry
        if (seam[height - 1] > 0) this.calculateEnergy(0, seam[height - 1] - 1);
        if (seam[height - 1] < width - 1)
            this.calculateEnergy(0, seam[height - 1]);
        if (seam[height - 1] < width - 2)
            this.calculateEnergy(0, seam[height - 1] + 1);

        // Along the seam
        for (let row = 0; row < height; row++) {
            if (seam[row] > 0) this.calculateEnergy(row, seam[row] - 1);
            if (seam[row] < width - 1) this.calculateEnergy(row, seam[row]);
        }
    }

    private insertHorizontalSeam(seam: number[]): void {
        const { width, height } = this.imageData;

        if (seam.length != width) throw new RangeError("Invalid seam length.");

        // Populate new ImageData
        const newData = new ImageData(
            new Uint8ClampedArray(new ArrayBuffer(width * (height + 1) * 4)),
            width,
            height + 1
        );

        for (let row = 0; row < height + 1; row++) {
            for (let col = 0; col < width; col++) {
                if (row < seam[col]) {
                    this.setPixelValues(
                        row,
                        col,
                        this.getPixelValues(row, col),
                        newData
                    );
                } else if (row > seam[col]) {
                    this.setPixelValues(
                        row,
                        col,
                        this.getPixelValues(row - 1, col),
                        newData
                    );
                } else {
                    const top =
                        seam[col] > 0
                            ? this.getPixelValues(seam[col] - 1, col)
                            : this.getPixelValues(height - 1, col);
                    const bottom =
                        seam[col] < height - 1
                            ? this.getPixelValues(seam[col] + 1, col)
                            : this.getPixelValues(0, col);
                    this.setPixelValues(
                        row,
                        col,
                        [
                            (top[0] + bottom[0]) * 0.5,
                            (top[1] + bottom[1]) * 0.5,
                            (top[2] + bottom[2]) * 0.5,
                            (top[3] + bottom[3]) * 0.5,
                        ],
                        newData
                    );
                }
            }
        }

        this.imageData = newData;

        // Make room for new energies
        this.energies.push(new Array(width).fill(0));

        // Move existing energies down from seam
        for (let row = height; row >= 0; row--) {
            for (let col = width - 1; col >= 0; col--) {
                if (row > seam[col])
                    this.energies[row][col] = this.energies[row - 1][col];
                else break;
            }
        }
    }

    private insertVerticalSeam(seam: number[]): void {}
}

export default SeamRetargeter;
