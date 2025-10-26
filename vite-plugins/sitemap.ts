import { promises as fs } from 'node:fs';
import path from 'node:path';
import { render as renderTemplate } from 'ejs';
import { minify as minifyTemplate } from 'html-minifier-terser';
import type { Plugin, ResolvedConfig } from 'vite';

export interface SitemapPluginOptions {
  readonly pages: string[];
  readonly baseUrl: string;
  readonly localesPath?: string;
  readonly templatePath?: string;
  readonly outputPath?: string;
}

export interface BuildSitemapData {
  readonly outputPath?: string;
  readonly baseUrl: string;
  readonly pages: readonly string[];
  readonly buildDate: Date;
  readonly t: (page: string, locale: string) => string;
}

const supportedLocales = ['en', 'it', 'es', 'pt'];
const [defaultLocale] = supportedLocales;

const readLocaleFiles = async (resolvedLocalesPath: string) => {
  const localeFiles = await fs.readdir(resolvedLocalesPath);
  const localesEntries = await Promise.all(
    localeFiles.map(async (file) => {
      const filePath = path.join(resolvedLocalesPath, file);
      const locale = path.basename(file, path.extname(file));
      const content = await import(filePath, { with: { type: 'json' } });
      return [locale, content.default];
    }),
  );
  return Object.fromEntries(localesEntries);
};

export const sitemap = ({
  pages,
  baseUrl,
  localesPath = 'src/locales/',
  templatePath = 'sitemap.ejs',
  outputPath = 'sitemap.xml',
}: SitemapPluginOptions): Plugin => {
  let config: ResolvedConfig;

  return {
    name: 'vite-plugin-sitemap',
    async configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async generateBundle() {
      const resolvedTemplatePath = path.join(config.root, templatePath);
      const resolvedLocalesPath = path.join(config.root, localesPath);
      const [template, localesData] = await Promise.all([
        fs.readFile(resolvedTemplatePath, 'utf8'),
        readLocaleFiles(resolvedLocalesPath),
      ]);

      const renderedTemplate = await renderTemplate(
        template,
        {
          pages,
          locales: supportedLocales,
          defaultLocale,
          baseUrl,
          buildDate: new Date(),
          t: (key: string, locale: string) => localesData[locale]?.[key] ?? key,
        },
        {
          filename: resolvedTemplatePath,
          client: false,
          async: true,
        },
      );

      const finalTemplate = await minifyTemplate(renderedTemplate, {
        collapseWhitespace: true,
        keepClosingSlash: true,
      });

      this.emitFile({
        type: 'asset',
        fileName: outputPath,
        originalFileName: templatePath,
        source: finalTemplate,
      });
    },
  };
};
