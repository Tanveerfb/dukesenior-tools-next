"use client";

import { FiPrinter, FiDownload } from "react-icons/fi";
import { Checklist, DAYS_OF_WEEK } from "@/types/houseDuties";
import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  show: boolean;
  onHide: () => void;
  checklist: Checklist;
}

/** Split an array into chunks of `size` */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

const ROWS_PER_PAGE = 8;

export default function ViewChecklistModal({ show, onHide, checklist }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);

  // Create a portal container as a direct child of <body>
  useEffect(() => {
    if (!show) return;
    const el = document.createElement("div");
    el.className = "checklist-print-portal";
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      document.body.removeChild(el);
      setPortalEl(null);
    };
  }, [show]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const getPersonName = (personId: string): string => {
    const person = checklist.people.find((p) => p.id === personId);
    return person?.name || "\u2013";
  };

  const getAssignment = (day: string, dutyId: string): string => {
    const assignment = checklist.assignments.find(
      (a) => a.day === day && a.dutyId === dutyId,
    );
    return assignment ? getPersonName(assignment.personId) : "\u2013";
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

  const dutyChunks = chunk(checklist.duties, ROWS_PER_PAGE);

  return (
    <>
      {/* ===== SCREEN: Modal Overlay ===== */}
      <div
        className="checklist-print-root fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onHide}
      >
        <div
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl bg-card dark:bg-card-dark border border-border dark:border-border-dark shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dialog Title */}
          <div className="px-6 py-4 border-b border-border dark:border-border-dark">
            <h2 className="text-xl font-semibold text-foreground">
              {checklist.name}
            </h2>
          </div>

          {/* Dialog Content */}
          <div className="px-6 py-4">
            <div ref={printRef} className="checklist-view">
              {/* Screen Header */}
              <div className="mb-3">
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
                            {getAssignment(day, duty.id)}
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
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-border dark:border-border-dark">
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

      {/* ===== PRINT: Portal rendered as direct child of <body> ===== */}
      {portalEl &&
        createPortal(
          <div className="checklist-print-content">
            {dutyChunks.map((duties, pageIdx) => (
              <div
                key={pageIdx}
                className={cn(
                  "print-page",
                  pageIdx < dutyChunks.length - 1 && "print-page-break",
                )}
              >
                {/* Header on every page */}
                <div className="print-header">
                  <h1>{checklist.name}</h1>
                  {checklist.description && <p>{checklist.description}</p>}
                  <p className="print-meta">
                    Created by {checklist.createdByName} on{" "}
                    {new Date(checklist.createdAt).toLocaleDateString()}
                    {" \u2022 "}Last updated:{" "}
                    {new Date(checklist.updatedAt).toLocaleDateString()}
                  </p>
                  {dutyChunks.length > 1 && (
                    <p className="print-meta">
                      Page {pageIdx + 1} of {dutyChunks.length}
                    </p>
                  )}
                </div>

                {/* Table for this page's duties */}
                <table className="print-table">
                  <thead>
                    <tr>
                      <th className="print-th-duty">Duty</th>
                      {DAYS_OF_WEEK.map((day) => (
                        <th key={day} className="print-th-day">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {duties.map((duty, rowIdx) => (
                      <tr
                        key={duty.id}
                        className={rowIdx % 2 === 1 ? "print-row-alt" : ""}
                      >
                        <td className="print-td-duty">{duty.name}</td>
                        {DAYS_OF_WEEK.map((day) => (
                          <td key={day} className="print-td-cell">
                            <span>{getAssignment(day, duty.id)}</span>
                            <span className="print-checkbox">{"\u2610"}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* People + footer on every page */}
                <div className="print-people">
                  <strong>People:</strong>{" "}
                  {checklist.people.map((p) => p.name).join(", ")}
                </div>
                <div className="print-footer">
                  Printed from The Lair of Evil &mdash; House Duties Checklist
                  Tool
                </div>
              </div>
            ))}
          </div>,
          portalEl,
        )}

      {/* ===== Styles ===== */}
      <style jsx global>{`
        /* ---------- SCREEN: hide the print portal entirely ---------- */
        .checklist-print-portal {
          display: none;
        }

        /* ---------- PRINT ---------- */
        @page {
          size: A4 landscape;
          margin: 12mm 15mm;
        }

        @media print {
          /* Hide the entire page (Next.js root, navbar, modal, etc.) */
          body > *:not(.checklist-print-portal) {
            display: none !important;
          }

          /* Show the portal */
          .checklist-print-portal {
            display: block !important;
          }

          .checklist-print-content {
            width: 100%;
            color: #000;
            font-family: "Geist", Arial, Helvetica, sans-serif;
          }

          /* --- Page wrapper --- */
          .print-page {
            width: 100%;
          }
          .print-page-break {
            page-break-after: always;
          }

          /* --- Header --- */
          .print-header {
            text-align: center;
            margin-bottom: 8px;
          }
          .print-header h1 {
            font-family: "Permanent Marker", cursive;
            font-size: 22px;
            margin: 0 0 2px;
          }
          .print-header p {
            font-size: 10px;
            margin: 1px 0;
            color: #333;
          }
          .print-meta {
            font-size: 9px !important;
            color: #666 !important;
          }

          /* --- Table --- */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #222;
            padding: 6px 5px;
            font-size: 10px;
            vertical-align: middle;
          }
          .print-th-duty,
          .print-th-day {
            background-color: #1976d2 !important;
            color: #fff !important;
            font-weight: 700;
            text-align: center;
            font-size: 11px;
            padding: 7px 5px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-th-duty {
            width: 22%;
            text-align: left;
            padding-left: 8px;
          }
          .print-td-duty {
            font-weight: 700;
            text-align: left;
            padding-left: 8px;
            font-size: 10px;
          }
          .print-td-cell {
            text-align: center;
            padding: 4px 3px 2px;
          }
          .print-td-cell span {
            display: block;
          }
          .print-checkbox {
            font-size: 18px;
            line-height: 1;
            margin-top: 2px;
          }
          .print-row-alt td {
            background-color: #f0f0f0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* --- People --- */
          .print-people {
            margin-top: 8px;
            font-size: 10px;
            color: #222;
          }

          /* --- Footer --- */
          .print-footer {
            margin-top: 6px;
            text-align: center;
            font-size: 8px;
            color: #888;
          }
        }

        /* ---------- Shared screen styles for checklist table ---------- */
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
