"use client";

interface UIDCopyCardProps {
  uid: string;
}

export default function UIDCopyCard({ uid }: UIDCopyCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(uid);
    alert("UID copied to clipboard!");
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h6>Your UID</h6>
        <p className="text-muted small mb-2">
          Share this to link your player profile:
        </p>
        <div className="d-flex gap-2">
          <code
            className="bg-light p-2 rounded flex-grow-1 text-break"
            style={{ fontSize: "0.85rem" }}
          >
            {uid}
          </code>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleCopy}
            title="Copy UID"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
