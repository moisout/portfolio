import { Config } from '../types/config';
import fs from 'fs';
import { logger } from './logger';
import mustache from 'mustache';
import path from 'path';
import sass from 'sass';
import { minify } from 'html-minifier';

const baseTemplatePath = 'template/base.html';
const baseStylePath = 'style/base.scss';

const outFolder = 'out';
const outputFile = 'index.html';
const outputFilePath = path.join(outFolder, outputFile);

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

  const templateData = {
    ...config,
    baseStyle: `<style>${baseStyle}</style>`
  };

  const rawHtml = mustache.render(baseTemplate, templateData);

  const html = minify(rawHtml, { collapseWhitespace: true, collapseInlineTagWhitespace: true });

  if (fs.existsSync(outFolder)) {
    fs.rmSync(outFolder, { recursive: true, force: true });
  }
  fs.mkdirSync(outFolder);

  fs.writeFileSync(outputFilePath, html);
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
