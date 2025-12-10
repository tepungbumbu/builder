import React from "react";
import { Button } from "@/components/ui/Button";

interface PreviewControlsProps {
  onDeviceChange: (device: string) => void;
  onPreview: () => void;
  onExport: () => void;
}

export default function PreviewControls({
  onDeviceChange,
  onPreview,
  onExport,
}: PreviewControlsProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-1 mr-auto">
        <Button variant="outline" size="sm" onClick={() => onDeviceChange("desktop")}>
          Desktop
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDeviceChange("tablet")}>
          Tablet
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDeviceChange("mobile")}>
          Mobile
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onPreview}>
          Preview
        </Button>
        <Button variant="primary" size="sm" onClick={onExport}>
          Export
        </Button>
      </div>
    </div>
  );
}
