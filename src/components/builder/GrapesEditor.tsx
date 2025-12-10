"use client";

import React, { useState } from "react";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import type { Editor } from "grapesjs";
import ExportButton from "./export/ExportButton";

export default function GrapesEditor() {
  const [editor, setEditor] = useState<Editor | null>(null);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Export Button Toolbar */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          display: "flex",
          gap: "8px",
        }}
      >
        <ExportButton editor={editor} projectName="my-microsite" />
      </div>

      {/* GrapesJS Studio Editor */}
      <StudioEditor
        options={{
          licenseKey: "DEV_LICENSE_KEY",
          theme: "light",
          project: {
            type: "web",
            default: {
              pages: [
                {
                  name: "Home",
                  component: "<h1>Welcome to the Builder, Joss!!</h1>",
                },
              ],
            },
          },
        }}
        onEditor={(editorInstance) => {
          setEditor(editorInstance);
        }}
      />
    </div>
  );
}
