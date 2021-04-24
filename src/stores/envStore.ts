import { Disposable, window, workspace } from 'vscode';
import * as dotenv from 'dotenv';
import { debug } from '../utils/debug';
import { getConfig } from '../utils/getConfig';

let store: Record<string, string> = Object.create(null);
let disposable: Disposable;

export const envStore = {
  get: () => store,
  update: async () => {
    // clean store first
    store = Object.create(null);

    const files = await workspace.findFiles(getConfig('dotenvFiles'), '**​/node_modules/**').then((value) =>
      value.sort((a, b) => {
        if (/\.env$/.test(a.path)) {
          return -1;
        }

        if (/\.env$/.test(b.path)) {
          return 1;
        }

        if (/\.env\.local$/.test(a.path)) {
          return -1;
        }

        if (/\.env\.local$/.test(b.path)) {
          return 1;
        }

        return 0;
      }),
    );

    if (!files.length) {
      window.showWarningMessage('There is no dotenv files in workspace!');
    }

    debug(
      'envStore',
      files.map(({ path }) => workspace.asRelativePath(path)),
    );

    const buffers = await Promise.all(files.map((uri) => workspace.fs.readFile(uri)));

    const data = buffers.reduce(
      (o, buffer) => Object.assign(store, dotenv.parse(buffer as Buffer)),
      Object.create(null),
    );

    debug('envStore', data);

    if (!data.ORIGIN) {
      window.showWarningMessage(
        'There is no `ORIGIN` variables in dotenv files, use `http://localhost:3000` as default',
      );
    }
  },
  initialize: async () => {
    envStore.dispose();
    await envStore.update();

    disposable = workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId === 'dotenv') {
        // 批量更新以确保按优先级合并变量
        envStore.update();
      }
    });

    return disposable;
  },
  dispose: () => {
    disposable?.dispose();
  },
};
