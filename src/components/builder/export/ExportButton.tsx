"use client";

import React, { useState } from "react";
import type { Editor } from "grapesjs";
import { exportProjectAsZip } from "./exportProjectZip";

interface ExportButtonProps {
  editor: Editor | null;
  projectName?: string;
}

export default function ExportButton({
  editor,
  projectName = "my-microsite",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!editor) {
      alert("Editor not ready");
      return;
    }

    setIsExporting(true);

    try {
      await exportProjectAsZip(editor, {
        projectName,
        includeComponents: true,
      });
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || !editor}
      style={{
        padding: "6px 12px",
        backgroundColor: isExporting ? "rgba(0,0,0,0.05)" : "transparent",
        color: "inherit",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "4px",
        cursor: isExporting ? "not-allowed" : "pointer",
        fontSize: "13px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s",
        height: "32px", // Match typical toolbar height
      }}
      onMouseEnter={(e) => {
        if (!isExporting) {
          e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isExporting) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {isExporting ? (
        <>
          <svg
            style={{
              width: "16px",
              height: "16px",
              animation: "spin 1s linear infinite",
            }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg
            style={{ width: "16px", height: "16px" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export
        </>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
