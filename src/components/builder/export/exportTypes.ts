/**
 * Types untuk export project ke ZIP
 */

export interface PageData {
  name: string;
  slug: string;
  html: string;
  css: string;
  js: string;
}

export interface ComponentData {
  name: string;
  slug: string;
  html: string;
  css: string;
  js: string;
}

export interface ManifestData {
  name: string;
  version: string;
  createdAt: string;
  pages: {
    name: string;
    slug: string;
    file: string;
  }[];
  components: {
    name: string;
    slug: string;
    folder: string;
    files: {
      html: string;
      css: string;
      js: string;
    };
  }[];
  assets: {
    css: string;
    js: string;
  };
}

export interface ExportOptions {
  projectName?: string;
  includeComponents?: boolean;
  minify?: boolean;
}
