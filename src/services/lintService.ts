import {
  DiagnosticRelatedInformation,
  DiagnosticSeverity,
  Disposable,
  languages,
  Location,
  Position,
  Range,
  window,
  workspace,
} from 'vscode';

let disposable: Disposable;

export const lintService = {
  initialize: () => {
    const collection = languages.createDiagnosticCollection('RESTMAN');

    disposable = workspace.onDidChangeTextDocument(({ document }) => {
      if (document === window.activeTextEditor?.document && document.languageId === 'rest') {
        const regex = /```json (?:req|res)[\n\r]+([\s\S]+?)[\n\r]+```/g;
        const docText = document.getText();

        let matches;

        const errors = [];

        while ((matches = regex.exec(docText)) !== null) {
          const [, json] = matches;
          const { line } = document.positionAt(matches.index);

          if (json) {
            try {
              JSON.parse(json);
            } catch (error) {
              const range = new Range(new Position(line, 0), new Position(line + 1, 0));

              errors.push({
                code: '',
                message: error.message,
                range,
                severity: DiagnosticSeverity.Error,
                source: '',
                relatedInformation: [
                  new DiagnosticRelatedInformation(new Location(document.uri, range), error.message),
                ],
              });
            }
          }
        }

        collection.set(document.uri, errors);
      }
    });

    return disposable;
  },
  dispose: () => {
    disposable?.dispose();
  },
};
