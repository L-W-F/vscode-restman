import { CancellationToken, Hover, HoverProvider, Position, TextDocument } from 'vscode';
import { envStore } from '../stores/envStore';
import { tmpl } from '../utils/tmpl';

export class EnvHoverProvider implements HoverProvider {
  private regex: RegExp;

  constructor() {
    this.regex = /\{\{[.\w]+\}\}/g;
  }

  public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {
    const range = document.getWordRangeAtPosition(position, this.regex);

    if (range) {
      const env = envStore.get();

      return new Hover(tmpl(document.getText(range), env), range);
    }

    return Promise.reject();
  }
}
