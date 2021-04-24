import { commands, Position, Selection, TextDocument, window } from 'vscode';
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
        // Get the word within the selection
        // const word = document.getText(selection);
        // const reversed = word.split('').reverse().join('');

        editor.edit((editBuilder) => {
          editBuilder.replace(selection, JSON.stringify(JSON.parse(json), null, 2));
        });
      }
    } catch (error) {
      debug('format', error.message);
    }
  });
