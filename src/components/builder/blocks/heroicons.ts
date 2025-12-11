import type { Editor } from "grapesjs";
// @ts-ignore - JSON import
import heroiconsData from "@iconify-json/heroicons/icons.json";

interface IconifyIcon {
  body: string;
  width?: number;
  height?: number;
}

interface IconifyJSON {
  prefix: string;
  icons: Record<string, IconifyIcon>;
  width?: number;
  height?: number;
}

const data = heroiconsData as IconifyJSON;

// Format icon name for display
const formatIconName = (name: string): string => {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Determine icon style and size from name
const getIconMeta = (name: string) => {
  if (name.endsWith("-16-solid")) {
    return { style: "micro", size: 16, category: "Icons - Micro (16px)" };
  } else if (name.endsWith("-20-solid")) {
    return { style: "mini", size: 20, category: "Icons - Mini (20px)" };
  } else if (name.endsWith("-solid")) {
    return { style: "solid", size: 24, category: "Icons - Solid (24px)" };
  } else {
    return { style: "outline", size: 24, category: "Icons - Outline (24px)" };
  }
};

// Clean icon name for display
const cleanIconName = (name: string): string => {
  return name
    .replace(/-16-solid$/, "")
    .replace(/-20-solid$/, "")
    .replace(/-solid$/, "")
    .replace(/-$/, "");
};

export const registerHeroicons = (editor: Editor) => {
  const blockManager = editor.Blocks;
  const defaultWidth = data.width || 24;
  const defaultHeight = data.height || 24;

  let registeredCount = 0;

  Object.entries(data.icons).forEach(([iconName, iconData]) => {
    const { style, size, category } = getIconMeta(iconName);
    const cleanName = cleanIconName(iconName);
    const displayName = formatIconName(cleanName);
    const blockId = `heroicon-${iconName}`;

    const width = iconData.width || defaultWidth;
    const height = iconData.height || defaultHeight;

    // Add block to the blocks panel
    blockManager.add(blockId, {
      label: displayName,
      category: category,
      media: `<svg xmlns="http://www.w3.org/2000/svg" fill="${
        style === "outline" ? "none" : "currentColor"
      }" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="heroicon-preview">
  ${iconData.body}
</svg>`,
      content: {
        type: "svg",
        tagName: "svg",
        attributes: {
          xmlns: "http://www.w3.org/2000/svg",
          fill: style === "outline" ? "none" : "currentColor",
          viewBox: `0 0 ${width} ${height}`,
          class: `heroicon heroicon-${style} heroicon-${cleanName}`,
          "data-icon-name": cleanName,
          "data-icon-style": style,
        },
        style: {
          width: "1.5rem",
          height: "1.5rem",
          display: "inline-block",
        },
        content: iconData.body,
      },
    });

    registeredCount++;
  });

  console.log(`✅ ${registeredCount} Heroicons registered successfully!`);
};
