import chalk from 'chalk';

export const logger = {
  log: (msg: string) => console.log(`${flag.log()} ${chalk.blue(msg)}`),
  success: (msg: string) => console.log(`${flag.success()} ${chalk.green(msg)}`),
  error: (msg: string) => console.log(`${flag.error()} ${chalk.red(msg)}`)
};

const flag = {
  error: () => chalk.white.bgRed(` \u2715 `),
  success: () => chalk.white.bgGreen(` \u2713 `),
  log: () => chalk.blue(` \u2026 `)
};
