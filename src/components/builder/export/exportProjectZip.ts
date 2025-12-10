import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { Editor, Component, CssRule } from "grapesjs";
import type {
  PageData,
  ComponentData,
  ManifestData,
  ExportOptions,
} from "./exportTypes";

/**
 * Slugify string untuk nama file/folder
 */
const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**
 * Extract components dari editor
 * Mengidentifikasi komponen berdasarkan data-component attribute atau class
 */
const extractComponents = (editor: Editor): ComponentData[] => {
  const components: ComponentData[] = [];
  const wrapper = editor.getWrapper();

  if (!wrapper) return components;

  // Get all top-level components
  const topComponents = wrapper.components();

  topComponents.forEach((comp: Component) => {
    const compType = comp.get("type") || "section";
    const compName =
      comp.get("name") ||
      comp.getClasses().join("-") ||
      compType ||
      "component";

    // Get component HTML
    const html = comp.toHTML();

    // Get component-specific CSS
    const rules = editor.Css.getAll();
    let css = "";

    // Get classes used in this component
    const componentHtml = comp.toHTML();
    const classMatches = componentHtml.match(/class="([^"]*)"/g) || [];
    const usedClasses = new Set<string>();

    classMatches.forEach((match: string) => {
      const classes = match.replace(/class="|"/g, "").split(" ");
      classes.forEach((cls: string) => {
        if (cls) usedClasses.add(cls);
      });
    });

    // Filter CSS rules for this component
    rules.forEach((rule: CssRule) => {
      const selectors = rule.selectorsToString();
      let isRelevant = false;

      usedClasses.forEach((cls) => {
        if (selectors.includes(`.${cls}`)) {
          isRelevant = true;
        }
      });

      if (isRelevant) {
        css += `${selectors} { ${rule.getDeclaration()} }\n`;
      }
    });

    // Get component scripts (if any)
    const scripts = comp.get("script") || "";
    const js = typeof scripts === "string" ? scripts : "";

    components.push({
      name: compName,
      slug: slugify(compName),
      html,
      css,
      js,
    });
  });

  return components;
};

/**
 * Extract pages dari editor
 */
const extractPages = (editor: Editor): PageData[] => {
  const pages: PageData[] = [];
  const editorPages = editor.Pages.getAll();

  editorPages.forEach((page) => {
    const pageName = page.get("name") || "index";
    const mainComponent = page.getMainComponent();

    if (!mainComponent) return;

    // Select this page temporarily to get its content
    const currentPage = editor.Pages.getSelected();
    editor.Pages.select(page);

    const html = editor.getHtml() || "";
    const css = editor.getCss() || "";

    // Get scripts
    let js = "";
    const wrapper = editor.getWrapper();
    if (wrapper) {
      wrapper.components().forEach((comp: Component) => {
        const script = comp.get("script");
        if (script && typeof script === "string") {
          js += script + "\n";
        }
      });
    }

    pages.push({
      name: pageName,
      slug: slugify(pageName),
      html,
      css,
      js,
    });

    // Restore original page
    if (currentPage) {
      editor.Pages.select(currentPage);
    }
  });

  return pages;
};

/**
 * Generate full HTML page
 */
const generateHtmlPage = (
  page: PageData,
  useExternalAssets: boolean = true
): string => {
  const cssLink = useExternalAssets
    ? '<link rel="stylesheet" href="assets/style.css">'
    : `<style>${page.css}</style>`;

  const jsScript = useExternalAssets
    ? '<script src="assets/script.js"></script>'
    : page.js
    ? `<script>${page.js}</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.name}</title>
    ${cssLink}
</head>
<body>
    ${page.html}
    ${jsScript}
</body>
</html>`;
};

/**
 * Generate manifest.json
 */
const generateManifest = (
  projectName: string,
  pages: PageData[],
  components: ComponentData[]
): ManifestData => {
  return {
    name: projectName,
    version: "1.0.0",
    createdAt: new Date().toISOString(),
    pages: pages.map((p) => ({
      name: p.name,
      slug: p.slug,
      file: `${p.slug}.html`,
    })),
    components: components.map((c) => ({
      name: c.name,
      slug: c.slug,
      folder: `components/${c.slug}`,
      files: {
        html: `${c.slug}.html`,
        css: `${c.slug}.css`,
        js: `${c.slug}.js`,
      },
    })),
    assets: {
      css: "assets/style.css",
      js: "assets/script.js",
    },
  };
};

/**
 * Export project sebagai ZIP file
 */
export const exportProjectAsZip = async (
  editor: Editor,
  options: ExportOptions = {}
): Promise<void> => {
  const {
    projectName = "my-microsite",
    includeComponents = true,
  } = options;

  const zip = new JSZip();
  const projectFolder = zip.folder(projectName);

  if (!projectFolder) {
    throw new Error("Failed to create project folder in ZIP");
  }

  // Extract data
  const pages = extractPages(editor);
  const components = includeComponents ? extractComponents(editor) : [];

  // Combine all CSS dan JS
  let combinedCss = "";
  let combinedJs = "";

  pages.forEach((page) => {
    combinedCss += `/* Page: ${page.name} */\n${page.css}\n\n`;
    if (page.js) {
      combinedJs += `// Page: ${page.name}\n${page.js}\n\n`;
    }
  });

  components.forEach((comp) => {
    combinedCss += `/* Component: ${comp.name} */\n${comp.css}\n\n`;
    if (comp.js) {
      combinedJs += `// Component: ${comp.name}\n${comp.js}\n\n`;
    }
  });

  // Add HTML pages
  pages.forEach((page) => {
    const filename =
      page.slug === "home" || page.slug === "index"
        ? "index.html"
        : `${page.slug}.html`;
    projectFolder.file(filename, generateHtmlPage(page));
  });

  // Add assets folder
  const assetsFolder = projectFolder.folder("assets");
  if (assetsFolder) {
    assetsFolder.file("style.css", combinedCss);
    assetsFolder.file("script.js", combinedJs || "// No scripts");
  }

  // Add components folder
  if (includeComponents && components.length > 0) {
    const componentsFolder = projectFolder.folder("components");
    if (componentsFolder) {
      components.forEach((comp) => {
        const compFolder = componentsFolder.folder(comp.slug);
        if (compFolder) {
          compFolder.file(`${comp.slug}.html`, comp.html);
          compFolder.file(`${comp.slug}.css`, comp.css || "/* No styles */");
          compFolder.file(`${comp.slug}.js`, comp.js || "// No scripts");
        }
      });
    }
  }

  // Add manifest.json
  const manifest = generateManifest(projectName, pages, components);
  projectFolder.file("manifest.json", JSON.stringify(manifest, null, 2));

  // Generate ZIP and download
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${projectName}.zip`);
};

// Re-export simple HTML export untuk backward compatibility
export { exportProject } from "./exportProject";
