"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from "@mui/material";
import { Print, Download, Info } from "@mui/icons-material";
import { Checklist, DAYS_OF_WEEK } from "@/types/houseDuties";
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

  const handleExportPDF = () => {
    // For PDF export, we use the browser's print-to-PDF feature
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
      <Dialog open={show} onClose={onHide} maxWidth="xl" fullWidth>
        <DialogTitle className="no-print">{checklist.name}</DialogTitle>
        <DialogContent>
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
                <Chip label="Template" color="info" size="small" sx={{ mb: 2 }} />
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
              <Table className="checklist-table" sx={{ borderCollapse: "collapse" }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "200px" }}>Duty</TableCell>
                    {DAYS_OF_WEEK.map((day) => (
                      <TableCell key={day} align="center">
                        {day}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checklist.duties.map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell sx={{ fontWeight: "bold" }}>{duty.name}</TableCell>
                      {DAYS_OF_WEEK.map((day) => (
                        <TableCell key={day} align="center">
                          <div className="assignment-cell">
                            {getAssignment(day, duty.id)}
                            <div className="checkbox-cell print-only">☐</div>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
        </DialogContent>
        <DialogActions className="no-print">
          <Button variant="outlined" onClick={onHide}>
            Close
          </Button>
          <Button variant="contained" onClick={handlePrint} startIcon={<Print />}>
            Print Preview
          </Button>
          <Tooltip title="Opens print dialog. Select 'Save as PDF' as the printer to export.">
            <Button
              variant="contained"
              color="success"
              onClick={handleExportPDF}
              startIcon={<Download />}
              endIcon={<Info sx={{ fontSize: 16 }} />}
            >
              Export PDF
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>

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
          background-color: #1976d2;
          color: white;
          font-weight: 600;
        }
        
        .checklist-table td {
          vertical-align: middle;
        }
        
        .checklist-table th,
        .checklist-table td {
          border: 1px solid rgba(224, 224, 224, 1);
        }
      `}</style>
    </>
  );
}
