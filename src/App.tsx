import { useEffect, useRef, useState } from "react";
import { Container, Form, ToggleButton } from "react-bootstrap";
import exampleImage from "./assets/ExampleImageOcean.png";
import TopNav from "./components/TopNav";
import { toImageData } from "./lib/conversion/ImageData";
import { drawToCanvas } from "./lib/rendering/ImageData";
import SeamCarver from "./lib/retargeting/SeamCarver";

/** Dimensions of an image or canvas element in pixels. */
interface Size {
    /** Width of the element in pixels. */
    width: number;
    /** Height of the element in pixels. */
    height: number;
}

/** The application's main page. */
function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const resizeWindowRef = useRef<HTMLDivElement>(null);

    const [seamCarver, setSeamCarver] = useState<SeamCarver>(
        new SeamCarver(new ImageData(1, 1))
    );
    const [showEnergy, setShowEnergy] = useState(false);

    // Get ImageData from example image
    useEffect(() => {
        toImageData(exampleImage).then((imgData) =>
            setSeamCarver(new SeamCarver(imgData))
        );
    }, [setSeamCarver]);

    useEffect(() => {
        if (canvasRef.current === null || resizeWindowRef.current === null)
            throw new Error("Resize window contains null ref.");

        drawToCanvas(
            showEnergy
                ? seamCarver.getEnergyImage()
                : seamCarver.getImageData(),
            canvasRef.current,
            resizeWindowRef.current
        );
    }, [seamCarver, showEnergy]);

    return (
        <>
            <TopNav />
            <Container
                className={`px-0 mw-100 mb-3 d-flex flex-column align-items-center
                    justify-content-center`}
                style={{ paddingTop: "80px" }}
            >
                <Container
                    className="p-0 mb-3 mw-100 overflow-hidden"
                    style={{ resize: "both" }}
                    ref={resizeWindowRef}
                >
                    <canvas className="w-100 h-100" ref={canvasRef}></canvas>
                </Container>
                <Container className="p-0 d-flex justify-content-center">
                    <ToggleButton
                        variant={showEnergy ? "dark" : "outline-dark"}
                        value="Show Energy Image"
                        onClick={() => setShowEnergy(!showEnergy)}
                        checked={showEnergy}
                    >
                        Show Energies
                    </ToggleButton>
                    <Form.Control
                        className="w-50 mx-2"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => {
                            const files = (e.target as HTMLInputElement).files;

                            if (files === null)
                                throw new Error("Could not retrieve files.");

                            toImageData(files[0]).then((imgData) =>
                                setSeamCarver(new SeamCarver(imgData))
                            );
                        }}
                    />
                </Container>
            </Container>
        </>
    );
}

export default App;
