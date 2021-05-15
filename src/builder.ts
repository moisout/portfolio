import { Config } from '../types/config';
import fs from 'fs';
import { logger } from './logger';
import mustache from 'mustache';
import path from 'path';
import sass from 'sass';
import { minify } from 'html-minifier';
import marked from 'marked';

type PagesContent = { title: string; id: number; htmlContent: string; checked: boolean };

const baseTemplatePath = 'template/base.html';
const baseStylePath = 'style/base.scss';

const outFolder = 'out';
const outputFile = 'index.html';
const outputFilePath = path.join(outFolder, outputFile);

const contentPagePath = 'content/pages';

export const buildHtml = async (configFilePath: string) => {
  const config = getConfig(configFilePath);
  logger.log(`Building page "${config.title}"`);

  const baseTemplate = fs.readFileSync(baseTemplatePath, 'utf8');

  let baseStyle = '';

  try {
    baseStyle = await renderSCSS(baseStylePath);
  } catch (err) {
    console.log(err);
  }

  const pagesContent = generatePagesContent(config.pages);

  const templateData = {
    title: config.title,
    baseStyle: `<style>${baseStyle}</style>`,
    pages: pagesContent
  };

  const rawHtml = mustache.render(baseTemplate, templateData);

  const html = minify(rawHtml, { collapseWhitespace: true, collapseInlineTagWhitespace: true });

  if (fs.existsSync(outFolder)) {
    fs.rmSync(outFolder, { recursive: true, force: true });
  }
  fs.mkdirSync(outFolder);

  fs.writeFileSync(outputFilePath, html);
};

const generatePagesContent = (pages: Config['pages']): Array<PagesContent> => {
  const pagesArray: Array<PagesContent> = [];
  pages.forEach((page, i) => {
    const pagePath = path.join(contentPagePath, page.source);
    const fileEnding = page.source.match(/\.[0-9a-z]+$/i)?.[0];
    if (fileEnding && fs.existsSync(pagePath)) {
      const pageFileContent = fs.readFileSync(pagePath, 'utf8');
      if (fileEnding === '.md') {
        const renderedPage = marked(pageFileContent);
        pagesArray.push({
          title: page.name,
          id: i,
          checked: i === 0,
          htmlContent: renderedPage
        });
      } else if (fileEnding === '.html') {
        pagesArray.push({
          title: page.name,
          id: i,
          checked: i === 0,
          htmlContent: pageFileContent
        });
      } else {
        logger.error(`Unsupported file extension for page "${page.name}": "${page.source}"`);
      }
    } else {
      logger.error(`Unsupported source for page "${page.name}": "${page.source}"`);
    }
  });
  return pagesArray;
};

const renderSCSS = async (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) {
      sass.render({ file: path, outputStyle: 'compressed' }, (exception, result) => {
        if (exception) {
          reject(exception);
        } else if (result) {
          resolve(result.css.toString('utf8'));
        }
      });
    } else {
      reject(null);
    }
  });
};

const getConfig = (path: string): Config => {
  const rawData = fs.readFileSync(path, 'utf8');
  return JSON.parse(rawData);
};
