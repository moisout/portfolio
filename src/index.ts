import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { buildHtml } from './builder';

const contentPath = 'content';
const configFileName = 'config.json';
const configFilePath = path.join(contentPath, configFileName);

logger.log('Checking for content...');

if (!fs.existsSync(contentPath)) {
  logger.error(`Content folder "${contentPath}" does not exist`);
  process.exit(1);
}

if (!fs.existsSync(configFilePath)) {
  logger.error(`Config file "${configFileName}" does not exist`);
  process.exit(1);
}

buildHtml(configFilePath);
