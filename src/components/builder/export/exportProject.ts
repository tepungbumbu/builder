import { Editor } from "grapesjs";

export const exportProject = (editor: Editor) => {
  const html = editor.getHtml();
  const css = editor.getCss();
  
  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Project</title>
    <style>${css}</style>
</head>
<body>
    ${html}
</body>
</html>
  `;

  const blob = new Blob([fullHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "project.html";
  a.click();
  URL.revokeObjectURL(url);
};
