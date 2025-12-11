"use client";

import React, { useState } from "react";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import type { Editor } from "grapesjs";
import ExportButton from "./export/ExportButton";
import { registerHeroicons } from "./blocks/heroicons";

import { createPortal } from "react-dom";

export default function GrapesEditor() {
  const [editor, setEditor] = useState<Editor | null>(null);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Export Button in Topbar */}
      {editor && <TopbarButtonPortal editor={editor} />}

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
          
          // Register Heroicons blocks
          registerHeroicons(editorInstance);
        }}
      />
    </div>
  );
}

function TopbarButtonPortal({ editor }: { editor: Editor }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  React.useEffect(() => {
    // Find the target container in GrapesJS UI
    const findContainer = () => {
      const topbarRight = document.querySelector(".gs-cmp-topbar-right");
      if (topbarRight) {
        setContainer(topbarRight as HTMLElement);
      }
    };

    // Try immediately and then observe
    findContainer();

    const observer = new MutationObserver(findContainer);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [editor]);

  if (!container) return null;

  return createPortal(
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
       <ExportButton editor={editor} projectName="my-microsite" />
    </div>,
    container
  );
}
