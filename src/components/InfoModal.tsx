import { ReactNode } from "react";
import {
    Alert,
    Button,
    ButtonGroup,
    ButtonProps,
    Modal,
    ModalProps,
} from "react-bootstrap";

/** Bolds text */
const Bold = (props: { children: ReactNode }) => (
    <span className="fw-bold">{props.children}</span>
);

/** Gives helpful about the application's UI and overall purpose. */
function InfoModal(props: ModalProps) {
    return (
        <Modal {...props}>
            <Modal.Header closeButton>
                <Modal.Title>About this Application</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant="info">
                    <Bold>Image retargeting</Bold> or{" "}
                    <Bold>content-aware image resizing</Bold> is a subfield of
                    image processing which focuses on changing the size of
                    images while keeping the most important features of those
                    images in frame. This app implements the{" "}
                    <Bold>seam carving algorithm</Bold> for image retargeting
                    and allows you to use it on images in real time. (See{" "}
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://en.wikipedia.org/wiki/Seam_carving"
                    >
                        Wikipedia
                    </a>{" "}
                    for more info)
                </Alert>
                <p>
                    To start resizing the active image, drag its{" "}
                    <Bold>bottom-right corner</Bold> towards the center of the
                    resizing window. The algorithm will only run when making the
                    image <Bold>smaller</Bold>, but you're free to stretch out
                    the image by dragging its bottom-right corner outwards. Note
                    that stretching out an image will not change its{" "}
                    <Bold>true</Bold> (pixel) <Bold>size</Bold>. Because the
                    algorithm only makes images <Bold>smaller</Bold>, the{" "}
                    <Bold>true size</Bold> of an image will always be less than
                    or equal to its starting size.
                </p>
                <p>
                    <Bold>Tip:</Bold> Resize the image <Bold>slowly</Bold> for
                    the best results.
                </p>
                <p>
                    <SizeDisplayButton /> Use the{" "}
                    <Bold>size display button</Bold> to see the current size of
                    the active image, or snap it back to its{" "}
                    <Bold>true size</Bold> if it's been stretched out.
                </p>
                <p>
                    <ExampleButton variant="success" text="Choose File" /> Use
                    the <Bold>file selection button</Bold> to change the active
                    image to a PNG or JPEG of your choice. You can also change
                    the active image by <Bold>dragging and dropping</Bold> an
                    image into the application window.
                </p>
                <p>
                    <ExampleButton variant="danger" text="Reset to Original" />
                    Use the <Bold>image reset button</Bold> to return the active
                    image to its original (un-resized) state.
                </p>
                <p>
                    <ExampleButton variant="primary" text="Download Image" />{" "}
                    Use the <Bold>download button</Bold> to download the active
                    image at its <Bold>true size</Bold>.
                </p>
                <p>
                    <ExampleButton
                        variant="outline-info"
                        text="Show Energies"
                    />
                    <ExampleButton variant="info" text="Draw Horizontal Seam" />
                    <ExampleButton variant="info" text="Draw Vertical Seam" />
                    Use the <Bold>algorithm display buttons</Bold> to take a
                    look at the <Bold>dual-gradient pixel energies</Bold> of the
                    active image, or the next{" "}
                    <Bold>horizontal and vertical seams</Bold> which the
                    algorithm will remove.
                </p>
                <p className="text-muted mb-0 pb-0">
                    Default image by{" "}
                    <a
                        className="text-muted"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://unsplash.com/@jamesdant?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
                    >
                        James Dant on Unsplash
                    </a>
                    .
                </p>
                <p className="text-muted mb-0 pb-0">
                    Inspired by a{" "}
                    <a
                        className="text-muted"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://www.cs.princeton.edu/courses/archive/spring21/cos226/assignments/seam/specification.php"
                    >
                        Princeton COS226 assignment
                    </a>{" "}
                    developed by Josh Hug, Maia Ginsburg, and Kevin Wayne.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

/** Example representation of the "Size Display" button group in the main UI. */
function SizeDisplayButton() {
    return (
        <ButtonGroup className="pe-none" size="sm">
            <Button className="my-1 ms-1" variant="outline-dark">
                {`100 \u00D7 100`}
            </Button>
            <Button className="my-1 me-1 ms-none" variant="dark" disabled>
                Show True Size
            </Button>
        </ButtonGroup>
    );
}

/** Example representation of a generic button in the main UI. */
function ExampleButton(props: {
    text: string;
    variant: ButtonProps["variant"];
}) {
    return (
        <Button variant={props.variant} className="m-1 pe-none" size="sm">
            {props.text}
        </Button>
    );
}

export default InfoModal;
