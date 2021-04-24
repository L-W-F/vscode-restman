import { commands, window, workspace } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { debug } from '../utils/debug';
import { rest2md } from '../utils/rest2md';

export const registerGenerateCommand = () =>
  commands.registerCommand('restman.generate', async () => {
    const files = await workspace.findFiles('**/*.rest', '**​/node_modules/**');

    const folder = path.join(
      workspace.workspaceFolders?.[0]?.uri.fsPath ?? './',
      '.restman',
      new Date().getTime().toString(32),
    );

    fs.mkdirSync(folder, { recursive: true });

    const segments = await Promise.all(
      files.map((uri) =>
        workspace.fs.readFile(uri).then((buffer) => {
          const relativePath = workspace.asRelativePath(uri);
          const pathname = path.join(folder, relativePath.replace(/\.rest$/, '.md'));
          const markdown = rest2md(buffer.toString());

          fs.mkdirSync(pathname.replace(/[/\\][\w_.]+\.md$/, ''), { recursive: true });

          try {
            fs.writeFileSync(pathname, markdown);
          } catch (error) {
            debug('generate', error.message);
          }

          return relativePath;
        }),
      ),
    );

    window.showInformationMessage(`api doc is saved to ${workspace.asRelativePath(folder)}.`);

    debug('generate', segments);
  });
