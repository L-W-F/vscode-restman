import { window } from 'vscode';
import { getConfig } from './getConfig';

const output = window.createOutputChannel('RESTMAN');

if (getConfig('mockServer')) {
  output.show(true);
}

export const debug = (key: string, ...args: any[]) => {
  output.appendLine(
    args.length
      ? `[${padding(key)}] -> ${args
          .map((arg) =>
            arg && typeof arg === 'object' ? JSON.stringify(arg) : typeof arg === 'function' ? arg() : arg,
          )
          .join('\t')}`
      : `[${padding(key)}]`,
  );
};

function padding(value: string) {
  return `${' '.repeat(Math.max(0, 12 - value.length))}${value}`;
}
