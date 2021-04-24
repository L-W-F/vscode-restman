import { Disposable, TextDocument, workspace } from 'vscode';
import { Schema } from 'json-schema-faker';
import { isMatch } from 'micromatch';
import { debug } from '../utils/debug';
import { getKey } from '../utils/getKey';
import { getResSchema } from '../utils/getResSchema';
import { jsf } from '../utils/jsf';
import { tmpl } from '../utils/tmpl';
import { envStore } from './envStore';

let store: Record<string, string | Schema> = Object.create(null);
let disposable: Disposable;

export const mockStore = {
  get: (key: string) => {
    for (const i in store) {
      if (store[i] && isMatch(key, i)) {
        if (typeof store[i] === 'string') {
          return store[i] as string;
        }

        return JSON.stringify(jsf(store[i] as Schema));
      }
    }
  },
  updateOne: async (document: TextDocument) => {
    const segments = document.getText().split('\n---\n');

    const env = envStore.get();

    segments.forEach((segment) => {
      const [method, uri] = getKey(segment);

      if (method && uri) {
        const resSchema = getResSchema(segment);

        if (resSchema) {
          // replace variable placeholders to wildcards
          Object.assign(store, {
            [`[${method}] ${tmpl(uri, env).replace(/{{[\w._]+}}/g, '*')}`]: JSON.parse(tmpl(resSchema, env)),
          });

          debug('mockStore', `update mock >>>[${method}] ${uri}<<<`);
        }
      }
    });
  },
  update: async () => {
    // clean store first
    store = Object.create(null);

    const files = await workspace.findFiles('**/*.rest', '**​/node_modules/**');

    const buffers = await Promise.all(files.map((uri) => workspace.fs.readFile(uri)));
    const segments = buffers.reduce((a, buffer) => a.concat(buffer.toString().split('\n---\n')), [] as string[]);

    const env = envStore.get();

    segments.forEach((segment) => {
      const [method, uri] = getKey(segment);

      if (method && uri) {
        const resSchema = getResSchema(segment);

        if (resSchema) {
          Object.assign(store, {
            // replace variable placeholders to wildcards
            [`[${method}] ${tmpl(uri, env).replace(/{{[\w._]+}}/g, '*')}`]: JSON.parse(tmpl(resSchema, env)),
          });

          debug('mockStore', `create mock >>>[${method}] ${uri}<<<`);
        }
      }
    });
  },
  initialize: async () => {
    mockStore.dispose();
    await mockStore.update();

    disposable = workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId === 'rest') {
        mockStore.updateOne(e.document);
      }
    });

    return disposable;
  },
  dispose: () => {
    disposable?.dispose();
  },
};
