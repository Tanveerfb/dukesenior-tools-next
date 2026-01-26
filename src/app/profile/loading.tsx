import { Spinner } from "react-bootstrap";

export default function Loading() {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "50vh" }}
    >
      <Spinner animation="border" variant="primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="mt-3 text-muted">Loading profile...</p>
    </div>
  );
}
