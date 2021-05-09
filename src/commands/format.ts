import { commands, Position, Selection, TextDocument, window } from 'vscode';
import prettier from 'prettier';
import { debug } from '../utils/debug';

export const registerFormatCommand = () =>
  commands.registerCommand('restman.format', async (json, document: TextDocument, line: number) => {
    try {
      const editor = window.activeTextEditor;

      if (editor?.document === document) {
        const lines = json.split('\n');
        const selection = new Selection(
          new Position(line + 1, 0),
          new Position(lines.length + line, lines.slice(-1).length),
        );

        editor.edit((editBuilder) => {
          editBuilder.replace(
            selection,
            prettier
              .format(json, {
                parser: 'json',
                quoteProps: 'consistent',
              })
              .trim(),
          );
        });
      }
    } catch (error) {
      debug('format', error.message);
    }
  });
