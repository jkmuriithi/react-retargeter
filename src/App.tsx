import useResizeObserver from "@react-hook/resize-observer";
import { useEffect, useRef, useState } from "react";
import { Button, Container, Form, ToggleButton } from "react-bootstrap";
import exampleImage from "./assets/ExampleImageOcean.png";
import TopNav from "./components/TopNav";
import { toImageData } from "./lib/conversion/ImageData";
import { drawToCanvas } from "./lib/rendering/ImageData";
import SeamRetargeter from "./lib/retargeting/SeamRetargeter";

/** The application's main page. */
function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const resizeWindowRef = useRef<HTMLDivElement>(null);

    const [seamRetargeter, setSeamRetargeter] = useState<SeamRetargeter>(
        new SeamRetargeter(new ImageData(1, 1))
    );
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
            seamRetargeter.growVertical(height - currWidth);

        drawToCanvas(
            showEnergy ? seamRetargeter.energyImage : seamRetargeter.imageData,
            canvasRef.current,
            resizeWindowRef.current
        );
    });

    // Get ImageData from example image
    useEffect(() => {
        toImageData(exampleImage).then((imgData) => {
            setSeamRetargeter(new SeamRetargeter(imgData));
        });
    }, [setSeamRetargeter]);

    useEffect(() => {
        drawToCanvas(
            showEnergy ? seamRetargeter.energyImage : seamRetargeter.imageData,
            canvasRef.current,
            resizeWindowRef.current
        );
    }, [seamRetargeter, showEnergy]);

    return (
        <>
            <TopNav />
            <Container
                className={`px-0 mw-100 mb-3 d-flex flex-column align-items-center
                    justify-content-center`}
                style={{ paddingTop: "80px" }}
            >
                <Container
                    className="p-0 mb-3 mw-100 overflow-hidden shadow-lg"
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
                <Container className="p-0 d-flex flex-wrap justify-content-center">
                    <Form.Group controlId="fileInput">
                        <Form.Label
                            className="btn btn-outline-primary m-2"
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
                            id="fileInput"
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
                        variant={showEnergy ? "dark" : "outline-dark"}
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
                            seamRetargeter.drawHorizontalSeam();
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
                            seamRetargeter.drawVerticalSeam();
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
