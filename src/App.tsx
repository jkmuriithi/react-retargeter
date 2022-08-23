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
import { toImageData, windowFitScaling } from "./lib/conversion/ImageData";
import { drawToCanvas } from "./lib/rendering/ImageData";
import Retargeter from "./lib/retargeting/Retargeter";
import SeamRetargeter from "./lib/retargeting/SeamRetargeter";

/**
 * The application's main page.
 * Default photo by James Dant on Unsplash
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
    const [imageSize, setImageSize] = useState({
        width: 1,
        height: 1,
    });
    const [showEnergy, setShowEnergy] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    /** Sets the retargeter to display new data. */
    const setImageData = useCallback((img: string | File | Blob) => {
        toImageData(img, scalingFn.current).then((imgData) => {
            setSeamRetargeter(new SeamRetargeter(imgData));
            const { width, height } = imgData;
            setImageSize({ width, height });
            setIsExpanded(false);
        });
    }, []);

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

            setImageData(files[0]);
        },
        [setImageData]
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
    }, [seamRetargeter, showEnergy]);

    useResizeObserver(canvasRef, (entry) => {
        const { width: canvasWidth, height: canvasHeight } = entry.contentRect;
        const { width: imgWidth, height: imgHeight } = seamRetargeter.imageData;

        if (imgWidth === 1 && imgHeight === 1) return;

        if (imgWidth > canvasWidth) {
            seamRetargeter.shrinkHorizontal(imgWidth - canvasWidth);
            drawImage();
        } else if (imgHeight > canvasHeight) {
            seamRetargeter.shrinkVertical(imgHeight - canvasHeight);
            drawImage();
        }

        setIsExpanded(canvasWidth > imgWidth || canvasHeight > imgHeight);
        setImageSize({ width: canvasWidth, height: canvasHeight });
    });

    // Get ImageData from example image on page load
    useEffect(() => setImageData(exampleImage), [setImageData]);

    // Draw image to screen after showEnergy changes
    useEffect(drawImage, [drawImage, seamRetargeter, showEnergy]);

    return (
        <>
            <TopNav />
            <Container
                fluid
                className={`px-0 min-vh-100 d-flex flex-column
                align-items-center justify-content-center bg-light`}
                style={{ paddingTop: "80px" }}
            >
                <Container
                    fluid
                    className="p-0 mb-3 overflow-hidden shadow"
                    style={{
                        resize: "both",
                    }}
                    ref={resizeWindowRef}
                    onDragEnter={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleIncomingImage}
                >
                    <canvas className="w-100 h-100" ref={canvasRef}></canvas>
                </Container>
                <Container
                    fluid
                    className="p-0 d-flex flex-wrap justify-content-center"
                >
                    <Form.Group controlId="fileInput">
                        <Form.Label
                            className="btn btn-success m-2"
                            onDragEnter={(e) => e.preventDefault()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleIncomingImage}
                        >
                            Select or Drop Image
                        </Form.Label>
                        <Form.Control
                            className="visually-hidden"
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleIncomingImage}
                        />
                    </Form.Group>
                    <ButtonGroup>
                        <Button
                            className="my-2 ms-2 pe-none"
                            variant="outline-dark"
                        >
                            {`${imageSize.width} \u00D7 ${imageSize.height}`}
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
                    <ToggleButton
                        className="m-2"
                        variant={showEnergy ? "primary" : "outline-primary"}
                        value="Show Energies"
                        onClick={() => setShowEnergy(!showEnergy)}
                        checked={showEnergy}
                    >
                        Show Energies
                    </ToggleButton>
                    <Button
                        className="m-2"
                        variant="info"
                        disabled={showEnergy}
                        onClick={() => {
                            (
                                seamRetargeter as SeamRetargeter
                            ).drawHorizontalSeam();
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
                            (
                                seamRetargeter as SeamRetargeter
                            ).drawVerticalSeam();
                            drawImage();
                        }}
                    >
                        Draw Vertical Seam
                    </Button>
                </Container>
            </Container>
        </>
    );
}

export default App;
