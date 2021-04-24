import { CancellationToken, CodeLens, CodeLensProvider, Position, Range, TextDocument } from 'vscode';

export class FormatProvider implements CodeLensProvider {
  private regex: RegExp;

  constructor() {
    this.regex = /```json (?:req|res)[\n\r]+([\s\S]+?)[\n\r]+```/g;
  }

  public provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
    const codeLenses = [];

    const regex = new RegExp(this.regex);
    const docText = document.getText();

    let matches;

    while ((matches = regex.exec(docText)) !== null) {
      const [, json] = matches;
      const { line } = document.positionAt(matches.index);

      if (json) {
        codeLenses.push(
          new CodeLens(new Range(new Position(line, 0), new Position(line + 1, 0)), {
            title: '$(jersey) Format',
            command: 'restman.format',
            arguments: [json, document, line],
          }),
        );
      }
    }

    return Promise.resolve(codeLenses);
  }
}
