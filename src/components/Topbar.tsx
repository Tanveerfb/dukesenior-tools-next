"use client";
import { Navbar, Container, Offcanvas, Button, ButtonGroup } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";
import { FaLightbulb, FaRegLightbulb } from "react-icons/fa";

export default function Topbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <Navbar
      expand="md"
      bg="primary"
      fixed="bottom"
      className="bg-body-primary bg-opacity-50"
    >
      <Container fluid className="px-5">
        <Navbar.Brand as={Link} href="/" className="brandName d-flex align-items-center p-1">
          The Lair of Evil Tools
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="extras" />
        <Navbar.Offcanvas
          id="extras"
          className="w-100 d-flex align-items-md-end bg-info-subtle"
          aria-labelledby="extras"
          placement="bottom"
        >
          <Offcanvas.Header closeButton />
          <Offcanvas.Body className="justify-content-center align-items-center flex-grow-1 pe-3">
            <ButtonGroup className="m-2 d-flex flex-wrap align-items-end">
              {user ? (
                <Button className="mx-1" variant="dark">
                  <Link className="text-light text-decoration-none" href="/profile">Profile</Link>
                </Button>
              ) : (
                <Button className="mx-1" variant="primary">
                  <Link className="text-light text-decoration-none" href="/login">Log in / Sign up</Link>
                </Button>
              )}
              <Button
                className="mx-1"
                onClick={toggleTheme}
                variant={theme === "dark" ? "dark" : "light"}
              >
                {theme === "dark" ? <FaLightbulb /> : <FaRegLightbulb />}
              </Button>
            </ButtonGroup>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}
