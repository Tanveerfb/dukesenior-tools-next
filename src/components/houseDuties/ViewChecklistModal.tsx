"use client";

import { Modal, Button, Badge } from "react-bootstrap";
import { Checklist, DAYS_OF_WEEK } from "@/types/houseDuties";
import { FaPrint, FaDownload } from "react-icons/fa";
import { useRef } from "react";

interface Props {
  show: boolean;
  onHide: () => void;
  checklist: Checklist;
}

export default function ViewChecklistModal({ show, onHide, checklist }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    // For PDF export, we'll use the browser's print-to-PDF feature
    // This is the most reliable cross-browser solution
    alert(
      "To export as PDF:\n1. Click 'Print Preview' button\n2. Select 'Save as PDF' as the printer\n3. Click 'Save'"
    );
    window.print();
  };

  const getPersonName = (personId: string): string => {
    const person = checklist.people.find((p) => p.id === personId);
    return person?.name || "-";
  };

  const getAssignment = (day: string, dutyId: string): string => {
    const assignment = checklist.assignments.find(
      (a) => a.day === day && a.dutyId === dutyId
    );
    return assignment ? getPersonName(assignment.personId) : "-";
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" scrollable>
        <Modal.Header closeButton className="no-print">
          <Modal.Title>{checklist.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div ref={printRef} className="checklist-view">
            {/* Print Header */}
            <div className="print-only text-center mb-4">
              <h1>{checklist.name}</h1>
              {checklist.description && <p>{checklist.description}</p>}
              <p className="text-muted">
                Created: {new Date(checklist.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Screen Header */}
            <div className="no-print mb-3">
              {checklist.isTemplate && (
                <Badge bg="info" className="mb-2">
                  Template
                </Badge>
              )}
              {checklist.description && (
                <p className="text-muted">{checklist.description}</p>
              )}
              <p className="small text-muted">
                Created by {checklist.createdByName} on{" "}
                {new Date(checklist.createdAt).toLocaleDateString()}
                <br />
                Last updated: {new Date(checklist.updatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Weekly Schedule Table */}
            <div className="table-responsive">
              <table className="table table-bordered checklist-table">
                <thead>
                  <tr>
                    <th style={{ width: "200px" }}>Duty</th>
                    {DAYS_OF_WEEK.map((day) => (
                      <th key={day} className="text-center">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {checklist.duties.map((duty) => (
                    <tr key={duty.id}>
                      <td className="fw-bold">{duty.name}</td>
                      {DAYS_OF_WEEK.map((day) => (
                        <td key={day} className="text-center">
                          <div className="assignment-cell">
                            {getAssignment(day, duty.id)}
                            <div className="checkbox-cell print-only">☐</div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* People List */}
            <div className="mt-4">
              <h6>People:</h6>
              <p>
                {checklist.people.map((person) => person.name).join(", ")}
              </p>
            </div>

            {/* Print Footer */}
            <div className="print-only mt-5 text-center text-muted">
              <small>
                Printed from The Lair of Evil - House Duties Checklist Tool
              </small>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="no-print">
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            <FaPrint className="me-2" />
            Print Preview
          </Button>
          <Button variant="success" onClick={handleExportPDF}>
            <FaDownload className="me-2" />
            Export PDF
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .checklist-view,
          .checklist-view * {
            visibility: visible;
          }
          
          .checklist-view {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          .checklist-table {
            page-break-inside: avoid;
          }
          
          .checklist-table th,
          .checklist-table td {
            padding: 12px 8px !important;
            border: 1px solid #000 !important;
          }
          
          .assignment-cell {
            min-height: 60px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          .checkbox-cell {
            font-size: 24px;
            margin-top: 10px;
          }
          
          h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          h6 {
            font-size: 14px;
            font-weight: bold;
          }
        }
        
        @media screen {
          .print-only {
            display: none !important;
          }
          
          .assignment-cell {
            padding: 8px;
          }
        }
        
        .checklist-table {
          border-collapse: collapse;
          width: 100%;
        }
        
        .checklist-table th {
          background-color: var(--bs-primary);
          color: white;
          font-weight: 600;
        }
        
        .checklist-table td {
          vertical-align: middle;
        }
      `}</style>
    </>
  );
}
