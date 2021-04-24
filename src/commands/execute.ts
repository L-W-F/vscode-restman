import { commands, Position, Range, TextDocument, window } from 'vscode';
import { cookieStore } from '../stores/cookieStore';
import { envStore } from '../stores/envStore';
import { varStore } from '../stores/varStore';
import { ajv } from '../utils/ajv';
import { createEditor } from '../utils/createEditor';
import { debug } from '../utils/debug';
import { getReqSchema } from '../utils/getReqSchema';
import { getResSchema } from '../utils/getResSchema';
import { io, Method, RequestConfig } from '../utils/io';
import { jsf } from '../utils/jsf';
import { tmpl } from '../utils/tmpl';
import { mpt } from '../utils/mpt';
import FormData from 'form-data';

const inquire = async (segment: string): Promise<Record<string, string>> => {
  const regex = /{{(@?[\w._]+)}}/g;
  const obj = Object.create(null);

  let matches;

  while ((matches = regex.exec(segment)) !== null) {
    const [, key] = matches;

    const val = (await (key.charAt(0) === '@'
      ? window
          .showOpenDialog({
            canSelectMany: false,
          })
          .then((files: any) => files?.[0].path)
      : window.showInputBox({
          placeHolder: key,
        }))) as string;

    if (typeof val === 'undefined') {
      throw new Error('task canceled!');
    }

    obj[key] = val;
  }

  return obj;
};

const mask = (obj: any): any => {
  if (typeof obj === 'string' && obj.indexOf('multipart/form-data; boundary=') === 0) {
    return 'multipart/form-data; boundary=<boundary>';
  }

  if (obj instanceof FormData) {
    return '<multipart>';
  }

  if (obj instanceof Buffer) {
    return '<buffer>';
  }

  if (obj && typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (_o, [_k, _v]) => ({
        ..._o,
        [_k]: mask(_v),
      }),
      Object.create(null),
    );
  }

  return obj;
};

export const registerExecuteCommand = () =>
  commands.registerCommand(
    'restman.execute',
    async (method: Method = 'GET', url = '/', document: TextDocument, line: number) => {
      try {
        const env = envStore.get();

        debug('env', env);

        url = tmpl(url, env);

        const variables = await inquire(url);

        url = tmpl(url, variables);

        const text = document.getText(new Range(new Position(line + 1, 0), new Position(document.lineCount, 0)));
        const sep = text.indexOf('\n---\n');
        const segment = sep === -1 ? text : text.slice(0, sep);

        let payload = null;

        const reqSchema = getReqSchema(segment);

        if (reqSchema) {
          payload = tmpl(reqSchema, env);
          Object.assign(variables, await inquire(payload));
          payload = tmpl(payload, variables);

          try {
            payload = jsf(payload);
            payload = mpt(payload, variables);
          } catch (error) {
            debug('execute', '<reqSchema>', error.message);
            payload = null;
          }
        }

        debug('var', variables);
        varStore.set(`[${method.toUpperCase()}] ${url}`, variables);

        const baseURL = env.ORIGIN ?? 'http://localhost:3000';

        const options: RequestConfig = {
          method,
          url,
          baseURL,
          ...payload,
        };

        if (!options.headers) {
          Object.assign(options, { headers: {} });
        }

        const fullURL = `${baseURL}${url}`;

        // set cookie headers
        const cookie = cookieStore.get(fullURL);

        if (cookie) {
          options.headers.cookie = cookie;
        }

        const masked = mask(options);

        const { editor, selection, save } = await createEditor(masked);

        debug('execute', '<options>', masked);

        await io(options)
          .then(async (response) => {
            const resSchema = getResSchema(segment);

            if (resSchema) {
              try {
                const errors = ajv(tmpl(resSchema, env), response);

                if (errors) {
                  debug('execute', '<validate>', errors);
                  window.showErrorMessage(JSON.stringify(errors, null, 2));
                }
              } catch (error) {
                debug('execute', '<validate>', error.message);
              }
            }

            const { status, headers, data } = response;

            // save cookies
            cookieStore.set(fullURL, headers['set-cookie']);

            await editor.edit((builder) => {
              builder.replace(
                selection,
                `\n\`\`\`json\n${JSON.stringify({ status, headers, data }, null, 2)}\n\`\`\`\n`,
              );
            });

            await save();
          })
          .catch(async (error: any) => {
            await editor.edit((builder) => {
              builder.replace(selection, `\n\`\`\`json\n${JSON.stringify(error, null, 2)}\n\`\`\`\n`);
            });

            await save();
          });
      } catch (error) {
        debug('execute', error.message);
      }
    },
  );
