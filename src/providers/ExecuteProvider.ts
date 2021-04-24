import { CancellationToken, CodeLens, CodeLensProvider, Position, TextDocument } from 'vscode';

export class ExecuteProvider implements CodeLensProvider {
  private regex: RegExp;

  constructor() {
    this.regex = /(?:#+\s)?\[(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)\]\s([^\n\r]+)/g;
  }

  public provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
    const codeLenses = [];

    const regex = new RegExp(this.regex);
    const docText = document.getText();

    let matches;

    while ((matches = regex.exec(docText)) !== null) {
      const [, method, uri] = matches;
      const { line } = document.positionAt(matches.index);
      const position = new Position(line, 0);
      const range = document.getWordRangeAtPosition(position, this.regex);

      if (range) {
        codeLenses.push(
          new CodeLens(range, {
            title: '$(rocket) Execute',
            command: 'restman.execute',
            arguments: [method, uri, document, line],
          }),
        );
      }
    }

    return Promise.resolve(codeLenses);
  }
}
