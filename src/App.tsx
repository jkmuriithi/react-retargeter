import useResizeObserver from "@react-hook/resize-observer";
import { useEffect, useRef, useState } from "react";
import {
    Button,
    ButtonGroup,
    Container,
    Form,
    ToggleButton,
} from "react-bootstrap";
import exampleImage from "./assets/ExampleImageMountains.jpg";
import TopNav from "./components/TopNav";
import { toImageData } from "./lib/conversion/ImageData";
import { drawToCanvas } from "./lib/rendering/ImageData";
import Retargeter from "./lib/retargeting/Retargeter";
import SeamRetargeter from "./lib/retargeting/SeamRetargeter";

/**
 * The application's main page.
 * Default photo by James Dant on Unsplash
 * @see {@link https://unsplash.com/@jamesdant?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText}
 */
function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const resizeWindowRef = useRef<HTMLDivElement>(null);

    const [seamRetargeter, setSeamRetargeter] = useState<Retargeter>(
        new SeamRetargeter(new ImageData(1, 1))
    );
    const [imageStatus, setImageStatus] = useState({
        width: 1,
        height: 1,
    });
    const [showEnergy, setShowEnergy] = useState(false);

    useResizeObserver(canvasRef, (entry) => {
        const { width, height } = entry.contentRect;
        const { width: currWidth, height: currHeight } =
            seamRetargeter.imageData;

        if (currWidth === 1 && currHeight === 1) return;

        if (currWidth > width) {
            seamRetargeter.shrinkHorizontal(currWidth - width);
        } else if (currHeight > height) {
            seamRetargeter.shrinkVertical(currHeight - height);
        } else {
            return;
        }

        drawToCanvas(
            showEnergy
                ? (seamRetargeter as SeamRetargeter).energyImage
                : seamRetargeter.imageData,
            canvasRef.current,
            resizeWindowRef.current
        );

        setImageStatus({ width, height });
    });

    // Get ImageData from example image
    useEffect(() => {
        toImageData(exampleImage).then((imgData) => {
            setSeamRetargeter(new SeamRetargeter(imgData));
        });
    }, [setSeamRetargeter]);

    // Draw energy to screen on button press
    useEffect(() => {
        drawToCanvas(
            showEnergy
                ? (seamRetargeter as SeamRetargeter).energyImage
                : seamRetargeter.imageData,
            canvasRef.current,
            resizeWindowRef.current
        );
    }, [seamRetargeter, showEnergy]);

    // Display correct dimensions after image switch
    useEffect(() => {
        const { width, height } = seamRetargeter.imageData;
        setImageStatus({ width, height });
    }, [seamRetargeter]);

    return (
        <>
            <TopNav />
            <Container
                fluid
                className={`px-0 min-vh-100 d-flex flex-column align-items-center
                    justify-content-center bg-light`}
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
                    onDrop={(e) => {
                        e.preventDefault();
                        console.log(e);
                        const files = e.dataTransfer.files;

                        if (files === null)
                            throw new Error("Could not retrieve files.");

                        toImageData(files[0]).then((imgData) =>
                            setSeamRetargeter(new SeamRetargeter(imgData))
                        );
                    }}
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
                            onDrop={(e) => {
                                e.preventDefault();
                                console.log(e);
                                const files = e.dataTransfer.files;

                                if (files === null)
                                    throw new Error(
                                        "Could not retrieve files."
                                    );

                                toImageData(files[0]).then((imgData) =>
                                    setSeamRetargeter(
                                        new SeamRetargeter(imgData)
                                    )
                                );
                            }}
                        >
                            Select or Drop Image
                        </Form.Label>
                        <Form.Control
                            className="visually-hidden"
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => {
                                const files = (e.target as HTMLInputElement)
                                    .files;

                                if (files === null)
                                    throw new Error(
                                        "Could not retrieve files."
                                    );

                                toImageData(files[0]).then((imgData) =>
                                    setSeamRetargeter(
                                        new SeamRetargeter(imgData)
                                    )
                                );
                            }}
                        />
                    </Form.Group>
                    <ButtonGroup>
                        {" "}
                        <Button
                            className="my-2 ms-2 pe-none"
                            variant="outline-dark"
                        >
                            {`${imageStatus.width} \u00D7 ${imageStatus.height}`}
                        </Button>
                        <Button
                            className="my-2 me-2 ms-none"
                            variant="dark"
                            onClick={() =>
                                drawToCanvas(
                                    showEnergy
                                        ? (seamRetargeter as SeamRetargeter)
                                              .energyImage
                                        : seamRetargeter.imageData,
                                    canvasRef.current,
                                    resizeWindowRef.current
                                )
                            }
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
                        onClick={() => {
                            (
                                seamRetargeter as SeamRetargeter
                            ).drawHorizontalSeam();
                            drawToCanvas(
                                seamRetargeter.imageData,
                                canvasRef.current,
                                resizeWindowRef.current
                            );
                        }}
                    >
                        Draw Horizontal Seam
                    </Button>
                    <Button
                        className="m-2"
                        variant="info"
                        onClick={() => {
                            (
                                seamRetargeter as SeamRetargeter
                            ).drawVerticalSeam();
                            drawToCanvas(
                                seamRetargeter.imageData,
                                canvasRef.current,
                                resizeWindowRef.current
                            );
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
