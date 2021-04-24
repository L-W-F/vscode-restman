import { Position, Selection, TextDocument, TextEditor, ViewColumn, window, workspace } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const tmpDocs: Record<string, null | TextDocument> = Object.create(null);

workspace.onDidCloseTextDocument((e) => {
  for (const filename in tmpDocs) {
    if (Object.prototype.hasOwnProperty.call(tmpDocs, filename)) {
      const tmpDoc = tmpDocs[filename];

      if (e === tmpDoc) {
        tmpDocs[filename] = null;
      }
    }
  }
});

export const createPreviewEditor = async (
  filename = 'preview.md',
): Promise<{ editor: TextEditor; selection: Selection; save: () => Thenable<boolean> }> => {
  if (!tmpDocs[filename]) {
    const dir = path.join(workspace.workspaceFolders?.[0]?.uri.fsPath ?? './', '.restman');
    const file = path.join(dir, filename);

    fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '');
    }

    tmpDocs[filename] = await workspace.openTextDocument(file);
  }

  const tmpDoc = tmpDocs[filename];

  const editor: TextEditor = await window.showTextDocument(tmpDoc!, {
    viewColumn: ViewColumn.Beside,
    preserveFocus: true,
    preview: false,
  });

  await editor.edit((builder) => {
    builder.replace(new Selection(new Position(0, 0), new Position(tmpDoc!.lineCount, 0)), '...\n');
  });

  const selection = new Selection(new Position(0, 0), new Position(1, 0));

  tmpDoc!.save();

  return {
    editor,
    selection,
    save: tmpDoc!.save,
  };
};
