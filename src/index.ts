import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { buildHtml } from './builder';
import yargs from 'yargs';
import chokidar from 'chokidar';
import { performance } from 'perf_hooks';

const contentPath = 'content';
const configFileName = 'config.json';
const configFilePath = path.join(contentPath, configFileName);

const rebuild = async () => {
  const time0 = performance.now();
  logger.log('Checking for content...');

  if (!fs.existsSync(contentPath)) {
    logger.error(`Content folder "${contentPath}" does not exist`);
    process.exit(1);
  }

  if (!fs.existsSync(configFilePath)) {
    logger.error(`Config file "${configFileName}" does not exist`);
    process.exit(1);
  }
  await buildHtml(configFilePath);
  logger.success(`Built in ${Math.ceil(performance.now() - time0)}ms`);
};

rebuild();

const argv = yargs.options({
  watch: {
    alias: 'w',
    description: 'Watch for file changes',
    type: 'boolean'
  }
}).argv;

if (argv.watch) {
  const watcher = chokidar.watch(['content', 'style', 'template'], {
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('add', rebuild);
  watcher.on('change', rebuild);
  watcher.on('unlink', rebuild);
}
