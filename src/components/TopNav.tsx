import { useState } from "react";
import { Container, Navbar } from "react-bootstrap";
import { BsGithub, BsQuestionCircleFill } from "react-icons/bs";
import InfoModal from "./InfoModal";

/** Top navigation bar. */
function TopNav() {
    const [showInfoModal, setShowInfoModal] = useState(false);

    return (
        <Navbar fixed="top" bg="primary" variant="dark" expand="md">
            <Container fluid className="mx-2">
                <Navbar.Brand className="fw-bold">
                    Interactive Image Resizer{" "}
                    <BsQuestionCircleFill
                        onClick={() => {
                            setShowInfoModal(true);
                        }}
                        size={18}
                        className="mb-1 ms-1 link-dark"
                    />
                </Navbar.Brand>
                <Navbar.Toggle
                    aria-controls="top-nav"
                    className="border-0 p-0"
                />
                <Navbar.Collapse id="top-nav">
                    <span className="text-muted ms-auto">
                        A project by{" "}
                        <a
                            href="https://github.com/jkmuriithi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted"
                        >
                            Jude Muriithi <BsGithub className="mb-1 ms-1" />
                        </a>
                    </span>
                </Navbar.Collapse>
            </Container>
            <InfoModal
                show={showInfoModal}
                size="lg"
                centered
                onHide={() => {
                    setShowInfoModal(false);
                }}
            />
        </Navbar>
    );
}

export default TopNav;
