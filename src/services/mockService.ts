import { createServer } from 'http';
import { Disposable, window } from 'vscode';
import Formidable from 'formidable';
import { envStore } from '../stores/envStore';
import { mockStore } from '../stores/mockStore';
import { debug } from '../utils/debug';
import { varStore } from '../stores/varStore';
import { tmpl } from '../utils/tmpl';
import { isEmpty } from 'lodash';

let disposable: Disposable;

export const mockService = {
  initialize: () => {
    const server = createServer((req, res) => {
      const key = `[${req.method?.toUpperCase() ?? 'GET'}] ${req.url ?? '/'}`;

      debug('mockService', '<key>', key);

      let mock = mockStore.get(key);

      if (!mock) {
        res.writeHead(404);
        res.end(null);

        return;
      }

      try {
        const form = new Formidable({ multiples: true });

        form.parse(req, (err: any, fields, files) => {
          if (err) {
            debug('mockService', err.message);

            res.writeHead(500);
            res.end();

            return;
          }

          const variables = varStore.get(key);

          if (!isEmpty(files)) {
            debug('mockService', '<files>', files);
          }

          if (!isEmpty(fields)) {
            debug('mockService', '<fields>', fields);
          }

          if (variables) {
            mock = tmpl(mock!, variables);
          }

          const { status = 200, headers = Object.create(null), data = null } = JSON.parse(mock!);

          res.writeHead(status, { 'Content-Type': 'application/json', ...headers });

          res.end(data && typeof data === 'object' ? JSON.stringify(data) : data);
        });
      } catch (error) {
        debug('mockService', error.message);
      }
    });

    const { ORIGIN = 'http://localhost:3000' } = envStore.get();

    const [, hostname, port = '80'] = ORIGIN.match(/https?:\/\/(\w+)(?::(\d+))?/)!;

    server.listen(+port, hostname, () => {
      debug('mockService', `Server running at ${hostname}:${port}.`);
    });

    server.on('error', (err) => {
      debug('mockService', err.message);
      window.showErrorMessage(err.message);
    });

    server.on('close', () => {
      debug('mockService', 'Server closed!');
    });

    disposable = {
      dispose: () => server.close(),
    };

    return disposable;
  },
  dispose: () => {
    disposable?.dispose();
  },
};
