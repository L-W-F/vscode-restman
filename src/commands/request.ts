import { commands, window } from 'vscode';
import { cookieStore } from '../stores/cookieStore';
import { envStore } from '../stores/envStore';
import { createEditor } from '../utils/createEditor';
import { debug } from '../utils/debug';
import { io, Method, RequestConfig } from '../utils/io';
import { tmpl } from '../utils/tmpl';

export const registerRequestCommand = () =>
  commands.registerCommand('restman.request', async () => {
    try {
      const method = (await window.showQuickPick([
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'HEAD',
        'OPTIONS',
        'CONNECT',
        'TRACE',
      ])) as Method;

      let url = (await window.showInputBox({
        placeHolder: '/api/whoami',
      })) as string;

      if (!method || !url) {
        window.showWarningMessage('The `method` and `url` are required');
      }

      const env = envStore.get();

      debug('env', env);

      url = tmpl(url, env);

      const baseURL = env.ORIGIN ?? 'http://localhost:3000';

      const options: RequestConfig = {
        method,
        url,
        baseURL,
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

      const { editor, selection, save } = await createEditor(options);

      debug('request', '<options>', options);

      await io(options)
        .then(async ({ status, headers, data }) => {
          // save cookies
          cookieStore.set(fullURL, headers['set-cookie']);

          await editor.edit((builder) => {
            builder.replace(selection, `\n\`\`\`json\n${JSON.stringify({ status, headers, data }, null, 2)}\n\`\`\`\n`);
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
      debug('request', error.message);
    }
  });
