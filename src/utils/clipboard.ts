import { env } from 'vscode';
import { debug } from './debug';

export const clipboard = {
  get: () => env.clipboard.readText(),
  set: async (v: any) => {
    if (typeof v === 'string') {
      await env.clipboard.writeText(v);
    } else {
      try {
        await env.clipboard.writeText(JSON.stringify(v, null, 2));
      } catch (error) {
        debug('clipboard', error.message);
      }
    }
  },
};
