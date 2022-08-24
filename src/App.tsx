import useResizeObserver from "@react-hook/resize-observer";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import {
    Button,
    ButtonGroup,
    Container,
    Form,
    ToggleButton,
} from "react-bootstrap";
import exampleImage from "./assets/ExampleImageMountains.jpg";
import TopNav from "./components/TopNav";
import toImageData, {
    ImageSize,
    windowFitScaling,
} from "./lib/conversion/toImageData";
import { drawToCanvas } from "./lib/rendering/ImageData";
import Retargeter from "./lib/retargeters/Retargeter";
import SeamRetargeter from "./lib/retargeters/SeamRetargeter";

/**
 * The application's main page.
 * Default photo by James Dant on Unsplash.
 * @see https://unsplash.com/@jamesdant?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
 */
function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const resizeWindowRef = useRef<HTMLDivElement>(null);

    /** Scaling function for incoming images. */
    const scalingFn = useRef(windowFitScaling(0.8, 0.7));

    const [seamRetargeter, setSeamRetargeter] = useState<Retargeter>(
        new SeamRetargeter(new ImageData(1, 1))
    );
    const [canvasSize, setCanvasSize] = useState<ImageSize>({
        width: 1,
        height: 1,
    });
    const [originalImg, setOriginalImg] = useState<ImageData>(
        new ImageData(1, 1)
    );
    const [showEnergy, setShowEnergy] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * Returns the current filename and data URL needed for the canvas download.
     */
    const getDownloadData = useCallback(
        () => ({
            name: `Image-Carver-${new Date()
                .toISOString()
                .replaceAll(/[:\-.]/g, "")}.png`,
            url: canvasRef.current?.toDataURL(),
        }),
        []
    );

    const [canvasDownload, setCanvasDownload] = useState(getDownloadData);

    /** Sets the image retargeter to display new data. */
    const writeImageData = useCallback(
        (img: string | File | Blob | ImageData) => {
            toImageData(img, scalingFn.current).then((imgData) => {
                // Reset ImageData
                setSeamRetargeter(new SeamRetargeter(imgData));
                setOriginalImg(imgData);

                // Reset dimensions info
                const { width, height } = imgData;
                setCanvasSize({ width, height });
                setIsExpanded(false);
            });
        },
        []
    );

    /** Handles file input and drop events. */
    const handleIncomingImage = useCallback(
        (e: ChangeEvent<HTMLInputElement> & React.DragEvent<HTMLElement>) => {
            e.preventDefault();
            const files =
                e.dataTransfer === undefined
                    ? e.target.files
                    : e.dataTransfer.files;

            if (files === null) {
                throw new Error("Could not retrieve files.");
            }

            writeImageData(files[0]);
        },
        [writeImageData]
    );

    /** Draws the current image based on the state of showEnergy. */
    const drawImage = useCallback(() => {
        drawToCanvas(
            showEnergy
                ? (seamRetargeter as SeamRetargeter).energyImage
                : seamRetargeter.imageData,
            canvasRef.current,
            resizeWindowRef.current
        );
        setCanvasDownload(getDownloadData());
    }, [seamRetargeter, showEnergy, getDownloadData]);

    useResizeObserver(canvasRef, (entry) => {
        const { width: canvasWidth, height: canvasHeight } = entry.contentRect;
        const { width: imgWidth, height: imgHeight } = seamRetargeter.imageData;

        if (imgWidth === 1 && imgHeight === 1) return;

        // Update image metadata
        setIsExpanded(canvasWidth > imgWidth || canvasHeight > imgHeight);
        setCanvasSize({ width: canvasWidth, height: canvasHeight });

        // Prevent seam carving an expanded image
        if (isExpanded) return;

        if (imgWidth > canvasWidth) {
            seamRetargeter.shrinkHorizontal(imgWidth - canvasWidth);
            drawImage();
        } else if (imgHeight > canvasHeight) {
            seamRetargeter.shrinkVertical(imgHeight - canvasHeight);
            drawImage();
        }
    });

    // Get ImageData from example image on page load
    useEffect(() => writeImageData(exampleImage), [writeImageData]);

    // Draw image to screen after the image changes or showEnergy changes
    useEffect(drawImage, [drawImage, seamRetargeter, showEnergy]);

    return (
        <Container
            fluid
            className={`px-0 min-vh-100 d-flex flex-column
                align-items-center justify-content-center bg-light`}
            style={{ paddingTop: "80px" }}
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleIncomingImage}
        >
            <TopNav />
            <Container
                fluid
                className="p-0 mb-3 overflow-hidden shadow"
                style={{
                    resize: "both",
                }}
                ref={resizeWindowRef}
            >
                <canvas className="w-100 h-100" ref={canvasRef}></canvas>
            </Container>
            <Container
                fluid
                className="p-0 d-flex flex-wrap justify-content-center"
            >
                <ButtonGroup>
                    <Button
                        className="my-2 ms-2 pe-none"
                        variant="outline-dark"
                    >
                        {`${canvasSize.width} \u00D7 ${canvasSize.height}`}
                    </Button>
                    <Button
                        className="my-2 me-2 ms-none"
                        variant="dark"
                        disabled={!isExpanded}
                        onClick={drawImage}
                    >
                        Show True Size
                    </Button>
                </ButtonGroup>
                <Form.Group controlId="fileInput">
                    <Form.Label className="btn btn-success m-2">
                        Choose File
                    </Form.Label>
                    <Form.Control
                        className="visually-hidden"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleIncomingImage}
                    />
                </Form.Group>
                <Button
                    variant="danger"
                    className="m-2"
                    onClick={() => writeImageData(originalImg)}
                >
                    Reset to Original
                </Button>
                <Button
                    as="a"
                    className="m-2"
                    variant="primary"
                    download={canvasDownload.name}
                    href={canvasDownload.url}
                >
                    Download Image
                </Button>
                <ToggleButton
                    className="m-2"
                    variant={showEnergy ? "info" : "outline-info"}
                    value="Show Energies"
                    onClick={(e) => {
                        setShowEnergy(!showEnergy);
                        (e.target as HTMLElement).blur();
                    }}
                    checked={showEnergy}
                >
                    Show Energies
                </ToggleButton>
                <Button
                    className="m-2"
                    variant="info"
                    disabled={showEnergy}
                    onClick={() => {
                        (seamRetargeter as SeamRetargeter).drawHorizontalSeam();
                        drawImage();
                    }}
                >
                    Draw Horizontal Seam
                </Button>
                <Button
                    className="m-2"
                    variant="info"
                    disabled={showEnergy}
                    onClick={() => {
                        (seamRetargeter as SeamRetargeter).drawVerticalSeam();
                        drawImage();
                    }}
                >
                    Draw Vertical Seam
                </Button>
            </Container>
        </Container>
    );
}

export default App;
