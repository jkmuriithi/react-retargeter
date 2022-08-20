import { Container, Navbar } from "react-bootstrap";

/** Top navigation bar. */
function TopNav() {
    return (
        <Navbar fixed="top" bg="primary" variant="dark">
            <Container className="ms-2">
                <Navbar.Brand className="fw-bold">
                    Image Retargeter
                </Navbar.Brand>
            </Container>
        </Navbar>
    );
}

export default TopNav;
