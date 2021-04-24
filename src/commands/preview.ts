import { commands, Uri, window, workspace } from 'vscode';
import { debug } from '../utils/debug';
import { createPreviewEditor } from '../utils/createPreviewEditor';
import { rest2md } from '../utils/rest2md';

export const registerPreviewCommand = () =>
  commands.registerCommand('restman.preview', async (_uri?: Uri) => {
    let resource = _uri;

    if (!(resource instanceof Uri)) {
      if (window.activeTextEditor) {
        resource = window.activeTextEditor.document.uri;
      }
    }

    try {
      const markdown = rest2md(window.activeTextEditor!.document.getText());

      const { editor, selection, save } = await createPreviewEditor();

      await editor.edit((builder) => {
        builder.replace(selection, markdown);
      });

      await save();

      debug('preview', `markdown document generated >>>${workspace.asRelativePath(resource!.path)}`);
    } catch (error) {
      debug('preview', error.message);
    }
  });
