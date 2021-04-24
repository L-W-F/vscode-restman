import { commands, TextDocument, window } from 'vscode';
import { envStore } from '../stores/envStore';
import { debug } from '../utils/debug';
import { jsf } from '../utils/jsf';
import { tmpl } from '../utils/tmpl';
import { mpt } from '../utils/mpt';
import { clipboard } from '../utils/clipboard';

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
          .then(([{ path }]: any) => path)
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

export const registerFakerCommand = () =>
  commands.registerCommand('restman.faker', async (json, document: TextDocument, line: number) => {
    try {
      const env = envStore.get();

      debug('env', env);

      json = tmpl(json, env);

      const variables = await inquire(json);

      json = tmpl(json, variables);

      json = jsf(json);
      json = mpt(json, variables);

      await clipboard.set(json);

      window.showInformationMessage('fake data is wrote into the clipboard.');

      debug('faker', 'fake data is wrote into the clipboard');
    } catch (error) {
      debug('faker', error.message);
    }
  });
