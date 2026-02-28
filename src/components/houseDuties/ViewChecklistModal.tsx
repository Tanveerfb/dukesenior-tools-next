"use client";

import { FiPrinter, FiDownload } from "react-icons/fi";
import { Checklist, DAYS_OF_WEEK } from "@/types/houseDuties";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

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
      (a) => a.day === day && a.dutyId === dutyId,
    );
    return assignment ? getPersonName(assignment.personId) : "-";
  };

  // Close on Escape key
  useEffect(() => {
    if (!show) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onHide();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [show, onHide]);

  if (!show) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onHide}
      >
        {/* Inner Dialog */}
        <div
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl bg-card dark:bg-card-dark border border-border dark:border-border-dark shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dialog Title */}
          <div className="no-print px-6 py-4 border-b border-border dark:border-border-dark">
            <h2 className="text-xl font-semibold text-foreground">
              {checklist.name}
            </h2>
          </div>

          {/* Dialog Content */}
          <div className="px-6 py-4">
            <div ref={printRef} className="checklist-view">
              {/* Print Header */}
              <div className="print-only text-center mb-4">
                <h1>{checklist.name}</h1>
                {checklist.description && <p>{checklist.description}</p>}
                <p className="text-foreground-secondary">
                  Created: {new Date(checklist.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Screen Header */}
              <div className="no-print mb-3">
                {checklist.isTemplate && (
                  <span className="inline-block rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 text-xs font-medium mb-2">
                    Template
                  </span>
                )}
                {checklist.description && (
                  <p className="text-foreground-secondary">
                    {checklist.description}
                  </p>
                )}
                <p className="text-sm text-foreground-secondary">
                  Created by {checklist.createdByName} on{" "}
                  {new Date(checklist.createdAt).toLocaleDateString()}
                  <br />
                  Last updated:{" "}
                  {new Date(checklist.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Weekly Schedule Table */}
              <div className="overflow-x-auto">
                <table className="checklist-table w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-[200px] px-3 py-2 text-left bg-primary-500 text-white font-semibold border border-border dark:border-border-dark">
                        Duty
                      </th>
                      {DAYS_OF_WEEK.map((day) => (
                        <th
                          key={day}
                          className="px-3 py-2 text-center bg-primary-500 text-white font-semibold border border-border dark:border-border-dark"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {checklist.duties.map((duty) => (
                      <tr key={duty.id}>
                        <td className="px-3 py-2 font-bold text-foreground align-middle border border-border dark:border-border-dark">
                          {duty.name}
                        </td>
                        {DAYS_OF_WEEK.map((day) => (
                          <td
                            key={day}
                            className="px-3 py-2 text-center text-foreground align-middle border border-border dark:border-border-dark"
                          >
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
                <h6 className="font-semibold text-foreground">People:</h6>
                <p className="text-foreground-secondary">
                  {checklist.people.map((person) => person.name).join(", ")}
                </p>
              </div>

              {/* Print Footer */}
              <div className="print-only mt-5 text-center text-foreground-secondary">
                <small>
                  Printed from The Lair of Evil - House Duties Checklist Tool
                </small>
              </div>
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="no-print flex justify-end gap-2 px-6 py-4 border-t border-border dark:border-border-dark">
            <button
              type="button"
              onClick={onHide}
              className="px-4 py-2 rounded-lg border border-border dark:border-border-dark text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <FiPrinter className="size-4" />
              Print Preview
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              title="Opens print dialog. Select 'Save as PDF' as the printer to export."
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <FiDownload className="size-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

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
