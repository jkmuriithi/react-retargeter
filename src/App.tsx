import useResizeObserver from "@react-hook/resize-observer";
import { useEffect, useRef, useState } from "react";
import { Button, Container, Form, ToggleButton } from "react-bootstrap";
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

        if (currWidth > width)
            seamRetargeter.shrinkHorizontal(currWidth - width);
        else if (currWidth < width)
            seamRetargeter.growHorizontal(width - currWidth);

        if (currHeight > height)
            seamRetargeter.shrinkVertical(currHeight - height);
        else if (currHeight < height)
            seamRetargeter.growVertical(height - currHeight);

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
                    <Button className="m-2 pe-none" variant="outline-success">
                        {`${imageStatus.width}x${imageStatus.height}`}
                    </Button>
                    <Form.Group controlId="fileInput">
                        <Form.Label
                            className="btn btn-outline-dark m-2"
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
